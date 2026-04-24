import { useState, useEffect } from 'react'
import { Fingerprint, Delete } from 'lucide-react'
import useStore from '../store/useStore'

export default function LockScreen({ onUnlock }) {
  const { appLock } = useStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  // Handle Biometric Unlock
  const handleBiometric = async () => {
    if (!appLock.useBiometrics) return
    try {
      // Trigger native biometric prompt using WebAuthn fallback/mock or conditional UI
      // For local PWAs, relying entirely on PublicKeyCredential requires a complex registration flow.
      // We will try to trigger the navigator.credentials API. If it fails or is cancelled, they can use PIN.
      if (window.PublicKeyCredential) {
        // We do a dummy assertion to trigger the OS prompt.
        const challenge = new Uint8Array(32)
        window.crypto.getRandomValues(challenge)
        
        await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: "required"
          }
        })
        onUnlock() // If it succeeds without throwing, unlock
      }
    } catch (err) {
      console.log('Biometric cancelled or failed', err)
      // They can just use the PIN
    }
  }

  // Auto-trigger biometrics on mount if enabled
  useEffect(() => {
    if (appLock.useBiometrics) {
      handleBiometric()
    }
  }, [])

  // Handle PIN input
  const handlePress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      setError(false)
      
      if (newPin.length === 4) {
        if (newPin === appLock.pin) {
          setTimeout(onUnlock, 150)
        } else {
          setError(true)
          setTimeout(() => setPin(''), 400)
        }
      }
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: 44, height: 44, borderRadius: '50%' }} />
        </div>
        
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>App Locked</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: '0 0 32px' }}>Enter your 4-digit PIN to continue</p>
        
        <div style={{ display: 'flex', gap: 16, marginBottom: 48 }} className={error ? 'animate-shake' : ''}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%',
              background: i < pin.length ? 'var(--text)' : 'var(--bg2)',
              border: i < pin.length ? 'none' : '1px solid var(--border)',
              transition: 'all 0.1s'
            }} />
          ))}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 300, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handlePress(num.toString())} style={{
            height: 64, borderRadius: 32, fontSize: 24, fontWeight: 600, color: 'var(--text)',
            background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {num}
          </button>
        ))}
        
        <button onClick={appLock.useBiometrics ? handleBiometric : undefined} style={{
          height: 64, borderRadius: 32, color: 'var(--text)', background: 'transparent', border: 'none', cursor: appLock.useBiometrics ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {appLock.useBiometrics && <Fingerprint size={28} color="var(--text3)" />}
        </button>
        
        <button onClick={() => handlePress('0')} style={{
          height: 64, borderRadius: 32, fontSize: 24, fontWeight: 600, color: 'var(--text)',
          background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          0
        </button>
        
        <button onClick={handleDelete} style={{
          height: 64, borderRadius: 32, color: 'var(--text)', background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Delete size={28} color="var(--text3)" />
        </button>
      </div>
    </div>
  )
}
