import * as cheerio from 'cheerio'
import type { CoupangProduct } from './types'

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
]

export function normalizeCoupangUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('coupang.com')) return null
    const match = u.pathname.match(/\/vp\/products\/(\d+)/)
    if (!match) return null
    return `https://www.coupang.com/vp/products/${match[1]}`
  } catch {
    return null
  }
}

async function fetchWithRetry(url: string, retries = 2): Promise<string | null> {
  const apiKey = process.env.SCRAPER_API_KEY
  const fetchUrl = apiKey
    ? `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(url)}&country_code=kr`
    : url

  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  const headers: Record<string, string> = apiKey ? {} : {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
    'Referer': 'https://www.coupang.com/',
    'Cache-Control': 'no-cache',
  }

  console.log(`[coupang] apiKey=${apiKey ? 'set' : 'unset'} fetchUrl=${fetchUrl.slice(0, 80)}`)
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(fetchUrl, { headers, redirect: 'follow' })
      console.log(`[coupang] attempt=${attempt} status=${res.status}`)
      if (res.ok) return await res.text()
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * 2 ** attempt))
    } catch {
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * 2 ** attempt))
    }
  }
  return null
}

export async function scrapeCoupang(url: string): Promise<CoupangProduct | null> {
  const html = await fetchWithRetry(url)
  if (!html) return null

  const $ = cheerio.load(html)

  const name = $('h2.prod-buy-header__title').text().trim()
    || $('meta[property="og:title"]').attr('content')?.trim()
    || null

  const priceText = $('span.total-price strong').first().text().replace(/[^0-9]/g, '')
  const price = priceText ? parseInt(priceText, 10) : null

  const thumbnail = $('#repImage').attr('src')
    || $('meta[property="og:image"]').attr('content')
    || null

  if (!name || !price) return null

  return {
    name,
    price,
    thumbnail_url: thumbnail || '',
    original_url: url,
  }
}
