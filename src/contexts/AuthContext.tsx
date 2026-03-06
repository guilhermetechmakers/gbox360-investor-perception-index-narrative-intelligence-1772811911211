/**
 * Auth context — syncs Supabase session with app state, handles redirects.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { authKeys } from '@/hooks/useAuth'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  hasSession: boolean
}

const AuthContext = createContext<AuthContextValue>({
  status: 'loading',
  hasSession: false,
})

export function useAuthStatus() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    return { status: 'loading' as AuthStatus, hasSession: false }
  }
  return ctx
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [hasSession, setHasSession] = useState(false)
  const queryClient = useQueryClient()

  const updateSession = useCallback(async () => {
    if (!supabase) {
      const token =
        typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
      setHasSession(!!token)
      setStatus(token ? 'authenticated' : 'unauthenticated')
      return
    }
    const { data } = await supabase.auth.getSession()
    const session = data?.session ?? null
    const token = session?.access_token ?? null
    if (token && typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token)
    } else if (typeof localStorage !== 'undefined' && !session) {
      localStorage.removeItem('auth_token')
    }
    setHasSession(!!session)
    setStatus(session ? 'authenticated' : 'unauthenticated')
    if (session) {
      queryClient.invalidateQueries({ queryKey: authKeys.user })
    }
  }, [queryClient])

  useEffect(() => {
    updateSession()
    if (!supabase) return
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const token = session?.access_token ?? null
      if (token && typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', token)
      } else if (typeof localStorage !== 'undefined' && !session) {
        localStorage.removeItem('auth_token')
      }
      setHasSession(!!session)
      setStatus(session ? 'authenticated' : 'unauthenticated')
      queryClient.invalidateQueries({ queryKey: authKeys.user })
    })
    return () => subscription.unsubscribe()
  }, [updateSession, queryClient])

  return (
    <AuthContext.Provider value={{ status, hasSession }}>
      {children}
    </AuthContext.Provider>
  )
}
