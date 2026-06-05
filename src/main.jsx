import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { WeddingConfigProvider } from './contexts/WeddingConfigContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <WeddingConfigProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </WeddingConfigProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
