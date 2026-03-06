export interface AuthResponse {
  token: string
  user: { id: string; email: string; full_name?: string; role?: string }
}

export interface SignInInput {
  email: string
  password: string
  remember?: boolean
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  org?: string
  role?: string
  invite_code?: string
}
