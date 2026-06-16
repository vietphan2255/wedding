import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Standard ESM resolution — accept implicit `.ts`/`.tsx` for imports that
    // omit the extension. Imports that include an extension (`./foo.js`)
    // must match a real file; rename their callers when migrating.
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/database'],
          motion: ['framer-motion'],
          router: ['react-router-dom'],
        },
      },
    },
  },
})
