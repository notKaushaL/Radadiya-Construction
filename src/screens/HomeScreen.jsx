import { useState } from 'react'
import { Plus, User, Phone, ArrowRight, X, MapPin, BarChart3 } from 'lucide-react'
import useStore from '../store/useStore'
import { formatINR } from '../utils/helpers'
import { useLang } from '../App'

export default function HomeScreen({ onNavigate }) {
  const { sites, addSite, getSiteTotal, getSitePaymentsTotal } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSiteName, setNewSiteName] = useState('')
  const [newOwnerName, setNewOwnerName] = useState('')
  const [newOwnerPhone, setNewOwnerPhone] = useState('')
  const [newAddress, setNewAddress] = useState('')
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

function ActiveSiteCard({ site, total, onNavigate, t }) {
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
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {site.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <span className="t-caption" style={{ color: 'var(--text3)' }}>
              {new Date(site.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{formatINR(total)}</p>
          <p className="t-caption" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{t.investment}</p>
        </div>
      </div>

      {(site.ownerName || site.ownerPhone || site.address) && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {site.ownerName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={13} color="var(--text3)" />
              <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.ownerName}</span>
            </div>
          )}
          {site.ownerPhone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={13} color="var(--text3)" />
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{site.ownerPhone}</span>
            </div>
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
            color: 'var(--text)', background: 'var(--bg2)'
          }}
        >
          {t.addPayment}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('siteSummary', { siteId: site.id }) }}
          style={{
            flex: 0.7, height: 42, borderRadius: 12, border: '1px solid var(--border)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            color: 'var(--text)', background: 'var(--bg2)',
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

function CompletedSiteCard({ site, total, paymentsTotal, onNavigate, t }) {
  const balance = total - paymentsTotal
  const [pressed, setPressed] = useState(false)

  return (
    <div
      onClick={() => onNavigate('ledger', { siteId: site.id })}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 18px', borderRadius: 16, border: '1px solid var(--border)',
        background: 'rgba(34, 197, 94, 0.08)', cursor: 'pointer',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {site.name}
          </span>
        </div>
        {site.completedAt && (
          <p className="t-caption" style={{ marginTop: 2 }}>
            {new Date(site.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </p>
        )}
      </div>
      <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text2)', margin: 0 }}>{formatINR(total)}</p>
        <p style={{ fontSize: 10, fontWeight: 700, color: balance > 0 ? 'var(--text)' : 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
          {balance > 0 ? `Due: ${formatINR(balance)}` : 'Cleared'}
        </p>
      </div>
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
