import { apiClient } from "@/lib/api-client"
import { getCollegeName, normalizeBooks } from "@/lib/book-normalization"
import { getBooks } from "@/services/books"
import type { Book, SearchFilters } from "@/types/book"
import type {
  GetBooksSearchQuery,
  GetBooksSearchResponse,
} from "@/types/api-contracts"

const normalize = (value: string) => value.trim().toLowerCase()

/**
 * Search books with filters - tries API first, falls back to local
 */
export async function searchBooks(query: string, filters?: SearchFilters): Promise<Book[]> {
  try {
    const normalizedQuery = normalize(query)
    const response = await apiClient.getBooks(
      normalizedQuery || undefined,
      undefined
    )

    let books = normalizeBooks(response.books || [])

    // Apply additional filtering on client side if needed
    if (filters?.college) {
      books = books.filter((book) => {
        const collegeName = getCollegeName(book.college)
        return collegeName.toLowerCase().includes(filters.college!.toLowerCase())
      })
    }

    // Filter by availability
    if (filters?.availability && filters.availability !== 'all') {
      books = books.filter((book: any) => book.availability === filters.availability)
    }

    return books
  } catch (error) {
    console.warn("Failed to search via API, using local search:", error)
    // Fallback to local search
    const books = await getBooks()
    const normalizedQuery = normalize(query)

    return books.filter((book) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalize(book.title).includes(normalizedQuery) ||
        normalize(book.author).includes(normalizedQuery) ||
        normalize(book.isbn).includes(normalizedQuery)

      const matchesCollege = !filters?.college || 
        getCollegeName(book.college).toLowerCase().includes(filters.college.toLowerCase())

      const matchesAvailability = !filters?.availability || filters.availability === 'all' || book.availability === filters.availability

      return matchesQuery && matchesCollege && matchesAvailability
    })
  }
}

export async function searchBooksByContract(
  query: GetBooksSearchQuery
): Promise<GetBooksSearchResponse> {
  const items = await searchBooks(query.q ?? "", {
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
