"use client"

import { Search } from "lucide-react"
import { useEffect } from "react"

import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  value: string
  onValueChange: (value: string) => void
  onSearch?: (query: string) => void
}

export function SearchBar({ value, onValueChange, onSearch }: SearchBarProps) {
  const query = value
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    onSearch?.(debouncedQuery)
  }, [debouncedQuery, onSearch])

  return (
    <div className="relative w-full group">
      <label htmlFor="search-books" className="sr-only">
        Search books
      </label>
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search className="h-5 w-5 text-primary/50 transition-colors group-focus-within:text-primary" />
      </div>
      <Input
        id="search-books"
        aria-label="Search books"
        value={query}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="Search books, authors, or ISBN..."
        className="h-12 pl-12 pr-4 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
      />
    </div>
  )
}
