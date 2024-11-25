import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Verify that the user making the request is the same user being deleted
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (user?.id !== userId) {
      throw new Error('Unauthorized: You can only delete your own account')
    }

    // Delete the user from auth.users
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}