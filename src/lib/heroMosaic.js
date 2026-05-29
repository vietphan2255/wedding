import { useEffect, useState } from 'react'

// Aspect ratio (w / h) used before an image has reported its natural size, or
// when it fails to load. Portrait-ish so the fallback never looks broken.
export const DEFAULT_AR = 0.8

// Split a sequence into `parts` contiguous groups whose summed weights are as
// even as possible (classic min-max linear partition, solved with DP). Even
// weight sums => even row heights in the mosaic, since a justified row's height
// is inversely proportional to the sum of its images' aspect ratios.
export function balancedPartition(weights, parts) {
  const n = weights.length
  if (parts <= 1 || n === 0) return [[0, n]]
  if (parts >= n) return weights.map((_, i) => [i, i + 1])

  const prefix = [0]
  for (let i = 0; i < n; i++) prefix.push(prefix[i] + weights[i])
  const sum = (a, b) => prefix[b] - prefix[a] // weight of [a, b)

  // dp[k][i] = smallest achievable max-group-sum for the first i items in k groups
  const dp = Array.from({ length: parts + 1 }, () => new Array(n + 1).fill(Infinity))
  const cut = Array.from({ length: parts + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[1][i] = sum(0, i)
  for (let k = 2; k <= parts; k++) {
    for (let i = k; i <= n; i++) {
      for (let j = k - 1; j < i; j++) {
        const cost = Math.max(dp[k - 1][j], sum(j, i))
        if (cost < dp[k][i]) {
          dp[k][i] = cost
          cut[k][i] = j
        }
      }
    }
  }

  const groups = []
  let i = n
  for (let k = parts; k >= 1; k--) {
    const j = k === 1 ? 0 : cut[k][i]
    groups.unshift([j, i])
    i = j
  }
  return groups
}

// Lay images out in rows that each span the full width W, stacked to a total
// height of exactly H. Rows are balanced (similar heights — the justified-
// gallery look), and the row count is chosen to bring the natural stacked
// height closest to H. Each row then fills the width exactly by stretching;
// the row heights are scaled together (factor k ≈ 1) to fill H exactly, and
// the tiny resulting aspect drift is absorbed by the tile's object-cover — so
// the box is tiled edge to edge with no gaps and an imperceptible crop.
// Returns { x, y, w, h } per image (x along width, y along height).
function packRows(aspects, W, H, gap) {
  const n = aspects.length
  const heightsFor = (rows) =>
    rows.map(([s, e]) => {
      let arSum = 0
      for (let i = s; i < e; i++) arSum += aspects[i]
      const avail = W - gap * (e - s - 1)
      return avail > 0 && arSum > 0 ? avail / arSum : Infinity
    })

  let rows = null
  let rowH = null
  let sumH = 0
  let bestErr = Infinity
  for (let r = 1; r <= n; r++) {
    const cand = balancedPartition(aspects, r)
    const heights = heightsFor(cand)
    const cSum = heights.reduce((s, h) => s + h, 0)
    const total = cSum + gap * (cand.length - 1)
    if (!Number.isFinite(total)) continue
    const err = Math.abs(total - H)
    if (err < bestErr) {
      bestErr = err
      rows = cand
      rowH = heights
      sumH = cSum
    }
  }
  if (!rows) return null

  const k = sumH > 0 ? (H - gap * (rows.length - 1)) / sumH : 1
  const tiles = new Array(n)
  let y = 0
  rows.forEach(([s, e], r) => {
    const hNat = rowH[r]
    const hBox = hNat * k
    let x = 0
    for (let i = s; i < e; i++) {
      const w = aspects[i] * hNat
      tiles[i] = { x, y, w, h: hBox }
      x += w + gap
    }
    y += hBox + gap
  })
  return tiles
}

// Worst per-tile object-cover crop fraction for a layout (0 = no crop).
function maxCrop(tiles, aspects) {
  if (!tiles) return Infinity
  let worst = 0
  for (let i = 0; i < tiles.length; i++) {
    worst = Math.max(worst, Math.abs(1 - tiles[i].w / tiles[i].h / aspects[i]))
  }
  return worst
}

// Pack images of arbitrary aspect ratios into a W×H box, absolute-positioned,
// every image keeping its own aspect ratio, tiled edge to edge like blocks.
// A justified row layout subdivides — and so best fills — the axis it stacks
// along. We try both orientations (rows, and columns via the transpose) and
// keep whichever needs the smaller cover-crop to snap exactly to the box.
// Returns an array aligned to `aspects` of { x, y, w, h } in pixels, or null.
export function computeMosaic(aspects, W, H, gap = 0) {
  const n = aspects.length
  if (!W || !H || n === 0) return null

  const asRows = packRows(aspects, W, H, gap)
  // Columns: solve the transposed problem (axes swapped, aspects inverted),
  // then map coordinates back.
  const t = packRows(aspects.map((a) => 1 / a), H, W, gap)
  const asCols = t && t.map((b) => ({ x: b.y, y: b.x, w: b.h, h: b.w }))

  if (!asRows) return asCols
  if (!asCols) return asRows
  return maxCrop(asCols, aspects) < maxCrop(asRows, aspects) ? asCols : asRows
}

// Cache natural aspect ratios across components/renders so the hero and the
// admin preview never re-measure the same URL.
const arCache = new Map()

// Loads each src's natural aspect ratio, returning a { [src]: ar } map that
// fills in as images load. Cached and deduped; failed loads fall back to
// DEFAULT_AR so the layout always resolves.
export function useImageAspects(srcs) {
  const key = srcs.filter(Boolean).join('|')
  const [aspects, setAspects] = useState(() => {
    const init = {}
    for (const s of srcs) if (s && arCache.has(s)) init[s] = arCache.get(s)
    return init
  })

  useEffect(() => {
    let cancelled = false
    for (const src of srcs) {
      if (!src) continue
      if (arCache.has(src)) {
        setAspects((a) => (a[src] != null ? a : { ...a, [src]: arCache.get(src) }))
        continue
      }
      const img = new Image()
      img.onload = () => {
        const ar = img.naturalWidth / img.naturalHeight || DEFAULT_AR
        arCache.set(src, ar)
        if (!cancelled) setAspects((a) => ({ ...a, [src]: ar }))
      }
      img.onerror = () => {
        arCache.set(src, DEFAULT_AR)
        if (!cancelled) setAspects((a) => ({ ...a, [src]: DEFAULT_AR }))
      }
      img.src = src
    }
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return aspects
}
