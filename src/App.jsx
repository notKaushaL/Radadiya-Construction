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
  // ── Navigation Stack ──────────────────────────────────────────────────────
  // Each entry: { screen: string, params: object }
  //
  // navigate(to, params) → push a new screen (forward navigation)
  // switchTab(tab)       → reset stack to fresh [tab] (bottom-nav tap)
  // goBack()             → pop one level; if already at root → exit dialog
  //
  // This means the back button always returns to where you *came from*,
  // with no hardcoded destinations and no risk of navigation loops.
  const [navStack, setNavStack] = useState([{ screen: 'home', params: {} }])
  const navStackRef = useRef(navStack)
  useEffect(() => { navStackRef.current = navStack }, [navStack])

  const { screen, params } = navStack[navStack.length - 1]

  const [showExitAlert, setShowExitAlert] = useState(false)
  const [isShutdown, setIsShutdown]       = useState(false)
  const [isLanding, setIsLanding]         = useState(true)
  const { theme, language, loadFromCloud } = useStore()

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

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ── Forward navigation: push onto the stack ──────────────────────────────
  const navigate = (to, p = {}) => {
    setNavStack(prev => [...prev, { screen: to, params: p }])
    setShowExitAlert(false)
    window.history.pushState({ depth: navStackRef.current.length }, '')
  }

  // ── Tab switch: reset stack with home as base ─────────────────────────────
  // Home tab → [home]  (back = exit dialog)
  // Other tabs → [home, tab]  (back from tab goes to home, not exit)
  const switchTab = (tab) => {
    setNavStack(
      tab === 'home'
        ? [{ screen: 'home', params: {} }]
        : [{ screen: 'home', params: {} }, { screen: tab, params: {} }]
    )
    setShowExitAlert(false)
    window.history.pushState({ depth: 0 }, '')
  }

  // ── Go back: pop one level ───────────────────────────────────────────────
  const goBack = () => {
    const stack = navStackRef.current
    if (stack.length <= 1) {
      setShowExitAlert(true)
      return
    }
    setNavStack(prev => prev.slice(0, -1))
    setShowExitAlert(false)
  }

  // ── Browser back button: mirrors goBack() ───────────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      if (isShutdown || isLanding) return
      const stack = navStackRef.current
      if (stack.length <= 1) {
        setShowExitAlert(true)
        window.history.pushState({ depth: 0 }, '')
      } else {
        setNavStack(prev => prev.slice(0, -1))
      }
    }
    window.history.pushState({ depth: 0 }, '')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isShutdown, isLanding])

  useEffect(() => {
    const timer = setTimeout(() => setIsLanding(false), 2600)
    return () => clearTimeout(timer)
  }, [])

  if (isShutdown) return <ShutdownScreen />
  if (isLanding)  return <LandingScreen />

  const lang = TRANSLATIONS[language] || TRANSLATIONS.en

  // Which bottom-nav tab to highlight (walk back through stack to find it)
  const activeTab =
    NAV_SCREENS.includes(screen)
      ? screen
      : [...navStack].reverse().find(e => NAV_SCREENS.includes(e.screen))?.screen || 'home'

  return (
    <LangContext.Provider value={lang}>
      <div className="screen">
        {screen === 'home'        && <HomeScreen       onNavigate={navigate} onBack={goBack} />}
        {screen === 'ledger' && !params.siteId && <SitePickerScreen onNavigate={navigate} onBack={goBack} />}
        {screen === 'ledger' &&  params.siteId && <LedgerScreen     onNavigate={navigate} onBack={goBack} siteId={params.siteId} />}
        {screen === 'addEntry'    && <AddEntryScreen    onNavigate={navigate} onBack={goBack} siteId={params.siteId} entryToEdit={params.entryToEdit} />}
        {screen === 'summary'     && <SummaryScreen     onNavigate={navigate} onBack={goBack} />}
        {screen === 'settings'    && <SettingsScreen    onNavigate={navigate} onBack={goBack} />}
        {screen === 'paymentLog'  && <PaymentLogScreen  onNavigate={navigate} onBack={goBack} siteId={params.siteId} />}
        {screen === 'siteSummary' && <SiteSummaryScreen onNavigate={navigate} onBack={goBack} siteId={params.siteId} />}

        <BottomNav active={activeTab} onNavigate={switchTab} />

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
              <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>Exit App?</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 24px', lineHeight: 1.6 }}>
                All your data is saved and synced. You can reopen the app anytime from your home screen.
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
          <circle cx="50" cy="50" r="44" fill="none" stroke="#EBEBEB" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="44" fill="none"
            stroke="rgba(196, 148, 28, 0.28)" strokeWidth="12"
            strokeLinecap="round" className="animate-trace-glow"
            style={{ filter: 'blur(6px)' }}
          />
          <circle cx="50" cy="50" r="44" fill="none"
            stroke="#C4922A" strokeWidth="4.2"
            strokeLinecap="round" className="animate-trace"
            filter="url(#strokeGlow)"
          />
        </svg>
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
