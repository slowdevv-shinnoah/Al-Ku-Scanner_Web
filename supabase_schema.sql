CREATE TABLE IF NOT EXISTS analyses (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupang_url           text UNIQUE NOT NULL,
  coupang_name          text,
  coupang_price         integer,
  coupang_thumbnail_url text,
  ali_name              text,
  ali_price_usd         numeric,
  ali_price_krw         integer,
  ali_thumbnail_url     text,
  ali_product_url       text,
  similarity_score      numeric,
  savings_percent       numeric,
  coupang_aff_url       text,
  ali_aff_url           text,
  view_count            integer DEFAULT 1,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analyses_view_count_idx ON analyses (view_count DESC);
CREATE INDEX IF NOT EXISTS analyses_updated_at_idx ON analyses (updated_at DESC);

-- Supabase 스키마 적용 방법
-- Supabase 프로젝트 → SQL Editor → 이 파일 내용 붙여넣기 → Run
