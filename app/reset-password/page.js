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
        setLoading(false)
      } else if (event === 'SIGNED_IN' && session) {
        setLoading(false)
      } else {
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
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Tailwind Loading Spinner */}
          <svg className="h-8 w-8 animate-spin text-blue-600" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm font-medium text-gray-600">Verifying secure email link, please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Enter New Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please type your secure new password below to regain access.
          </p>
        </div>

        {/* Show the form only if there isn't an initial validation error */}
        {(!message.isError || updating) && (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordUpdate}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={updating}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? (
                  <span className="flex items-center space-x-2">
                    <svg className="h-4 w-4 animate-spin text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving Changes...</span>
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        )}

        {message.text && (
          <div
            className={`mt-4 rounded-md p-4 text-sm font-medium ${
              message.isError
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
