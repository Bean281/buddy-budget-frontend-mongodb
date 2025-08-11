import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface SavingsGoalsChartProps {
  title?: string
  description?: string
  data: Array<{
    name: string
    current: number
    target: number
  }>
}

export function SavingsGoalsChart({
  title = "Savings Goals Progress",
  description = "Current vs target amounts",
  data,
}: SavingsGoalsChartProps) {
  // Calculate progress percentages for the summary
  const progressSummary = data.map((goal) => ({
    name: goal.name,
    progress: Math.round((goal.current / goal.target) * 100),
  }))

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Chart>
            <ChartContainer data={data}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, undefined]}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const progress = Math.round((data.current / data.target) * 100)
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="flex flex-col">
                              <span className="font-bold">{data.name}</span>
                              <span className="text-muted-foreground">
                                ${data.current} of ${data.target} ({progress}%)
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="hsl(var(--savings))" name="Current" />
                  <Bar dataKey="target" fill="hsl(var(--muted))" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Chart>
        </div>
        <div className="mt-2 text-sm text-center">
          {progressSummary.map((item, index) => (
            <span key={item.name} className="inline-block mx-2">
              <span className="text-muted-foreground">{item.name}: </span>
              <span className="font-medium">{item.progress}%</span>
              {index < progressSummary.length - 1 && " | "}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
