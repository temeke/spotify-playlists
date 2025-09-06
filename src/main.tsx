import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CallbackPage } from './components/CallbackPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  </StrictMode>,
)
