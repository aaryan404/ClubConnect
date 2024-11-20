"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

interface DebugStep {
  step: string
  status: 'pending' | 'success' | 'error'
  data?: any
  error?: any
}

export default function ClubManagementDebug() {
  const [debugSteps, setDebugSteps] = useState<DebugStep[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const addDebugStep = (step: DebugStep) => {
    setDebugSteps(prev => [...prev, step])
  }

  const runDebug = async () => {
    setIsLoading(true)
    setDebugSteps([])

    try {
      // Step 1: Get current user
      addDebugStep({ step: "Getting current user", status: "pending" })
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw { step: "Getting current user", error: userError }
      addDebugStep({ step: "Getting current user", status: "success", data: user })

      if (!user?.email) {
        throw { step: "Checking user email", error: "User not authenticated or email not available" }
      }

      // Step 2: Check if user is sub-admin
      addDebugStep({ step: "Checking sub-admin status", status: "pending" })
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('role')
        .eq('email', user.email)
        .single()

      if (studentError) throw { step: "Checking sub-admin status", error: studentError }
      addDebugStep({ step: "Checking sub-admin status", status: "success", data: studentData })

      if (!studentData || studentData.role !== 'sub-admin') {
        throw { step: "Verifying sub-admin role", error: "User is not a sub-admin" }
      }

      // Step 3: Get all records from sub_admins table for this email
      addDebugStep({ step: "Getting records from sub_admins", status: "pending" })
      const { data: subAdminData, error: subAdminError } = await supabase
        .from('sub_admins')
        .select('*')
        .eq('email', user.email)

      if (subAdminError) throw { step: "Getting records from sub_admins", error: subAdminError }
      addDebugStep({ step: "Getting records from sub_admins", status: "success", data: subAdminData })

      if (!subAdminData || subAdminData.length === 0) {
        throw { step: "Checking sub_admin records", error: "No records found in sub_admins table" }
      }

      if (subAdminData.length > 1) {
        addDebugStep({ step: "Warning", status: "error", error: "Multiple records found in sub_admins table" })
      }

      const clubId = subAdminData[0].club_id

      if (!clubId) {
        throw { step: "Checking club assignment", error: "No club assigned to sub-admin" }
      }

      // Step 4: Get club details
      addDebugStep({ step: "Getting club details", status: "pending" })
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single()

      if (clubError) throw { step: "Getting club details", error: clubError }
      addDebugStep({ step: "Getting club details", status: "success", data: clubData })

      // If we've made it this far, everything is working correctly
      addDebugStep({ step: "All checks passed", status: "success" })

    } catch (error: any) {
      addDebugStep({ step: error.step, status: "error", error: error.error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Club Management Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runDebug} disabled={isLoading} className="mb-4">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Debug...
            </>
          ) : (
            'Run Debug'
          )}
        </Button>
        <div className="space-y-4">
          {debugSteps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className={
                  step.status === 'success' ? 'text-green-500' :
                  step.status === 'error' ? 'text-red-500' :
                  'text-yellow-500'
                }>
                  {step.step} - {step.status}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step.data && (
                  <pre className="bg-muted p-2 rounded-md overflow-auto">
                    {JSON.stringify(step.data, null, 2)}
                  </pre>
                )}
                {step.error && (
                  <pre className="bg-red-100 p-2 rounded-md overflow-auto text-red-500">
                    {JSON.stringify(step.error, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}