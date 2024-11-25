'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [securityPin, setSecurityPin] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Check if email exists in students table
      const { data, error } = await supabase
        .from('students')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (error) throw error

      if (data) {
        setStep(2)
      } else {
        throw new Error('No account found with this email. Please check and try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitSecurityPin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Verify email and security pin combination
      const { data, error } = await supabase
        .from('students')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .eq('security_pin', securityPin)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setStep(3)
      } else {
        throw new Error('Incorrect security PIN. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError)
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match. Please ensure both passwords are identical.")
      return;
    }

    setIsLoading(true)

    try {
      // Update the password in students table
      const { error } = await supabase
        .from('students')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase().trim())
        .eq('security_pin', securityPin)

      if (error) throw error

      // Show success toast
      toast.success('Password reset successful!', {
        duration: 5000,
        position: 'bottom-right',
      })

      router.push('/auth/signin')
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {step === 1 && "Enter your email to start the password reset process."}
            {step === 2 && "Enter your security PIN."}
            {step === 3 && "Enter your new password."}
          </CardDescription>
        </CardHeader>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {step === 1 && (
          <form onSubmit={handleSubmitEmail}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Next'}
              </Button>
            </CardFooter>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmitSecurityPin}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="securityPin">Security PIN</Label>
                  <Input
                    id="securityPin"
                    type="password"
                    placeholder="Enter your security PIN"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </CardFooter>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

