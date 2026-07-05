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
        // Function form (first match wins per module) so React is isolated
        // deterministically. With the object form Rollup folds React/ReactDOM/
        // jsx-runtime into whichever vendor chunk (motion/router) first depends
        // on them; the tiny startup entry (bootstrap + ConnectionGate) would then
        // statically import — and download — those big App-only chunks before the
        // connection gate can even render. Isolating React keeps `motion`/`router`
        // reachable solely through the lazy App import. `firebase` is scoped to
        // app+database (RTDB, needed by the gate); firebase/auth and firebase/
        // analytics fall through so they ride their own importers (admin / the
        // on-demand analytics chunk), never the startup-critical path.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          )
            return 'react'
          if (id.includes('/react-router')) return 'router'
          if (id.includes('/framer-motion/')) return 'motion'
          if (id.includes('/firebase/auth') || id.includes('/@firebase/auth'))
            return undefined
          if (
            id.includes('/firebase/analytics') ||
            id.includes('/@firebase/analytics')
          )
            return undefined
          if (id.includes('/firebase/') || id.includes('/@firebase/'))
            return 'firebase'
          return undefined
        },
      },
    },
  },
})
