import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('SUPABASE_KEY', 'test-key')

describe('supabase client', () => {
  it('환경 변수가 있으면 supabase 객체를 반환한다', async () => {
    const { supabase } = await import('../supabase')
    expect(supabase).toBeDefined()
  })

  it('환경 변수가 없으면 에러를 던진다', async () => {
    vi.resetModules()
    vi.unstubAllEnvs()
    const { getSupabase } = await import('../supabase')
    expect(() => getSupabase()).toThrow('SUPABASE_URL and SUPABASE_KEY must be set')
  })
})
