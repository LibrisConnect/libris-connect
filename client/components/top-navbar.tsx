"use client"

import Link from "next/link"

import { useSessionState } from "@/components/providers/session-provider"
import { Button } from "@/components/ui/button"

export function TopNavbar() {
  const { session } = useSessionState()

  return (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          LibrisConnect
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/search">Search</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={session.isAuthenticated ? "/dashboard" : "/login"}>
              {session.isAuthenticated ? "Profile" : "Login"}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
