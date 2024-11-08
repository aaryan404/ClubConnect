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

const adminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
})
export async function addAdmin(name: string, email: string, password: string) {
  try {
    // Validate input
    const validatedInput = adminSchema.parse({ name, email, password })

    // Check if the user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', validatedInput.email)
      .single()

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      throw new Error('Error checking existing user')
    }

    if (existingUser) {
      return { success: false, message: 'An admin with this email already exists' }
    }

    // Create user in Supabase Auth
    const { data, error: createUserError } = await supabase.auth.admin.createUser({
      email: validatedInput.email,
      password: validatedInput.password,
      email_confirm: true
    })

    if (createUserError) {
      throw new Error(createUserError.message)
    }

    if (!data.user) {
      throw new Error('Failed to create user')
    }

    // Generate admin_id
    const admin_id = `ADMIN-${data.user.id.substring(0, 8)}`

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(validatedInput.password, saltRounds)

    // Insert admin into admins table
    const { error: insertError } = await supabase
      .from('admins')
      .insert({ 
        id: data.user.id, 
        admin_id: admin_id,
        email: data.user.email, 
        name: validatedInput.name, 
        password: hashedPassword 
      })

    if (insertError) {
      // If insert fails, delete the created auth user
      await supabase.auth.admin.deleteUser(data.user.id)
      throw new Error('Failed to insert admin data')
    }

    return { success: true, message: 'Admin added successfully' }
  } catch (error) {
    console.error('Error adding admin:', error)
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }
    return { success: false, message: error instanceof Error ? error.message : 'Failed to add admin' }
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