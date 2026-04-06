"use client"

import { Sliders } from "lucide-react"
import type { SearchFilters as SearchFiltersType } from "@/types/book"
import { Select } from "@/components/ui/select"

interface SearchFiltersProps {
  colleges: string[]
  value: SearchFiltersType
  onChange: (value: SearchFiltersType) => void
}

export function SearchFilters({ colleges, value, onChange }: SearchFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Filters</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="college-filter" className="text-sm font-medium text-foreground">
            College
          </label>
          <Select
            id="college-filter"
            aria-label="Filter by college"
            value={value.college}
            onChange={(event) => onChange({ ...value, college: event.target.value })}
            className="w-full"
          >
            <option value="">All Colleges</option>
            {colleges.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="availability-filter" className="text-sm font-medium text-foreground">
            Availability
          </label>
          <Select
            id="availability-filter"
            aria-label="Filter by availability"
            value={value.availability}
            onChange={(event) =>
              onChange({
                ...value,
                availability: event.target.value as SearchFiltersType["availability"],
              })
            }
            className="w-full"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="issued">Issued</option>
            <option value="digital">Digital</option>
          </Select>
        </div>
      </div>
    </div>
  )
}
