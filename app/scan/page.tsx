export const dynamic = 'force-dynamic'

import { UrlInput } from '@/components/UrlInput'
import { TrendingList } from '@/components/TrendingList'
import { supabase } from '@/lib/supabase'
import type { TrendingProduct } from '@/lib/types'

async function getTrending(): Promise<TrendingProduct[]> {
  const { data } = await supabase
    .from('analyses')
    .select('id, coupang_name, coupang_thumbnail_url, savings_percent, view_count')
    .order('view_count', { ascending: false })
    .limit(10)
  return data || []
}

export default async function ScanPage() {
  const trending = await getTrending()

  return (
    <main className="min-h-screen px-4 py-8 max-w-md mx-auto pb-24">
      <h1 className="text-xl font-extrabold text-slate-900 mb-6">
        알-쿠 스캐너
      </h1>
      <UrlInput />
      <TrendingList products={trending} />
    </main>
  )
}
