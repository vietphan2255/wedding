import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeContext'
import ConnectionGate from './components/ConnectionGate.jsx'
import './index.css'

// Minimal bootstrap: only React, the theme tokens, and the connection gate load
// up front. ConnectionGate lazy-imports the entire app (router, providers, all
// page/feature bundles) itself — only after Firebase RTDB reports connected — so
// the wedding-themed loader is the smallest possible initial UI path.
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ConnectionGate />
    </ThemeProvider>
  </StrictMode>,
)
