import { Link } from 'react-router'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

/** The door to a task that cannot be undone: says in a line what it is, and opens it on a page of its own. */
export function DangerLinkCard({ title, description, to, action }: { title: string; description: string; to: string; action: string }) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="destructive">
          <Link to={to}>{action}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
