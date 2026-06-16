import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { WeddingConfigProvider } from './contexts/WeddingConfigContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <WeddingConfigProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </WeddingConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
