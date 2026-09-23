'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', isError: false })
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', isError: false })

    // Updates the password for the currently logged-in recovery session user
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setMessage({ text: error.message, isError: true })
      setLoading(false)
    } else {
      setMessage({ text: 'Password updated successfully! Redirecting...', isError: false })
      
      // Send them to their dashboard or login screen after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>Create New Password</h2>
      
      <form onSubmit={handlePasswordUpdate}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>New Password</label>
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
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {message.text && (
        <p style={{ marginTop: '16px', padding: '10px', borderRadius: '4px', backgroundColor: message.isError ? '#fee2e2' : '#dcfce7', color: message.isError ? '#dc2626' : '#16a34a' }}>
          {message.text}
        </p>
      )}
    </div>
  )
}
