'use server'

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
interface Admin {
  id: string;
  email: string;
}

export async function addAdmin(email: string, password: string) {
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) throw authError

    const { error: dbError } = await supabase
      .from('admins')
      .insert({ id: authData.user.id, email: authData.user.email })

    if (dbError) throw dbError

    return { success: true, message: 'Admin added successfully' }
  } catch (error: any) {
    console.error('Error adding admin:', error)
    return { success: false, message: error.message || 'Failed to add admin' }
  }
}

export async function getAdmins() {
  console.log('Fetching admins')
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email')

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching admins:', error)
    return { success: false, message: error.message || 'Failed to fetch admins' }
  }
}

export async function updateAdmin(id: string, email: string) {
  try {
    const { error: authError } = await supabase.auth.admin.updateUserById(
      id,
      { email }
    )

    if (authError) throw authError

    const { error: dbError } = await supabase
      .from('admins')
      .update({ email })
      .eq('id', id)

    if (dbError) throw dbError

    return { success: true, message: 'Admin updated successfully' }
  } catch (error: any) {
    console.error('Error updating admin:', error)
    return { success: false, message: error.message || 'Failed to update admin' }
  }
}

export async function deleteAdmin(id: string) {
  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) throw authError

    const { error: dbError } = await supabase
      .from('admins')
      .delete()
      .eq('id', id)

    if (dbError) throw dbError

    return { success: true, message: 'Admin deleted successfully' }
  } catch (error: any) {
    console.error('Error deleting admin:', error)
    return { success: false, message: error.message || 'Failed to delete admin' }
  }
}

export async function initiatePasswordReset(email: string) {
  console.log('Initiating password reset for:', email)
  try {
    // Check if the admin exists
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single()

    if (adminError || !adminData) {
      console.error('Admin not found:', adminError)
      throw new Error('Admin not found')
    }

    const resetToken = crypto.randomBytes(20).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Attempt to create the password_reset_tokens table
    const { error: createTableError } = await supabase.rpc('create_password_reset_tokens_table')
    if (createTableError) {
      console.error('Error creating password_reset_tokens table:', createTableError)
      // If the table already exists, this error is expected, so we can proceed
      if (!createTableError.message.includes('already exists')) {
        throw new Error('Failed to create password reset tokens table')
      }
    }

    // Insert or update the reset token
    const { error: upsertError } = await supabase
      .from('password_reset_tokens')
      .upsert({ 
        email, 
        token: resetToken, 
        expires_at: resetTokenExpiry.toISOString() 
      }, { 
        onConflict: 'email' 
      })

    if (upsertError) {
      console.error('Error upserting reset token:', upsertError)
      throw upsertError
    }

    console.log('Password reset initiated successfully')
    return { success: true, resetToken }
  } catch (error: any) {
    console.error('Error initiating password reset:', error)
    return { success: false, message: error.message || 'Failed to initiate password reset' }
  }
}


export async function resetPassword(token: string, newPassword: string) {
  try {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('email')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) throw new Error('Invalid or expired reset token')

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.email,
      { password: newPassword }
    )

    if (updateError) throw updateError

    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('token', token)

    return { success: true, message: 'Password reset successfully' }
  } catch (error: any) {
    console.error('Error resetting password:', error)
    return { success: false, message: error.message || 'Failed to reset password' }
  }
}