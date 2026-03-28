import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchAliProducts, generateAffiliateLink } from '../aliexpress'

vi.stubEnv('ALI_APP_KEY', 'test-app-key')
vi.stubEnv('ALI_APP_SECRET', 'test-secret')
vi.stubEnv('ALI_TRACKING_ID', 'test-tracking')

describe('searchAliProducts', () => {
  beforeEach(() => vi.resetAllMocks())

  it('API 응답에서 상품 목록을 파싱한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        aliexpress_affiliate_product_query_response: {
          resp_result: {
            result: {
              products: {
                product: [{
                  product_id: '1234567890',
                  product_title: '테스트 알리 상품',
                  target_sale_price: '9.99',
                  product_main_image_url: 'https://example.com/img.jpg',
                  product_detail_url: 'https://aliexpress.com/item/1234567890.html',
                }]
              }
            }
          }
        }
      }),
    } as Response)

    const results = await searchAliProducts('무선 이어폰')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('테스트 알리 상품')
  })

  it('API 오류 시 빈 배열을 반환한다', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API error'))
    const results = await searchAliProducts('테스트')
    expect(results).toEqual([])
  })
})

describe('generateAffiliateLink', () => {
  it('어필리에이트 링크를 생성한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        aliexpress_affiliate_link_generate_response: {
          resp_result: {
            result: {
              promotion_links: {
                promotion_link: [{
                  promotion_link: 'https://s.click.aliexpress.com/test'
                }]
              }
            }
          }
        }
      }),
    } as Response)

    const link = await generateAffiliateLink('https://aliexpress.com/item/123.html')
    expect(link).toBe('https://s.click.aliexpress.com/test')
  })
})
