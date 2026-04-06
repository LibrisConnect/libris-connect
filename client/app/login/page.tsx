"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react"

import { useSessionState } from "@/components/providers/session-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session, isLoading, error } = useSessionState()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectParam = searchParams.get("redirect")
  const redirectTarget =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard"

  // Redirect if already authenticated
  useEffect(() => {
    if (session.isAuthenticated && session.user) {
      router.replace(redirectTarget)
    }
  }, [session.isAuthenticated, redirectTarget, router, session.user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      // Validation
      if (!email.trim()) {
        setFormError("Email is required")
        setIsSubmitting(false)
        return
      }

      if (!password.trim()) {
        setFormError("Password is required")
        setIsSubmitting(false)
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setFormError("Please enter a valid email")
        setIsSubmitting(false)
        return
      }

      // Call login API
      const response = await apiClient.login(email, password)

      if (!response.user || !response.token) {
        setFormError("Invalid response from server")
        setIsSubmitting(false)
        return
      }

      // Save to session provider through login function
      // We'll use a direct approach here since the session provider handles it
      localStorage.setItem('libris_auth_token', response.token)
      localStorage.setItem('libris_auth_user', JSON.stringify(response.user))

      // Update session state in context
      // Redirect immediately
      router.replace(redirectTarget)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setFormError(errorMessage)
      console.error("Login error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-b from-background to-muted/10 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="w-full border-border/50 rounded-2xl overflow-hidden shadow-lg">
          <CardHeader className="border-b border-border/30 py-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-t-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome to LibrisConnect</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in with your college email and password to access the library system
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Show redirect info if coming from protected route */}
            {redirectParam && (
              <div className="rounded-lg bg-info/10 border border-info/30 p-3">
                <p className="text-xs text-muted-foreground">
                  You need to sign in to access that page
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Messages */}
              {formError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                  <p className="text-sm font-medium text-destructive">{formError}</p>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                  <p className="text-sm font-medium text-destructive">{error.message}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 gap-2 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* New User Info */}
            <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2 text-sm">
              <p className="font-medium text-foreground">New user?</p>
              <p className="text-muted-foreground">
                Request access from your college admin by visiting the join page.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center gap-1 text-primary hover:text-accent transition-colors font-medium"
              >
                Send join request
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Back Link */}
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-primary hover:text-accent transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function LoginSkeleton() {
  return (
    <section className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="border-b py-6">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  )
}
