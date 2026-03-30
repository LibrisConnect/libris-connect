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
    <div className="relative w-full">
      <label htmlFor="search-books" className="sr-only">
        Search books
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="search-books"
        aria-label="Search books"
        value={query}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="Search books, authors, ISBN..."
        className="h-10 pl-9"
      />
    </div>
  )
}
