interface Props {
  coupangUrl: string
  aliUrl: string
}

export function BuyButtons({ coupangUrl, aliUrl }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3">
      <a
        href={coupangUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center h-12 rounded-xl bg-orange-500 text-white font-bold text-sm"
      >
        쿠팡에서 구매
      </a>
      <a
        href={aliUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center h-12 rounded-xl bg-red-500 text-white font-bold text-sm"
      >
        알리에서 구매
      </a>
    </div>
  )
}
