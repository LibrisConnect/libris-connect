export type AvailabilityStatus = "available" | "issued" | "digital"

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  college: string
  availability: AvailabilityStatus
}

export interface SearchFilters {
  college: string
  availability: AvailabilityStatus | "all"
}
