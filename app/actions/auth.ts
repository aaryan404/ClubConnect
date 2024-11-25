'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Email validation function
function validateEmail(email: string): { isValid: boolean; message: string } {
  // Check if email is empty or not a string
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required.' }
  }

  // Check basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address.' }
  }

  // Check for specific domain
  const domain = email.split('@')[1]
  if (domain !== 'nctorontostudents.ca') {
    return { 
      isValid: false, 
      message: 'Please use your @nctorontostudents.ca email address to sign up.' 
    }
  }

  return { isValid: true, message: '' }
}

export async function signUp(formData: {
  name: string
  email: string
  studentId: string
  securityPin: string
  password: string
}) {
  console.log('Starting sign up process...')
  console.log('Form data:', { ...formData, password: '[REDACTED]' })

  try {
    // Validate email domain first
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      return { success: false, message: emailValidation.message }
    }

    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('students')
      .select('student_id')
      .limit(1)
    
    if (testError) {
      console.error('Database connection test failed:', JSON.stringify(testError, null, 2))
      return { success: false, message: 'Unable to connect to the database. Please try again later.' }
    }
    console.log('Database connection test successful.')

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('students')
      .select('student_id')
      .eq('email', formData.email.toLowerCase().trim())
      .maybeSingle()

    if (userCheckError) {
      console.error('Error checking existing user:', JSON.stringify(userCheckError, null, 2))
      return { success: false, message: 'Error checking user information.' }
    }

    if (existingUser) {
      return { success: false, message: 'A user with this email already exists.' }
    }
    console.log('User does not exist. Proceeding with sign up...')

    // Create auth user
    console.log('Attempting to create auth user...')
    const startTime = Date.now()
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          student_id: formData.studentId,
        }
      }
    })
    const endTime = Date.now()
    console.log(`Auth user creation attempt completed in ${endTime - startTime}ms`)

    if (authError) {
      console.error('Error creating auth user:')
      console.error('Error object:', JSON.stringify(authError, null, 2))
      console.error('Error name:', authError.name)
      console.error('Error message:', authError.message)
      console.error('Error status:', authError.status)
      if (authError.cause) {
        console.error('Error cause:', JSON.stringify(authError.cause, null, 2))
      }
      return { success: false, message: authError.message || 'Failed to create user account.' }
    }

    if (!authUser || !authUser.user) {
      console.error('Auth user creation succeeded but user object is null or undefined')
      console.log('Full response data:', JSON.stringify(authUser, null, 2))
      return { success: false, message: 'Unexpected error during user creation.' }
    }

    console.log('Auth user created successfully:')
    console.log('User ID:', authUser.user.id)
    console.log('User email:', authUser.user.email)
    console.log('User created at:', authUser.user.created_at)
    console.log('User metadata:', JSON.stringify(authUser.user.user_metadata, null, 2))

    // Insert into students table
    const { error: insertError } = await supabase
      .from('students')
      .insert({

        email: formData.email.toLowerCase().trim(),
        student_id: formData.studentId,
        name: formData.name,
        role: 'student',
        club: '', // Empty string for new users
        avatar_url: '', // Empty string for new users
        security_pin: formData.securityPin,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
    if (insertError) {
      console.error('Error inserting student record:', JSON.stringify(insertError, null, 2))
      // Clean up the created auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.user.id)
      if (deleteError) {
        console.error('Error deleting auth user after failed student record insertion:', JSON.stringify(deleteError, null, 2))
      }
      return { success: false, message: 'Failed to create student record. Please try again.' }
    }

    console.log('Student record created successfully')
    return { 
      success: true, 
      message: 'Sign up successful. Please check your email for verification instructions.',
      userId: authUser.user.id
    }
  } catch (error) {
    console.error('Unexpected error during sign up:')
    console.error('Error object:', JSON.stringify(error, null, 2))
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      if (error.stack) {
        console.error('Error stack:', error.stack)
      }
    } else {
      console.error('Unexpected error:', error)
    }
    return { success: false, message: 'An unexpected error occurred. Please try again.' }
  }
}