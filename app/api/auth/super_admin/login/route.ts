import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    console.log('Attempting super admin login with ID:', adminId) // For debugging

    if (!adminId || !password) {
      return NextResponse.json(
        { error: 'Admin ID and password are required' },
        { status: 400 }
      )
    }

    // Verify that the adminId matches the super admin ID
    if (adminId !== process.env.NEXT_PUBLIC_SUPER_ADMIN_ID) {
      console.log('Invalid super admin ID') // For debugging
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Fetch the super admin's email from the database
    const { data: adminData, error: adminError } = await supabase
      .from('super_admins')
      .select('email')
      .eq('admin_id', adminId)
      .single()

    if (adminError || !adminData) {
      console.log('Error fetching super admin data:', adminError) // For debugging
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Sign in using Supabase Auth
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminData.email,
      password: password,
    })

    if (signInError || !data.session) {
      console.log('Sign in error:', signInError) // For debugging
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Set the session cookies
    const cookieStore = cookies()
    
    cookieStore.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: data.session.expires_in,
      path: '/',
    })

    cookieStore.set('sb-refresh-token', data.session.refresh_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    console.log('Super admin login successful') // For debugging

    return NextResponse.json(
      { 
        message: 'Logged in successfully',
        user: {
          id: data.user.id,
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