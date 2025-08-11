import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface IncomeSourcesChartProps {
  title?: string
  description?: string
  data: Array<{
    name: string
    value: number
  }>
}

export function IncomeSourcesChart({
  title = "Income Sources",
  description = "Breakdown of your income by source",
  data,
}: IncomeSourcesChartProps) {
  // Calculate total income
  const totalIncome = data.reduce((sum, item) => sum + item.value, 0)

  // Define colors for the pie chart
  const COLORS = [
    "hsl(var(--income))",
    "hsl(var(--savings))",
    "hsl(var(--info))",
    "hsl(var(--primary))",
    "hsl(var(--investment))",
    "hsl(var(--warning))",
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
                    formatter={(value) => [
                      `$${value} (${(((value as number) / totalIncome) * 100).toFixed(1)}%)`,
                      undefined,
                    ]}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const percentage = (((payload[0].value as number) / totalIncome) * 100).toFixed(1)
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="flex flex-col">
                              <span className="font-bold">{payload[0].name}</span>
                              <span className="text-muted-foreground">
                                ${payload[0].value} ({percentage}% of total)
                              </span>
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
        <div className="mt-2 text-sm text-center">
          <span className="text-muted-foreground">Total Income: </span>
          <span className="font-medium text-income">${totalIncome.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
