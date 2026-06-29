# Viet & Nguyen — Wedding Website

A modern, bilingual (EN / VI) wedding site for **Viet & Nguyen** with three switchable
themes, parallax scrolling, live countdown, RSVP form, and a real-time guestbook —
all wired to **Firebase Realtime Database** and ready to deploy on **Vercel**.

## Dates

- **Lễ Vu Quy** — Sunday, 26 July 2026 (bride's family ceremony)
- **Lễ Thành Hôn** — Sunday, 02 August 2026 (wedding ceremony)
- **Lễ Đính Hôn** — already celebrated October 2025

## Tech stack

| Concern | Choice |
|---|---|
| Build | Vite 5 |
| UI | React 18 |
| Styling | Tailwind CSS 3 + CSS variables (theme tokens) |
| Animation | Framer Motion 11 |
| Smooth scroll | Lenis |
| Forms | React Hook Form |
| Icons | lucide-react |
| Backend | Firebase Realtime Database |
| Host | Vercel |

## Features

- **Three themes** (Blush · Noir · Modern) with a runtime switcher in the navbar
- **EN / VI** language toggle, persisted to `localStorage`
- **Lenis smooth scroll** + Framer-Motion-driven parallax on hero, story, engagement, gallery, and events
- **Live countdown** that auto-picks the next upcoming ceremony
- **Storytelling timeline** with alternating photos and parallax frames
- **Engagement recap** section dedicated to the already-completed Lễ Đính Hôn
- **Masonry gallery** with keyboard-navigable lightbox
- **Two-event card** layout with one-click `.ics` calendar download
- **RSVP form** → writes to `rsvps/` in Firebase Realtime Database
- **Guestbook / Wishes** → live reads from `wishes/`, new entries appear instantly across tabs
- Fully responsive (mobile-first), accessible focus styles, respects `prefers-reduced-motion`

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in Firebase keys
npm run dev                  # http://localhost:5173
```

> Without the `VITE_FIREBASE_*` env vars the site still renders — RSVP submissions log
> to the console and the guestbook shows demo wishes. Add the env vars to enable real
> persistence.

## Firebase Realtime Database — rules & admin auth

Security rules are version-controlled in [`database.rules.json`](database.rules.json) and
deployed (after `firebase login`) with:

```bash
npm run deploy:rules   # npx firebase-tools deploy --only database
```

Admin actions require a **real Firebase Auth session**, not a client-side password. Access:

| Node | Public read | Public write | Admin (signed-in admin UID) |
|---|---|---|---|
| `config` | ✅ (drives the site) | ❌ | read + write |
| `guests` | only `guests/$code` (invite lookup) | ❌ | read + write (whole list) |
| `rsvps` | ❌ | append-only (create new) | read + delete |
| `wishes` | ✅ (guestbook) | append-only (create new) | read + delete |

Writes are gated on a **specific allow-list** of admin UIDs
(`auth.uid === 'ADMIN_UID_1' || auth.uid === 'ADMIN_UID_2'`), not `auth != null`,
because anyone can self-register with the Email/Password provider. One-time setup:

1. **Firebase Console → Authentication** → enable **Email/Password** → create one or more admin users.
2. Copy each user's **UID** into `database.rules.json` (replace `ADMIN_UID_1` / `ADMIN_UID_2`; add more `|| auth.uid === '…'` clauses for additional admins).
3. `npm run deploy:rules`.

Per-field `.validate` rules bound the shape/length of every public submission, and a daily
off-site backup runs via [`.github/workflows/rtdb-backup.yml`](.github/workflows/rtdb-backup.yml)
(needs a `FIREBASE_TOKEN` repo secret — `firebase login:ci`).

**App Check** (reCAPTCHA v3) blocks scripted abuse / quota-exhaustion DoS and self-signup from
non-app clients: set `VITE_RECAPTCHA_SITE_KEY`, then enable enforcement on Realtime Database
(and Authentication) in the Firebase console.

## Deploy to Vercel

1. Push this repo to GitHub / GitLab.
2. In Vercel, **Add New Project** → import the repo. Framework preset = **Vite**.
3. Under **Environment Variables**, add the values from `.env.example`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` (admin uploads)
   - `VITE_RECAPTCHA_SITE_KEY` (App Check)

   All `VITE_*` vars ship in the public bundle — none are secrets. Scope them to
   **Production** and disable preview deploys so a branch preview can't expose a
   second writable client against the same backend.
4. Deploy. `vercel.json` adds security headers (CSP, `X-Frame-Options`, …) and
   rewrites every path to `/index.html` so the SPA never 404s; `dist/` is the output.

## Customizing

| Want to change | Where to edit |
|---|---|
| Couple names | `src/components/Hero.jsx`, `src/components/Footer.jsx` |
| Wedding dates | `src/components/Countdown.jsx`, `src/components/Events.jsx` |
| Theme palettes | `src/index.css` (`[data-theme="…"]` blocks) |
| EN / VI copy | `src/i18n/en.js` and `src/i18n/vi.js` |
| Story timeline | `src/components/Story.jsx` (item count) + `src/i18n/*.js` |
| Real photos | Replace `picsum.photos` URLs in `Gallery.jsx`, `Story.jsx`, `Engagement.jsx`, and the Unsplash URLs in `Hero.jsx`, `Events.jsx` |

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build → dist/
npm run preview   # serve the built bundle locally
```
