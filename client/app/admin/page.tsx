"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, Users, BookOpen, ShieldCheck, PencilLine, PlusCircle } from "lucide-react"

import { useAuthGuard } from "@/hooks/use-auth-guard"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type College = {
  _id: string
  name: string
  code: string
  city: string
  state: string
}

type Book = {
  _id: string
  college?: { _id?: string; name?: string }
}

export default function AdminPage() {
  const isAllowed = useAuthGuard(["admin"])
  const [colleges, setColleges] = useState<College[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [collegeQuery, setCollegeQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingCollegeId, setEditingCollegeId] = useState<string | null>(null)
  const [collegeForm, setCollegeForm] = useState({
    name: "",
    code: "",
    city: "",
    state: "",
    email: "",
    tier: "tier2",
    libraryName: "",
    contactPerson: "",
    phone: "",
    isActive: true,
  })

  useEffect(() => {
    if (!isAllowed) return

    const load = async () => {
      setLoading(true)
      try {
        const [collegeResponse, booksResponse] = await Promise.all([
          apiClient.getColleges(),
          apiClient.getBooks(undefined, undefined, 1, 200),
        ])
        setColleges(collegeResponse.colleges ?? [])
        setBooks(booksResponse.books ?? [])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isAllowed])

  const loadData = async () => {
    setLoading(true)
    try {
      const [collegeResponse, booksResponse] = await Promise.all([
        apiClient.getColleges(),
        apiClient.getBooks(undefined, undefined, 1, 200),
      ])
      setColleges(collegeResponse.colleges ?? [])
      setBooks(booksResponse.books ?? [])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCollegeForm({
      name: "",
      code: "",
      city: "",
      state: "",
      email: "",
      tier: "tier2",
      libraryName: "",
      contactPerson: "",
      phone: "",
      isActive: true,
    })
    setEditingCollegeId(null)
  }

  const handleCollegeSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (editingCollegeId) {
        await apiClient.updateCollege(editingCollegeId, collegeForm)
        setMessage("College updated successfully.")
      } else {
        await apiClient.createCollege(collegeForm)
        setMessage("College created successfully.")
      }
      resetForm()
      await loadData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save college")
    } finally {
      setSaving(false)
    }
  }

  const startEditCollege = async (collegeId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/colleges/${collegeId}`)
      if (!response.ok) {
        throw new Error("Unable to fetch college details")
      }
      const payload = await response.json()
      const college = payload.college
      setEditingCollegeId(college._id)
      setCollegeForm({
        name: college.name ?? "",
        code: college.code ?? "",
        city: college.city ?? "",
        state: college.state ?? "",
        email: college.email ?? "",
        tier: college.tier ?? "tier2",
        libraryName: college.libraryName ?? "",
        contactPerson: college.contactPerson ?? "",
        phone: college.phone ?? "",
        isActive: college.isActive ?? true,
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load college")
    }
  }

  const booksByCollege = useMemo(() => {
    const counts = new Map<string, number>()
    for (const book of books) {
      const key = book.college?.name ?? "Unknown"
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [books])

  const filteredColleges = useMemo(() => {
    const normalizedQuery = collegeQuery.trim().toLowerCase()
    if (!normalizedQuery) return colleges

    return colleges.filter((college) => {
      return (
        college.name.toLowerCase().includes(normalizedQuery) ||
        college.code.toLowerCase().includes(normalizedQuery) ||
        college.city.toLowerCase().includes(normalizedQuery) ||
        college.state.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [collegeQuery, colleges])

  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredColleges.length / pageSize))
  const paginatedColleges = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    const start = (safePage - 1) * pageSize
    return filteredColleges.slice(start, start + pageSize)
  }, [currentPage, filteredColleges, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [collegeQuery])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (!isAllowed) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-secondary/15 to-primary/10 p-6">
        <h1 className="text-3xl font-bold tracking-tight">System Admin Console</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor colleges, platform catalog, and global health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Colleges</p>
                <p className="text-2xl font-bold">{loading ? "..." : colleges.length}</p>
              </div>
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{loading ? "..." : books.length}</p>
              </div>
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Role Scope</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Users className="h-5 w-5 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Security</p>
                <p className="text-2xl font-bold">Healthy</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>College Catalog Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search colleges by name, code, city, state"
              value={collegeQuery}
              onChange={(e) => setCollegeQuery(e.target.value)}
              className="sm:max-w-sm"
            />
            <span className="text-xs text-muted-foreground">
              Showing {paginatedColleges.length} of {filteredColleges.length} colleges
            </span>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading distribution...</p>
          ) : (
            <div className="space-y-2">
              {paginatedColleges.map((college) => (
                <div key={college._id} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{college.name}</p>
                    <p className="text-xs text-muted-foreground">{college.code} • {college.city}, {college.state}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {booksByCollege.get(college.name) ?? 0} books
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditCollege(college._id)}
                      className="h-7 px-2"
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            {editingCollegeId ? "Update College" : "Create College"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCollegeSubmit} className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="College Name" value={collegeForm.name} onChange={(e) => setCollegeForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input placeholder="Code" value={collegeForm.code} onChange={(e) => setCollegeForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} required />
            <Input placeholder="City" value={collegeForm.city} onChange={(e) => setCollegeForm((p) => ({ ...p, city: e.target.value }))} required />
            <Input placeholder="State" value={collegeForm.state} onChange={(e) => setCollegeForm((p) => ({ ...p, state: e.target.value }))} required />
            <Input placeholder="Email" type="email" value={collegeForm.email} onChange={(e) => setCollegeForm((p) => ({ ...p, email: e.target.value }))} required />
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={collegeForm.tier}
              onChange={(e) => setCollegeForm((p) => ({ ...p, tier: e.target.value }))}
            >
              <option value="tier1">Tier 1</option>
              <option value="tier2">Tier 2</option>
              <option value="tier3">Tier 3</option>
            </select>
            <Input placeholder="Library Name" value={collegeForm.libraryName} onChange={(e) => setCollegeForm((p) => ({ ...p, libraryName: e.target.value }))} />
            <Input placeholder="Contact Person" value={collegeForm.contactPerson} onChange={(e) => setCollegeForm((p) => ({ ...p, contactPerson: e.target.value }))} />
            <Input placeholder="Phone" value={collegeForm.phone} onChange={(e) => setCollegeForm((p) => ({ ...p, phone: e.target.value }))} />
            <div className="flex items-center gap-2 text-sm">
              <input
                id="isActive"
                type="checkbox"
                checked={collegeForm.isActive}
                onChange={(e) => setCollegeForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <label htmlFor="isActive">Active College</label>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : editingCollegeId ? "Update College" : "Create College"}</Button>
              {editingCollegeId ? (
                <Button type="button" variant="outline" onClick={resetForm}>Cancel Edit</Button>
              ) : null}
            </div>
          </form>
          {message ? (
            <p className="mt-3 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}