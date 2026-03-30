import type { AvailabilityStatus, Book } from "@/types/book"
import type { LibraryRequest } from "@/types/request"

export interface ApiErrorResponse {
  error: {
    code:
      | "BAD_REQUEST"
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "CONFLICT"
      | "INTERNAL_ERROR"
    message: string
    details?: string
  }
}

// GET /api/books/search?q=&college=&availability=
export interface GetBooksSearchQuery {
  q?: string
  college?: string
  availability?: AvailabilityStatus | "all"
}

export interface GetBooksSearchResponse {
  items: Book[]
  total: number
}

// GET /api/books/:id
export type GetBookByIdResponse = Book

// POST /api/requests
export interface CreateRequestBody {
  bookId: string
}

export interface CreateRequestResponse {
  request: LibraryRequest
}

// GET /api/requests/me
export interface GetMyRequestsResponse {
  requests: LibraryRequest[]
}
