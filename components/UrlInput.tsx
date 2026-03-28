'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UrlInput() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    if (!url.includes('coupang.com')) {
      toast.error('쿠팡 상품 URL을 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '오류가 발생했습니다')
        return
      }

      router.push(`/result/${data.id}`)
    } catch {
      toast.error('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <Input
        type="url"
        placeholder="쿠팡 상품 URL을 붙여넣기 하세요"
        value={url}
        onChange={e => setUrl(e.target.value)}
        className="h-12 text-base"
        inputMode="url"
      />
      <Button type="submit" disabled={loading} className="h-12 text-base">
        {loading ? '분석 중...' : '최저가 찾기'}
      </Button>
    </form>
  )
}
