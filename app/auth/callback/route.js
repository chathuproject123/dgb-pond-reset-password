
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // 'recovery' denotes password reset flows

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the temporary code for a secure, cookie-based session
    await supabase.auth.exchangeCodeForSession(code)
    
    // If it's a password recovery request, route them to the password edit page
    if (type === 'recovery') {
      return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
    }
  }

  // Fallback redirect for standard logins / magic links
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
