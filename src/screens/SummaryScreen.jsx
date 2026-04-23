import { useState } from 'react'
import { PieChart, TrendingUp, ChevronDown, Check, X, Building2 } from 'lucide-react'
import useStore from '../store/useStore'
import { formatINR } from '../utils/helpers'
import { useLang } from '../App'

export default function SummaryScreen({ onNavigate }) {
  const { sites, entries, getSiteTotal } = useStore()
  const [selectedSiteId, setSelectedSiteId] = useState('all')
  const [showPicker, setShowPicker] = useState(false)
  const t = useLang()

  const filteredEntries = selectedSiteId === 'all'
    ? entries
    : entries.filter(e => e.siteId === selectedSiteId)
  const currentTotal = filteredEntries.reduce((sum, e) => sum + e.amount, 0)

  const selectedSite = sites.find(s => s.id === selectedSiteId)
  const selectorLabel = selectedSiteId === 'all' ? t.allSites : selectedSite?.name || t.selectSite

  const typeBreakdown = {
    labor:    filteredEntries.filter(e => e.type === 'labor').reduce((s, e) => s + e.amount, 0),
    material: filteredEntries.filter(e => e.type === 'material').reduce((s, e) => s + e.amount, 0),
    misc:     filteredEntries.filter(e => e.type === 'misc').reduce((s, e) => s + e.amount, 0),
  }
  const maxVal = Math.max(...Object.values(typeBreakdown), 1)

  const handleSelect = (id) => {
    setSelectedSiteId(id)
    setShowPicker(false)
  }

  return (
    <div className="screen">
      {/* Header */}
      <div className="t-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 className="t-heading">{t.summaryTitle}</h1>
            <p className="t-caption" style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t.projectAnalytics}</p>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: 'var(--bg2)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <PieChart size={19} color="var(--text)" />
          </div>
        </div>

        {/* ── Project Selector Button ─────────────────────────────── */}
        <button
          onClick={() => setShowPicker(true)}
          style={{
            width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 18px', borderRadius: 14,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            cursor: 'pointer', color: 'var(--text)', transition: 'opacity 0.15s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={16} color="var(--text3)" />
            <span style={{ fontSize: 15, fontWeight: 700 }}>{selectorLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {selectedSiteId !== 'all' && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text2)',
                background: 'var(--bg)', border: '1px solid var(--border)',
                padding: '2px 10px', borderRadius: 9999
              }}>
                {formatINR(getSiteTotal(selectedSiteId))}
              </span>
            )}
            <ChevronDown size={16} color="var(--text3)" />
          </div>
        </button>
      </div>

      <div className="screen-body" style={{ padding: '24px 20px 100px' }}>
        {/* Hero Total Card */}
        <div style={{
          background: 'var(--btn-bg)', color: 'var(--btn-text)',
          borderRadius: 20, padding: '28px 24px', marginBottom: 28
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5, margin: '0 0 6px' }}>
            {t.cumulativeExpense}
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
            {formatINR(currentTotal)}
          </h2>
          <p style={{ fontSize: 12, opacity: 0.4, margin: 0, fontWeight: 600 }}>
            {filteredEntries.length} {t.entriesCount}
          </p>
        </div>

        {/* Type Breakdown */}
        <div style={{ marginBottom: 28 }}>
          <p className="t-section-label">{t.byType}</p>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '8px 20px'
          }}>
            {[
              { key: 'labor',    label: t.labor    },
              { key: 'material', label: t.material },
              { key: 'misc',     label: t.misc     },
            ].map(({ key, label }, idx, arr) => {
              const val = typeBreakdown[key]
              const pct = currentTotal > 0 ? (val / currentTotal * 100).toFixed(1) : '0.0'
              const bar = (val / maxVal * 100)
              return (
                <div
                  key={key}
                  style={{
                    padding: '16px 0',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{formatINR(val)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8, fontWeight: 600 }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${bar}%`, background: 'var(--text)', borderRadius: 9999, transition: 'width 0.9s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Site Breakdown (only when All is selected) */}
        {selectedSiteId === 'all' && sites.length > 0 && (
          <div>
            <p className="t-section-label">{t.bySite}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...sites].sort((a, b) => getSiteTotal(b.id) - getSiteTotal(a.id)).map(site => {
                const siteTotal = getSiteTotal(site.id)
                const pct = currentTotal > 0 ? (siteTotal / currentTotal * 100).toFixed(1) : '0.0'
                const barW = currentTotal > 0 ? (siteTotal / currentTotal * 100) : 0
                return (
                  <button
                    key={site.id}
                    onClick={() => onNavigate('ledger', { siteId: site.id })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', borderRadius: 14,
                      background: 'var(--bg2)', border: '1px solid var(--border)',
                      cursor: 'pointer', color: 'var(--text)', width: '100%', textAlign: 'left',
                    }}
                  >
                    <div style={{ flex: 1, marginRight: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{site.name}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{formatINR(siteTotal)}</p>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barW}%`, background: 'var(--text)', borderRadius: 9999, opacity: 0.5 }} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: '5px 0 0', fontWeight: 500 }}>{pct}% of total</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {filteredEntries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <TrendingUp size={32} color="var(--text3)" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text3)' }}>{t.noAnalytics}</p>
          </div>
        )}
      </div>

      {/* ── Site Picker Bottom Sheet ──────────────────────────────── */}
      {showPicker && (
        <div
          className="t-overlay"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="t-modal animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{t.selectSite}</h2>
              <button onClick={() => setShowPicker(false)} className="btn-back" style={{ width: 36, height: 36 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '55vh', overflowY: 'auto' }}>
              {/* All Projects option */}
              <SitePickerRow
                label={t.allSites}
                sublabel={`${sites.length} ${t.totalSites}`}
                amount={entries.reduce((s, e) => s + e.amount, 0)}
                isSelected={selectedSiteId === 'all'}
                onSelect={() => handleSelect('all')}
              />

              {sites.length > 0 && (
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              )}

              {[...sites]
                .sort((a, b) => {
                  // Active projects first
                  if (a.status !== b.status) {
                    return a.status === 'completed' ? 1 : -1
                  }
                  // Then descending by date
                  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                })
                .map(site => (
                  <SitePickerRow
                    key={site.id}
                    label={site.name}
                    sublabel={site.status === 'completed' ? '✓ Completed' : '● Active'}
                    amount={getSiteTotal(site.id)}
                    isSelected={selectedSiteId === site.id}
                    onSelect={() => handleSelect(site.id)}
                    isCompleted={site.status === 'completed'}
                  />
                ))}

              {sites.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 0', fontSize: 14 }}>{t.noSites}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SitePickerRow({ label, sublabel, amount, isSelected, onSelect, isCompleted }) {
  const bg = isSelected 
    ? 'var(--btn-bg)' 
    : isCompleted ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg2)'

  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 14, width: '100%', textAlign: 'left',
        cursor: 'pointer', transition: 'all 0.15s',
        background: bg,
        border: isSelected ? 'none' : '1px solid var(--border)',
      }}
    >
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: isSelected ? 'var(--btn-text)' : 'var(--text)' }}>
          {label}
        </p>
        <p style={{ fontSize: 11, fontWeight: 500, margin: '3px 0 0', color: isSelected ? 'var(--btn-text)' : 'var(--text3)', opacity: isSelected ? 0.6 : 1 }}>
          {sublabel}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? 'var(--btn-text)' : 'var(--text)' }}>
          {formatINR(amount)}
        </span>
        {isSelected && <Check size={16} color="var(--btn-text)" />}
      </div>
    </button>
  )
}
