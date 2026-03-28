import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  name: string
  price: number
  thumbnailUrl: string | null | undefined
  platform: 'coupang' | 'ali'
}

export function ProductCard({ name, price, thumbnailUrl, platform }: Props) {
  const label = platform === 'coupang' ? '쿠팡' : '알리익스프레스'
  const color = platform === 'coupang' ? 'text-orange-500' : 'text-red-500'

  return (
    <Card className="w-full">
      <CardContent className="p-4 flex gap-4 items-start">
        {thumbnailUrl && (
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image src={thumbnailUrl} alt={name} fill className="object-cover rounded-md" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${color} mb-1`}>{label}</p>
          <p className="text-sm font-medium line-clamp-2 mb-2">{name}</p>
          <p className="text-lg font-bold">{price.toLocaleString()}원</p>
        </div>
      </CardContent>
    </Card>
  )
}
