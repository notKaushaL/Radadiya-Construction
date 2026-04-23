import { ArrowRight, Building2 } from 'lucide-react'
import useStore from '../store/useStore'
import { formatINR } from '../utils/helpers'
import { useLang } from '../App'

/**
 * SitePickerScreen
 * Shown when user taps "Ledger" from the bottom nav without a siteId.
 * Lists all sites so the user can pick which one to open.
 */
export default function SitePickerScreen({ onNavigate }) {
  const { sites, getSiteTotal } = useStore()
  const t = useLang()   // ← t is available here in the main component

  // Sort sites by createdAt descending
  const sortedSites = [...sites].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const activeSites    = sortedSites.filter(s => (s.status || 'active') !== 'completed')
  const completedSites = sortedSites
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt))

  return (
    <div className="screen">
      {/* Header */}
      <div className="t-header" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="t-heading">{t.dailyLedger}</h1>
        <p className="t-caption" style={{ marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {t.selectSite}
        </p>
      </div>

      <div className="screen-body" style={{ padding: '24px 20px 100px' }}>
        {sites.length === 0 ? (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55vh', textAlign: 'center', padding: '0 32px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, opacity: 0.2
            }}>
              <Building2 size={32} color="var(--text)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{t.noSites}</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 28 }}>{t.noSitesDesc}</p>
            <button
              onClick={() => onNavigate('home')}
              className="btn-primary"
              style={{ height: 52, padding: '0 28px' }}
            >
              {t.addFirstSite}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Active Projects */}
            {activeSites.length > 0 && (
              <div>
                <p className="t-section-label">{t.activeSites} ({activeSites.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeSites.map(site => {
                    const total = getSiteTotal(site.id)
                    return (
                      <button
                        key={site.id}
                        onClick={() => onNavigate('ledger', { siteId: site.id })}
                        style={{
                          display: 'flex', alignItems: 'center',
                          padding: '16px 18px', borderRadius: 16, width: '100%', textAlign: 'left',
                          background: 'var(--bg2)', border: '1px solid var(--border)',
                          cursor: 'pointer', color: 'var(--text)', gap: 14,
                        }}
                      >
                        {/* No icon - minimal look */}

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {site.name}
                          </p>
                          {site.ownerName ? (
                            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {site.ownerName}
                            </p>
                          ) : null}
                        </div>

                        {/* Amount + Arrow */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{formatINR(total)}</p>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {t.investment}
                            </p>
                          </div>
                          <ArrowRight size={16} color="var(--text3)" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed Projects */}
            {completedSites.length > 0 && (
              <div>
                <p className="t-section-label">{t.completedSites} ({completedSites.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {completedSites.map(site => {
                    const total = getSiteTotal(site.id)
                    return (
                      <button
                        key={site.id}
                        onClick={() => onNavigate('ledger', { siteId: site.id })}
                        style={{
                          display: 'flex', alignItems: 'center',
                          padding: '16px 18px', borderRadius: 16, width: '100%', textAlign: 'left',
                          background: 'rgba(34, 197, 94, 0.08)', border: '1px solid var(--border)',
                          cursor: 'pointer', color: 'var(--text)', gap: 14,
                        }}
                      >
                        {/* No icon - minimal look */}

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {site.name}
                          </p>
                          {site.ownerName ? (
                            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0', fontWeight: 500 }}>
                              {site.ownerName}
                            </p>
                          ) : null}
                        </div>

                        {/* Amount + Arrow */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{formatINR(total)}</p>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {t.complete || 'Done'}
                            </p>
                          </div>
                          <ArrowRight size={16} color="var(--text3)" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
