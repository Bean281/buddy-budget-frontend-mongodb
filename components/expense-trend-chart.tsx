import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

interface ExpenseTrendChartProps {
  title?: string
  description?: string
  data: Array<{
    date: string
    amount: number
  }>
  period?: string
}

export function ExpenseTrendChart({
  title = "Expense Trend",
  description,
  data,
  period = "daily",
}: ExpenseTrendChartProps) {
  // Calculate statistics
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  const average = total / data.length
  const max = Math.max(...data.map((item) => item.amount))
  const maxDate = data.find((item) => item.amount === max)?.date

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description || `Your ${period} expense trend`}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Chart>
            <ChartContainer data={data}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-bold">{label}</div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Expense</span>
                              <span className="font-bold text-expense">${payload[0].value}</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--expense))"
                    name="Expense"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--expense))" }}
                    activeDot={{ r: 5, fill: "hsl(var(--expense))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Chart>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium">Total</div>
            <div className="text-expense">${total.toFixed(2)}</div>
          </div>
          <div>
            <div className="font-medium">Average</div>
            <div className="text-muted-foreground">${average.toFixed(2)}</div>
          </div>
          <div>
            <div className="font-medium">Highest</div>
            <div className="text-muted-foreground">
              ${max.toFixed(2)} ({maxDate})
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
