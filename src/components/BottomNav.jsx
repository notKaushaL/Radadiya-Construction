import { Home, BookOpen, BarChart2, Settings } from 'lucide-react'
import { useLang } from '../App'

export default function BottomNav({ active, onNavigate }) {
  const t = useLang()

  const NAV_ITEMS = [
    { id: 'home',     label: t.home,     Icon: Home },
    { id: 'ledger',   label: t.ledger,   Icon: BookOpen },
    { id: 'summary',  label: t.summary,  Icon: BarChart2 },
    { id: 'settings', label: t.settings, Icon: Settings },
  ]

  const isLedgerActive = (active) =>
    active === 'ledger' || active === 'addEntry' || active === 'siteSummary' || active === 'paymentLog'

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      padding: '8px 16px 20px', pointerEvents: 'none',
      background: 'transparent'
    }}>
      <nav className="nav-blur" style={{
        borderRadius: 9999, overflow: 'hidden',
        maxWidth: 400, margin: '0 auto',
        pointerEvents: 'auto',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 68, padding: '0 8px' }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = id === 'ledger' ? isLedgerActive(active) : active === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                style={{
                  flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'transform 0.1s'
                }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.88)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  width: 46, height: 30, borderRadius: 9999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'var(--btn-bg)' : 'transparent',
                  transition: 'background 0.2s'
                }}>
                  <Icon
                    size={19}
                    color={isActive ? 'var(--btn-text)' : 'var(--text3)'}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: isActive ? 'var(--text)' : 'var(--text3)',
                  transition: 'color 0.2s'
                }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
