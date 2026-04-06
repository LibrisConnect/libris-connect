"use client"

import Link from "next/link"
import { BookOpen, LogOut } from "lucide-react"

import { useSessionState } from "@/components/providers/session-provider"
import { Button } from "@/components/ui/button"

export function TopNavbar() {
  const { session, logout } = useSessionState()

  return (
    <header className="border-b border-border/40 bg-gradient-to-r from-background via-background to-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LibrisConnect
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hover:bg-muted/60">
            <Link href="/search">Search</Link>
          </Button>
          {session.isAuthenticated && session.user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hover:bg-muted/60">
                <Link href="/dashboard">
                  {session.user.name}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hover:bg-destructive/10 hover:text-destructive gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <Button 
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all duration-200" 
              size="sm" 
              asChild
            >
              <Link href="/login">
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
