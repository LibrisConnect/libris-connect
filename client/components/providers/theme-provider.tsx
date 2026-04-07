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

type ThemeMode = "light" | "dark"

interface ThemeContextValue {
  theme: ThemeMode
  isHydrated: boolean
  toggleTheme: () => void
}

const THEME_KEY = "libris_theme"

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function resolveInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light"
  }

  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const initialTheme = resolveInitialTheme()
    setTheme(initialTheme)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    localStorage.setItem(THEME_KEY, theme)
  }, [theme, isHydrated])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isHydrated,
      toggleTheme,
    }),
    [theme, isHydrated, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeState() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useThemeState must be used within ThemeProvider")
  }
  return context
}