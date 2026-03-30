"use client"

import Link from "next/link"
import { BookOpen, LayoutDashboard, Search, Send } from "lucide-react"

import { useActivityState } from "@/components/providers/activity-provider"
import { useSessionState } from "@/components/providers/session-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { availabilityLabel } from "@/lib/book-presentation"
import type { RequestState } from "@/types/request"

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Search", href: "/search", icon: Search },
  { label: "My Books", href: "#", icon: BookOpen },
  { label: "Requests", href: "#", icon: Send },
]

const requestStateLabel: Record<RequestState, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  ready_for_pickup: "Ready for Pickup",
}

export default function DashboardPage() {
  const isAuthenticated = useAuthGuard()
  const { activeRequests, recentlyViewedBooks } = useActivityState()
  const { session } = useSessionState()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid flex-1 gap-6 md:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border bg-card p-3">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {session.displayName ?? "Student"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here is your library activity snapshot across colleges.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Recently Viewed</h2>
            {recentlyViewedBooks.length === 0 ? (
              <Card>
                <CardContent className="py-5 text-sm text-muted-foreground">
                  No recently viewed books yet. Open a few books from search to see them here.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {recentlyViewedBooks.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">{book.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 pb-4 text-sm text-muted-foreground">
                        <p>{book.college}</p>
                        <p>{availabilityLabel[book.availability]}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Active Requests</h2>
            {activeRequests.length === 0 ? (
              <Card>
                <CardContent className="py-5 text-sm text-muted-foreground">
                  No active requests. Use Request Access from a book details page.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.id} • {request.targetCollege}
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {requestStateLabel[request.state]}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
