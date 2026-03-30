"use client"

import type { SearchFilters as SearchFiltersType } from "@/types/book"
import { Select } from "@/components/ui/select"

interface SearchFiltersProps {
  colleges: string[]
  value: SearchFiltersType
  onChange: (value: SearchFiltersType) => void
}

export function SearchFilters({ colleges, value, onChange }: SearchFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <label htmlFor="college-filter" className="text-xs text-muted-foreground">
          College
        </label>
        <Select
          id="college-filter"
          aria-label="Filter by college"
          value={value.college}
          onChange={(event) => onChange({ ...value, college: event.target.value })}
        >
          <option value="">All Colleges</option>
          {colleges.map((college) => (
            <option key={college} value={college}>
              {college}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1">
        <label htmlFor="availability-filter" className="text-xs text-muted-foreground">
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
        >
          <option value="all">All Availability</option>
          <option value="available">Available</option>
          <option value="issued">Issued</option>
          <option value="digital">Digital</option>
        </Select>
      </div>
    </div>
  )
}
