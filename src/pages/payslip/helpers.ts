import type { PaySlipRow } from './types'

// Small currency/number helpers shared between the live preview, PDF builder,
// and form orchestration.

export const toNum = (v: unknown): number => {
  const n = parseFloat(v as string)
  return Number.isFinite(n) ? n : 0
}

export const sum = (rows: PaySlipRow[] | undefined | null): number =>
  (rows || []).reduce((s, r) => s + toNum(r.amount), 0)

export const money = (n: number, currency: string | undefined): string =>
  `${currency || ''}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`
