import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    // With registerType: 'autoUpdate', this is usually handled automatically,
    // but we can force a reload here if needed.
    updateSW(true)
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Check for updates every 10 minutes
const intervalMS = 10 * 60 * 1000
setInterval(() => {
  updateSW(true)
}, intervalMS)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
