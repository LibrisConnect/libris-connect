"use client"

import { useEffect, useMemo, useRef, useTransition, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useSearchState } from "@/components/providers/search-provider"
import { BookGrid } from "@/components/book-grid"
import { SearchBar } from "@/components/search-bar"
import { SearchFilters } from "@/components/search-filters"
import { searchBooks } from "@/services/search-service"
import { getCollegeOptions, isAvailabilityFilter } from "@/services/books"
import type { Book } from "@/types/book"

export default function SearchPage() {
  const {
    searchQueryInput,
    searchQuery,
    searchFilters,
    setSearchQueryInput,
    setSearchQuery,
    setSearchFilters,
  } = useSearchState()
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [collegeOptions, setCollegeOptions] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const isSyncingFromUrl = useRef(false)
  const isSyncingToUrl = useRef(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Fetch books when search query or filters change
  useEffect(() => {
    startTransition(async () => {
      try {
        const results = await searchBooks(searchQuery, searchFilters)
        setFilteredBooks(results)
      } catch (error) {
        console.error("Search failed:", error)
        setFilteredBooks([])
      }
    })
  }, [searchQuery, searchFilters])

  // Fetch college options on mount
  useEffect(() => {
    startTransition(async () => {
      try {
        const options = await getCollegeOptions()
        setCollegeOptions(options)
      } catch (error) {
        console.error("Failed to fetch college options:", error)
      }
    })
  }, [])
  const isSearching = searchQueryInput !== searchQuery || isPending
  const resultLabel =
    filteredBooks.length === 1 ? "1 book found" : `${filteredBooks.length} books found`

  useEffect(() => {
    if (isSyncingToUrl.current) {
      isSyncingToUrl.current = false
      return
    }

    const queryFromUrl = searchParams.get("q") ?? ""
    const collegeFromUrl = searchParams.get("college") ?? ""
    const availabilityFromUrl = searchParams.get("availability") ?? "all"

    const availability = isAvailabilityFilter(availabilityFromUrl)
      ? availabilityFromUrl
      : "all"

    isSyncingFromUrl.current = true
    setSearchQueryInput(queryFromUrl)
    setSearchQuery(queryFromUrl)
    setSearchFilters({
      college: collegeFromUrl,
      availability,
    })
  }, [
    searchParams,
    setSearchQueryInput,
    setSearchQuery,
    setSearchFilters,
  ])

  useEffect(() => {
    if (isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false
      return
    }

    const nextParams = new URLSearchParams()
    if (searchQuery) {
      nextParams.set("q", searchQuery)
    }
    if (searchFilters.college) {
      nextParams.set("college", searchFilters.college)
    }
    if (searchFilters.availability !== "all") {
      nextParams.set("availability", searchFilters.availability)
    }

    const nextQueryString = nextParams.toString()
    const currentQueryString = searchParams.toString()

    if (nextQueryString !== currentQueryString) {
      isSyncingToUrl.current = true
      router.replace(
        nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
        { scroll: false }
      )
    }
  }, [searchQuery, searchFilters, searchParams, pathname, router])

  return (
    <section className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-b from-background to-muted/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Books
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Search across all connected colleges using title, author, ISBN, and filters. Find your next read instantly.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-6">
          <SearchBar
            value={searchQueryInput}
            onValueChange={setSearchQueryInput}
            onSearch={setSearchQuery}
          />
          <SearchFilters
            colleges={collegeOptions}
            value={searchFilters}
            onChange={(nextFilters) => {
              startTransition(() => {
                setSearchFilters(nextFilters)
              })
            }}
          />
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  Searching books...
                </span>
              ) : (
                <span className="text-foreground">
                  Found <span className="text-primary font-bold">{filteredBooks.length}</span> {filteredBooks.length === 1 ? 'book' : 'books'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <BookGrid books={filteredBooks} isLoading={isSearching} />
      </div>
    </section>
  )
}
