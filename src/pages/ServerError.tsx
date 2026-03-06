import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export function ServerError() {
  const [requestId] = useState(() => `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up text-center">
        <CardHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We encountered a server error. Please try again or contact support with the details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted px-3 py-2 text-left text-xs font-mono text-muted-foreground">
            <p>Request ID: {requestId}</p>
            <p>Time: {new Date().toISOString()}</p>
          </div>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <a
            href="mailto:support@gbox360.com?subject=Server%20Error"
            className="block text-sm text-primary hover:underline"
          >
            Contact support
          </a>
          <Button variant="outline" asChild className="w-full">
            <Link to="/">Go to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
