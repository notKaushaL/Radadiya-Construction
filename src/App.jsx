import { useEffect, createContext, useContext, useState, useRef } from 'react'
import HomeScreen from './screens/HomeScreen'
import LedgerScreen from './screens/LedgerScreen'
import SitePickerScreen from './screens/SitePickerScreen'
import AddEntryScreen from './screens/AddEntryScreen'
import SummaryScreen from './screens/SummaryScreen'
import SettingsScreen from './screens/SettingsScreen'
import PaymentLogScreen from './screens/PaymentLogScreen'
import SiteSummaryScreen from './screens/SiteSummaryScreen'
import BottomNav from './components/BottomNav'
import useStore from './store/useStore'
import { TRANSLATIONS } from './i18n/translations'
import { Power, CheckCircle2 } from 'lucide-react'
import { initDb } from './db/setup'

export const LangContext = createContext(TRANSLATIONS.en)
export const useLang = () => useContext(LangContext)

const NAV_SCREENS = ['home', 'ledger', 'summary', 'settings']

export default function App() {
  // ── Single navigation state to prevent race conditions ──────────────────────
  // Previously screen+params were two separate useState calls. When navigate()
  // called setScreen + setParams, there was a render between the two sets where
  // params.siteId was still stale/undefined. LedgerScreen's guard then called
  // onNavigate('home') and we got a white flash. Now they always update atomically.
  const [nav, setNav] = useState({ screen: 'home', params: {} })

  const [showExitAlert, setShowExitAlert] = useState(false)
  const [isShutdown, setIsShutdown] = useState(false)
  const [isLanding, setIsLanding] = useState(true)
  const { theme, language, loadFromCloud } = useStore()

  const { screen, params } = nav
  const navRef = useRef(nav)
  useEffect(() => { navRef.current = nav }, [nav])

  // Initialize DB + cloud sync on mount
  useEffect(() => {
    const startup = async () => {
      try {
        await initDb()
        await loadFromCloud()
      } catch (e) {
        console.error('Startup error:', e)
      }
    }
    startup()
  }, [])

  // Apply theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Back button / history handling
  useEffect(() => {
    const handlePopState = (e) => {
      if (isShutdown || isLanding) return
      const state = e.state
      if (!state || state.type === 'RADADIYA_SENTINEL') {
        if (navRef.current.screen === 'home') {
          setShowExitAlert(true)
          window.history.pushState({ screen: 'home', params: {} }, '')
        } else {
          setNav({ screen: 'home', params: {} })
          window.history.pushState({ screen: 'home', params: {} }, '')
        }
      } else if (state.screen) {
        setNav({ screen: state.screen, params: state.params || {} })
        setShowExitAlert(false)
      }
    }
    window.history.pushState({ type: 'RADADIYA_SENTINEL' }, '')
    window.history.pushState({ screen: 'home', params: {} }, '')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isShutdown, isLanding])

  // Atomic navigate — screen + params always change together in one render
  const navigate = (to, p = {}) => {
    setNav({ screen: to, params: p })
    setShowExitAlert(false)
    window.history.pushState({ screen: to, params: p }, '')
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLanding(false), 2600)
    return () => clearTimeout(timer)
  }, [])

  if (isShutdown) return <ShutdownScreen />
  if (isLanding) return <LandingScreen />

  const lang = TRANSLATIONS[language] || TRANSLATIONS.en

  return (
    <LangContext.Provider value={lang}>
      <div className="screen">
        {screen === 'home'        && <HomeScreen onNavigate={navigate} />}
        {/* If ledger is opened without a siteId (e.g. tapped from nav), show the site picker */}
        {screen === 'ledger' && !params.siteId && <SitePickerScreen onNavigate={navigate} />}
        {screen === 'ledger' &&  params.siteId && <LedgerScreen onNavigate={navigate} siteId={params.siteId} />}
        {screen === 'addEntry'    && <AddEntryScreen onNavigate={navigate} siteId={params.siteId} entryToEdit={params.entryToEdit} />}
        {screen === 'summary'     && <SummaryScreen onNavigate={navigate} />}
        {screen === 'settings'    && <SettingsScreen onNavigate={navigate} />}
        {screen === 'paymentLog'  && <PaymentLogScreen onNavigate={navigate} siteId={params.siteId} />}
        {screen === 'siteSummary' && <SiteSummaryScreen onNavigate={navigate} siteId={params.siteId} />}

        {NAV_SCREENS.includes(screen) && <BottomNav active={screen} onNavigate={navigate} />}

        {showExitAlert && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)'
          }}>
            <div style={{
              width: '100%', maxWidth: 340,
              background: 'var(--bg)', borderRadius: 24, padding: 32,
              textAlign: 'center', border: '1px solid var(--border)'
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: 'var(--bg2)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 18px'
              }}>
                <Power size={20} color="var(--text)" />
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>Close Application?</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 24px', lineHeight: 1.5 }}>
                Are you sure you want to exit?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => setIsShutdown(true)} className="btn-fab-full">Yes, Close</button>
                <button
                  onClick={() => setShowExitAlert(false)}
                  style={{ height: 46, fontSize: 14, fontWeight: 700, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LangContext.Provider>
  )
}

function LandingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500, background: '#FFFFFF',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32
    }}>
      {/* Ring + Logo */}
      <div style={{ position: 'relative', width: 152, height: 152, marginBottom: 30 }}>
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
          viewBox="0 0 100 100"
        >
          <defs>
            <filter id="strokeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#C4922A" floodOpacity="0.5" result="goldColor" />
              <feComposite in="goldColor" in2="blur" operator="in" result="goldBlur" />
              <feMerge>
                <feMergeNode in="goldBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Faint background track */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#EBEBEB" strokeWidth="1.5" />

          {/* Golden bloom shadow behind main stroke */}
          <circle cx="50" cy="50" r="44" fill="none"
            stroke="rgba(196, 148, 28, 0.28)" strokeWidth="12"
            strokeLinecap="round"
            className="animate-trace-glow"
            style={{ filter: 'blur(6px)' }}
          />

          {/* Main anti-clockwise stroke — golden */}
          <circle cx="50" cy="50" r="44" fill="none"
            stroke="#C4922A" strokeWidth="4.2"
            strokeLinecap="round"
            className="animate-trace"
            filter="url(#strokeGlow)"
          />
        </svg>

        {/* Logo — always visible, no animation */}
        <div style={{
          position: 'absolute', inset: 11,
          borderRadius: '50%', overflow: 'hidden', background: '#fff',
          boxShadow: '0 2px 14px rgba(0,0,0,0.07)'
        }}>
          <img src="/logo.jpeg" alt="Radadiya Construction"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Text — visible from start; title pulses when circle finishes */}
      <div style={{ textAlign: 'center', userSelect: 'none' }}>
        <h1 className="animate-title-glow" style={{
          fontSize: 20, fontWeight: 800, color: '#111111',
          letterSpacing: '-0.01em', margin: '0 0 10px'
        }}>
          Radadiya Construction
        </h1>
        <p style={{
          fontSize: 9, fontWeight: 700, color: '#AAAAAA',
          textTransform: 'uppercase', letterSpacing: '0.38em', margin: 0
        }}>
          VADODARA · INDIA
        </p>
      </div>
    </div>
  )
}


function ShutdownScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32, textAlign: 'center'
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%', border: '1px solid #222',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, opacity: 0.3
      }}>
        <CheckCircle2 size={26} color="#FFFFFF" />
      </div>
      <h2 style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>Session Ended</h2>
      <p style={{ color: '#555', fontSize: 13, margin: '0 0 36px', maxWidth: 200 }}>Data synchronized and saved safely.</p>
      <button
        onClick={() => window.location.reload()}
        style={{ color: '#444', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
      >
        Restart App
      </button>
    </div>
  )
}
