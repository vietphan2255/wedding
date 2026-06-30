// Allowlist of email addresses permitted into the /admin area, sourced from the
// VITE_ADMIN_EMAILS env var (comma- or whitespace-separated, case-insensitive).
//
// IMPORTANT: this is a client-side convenience / early-rejection layer ONLY. It
// ships in the public bundle, so on its own it protects nothing. The real
// boundary is database.rules.json, which gates every RTDB read and write on the
// signed-in token's (verified) email against the SAME addresses. Whatever goes in
// VITE_ADMIN_EMAILS must be mirrored in the rules — keep the two lists in sync.

const RAW = import.meta.env.VITE_ADMIN_EMAILS ?? ''

export const ADMIN_EMAILS: ReadonlySet<string> = new Set(
  RAW.split(/[\s,]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
)

/** True when `email` is on the admin allowlist (case-insensitive). */
export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  return email != null && ADMIN_EMAILS.has(email.toLowerCase())
}
