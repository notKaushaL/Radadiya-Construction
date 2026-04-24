import { useState } from 'react'
import { Plus, User, Phone, ArrowRight, X, MapPin, BarChart3, Edit2 } from 'lucide-react'
import useStore from '../store/useStore'
import { formatINR } from '../utils/helpers'
import { useLang } from '../App'

export default function HomeScreen({ onNavigate }) {
  const { sites, addSite, getSiteTotal, getSitePaymentsTotal, updateSiteDetails } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSiteName, setNewSiteName] = useState('')
  const [newOwnerName, setNewOwnerName] = useState('')
  const [newOwnerPhone, setNewOwnerPhone] = useState('')
  const [newAddress, setNewAddress] = useState('')
  // Edit modal state
  const [editingSite, setEditingSite] = useState(null)  // site object being edited
  const [editName, setEditName]   = useState('')
  const [editOwner, setEditOwner] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddr, setEditAddr]   = useState('')
  const t = useLang()

  // Sort sites by createdAt descending (newest first)
  const sortedSites = [...sites].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const activeSites = sortedSites.filter((s) => s.status === 'active')
  // Sort completed sites by completedAt descending if available
  const completedSites = sortedSites
    .filter((s) => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt))

  const closeModal = () => {
    setShowAddModal(false)
    setNewSiteName('')
    setNewOwnerName('')
    setNewOwnerPhone('')
    setNewAddress('')
  }

  const handleAddSite = async () => {
    if (!newSiteName.trim()) return
    await addSite({
      name: newSiteName,
      ownerName: newOwnerName,
      ownerPhone: newOwnerPhone,
      address: newAddress,
    })
    closeModal()
  }

  // Only allow digits in phone field
  const handlePhoneChange = (val) => {
    setNewOwnerPhone(val.replace(/\D/g, '').slice(0, 10))
  }

  const openEdit = (site) => {
    setEditingSite(site)
    setEditName(site.name)
    setEditOwner(site.ownerName || '')
    setEditPhone(site.ownerPhone || '')
    setEditAddr(site.address || '')
  }

  const saveEdit = () => {
    if (!editName.trim()) return
    updateSiteDetails(editingSite.id, { name: editName, ownerName: editOwner, ownerPhone: editPhone, address: editAddr })
    setEditingSite(null)
  }

  return (
    <div className="screen">
      {/* Header */}
      <div className="t-header" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Logo — white circle so logo bg blends seamlessly, cover fills circle fully */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
            background: '#FFFFFF', flexShrink: 0,
            boxShadow: '0 0 0 1.5px var(--border)'
          }}>
            <img src="/logo.jpeg" alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div>
            <h1 className="t-heading" style={{ fontWeight: 800 }}>Radadiya Construction</h1>
            <p className="t-caption" style={{ textTransform: 'uppercase', letterSpacing: '0.25em', marginTop: 2 }}>VADODARA</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="screen-body" style={{ padding: '24px 20px 140px' }}>
        {sites.length === 0 ? (
          <EmptyState onAdd={() => setShowAddModal(true)} t={t} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Active Projects */}
            {activeSites.length > 0 && (
              <div>
                <p className="t-section-label">{t.activeSites} ({activeSites.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activeSites.map((site) => (
                    <ActiveSiteCard
                      key={site.id}
                      site={site}
                      total={getSiteTotal(site.id)}
                      onNavigate={onNavigate}
                      onEdit={openEdit}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Projects */}
            {completedSites.length > 0 && (
              <div>
                <p className="t-section-label">{t.completedSites} ({completedSites.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {completedSites.map((site) => (
                    <CompletedSiteCard
                      key={site.id}
                      site={site}
                      total={getSiteTotal(site.id)}
                      paymentsTotal={getSitePaymentsTotal(site.id)}
                      onNavigate={onNavigate}
                      onEdit={openEdit}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB — centred pill */}
      {sites.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 104, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none'
        }}>
          <button onClick={() => setShowAddModal(true)} className="btn-fab" style={{ pointerEvents: 'auto' }}>
            <Plus size={18} strokeWidth={3} />
            {t.newSite}
          </button>
        </div>
      )}

      {/* Add Site Modal */}
      {/* Edit Site Modal */}
      {editingSite && (
        <div className="t-overlay" onClick={() => setEditingSite(null)}>
          <div className="t-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 20px' }} />
            <h2 className="t-heading" style={{ marginBottom: 4, fontSize: 20 }}>Edit Site Details</h2>
            <p className="t-caption" style={{ marginBottom: 20 }}>Update name, client & contact info</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Site Name *</p>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="t-input" autoFocus />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Client Name</p>
                <input type="text" value={editOwner} onChange={e => setEditOwner(e.target.value)} className="t-input" placeholder="e.g. Ramesh Patel" />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Phone Number</p>
                <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={editPhone} onChange={e => setEditPhone(e.target.value.replace(/\D/g, '').slice(0,10))} className="t-input" placeholder="e.g. 9876543210" />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Address</p>
                <input type="text" value={editAddr} onChange={e => setEditAddr(e.target.value)} className="t-input" placeholder="e.g. Alkapuri, Vadodara" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={saveEdit} className="btn-fab-full" disabled={!editName.trim()}>Save Changes</button>
              <button onClick={() => setEditingSite(null)} style={{ height: 48, color: 'var(--text3)', fontWeight: 700, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddSiteModal
          siteName={newSiteName}
          ownerName={newOwnerName}
          ownerPhone={newOwnerPhone}
          address={newAddress}
          onSiteNameChange={setNewSiteName}
          onOwnerNameChange={setNewOwnerName}
          onOwnerPhoneChange={handlePhoneChange}
          onAddressChange={setNewAddress}
          onSubmit={handleAddSite}
          onClose={closeModal}
          t={t}
        />
      )}
    </div>
  )
}

function ActiveSiteCard({ site, total, onNavigate, onEdit, t }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div
      className="t-card"
      onClick={() => onNavigate('ledger', { siteId: site.id })}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: 'var(--card-bg)',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Status Badge - Reverted to top */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 6px', borderRadius: 4,
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            marginBottom: 6
          }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.1 }}>
                {site.name}
              </h2>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(site) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
                  borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)',
                  cursor: 'pointer', flexShrink: 0
                }}
              >
                <Edit2 size={11} color="var(--text3)" />
              </button>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0, overflowWrap: 'anywhere', wordBreak: 'break-all', lineHeight: 1.3 }}>{formatINR(total)}</p>
              <p className="t-caption" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 }}>{t.investment}</p>
            </div>
          </div>
          <div style={{ marginTop: -8 }}>
            <span className="t-caption" style={{ color: 'var(--text3)', fontSize: 10, lineHeight: 1 }}>
              {new Date(site.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {(site.ownerName || site.ownerPhone || site.address) && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {site.ownerName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={12} color="var(--text3)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.ownerName}</span>
            </div>
          )}
          {site.ownerPhone && (
            <a
              href={`tel:${site.ownerPhone}`}
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            >
              <Phone size={12} color="var(--text3)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{site.ownerPhone}</span>
            </a>
          )}
          {site.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <MapPin size={13} color="var(--text3)" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.address}</span>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('paymentLog', { siteId: site.id }) }}
          style={{
            flex: 1.3, height: 42, border: '1px solid var(--border)', borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            color: 'var(--text)', background: 'var(--bg3)'
          }}
        >
          {t.addPayment}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('siteSummary', { siteId: site.id }) }}
          style={{
            flex: 0.7, height: 42, borderRadius: 12, border: '1px solid var(--border)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            color: 'var(--text)', background: 'var(--bg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <BarChart3 size={15} />
          {t.summary}
        </button>
      </div>
    </div>
  )
}

function CompletedSiteCard({ site, total, paymentsTotal, onNavigate, onEdit, t }) {
  const balance = total - paymentsTotal
  const difference = paymentsTotal - total
  const [pressed, setPressed] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  return (
    <div
      onClick={() => onNavigate('ledger', { siteId: site.id })}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        padding: '14px 16px', borderRadius: 16, border: '1px solid var(--border)',
        background: 'rgba(34, 197, 94, 0.08)', cursor: 'pointer',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Status Badge - Reverted to top */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 6px', borderRadius: 4,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            marginBottom: 6
          }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text3)' }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completed
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.1 }}>
                {site.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(site) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26,
                  borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)',
                  cursor: 'pointer', flexShrink: 0
                }}
              >
                <Edit2 size={10} color="var(--text3)" />
              </button>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, overflow: 'hidden' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)', margin: 0, overflowWrap: 'anywhere', wordBreak: 'break-all', lineHeight: 1.3 }}>{formatINR(total)}</p>
              {balance > 0 ? (
                <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '1px 0 0' }}>Due: {formatINR(balance)}</p>
              ) : (
                <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 1 }}>Cleared ✓</p>
              )}
            </div>
          </div>
          {site.completedAt && (
            <p className="t-caption" style={{ marginTop: -8, fontSize: 10, lineHeight: 1 }}>
              {new Date(site.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </p>
          )}
        </div>
      </div>

      {(site.ownerName || site.ownerPhone) && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {site.ownerName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={12} color="var(--text3)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.ownerName}</span>
            </div>
          )}
          {site.ownerPhone && (
            <a
              href={`tel:${site.ownerPhone}`}
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            >
              <Phone size={12} color="var(--text3)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{site.ownerPhone}</span>
            </a>
          )}
        </div>
      )}

      {showSummary ? (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Total Expense</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{formatINR(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Total Received</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{formatINR(paymentsTotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Difference</span>
            <span style={{
              fontSize: 14,
              fontWeight: 800,
              color: difference > 0 ? '#22c55e' : difference < 0 ? '#ef4444' : 'var(--text3)'
            }}>
              {difference > 0 ? '+' : difference < 0 ? '-' : ''}{formatINR(Math.abs(difference))}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSummary(false) }}
            style={{
              marginTop: 14, width: '100%', height: 36, borderRadius: 8, border: '1px solid var(--border)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              color: 'var(--text2)', background: 'transparent'
            }}
          >
            Hide Summary
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSummary(true) }}
            style={{
              width: '60%', height: 42, borderRadius: 12, border: '1px solid var(--border)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              color: 'var(--text)', background: 'var(--bg3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <BarChart3 size={15} />
            See Summary
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyState({ onAdd, t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', padding: '0 32px' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', background: '#FFFFFF',
        boxShadow: '0 0 0 1.5px var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
      }}>
        <img src="/logo.jpeg" alt="Logo" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: '50%' }} />
      </div>
      <h2 className="t-heading" style={{ marginBottom: 10, fontSize: 20 }}>{t.noSites}</h2>
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 36 }}>{t.noSitesDesc}</p>
      <button onClick={onAdd} className="btn-primary" style={{ height: 56, padding: '0 36px', gap: 10, fontSize: 16 }}>
        <Plus size={18} strokeWidth={3} />
        {t.addFirstSite}
      </button>
    </div>
  )
}

function AddSiteModal({ siteName, ownerName, ownerPhone, address, onSiteNameChange, onOwnerNameChange, onOwnerPhoneChange, onAddressChange, onSubmit, onClose, t }) {
  return (
    <div className="t-overlay" onClick={onClose}>
      <div className="t-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 24px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="t-heading" style={{ fontSize: 20 }}>{t.newSiteTitle}</h2>
          <button onClick={onClose} className="btn-back"><X size={18} /></button>
        </div>

        {/* Scrollable fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '60vh', overflowY: 'auto', paddingBottom: 4 }}>

          {/* Site Name */}
          <div>
            <label className="t-section-label" style={{ display: 'block', marginBottom: 8 }}>{t.siteName} *</label>
            <input
              type="text"
              autoFocus
              value={siteName}
              onChange={(e) => onSiteNameChange(e.target.value)}
              placeholder={t.sitePlaceholder}
              className="t-input"
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="t-section-label" style={{ display: 'block', marginBottom: 8 }}>{t.ownerName}</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => onOwnerNameChange(e.target.value)}
              placeholder={t.ownerNamePlaceholder}
              className="t-input"
            />
          </div>

          {/* Phone — digits only, max 10 */}
          <div>
            <label className="t-section-label" style={{ display: 'block', marginBottom: 8 }}>{t.ownerPhone}</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={ownerPhone}
              onChange={(e) => onOwnerPhoneChange(e.target.value)}
              placeholder={t.ownerPhonePlaceholder}
              className="t-input"
            />
          </div>

          {/* Address */}
          <div>
            <label className="t-section-label" style={{ display: 'block', marginBottom: 8 }}>{t.siteAddress}</label>
            <textarea
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder={t.siteAddressPlaceholder}
              className="t-input"
              style={{ height: 80, paddingTop: 14, paddingBottom: 14 }}
            />
          </div>

        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onSubmit} disabled={!siteName.trim()} className="btn-fab-full">
            {t.createSite}
          </button>
          <button
            onClick={onClose}
            style={{ height: 48, fontWeight: 700, fontSize: 14, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}
