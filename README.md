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

## Firebase Realtime Database — rules

Paste these into **Firebase Console → Realtime Database → Rules** so the public can
write RSVPs and wishes, but nothing else, and reads of the wishes are public while
RSVPs stay private:

```json
{
  "rules": {
    "rsvps": {
      ".read": false,
      "$id": {
        ".write": "!data.exists()",
        ".validate": "newData.hasChildren(['name', 'attending', 'createdAt'])",
        "name":       { ".validate": "newData.isString() && newData.val().length <= 80" },
        "email":      { ".validate": "newData.isString() && newData.val().length <= 120" },
        "phone":      { ".validate": "newData.isString() && newData.val().length <= 40" },
        "attending":  { ".validate": "newData.isString() && newData.val().matches(/^(yes|no)$/)" },
        "events":     { ".validate": "newData.isString() && newData.val().matches(/^(vuquy|thanhhon|both)$/)" },
        "guests":     { ".validate": "newData.isString() || newData.isNumber()" },
        "meal":       { ".validate": "newData.isString()" },
        "message":    { ".validate": "newData.isString() && newData.val().length <= 1000" },
        "createdAt":  { ".validate": "newData.val() != null" },
        "$other":     { ".validate": false }
      }
    },
    "wishes": {
      ".read": true,
      "$id": {
        ".write": "!data.exists()",
        ".validate": "newData.hasChildren(['name', 'message', 'createdAt'])",
        "name":      { ".validate": "newData.isString() && newData.val().length <= 60" },
        "message":   { ".validate": "newData.isString() && newData.val().length <= 400" },
        "createdAt": { ".validate": "newData.val() != null" },
        "$other":    { ".validate": false }
      }
    },
    "guests": {
      ".read": true,
      ".write": true,
      "$code": {
        ".validate": "newData.hasChildren(['invitationName', 'party'])",
        "name":           { ".validate": "newData.isString() && newData.val().length <= 120" },
        "invitationName": { ".validate": "newData.isString() && newData.val().length <= 160" },
        "party":          { ".validate": "newData.isString() && newData.val().matches(/^(vuquy|thanhhon|both)$/)" },
        "order":          { ".validate": "newData.isNumber()" },
        "createdAt":      { ".validate": "newData.val() != null" },
        "$other":         { ".validate": false }
      }
    }
  }
}
```

RSVPs are private (only the Firebase console / Admin SDK can read them) while
wishes are publicly readable so the guestbook can stream them live.

The **guests** node powers personalized `?invite=<code>` links — the public site
reads a single `guests/<code>` to print the guest's name and highlight their
ceremony, and the `/admin` → **Guests** screen reads/writes the whole list to
import and manage it. Like the `config` node, it's read+write so the client-side
admin can manage it; access is gated by the secret `/admin` URL + password rather
than by rules. The field validation above still constrains what can be written.
**Hardening (optional, not yet wired):** add Firebase Auth for the admin, then set
`guests` `.write` to the authed admin only and expose just `guests/$code` for public
read — the runtime lookup already reads one record by code, so it keeps working.

## Deploy to Vercel

1. Push this repo to GitHub / GitLab.
2. In Vercel, **Add New Project** → import the repo. Framework preset = **Vite**.
3. Under **Environment Variables**, add all six values from `.env.example`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Deploy. `vercel.json` already rewrites every path to `/index.html` so the SPA
   never 404s, and `dist/` is the output directory.

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
