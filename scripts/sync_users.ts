import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function syncUsers() {
  // Fetch all users from Auth
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Error fetching Auth users:', authError)
    return
  }

  // Fetch all admins and students from the database
  const { data: dbAdmins, error: adminError } = await supabase.from('admins').select('*')
  const { data: dbStudents, error: studentError } = await supabase.from('students').select('*')

  if (adminError) console.error('Error fetching admins:', adminError)
  if (studentError) console.error('Error fetching students:', studentError)

  // Sync users
  for (const user of authUsers.users) {
    const dbAdmin = dbAdmins?.find(admin => admin.email === user.email)
    const dbStudent = dbStudents?.find(student => student.email === user.email)

    if (dbAdmin) {
      // User is an admin
      console.log(`Syncing admin: ${user.email}`)
      // Update admin details if necessary
    } else if (dbStudent) {
      // User is a student
      console.log(`Syncing student: ${user.email}`)
      // Update student details if necessary
    } else {
      console.warn(`User ${user.email} exists in Auth but not in database tables`)
    }
  }

  // Check for database entries that don't exist in Auth
  for (const admin of dbAdmins || []) {
    if (!authUsers.users.some(user => user.email === admin.email)) {
      console.warn(`Admin ${admin.email} exists in database but not in Auth`)
    }
  }

  for (const student of dbStudents || []) {
    if (!authUsers.users.some(user => user.email === student.email)) {
      console.warn(`Student ${student.email} exists in database but not in Auth`)
    }
  }

  console.log('User sync completed')
}

syncUsers()