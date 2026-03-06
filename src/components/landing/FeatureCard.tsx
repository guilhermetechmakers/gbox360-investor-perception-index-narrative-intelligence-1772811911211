import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface FeatureCardProps {
  title: string
  description: string
  tag?: string
  ctaLabel?: string
  ctaLink?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function FeatureCard({
  title,
  description,
  tag,
  ctaLabel,
  ctaLink,
  icon: Icon,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300',
        'animate-fade-in-up',
        className
      )}
    >
      <CardHeader>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-2">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {tag && (
            <Badge variant="accent" className="shrink-0">
              {tag}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>
          {description}
        </p>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        {ctaLabel && ctaLink && (
          <Button variant="ghost" size="sm" asChild className="text-accent hover:text-accent/90 -ml-2">
            <Link to={ctaLink}>{ctaLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
