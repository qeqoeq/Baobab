export type NetworkAccessLevel = 1 | 2 | 3 | 4

export function getNetworkAccessLevel(score: number): NetworkAccessLevel {
  if (score >= 80) return 4
  if (score >= 60) return 3
  if (score >= 40) return 2
  return 1
}
