import { mockBooks } from "@/lib/mock-books"
import type { AvailabilityStatus, Book } from "@/types/book"

const validAvailability = new Set<AvailabilityStatus | "all">([
  "available",
  "issued",
  "digital",
  "all",
])

export function getBooks(): Book[] {
  return mockBooks
}

export function getBookById(id: string): Book | undefined {
  return mockBooks.find((book) => book.id === id)
}

export function getCollegeOptions(): string[] {
  return Array.from(new Set(mockBooks.map((book) => book.college))).sort()
}

export function isAvailabilityFilter(value: string): value is AvailabilityStatus | "all" {
  return validAvailability.has(value as AvailabilityStatus | "all")
}
