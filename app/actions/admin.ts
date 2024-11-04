'use server'

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

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

export async function getAdmins() {
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

export async function addAdmin(email: string, password: string) {
  try {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) throw error

    // Hash the password before storing it in the admins table
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Add the user to the admins table with the hashed password
    const { error: insertError } = await supabase
      .from('admins')
      .insert({ id: data.user.id, email: data.user.email, password: hashedPassword })

    if (insertError) throw insertError

    return { success: true, message: 'Admin added successfully' }
  } catch (error: any) {
    console.error('Error adding admin:', error)
    return { success: false, message: error.message || 'Failed to add admin' }
  }
}

export async function updateAdmin(id: string, email: string) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      id,
      { email }
    )

    if (error) throw error

    // Update the email in the admins table
    const { error: updateError } = await supabase
      .from('admins')
      .update({ email })
      .eq('id', id)

    if (updateError) throw updateError

    return { success: true, message: 'Admin updated successfully' }
  } catch (error: any) {
    console.error('Error updating admin:', error)
    return { success: false, message: error.message || 'Failed to update admin' }
  }
}

export async function deleteAdmin(id: string) {
  try {
    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) throw error

    // Remove the user from the admins table
    const { error: deleteError } = await supabase
      .from('admins')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return { success: true, message: 'Admin deleted successfully' }
  } catch (error: any) {
    console.error('Error deleting admin:', error)
    return { success: false, message: error.message || 'Failed to delete admin' }
  }
}

export async function getAdminPassword(id: string) {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('password')
      .eq('id', id)
      .single()

    if (error) throw error

    return { success: true, data: { hasPassword: !!data.password } }
  } catch (error: any) {
    console.error('Error fetching admin password:', error)
    return { success: false, message: error.message || 'Failed to fetch admin password' }
  }
}

export async function updateAdminPassword(id: string, newPassword: string) {
  try {
    // Update password in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(
      id,
      { password: newPassword }
    )

    if (error) throw error

    // Hash the new password before storing it in the admins table
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update the password in the admins table
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password: hashedPassword })
      .eq('id', id)

    if (updateError) throw updateError

    return { success: true, message: 'Password updated successfully' }
  } catch (error: any) {
    console.error('Error updating admin password:', error)
    return { success: false, message: error.message || 'Failed to update admin password' }
  }
}