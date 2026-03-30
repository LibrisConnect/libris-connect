export type RequestState = "pending_approval" | "approved" | "ready_for_pickup"

export interface LibraryRequest {
  id: string
  bookId: string
  title: string
  targetCollege: string
  state: RequestState
  createdAt: string
}
