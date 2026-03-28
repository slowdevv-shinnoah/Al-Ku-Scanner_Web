# Al-Ku Scanner Web — 설계 문서

**날짜:** 2026-03-28
**작성자:** Claude Code (brainstorming)

---

## 배경 및 목적

쿠팡 상품 URL을 입력하면 알리익스프레스에서 동일 상품을 찾아 가격을 비교하고, 어필리에이트 링크를 제공하는 모바일 웹 서비스. Vercel에 단일 배포하며, 핸드폰 브라우저에서 원활하게 동작해야 한다.

---

## 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | Vercel 최적화, 서버 컴포넌트로 API 키 보호 |
| 언어 | TypeScript | 타입 안전성 |
| 스타일링 | Tailwind CSS + shadcn/ui | 모바일 친화적 컴포넌트 |
| 데이터베이스 | Supabase (PostgreSQL) | 결과 캐시 + 트렌딩 |
| Rate Limiting | Upstash Redis (Vercel KV) | Edge Middleware에서 IP 카운터 저장 |
| 배포 | Vercel | Next.js 공식 플랫폼 |
| 인증 | 없음 | 비로그인 즉시 사용 |

---

## 페이지 구성

### `/` — 랜딩페이지
- 서비스 소개, 주요 기능 설명, 절약 사례
- "지금 시작하기" → `/scan` 이동
- 어필리에이트 링크 공시 문구 (법적 의무)

### `/scan` — 메인 스캔 페이지
- 쿠팡 URL 입력창 (모바일 붙여넣기 최적화)
- "분석하기" 버튼 → 분석 중 인라인 로딩 스피너
- 하단에 인기 상품 목록 (GET /api/trending)

### `/result/[id]` — 결과 페이지 (서버 컴포넌트, SSR)
- Supabase에서 `id`로 결과 조회 (서버에서 직접 패칭)
- 쿠팡 상품 카드 (썸네일, 이름, 가격)
- 알리 상품 카드 (썸네일, 이름, 원화 환산 가격)
- 절약 금액 / 절약 퍼센트 배지
- "마지막 업데이트: N시간 전" (cached_at 기반)
- "쿠팡에서 구매" / "알리에서 구매" 버튼 (어필리에이트 링크, sticky footer)
- "다시 검색" → `/scan`

---

## API Routes

### `POST /api/analyze`

**처리 흐름:**
1. 쿠팡 URL에서 상품 ID 추출 → `https://www.coupang.com/vp/products/{id}` 형식으로 정규화
2. Supabase `analyses`에서 동일 URL + `updated_at` 24시간 이내 캐시 확인
   - 캐시 히트 → view_count +1 업데이트 후 즉시 반환
   - 캐시 오래됨 (24시간 초과) → 재크롤링 후 UPDATE
   - 캐시 없음 → 신규 크롤링
3. Cheerio + fetch로 쿠팡 상품 정보 크롤링
   - UA 로테이션 (실제 브라우저 UA 목록)
   - `Accept`, `Accept-Language`, `Referer` 등 브라우저 헤더 모방
   - 실패 시 최대 2회 지수 백오프 재시도
   - Vercel 함수 최대 실행 시간: 60초 (`maxDuration: 60` 설정)
4. AliExpress IOP API로 유사 상품 검색 + similarity_score 기반 최적 매칭
   - similarity_score: 상품명 키워드 토큰 겹침 비율로 산출
   - 0.5 미만 시 "일치하는 상품을 찾지 못했습니다" 반환
5. AliExpress `aliexpress.affiliate.link.generate` API로 알리 어필리에이트 링크 생성
6. 쿠팡 파트너스 링크 생성 — URL 포맷 조합 방식 (`https://link.coupang.com/...?subId={AFFILIATE_ID}`)
7. USD → KRW 환산 (고정 환율 `1 USD = 1,350 KRW`)
8. Supabase `analyses`에 저장 (신규: INSERT / 오래됨: UPDATE) + view_count 증가

**실패 처리:**
- 유효하지 않은 URL → 400 + "쿠팡 상품 URL을 입력해주세요"
- 크롤링 실패 / 타임아웃 → 503 + "잠시 후 다시 시도해주세요"
- 유사 상품 없음 → 404 + "일치하는 상품을 찾지 못했습니다"

```ts
// Request
{ url: string }

// Response
{
  id: string,
  coupang: { name, price, thumbnail_url, original_url },
  ali: { name, price_usd, price_krw, product_url, thumbnail_url, similarity_score },
  coupang_affiliate_url: string,
  ali_affiliate_url: string,
  savings_krw: number,
  savings_percent: number,
  cached_at: string   // ISO 날짜 — 결과 신선도 표시용
}
```

### `GET /api/trending`
- Supabase `analyses`에서 view_count 상위 10개 반환
- `Cache-Control: public, max-age=60` 헤더로 Vercel Edge Cache 60초 적용

```ts
// Response
{ products: Array<{ id, coupang_name, coupang_thumbnail_url, savings_percent, view_count }> }
```

---

## Rate Limiting

`middleware.ts` — Upstash Redis (Vercel KV)를 사용한 IP 기반 슬라이딩 윈도우 제한:
- `/api/analyze`: IP당 분당 5회
- 초과 시 429 + "잠시 후 다시 시도해주세요"

---

## Supabase 스키마

### `analyses` 테이블
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
coupang_url           text UNIQUE NOT NULL   -- 정규화된 URL (product_id 기준)
coupang_name          text
coupang_price         integer
coupang_thumbnail_url text
ali_name              text
ali_price_usd         numeric
ali_price_krw         integer
ali_thumbnail_url     text
ali_product_url       text                   -- 알리 원본 상품 URL (어필리에이트 아님)
similarity_score      numeric
savings_percent       numeric
coupang_aff_url       text
ali_aff_url           text
view_count            integer DEFAULT 1
created_at            timestamptz DEFAULT now()
updated_at            timestamptz DEFAULT now()   -- 캐시 신선도 기준 (24시간 TTL)
```

---

## 환경 변수 (.env.local) — 모두 서버 전용

```
# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# AliExpress IOP API
ALI_APP_KEY=
ALI_APP_SECRET=
ALI_TRACKING_ID=

# 쿠팡 파트너스
COUPANG_ACCESS_KEY=
COUPANG_SECRET_KEY=
COUPANG_AFFILIATE_ID=

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> `NEXT_PUBLIC_` 접두사 없음 — 전부 서버 컴포넌트 / API Route에서만 사용

---

## 모바일 UX 원칙

- 모든 터치 타겟 최소 44px
- URL 입력 시 키보드가 레이아웃 밀지 않도록 처리
- 결과 페이지: 스크롤 없이 핵심 정보(가격 비교, 구매 버튼) 확인 가능
- 구매 버튼: 하단 sticky footer 고정
- 에러 메시지: shadcn Toast로 표시

---

## 검증 방법

1. `npm run dev` 로컬 실행 → 모바일 Chrome DevTools (iPhone SE 기준) 레이아웃 확인
2. 실제 쿠팡 상품 URL 입력 → 분석 결과 정상 반환 확인
3. 동일 URL 재입력 → 캐시에서 빠르게 반환 확인
4. `/api/trending` 응답 및 썸네일 표시 확인
5. 잘못된 URL / 크롤링 실패 시 에러 토스트 정상 표시 확인
6. 분당 5회 초과 요청 시 429 반환 확인
7. Vercel Preview 배포 후 실제 핸드폰 브라우저에서 동작 확인
8. 어필리에이트 링크 클릭 시 정상 이동 확인
