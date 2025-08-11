"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts"
import { Loader2, AlertCircle, Target } from "lucide-react"
import { useStatisticsDailySpending } from "@/hooks/use-statistics"
import { useFinancialPlan } from "@/hooks/use-planning"
import { useTodaySpending } from "@/hooks/use-dashboard"
import { useMemo } from "react"

export function DailySpendingTrend() {
  // API Queries
  const { data: dailySpendingData, isLoading, isError } = useStatisticsDailySpending({ days: 14 })
  const { data: dailyPlan, isLoading: isLoadingDailyPlan } = useFinancialPlan("daily")
  const { data: monthlyPlan, isLoading: isLoadingMonthlyPlan } = useFinancialPlan("monthly")
  const { data: todaySpending, isLoading: isLoadingToday } = useTodaySpending()

  // Calculate combined daily budget (actual + planned)
  const combinedDailyBudget = useMemo(() => {
    const actualBudget = todaySpending?.dailyBudget || 0
    const plannedAmount = dailyPlan?.expensesTotal || (monthlyPlan?.expensesTotal || 0) / 30
    return actualBudget + plannedAmount
  }, [todaySpending, dailyPlan, monthlyPlan])

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!dailySpendingData?.days) return []
    return dailySpendingData.days.map((day, index) => ({
      id: `day-${index}`, // Add unique ID for React keys
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: day.amount,
      budget: combinedDailyBudget, // Add budget line
      originalDate: day.date
    }))
  }, [dailySpendingData, combinedDailyBudget])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!dailySpendingData) return null
    
    const totalSpent = dailySpendingData.totalAmount
    const averageDaily = dailySpendingData.averageAmount
    const highestDay = dailySpendingData.days.reduce((max, day) => 
      day.amount > max.amount ? day : max, dailySpendingData.days[0]
    )
    const lowestDay = dailySpendingData.days.reduce((min, day) => 
      day.amount < min.amount ? day : min, dailySpendingData.days[0]
    )

    // Calculate budget performance
    const daysOverBudget = dailySpendingData.days.filter(day => day.amount > combinedDailyBudget).length
    const budgetPerformance = ((combinedDailyBudget * 14 - totalSpent) / (combinedDailyBudget * 14)) * 100

    return {
      totalSpent,
      averageDaily,
      combinedDailyBudget,
      daysOverBudget,
      budgetPerformance,
      highestDay: {
        amount: highestDay.amount,
        date: new Date(highestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      },
      lowestDay: {
        amount: lowestDay.amount,
        date: new Date(lowestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    }
  }, [dailySpendingData, combinedDailyBudget])

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Loading state
  if (isLoading || isLoadingDailyPlan || isLoadingMonthlyPlan || isLoadingToday) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Daily Spending Trends</CardTitle>
          <CardDescription>Your spending pattern over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading spending data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (isError) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Daily Spending Trends</CardTitle>
          <CardDescription>Your spending pattern over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive">Failed to load spending data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (!chartData.length || !statistics) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Daily Spending Trends</CardTitle>
          <CardDescription>Your spending pattern over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No spending data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Daily Spending Trends</CardTitle>
        <CardDescription>
          Your spending pattern over the last 14 days • Total: {formatCurrency(statistics.totalSpent)}
          {combinedDailyBudget > 0 && (
            <span className="text-muted-foreground">
              {' '}• Budget: {formatCurrency(combinedDailyBudget)}/day
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.4} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              {/* Budget reference line */}
              {combinedDailyBudget > 0 && (
                <ReferenceLine 
                  y={combinedDailyBudget} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              )}
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null

                  const data = payload[0].payload

                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="font-bold mb-1">{data.date}</div>
                      <div className="text-lg font-bold">{formatCurrency(data.amount)}</div>
                      {combinedDailyBudget > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {data.amount > combinedDailyBudget ? 
                            `$${(data.amount - combinedDailyBudget).toFixed(2)} over budget` : 
                            `$${(combinedDailyBudget - data.amount).toFixed(2)} under budget`
                          }
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {data.amount > statistics.averageDaily ? "Above average" : "Below average"}
                      </div>
                    </div>
                  )
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div key="total-spent" className="stat-card">
            <div className="text-sm text-muted-foreground">Total Spent</div>
            <div className="text-xl font-bold text-expense">{formatCurrency(statistics.totalSpent)}</div>
          </div>
          <div key="daily-average" className="stat-card">
            <div className="text-sm text-muted-foreground">Daily Average</div>
            <div className="text-xl font-bold">{formatCurrency(statistics.averageDaily)}</div>
            {combinedDailyBudget > 0 && (
              <div className="text-xs text-muted-foreground">
                vs {formatCurrency(combinedDailyBudget)} budget
              </div>
            )}
          </div>
          <div key="budget-performance" className="stat-card">
            <div className="text-sm text-muted-foreground flex items-center">
              <Target className="mr-1 h-3 w-3" />
              Budget Performance
            </div>
            {combinedDailyBudget > 0 ? (
              <>
                <div className={`text-xl font-bold ${statistics.budgetPerformance >= 0 ? 'text-income' : 'text-expense'}`}>
                  {statistics.budgetPerformance >= 0 ? '+' : ''}{statistics.budgetPerformance.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {statistics.daysOverBudget} days over budget
                </div>
              </>
            ) : (
              <div className="text-xl font-bold text-muted-foreground">N/A</div>
            )}
          </div>
          <div key="highest-day" className="stat-card">
            <div className="text-sm text-muted-foreground">Highest Day</div>
            <div className="text-xl font-bold">{formatCurrency(statistics.highestDay.amount)}</div>
            <div className="text-xs text-muted-foreground">{statistics.highestDay.date}</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>14-day period</span>
            <span>
              {chartData.length > 0 && new Date(chartData[0].originalDate).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
          {combinedDailyBudget > 0 && (
            <div className="mt-2 text-center">
              <span>Daily Budget: {formatCurrency(combinedDailyBudget)} (Combined Actual + Planned)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
