import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="public" />
      <main className="container px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold">Terms of service</h1>
          <Card>
            <CardHeader>
              <CardTitle>Acceptance</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none text-sm">
              <p>
                By using Gbox360 you agree to these terms. The service provides an Investor
                Perception Index and narrative intelligence for audit and decision support. You are
                responsible for maintaining the confidentiality of your account and for all activity
                under your account.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Use of service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none text-sm">
              <p>
                You may not misuse the service, attempt to gain unauthorized access, or use it for
                any illegal purpose. Export and audit artifacts are for your internal use and
                compliance; redistribution may be subject to separate agreements.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Legal and terms:{' '}
                <a href="mailto:legal@gbox360.com" className="text-primary hover:underline">
                  legal@gbox360.com
                </a>
              </p>
            </CardContent>
          </Card>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
