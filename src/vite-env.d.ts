/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_DATABASE_URL?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  // Google Analytics (GA4) measurement ID (G-XXXXXXXXXX). Optional; enables
  // Firebase Analytics when set.
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string
  // App Check (reCAPTCHA v3) site key. Optional; enables App Check tokens on
  // Firebase requests so RTDB enforcement can block non-app clients.
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  // Comma- or whitespace-separated allowlist of admin emails permitted into
  // /admin. Client-side UX layer only; database.rules.json is the real boundary.
  readonly VITE_ADMIN_EMAILS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
