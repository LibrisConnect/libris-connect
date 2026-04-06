"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useSessionState } from "@/components/providers/session-provider"

export function useAuthGuard() {
  const { session, isSessionHydrated } = useSessionState()
  const router = useRouter()

  useEffect(() => {
    if (isSessionHydrated && !session.isAuthenticated) {
      router.replace("/login")
    }
  }, [isSessionHydrated, session.isAuthenticated, router])

  return isSessionHydrated && session.isAuthenticated
}
