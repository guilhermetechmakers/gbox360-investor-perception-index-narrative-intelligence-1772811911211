import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { Info } from 'lucide-react'

export function Settings() {
  const { data: user, isLoading } = useCurrentUser()
  const [narrativeWeight, setNarrativeWeight] = useState(40)
  const [credibilityWeight, setCredibilityWeight] = useState(40)
  const [riskWeight, setRiskWeight] = useState(20)

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-semibold">Settings & preferences</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="weights">IPI weights</TabsTrigger>
          <TabsTrigger value="data">Data & privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Account details (read-only here; edit in profile).</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {user?.email} · {user?.full_name ?? 'No name set'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weights">
          <Card>
            <CardHeader>
              <CardTitle>Provisional IPI weights</CardTitle>
              <CardDescription>
                Experiment with weight scenarios. These are provisional and for display only; 
                audit exports use the server-configured weights. Changes are not persisted in this MVP.
              </CardDescription>
              <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
                <Info className="h-4 w-4" />
                <span>Provisional — for transparency and experimentation</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Narrative: {narrativeWeight}%</Label>
                <Slider
                  value={[narrativeWeight]}
                  onValueChange={([v]) => {
                    setNarrativeWeight(v)
                    setCredibilityWeight(100 - v - riskWeight)
                  }}
                  max={80}
                  min={10}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Credibility: {credibilityWeight}%</Label>
                <Slider
                  value={[credibilityWeight]}
                  onValueChange={([v]) => {
                    setCredibilityWeight(v)
                    setRiskWeight(100 - narrativeWeight - v)
                  }}
                  max={80}
                  min={10}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Risk: {riskWeight}%</Label>
                <Slider
                  value={[riskWeight]}
                  onValueChange={([v]) => {
                    setRiskWeight(v)
                    setNarrativeWeight(100 - credibilityWeight - v)
                  }}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sum: {narrativeWeight + credibilityWeight + riskWeight}%. 
                Server default: Narrative 40%, Credibility 40%, Risk 20%.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data & privacy</CardTitle>
              <CardDescription>Export or delete your data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" disabled>
                Export my data (coming soon)
              </Button>
              <Button variant="outline" disabled>
                Developer / API keys (placeholder)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
