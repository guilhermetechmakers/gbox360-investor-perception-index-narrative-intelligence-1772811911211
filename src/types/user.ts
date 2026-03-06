export type UserRole = 'admin' | 'operator' | 'auditor' | 'user'

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: UserRole
  org?: string
  locale?: string
  timezone?: string
  email_verified?: boolean
  created_at: string
  updated_at: string
}

export interface UpdateUserInput {
  id: string
  full_name?: string
  avatar_url?: string
  org?: string
  role?: UserRole
  roles?: string[]
  locale?: string
  timezone?: string
}

export interface UserWithAdminFields extends User {
  last_login?: string
  roles?: string[]
}
