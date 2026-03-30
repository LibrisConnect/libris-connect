import type { Metadata } from "next"

import { ActivityProvider } from "@/components/providers/activity-provider"
import { SearchProvider } from "@/components/providers/search-provider"
import { SessionProvider } from "@/components/providers/session-provider"
import { TopNavbar } from "@/components/top-navbar"
import "./globals.css"

export const metadata: Metadata = {
  title: "LibrisConnect",
  description: "Multi-tenant library resource sharing platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        <SessionProvider>
          <SearchProvider>
            <ActivityProvider>
              <div className="min-h-screen">
                <TopNavbar />
                <main>{children}</main>
              </div>
            </ActivityProvider>
          </SearchProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
