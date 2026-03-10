import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types/user'
import { EditProfileModal } from './EditProfileModal'
import { EmptyState } from './EmptyState'

export interface UserInfoCardProps {
  user: User | null | undefined
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  onProfileUpdated?: () => void
}

function maskEmail(email: string): string {
  if (!email || email.length < 5) return '•••'
  const [local, domain] = email.split('@')
  if (!domain) return '•••'
  const masked = local.length > 2 ? local.slice(0, 2) + '•••' : '•••'
  return `${masked}@${domain}`
}

const EMPTY_MIN_HEIGHT = 'min-h-[180px]'

export function UserInfoCard({ user, isLoading, isError, onRetry, onProfileUpdated }: UserInfoCardProps) {
  const [editOpen, setEditOpen] = useState(false)

  const name = user?.full_name ?? user?.email ?? 'User'
  const email = user?.email ?? ''
  const role = user?.role ?? 'user'
  const org = user?.org ?? ''
  const avatarUrl = typeof user?.avatar_url === 'string' ? user.avatar_url : undefined

  if (isLoading) {
    return (
      <Card
        className="card-surface transition-all duration-200 hover:shadow-card-hover"
        aria-busy="true"
        aria-label="Loading profile"
      >
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <EmptyState
            icon={<AlertCircle className="h-6 w-6 text-destructive" />}
            title="Couldn't load your profile"
            description="Something went wrong while loading your profile. Check your connection and try again."
            action={
              onRetry ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry()}
                  className="gap-2"
                  aria-label="Retry loading profile"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Try again
                </Button>
              ) : null
            }
            className={EMPTY_MIN_HEIGHT}
          />
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card
        className="card-surface transition-all duration-200 hover:shadow-card-hover"
        aria-label="Your profile information"
      >
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="text-lg font-semibold">
                  {(name ?? 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{name}</h2>
                <p className="text-sm text-muted-foreground">
                  {email ? maskEmail(email) : '—'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {role && (
                    <Badge variant="accent" className="text-xs">
                      {role}
                    </Badge>
                  )}
                  {org && (
                    <Badge variant="secondary" className="text-xs">
                      {org}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className={cn(
                'shrink-0 transition-all duration-200',
                'hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring'
              )}
              aria-label="Edit profile"
            >
              <Pencil className="mr-2 h-4 w-4" aria-hidden />
              Edit
            </Button>
          </div>
        </CardHeader>
      </Card>

      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user ?? null}
        onSuccess={onProfileUpdated}
      />
    </>
  )
}
