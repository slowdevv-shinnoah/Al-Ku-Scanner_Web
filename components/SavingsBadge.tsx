import { Badge } from '@/components/ui/badge'

interface Props {
  savingsKrw: number
  savingsPercent: number
}

export function SavingsBadge({ savingsKrw, savingsPercent }: Props) {
  if (savingsKrw <= 0) return null

  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <Badge className="bg-green-500 text-white text-base px-4 py-2">
        {savingsPercent}% 절약
      </Badge>
      <p className="text-sm text-slate-500">
        알리에서 구매 시 약 {savingsKrw.toLocaleString()}원 절약
      </p>
    </div>
  )
}
