import Image from 'next/image'
import Link from 'next/link'
import type { TrendingProduct } from '@/lib/types'

interface Props {
  products: TrendingProduct[]
}

export function TrendingList({ products }: Props) {
  if (products.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="text-base font-bold mb-3 text-slate-700">인기 비교 상품</h2>
      <ul className="flex flex-col gap-2">
        {products.map((p, i) => (
          <li key={p.id}>
            <Link
              href={`/result/${p.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 active:bg-slate-50 min-h-[44px]"
            >
              <span className="text-sm font-bold text-slate-400 w-5">{i + 1}</span>
              {p.coupang_thumbnail_url && (
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={p.coupang_thumbnail_url}
                    alt={p.coupang_name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
              <p className="flex-1 text-sm font-medium line-clamp-1">{p.coupang_name}</p>
              <span className="text-sm font-bold text-green-600 flex-shrink-0">
                {p.savings_percent}%↓
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
