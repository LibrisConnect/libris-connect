import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Shared Library Access for Every Campus
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          LibrisConnect helps students discover books across connected colleges and
          request resources without leaving one platform.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/search">Explore Books</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
