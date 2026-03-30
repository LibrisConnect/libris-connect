import { getBooks } from "@/services/books"
import type { Book, SearchFilters } from "@/types/book"
import type {
  GetBooksSearchQuery,
  GetBooksSearchResponse,
} from "@/types/api-contracts"

const normalize = (value: string) => value.trim().toLowerCase()

export function searchBooks(query: string, filters?: SearchFilters): Book[] {
  const normalizedQuery = normalize(query)
  const books = getBooks()

  return books.filter((book) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      normalize(book.title).includes(normalizedQuery) ||
      normalize(book.author).includes(normalizedQuery) ||
      normalize(book.isbn).includes(normalizedQuery)

    const matchesCollege = !filters?.college || book.college === filters.college

    const matchesAvailability =
      !filters?.availability ||
      filters.availability === "all" ||
      book.availability === filters.availability

    return matchesQuery && matchesCollege && matchesAvailability
  })
}

export function searchBooksByContract(
  query: GetBooksSearchQuery
): GetBooksSearchResponse {
  const items = searchBooks(query.q ?? "", {
    college: query.college ?? "",
    availability: query.availability ?? "all",
  })

  return {
    items,
    total: items.length,
  }
}

// Temporary compatibility alias while migrating callers.
export const mockSearchBooks = searchBooks
