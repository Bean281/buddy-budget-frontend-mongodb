import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from "recharts"

interface BudgetVsActualChartProps {
  title?: string
  description?: string
  data: Array<{
    name: string
    budget: number
    actual: number
  }>
  categories?: boolean
}

export function BudgetVsActualChart({
  title = "Budget vs Actual",
  description = "Compare your planned budget with actual spending",
  data,
  categories = false,
}: BudgetVsActualChartProps) {
  // Calculate totals and differences
  const totalBudget = data.reduce((sum, item) => sum + item.budget, 0)
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0)
  const difference = totalBudget - totalActual
  const percentDifference = Math.round((difference / totalBudget) * 100)

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
                <BarChart
                  data={data}
                  layout={categories ? "vertical" : "horizontal"}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  {categories ? (
                    <>
                      <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                      <YAxis type="category" dataKey="name" width={100} />
                    </>
                  ) : (
                    <>
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                    </>
                  )}
                  <Tooltip
                    formatter={(value) => [`$${value}`, undefined]}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const diff = data.budget - data.actual
                        const diffPercent = Math.round((diff / data.budget) * 100)
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-bold mb-1">{data.name}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Budget</span>
                                <span className="font-bold">${data.budget}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Actual</span>
                                <span className="font-bold">${data.actual}</span>
                              </div>
                            </div>
                            <div className="mt-1 pt-1 border-t">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Difference: </span>
                              <span
                                className={`font-bold ${diff >= 0 ? "text-income" : "text-expense"}`}
                              >{`${diff >= 0 ? "+" : ""}$${Math.abs(diff)} (${diffPercent}%)`}</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="hsl(var(--primary))" name="Budget" />
                  <Bar dataKey="actual" fill="hsl(var(--info))" name="Actual" />
                  {!categories && <ReferenceLine y={0} stroke="#000" />}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Chart>
        </div>
        <div className="mt-2 text-sm text-center">
          <span className="text-muted-foreground">Budget: </span>
          <span className="font-medium">${totalBudget}</span>
          <span className="mx-2">|</span>
          <span className="text-muted-foreground">Actual: </span>
          <span className="font-medium">${totalActual}</span>
          <span className="mx-2">|</span>
          <span className="text-muted-foreground">Difference: </span>
          <span className={`font-medium ${difference >= 0 ? "text-income" : "text-expense"}`}>
            {difference >= 0 ? "+" : ""}${Math.abs(difference)} ({percentDifference}%)
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
