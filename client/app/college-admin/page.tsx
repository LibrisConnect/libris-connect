"use client"

import { useEffect, useMemo, useState } from "react"
import { BookOpen, PlusCircle, Trash2 } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
      const response = await apiClient.getBooks(undefined, undefined, 1, 100)
      setBooks(response.books ?? [])
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

      {message ? (
        <p className="rounded-lg border border-border/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </section>
  )
}