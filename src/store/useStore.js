import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from '../utils/nanoid'
import { client, initDbClient, initDbSchema } from '../db/setup'

// Safe wrapper for cloud execution
const executeCloud = async (sqlOrObj) => {
  if (!client) return
  try {
    await client.execute(sqlOrObj)
  } catch (error) {
    console.error('Cloud Sync Error:', error)
  }
}

/**
 * RADADIYA CONSTRUCTION — ZUSTAND STORE with Turso Cloud Sync
 */

const useStore = create(
  persist(
    (set, get) => ({
      // ─── STATE ─────────────────────────────────────────────
      sites: [],
      entries: [],
      payments: [],
      theme: 'light',
      language: 'en',
      lastSync: null,
      profile: { name: 'Radadiya Construction', phone: '', address: 'VADODARA · INDIA' },
      
      setProfile: (profile) => set({ profile }),

      appLock: { enabled: false, pin: '', useBiometrics: false, credentialId: null },
      setAppLock: (config) => set(state => ({ appLock: { ...state.appLock, ...config } })),
      
      syncConfig: { url: '', token: '' },
      setSyncConfig: async (url, token) => {
        set({ syncConfig: { url, token } })
        await get().loadFromCloud()
      },

      // ─── CLOUD SYNC ─────────────────────────────────────────
      loadFromCloud: async () => {
        const { syncConfig } = get()
        if (!syncConfig.url || !syncConfig.token) {
          console.log('No Turso keys found. Running in offline LocalStorage mode.')
          return
        }

        const success = initDbClient(syncConfig.url, syncConfig.token)
        if (!success) return

        await initDbSchema()
        if (!client) return

        try {
          const sitesRes    = await client.execute("SELECT * FROM sites")
          const entriesRes  = await client.execute("SELECT * FROM entries")
          const paymentsRes = await client.execute("SELECT * FROM payments")

          const cloudSites = sitesRes.rows.map(r => ({
            id:         r.id,
            name:       r.name        || '',
            createdAt:  r.createdAt   || new Date().toISOString(),
            status:     r.status      || 'active',   // ← default active so HomeScreen shows them
            ownerName:  r.ownerName   || '',
            ownerPhone: r.ownerPhone  || '',
            address:    r.address     || '',
            completedAt: r.completedAt || null,
          }))

          const cloudEntries = entriesRes.rows.map(r => ({
            id:        r.id,
            siteId:    r.siteId,
            type:      r.type      || 'labor',
            category:  r.category  || '',
            amount:    parseFloat(r.amount) || 0,
            date:      r.date      || '',
            note:      r.note      || '',
            qty:       r.qty       ? parseFloat(r.qty) : null,
            unitPrice: r.unitPrice ? parseFloat(r.unitPrice) : null,
            qtyDetail: r.qtyDetail || '',
            createdAt: r.createdAt || '',
          }))

          const cloudPayments = paymentsRes.rows.map(r => ({
            id:        r.id,
            siteId:    r.siteId,
            amount:    parseFloat(r.amount) || 0,
            method:    r.method    || 'cash',
            date:      r.date      || '',
            note:      r.note      || '',
            createdAt: r.createdAt || '',
          }))

          // Merge strategy: prefer cloud if it has data, otherwise keep local.
          // This protects against wiping local data when cloud is empty/unreachable.
          const localSites = get().sites
          set({
            sites:    cloudSites.length    > 0 ? cloudSites    : localSites,
            entries:  cloudEntries.length  > 0 ? cloudEntries  : get().entries,
            payments: cloudPayments.length > 0 ? cloudPayments : get().payments,
            lastSync: new Date().toISOString()
          })

          // If local had data that cloud doesn't, push local → cloud
          if (cloudSites.length === 0 && localSites.length > 0) {
            console.log('Cloud empty — pushing local data to cloud...')
            for (const site of localSites) {
              await executeCloud({
                sql: `INSERT OR IGNORE INTO sites
                      (id, name, createdAt, status, ownerName, ownerPhone, address, completedAt)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  site.id, site.name, site.createdAt,
                  site.status || 'active',
                  site.ownerName || '', site.ownerPhone || '',
                  site.address || '', site.completedAt || null
                ]
              })
            }
          }

          console.log(`Cloud sync: ${cloudSites.length} sites, ${cloudEntries.length} entries`)
        } catch (error) {
          console.error('Failed to load from cloud (using local data):', error)
          // Don't wipe local state — just continue with what we have
        }
      },

      // ─── THEME & LANGUAGE ───────────────────────────────────
      setTheme:    (t) => set({ theme: t }),
      setLanguage: (l) => set({ language: l }),

      // ─── SITE ACTIONS ───────────────────────────────────────
      addSite: async ({ name, ownerName, ownerPhone, address }) => {
        const site = {
          id:          nanoid(),
          name:        name.trim(),
          createdAt:   new Date().toISOString(),
          status:      'active',
          ownerName:   ownerName  || '',
          ownerPhone:  ownerPhone || '',
          address:     address    || '',
          completedAt: null,
        }

        // Optimistic local update first
        set((state) => ({ sites: [...state.sites, site] }))

        // Cloud sync — INSERT ALL columns so they survive reload
        await executeCloud({
          sql: `INSERT OR IGNORE INTO sites
                (id, name, createdAt, status, ownerName, ownerPhone, address, completedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            site.id, site.name, site.createdAt,
            site.status, site.ownerName, site.ownerPhone,
            site.address, site.completedAt
          ]
        })

        return site.id
      },

      setSiteStatus: async (siteId, status) => {
        const completedAt = status === 'completed' ? new Date().toISOString() : null
        set((state) => ({
          sites: state.sites.map(s =>
            s.id === siteId ? { ...s, status, completedAt } : s
          )
        }))
        await executeCloud({
          sql: "UPDATE sites SET status = ?, completedAt = ? WHERE id = ?",
          args: [status, completedAt, siteId]
        })
      },

      updateSiteName: async (siteId, name) => {
        if (!name?.trim()) return
        set((state) => ({
          sites: state.sites.map(s => s.id === siteId ? { ...s, name: name.trim() } : s)
        }))
        await executeCloud({
          sql: "UPDATE sites SET name = ? WHERE id = ?",
          args: [name.trim(), siteId]
        })
      },

      // Update name, client, phone, address together
      updateSiteDetails: async (siteId, { name, ownerName, ownerPhone, address }) => {
        if (!name?.trim()) return
        set((state) => ({
          sites: state.sites.map(s =>
            s.id === siteId
              ? { ...s, name: name.trim(), ownerName: ownerName?.trim() || '', ownerPhone: ownerPhone?.trim() || '', address: address?.trim() || '' }
              : s
          )
        }))
        await executeCloud({
          sql: "UPDATE sites SET name = ?, ownerName = ?, ownerPhone = ?, address = ? WHERE id = ?",
          args: [name.trim(), ownerName?.trim() || '', ownerPhone?.trim() || '', address?.trim() || '', siteId]
        })
      },

      deleteSite: async (siteId) => {
        set((state) => ({
          sites:    state.sites.filter(s    => s.id     !== siteId),
          entries:  state.entries.filter(e  => e.siteId !== siteId),
          payments: state.payments.filter(p => p.siteId !== siteId),
        }))
        await executeCloud({ sql: "DELETE FROM sites WHERE id = ?", args: [siteId] })
      },

      // ─── ENTRY ACTIONS ──────────────────────────────────────
      addEntry: async (data) => {
        const entry = {
          id:        nanoid(),
          siteId:    data.siteId,
          type:      data.type,
          category:  data.category,
          amount:    parseFloat(data.amount) || 0,
          date:      data.date || new Date().toISOString().split('T')[0],
          note:      data.note?.trim() || '',
          qty:       data.qty       || null,
          unitPrice: data.unitPrice || null,
          qtyDetail: data.qtyDetail || '',
          createdAt: new Date().toISOString(),
        }

        set((state) => ({ entries: [...state.entries, entry] }))

        await executeCloud({
          sql: `INSERT OR IGNORE INTO entries
                (id, siteId, type, category, amount, date, note, qty, unitPrice, qtyDetail, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            entry.id, entry.siteId, entry.type, entry.category,
            entry.amount, entry.date, entry.note,
            entry.qty, entry.unitPrice, entry.qtyDetail, entry.createdAt
          ]
        })

        return entry.id
      },

      updateEntry: async (entryId, data) => {
        set((state) => ({
          entries: state.entries.map(e =>
            e.id === entryId
              ? { ...e, ...data, amount: parseFloat(data.amount) || e.amount }
              : e
          )
        }))
        await executeCloud({
          sql: `UPDATE entries SET
                type=?, category=?, amount=?, date=?, note=?,
                qty=?, unitPrice=?, qtyDetail=?
                WHERE id=?`,
          args: [
            data.type, data.category, parseFloat(data.amount),
            data.date, data.note || '',
            data.qty || null, data.unitPrice || null, data.qtyDetail || '',
            entryId
          ]
        })
      },

      deleteEntry: async (entryId) => {
        set((state) => ({ entries: state.entries.filter(e => e.id !== entryId) }))
        await executeCloud({ sql: "DELETE FROM entries WHERE id = ?", args: [entryId] })
      },

      // ─── PAYMENT ACTIONS ────────────────────────────────────
      addPayment: async ({ siteId, amount, method, date, note }) => {
        const payment = {
          id:        nanoid(),
          siteId,
          amount:    parseFloat(amount) || 0,
          method:    method || 'cash',
          date:      date || new Date().toISOString().split('T')[0],
          note:      note?.trim() || '',
          createdAt: new Date().toISOString(),
        }

        set((state) => ({ payments: [...state.payments, payment] }))

        await executeCloud({
          sql: `INSERT OR IGNORE INTO payments
                (id, siteId, amount, method, date, note, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [payment.id, payment.siteId, payment.amount, payment.method, payment.date, payment.note, payment.createdAt]
        })

        return payment.id
      },

      deletePayment: async (paymentId) => {
        set((state) => ({ payments: state.payments.filter(p => p.id !== paymentId) }))
        await executeCloud({ sql: "DELETE FROM payments WHERE id = ?", args: [paymentId] })
      },

      // ─── SELECTORS ──────────────────────────────────────────
      getSiteTotal:         (siteId) => get().entries.filter(e => e.siteId === siteId).reduce((s, e) => s + e.amount, 0),
      getSitePaymentsTotal: (siteId) => get().payments.filter(p => p.siteId === siteId).reduce((s, p) => s + p.amount, 0),
      getSitePayments:      (siteId) => get().payments.filter(p => p.siteId === siteId).sort((a, b) => new Date(b.date) - new Date(a.date)),
      getSiteEntries:       (siteId) => get().entries.filter(e => e.siteId === siteId).sort((a, b) => new Date(b.date) - new Date(a.date)),
      getGrandTotal:        ()       => get().entries.reduce((s, e) => s + e.amount, 0),

      getSiteEntriesByDate: (siteId) => {
        const entries = get().entries
          .filter(e => e.siteId === siteId)
          .sort((a, b) => new Date(b.date) - new Date(a.date))

        const groups = {}
        entries.forEach(e => {
          if (!groups[e.date]) groups[e.date] = { date: e.date, entries: [], total: 0 }
          groups[e.date].entries.push(e)
          groups[e.date].total += e.amount
        })
        return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date))
      },

      generateWhatsAppSummary: (siteId) => {
        const { sites, entries, payments, profile } = get()
        const site = sites.find(s => s.id === siteId)
        if (!site) return ''
        const siteEntries  = entries.filter(e => e.siteId === siteId)
        const totalExpense = siteEntries.reduce((s, e) => s + e.amount, 0)
        const totalPaid    = payments.filter(p => p.siteId === siteId).reduce((s, p) => s + p.amount, 0)
        const balance      = totalExpense - totalPaid
        const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

        let msg = `🏗️ *${profile.name.toUpperCase()}*\n`
        msg += `🏢 *SITE:* ${site.name}\n`
        if (site.ownerName) msg += `👤 ${site.ownerName} | 📞 ${site.ownerPhone || ''}\n`
        msg += `\n━━━━━━━━━━━━━━━━━\n`
        msg += `🧾 *DETAILED EXPENSE REPORT*\n`
        msg += `━━━━━━━━━━━━━━━━━\n\n`

        const types = [
          { key: 'material', label: '🧱 MATERIAL EXPENSES', icon: '📦' },
          { key: 'labor', label: '👷 LABOR EXPENSES', icon: '👥' },
          { key: 'misc', label: '⚙️ MISC EXPENSES', icon: '📝' }
        ]

        types.forEach(({key, label}) => {
          const typeEntries = siteEntries.filter(e => e.type === key)
          if (typeEntries.length > 0) {
            const typeTotal = typeEntries.reduce((s, e) => s + e.amount, 0)
            msg += `*${label}* (Total: ${fmt(typeTotal)})\n`
            
            const groupedCats = {}
            typeEntries.forEach(e => {
              if(!groupedCats[e.category]) groupedCats[e.category] = 0
              groupedCats[e.category] += e.amount
            })
            
            Object.keys(groupedCats).sort((a,b) => groupedCats[b] - groupedCats[a]).forEach(cat => {
              msg += `▪ ${cat}: ${fmt(groupedCats[cat])}\n`
            })
            msg += `\n`
          }
        })

        msg += `━━━━━━━━━━━━━━━━━\n`
        msg += `💰 *TOTAL EXPENSE:*   ${fmt(totalExpense)}\n`
        msg += `✅ *TOTAL RECEIVED:*  ${fmt(totalPaid)}\n`
        msg += `━━━━━━━━━━━━━━━━━\n`
        if (balance > 0) {
          msg += `⚠️ *BALANCE DUE:*     ${fmt(balance)}\n`
        } else if (balance < 0) {
          msg += `🟢 *ADVANCE / SURPLUS:* ${fmt(Math.abs(balance))}\n`
        } else {
          msg += `✓ *ACCOUNT CLEARED*\n`
        }
        msg += `\n_${profile.name}`
        if (profile.phone) msg += ` · ${profile.phone}`
        if (profile.address) msg += ` · ${profile.address}`
        msg += `_ 🏗️`
        return msg
      },

      generateGlobalWhatsAppSummary: () => {
        const { sites, entries, payments, profile } = get()
        const totalExpense = entries.reduce((s, e) => s + e.amount, 0)
        const totalPaid    = payments.reduce((s, p) => s + p.amount, 0)
        const balance      = totalExpense - totalPaid
        const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

        let msg = `🏗️ *${profile.name.toUpperCase()}*\n`
        msg += `📊 *MASTER REPORT (ALL SITES)*\n`
        msg += `━━━━━━━━━━━━━━━━━\n\n`
        
        sites.forEach(site => {
          const siteEntries = entries.filter(e => e.siteId === site.id)
          const sitePayments = payments.filter(p => p.siteId === site.id)
          const sExp = siteEntries.reduce((s, e) => s + e.amount, 0)
          const sPaid = sitePayments.reduce((s, p) => s + p.amount, 0)
          
          if (sExp > 0 || sPaid > 0) {
            msg += `🏢 *${site.name}*\n`
            msg += `▪ Exp: ${fmt(sExp)} | Rec: ${fmt(sPaid)}\n\n`
          }
        })
        
        msg += `━━━━━━━━━━━━━━━━━\n`
        msg += `💰 *TOTAL EXPENSE:*   ${fmt(totalExpense)}\n`
        msg += `✅ *TOTAL RECEIVED:*  ${fmt(totalPaid)}\n`
        msg += `━━━━━━━━━━━━━━━━━\n`
        if (balance > 0) {
          msg += `⚠️ *TOTAL BALANCE:*   ${fmt(balance)}\n`
        } else if (balance < 0) {
          msg += `🟢 *TOTAL SURPLUS:*   ${fmt(Math.abs(balance))}\n`
        }
        
        msg += `\n_${profile.name}`
        if (profile.phone) msg += ` · ${profile.phone}`
        if (profile.address) msg += ` · ${profile.address}`
        msg += `_ 📱`
        return msg
      },

      clearAllData: async () => {
        set({ sites: [], entries: [], payments: [] })
        await executeCloud("DELETE FROM entries")
        await executeCloud("DELETE FROM payments")
        await executeCloud("DELETE FROM sites")
      },

      exportData: () => {
        const { sites, entries, payments } = get()
        return JSON.stringify({ sites, entries, payments, exportedAt: new Date().toISOString() }, null, 2)
      },
    }),
    {
      name: 'radadiya-construction-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useStore
