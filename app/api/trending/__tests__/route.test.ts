import { describe, it, expect, vi } from 'vitest'
import { GET } from '../route'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({
      data: [{ id: '1', coupang_name: '테스트', coupang_thumbnail_url: '', savings_percent: 60, view_count: 100 }],
      error: null,
    }),
  },
}))

describe('GET /api/trending', () => {
  it('products 배열을 반환한다', async () => {
    const res = await GET()
    const data = await res.json()
    expect(data.products).toHaveLength(1)
    expect(data.products[0].coupang_name).toBe('테스트')
  })

  it('Cache-Control 헤더가 설정되어 있다', async () => {
    const res = await GET()
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60')
  })
})
