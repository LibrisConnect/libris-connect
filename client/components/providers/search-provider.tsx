"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import type { SearchFilters } from "@/types/book"

interface SearchContextValue {
  searchQueryInput: string
  searchQuery: string
  searchFilters: SearchFilters
  setSearchQueryInput: (value: string) => void
  setSearchQuery: (value: string) => void
  setSearchFilters: (value: SearchFilters) => void
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined)

const initialSearchFilters: SearchFilters = {
  college: "",
  availability: "all",
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQueryInput, setSearchQueryInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(initialSearchFilters)

  const value = useMemo<SearchContextValue>(
    () => ({
      searchQueryInput,
      searchQuery,
      searchFilters,
      setSearchQueryInput,
      setSearchQuery,
      setSearchFilters,
    }),
    [searchQueryInput, searchQuery, searchFilters]
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearchState() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearchState must be used within SearchProvider")
  }
  return context
}
