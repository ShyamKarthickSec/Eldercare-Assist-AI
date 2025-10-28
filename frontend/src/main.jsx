import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'   // keep this

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />   {/* 👈 render App, which contains Router + Routes */}
  </StrictMode>,
)
