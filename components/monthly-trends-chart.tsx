import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface MonthlyTrendsChartProps {
  title?: string
  description?: string
  data: Array<{
    name: string
    income: number
    expenses: number
    savings: number
  }>
}

export function MonthlyTrendsChart({
  title = "Monthly Trends",
  description = "Income, expenses, and savings over time",
  data,
}: MonthlyTrendsChartProps) {
  // Calculate trends
  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return 0
    const firstValue = data[0][key]
    const lastValue = data[data.length - 1][key]
    return Math.round(((lastValue - firstValue) / firstValue) * 100)
  }

  const incomeTrend = calculateTrend(data, "income")
  const expensesTrend = calculateTrend(data, "expenses")
  const savingsTrend = calculateTrend(data, "savings")

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
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, undefined]}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-bold">{label}</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Income</span>
                                <span className="font-bold text-income">${payload[0].value}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Expenses</span>
                                <span className="font-bold text-expense">${payload[1].value}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Savings</span>
                                <span className="font-bold text-savings">${payload[2].value}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--income))" name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="hsl(var(--expense))" name="Expenses" />
                  <Line type="monotone" dataKey="savings" stroke="hsl(var(--savings))" name="Savings" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Chart>
        </div>
        <div className="mt-2 text-sm text-center">
          <span className="inline-block mx-2">
            <span className="text-muted-foreground">Income: </span>
            <span className={`font-medium ${incomeTrend >= 0 ? "text-income" : "text-expense"}`}>
              {incomeTrend > 0 ? "+" : ""}
              {incomeTrend}%
            </span>
          </span>
          |
          <span className="inline-block mx-2">
            <span className="text-muted-foreground">Expenses: </span>
            <span className={`font-medium ${expensesTrend <= 0 ? "text-income" : "text-expense"}`}>
              {expensesTrend > 0 ? "+" : ""}
              {expensesTrend}%
            </span>
          </span>
          |
          <span className="inline-block mx-2">
            <span className="text-muted-foreground">Savings: </span>
            <span className={`font-medium ${savingsTrend >= 0 ? "text-income" : "text-expense"}`}>
              {savingsTrend > 0 ? "+" : ""}
              {savingsTrend}%
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
