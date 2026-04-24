import { useState } from 'react'
import { Download, Trash2, Share2, ChevronRight, Moon, Sun, ArrowLeft, SmartphoneIcon, ShieldAlert, Check, Cloud, Database, Edit2, User, Lock, Fingerprint } from 'lucide-react'
import useStore from '../store/useStore'
import { formatINR } from '../utils/helpers'
import { registerBiometric, verifyBiometric } from '../utils/biometrics'
import { useLang } from '../App'
import { LANG_NAMES } from '../i18n/translations'

export default function SettingsScreen({ onNavigate, onBack }) {
  const {
    sites, clearAllData, deleteSite, exportData, generateWhatsAppSummary,
    getGrandTotal, getSiteTotal, theme, setTheme, language, setLanguage,
    syncConfig, setSyncConfig, profile, setProfile, appLock, setAppLock
  } = useStore()

  const lang = useLang()
  const [pinSetupModal, setPinSetupModal] = useState(false)
  const [tempPin, setTempPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [tempBio, setTempBio] = useState(true)
  const [disablePinModal, setDisablePinModal] = useState(false)
  const [disablePinInput, setDisablePinInput] = useState('')
  const [disableTarget, setDisableTarget] = useState(null)
  const [clearModal, setClearModal] = useState(false)
  const [deleteSiteId, setDeleteSiteId] = useState(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedShareSite, setSelectedShareSite] = useState('')
  const [syncModalOpen, setSyncModalOpen] = useState(false)
  const [dbUrl, setDbUrl] = useState(syncConfig?.url || '')
  const [dbToken, setDbToken] = useState(syncConfig?.token || '')
  
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [editProfileName, setEditProfileName] = useState(profile?.name || '')
  const [editProfilePhone, setEditProfilePhone] = useState(profile?.phone || '')
  const [editProfileAddress, setEditProfileAddress] = useState(profile?.address || '')

  const grandTotal = getGrandTotal()
  const siteToDelete = sites.find(s => s.id === deleteSiteId)
  const isDark = theme === 'dark'

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `radadiya-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleWhatsApp = () => {
    if (!selectedShareSite) return
    const msg = generateWhatsAppSummary(selectedShareSite)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    setShareModalOpen(false)
  }

  const row = (icon, label, sub, onClick) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, padding: '0 18px', width: '100%',
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
        cursor: 'pointer', color: 'var(--text)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ color: 'var(--text3)' }}>{icon}</div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{label}</p>
          {sub && <p style={{ fontSize: 11, color: 'var(--text3)', margin: '1px 0 0', fontWeight: 500 }}>{sub}</p>}
        </div>
      </div>
      <ChevronRight size={16} color="var(--text3)" />
    </button>
  )

  return (
    <div className="screen">
      <div className="t-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} className="btn-back">
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="t-heading">{lang.settingsTitle}</h1>
            <p className="t-caption" style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{lang.appSettings}</p>
          </div>
        </div>
      </div>

      <div className="screen-body" style={{ padding: '24px 20px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Profile */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '20px 18px',
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18,
            position: 'relative'
          }}>
            <button 
              onClick={() => {
                setEditProfileName(profile?.name || '')
                setEditProfilePhone(profile?.phone || '')
                setEditProfileAddress(profile?.address || '')
                setProfileModalOpen(true)
              }}
              style={{
                position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%',
                background: 'var(--bg)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <Edit2 size={14} color="var(--text3)" />
            </button>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
              background: 'var(--bg)', flexShrink: 0,
              boxShadow: '0 0 0 1.5px var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={24} color="var(--text3)" />
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.name || 'Your Name'}
              </p>
              <p className="t-caption" style={{ marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.15em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.address || 'Your Address'}
              </p>
              {profile?.phone && <p className="t-caption" style={{ marginTop: 1, color: 'var(--text3)' }}>{profile.phone}</p>}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '18px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, minWidth: 0, overflow: 'hidden' }}>
              <p className="t-caption" style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lang.totalSites}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{sites.length}</p>
            </div>
            <div style={{ padding: '18px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, minWidth: 0, overflow: 'hidden' }}>
              <p className="t-caption" style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lang.totalValue}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0, overflowWrap: 'anywhere', wordBreak: 'break-all', lineHeight: 1.35 }}>{formatINR(grandTotal)}</p>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <p className="t-section-label">{lang.appearance}</p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--bg)',
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {isDark ? <Moon size={17} color="var(--text)" /> : <Sun size={17} color="var(--text)" />}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                    {isDark ? lang.darkMode : lang.lightMode}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>{lang.toggleMode}</p>
                </div>
              </div>
              {/* Toggle Switch */}
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                style={{
                  width: 56, height: 30, borderRadius: 9999, padding: 3, cursor: 'pointer',
                  background: isDark ? 'var(--text)' : 'var(--border)', border: 'none',
                  display: 'flex', alignItems: 'center',
                  justifyContent: isDark ? 'flex-end' : 'flex-start',
                  transition: 'all 0.25s'
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: isDark ? 'var(--bg)' : 'var(--bg)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                }} />
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <p className="t-section-label">{lang.language}</p>
            <div style={{
              display: 'flex', padding: 4, background: 'var(--bg2)',
              border: '1px solid var(--border)', borderRadius: 14, gap: 4
            }}>
              {Object.entries(LANG_NAMES).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  style={{
                    flex: 1, height: 40, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: language === code ? 'var(--btn-bg)' : 'transparent',
                    color: language === code ? 'var(--btn-text)' : 'var(--text3)',
                    border: 'none', transition: 'all 0.2s'
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* App Security */}
          <div>
            <p className="t-section-label">App Security</p>
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 14, overflow: 'hidden'
            }}>
              {/* Main App Lock Toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', background: 'var(--bg)',
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Lock size={17} color="var(--text)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                      App Lock
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>
                      {appLock?.enabled ? 'PIN enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (appLock?.enabled) {
                      setDisableTarget('appLock')
                      setDisablePinModal(true)
                    } else {
                      setPinSetupModal(true)
                    }
                  }}
                  style={{
                    width: 56, height: 30, borderRadius: 9999, padding: 3, cursor: 'pointer',
                    background: appLock?.enabled ? 'var(--text)' : 'var(--border)', border: 'none',
                    display: 'flex', alignItems: 'center',
                    justifyContent: appLock?.enabled ? 'flex-end' : 'flex-start',
                    transition: 'all 0.25s'
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: appLock?.enabled ? 'var(--bg)' : 'var(--bg)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                  }} />
                </button>
              </div>

              {/* Secondary Biometrics Toggle (Only visible if App Lock is ON) */}
              {appLock?.enabled && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', borderTop: '1px solid var(--border)'
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Fingerprint</p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>Unlock faster with biometrics</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!appLock.useBiometrics) {
                        try {
                          const credentialId = await registerBiometric()
                          setAppLock({ useBiometrics: true, credentialId })
                        } catch (err) {
                          alert("Biometric setup failed or was cancelled.")
                        }
                      } else {
                        try {
                          await verifyBiometric(appLock.credentialId)
                          setAppLock({ useBiometrics: false, credentialId: null })
                        } catch (err) {
                          alert("Fingerprint is strictly required to disable this setting.")
                        }
                      }
                    }}
                    style={{
                      width: 50, height: 28, borderRadius: 9999, padding: 3, cursor: 'pointer',
                      background: appLock?.useBiometrics ? 'var(--text)' : 'var(--border)', border: 'none',
                      display: 'flex', alignItems: 'center',
                      justifyContent: appLock?.useBiometrics ? 'flex-end' : 'flex-start',
                      transition: 'all 0.25s'
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Manage Sites */}
          {sites.length > 0 && (
            <div>
              <p className="t-section-label">Project Administration</p>
              
              {sites.filter(s => s.status !== 'completed').length > 0 && (
                <div style={{ marginBottom: sites.filter(s => s.status === 'completed').length > 0 ? 24 : 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>Active Sites</p>
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                    {sites.filter(s => s.status !== 'completed').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((site, i) => (
                      <div key={site.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {site.name}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0', fontWeight: 500 }}>
                            {formatINR(getSiteTotal(site.id))}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginLeft: 10 }}>
                          <button
                            onClick={() => onNavigate('ledger', { siteId: site.id })}
                            style={{
                              height: 34, padding: '0 14px', borderRadius: 9999,
                              background: 'var(--btn-bg)', color: 'var(--btn-text)',
                              fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer'
                            }}
                          >
                            {lang.open}
                          </button>
                          <button
                            onClick={() => setDeleteSiteId(site.id)}
                            style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: 'var(--bg)', border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} color="var(--text3)" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sites.filter(s => s.status === 'completed').length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>Completed Sites</p>
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                    {sites.filter(s => s.status === 'completed').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((site, i) => (
                      <div key={site.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                        background: 'rgba(34, 197, 94, 0.08)'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {site.name}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0', fontWeight: 500 }}>
                            {formatINR(getSiteTotal(site.id))}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginLeft: 10 }}>
                          <button
                            onClick={() => onNavigate('ledger', { siteId: site.id })}
                            style={{
                              height: 34, padding: '0 14px', borderRadius: 9999,
                              background: 'var(--btn-bg)', color: 'var(--btn-text)',
                              fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer'
                            }}
                          >
                            {lang.open}
                          </button>
                          <button
                            onClick={() => setDeleteSiteId(site.id)}
                            style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: 'var(--bg)', border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} color="var(--text3)" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data */}
          <div>
            <p className="t-section-label">{lang.dataStorage}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {row(<Cloud size={18} />, 'Cloud Sync Setup', syncConfig?.url ? 'Connected to Turso' : 'Local Storage Only', () => setSyncModalOpen(true))}
              {row(<Share2 size={18} />, lang.shareSummary, null, () => setShareModalOpen(true))}
              {row(<Download size={18} />, lang.exportData, null, handleExport)}
              {row(<ShieldAlert size={18} />, lang.clearAll, lang.clearAllSub, () => setClearModal(true))}
            </div>
          </div>

          {/* App Info */}
          <div style={{
            padding: '24px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18,
            textAlign: 'center'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'var(--bg)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <SmartphoneIcon size={20} color="var(--text)" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>{lang.v1}</p>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 18px' }}>{lang.optimized}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {[lang.stable, lang.offlineReady].map(l => (
                <span key={l} style={{
                  padding: '4px 14px', background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 9999, fontSize: 10, fontWeight: 700, color: 'var(--text2)',
                  textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>{l}</span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {(deleteSiteId || clearModal) && (
        <ConfirmDeleteModal
          title={deleteSiteId ? lang.archiveSite : lang.resetApp}
          subtitle={deleteSiteId ? lang.archiveSiteDesc : lang.resetAppDesc}
          onConfirm={() => {
            if (deleteSiteId) { deleteSite(deleteSiteId); setDeleteSiteId(null) }
            else { clearAllData(); setClearModal(false) }
          }}
          onCancel={() => { setDeleteSiteId(null); setClearModal(false) }}
          lang={lang}
        />
      )}

      {shareModalOpen && (
        <div className="t-overlay" onClick={() => setShareModalOpen(false)}>
          <div className="t-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 24px' }} />
            <h2 className="t-heading" style={{ marginBottom: 20, fontSize: 20 }}>{lang.shareSummary}</h2>
            {sites.length === 0 ? (
              <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '32px 0' }}>{lang.noSites}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                  {sites.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedShareSite(s.id)}
                      style={{
                        height: 52, borderRadius: 12, padding: '0 18px', textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        background: selectedShareSite === s.id ? 'var(--btn-bg)' : 'var(--bg2)',
                        color: selectedShareSite === s.id ? 'var(--btn-text)' : 'var(--text)',
                        border: selectedShareSite === s.id ? 'none' : '1px solid var(--border)'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                      {selectedShareSite === s.id && <Check size={15} />}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={handleWhatsApp} disabled={!selectedShareSite} className="btn-fab-full">
                    <Share2 size={18} /> {lang.openWhatsApp}
                  </button>
                  <button onClick={() => setShareModalOpen(false)} style={{ height: 48, color: 'var(--text3)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                    {lang.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {profileModalOpen && (
        <div className="t-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="t-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 24px' }} />
            <h2 className="t-heading" style={{ marginBottom: 4, fontSize: 20 }}>Edit Profile</h2>
            <p className="t-caption" style={{ marginBottom: 20 }}>This information will appear on WhatsApp exports.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Contractor / Company Name *</label>
                <input
                  type="text" value={editProfileName} onChange={e => setEditProfileName(e.target.value)}
                  placeholder="e.g. Radadiya Construction" className="t-input"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Phone Number</label>
                <input
                  type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={editProfilePhone} onChange={e => setEditProfilePhone(e.target.value.replace(/\D/g, '').slice(0,10))}
                  placeholder="e.g. 9876543210" className="t-input"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Address / City</label>
                <input
                  type="text" value={editProfileAddress} onChange={e => setEditProfileAddress(e.target.value)}
                  placeholder="e.g. Vadodara, India" className="t-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                onClick={() => {
                  setProfile({ name: editProfileName || 'Construction Company', phone: editProfilePhone, address: editProfileAddress })
                  setProfileModalOpen(false)
                }} 
                className="btn-fab-full"
                disabled={!editProfileName.trim()}
              >
                Save Profile
              </button>
              <button onClick={() => setProfileModalOpen(false)} style={{ height: 48, color: 'var(--text3)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {syncModalOpen && (
        <div className="t-overlay" onClick={() => setSyncModalOpen(false)}>
          <div className="t-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 24px' }} />
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'var(--bg2)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <Database size={26} color="var(--text)" />
              </div>
              <h2 className="t-heading" style={{ marginBottom: 8, fontSize: 20 }}>Cloud Sync</h2>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
                Enter your Turso Database credentials to sync your data. Leave blank to run offline.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Database URL</label>
                <input
                  type="text" value={dbUrl} onChange={e => setDbUrl(e.target.value)}
                  placeholder="libsql://your-db.turso.io" className="t-input"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Auth Token</label>
                <input
                  type="password" value={dbToken} onChange={e => setDbToken(e.target.value)}
                  placeholder="eyJhbGciOiJFZERTQSIsInR..." className="t-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                onClick={async () => {
                  await setSyncConfig(dbUrl.trim(), dbToken.trim())
                  setSyncModalOpen(false)
                }} 
                className="btn-fab-full"
              >
                Save & Connect
              </button>
              <button onClick={() => setSyncModalOpen(false)} style={{ height: 48, color: 'var(--text3)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                {lang.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN SETUP MODAL */}
      {pinSetupModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end'
        }}>
          <div className="animate-slide-up" style={{
            background: 'var(--bg)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '24px 20px 40px', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>
              Set Up App Lock
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Enter and confirm your 4-digit PIN.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginLeft: 4, marginBottom: 8, display: 'block', letterSpacing: '0.05em' }}>
                  ENTER PIN
                </label>
                <input
                  type="number"
                  placeholder="****"
                  value={tempPin}
                  onChange={e => setTempPin(e.target.value.slice(0, 4))}
                  className="t-input"
                  autoFocus
                  style={{ width: '100%', textAlign: 'center', fontSize: 24, letterSpacing: '0.3em', height: 56, borderRadius: 16 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginLeft: 4, marginBottom: 8, display: 'block', letterSpacing: '0.05em' }}>
                  CONFIRM PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="****"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.slice(0, 4))}
                  className="t-input"
                  style={{ width: '100%', textAlign: 'center', fontSize: 24, letterSpacing: '0.3em', height: 56, borderRadius: 16 }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 14, marginBottom: 24
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Fingerprint</p>
                <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>Unlock faster with biometrics</p>
              </div>
              <button
                onClick={() => setTempBio(!tempBio)}
                style={{
                  width: 50, height: 28, borderRadius: 9999, padding: 3, cursor: 'pointer',
                  background: tempBio ? 'var(--text)' : 'var(--border)', border: 'none',
                  display: 'flex', alignItems: 'center',
                  justifyContent: tempBio ? 'flex-end' : 'flex-start',
                  transition: 'all 0.25s'
                }}
              >
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { 
                  setPinSetupModal(false); 
                  setTempPin(''); 
                  setConfirmPin('');
                  setPinStep(1);
                  setTempBio(true); 
                }}
                style={{
                  flex: 1, height: 48, borderRadius: 24, fontSize: 14, fontWeight: 700,
                  color: 'var(--text)', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (tempPin.length === 4 && confirmPin === tempPin) {
                    let credentialId = null
                    if (tempBio) {
                      try {
                        credentialId = await registerBiometric()
                      } catch (err) {
                        alert("Biometric registration failed or was cancelled. Falling back to PIN only.")
                      }
                    }
                    
                    setAppLock({ 
                      enabled: true, 
                      pin: tempPin, 
                      useBiometrics: !!credentialId,
                      credentialId 
                    })
                    setPinSetupModal(false)
                    setTempPin('')
                    setConfirmPin('')
                    setTempBio(true)
                    setTimeout(() => window.location.reload(), 150)
                  }
                }}
                style={{
                  flex: 1, height: 48, borderRadius: 24, fontSize: 14, fontWeight: 700,
                  color: 'var(--bg)', background: 'var(--text)', border: 'none', cursor: 'pointer',
                  opacity: (tempPin.length === 4 && confirmPin === tempPin) ? 1 : 0.5, 
                  transition: 'opacity 0.2s'
                }}
                disabled={tempPin.length !== 4 || confirmPin !== tempPin}
              >
                Save & Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN AUTHENTICATION MODAL (FOR DISABLING) */}
      {disablePinModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end'
        }}>
          <div className="animate-slide-up" style={{
            background: 'var(--bg)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '24px 20px 40px', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>Enter PIN</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Please enter your 4-digit PIN to authenticate.
            </p>
            <input
              type="number"
              placeholder="Enter 4-Digit PIN"
              value={disablePinInput}
              onChange={e => setDisablePinInput(e.target.value.slice(0, 4))}
              className="t-input"
              autoFocus
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.2em', marginBottom: 16 }}
            />
            {disableTarget === 'appLock' && appLock?.useBiometrics && window.PublicKeyCredential && (
              <button
                onClick={async () => {
                  try {
                    await verifyBiometric(appLock.credentialId)
                    setAppLock({ enabled: false, pin: '', useBiometrics: false, credentialId: null })
                    setDisablePinModal(false)
                    setDisablePinInput('')
                    setDisableTarget(null)
                  } catch (err) {
                    console.log('Biometric disable failed')
                  }
                }}
                style={{
                  width: '100%', height: 44, borderRadius: 22, marginBottom: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer'
                }}
              >
                <Fingerprint size={18} /> Use Fingerprint
              </button>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: !appLock?.useBiometrics || disableTarget !== 'appLock' ? 8 : 0 }}>
              <button
                onClick={() => {
                  setDisablePinModal(false)
                  setDisablePinInput('')
                  setDisableTarget(null)
                }}
                style={{
                  flex: 1, height: 48, borderRadius: 24, fontSize: 14, fontWeight: 700,
                  color: 'var(--text)', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (disablePinInput === appLock.pin) {
                    if (disableTarget === 'appLock') {
                      setAppLock({ enabled: false, pin: '', useBiometrics: false, credentialId: null })
                    } else if (disableTarget === 'biometrics') {
                      setAppLock({ useBiometrics: false, credentialId: null })
                    }
                    setDisablePinModal(false)
                    setDisablePinInput('')
                    setDisableTarget(null)
                  } else {
                    alert("Incorrect PIN")
                    setDisablePinInput('')
                  }
                }}
                style={{
                  flex: 1, height: 48, borderRadius: 24, fontSize: 14, fontWeight: 700,
                  color: 'var(--bg)', background: 'var(--text)', border: 'none', cursor: 'pointer',
                  opacity: disablePinInput.length === 4 ? 1 : 0.5, transition: 'opacity 0.2s'
                }}
                disabled={disablePinInput.length !== 4}
              >
                Authenticate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ConfirmDeleteModal({ title, subtitle, onConfirm, onCancel, lang }) {
  const [typed, setTyped] = useState('')
  const isReady = typed === 'CONFIRM'

  return (
    <div className="t-overlay" onClick={onCancel}>
      <div className="t-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)', margin: '0 auto 24px' }} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--bg2)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Trash2 size={26} color="var(--text)" />
          </div>
          <h2 className="t-heading" style={{ marginBottom: 8, fontSize: 20 }}>{title}</h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>{subtitle}</p>
        </div>
        <div style={{ padding: '14px 16px', background: 'var(--bg2)', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Type <span style={{ color: 'var(--text)', textDecoration: 'underline' }}>CONFIRM</span> to proceed
          </p>
        </div>
        <input
          type="text" value={typed} onChange={e => setTyped(e.target.value)}
          placeholder="CONFIRM" className="t-input"
          style={{ textAlign: 'center', fontWeight: 700, letterSpacing: '0.2em', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => { if (isReady) onConfirm() }} disabled={!isReady} className="btn-fab-full">
            {lang.deleteRecord || 'Delete Permanently'}
          </button>
          <button onClick={onCancel} style={{ height: 48, color: 'var(--text3)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
            {lang.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}
