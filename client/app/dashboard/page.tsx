"use client"

import Link from "next/link"
import { BookOpen, LayoutDashboard, Search, Send, BookMarked, Clock, CheckCircle } from "lucide-react"

import { useActivityState } from "@/components/providers/activity-provider"
import { useSessionState } from "@/components/providers/session-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { availabilityLabel } from "@/lib/book-presentation"
import type { RequestState } from "@/types/request"

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, disabled: false },
  { label: "Search", href: "/search", icon: Search, disabled: false },
  { label: "My Books", icon: BookOpen, disabled: true },
  { label: "Requests", icon: Send, disabled: true },
]

const requestStateLabel: Record<RequestState, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  ready_for_pickup: "Ready for Pickup",
}

const getRequestStateIcon = (state: RequestState) => {
  switch(state) {
    case 'pending_approval': return <Clock className="h-4 w-4" />
    case 'approved': return <CheckCircle className="h-4 w-4" />
    case 'ready_for_pickup': return <BookMarked className="h-4 w-4" />
  }
}

const getRequestStateColor = (state: RequestState) => {
  switch(state) {
    case 'pending_approval': return 'from-orange-500/20 to-amber-500/20 text-orange-700 border-orange-200'
    case 'approved': return 'from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-200'
    case 'ready_for_pickup': return 'from-green-500/20 to-emerald-500/20 text-green-700 border-green-200'
  }
}

export default function DashboardPage() {
  const isAuthenticated = useAuthGuard()
  const { activeRequests, recentlyViewedBooks } = useActivityState()
  const { session } = useSessionState()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-b from-background to-muted/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid flex-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 lg:h-fit rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/20 p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon

                if (item.disabled) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm text-muted-foreground/60 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide">Soon</span>
                    </div>
                  )
                }

                if (!item.href) {
                  return null
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            {/* Welcome Card */}
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 border-primary/20">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{session.user?.name ?? "Student"}</span>
              </h1>
              <p className="text-base text-muted-foreground">
                Check your library activity and book requests across connected colleges.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 rounded-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recently Viewed</p>
                      <p className="text-3xl font-bold text-primary">{recentlyViewedBooks.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 rounded-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Requests</p>
                      <p className="text-3xl font-bold text-secondary">{activeRequests.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <Send className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 rounded-xl sm:col-span-2 lg:col-span-1">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Approval</p>
                      <p className="text-3xl font-bold text-accent">
                        {activeRequests.filter(r => r.state === 'pending_approval').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/10">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recently Viewed Section */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-1">Recently Viewed Books</h2>
                <p className="text-sm text-muted-foreground">Books you've checked out recently</p>
              </div>
              {recentlyViewedBooks.length === 0 ? (
                <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="py-8 text-center">
                    <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No recently viewed books yet.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Start exploring the search page to build your activity.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentlyViewedBooks.map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`} className="group">
                      <Card className="h-full border-border/50 bg-gradient-to-br from-card to-muted/20 transition-all duration-300 hover:shadow-md hover:border-primary/30 rounded-xl">
                        <CardHeader>
                          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">{book.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">By {book.author}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{book.college}</span>
                              <span className="text-primary font-semibold">{availabilityLabel[book.availability]}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Active Requests Section */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-1">Active Requests</h2>
                <p className="text-sm text-muted-foreground">Your book requests and their status</p>
              </div>
              {activeRequests.length === 0 ? (
                <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="py-8 text-center">
                    <Send className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No active requests yet.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Request books from the search page to see them here.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeRequests.map((request) => (
                    <Card key={request.id} className="border-border/50 bg-gradient-to-br from-card to-muted/20 rounded-xl overflow-hidden">
                      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{request.title}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="px-2 py-1 rounded bg-muted">{request.id}</span>
                            <span>•</span>
                            <span>{request.targetCollege}</span>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 bg-gradient-to-r ${getRequestStateColor(request.state)} ring-current/20 whitespace-nowrap`}>
                          {getRequestStateIcon(request.state)}
                          {requestStateLabel[request.state]}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
