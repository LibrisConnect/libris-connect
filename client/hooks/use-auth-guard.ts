"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useSessionState } from "@/components/providers/session-provider"
import { getRoleHomePath } from "@/lib/auth-routes"
import type { AuthUser } from "@/types/auth"

export function useAuthGuard(allowedRoles?: AuthUser["role"][]) {
  const { session, isSessionHydrated } = useSessionState()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isSessionHydrated && !session.isAuthenticated) {
      const next = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
      router.replace(`/login?redirect=${encodeURIComponent(next)}`)
      return
    }

    if (
      isSessionHydrated &&
      session.isAuthenticated &&
      session.user &&
      allowedRoles &&
      !allowedRoles.includes(session.user.role)
    ) {
      router.replace(getRoleHomePath(session.user.role))
    }
  }, [
    allowedRoles,
    isSessionHydrated,
    pathname,
    router,
    searchParams,
    session.isAuthenticated,
    session.user,
  ])

  return (
    isSessionHydrated &&
    session.isAuthenticated &&
    (!!session.user && (!allowedRoles || allowedRoles.includes(session.user.role)))
  )
}
