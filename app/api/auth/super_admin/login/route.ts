import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { adminId, password } = await request.json()

    // Validate input
    if (!adminId || !password) {
      return NextResponse.json(
        { error: 'Admin ID and password are required' },
        { status: 400 }
      )
    }

    // First, get the admin's email using adminId
    const { data: adminData, error: adminError } = await supabase
      .from('super_admins')
      .select('email')
      .eq('admin_id', adminId)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Sign in using Supabase Auth
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminData.email,
      password: password,
    })

    if (signInError || !session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify the user has super_admin role in RLS policies
    const { data: roleCheck, error: roleError } = await supabase
      .from('super_admins')
      .select('role')
      .eq('admin_id', adminId)
      .single()

    if (roleError || !roleCheck || roleCheck.role !== 'super_admin') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    // Set the session cookies
    const cookieStore = cookies()
    
    cookieStore.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: session.expires_in,
      path: '/',
    })

    cookieStore.set('sb-refresh-token', session.refresh_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    return NextResponse.json(
      { 
        message: 'Logged in successfully',
        user: {
          id: session.user.id,
          adminId,
          role: 'super_admin'
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}