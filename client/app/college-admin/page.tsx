"use client"

import { useEffect, useMemo, useState } from "react"
import { BookOpen, CheckCircle2, PlusCircle, Trash2, XCircle } from "lucide-react"

import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useSessionState } from "@/components/providers/session-provider"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AdminBook = {
  _id: string
  title: string
  author: string
  availability?: { total?: number; available?: number }
  college?: { _id?: string; name?: string }
}

type JoinRequest = {
  _id: string
  email: string
  name: string
  status: "pending" | "approved" | "rejected"
  reason?: string
  createdAt: string
}

type BookRequest = {
  _id: string
  status: "pending_approval" | "approved" | "ready_for_pickup" | "rejected"
  createdAt: string
  requester?: {
    _id?: string
    name?: string
    email?: string
  }
  book?: {
    _id?: string
    title?: string
  }
}

const initialForm = {
  title: "",
  author: "",
  category: "",
  isbn: "",
  description: "",
  publisher: "",
  publishedYear: "",
}

export default function CollegeAdminPage() {
  const isAllowed = useAuthGuard(["librarian"])
  const { session } = useSessionState()
  const [books, setBooks] = useState<AdminBook[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isProcessingRequestId, setIsProcessingRequestId] = useState<string | null>(null)
  const [isProcessingBookRequestId, setIsProcessingBookRequestId] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState<string | null>(null)

  const myCollegeId = session.user?.college?._id

  const myBooks = useMemo(
    () => books.filter((book) => !myCollegeId || book.college?._id === myCollegeId),
    [books, myCollegeId]
  )

  const loadBooks = async () => {
    setLoading(true)
    try {
      const [booksResponse, requestsResponse, bookRequestsResponse] = await Promise.all([
        apiClient.getBooks(undefined, undefined, 1, 100),
        apiClient.getJoinRequests("pending"),
        apiClient.getBookRequests("pending_approval"),
      ])

      setBooks(booksResponse.books ?? [])
      setJoinRequests(requestsResponse.requests ?? [])
      setBookRequests(bookRequestsResponse.requests ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAllowed) {
      loadBooks()
    }
  }, [isAllowed])

  const handleCreateBook = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!session.user?.college?._id) {
      setMessage("Unable to identify your college.")
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      await apiClient.createBook({
        title: form.title,
        author: form.author,
        category: form.category,
        isbn: form.isbn || undefined,
        description: form.description,
        publisher: form.publisher,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
        college: session.user.college._id,
        availability: { total: 1, available: 1 },
      })

      setForm(initialForm)
      setMessage("Book added successfully.")
      await loadBooks()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add book")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    try {
      await apiClient.deleteBook(bookId)
      setMessage("Book deleted.")
      await loadBooks()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete book")
    }
  }

  const handleRequestDecision = async (
    requestId: string,
    decision: "approved" | "rejected"
  ) => {
    setIsProcessingRequestId(requestId)
    setMessage(null)

    try {
      const response = await apiClient.decideJoinRequest(requestId, decision)

      if (response.createdUser?.email && response.createdUser?.defaultPassword) {
        setMessage(
          `Approved ${response.createdUser.email}. Temporary password: ${response.createdUser.defaultPassword}`
        )
      } else {
        setMessage(response.message || "Request updated")
      }

      await loadBooks()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to process request")
    } finally {
      setIsProcessingRequestId(null)
    }
  }

  const handleBookRequestDecision = async (
    requestId: string,
    decision: "approved" | "rejected"
  ) => {
    setIsProcessingBookRequestId(requestId)
    setMessage(null)

    try {
      const response = await apiClient.decideBookRequest(requestId, decision)
      setMessage(response.message || "Book request updated")
      await loadBooks()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to process book request")
    } finally {
      setIsProcessingBookRequestId(null)
    }
  }

  if (!isAllowed) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-accent/10 p-6">
        <h1 className="text-3xl font-bold tracking-tight">College Admin Panel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage catalog books for {session.user?.college?.name ?? "your college"}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlusCircle className="h-5 w-5" />
              Add New Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBook} className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              <Input placeholder="Author" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} required />
              <Input placeholder="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required />
              <Input placeholder="ISBN" value={form.isbn} onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))} />
              <Input placeholder="Publisher" value={form.publisher} onChange={(e) => setForm((p) => ({ ...p, publisher: e.target.value }))} />
              <Input placeholder="Published Year" type="number" value={form.publishedYear} onChange={(e) => setForm((p) => ({ ...p, publishedYear: e.target.value }))} />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Adding..." : "Add Book"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              College Books ({myBooks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading books...</p>
            ) : myBooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No books found for your college yet.</p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {myBooks.map((book) => (
                  <div key={book._id} className="rounded-lg border border-border/40 p-3 text-sm">
                    <p className="font-semibold text-foreground">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {book.availability?.available ?? 0}/{book.availability?.total ?? 0} available
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBook(book._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Pending Join Requests ({joinRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading requests...</p>
          ) : joinRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests for your college.</p>
          ) : (
            <div className="space-y-3">
              {joinRequests.map((request) => {
                const isProcessing = isProcessingRequestId === request._id

                return (
                  <div key={request._id} className="rounded-lg border border-border/40 p-3 text-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{request.name}</p>
                        <p className="text-xs text-muted-foreground">{request.email}</p>
                        {request.reason ? (
                          <p className="mt-2 text-xs text-muted-foreground">Reason: {request.reason}</p>
                        ) : null}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Requested {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequestDecision(request._id, "approved")}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isProcessing ? "Processing..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestDecision(request._id, "rejected")}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Pending Book Requests ({bookRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading requests...</p>
          ) : bookRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending book requests for your college.</p>
          ) : (
            <div className="space-y-3">
              {bookRequests.map((request) => {
                const isProcessing = isProcessingBookRequestId === request._id

                return (
                  <div key={request._id} className="rounded-lg border border-border/40 p-3 text-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{request.book?.title || "Unknown Book"}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested by {request.requester?.name || "Unknown User"} ({request.requester?.email || "No Email"})
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Requested {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleBookRequestDecision(request._id, "approved")}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isProcessing ? "Processing..." : "Mark Ready"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookRequestDecision(request._id, "rejected")}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {message ? (
        <p className="rounded-lg border border-border/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </section>
  )
}