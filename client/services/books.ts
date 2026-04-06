import { apiClient } from "@/lib/api-client"
import { mockBooks } from "@/lib/mock-books"
import type { AvailabilityStatus, Book } from "@/types/book"

const validAvailability = new Set<AvailabilityStatus | "all">([
  "available",
  "issued",
  "digital",
  "all",
])

let cachedBooks: Book[] | null = null

/**
 * Fetch books from MongoDB backend, fallback to mock data
 */
export async function getBooks(): Promise<Book[]> {
  try {
    if (cachedBooks) return cachedBooks

    const response = await apiClient.getBooks()
    cachedBooks = (response && response.books) ? response.books : []
    return cachedBooks || []
  } catch (error) {
    console.warn("Failed to fetch books from API, using mock data:", error)
    return mockBooks
  }
}

export function getBookById(id: string): Book | undefined {
  // Try to find in mock data (sync operation)
  return mockBooks.find((book) => book.id === id)
}

export async function getBookByIdFromAPI(id: string): Promise<Book | null> {
  try {
    return await apiClient.getBook(id)
  } catch (error) {
    console.error("Failed to fetch book:", error)
    return null
  }
}

export async function getCollegeOptions(): Promise<string[]> {
  try {
    const books = await getBooks()
    return Array.from(new Set(books.map((book: any) => book.college?.name || ""))).filter(Boolean).sort()
  } catch (error) {
    return []
  }
}

export function isAvailabilityFilter(value: string): value is AvailabilityStatus | "all" {
  return validAvailability.has(value as AvailabilityStatus | "all")
}
