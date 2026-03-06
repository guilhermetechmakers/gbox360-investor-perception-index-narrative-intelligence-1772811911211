import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="public" />
      <main className="container px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold">Privacy policy</h1>
          <Card>
            <CardHeader>
              <CardTitle>Data we collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none text-sm">
              <p>
                We collect account information (email, name, organization, role), usage data
                necessary to provide the IPI and drilldown features, and audit logs for security and
                compliance. Raw payloads from ingestion are stored in an append-only store and
                linked to narrative events for traceability.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Data type</th>
                    <th className="text-left py-2">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Account data</td>
                    <td className="py-2">Until account deletion</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Raw payloads & events</td>
                    <td className="py-2">Per data retention policy (configurable)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Audit logs</td>
                    <td className="py-2">As required for compliance</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                For privacy requests or questions:{' '}
                <a href="mailto:privacy@gbox360.com" className="text-primary hover:underline">
                  privacy@gbox360.com
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
