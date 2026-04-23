import { useState } from 'react'
import { ArrowLeft, Save, Check } from 'lucide-react'
import useStore from '../store/useStore'
import { useLang } from '../App'

const MATERIAL_PRESETS = [
  { label: 'Cement',  gu: 'સિમેન્ટ', hi: 'सीमेंट',  icon: '🧱' },
  { label: 'Steel',   gu: 'લોખંડ',   hi: 'स्टील',   icon: '🏗️' },
  { label: 'Sand',    gu: 'રેતી',     hi: 'रेती',    icon: '⏳' },
  { label: 'Bricks',  gu: 'ઈંટો',    hi: 'ईंटें',   icon: '🧱' },
  { label: 'Paint',   gu: 'કલર',     hi: 'पेंट',    icon: '🎨' },
  { label: 'Wood',    gu: 'લાકડું',   hi: 'लकड़ी',   icon: '🪵' },
  { label: 'Tiles',   gu: 'ટાઇલ્સ',  hi: 'टाइल्स',  icon: '🔲' },
  { label: 'Pipes',   gu: 'પાઇપ',    hi: 'पाइप',    icon: '🚰' },
  { label: 'Gravel',  gu: 'કપચી',    hi: 'कंक्रीट', icon: '🪨' },
  { label: 'Other',   gu: 'બીજું',   hi: 'अन्य',    icon: '📦' },
]

const LABOR_CATS = ['majur','karigar','mason','plumber','electrician','carpenter','painter','welder','salaat','helper']
const MISC_CATS  = ['food','rent','transport','tools','others']

export default function AddEntryScreen({ onNavigate, onBack, siteId, entryToEdit }) {
  const { sites, addEntry, updateEntry, language } = useStore()
  const site = sites.find((s) => s.id === siteId)
  const isEditing = !!entryToEdit
  const t = useLang()

  const [activeTab, setActiveTab] = useState(() => {
    if (!entryToEdit) return 'labor'
    return entryToEdit.type || 'labor'
  })
  const [laborCat, setLaborCat] = useState(entryToEdit?.type === 'labor' ? entryToEdit.category : 'majur')
  const [matPreset, setMatPreset] = useState(() => {
    if (entryToEdit?.type === 'material') {
      return MATERIAL_PRESETS.find(p => p.label === entryToEdit.category) || MATERIAL_PRESETS[9]
    }
    return MATERIAL_PRESETS[0]
  })
  const [customMat, setCustomMat] = useState(
    entryToEdit?.type === 'material' && !MATERIAL_PRESETS.find(p => p.label === entryToEdit.category)
      ? entryToEdit.category : ''
  )
  const [miscCat, setMiscCat] = useState(entryToEdit?.type === 'misc' ? entryToEdit.category : 'food')
  const [qty, setQty] = useState(entryToEdit?.qty ? String(entryToEdit.qty) : '')
  const [unitPrice, setUnitPrice] = useState(entryToEdit?.unitPrice ? String(entryToEdit.unitPrice) : '')
  const [amount, setAmount] = useState(entryToEdit?.amount ? String(entryToEdit.amount) : '')
  const [date, setDate] = useState(entryToEdit?.date || new Date().toISOString().split('T')[0])
  const [note, setNote] = useState(entryToEdit?.note || '')

  if (!site) {
    return (
      <div className="screen">
        <div className="t-header">
          <button onClick={onBack} className="btn-back"><ArrowLeft size={19} /></button>
        </div>
      </div>
    )
  }

  const qtyTotal = parseFloat(qty) && parseFloat(unitPrice) ? parseFloat(qty) * parseFloat(unitPrice) : null

  const handleSave = async () => {
    const finalAmount = qtyTotal ?? parseFloat(amount)
    if (!finalAmount || finalAmount <= 0) return

    const category = activeTab === 'labor' ? t[laborCat] || laborCat
      : activeTab === 'material' ? (matPreset.label === 'Other' ? customMat : matPreset.label)
      : t[miscCat] || miscCat

    const data = {
      siteId, type: activeTab, category,
      amount: finalAmount, date, note,
      qty: parseFloat(qty) || null,
      unitPrice: parseFloat(unitPrice) || null,
      qtyDetail: qty && unitPrice ? `${qty} × ₹${unitPrice}` : ''
    }

    if (isEditing) await updateEntry(entryToEdit.id, data)
    else await addEntry(data)
    onNavigate('ledger', { siteId })
  }

  const tabBtn = (id, label) => (
    <button
      key={id}
      onClick={() => { setActiveTab(id); setAmount('') }}
      style={{
        flex: 1, height: 42, borderRadius: 9999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        background: activeTab === id ? 'var(--btn-bg)' : 'transparent',
        color: activeTab === id ? 'var(--btn-text)' : 'var(--text3)',
        border: 'none', transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  )

  const catBtn = (key, label, isActive, onClick) => (
    <button
      key={key}
      onClick={onClick}
      style={{
        height: 52, padding: '0 14px', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        background: isActive ? 'var(--btn-bg)' : 'var(--bg2)',
        color: isActive ? 'var(--btn-text)' : 'var(--text)',
        border: isActive ? 'none' : '1px solid var(--border)',
        transition: 'all 0.15s'
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{label}</span>
      {isActive && <Check size={14} style={{ flexShrink: 0, marginLeft: 4 }} />}
    </button>
  )

  const matLabel = (p) => language === 'gu' ? p.gu : language === 'hi' ? p.hi : p.label

  return (
    <div className="screen">
      {/* Header */}
      <div className="t-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button onClick={onBack} className="btn-back">
            <ArrowLeft size={19} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="t-heading" style={{ fontSize: 20 }}>{isEditing ? t.editEntry : t.addEntry}</h1>
            <p className="t-caption" style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.name}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', padding: 4, background: 'var(--bg2)',
          border: '1px solid var(--border)', borderRadius: 9999, gap: 2
        }}>
          {tabBtn('labor', t.labor)}
          {tabBtn('material', t.material)}
          {tabBtn('misc', t.misc)}
        </div>
      </div>

      <div className="screen-body" style={{ padding: '20px 20px 120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Labor */}
          {activeTab === 'labor' && (
            <div>
              <p className="t-section-label">{t.laborType}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {LABOR_CATS.map(cat => catBtn(cat, t[cat] || cat, laborCat === cat, () => setLaborCat(cat)))}
              </div>
            </div>
          )}

          {/* Material */}
          {activeTab === 'material' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p className="t-section-label">{t.materialType}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {MATERIAL_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => setMatPreset(p)}
                      style={{
                        height: 52, padding: '0 14px', borderRadius: 12,
                        display: 'flex', alignItems: 'center', gap: 10,
                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        background: matPreset.label === p.label ? 'var(--btn-bg)' : 'var(--bg2)',
                        color: matPreset.label === p.label ? 'var(--btn-text)' : 'var(--text)',
                        border: matPreset.label === p.label ? 'none' : '1px solid var(--border)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{p.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{matLabel(p)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {matPreset.label === 'Other' && (
                <div>
                  <p className="t-section-label">{t.materialName}</p>
                  <input
                    type="text" value={customMat} onChange={e => setCustomMat(e.target.value)}
                    placeholder={t.customMatPlaceholder} className="t-input"
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p className="t-section-label">{t.qtyLabel}</p>
                  <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" className="t-input" />
                </div>
                <div>
                  <p className="t-section-label">{t.priceLabel}</p>
                  <input type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="0" className="t-input" />
                </div>
              </div>

              {qtyTotal && (
                <div style={{
                  padding: '14px 18px', background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{qty} × ₹{unitPrice}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>= ₹{qtyTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          )}

          {/* Misc */}
          {activeTab === 'misc' && (
            <div>
              <p className="t-section-label">{t.category}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {MISC_CATS.map(cat => catBtn(cat, t[cat] || cat, miscCat === cat, () => setMiscCat(cat)))}
              </div>
            </div>
          )}

          {/* Amount (when no qty×price) */}
          {!(activeTab === 'material' && qtyTotal) && (
            <div>
              <p className="t-section-label">{t.amount}</p>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 20, fontWeight: 700, color: 'var(--text3)'
                }}>₹</span>
                <input
                  type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0" className="t-input"
                  style={{ paddingLeft: 42, fontSize: 22, fontWeight: 700 }}
                />
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <p className="t-section-label">{t.date}</p>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="t-input" />
          </div>

          {/* Note */}
          <div>
            <p className="t-section-label">{t.note}</p>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder={t.notePlaceholder} className="t-input"
              style={{ height: 100, paddingTop: 16, paddingBottom: 16 }}
            />
          </div>

        </div>
      </div>

      {/* FAB Save */}
      <div style={{
        position: 'fixed', bottom: 100, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none'
      }}>
        <button
          onClick={handleSave}
          disabled={!(qtyTotal || parseFloat(amount) > 0)}
          className="btn-fab"
          style={{ pointerEvents: 'auto', minWidth: 180 }}
        >
          <Save size={18} />
          {t.save}
        </button>
      </div>
    </div>
  )
}
