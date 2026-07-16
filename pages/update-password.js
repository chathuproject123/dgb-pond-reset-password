import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function UpdatePassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    // Verify the recovery token
    const verifyToken = async () => {
      try {
        const { token_hash, type } = router.query

        if (!token_hash || type !== 'recovery') {
          setError('Invalid or expired reset link')
          setVerifying(false)
          return
        }

        // Verify the OTP
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'recovery',
        })

        if (error) throw error

        setVerifying(false)
        setMessage('Token verified! Set your new password.')
      } catch (err) {
        setError(err.message || 'Invalid or expired reset link')
        setVerifying(false)
      }
    }

    if (router.isReady) {
      verifyToken()
    }
  }, [router.isReady, router.query])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setMessage('Password updated successfully! Redirecting...')
      
      // Redirect to app after 3 seconds
      setTimeout(() => {
        window.location.href = 'myapp://password-reset-success'
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Verifying...</h2>
          <p style={styles.subtitle}>Please wait while we verify your reset link</p>
          <div style={styles.loader}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔑 Set New Password</h1>
        <p style={styles.subtitle}>Create a new password for your account</p>

        {message && (
          <div style={styles.success}>
            ✅ {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={styles.form}>
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div style={styles.footer}>
          <a href="myapp://login" style={styles.link}>
            ← Back to App
          </a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '440px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  button: {
    padding: '12px',
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  success: {
    background: '#E8F5E9',
    color: '#1B5E20',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  error: {
    background: '#FFEBEE',
    color: '#C62828',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  link: {
    color: '#2E7D32',
    textDecoration: 'none',
    fontSize: '14px',
  },
  loader: {
    width: '40px',
    height: '40px',
    margin: '20px auto',
    border: '4px solid #E8F5E9',
    borderTop: '4px solid #2E7D32',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
}

// Add this to your global CSS or component styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}
