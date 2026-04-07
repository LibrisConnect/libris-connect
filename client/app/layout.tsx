import type { Metadata } from "next"

import { ActivityProvider } from "@/components/providers/activity-provider"
import { SearchProvider } from "@/components/providers/search-provider"
import { SessionProvider } from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { TopNavbar } from "@/components/top-navbar"
import "./globals.css"

export const metadata: Metadata = {
  title: "LibrisConnect - Shared Library Access",
  description: "Multi-tenant library resource sharing platform for connected universities",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <SessionProvider>
            <SearchProvider>
              <ActivityProvider>
                <div className="min-h-screen flex flex-col">
                  <TopNavbar />
                  <main className="flex-1">{children}</main>
                </div>
              </ActivityProvider>
            </SearchProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
