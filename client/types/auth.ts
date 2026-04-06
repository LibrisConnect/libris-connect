export interface AuthUser {
  _id: string
  email: string
  name: string
  role: 'student' | 'librarian' | 'admin'
  college: {
    _id: string
    name: string
    code: string
  }
  isActive: boolean
  lastLogin?: string
  createdAt?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface AuthError {
  message: string
  code?: string
}
