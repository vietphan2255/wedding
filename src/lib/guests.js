// Guest-list helpers shared by the runtime lookup (InvitedGuestContext), the
// admin Guests section, and the one-off import script. Kept dependency-free so
// the same code runs in the browser and in Node (the import script).
//
// A guest record lives at `guests/<code>` in Firebase Realtime DB:
//   { name, invitationName, party: 'vuquy' | 'thanhhon' | 'both', order?, createdAt? }
// The record key is the invite code carried in the URL as `?invite=<code>`.

export const PARTIES = ['vuquy', 'thanhhon', 'both']

const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// Short, URL-safe, hard-to-guess invite code (base62). Uses the platform CSPRNG
// (browser `crypto` and Node's global `crypto` both expose getRandomValues);
// falls back to Math.random only if neither is present.
export function genInviteCode(len = 8) {
  const n = CODE_ALPHABET.length
  const out = new Array(len)
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(len)
    cryptoObj.getRandomValues(bytes)
    for (let i = 0; i < len; i += 1) out[i] = CODE_ALPHABET[bytes[i] % n]
  } else {
    for (let i = 0; i < len; i += 1) out[i] = CODE_ALPHABET[Math.floor(Math.random() * n)]
  }
  return out.join('')
}

// Generate a code not already present in `taken` (a Set or array of existing
// keys), so a bulk import never collides with itself or the live list.
export function genUniqueInviteCode(taken, len = 8) {
  const has = taken instanceof Set ? (c) => taken.has(c) : (c) => taken.includes(c)
  let code = genInviteCode(len)
  while (has(code)) code = genInviteCode(len)
  return code
}

function stripDiacritics(s) {
  // Đ/đ aren't decomposed by NFD, so map them explicitly first.
  return s
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

// Map a free-text party column ("Lễ Vu Quy", "thanh hon", "Cả hai", "both", …)
// to the stored enum. Unknown / empty → 'both' (the neutral, render-everything
// case), so a messy cell never hides an invitation.
export function normalizeParty(text) {
  const s = stripDiacritics(String(text || '').toLowerCase()).replace(/[^a-z]/g, '')
  if (!s) return 'both'
  if (s.includes('vuquy')) return 'vuquy'
  if (s.includes('thanhhon')) return 'thanhhon'
  if (
    s.includes('both') ||
    s.includes('cahai') ||
    s.includes('hai') ||
    s.includes('all')
  ) {
    return 'both'
  }
  return 'both'
}

// Split one delimited line into fields. Tab-delimited (what pasting from Google
// Sheets produces) needs no quote handling; comma-delimited (a CSV export) gets
// RFC-4180 quote handling so an invitation name with a comma survives.
function splitLine(line, delim) {
  if (delim === '\t') return line.split('\t')
  const out = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          field += '"'
          i += 1
        } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      out.push(field)
      field = ''
    } else field += c
  }
  out.push(field)
  return out
}

// Only drop a leading row when it's clearly a column header. Kept conservative
// on purpose: words like "mời"/"thiệp"/"tiệc" appear in real invitation names
// ("Kính mời cô Ba"), so matching those would silently drop a guest. We bias
// toward keeping data — a stray header row just makes one obvious row to delete.
function looksLikeHeader(cells) {
  const joined = stripDiacritics(cells.join(' ').toLowerCase())
  return /\b(name|ho ten|ten khach|ten thiep|invitation|invite|party|su kien)\b/.test(
    joined,
  )
}

// Parse pasted Sheet rows or a CSV export into guest objects. Columns are
// name | invitation name | party. Auto-detects tab vs comma, drops blank lines
// and a leading header row. invitationName falls back to name when absent.
export function parseGuestCsv(text) {
  const raw = String(text || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
  const nonEmpty = raw.filter((l) => l.trim() !== '')
  if (!nonEmpty.length) return []
  const delim = nonEmpty.some((l) => l.includes('\t')) ? '\t' : ','
  const rows = nonEmpty.map((l) => splitLine(l, delim).map((c) => c.trim()))
  if (rows.length && looksLikeHeader(rows[0])) rows.shift()
  return rows
    .map((cells) => {
      const name = cells[0] || ''
      const invitationName = cells[1] || cells[0] || ''
      const party = normalizeParty(cells[2])
      return { name, invitationName, party }
    })
    .filter((g) => g.invitationName)
}

// Full shareable link for a guest, e.g. https://site.com/?invite=a7Qk2Ztb
export function inviteLink(code) {
  const origin =
    typeof window !== 'undefined' && window.location ? window.location.origin : ''
  return `${origin}/?invite=${code}`
}
