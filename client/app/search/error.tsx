"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold tracking-tight">Search failed</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong while loading search results.
      </p>
      <div>
        <Button onClick={reset}>Try again</Button>
      </div>
    </section>
  )
}
