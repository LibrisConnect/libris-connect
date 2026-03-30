"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useSessionState } from "@/components/providers/session-provider"

export function useAuthGuard() {
  const { session } = useSessionState()
  const router = useRouter()

  useEffect(() => {
    if (!session.isAuthenticated) {
      router.replace("/login")
    }
  }, [session.isAuthenticated, router])

  return session.isAuthenticated
}
