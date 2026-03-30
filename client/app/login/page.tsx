"use client"

import Link from "next/link"

import { useSessionState } from "@/components/providers/session-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { loginAsDemo, logout, session } = useSessionState()

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full border py-0">
        <CardHeader className="border-b py-5">
          <CardTitle className="text-xl font-semibold tracking-tight">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {session.isAuthenticated ? (
            <>
              <p className="text-sm text-muted-foreground">
                You are signed in as {session.displayName} (placeholder session state).
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={logout}>
                  End Demo Session
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Authentication will be integrated later. Start a demo session to preview the flow.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={loginAsDemo}>Start Demo Session</Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
