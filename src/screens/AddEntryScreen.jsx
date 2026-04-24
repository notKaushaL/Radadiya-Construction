import { useState } from 'react'
import { 
  ArrowLeft, Save, Check, 
  User, Users, HardHat, BrickWall, LayoutGrid, Droplets, Zap, Hammer, PaintRoller, Paintbrush, Building, MoreHorizontal,
  Layers, Mountain, PaintBucket, Axe, Ruler, Package, Utensils, Home, Truck, Wrench
} from 'lucide-react'
import useStore from '../store/useStore'
import { useLang } from '../App'

const MATERIAL_PRESETS = [
  { label: 'Cement',  gu: 'સિમેન્ટ', hi: 'सीमेंट',  icon: Layers },
  { label: 'Steel',   gu: 'લોખંડ',   hi: 'स्टील',   icon: Building },
  { label: 'Sand',    gu: 'રેતી',     hi: 'रेती',    icon: Mountain },
  { label: 'Bricks',  gu: 'ઈંટો',    hi: 'ईंटें',   icon: BrickWall },
  { label: 'Paint',   gu: 'કલર',     hi: 'पेंट',    icon: PaintBucket },
  { label: 'Wood',    gu: 'લાકડું',   hi: 'लकड़ी',   icon: Axe },
  { label: 'Tiles',   gu: 'ટાઇલ્સ',  hi: 'टाइल्स',  icon: LayoutGrid },
  { label: 'Pipes',   gu: 'પાઇપ',    hi: 'पाइप',    icon: Ruler },
  { label: 'Gravel',  gu: 'કપચી',    hi: 'कंक्रीट', icon: Layers },
  { label: 'Other',   gu: 'બીજું',   hi: 'अन्य',    icon: Package },
]

const LABOR_PRESETS = [
  { label: 'Helper',           gu: 'હેલ્પર',          hi: 'हेल्पर',          id: 'helper',         icon: User },
  { label: 'Karigar',          gu: 'કારીગર',          hi: 'कारीगर',          id: 'karigar',        icon: HardHat },
  { label: 'Karigar + Helper', gu: 'કારીગર + હેલ્પર', hi: 'कारीगर + हेल्पर', id: 'karigar_helper', icon: Users },
  { label: 'Chantar Plaster',  gu: 'ચંતર પ્લાસ્ટર',   hi: 'चंतर प्लास्टर',    id: 'chantar_plaster',icon: BrickWall },
  { label: 'Salaat',           gu: 'સલાટ',            hi: 'सलाट',            id: 'salaat',         icon: LayoutGrid },
  { label: 'Plumber',          gu: 'પ્લમ્બર',         hi: 'प्लंबर',          id: 'plumber',        icon: Droplets },
  { label: 'Electrician',      gu: 'ઇલેક્ટ્રિશિયન',   hi: 'इलेक्ट्रीशियन',   id: 'electrician',    icon: Zap },
  { label: 'Carpenter',        gu: 'સુથાર',           hi: 'बढ़ई',            id: 'carpenter',      icon: Hammer },
  { label: 'Painter',          gu: 'પેઇન્ટર',         hi: 'पेंटर',           id: 'painter',        icon: PaintRoller },
  { label: 'POP',              gu: 'પી.ઓ.પી',         hi: 'पी.ओ.पी',         id: 'pop',            icon: Paintbrush },
  { label: 'Centering',        gu: 'સેન્ટરિંગ',       hi: 'सेंटरिंग',        id: 'centering',      icon: Building },
  { label: 'Others',           gu: 'બીજું',           hi: 'अन्य',            id: 'others',         icon: MoreHorizontal },
]

const MISC_PRESETS = [
  { label: 'Food',      gu: 'જમવાનું',   hi: 'खाना',       id: 'food',      icon: Utensils },
  { label: 'Rent',      gu: 'ભાડું',      hi: 'किराया',     id: 'rent',      icon: Home },
  { label: 'Transport', gu: 'ભાડું/ખર્ચ',hi: 'यातायात',    id: 'transport', icon: Truck },
  { label: 'Tools',     gu: 'સાધનો',    hi: 'उपकरण',      id: 'tools',     icon: Wrench },
  { label: 'Others',    gu: 'બીજું',    hi: 'अन्य',       id: 'others',    icon: MoreHorizontal },
]

const QUICK_AMOUNTS = [500, 600, 800, 1000, 1200, 1400, 1500, 2000]

export default function AddEntryScreen({ onNavigate, onBack, siteId, entryToEdit }) {
  const { sites, addEntry, updateEntry, language } = useStore()
  const site = sites.find((s) => s.id === siteId)
  const isEditing = !!entryToEdit
  const t = useLang()

  const [activeTab, setActiveTab] = useState(() => {
    if (!entryToEdit) return 'labor'
    return entryToEdit.type || 'labor'
  })
  const [laborPreset, setLaborPreset] = useState(() => {
    if (entryToEdit?.type === 'labor') {
      return LABOR_PRESETS.find(p => p.id === entryToEdit.category || p.label === entryToEdit.category) || LABOR_PRESETS[0]
    }
    return LABOR_PRESETS[0]
  })
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
  const [matInputType, setMatInputType] = useState(entryToEdit?.qty && entryToEdit?.unitPrice ? 'qty' : 'direct')
  const [miscPreset, setMiscPreset] = useState(() => {
    if (entryToEdit?.type === 'misc') {
      return MISC_PRESETS.find(p => p.id === entryToEdit.category || p.label === entryToEdit.category) || MISC_PRESETS[0]
    }
    return MISC_PRESETS[0]
  })
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

  const qtyTotal = (activeTab === 'material' && matInputType === 'qty' && parseFloat(qty) && parseFloat(unitPrice)) 
    ? parseFloat(qty) * parseFloat(unitPrice) 
    : null

  const handleSave = async () => {
    const finalAmount = (activeTab === 'material' && matInputType === 'qty') ? qtyTotal : parseFloat(amount)
    if (!finalAmount || finalAmount <= 0) return

    const category = activeTab === 'labor' ? laborPreset.label
      : activeTab === 'material' ? (matPreset.label === 'Other' ? customMat : matPreset.label)
      : miscPreset.label

    const data = {
      siteId, type: activeTab, category,
      amount: finalAmount, date, note,
      qty: (activeTab === 'material' && matInputType === 'qty') ? (parseFloat(qty) || null) : null,
      unitPrice: (activeTab === 'material' && matInputType === 'qty') ? (parseFloat(unitPrice) || null) : null,
      qtyDetail: (activeTab === 'material' && matInputType === 'qty' && qty && unitPrice) ? `${qty} × ₹${unitPrice}` : ''
    }

    if (isEditing) await updateEntry(entryToEdit.id, data)
    else await addEntry(data)
    onBack()
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {LABOR_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setLaborPreset(p)}
                    style={{
                      height: 64, padding: '8px 4px', borderRadius: 12,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      background: laborPreset.id === p.id ? 'var(--bg3)' : 'transparent',
                      color: laborPreset.id === p.id ? 'var(--text)' : 'var(--text3)',
                      border: laborPreset.id === p.id ? '1px solid var(--border)' : '1px solid transparent',
                      transition: 'all 0.15s'
                    }}
                  >
                    <p.icon size={20} strokeWidth={2} />
                    <span style={{ textAlign: 'center', lineHeight: 1.1 }}>{matLabel(p)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Material */}
          {activeTab === 'material' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {MATERIAL_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => setMatPreset(p)}
                      style={{
                        height: 64, padding: '8px 4px', borderRadius: 12,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: matPreset.label === p.label ? 'var(--bg3)' : 'transparent',
                        color: matPreset.label === p.label ? 'var(--text)' : 'var(--text3)',
                        border: matPreset.label === p.label ? '1px solid var(--border)' : '1px solid transparent',
                        transition: 'all 0.15s'
                      }}
                    >
                      <p.icon size={20} strokeWidth={2} />
                      <span style={{ textAlign: 'center', lineHeight: 1.1 }}>{matLabel(p)}</span>
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

              {/* Material Input Toggle */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setMatInputType('qty')}
                  style={{
                    flex: 1, height: 44, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    background: matInputType === 'qty' ? 'var(--bg2)' : 'transparent',
                    color: matInputType === 'qty' ? 'var(--text)' : 'var(--text3)',
                    border: matInputType === 'qty' ? '1px solid var(--border)' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s'
                  }}
                >
                  🧮 Qty × Price
                </button>
                <button
                  onClick={() => setMatInputType('direct')}
                  style={{
                    flex: 1, height: 44, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    background: matInputType === 'direct' ? 'var(--bg2)' : 'transparent',
                    color: matInputType === 'direct' ? 'var(--text)' : 'var(--text3)',
                    border: matInputType === 'direct' ? '1px solid var(--border)' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s'
                  }}
                >
                  ₹ Direct Amount
                </button>
              </div>

              {matInputType === 'qty' && (
                <div style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '16px', marginTop: 4
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                        {t.qtyLabel}
                      </p>
                      <input 
                        type="number" onWheel={e => e.target.blur()} 
                        value={qty} onChange={e => setQty(e.target.value)} 
                        placeholder="0" 
                        style={{
                          width: '100%', height: 48, borderRadius: 12, border: '1px solid var(--border)',
                          background: 'var(--bg)', color: 'var(--text)', fontSize: 18, fontWeight: 700,
                          padding: '0 16px', outline: 'none'
                        }} 
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                        ₹ {t.priceLabel}
                      </p>
                      <input 
                        type="number" onWheel={e => e.target.blur()} 
                        value={unitPrice} onChange={e => setUnitPrice(e.target.value)} 
                        placeholder="0" 
                        style={{
                          width: '100%', height: 48, borderRadius: 12, border: '1px solid var(--border)',
                          background: 'var(--bg)', color: 'var(--text)', fontSize: 18, fontWeight: 700,
                          padding: '0 16px', outline: 'none'
                        }} 
                      />
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 16px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      TOTAL SPENT
                    </span>
                    <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                      ₹{qtyTotal ? qtyTotal.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Misc */}
          {activeTab === 'misc' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {MISC_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setMiscPreset(p)}
                    style={{
                      height: 64, padding: '8px 4px', borderRadius: 12,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      background: miscPreset.id === p.id ? 'var(--bg3)' : 'transparent',
                      color: miscPreset.id === p.id ? 'var(--text)' : 'var(--text3)',
                      border: miscPreset.id === p.id ? '1px solid var(--border)' : '1px solid transparent',
                      transition: 'all 0.15s'
                    }}
                  >
                    <p.icon size={20} strokeWidth={2} />
                    <span style={{ textAlign: 'center', lineHeight: 1.1 }}>{matLabel(p)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount (when no qty×price) */}
          {!(activeTab === 'material' && matInputType === 'qty') && (
            <div>
              <p className="t-section-label">AMOUNT (₹) *</p>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 20, fontWeight: 700, color: 'var(--text3)'
                }}>₹</span>
                <input
                  type="number" onWheel={e => e.target.blur()} value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0" className="t-input"
                  style={{ paddingLeft: 42, fontSize: 22, fontWeight: 700 }}
                />
              </div>

              {/* Quick Amounts */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmount(String(amt))}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
                      background: amount === String(amt) ? 'var(--bg2)' : 'transparent',
                      color: amount === String(amt) ? 'var(--text)' : 'var(--text2)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: '1 1 calc(25% - 8px)', minWidth: 60
                    }}
                  >
                    ₹{amt}
                  </button>
                ))}
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
