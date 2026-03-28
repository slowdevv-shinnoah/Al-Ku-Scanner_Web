import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set')
  }

  _supabase = createClient(url, key)
  return _supabase
}

// 편의를 위해 Proxy 객체로 export — 접근 시점에 lazy 초기화
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  },
})
