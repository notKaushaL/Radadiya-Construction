import { useState } from 'react'
import { ArrowLeft, Plus, Share2, MoreVertical, Trash2, CheckCircle2, Calendar, AlertCircle, Edit2, RotateCcw, Building2, User, Phone } from 'lucide-react'
import useStore from '../store/useStore'
import { formatINR } from '../utils/helpers'
import { useLang } from '../App'

export default function LedgerScreen({ onNavigate, onBack, siteId }) {
  const {
    sites, deleteEntry, setSiteStatus, getSiteEntriesByDate, updateSiteDetails,
    getSiteTotal, getSitePaymentsTotal
  } = useStore()

  const [showOptions, setShowOptions] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName]     = useState('')
  const [editOwner, setEditOwner]   = useState('')
  const [editPhone, setEditPhone]   = useState('')
  const [editAddr, setEditAddr]     = useState('')
  const t = useLang()

  const site = sites.find((s) => s.id === siteId)

  // ── All hooks must run before any early return ────────────────────────────
  // Do NOT call onNavigate() here — calling state setters during render is
  // illegal in React and causes blank/white screens.
  // Instead we render a blank placeholder; the user can hit the back button.
  if (!site) {
    return (
      <div className="screen">
        <div className="t-header">
          <button onClick={onBack} className="btn-back">
            <ArrowLeft size={19} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Site not found</p>
        </div>
      </div>
    )
  }

  const groupedEntries = getSiteEntriesByDate ? getSiteEntriesByDate(siteId) : []
  const total = getSiteTotal(siteId)
  const paid = getSitePaymentsTotal(siteId)
  const isCompleted = site.status === 'completed'

  const handleShare = () => {
    const msg = useStore.getState().generateWhatsAppSummary(siteId)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const typeLabel = { labor: t.labor, material: t.material, misc: t.misc }

  return (
    <div className="screen">
      {/* Header */}
      <div className="t-header" style={{ paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <button onClick={onBack} className="btn-back" style={{ flexShrink: 0 }}>
              <ArrowLeft size={19} />
            </button>
            
            <h1 className="t-heading" style={{ fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {site.name}
            </h1>

            <button
              onClick={() => { setEditName(site.name); setEditOwner(site.ownerName || ''); setEditPhone(site.ownerPhone || ''); setEditAddr(site.address || ''); setShowEdit(true) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
                borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)',
                cursor: 'pointer', flexShrink: 0
              }}
            >
              <Edit2 size={11} color="var(--text3)" />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button onClick={handleShare} className="btn-back" style={{ width: 34, height: 34 }}>
              <Share2 size={16} />
            </button>
            <button onClick={() => setShowOptions(true)} className="btn-back" style={{ width: 34, height: 34 }}>
              <MoreVertical size={17} />
            </button>
          </div>
        </div>

        {/* Client Info Section + Status Badge */}
        <div style={{ marginTop: 6, paddingLeft: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {site.ownerName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={11} color="var(--text3)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{site.ownerName}</span>
              </div>
            )}
            {site.ownerPhone && (
              <a
                href={`tel:${site.ownerPhone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <Phone size={11} color="var(--text3)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                  {site.ownerPhone}
                </span>
              </a>
            )}
          </div>

          {/* Status Badge - In line with phone row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '1.5px 6px', borderRadius: 4,
            background: isCompleted ? 'var(--bg2)' : 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${isCompleted ? 'var(--border)' : 'rgba(34, 197, 94, 0.2)'}`,
            flexShrink: 0,
            marginBottom: 2
          }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: isCompleted ? 'var(--text3)' : '#22c55e' }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: isCompleted ? 'var(--text3)' : '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isCompleted ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      <div className="screen-body" style={{ padding: '20px 20px 140px' }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          <div style={{ padding: '14px 16px', background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
            <p className="t-caption" style={{ marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.totalSpent}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0, overflowWrap: 'anywhere', wordBreak: 'break-all', lineHeight: 1.35 }}>{formatINR(total)}</p>
          </div>
          <div style={{ padding: '14px 16px', background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
            <p className="t-caption" style={{ marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.fundsReceived}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0, overflowWrap: 'anywhere', wordBreak: 'break-all', lineHeight: 1.35 }}>{formatINR(paid)}</p>
          </div>
        </div>

        {/* Completed Banner */}
        {isCompleted && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 24
          }}>
            <AlertCircle size={18} color="var(--text3)" />
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>{t.projectDoneDesc}</p>
          </div>
        )}

        {/* Entries */}
        {groupedEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', opacity: 0.4
            }}>
              <Building2 size={28} color="var(--text)" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{t.noEntries}</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0 }}>{t.noEntriesDesc}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {groupedEntries.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} color="var(--text3)" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {new Date(group.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>{formatINR(group.total)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      isCompleted={isCompleted}
                      onEdit={() => !isCompleted && onNavigate('addEntry', { siteId, entryToEdit: entry })}
                      onDelete={() => deleteEntry(entry.id)}
                      typeLabel={typeLabel}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FABs */}
      {!isCompleted && (
        <div style={{
          position: 'fixed', bottom: 100, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 10, zIndex: 20,
          padding: '0 20px', pointerEvents: 'none'
        }}>
          <button
            onClick={() => onNavigate('addEntry', { siteId })}
            className="btn-fab"
            style={{ pointerEvents: 'auto', flex: 1, maxWidth: 300 }}
          >
            <Plus size={18} strokeWidth={3} />
            {t.addEntry}
          </button>
        </div>
      )}

      {/* Options Sheet */}
      {showOptions && (
        <div className="t-overlay" onClick={() => setShowOptions(false)}>
          <div className="t-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 24px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => { setSiteStatus(siteId, isCompleted ? 'active' : 'completed'); setShowOptions(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, height: 60, padding: '0 16px',
                  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
                  cursor: 'pointer', color: 'var(--text)', fontSize: 15, fontWeight: 600
                }}
              >
                {isCompleted ? <RotateCcw size={18} color="var(--text)" /> : <CheckCircle2 size={18} color="var(--text)" />}
                {isCompleted ? t.reopenProject : t.markCompleted}
              </button>
              <button
                onClick={() => { handleShare(); setShowOptions(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, height: 60, padding: '0 16px',
                  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
                  cursor: 'pointer', color: 'var(--text)', fontSize: 15, fontWeight: 600
                }}
              >
                <Share2 size={18} color="var(--text)" />
                {t.shareSummary}
              </button>
              <button
                onClick={() => setShowOptions(false)}
                style={{ height: 52, color: 'var(--text3)', fontWeight: 700, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Site Details Sheet */}
      {showEdit && (
        <div className="t-overlay" onClick={() => setShowEdit(false)}>
          <div className="t-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 20px' }} />
            <h2 className="t-heading" style={{ marginBottom: 4, fontSize: 20 }}>Edit Site Details</h2>
            <p className="t-caption" style={{ marginBottom: 20 }}>Update name, client & contact info</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Site Name *</p>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="t-input" placeholder="e.g. Madhukanj Villa" autoFocus />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Client Name</p>
                <input type="text" value={editOwner} onChange={e => setEditOwner(e.target.value)} className="t-input" placeholder="e.g. Ramesh Patel" />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Phone Number</p>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="t-input"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Address</p>
                <input type="text" value={editAddr} onChange={e => setEditAddr(e.target.value)} className="t-input" placeholder="e.g. Alkapuri, Vadodara" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => {
                  updateSiteDetails(siteId, { name: editName, ownerName: editOwner, ownerPhone: editPhone, address: editAddr })
                  setShowEdit(false)
                }}
                className="btn-fab-full"
                disabled={!editName.trim()}
              >
                Save Changes
              </button>
              <button onClick={() => setShowEdit(false)} style={{ height: 48, color: 'var(--text3)', fontWeight: 700, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EntryCard({ entry, isCompleted, onEdit, onDelete, typeLabel }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div
      onClick={onEdit}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16,
        padding: '14px 16px', cursor: isCompleted ? 'default' : 'pointer',
        transform: pressed && !isCompleted ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              padding: '2px 8px', borderRadius: 9999,
              background: 'var(--bg2)', color: 'var(--text2)',
              border: '1px solid var(--border)'
            }}>
              {typeLabel[entry.type] || entry.type}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
              {entry.category}
            </span>
          </div>
          {entry.qtyDetail && (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0', fontWeight: 500 }}>{entry.qtyDetail}</p>
          )}
          {entry.note && (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{entry.note}"
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{formatINR(entry.amount)}</p>
          {!isCompleted && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              style={{
                width: 30, height: 30, borderRadius: '50%', background: 'var(--bg2)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0
              }}
            >
              <Trash2 size={13} color="var(--text3)" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
