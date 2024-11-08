'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createClub(name: string, description: string) {
  const supabase = createServerActionClient({ cookies })
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('clubs')
    .insert({ name, description })
    .select()
    .single()

  if (error) {
    console.error('Error creating club:', error)
    return { error: 'Failed to create club' }
  }

  revalidatePath('/admin/clubs')
  return { club: data }
}