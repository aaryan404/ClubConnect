"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function SubAdminVerification() {
  const [email, setEmail] = useState('')
  const [clubId, setClubId] = useState('')
  const [result, setResult] = useState<any>(null)
  const supabase = createClientComponentClient()

  const checkSubAdmin = async () => {
    const { data, error } = await supabase
      .from('sub_admins')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      setResult({ error: error.message })
    } else {
      setResult(data)
    }
  }

  const addSubAdmin = async () => {
    const { data, error } = await supabase
      .from('sub_admins')
      .insert({ email, club_id: clubId })
      .select()

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Sub-admin added successfully",
      })
      setResult(data[0])
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sub-Admin Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={checkSubAdmin}>Check Sub-Admin Status</Button>
          {result && (
            <pre className="bg-muted p-2 rounded-md overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
          {result?.error && (
            <>
              <Input
                type="text"
                placeholder="Enter club ID"
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
              />
              <Button onClick={addSubAdmin}>Add as Sub-Admin</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}