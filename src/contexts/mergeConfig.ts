// Declarative merger for Firebase Realtime DB config snapshots → in-memory
// WeddingConfig. Each top-level slice has a kind that decides how it merges:
// - shallow: spread default + data
// - labels: decode `foo__bar` keys back to `foo.bar` for both en + vi
// - nested: spread default + data on each named child (e.g. venues.vuquy)
// - list: keyed Firebase node → array sorted by `order`, falling back to
//   default when the node is empty/missing
//
// Adding a new slice means editing one row in SLICE_DEFS and one entry in
// DEFAULT_CONFIG — no more six-layer hand-spread.

import {
  DEFAULT_CONFIG,
  DEFAULT_GIFTS,
  decodeLabelMap,
  sortByOrder,
  toArray,
} from './configDefaults'
import type { WeddingConfig, OrderedItem, Labels, Gifts } from './configTypes'

// Each variant's `default` is intentionally loose — the kind dispatches to a
// merge function that re-narrows. This keeps the table declarative without
// per-slice generic gymnastics.
type SliceDef =
  | { kind: 'shallow'; default: unknown }
  | { kind: 'labels'; default: Labels }
  | { kind: 'nested'; default: unknown; children: string[] }
  | { kind: 'gifts'; default: Gifts }
  | { kind: 'list'; default: OrderedItem[] }

const SLICE_DEFS: Record<keyof WeddingConfig, SliceDef> = {
  common:     { kind: 'shallow', default: DEFAULT_CONFIG.common },
  labels:     { kind: 'labels',  default: DEFAULT_CONFIG.labels },
  dates:      { kind: 'shallow', default: DEFAULT_CONFIG.dates },
  music:      { kind: 'shallow', default: DEFAULT_CONFIG.music },
  invitation: { kind: 'shallow', default: DEFAULT_CONFIG.invitation },
  venues:     { kind: 'nested',  default: DEFAULT_CONFIG.venues,  children: ['vuquy', 'thanhhon'] },
  gifts:      { kind: 'gifts',   default: DEFAULT_GIFTS },
  faqs:       { kind: 'list',    default: DEFAULT_CONFIG.faqs },
  story:      { kind: 'list',    default: DEFAULT_CONFIG.story },
  gallery:    { kind: 'list',    default: DEFAULT_CONFIG.gallery },
  effects:    { kind: 'shallow', default: DEFAULT_CONFIG.effects },
  qr:         { kind: 'shallow', default: DEFAULT_CONFIG.qr },
}

function mergeShallow(def: unknown, data: unknown) {
  const base = (def || {}) as Record<string, unknown>
  if (!data || typeof data !== 'object') return base
  return { ...base, ...(data as Record<string, unknown>) }
}

function mergeLabels(def: Labels, data: unknown): Labels {
  const d = (data || {}) as { en?: unknown; vi?: unknown }
  return {
    en: { ...def.en, ...decodeLabelMap(d.en) },
    vi: { ...def.vi, ...decodeLabelMap(d.vi) },
  }
}

function mergeNested(def: unknown, data: unknown, children: string[]) {
  const base = (def || {}) as Record<string, Record<string, unknown>>
  if (!data || typeof data !== 'object') return base
  const d = data as Record<string, Record<string, unknown> | undefined>
  const out: Record<string, Record<string, unknown>> = {}
  for (const child of children) {
    out[child] = { ...base[child], ...(d[child] || {}) }
  }
  return out
}

// Gifts has a top-level `enabled` flag plus nested bride/groom blocks.
function mergeGifts(def: Gifts, data: unknown): Gifts {
  const d = (data || {}) as Partial<Gifts>
  return {
    enabled: typeof d.enabled === 'boolean' ? d.enabled : def.enabled,
    bride: { ...def.bride, ...(d.bride || {}) },
    groom: { ...def.groom, ...(d.groom || {}) },
  }
}

function mergeList<T extends OrderedItem>(def: T[], data: unknown): T[] {
  if (!data || typeof data !== 'object') return def
  const keys = Object.keys(data as Record<string, unknown>)
  if (keys.length === 0) return def
  return sortByOrder(toArray(data as Record<string, T>) as T[])
}

function mergeSlice(def: SliceDef, data: unknown): unknown {
  switch (def.kind) {
    case 'shallow': return mergeShallow(def.default, data)
    case 'labels':  return mergeLabels(def.default, data)
    case 'nested':  return mergeNested(def.default, data, def.children)
    case 'gifts':   return mergeGifts(def.default, data)
    case 'list':    return mergeList(def.default, data)
  }
}

export default function mergeConfig(snapshot: unknown): WeddingConfig {
  if (!snapshot || typeof snapshot !== 'object') return DEFAULT_CONFIG
  const snap = snapshot as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, def] of Object.entries(SLICE_DEFS)) {
    out[key] = mergeSlice(def, snap[key])
  }
  return out as unknown as WeddingConfig
}
