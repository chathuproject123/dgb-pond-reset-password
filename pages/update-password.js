import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, handleSupabaseError } from '../lib/supabase'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import Toast from '../components/Toast'

export default function UpdatePassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [messageType, setMessageType] = useState('')
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { token_hash, type } = router.query

        if (!token_hash || type !== 'recovery') {
          setError('Invalid or expired reset link')
          setMessageType('error')
          setVerifying(false)
          return
        }

        // Verify the OTP token
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'recovery',
        })

        if (error) throw error

        setVerified(true)
        setMessage('✅ Token verified! Set your new password.')
        setMessageType('success')
      } catch (err) {
        setError(handleSupabaseError(err))
        setMessageType('error')
      } finally {
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

    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setMessage('✅ Password updated successfully! Redirecting to app...')
      setMessageType('success')

      // Redirect to app after 3 seconds
      setTimeout(() => {
        const deepLink = process.env.NEXT_PUBLIC_APP_DEEP_LINK || 'myapp://password-reset-success'
        window.location.href = deepLink
      }, 3000)
    } catch (err) {
      setError(handleSupabaseError(err))
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // Render loading state
  if (verifying) {
    return (
      <Layout title="Verifying">
        <div className="container">
          <div className="card">
            <h2 className="title">Verifying...</h2>
            <p className="description">Please wait while we verify your reset link</p>
            <LoadingSpinner />
            <style jsx>{`
              .container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
                padding: 20px;
              }
              .card {
                background: white;
                border-radius: 24px;
                padding: 48px 40px;
                max-width: 440px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              }
              .title {
                font-size: 24px;
                font-weight: 600;
                color: #1B5E20;
                margin: 0 0 8px 0;
              }
              .description {
                color: #666;
                margin-bottom: 24px;
              }
            `}</style>
          </div>
        </div>
      </Layout>
    )
  }

  // Render error state
  if (error && !verified) {
    return (
      <Layout title="Invalid Link">
        <div className="container">
          <div className="card">
            <div className="icon">❌</div>
            <h2 className="title">Invalid Reset Link</h2>
            <p className="description">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="btn btn-primary"
            >
              Request New Link
            </button>
            <style jsx>{`
              .container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
                padding: 20px;
              }
              .card {
                background: white;
                border-radius: 24px;
                padding: 48px 40px;
                max-width: 440px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              }
              .icon {
                font-size: 48px;
                margin-bottom: 16px;
              }
              .title {
                font-size: 24px;
                font-weight: 600;
                color: #1B5E20;
                margin: 0 0 8px 0;
              }
              .description {
                color: #666;
                margin-bottom: 24px;
              }
              .btn {
                padding: 14px 32px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                background: #2E7D32;
                color: white;
              }
              .btn:hover {
                background: #1B5E20;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
              }
            `}</style>
          </div>
        </div>
      </Layout>
    )
  }

  // Render update password form
  return (
    <Layout title="Update Password">
      <div className="container">
        <div className="card">
          <div className="icon">🔑</div>
          <h1 className="title">Set New Password</h1>
          <p className="description">Create a new password for your account</p>

          {message && <Toast message={message} type={messageType} onDismiss={() => setMessage(null)} />}
          {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}

          <form onSubmit={handleUpdatePassword} className="form">
            <div className="input-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
            >
              {loading ? <LoadingSpinner /> : 'Update Password'}
            </button>
          </form>

          <div className="footer">
            <a href={process.env.NEXT_PUBLIC_APP_DEEP_LINK || 'myapp://login'} className="link">
              ← Back to App
            </a>
          </div>

          <style jsx>{`
            .container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #1B5E20 100%);
              padding: 20px;
            }
            .card {
              background: white;
              border-radius: 24px;
              padding: 48px 40px;
              max-width: 440px;
              width: 100%;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .icon {
              font-size: 48px;
              display: block;
              text-align: center;
              margin-bottom: 16px;
            }
            .title {
              font-size: 28px;
              font-weight: 700;
              color: #1B5E20;
              text-align: center;
              margin: 0 0 8px 0;
            }
            .description {
              color: #666;
              text-align: center;
              margin-bottom: 28px;
              font-size: 15px;
            }
            .form {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
            .input-group {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .input-group label {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }
            .input {
              padding: 14px 16px;
              border: 2px solid #e0e0e0;
              border-radius: 12px;
              font-size: 16px;
              transition: all 0.3s;
              outline: none;
              width: 100%;
            }
            .input:focus {
              border-color: #2E7D32;
              box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
            }
            .input:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            .btn {
              padding: 14px;
              border: none;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 52px;
            }
            .btn-primary {
              background: #2E7D32;
              color: white;
            }
            .btn-primary:hover:not(:disabled) {
              background: #1B5E20;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
            }
            .btn-primary:active:not(:disabled) {
              transform: translateY(0);
            }
            .btn-primary:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
            .btn-primary.loading {
              opacity: 0.8;
            }
            .footer {
              margin-top: 24px;
              text-align: center;
            }
            .link {
              color: #2E7D32;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.3s;
            }
            .link:hover {
              color: #1B5E20;
              text-decoration: underline;
            }
          `}</style>
        </div>
      </div>
    </Layout>
  )
}
