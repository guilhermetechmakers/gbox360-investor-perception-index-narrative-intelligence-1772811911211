import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Users, Lock, AlertTriangle, FileText } from 'lucide-react'

export function UserSupportActions() {
  return (
    <Card className="card-surface">
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
          <Link to="/admin/users">
            <Users className="h-4 w-4 mr-2" />
            User management
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/admin/users">
            <Lock className="h-4 w-4 mr-2" />
            Lock / disable user
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/admin/users">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Escalate
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/admin/audit-exports">
            <FileText className="h-4 w-4 mr-2" />
            View audit logs
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
