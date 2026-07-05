import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeContext'
import ConnectionGate from './components/ConnectionGate.jsx'
import { initReloadDiag } from './lib/reloadDiag'
import './index.css'

// Minimal bootstrap: only React, the theme tokens, and the connection gate load
// up front. ConnectionGate lazy-imports the entire app (router, providers, all
// page/feature bundles) itself — only after Firebase RTDB reports connected — so
// the wedding-themed loader is the smallest possible initial UI path.

// Opt-in reload/crash diagnostics — no-op unless enabled with ?diag=1.
initReloadDiag()

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ConnectionGate />
    </ThemeProvider>
  </StrictMode>,
)
