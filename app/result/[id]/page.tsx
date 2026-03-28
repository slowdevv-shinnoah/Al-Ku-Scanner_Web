import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/ProductCard'
import { SavingsBadge } from '@/components/SavingsBadge'
import { BuyButtons } from '@/components/BuyButtons'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params
  const { data } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const savingsKrw = data.coupang_price - data.ali_price_krw
  const cachedAt = new Date(data.updated_at)
  const hoursAgo = Math.floor((Date.now() - cachedAt.getTime()) / 3600000)
  const freshLabel = hoursAgo < 1 ? '방금 전' : `${hoursAgo}시간 전`

  return (
    <main className="min-h-screen px-4 py-8 max-w-md mx-auto pb-32">
      <Link href="/scan" className="text-sm text-blue-600 mb-6 block">← 다시 검색</Link>

      <SavingsBadge savingsKrw={savingsKrw} savingsPercent={data.savings_percent} />

      <div className="flex flex-col gap-3 mt-4">
        <ProductCard
          name={data.coupang_name}
          price={data.coupang_price}
          thumbnailUrl={data.coupang_thumbnail_url}
          platform="coupang"
        />
        <ProductCard
          name={data.ali_name}
          price={data.ali_price_krw}
          thumbnailUrl={data.ali_thumbnail_url}
          platform="ali"
        />
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">마지막 업데이트: {freshLabel}</p>

      <BuyButtons coupangUrl={data.coupang_aff_url} aliUrl={data.ali_aff_url} />
    </main>
  )
}
