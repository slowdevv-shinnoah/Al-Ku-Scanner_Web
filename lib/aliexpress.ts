import crypto from 'crypto'

const IOP_URL = 'https://api-sg.aliexpress.com/sync'
export const USD_TO_KRW = 1350

interface AliRawProduct {
  product_id: string
  product_title: string
  target_sale_price: string
  product_main_image_url: string
  product_detail_url: string
}

export interface AliSearchResult {
  product_id: string
  name: string
  price_usd: number
  price_krw: number
  product_url: string
  thumbnail_url: string
}

function signRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')
  return crypto.createHmac('sha256', secret).update(sorted).digest('hex').toUpperCase()
}

async function callIOP(method: string, params: Record<string, string>): Promise<unknown> {
  const appKey = process.env.ALI_APP_KEY!
  const appSecret = process.env.ALI_APP_SECRET!
  const timestamp = Date.now().toString()

  const allParams: Record<string, string> = {
    app_key: appKey,
    timestamp,
    sign_method: 'sha256',
    method,
    ...params,
  }
  allParams.sign = signRequest(allParams, appSecret)

  const query = new URLSearchParams(allParams).toString()
  const res = await fetch(`${IOP_URL}?${query}`)
  if (!res.ok) throw new Error(`IOP API error: ${res.status}`)
  return res.json()
}

export async function searchAliProducts(keyword: string): Promise<AliSearchResult[]> {
  try {
    const data = await callIOP('aliexpress.affiliate.product.query', {
      keywords: keyword,
      page_no: '1',
      page_size: '10',
      tracking_id: process.env.ALI_TRACKING_ID!,
    }) as Record<string, unknown>

    const products = (data as any)
      ?.aliexpress_affiliate_product_query_response
      ?.resp_result?.result?.products?.product as AliRawProduct[] | undefined

    if (!products) return []

    return products.map(p => ({
      product_id: p.product_id,
      name: p.product_title,
      price_usd: parseFloat(p.target_sale_price),
      price_krw: Math.round(parseFloat(p.target_sale_price) * USD_TO_KRW),
      product_url: p.product_detail_url,
      thumbnail_url: p.product_main_image_url,
    }))
  } catch {
    return []
  }
}

export async function generateAffiliateLink(productUrl: string): Promise<string | null> {
  try {
    const data = await callIOP('aliexpress.affiliate.link.generate', {
      promotion_link_type: '0',
      source_values: productUrl,
      tracking_id: process.env.ALI_TRACKING_ID!,
    }) as Record<string, unknown>

    const link = (data as any)
      ?.aliexpress_affiliate_link_generate_response
      ?.resp_result?.result?.promotion_links?.promotion_link?.[0]?.promotion_link

    return link || null
  } catch {
    return null
  }
}
