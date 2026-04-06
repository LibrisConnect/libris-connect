"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, User, Building2, FileText, ArrowRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"

interface College {
  _id: string
  name: string
  code: string
  city: string
  state: string
}

function JoinContent() {
  const router = useRouter()
  const [colleges, setColleges] = useState<College[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [collegeCode, setCollegeCode] = useState("")
  const [reason, setReason] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loadingColleges, setLoadingColleges] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch colleges on mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true)
        const response = await apiClient.getColleges()
        setColleges(response.colleges || [])
      } catch (err) {
        console.error("Failed to fetch colleges:", err)
        setColleges([])
        setFormError("Failed to load colleges. Please try again later.")
      } finally {
        setLoadingColleges(false)
      }
    }

    fetchColleges()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      // Validation
      if (!name.trim()) {
        setFormError("Name is required")
        setIsSubmitting(false)
        return
      }

      if (!email.trim()) {
        setFormError("Email is required")
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

      if (!collegeCode) {
        setFormError("Please select a college")
        setIsSubmitting(false)
        return
      }

      // Submit join request
      const response = await apiClient.register(email, name, collegeCode, reason)

      setSuccessMessage(
        response.message || "Join request submitted! Please wait for admin approval."
      )
      
      // Clear form
      setName("")
      setEmail("")
      setCollegeCode("")
      setReason("")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit join request"
      setFormError(errorMessage)
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
              <div className="p-2 rounded-lg bg-secondary/20">
                <User className="h-5 w-5 text-secondary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Request Access</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Submit a join request to access your college library system
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Success Message */}
            {successMessage && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                <p className="text-sm font-medium text-green-600">{successMessage}</p>
                <p className="text-xs text-green-600 mt-1">Redirecting to login...</p>
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

              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

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

              {/* College Selection */}
              <div className="space-y-2">
                <label htmlFor="college" className="text-sm font-medium text-foreground">
                  Select Your College
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                  <Select
                    id="college"
                    value={collegeCode}
                    onChange={(e) => setCollegeCode(e.target.value)}
                    disabled={isSubmitting || loadingColleges}
                    className="pl-9 h-11"
                  >
                    <option value="">
                      {loadingColleges ? "Loading colleges..." : "Choose a college..."}
                    </option>
                    {colleges.map((college) => (
                      <option key={college._id} value={college.code}>
                        {college.name} ({college.code}) - {college.city}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Reason Input (Optional) */}
              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium text-foreground">
                  Reason (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <textarea
                    id="reason"
                    placeholder="Tell us why you need access (optional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9 p-3 h-20 w-full rounded-md border border-input bg-background text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-secondary to-accent hover:shadow-lg hover:shadow-secondary/30 gap-2 font-semibold"
                disabled={isSubmitting || loadingColleges}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Info Box */}
            <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2 text-sm">
              <p className="font-medium text-foreground">How it works:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>1. Fill out the form with your details</li>
                <li>2. Select your college</li>
                <li>3. Submit your request</li>
                <li>4. Wait for college admin approval</li>
                <li>5. Receive an email when approved</li>
              </ul>
            </div>

            {/* Already Have Account Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
              <Link
                href="/login"
                className="text-sm text-primary hover:text-accent transition-colors font-medium"
              >
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function JoinSkeleton() {
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

export default function JoinPage() {
  return (
    <Suspense fallback={<JoinSkeleton />}>
      <JoinContent />
    </Suspense>
  )
}
