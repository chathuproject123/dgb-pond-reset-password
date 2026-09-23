'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState({ text: '', isError: false })
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    // Listen for the recovery event triggered automatically by the email link token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token validated successfully. Allow user to type their new password.
        setLoading(false)
      } else if (event === 'SIGNED_IN' && session) {
        // Fallback for immediate session recognition
        setLoading(false)
      } else {
        // If no valid session is found within 3 seconds, show an error
        const timer = setTimeout(() => {
          setLoading(false)
          setMessage({ text: 'Link invalid or expired. Please request a new one.', isError: true })
        }, 3000)
        return () => clearTimeout(timer)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setMessage({ text: '', isError: false })

    // Updates the password for the currently logged-in recovery user
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    setUpdating(false)
    if (error) {
      setMessage({ text: error.message, isError: true })
    } else {
      setMessage({ text: 'Password updated successfully! Redirecting...', isError: false })
      
      // Redirect to login or home dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Verifying secure email link, please wait...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>Enter New Password</h2>
      
      {/* Show the form only if there isn't an initial link error */}
      {(!message.isError || updating) && (
        <form onSubmit={handlePasswordUpdate}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>New Password</label>
            <input 
              type="password" 
              id="password"
              placeholder="Minimum 6 characters" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={updating}
            style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            {updating ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      )}

      {message.text && (
        <p style={{ marginTop: '16px', padding: '10px', borderRadius: '4px', backgroundColor: message.isError ? '#fee2e2' : '#dcfce7', color: message.isError ? '#dc2626' : '#16a34a', fontSize: '14px' }}>
          {message.text}
        </p>
      )}
    </div>
  )
}
