import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCurrentUser, useSignOut } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Building2, LogOut, Search, User } from 'lucide-react'

interface NavbarProps {
  variant?: 'public' | 'dashboard' | 'admin'
  className?: string
}

export function Navbar({ variant = 'public', className }: NavbarProps) {
  const navigate = useNavigate()
  const { data: user, isSuccess: isAuth } = useCurrentUser()
  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-card',
        className
      )}
    >
      <div className="container flex h-14 items-center justify-between gap-4 px-4">
        <Link to={variant === 'admin' ? '/admin' : '/'} className="flex items-center gap-2 font-semibold">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">Gbox360</span>
        </Link>

        {(variant === 'dashboard' || variant === 'admin') && isAuth && (
          <div className="flex flex-1 items-center justify-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search company..."
                className="h-9 w-full rounded-full border border-input bg-muted pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value
                    if (q.trim()) navigate(`/dashboard?q=${encodeURIComponent(q.trim())}`)
                  }
                }}
              />
            </div>
          </div>
        )}

        <nav className="flex items-center gap-2">
          {variant === 'public' && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
          {(variant === 'dashboard' || variant === 'admin') && isAuth && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url} alt={user.full_name ?? user.email} />
                    <AvatarFallback>
                      {(user.full_name ?? user.email).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.full_name ?? 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={variant === 'admin' ? '/admin' : '/dashboard'}>
                    <Building2 className="mr-2 h-4 w-4" />
                    {variant === 'admin' ? 'Admin' : 'Dashboard'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  )
}
