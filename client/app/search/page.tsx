"use client"

import { useEffect, useMemo, useRef, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useSearchState } from "@/components/providers/search-provider"
import { BookGrid } from "@/components/book-grid"
import { SearchBar } from "@/components/search-bar"
import { SearchFilters } from "@/components/search-filters"
import { searchBooks } from "@/services/search-service"
import { getCollegeOptions, isAvailabilityFilter } from "@/services/books"

export default function SearchPage() {
  const {
    searchQueryInput,
    searchQuery,
    searchFilters,
    setSearchQueryInput,
    setSearchQuery,
    setSearchFilters,
  } = useSearchState()
  const [isPending, startTransition] = useTransition()
  const isSyncingFromUrl = useRef(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filteredBooks = useMemo(
    () => searchBooks(searchQuery, searchFilters),
    [searchQuery, searchFilters]
  )

  const collegeOptions = useMemo(() => getCollegeOptions(), [])
  const isSearching = searchQueryInput !== searchQuery || isPending
  const resultLabel =
    filteredBooks.length === 1 ? "1 book found" : `${filteredBooks.length} books found`

  useEffect(() => {
    const queryFromUrl = searchParams.get("q") ?? ""
    const collegeFromUrl = searchParams.get("college") ?? ""
    const availabilityFromUrl = searchParams.get("availability") ?? "all"

    const availability = isAvailabilityFilter(availabilityFromUrl)
      ? availabilityFromUrl
      : "all"

    if (queryFromUrl !== searchQueryInput) {
      setSearchQueryInput(queryFromUrl)
    }

    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl)
    }

    if (
      collegeFromUrl !== searchFilters.college ||
      availability !== searchFilters.availability
    ) {
      isSyncingFromUrl.current = true
      setSearchFilters({
        college: collegeFromUrl,
        availability,
      })
    }

    if (queryFromUrl !== searchQueryInput || queryFromUrl !== searchQuery) {
      isSyncingFromUrl.current = true
    }
  }, [
    searchParams,
    searchQueryInput,
    searchQuery,
    searchFilters.college,
    searchFilters.availability,
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
    if (searchQueryInput) {
      nextParams.set("q", searchQueryInput)
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
      router.replace(
        nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
        { scroll: false }
      )
    }
  }, [searchQueryInput, searchFilters, searchParams, pathname, router])

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Search Books</h1>
        <p className="text-sm text-muted-foreground">
          Discover resources across colleges using title, author, ISBN, and availability.
        </p>
      </div>

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

      <p className="text-sm text-muted-foreground">
        {isSearching ? "Updating results..." : resultLabel}
      </p>

      <BookGrid books={filteredBooks} isLoading={isSearching} />
    </section>
  )
}
