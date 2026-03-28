/**
 * Rate Limiting Middleware
 *
 * SETUP REQUIRED:
 * 1. Upstash Console (https://console.upstash.com) 에서 Redis DB 생성
 * 2. .env.local에 다음 환경 변수 추가:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 *
 * 현재 설정: IP당 1분에 5회 요청 제한
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
})

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/analyze')) {
    return NextResponse.next()
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: '잠시 후 다시 시도해주세요' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/analyze',
}
