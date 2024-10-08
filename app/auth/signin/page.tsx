'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff } from 'lucide-react'

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Validate identifier (student ID, string, or email)
    if (identifier.trim() === '') {
      newErrors.identifier = "ID is required"
    } else if (!/^\d{7}$/.test(identifier) && !identifier.includes('@')) {
      // If it's not a 7-digit number and not an email, it's treated as a username
      if (identifier.length < 3) {
        newErrors.identifier = "Username must be at least 3 characters long"
      }
    }

    // Validate password is not empty
    if (password.trim() === '') {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Here you would typically send a request to your backend API
      // For now, we'll just simulate a successful signin
      console.log('Signin data:', { identifier, password })
      
      toast({
        title: "Signed in successfully.",
        description: "Welcome back to ClubConnect!",
      })
      
      // Redirect to dashboard or home page
      router.push('/dashboard')
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
              placeholder="1234567"
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
          <Button type="submit" className="w-full">Sign In</Button>
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