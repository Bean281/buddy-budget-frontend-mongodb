import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface IncomeExpenseChartProps {
  title?: string
  description?: string
  data: Array<{
    name: string
    income: number
    expenses: number
  }>
  timeRange?: string
}

export function IncomeExpenseChart({
  title = "Income vs Expenses",
  description,
  data,
  timeRange = "month",
}: IncomeExpenseChartProps) {
  // Calculate totals
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0)
  const netAmount = totalIncome - totalExpenses

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description || `Weekly breakdown for ${timeRange}`}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Chart>
            <ChartContainer data={data}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, undefined]}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-bold mb-1">{label}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Income</span>
                                <span className="font-bold text-income">${payload[0].value}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Expenses</span>
                                <span className="font-bold text-expense">${payload[1].value}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="hsl(var(--income))" name="Income" />
                  <Bar dataKey="expenses" fill="hsl(var(--expense))" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Chart>
        </div>
        <div className="mt-2 text-sm text-center grid grid-cols-3 gap-4">
          <div>
            <span className="text-muted-foreground block">Income</span>
            <span className="font-medium text-income">${totalIncome.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Expenses</span>
            <span className="font-medium text-expense">${totalExpenses.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Net</span>
            <span className={`font-medium ${netAmount >= 0 ? "text-income" : "text-expense"}`}>
              ${netAmount.toFixed(0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
