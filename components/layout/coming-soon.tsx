import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="max-w-2xl mx-auto pt-12">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{phase}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This screen is part of the production roadmap and ships in a later slice.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
