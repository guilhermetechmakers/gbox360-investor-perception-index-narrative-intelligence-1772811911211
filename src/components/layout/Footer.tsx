import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Building2 className="h-6 w-6 text-primary" />
              Gbox360
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Explainable narrative intelligence for the Investor Perception Index. 
              Audit-first, transparent, and board-credible.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About & Help</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/about#methodology" className="hover:text-foreground">Methodology</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {currentYear} Gbox360. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
