import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { handleImmediateOAuth } from './oauth-handler'
import './debug-oauth'

// Handle OAuth parameters immediately before React starts
handleImmediateOAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/callback" element={<App />} />
        <Route path="/" element={<App />} />
        <Route path="*" element={<App />} />
      </Routes>
    </Router>
  </StrictMode>,
)
