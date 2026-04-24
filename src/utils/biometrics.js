// Helper functions for WebAuthn (Biometrics/Passkeys) in a local PWA

const bufferToBase64url = (buffer) => {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (let charCode of bytes) str += String.fromCharCode(CharCode)
  const base64String = btoa(str)
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

const base64urlToBuffer = (base64url) => {
  const padding = '==='.slice((base64url.length + 3) % 4)
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding
  const str = atob(base64)
  const buffer = new ArrayBuffer(str.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i)
  }
  return buffer
}

export const registerBiometric = async () => {
  if (!window.PublicKeyCredential) throw new Error("Biometrics not supported")
  
  const challenge = new Uint8Array(32)
  window.crypto.getRandomValues(challenge)
  
  const userId = new Uint8Array(16)
  window.crypto.getRandomValues(userId)

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Radadiya Construction", id: window.location.hostname },
      user: { id: userId, name: "Admin", displayName: "Admin" },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
      attestation: "none"
    }
  })

  if (!credential) throw new Error("Registration failed")
  return bufferToBase64url(credential.rawId)
}

export const verifyBiometric = async (credentialIdBase64) => {
  if (!window.PublicKeyCredential || !credentialIdBase64) throw new Error("Biometrics not supported or not registered")
  
  const challenge = new Uint8Array(32)
  window.crypto.getRandomValues(challenge)

  const rawId = base64urlToBuffer(credentialIdBase64)

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: window.location.hostname,
      allowCredentials: [{ id: rawId, type: "public-key", transports: ["internal"] }],
      userVerification: "required",
      timeout: 60000
    }
  })

  if (!assertion) throw new Error("Verification failed")
  return true
}
