import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Users, Lock, AlertTriangle, FileText } from 'lucide-react'

export function UserSupportActions() {
  return (
    <Card className="card-surface" aria-label="User support actions - quick links">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          User support actions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick actions for user management and audit trail
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/admin/users" aria-label="Open user management">
            <Users className="h-4 w-4 mr-2" aria-hidden />
            User management
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/admin/users" aria-label="Lock or disable a user">
            <Lock className="h-4 w-4 mr-2" aria-hidden />
            Lock / disable user
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/admin/users" aria-label="Escalate an issue">
            <AlertTriangle className="h-4 w-4 mr-2" aria-hidden />
            Escalate
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/admin/audit-exports" aria-label="View audit logs and exports">
            <FileText className="h-4 w-4 mr-2" aria-hidden />
            View audit logs
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
