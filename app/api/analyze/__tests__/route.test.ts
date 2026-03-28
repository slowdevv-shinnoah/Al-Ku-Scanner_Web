import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/coupang', () => ({
  normalizeCoupangUrl: vi.fn(),
  scrapeCoupang: vi.fn(),
}))
vi.mock('@/lib/aliexpress', () => ({
  searchAliProducts: vi.fn(),
  generateAffiliateLink: vi.fn(),
}))
vi.mock('@/lib/matcher', () => ({
  findBestMatch: vi.fn(),
}))
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),   // 캐시 TTL 체이닝에 필요
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
  },
}))

import { normalizeCoupangUrl, scrapeCoupang } from '@/lib/coupang'
import { searchAliProducts, generateAffiliateLink } from '@/lib/aliexpress'
import { findBestMatch } from '@/lib/matcher'

describe('POST /api/analyze', () => {
  beforeEach(() => vi.clearAllMocks())

  it('유효하지 않은 URL은 400을 반환한다', async () => {
    vi.mocked(normalizeCoupangUrl).mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://naver.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('크롤링 실패 시 503을 반환한다', async () => {
    vi.mocked(normalizeCoupangUrl).mockReturnValue('https://www.coupang.com/vp/products/123')
    vi.mocked(scrapeCoupang).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.coupang.com/vp/products/123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(503)
  })

  it('유사 상품 없음 시 404를 반환한다', async () => {
    vi.mocked(normalizeCoupangUrl).mockReturnValue('https://www.coupang.com/vp/products/123')
    vi.mocked(scrapeCoupang).mockResolvedValue({ name: '테스트', price: 39900, thumbnail_url: '', original_url: 'https://www.coupang.com/vp/products/123' })
    vi.mocked(searchAliProducts).mockResolvedValue([])
    vi.mocked(findBestMatch).mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.coupang.com/vp/products/123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })
})
