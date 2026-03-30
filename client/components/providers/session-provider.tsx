"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

interface SessionState {
  isAuthenticated: boolean
  displayName: string | null
}

interface SessionContextValue {
  session: SessionState
  loginAsDemo: () => void
  logout: () => void
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({
    isAuthenticated: false,
    displayName: null,
  })

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      loginAsDemo: () =>
        setSession({
          isAuthenticated: true,
          displayName: "Student",
        }),
      logout: () =>
        setSession({
          isAuthenticated: false,
          displayName: null,
        }),
    }),
    [session]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSessionState() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSessionState must be used within SessionProvider")
  }
  return context
}
