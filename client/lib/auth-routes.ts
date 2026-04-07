import type { AuthUser } from "@/types/auth"

export function getRoleHomePath(role: AuthUser["role"]): string {
  switch (role) {
    case "librarian":
      return "/college-admin"
    case "admin":
      return "/admin"
    case "student":
    default:
      return "/dashboard"
  }
}