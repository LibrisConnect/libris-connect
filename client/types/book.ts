export type AvailabilityStatus = "available" | "issued" | "digital"

export type BookCondition = "excellent" | "good" | "fair" | "poor"

export type BorrowStatus = "borrowed" | "returned" | "overdue"

export interface BorrowPolicy {
  maxBorrowDays: number
  renewalLimit: number
  dailyFineInr: number
}

export interface BorrowHistoryItem {
  borrowerName: string
  borrowerEmail?: string
  borrowedAt: string
  dueAt: string
  returnedAt?: string
  status: BorrowStatus
  conditionOnReturn?: BookCondition
  notes?: string
}

export interface ConditionReview {
  reviewerName: string
  rating: number
  condition: BookCondition
  review: string
  createdAt: string
}

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  college: string
  description?: string
  category?: string
  publisher?: string
  publishedYear?: number
  rating?: number
  availability: AvailabilityStatus
  borrowPolicy?: BorrowPolicy
  borrowHistory?: BorrowHistoryItem[]
  conditionReviews?: ConditionReview[]
}

export interface SearchFilters {
  college: string
  availability: AvailabilityStatus | "all"
}
