export type UserRole = 'admin' | 'operator' | 'auditor' | 'user'

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: UserRole
  org?: string
  email_verified?: boolean
  created_at: string
  updated_at: string
}

export interface UpdateUserInput {
  id: string
  full_name?: string
  avatar_url?: string
  org?: string
}
