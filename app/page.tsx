import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
          쿠팡 링크 하나로<br />
          <span className="text-blue-600">알리 최저가</span>를 즉시 탐색
        </h1>
        <p className="text-slate-500 mb-8 max-w-xs">
          평균 60% 이상 저렴한 알리익스프레스 동일 상품을 AI가 자동으로 찾아드립니다
        </p>
        <Link href="/scan">
          <Button size="lg" className="h-14 px-10 text-base">지금 시작하기</Button>
        </Link>
      </section>

      {/* Features */}
      <section className="px-6 pb-12 grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
        {[
          { icon: '🔍', title: 'AI 자동 매칭', desc: '상품명 분석으로 동일 상품 탐색' },
          { icon: '💰', title: '실시간 가격', desc: '알리 최신 가격 즉시 비교' },
          { icon: '🏆', title: '인기 순위', desc: '많이 비교된 상품 모아보기' },
          { icon: '🔗', title: '바로 구매', desc: '어필리에이트 링크로 즉시 이동' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-2xl p-4 border border-slate-100">
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="font-bold text-sm mb-1">{f.title}</p>
            <p className="text-xs text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pb-8 px-6">
        <p>이 서비스는 쿠팡 파트너스 및 알리익스프레스 어필리에이트 활동의 일환으로 수수료를 제공받을 수 있습니다.</p>
      </footer>
    </main>
  )
}
