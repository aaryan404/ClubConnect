'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function signUp(formData: {
  name: string
  email: string
  studentId: string
  password: string
}) {
  console.log('Starting sign up process...')
  console.log('Form data:', { ...formData, password: '[REDACTED]' })

  try {
    // Check if the student exists
    const { data: existingStudent, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', formData.email)
      .eq('student_id', formData.studentId)
      .single()

    if (studentError && studentError.code !== 'PGRST116') {
      console.error('Error checking student:', studentError)
      return { success: false, message: 'Error checking student information.' }
    }

    if (!existingStudent) {
      console.log('No matching student found. Inserting new student record.')
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          email: formData.email,
          student_id: formData.studentId,
          name: formData.name
        })
        .single()

      if (insertError) {
        console.error('Error inserting new student:', insertError)
        return { success: false, message: 'Failed to create new student record.' }
      }

      console.log('New student record created:', newStudent)
    } else {
      console.log('Existing student found:', existingStudent)
    }

    // Sign up the user
    const { data, error } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        name: formData.name,
        student_id: formData.studentId,
      },
    })

    if (error) {
      console.error('Error creating user:', error)
      return { success: false, message: error.message }
    }

    if (data.user) {
      console.log('User created successfully:', data.user.id)

      // Insert the user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          student_id: formData.studentId,
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        return { success: false, message: 'Failed to create user profile.' }
      }

      console.log('User profile created successfully')
      return { success: true, message: 'Sign up successful. Please check your email to verify your account.' }
    }

    console.error('Unexpected error: User data is null')
    return { success: false, message: 'An unexpected error occurred. Please try again.' }
  } catch (error) {
    console.error('Unexpected error during sign up:', error)
    return { success: false, message: 'An unexpected error occurred. Please try again.' }
  }
}