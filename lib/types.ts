export interface CoupangProduct {
  name: string
  price: number
  thumbnail_url: string
  original_url: string
}

export interface AliProduct {
  name: string
  price_usd: number
  price_krw: number
  product_url: string
  thumbnail_url: string
  similarity_score: number
}

export interface AnalysisResult {
  id: string
  coupang: CoupangProduct
  ali: AliProduct
  coupang_affiliate_url: string
  ali_affiliate_url: string
  savings_krw: number
  savings_percent: number
  cached_at: string
}

export interface TrendingProduct {
  id: string
  coupang_name: string
  coupang_thumbnail_url: string
  savings_percent: number
  view_count: number
}
