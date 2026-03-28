import { describe, it, expect } from 'vitest'
import { calcSimilarity, findBestMatch } from '../matcher'
import type { AliSearchResult } from '../aliexpress'

describe('calcSimilarity', () => {
  it('동일한 문자열은 1.0을 반환한다', () => {
    expect(calcSimilarity('무선 이어폰', '무선 이어폰')).toBe(1)
  })

  it('겹치는 토큰이 없으면 0을 반환한다', () => {
    expect(calcSimilarity('무선 이어폰', '유선 마우스')).toBe(0)
  })

  it('일부 겹치면 0~1 사이를 반환한다', () => {
    const score = calcSimilarity('삼성 무선 이어폰', '무선 이어폰 블루투스')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })
})

describe('findBestMatch', () => {
  const candidates: AliSearchResult[] = [
    { product_id: '1', name: 'Wireless Earphones Bluetooth 5.0', price_usd: 9, price_krw: 12150, product_url: 'https://a.com/1', thumbnail_url: '' },
    { product_id: '2', name: 'USB Cable Type-C', price_usd: 2, price_krw: 2700, product_url: 'https://a.com/2', thumbnail_url: '' },
  ]

  it('가장 유사한 상품을 반환한다', () => {
    // 한-영 교차 매칭 대신 동일 언어 키워드를 사용
    const result = findBestMatch('Wireless Earphones Bluetooth 5.0', candidates)
    expect(result?.product_id).toBe('1')
  })

  it('임계값 0.5 미만이면 null을 반환한다', () => {
    const result = findBestMatch('Samsung Large Refrigerator', candidates)
    expect(result).toBeNull()
  })
})
