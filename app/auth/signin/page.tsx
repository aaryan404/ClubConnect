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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (identifier.trim() === '') {
      newErrors.identifier = "ID is required"
    } else if (!/^\d{7}$/.test(identifier) && !identifier.includes('@')) {
      if (identifier.length < 3) {
        newErrors.identifier = "Username must be at least 3 characters long"
      }
    }

    if (password.trim() === '') {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsLoading(true)
      try {
        // First, try to authenticate as a super admin
        const superAdminResponse = await fetch('/api/auth/super_admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminId: identifier, password }),
        })

        if (superAdminResponse.ok) {
          const data = await superAdminResponse.json()
          toast({
            title: "Signed in successfully",
            description: "Welcome back, Super Admin!",
          })
          router.push('/super_admin')
          return
        }

        // If not a super admin, check for regular admin or student
        let user = null
        let role = ''

        // Check admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', identifier)
          .single()

        if (adminData) {
          user = adminData
          role = 'admin'
        } else {
          // Check students table
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', identifier)
            .single()

          if (studentData) {
            user = studentData
            role = 'student'
          }
        }

        if (!user) {
          throw new Error('User not found')
        }

        // Authenticate user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: password,
        })

        if (error) {
          throw error
        }

        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${role === 'admin' ? 'Admin' : 'Student'}!`,
        })

        router.push(role === 'admin' ? '/admin/dashboard' : '/member/dashboard')
      } catch (error) {
        console.error('Login failed:', error)
        toast({
          title: "Sign in failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In to ClubConnect</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">ID</Label>
            <Input
              id="identifier"
              placeholder="Enter your ID"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            {errors.identifier && <p className="text-sm text-red-500">{errors.identifier}</p>}
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
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
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