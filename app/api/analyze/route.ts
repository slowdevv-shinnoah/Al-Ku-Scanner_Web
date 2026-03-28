import { NextRequest, NextResponse } from 'next/server'
import { normalizeCoupangUrl, scrapeCoupang } from '@/lib/coupang'
import { searchAliProducts, generateAffiliateLink } from '@/lib/aliexpress'
import { findBestMatch } from '@/lib/matcher'
import { supabase } from '@/lib/supabase'
import { USD_TO_KRW } from '@/lib/aliexpress'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  let url: string
  try {
    const body = await req.json()
    url = body?.url
  } catch {
    return NextResponse.json({ error: '쿠팡 상품 URL을 입력해주세요' }, { status: 400 })
  }

  // 1. URL 정규화
  const normalizedUrl = normalizeCoupangUrl(url)
  if (!normalizedUrl) {
    return NextResponse.json({ error: '쿠팡 상품 URL을 입력해주세요' }, { status: 400 })
  }

  // 2. 캐시 확인 (24시간 TTL)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  // 24시간 이내 캐시 확인. 초과 시 upsert로 갱신됨 (8번 단계)
  const { data: cached } = await supabase
    .from('analyses')
    .select('*')
    .eq('coupang_url', normalizedUrl)
    .gte('updated_at', cutoff)
    .single()

  if (cached) {
    await supabase
      .from('analyses')
      .update({ view_count: cached.view_count + 1 })
      .eq('id', cached.id)

    return NextResponse.json(toResponse(cached))
  }

  // 3. 쿠팡 크롤링
  const coupang = await scrapeCoupang(normalizedUrl)
  if (!coupang) {
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요' }, { status: 503 })
  }

  // 4. 알리 상품 검색 + 매칭
  const aliCandidates = await searchAliProducts(coupang.name)
  const bestMatch = findBestMatch(coupang.name, aliCandidates)
  if (!bestMatch) {
    return NextResponse.json({ error: '일치하는 상품을 찾지 못했습니다' }, { status: 404 })
  }

  // 5. 어필리에이트 링크 생성
  const aliAffUrl = await generateAffiliateLink(bestMatch.product_url) || bestMatch.product_url
  const coupangAffUrl = `https://link.coupang.com/a/${process.env.COUPANG_AFFILIATE_ID}?url=${encodeURIComponent(normalizedUrl)}`

  // 6. KRW 환산
  const aliPriceKrw = Math.round(bestMatch.price_usd * USD_TO_KRW)
  const savingsKrw = coupang.price - aliPriceKrw
  const savingsPercent = Math.round((savingsKrw / coupang.price) * 100)

  // 7. 기존 view_count 보존: 캐시 갱신 시 카운터 유지 (신규는 DEFAULT 1)
  const { data: existing } = await supabase
    .from('analyses')
    .select('view_count')
    .eq('coupang_url', normalizedUrl)
    .single()

  const row = {
    coupang_url: normalizedUrl,
    coupang_name: coupang.name,
    coupang_price: coupang.price,
    coupang_thumbnail_url: coupang.thumbnail_url,
    ali_name: bestMatch.name,
    ali_price_usd: bestMatch.price_usd,
    ali_price_krw: aliPriceKrw,
    ali_thumbnail_url: bestMatch.thumbnail_url,
    ali_product_url: bestMatch.product_url,
    similarity_score: bestMatch.similarity_score,
    savings_percent: savingsPercent,
    coupang_aff_url: coupangAffUrl,
    ali_aff_url: aliAffUrl,
    view_count: existing?.view_count ? existing.view_count + 1 : 1,
    updated_at: new Date().toISOString(),
  }

  const { data: saved } = await supabase
    .from('analyses')
    .upsert(row, { onConflict: 'coupang_url' })
    .select()
    .single()

  return NextResponse.json(toResponse(saved || { ...row, id: 'temp', created_at: new Date().toISOString() }))
}

function toResponse(row: Record<string, unknown>) {
  return {
    id: row.id,
    coupang: {
      name: row.coupang_name,
      price: row.coupang_price,
      thumbnail_url: row.coupang_thumbnail_url,
      original_url: row.coupang_url,
    },
    ali: {
      name: row.ali_name,
      price_usd: row.ali_price_usd,
      price_krw: row.ali_price_krw,
      product_url: row.ali_product_url,
      thumbnail_url: row.ali_thumbnail_url,
      similarity_score: row.similarity_score,
    },
    coupang_affiliate_url: row.coupang_aff_url,
    ali_affiliate_url: row.ali_aff_url,
    savings_krw: (row.coupang_price as number) - (row.ali_price_krw as number),
    savings_percent: row.savings_percent,
    cached_at: row.updated_at,
  }
}
