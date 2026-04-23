import { ArrowLeft, TrendingUp, Trash2, Calendar, FileText, Wallet } from 'lucide-react'
import useStore from '../store/useStore'
import { formatINR } from '../utils/helpers'
import { useLang } from '../App'

export default function SiteSummaryScreen({ onNavigate, siteId }) {
  const { sites, getSiteTotal, getSitePaymentsTotal, getSitePayments, deletePayment } = useStore()
  const t = useLang()

  const site = sites.find(s => s.id === siteId)
  if (!site) {
    return (
      <div className="screen">
        <div className="t-header">
          <button onClick={() => onNavigate('home')} className="btn-back"><ArrowLeft size={19} /></button>
        </div>
      </div>
    )
  }

  const totalExpense = getSiteTotal(siteId)
  const totalReceived = getSitePaymentsTotal(siteId)
  const balance = totalExpense - totalReceived
  const payments = getSitePayments(siteId)

  return (
    <div className="screen">
      <div className="t-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => onNavigate('home')} className="btn-back">
            <ArrowLeft size={19} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="t-heading" style={{ fontSize: 19, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {site.name}
            </h1>
            <p className="t-caption" style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t.projectReport}</p>
          </div>
        </div>
      </div>

      <div className="screen-body" style={{ padding: '20px 20px 140px' }}>
        {/* Hero Financial Card */}
        <div style={{
          background: 'var(--btn-bg)', color: 'var(--btn-text)',
          borderRadius: 20, padding: '28px 24px', marginBottom: 28
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5, margin: '0 0 6px' }}>
            {t.totalSpent}
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 24px' }}>
            {formatINR(totalExpense)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 20, borderTop: '1px solid rgba(128,128,128,0.2)' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, margin: '0 0 4px' }}>
                {t.fundsReceived}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{formatINR(totalReceived)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, margin: '0 0 4px' }}>
                {balance >= 0 ? t.balancePayable : t.surplusCredit}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{formatINR(Math.abs(balance))}</p>
            </div>
          </div>
        </div>

        {/* Payment Ledger */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="t-section-label" style={{ marginBottom: 0 }}>{t.paymentLedger}</p>
            <Wallet size={15} color="var(--text3)" />
          </div>

          {payments.length === 0 ? (
            <div style={{
              padding: '40px 20px', textAlign: 'center',
              border: '1.5px dashed var(--border)', borderRadius: 16
            }}>
              <ArrowDownCircle size={28} color="var(--text3)" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text3)', margin: 0 }}>{t.noEntries}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {payments.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: 'var(--card-bg)',
                    border: '1px solid var(--border)', borderRadius: 14
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{formatINR(p.amount)}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                        padding: '2px 8px', borderRadius: 9999,
                        background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)'
                      }}>
                        {p.method}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} color="var(--text3)" />
                        <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>
                          {new Date(p.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {p.note && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
                          <FileText size={11} color="var(--text3)" />
                          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.note}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePayment(p.id)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'var(--bg2)',
                      border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', marginLeft: 10, flexShrink: 0
                    }}
                  >
                    <Trash2 size={13} color="var(--text3)" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  )
}
