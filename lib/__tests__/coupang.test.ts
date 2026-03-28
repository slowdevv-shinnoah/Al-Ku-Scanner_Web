import { describe, it, expect, vi, beforeEach } from 'vitest'
import { normalizeCoupangUrl, scrapeCoupang } from '../coupang'

describe('normalizeCoupangUrl', () => {
  it('상품 ID를 추출해 정규화된 URL을 반환한다', () => {
    const url = 'https://www.coupang.com/vp/products/123456789?itemId=abc&vendorItemId=xyz'
    expect(normalizeCoupangUrl(url)).toBe('https://www.coupang.com/vp/products/123456789')
  })

  it('유효하지 않은 URL은 null을 반환한다', () => {
    expect(normalizeCoupangUrl('https://naver.com/product/123')).toBeNull()
  })

  it('상품 ID가 없는 쿠팡 URL은 null을 반환한다', () => {
    expect(normalizeCoupangUrl('https://www.coupang.com/np/search?q=test')).toBeNull()
  })
})

describe('scrapeCoupang', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('HTML에서 상품 정보를 파싱한다', async () => {
    const mockHtml = `
      <html><body>
        <h2 class="prod-buy-header__title">테스트 상품명</h2>
        <span class="total-price"><strong>39900</strong></span>
        <img id="repImage" src="https://example.com/thumb.jpg" />
      </body></html>
    `
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    } as Response)

    const result = await scrapeCoupang('https://www.coupang.com/vp/products/123')
    expect(result).not.toBeNull()
    expect(result?.name).toBe('테스트 상품명')
    expect(result?.price).toBe(39900)
  })

  it('fetch 실패 시 재시도 후 null을 반환한다', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const result = await scrapeCoupang('https://www.coupang.com/vp/products/123')
    expect(result).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(3) // 첫 시도 + 2회 재시도
  })
})
