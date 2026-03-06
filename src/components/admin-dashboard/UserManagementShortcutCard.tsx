import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserManagementShortcutCardProps {
  totalUsers?: number
  activeCount?: number
  disabledCount?: number
  recentVerifications?: number
  isLoading?: boolean
}

export function UserManagementShortcutCard({
  totalUsers = 0,
  activeCount = 0,
  disabledCount = 0,
  recentVerifications = 0,
  isLoading = false,
}: UserManagementShortcutCardProps) {
  return (
    <Card
      className={cn(
        'card-surface transition-all duration-300',
        'hover:shadow-card-hover hover:-translate-y-0.5'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          User management
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/users" className="flex items-center gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold tabular-nums">{totalUsers}</p>
            <p className="text-sm text-muted-foreground">
              {activeCount} active · {disabledCount} disabled
            </p>
            {recentVerifications > 0 && (
              <p className="text-xs text-muted-foreground">
                {recentVerifications} verifications in last 24h
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
