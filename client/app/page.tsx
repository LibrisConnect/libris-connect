import Link from "next/link"
import { ArrowRight, BookOpen, Zap, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <section className="min-h-[calc(100vh-4rem)] w-full">
      {/* Hero Section */}
      <div className="mx-auto flex flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8 max-w-5xl">
        <div className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          <p className="font-medium text-primary">Connecting Libraries, Empowering Readers</p>
        </div>

        <h1 className="text-center text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Shared Library Access
          </span>
          <br />
          <span className="text-foreground">for Every Campus</span>
        </h1>

        <p className="text-center text-lg text-muted-foreground mb-8 max-w-2xl">
          LibrisConnect helps students discover books across connected colleges and
          request resources seamlessly. Access thousands of books from multiple institutions
          without leaving one platform.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Button 
            asChild 
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 text-base h-11 px-8"
          >
            <Link href="/search">
              Explore Books
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="border-primary/30 hover:bg-primary/5 text-base h-11 px-8"
          >
            <Link href="/login">Get Started</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16">
          <div className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/30 p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
            <p className="text-muted-foreground">
              Access books across multiple college libraries with a single search query.
            </p>
          </div>

          <div className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/30 p-8 hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
            <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 group-hover:from-secondary/30 group-hover:to-primary/30 transition-all">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick Requests</h3>
            <p className="text-muted-foreground">
              Request books and manage your bookings with an intuitive dashboard.
            </p>
          </div>

          <div className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/30 p-8 hover:border-accent/30 hover:shadow-lg transition-all duration-300">
            <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 group-hover:from-accent/30 group-hover:to-primary/30 transition-all">
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Campus</h3>
            <p className="text-muted-foreground">
              Connect with students and libraries across multiple institutions.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 border border-primary/20 p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to explore more books?</h2>
          <p className="text-muted-foreground mb-8">
            Start browsing our collection of thousands of books from connected universities.
          </p>
          <Button 
            asChild
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30"
          >
            <Link href="/search">Start Exploring</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
