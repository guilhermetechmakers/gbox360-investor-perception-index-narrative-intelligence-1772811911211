import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/useAuth'
import { useSavedCompanies } from '@/hooks/useCompanies'
import { Building2, Settings } from 'lucide-react'

export function Profile() {
  const { data: user, isLoading } = useCurrentUser()
  const { data: saved } = useSavedCompanies()

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                {(user.full_name ?? user.email).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.full_name ?? 'User'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <Button variant="outline" asChild className="ml-auto">
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved companies</CardTitle>
          <CardDescription>Quick access from dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {saved && saved.length > 0 ? (
            <ul className="space-y-2">
              {saved.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Link
                    to={`/dashboard/company/${c.id}`}
                    className="text-primary hover:underline"
                  >
                    {c.name}
                    {c.ticker && ` (${c.ticker})`}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No saved companies yet.</p>
          )}
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
