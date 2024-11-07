'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Check if the identifier is the super admin ID
      if (identifier === process.env.NEXT_PUBLIC_SUPER_ADMIN_ID) {
        // Super admin login
        const response = await fetch('/api/auth/super_admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminId: identifier, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Invalid ID or password')
        }

        toast({
          title: "Signed in successfully",
          description: "Welcome back, Super Admin!",
        })

        router.push('/super_admin/dashboard')
      } else {
        // Student login
        // First, get the student's email using their student ID
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('email')
          .eq('student_id', identifier)
          .single()

        if (studentError) {
          throw new Error('Invalid ID or password')
        }

        // Now sign in with the retrieved email and provided password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: studentData.email,
          password: password,
        })

        if (error) {
          throw new Error('Invalid ID or password')
        }

        if (data.user) {
          toast({
            title: "Signed in successfully",
            description: "Welcome back to ClubConnect!",
          })

          router.push('/member/dashboard')
        } else {
          throw new Error('Invalid ID or password')
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError('Invalid ID or password')
      toast({
        title: "Sign in failed",
        description: "Invalid ID or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In to ClubConnect</h1>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Student ID or Admin ID</Label>
            <Input
              id="identifier"
              placeholder="Enter your ID"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}