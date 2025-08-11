import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer } from "@/components/ui/chart"
import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts"

interface CategoryBreakdownChartProps {
  title?: string
  description?: string
  data: Array<{
    name: string
    value: number
  }>
}

export function CategoryBreakdownChart({
  title = "Expense Categories",
  description = "Breakdown by category",
  data,
}: CategoryBreakdownChartProps) {
  // Define colors for the pie chart
  const COLORS = [
    "hsl(var(--category-food))",
    "hsl(var(--category-entertainment))",
    "hsl(var(--category-shopping))",
    "hsl(var(--category-coffee))",
    "hsl(var(--category-housing))",
    "hsl(var(--category-transportation))",
    "hsl(var(--category-utilities))",
  ]

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
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, undefined]}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="flex flex-col">
                              <span className="font-bold">{payload[0].name}</span>
                              <span className="text-muted-foreground">{payload[0].value}% of total expenses</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Chart>
        </div>
      </CardContent>
    </Card>
  )
}
