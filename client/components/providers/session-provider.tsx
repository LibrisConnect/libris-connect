"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { apiClient } from "@/lib/api-client"
import type { AuthUser, AuthError } from "@/types/auth"

const AUTH_TOKEN_KEY = "libris_auth_token"
const AUTH_USER_KEY = "libris_auth_user"
const AUTH_COOKIE_KEY = "libris_demo_auth"

const setAuthCookie = (isAuthenticated: boolean) => {
  if (typeof document === "undefined") {
    return
  }

  if (isAuthenticated) {
    document.cookie = `${AUTH_COOKIE_KEY}=1; path=/; SameSite=Lax`
  } else {
    document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`
  }
}

interface SessionState {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
}

interface SessionContextValue {
  session: SessionState
  isSessionHydrated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  isLoading: boolean
  error: AuthError | null
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({
    isAuthenticated: false,
    user: null,
    token: null,
  })
  const [isSessionHydrated, setIsSessionHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  // Initialize session from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      const savedUser = localStorage.getItem(AUTH_USER_KEY)

      if (savedToken && savedUser) {
        const user = JSON.parse(savedUser)
        setSession({
          isAuthenticated: true,
          user,
          token: savedToken,
        })
        setAuthCookie(true)
      } else {
        setAuthCookie(false)
      }
    } catch (err) {
      console.error("Failed to hydrate session:", err)
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
      setAuthCookie(false)
    }

    setIsSessionHydrated(true)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.login(email, password)

      if (!response.user || !response.token) {
        throw new Error("Invalid response from server")
      }

      // Save to localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, response.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user))

      // Update session state
      setSession({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
      })
      setAuthCookie(true)
      return response.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError({ message: errorMessage })
      console.error("Login error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setSession({
      isAuthenticated: false,
      user: null,
      token: null,
    })
    setAuthCookie(false)
    setError(null)
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isSessionHydrated,
      login,
      logout,
      isLoading,
      error,
    }),
    [session, isSessionHydrated, login, logout, isLoading, error]
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSessionState() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSessionState must be used within a SessionProvider")
  }
  return context
}
