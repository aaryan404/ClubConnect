'use server'

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'
import { z } from 'zod'

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

const emailSchema = z.string().email().min(5).max(255)

export async function getAdmins() {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, name')

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching admins:', error)
    return { success: false, message: error.message || 'Failed to fetch admins' }
  }
}

export async function addAdmin(name: string, email: string, password: string) {
  try {
    // Validate email
    try {
      const validatedEmail = emailSchema.parse(email);

      // Check if the user already exists
      const { data: existingUser, error: existingUserError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', validatedEmail)
        .single();

      if (existingUserError && existingUserError.code !== 'PGRST116') {
        throw existingUserError;
      }

      if (existingUser) {
        return { success: false, message: 'User already exists' };
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: validatedEmail,
        password,
        email_confirm: true
      })

      if (error) {
        if (error.message.includes('email')) {
          throw new Error('Invalid email address. Please check and try again.')
        }
        throw error
      }

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const { error: insertError } = await supabase
        .from('admins')
        .insert({ id: data.user.id, email: data.user.email, name, password: hashedPassword })

      if (insertError) throw insertError

      return { success: true, message: 'Admin added successfully' }
    } catch (error) {
      console.error('Email validation error:', error);
      return { success: false, message: 'Invalid email address. Please check and try again.' };
    }
  } catch (error: any) {
    console.error('Error adding admin:', error)
    return { success: false, message: error.message || 'Failed to add admin' }
  }
}
export async function updateAdmin(id: string, name: string, email: string) {
  try {
    // Validate email
    try {
      const validatedEmail = emailSchema.parse(email);
      const { error } = await supabase.auth.admin.updateUserById(
        id,
        { email: validatedEmail }
      )

      if (error) {
        if (error.message.includes('email')) {
          throw new Error('Invalid email address. Please check and try again.')
        }
        throw error
      }

      const { error: updateError } = await supabase
        .from('admins')
        .update({ email: validatedEmail, name })
        .eq('id', id)

      if (updateError) throw updateError

      return { success: true, message: 'Admin updated successfully' }
    } catch (error) {
      console.error('Email validation error:', error);
      return { success: false, message: 'Invalid email address. Please check and try again.' };
    }
  } catch (error: any) {
    console.error('Error updating admin:', error)
    return { success: false, message: error.message || 'Failed to update admin' }
  }
}

export async function deleteAdmin(id: string) {
  try {
    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) throw error

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
    const { error } = await supabase.auth.admin.updateUserById(
      id,
      { password: newPassword }
    )

    if (error) throw error

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

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