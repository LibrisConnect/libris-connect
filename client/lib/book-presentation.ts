import type { Book } from "@/types/book"

export const availabilityLabel: Record<Book["availability"], string> = {
  available: "Available",
  issued: "Issued",
  digital: "Digital",
}

export const availabilityBadgeStyles: Record<Book["availability"], string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  issued: "bg-amber-50 text-amber-700 ring-amber-600/20",
  digital: "bg-blue-50 text-blue-700 ring-blue-600/20",
}
