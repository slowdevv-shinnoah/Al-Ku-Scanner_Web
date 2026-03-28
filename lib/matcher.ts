import type { AliSearchResult } from './aliexpress'

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w가-힣]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1)
  )
}

export function calcSimilarity(a: string, b: string): number {
  const setA = tokenize(a)
  const setB = tokenize(b)
  if (setA.size === 0 || setB.size === 0) return 0

  const intersection = new Set([...setA].filter(t => setB.has(t)))
  return intersection.size / Math.max(setA.size, setB.size)
}

export function findBestMatch(
  coupangName: string,
  candidates: AliSearchResult[],
  threshold = 0.5
): (AliSearchResult & { similarity_score: number }) | null {
  let best: (AliSearchResult & { similarity_score: number }) | null = null

  for (const candidate of candidates) {
    const score = calcSimilarity(coupangName, candidate.name)
    if (score >= threshold && (!best || score > best.similarity_score)) {
      best = { ...candidate, similarity_score: score }
    }
  }

  return best
}
