'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function joinClub(clubId: string) {
  const supabase = createServerActionClient({ cookies })
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('club_memberships')
    .insert({ club_id: clubId, student_id: user.id })

  if (error) {
    if (error.code === '23505') { // unique_violation
      return { error: 'You are already a member of this club' }
    }
    return { error: 'Failed to join club' }
  }

  revalidatePath('/clubs')
  return { success: true }
}