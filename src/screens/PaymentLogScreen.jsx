import { useState } from 'react'
import { ArrowLeft, Save, CreditCard, Banknote, Smartphone } from 'lucide-react'
import useStore from '../store/useStore'
import { useLang } from '../App'

export default function PaymentLogScreen({ onNavigate, siteId }) {
  const { sites, addPayment } = useStore()
  const site = sites.find(s => s.id === siteId)
  const t = useLang()

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  if (!site) {
    return (
      <div className="screen">
        <div className="t-header">
          <button onClick={() => onNavigate('home')} className="btn-back"><ArrowLeft size={19} /></button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    await addPayment({ siteId, amount: parseFloat(amount), method, date, note })
    onNavigate('siteSummary', { siteId })
  }

  const methods = [
    { id: 'cash', label: t.cash, Icon: Banknote },
    { id: 'bank', label: t.bankTransfer, Icon: CreditCard },
    { id: 'upi', label: t.upi, Icon: Smartphone },
  ]

  return (
    <div className="screen">
      <div className="t-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => onNavigate('siteSummary', { siteId })} className="btn-back">
            <ArrowLeft size={19} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="t-heading" style={{ fontSize: 20 }}>{t.logPayment}</h1>
            <p className="t-caption" style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.12em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.name}</p>
          </div>
        </div>
      </div>

      <div className="screen-body" style={{ padding: '28px 20px 120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Amount */}
          <div>
            <p className="t-section-label">{t.amountReceived}</p>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                fontSize: 22, fontWeight: 700, color: 'var(--text3)'
              }}>₹</span>
              <input
                type="number" autoFocus value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="t-input"
                style={{ paddingLeft: 44, height: 72, fontSize: 28, fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Method */}
          <div>
            <p className="t-section-label">{t.paymentMethod}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {methods.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '16px 8px', borderRadius: 14,
                    background: method === id ? 'var(--btn-bg)' : 'var(--bg2)',
                    color: method === id ? 'var(--btn-text)' : 'var(--text2)',
                    border: method === id ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <Icon size={20} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="t-section-label">{t.dateOfReceipt}</p>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              className="t-input"
            />
          </div>

          {/* Note */}
          <div>
            <p className="t-section-label">{t.referenceNote}</p>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder={t.notePlaceholderPayment}
              className="t-input"
              style={{ height: 100, paddingTop: 16, paddingBottom: 16 }}
            />
          </div>

        </div>
      </div>

      {/* FAB */}
      <div style={{
        position: 'fixed', bottom: 100, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none'
      }}>
        <button
          onClick={handleSave}
          disabled={!amount || parseFloat(amount) <= 0}
          className="btn-fab"
          style={{ pointerEvents: 'auto', minWidth: 200 }}
        >
          <Save size={18} />
          {t.savePaymentLog}
        </button>
      </div>
    </div>
  )
}
