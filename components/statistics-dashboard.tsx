"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Loader2, AlertCircle } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import {
  useStatisticsDailySpending,
  useIncomeExpenses,
  useExpenseCategories,
  useBudgetActual,
  useMonthlyTrends,
  useStatisticsSavingsGoals
} from "@/hooks/use-statistics"
import {
  StatisticsPeriodEnum,
  BudgetComparisonGroupEnum,
  type IncomeExpenseDataPoint,
  type ExpenseCategoryBreakdown,
  type DailySpendingPoint,
  type MonthlyTrendPoint,
  type BudgetActualItem,
  type SavingsGoalProgress
} from "@/lib/api/statistics/types"

export function StatisticsDashboard() {
  const [timeRange, setTimeRange] = useState("month")

  // Calculate date range for expense categories
  const dateRange = useMemo(() => {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case "week":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "month":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1)
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }, [timeRange])

  // API Queries
  const { data: dailySpendingData, isLoading: isDailyLoading, isError: isDailyError } = useStatisticsDailySpending({ days: 14 })
  
  const { data: incomeExpensesData, isLoading: isIncomeExpensesLoading, isError: isIncomeExpensesError } = useIncomeExpenses({
    period: timeRange === "week" ? StatisticsPeriodEnum.WEEK : StatisticsPeriodEnum.MONTH,
    months: timeRange === "year" ? 12 : timeRange === "quarter" ? 3 : 1
  })
  
  const { data: expenseCategoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError } = useExpenseCategories(dateRange)
  
  const { data: budgetActualData, isLoading: isBudgetActualLoading, isError: isBudgetActualError } = useBudgetActual({
    by: BudgetComparisonGroupEnum.MONTH
  })
  
  const { data: monthlyTrendsData, isLoading: isMonthlyTrendsLoading, isError: isMonthlyTrendsError } = useMonthlyTrends({ months: 5 })
  
  const { data: savingsGoalsData, isLoading: isSavingsGoalsLoading, isError: isSavingsGoalsError } = useStatisticsSavingsGoals()

  // Transform data for charts
  const dailySpendingChartData = useMemo(() => {
    if (!dailySpendingData?.days) return []
    return dailySpendingData.days.map((day: DailySpendingPoint) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: day.amount
    }))
  }, [dailySpendingData])

  const incomeVsExpenseChartData = useMemo(() => {
    if (!incomeExpensesData?.data) return []
    return incomeExpensesData.data.map((item: IncomeExpenseDataPoint) => ({
      name: item.label,
      income: item.income,
      expenses: item.expense
    }))
  }, [incomeExpensesData])

  const categoryBreakdownChartData = useMemo(() => {
    if (!expenseCategoriesData?.categories) return []
    return expenseCategoriesData.categories.map((category: ExpenseCategoryBreakdown) => ({
      name: category.name,
      value: category.percentage
    }))
  }, [expenseCategoriesData])

  const monthlyTrendChartData = useMemo(() => {
    if (!monthlyTrendsData?.months) return []
    return monthlyTrendsData.months.map((month: MonthlyTrendPoint) => ({
      name: month.month,
      income: month.income,
      expenses: month.expenses,
      savings: month.savings
    }))
  }, [monthlyTrendsData])

  // Color scheme for pie chart
  const COLORS = [
    "hsl(var(--category-food))",
    "hsl(var(--category-entertainment))",
    "hsl(var(--category-shopping))",
    "hsl(var(--category-coffee))",
    "hsl(var(--category-housing))",
    "hsl(var(--category-transportation))",
    "hsl(var(--category-utilities))",
  ]

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Loading component
  const LoadingCard = ({ title, description }: { title: string; description: string }) => (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Error component
  const ErrorCard = ({ title, description }: { title: string; description: string }) => (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">Failed to load chart data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Statistics</h1>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Daily Spending Trends Chart */}
      {isDailyLoading ? (
        <LoadingCard 
          key="daily-spending-loading"
          title="Daily Spending Trends" 
          description="Your spending pattern over the last 14 days" 
        />
      ) : isDailyError ? (
        <ErrorCard 
          key="daily-spending-error"
          title="Daily Spending Trends" 
          description="Your spending pattern over the last 14 days" 
        />
      ) : (
        <Card key="daily-spending-chart" className="card-hover">
          <CardHeader>
            <CardTitle>Daily Spending Trends</CardTitle>
            <CardDescription>
              Your spending pattern over the last 14 days • Total: {formatCurrency(dailySpendingData?.totalAmount || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySpendingChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-bold">{label}</div>
                            <div className="flex flex-col">
                              <span className="text-lg font-bold">${payload[0].value}</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Income vs Expenses Chart */}
        {isIncomeExpensesLoading ? (
          <LoadingCard 
            key="income-expenses-loading"
            title="Income vs Expenses" 
            description={`Breakdown for ${timeRange}`} 
          />
        ) : isIncomeExpensesError ? (
          <ErrorCard 
            key="income-expenses-error"
            title="Income vs Expenses" 
            description={`Breakdown for ${timeRange}`} 
          />
        ) : (
          <Card key="income-expenses-chart" className="card-hover">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Breakdown for {timeRange}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeVsExpenseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      formatter={(value) => [`$${value}`, undefined]}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
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
              </div>
              <div className="mt-2 text-sm text-center text-muted-foreground">
                Income: {formatCurrency(incomeExpensesData?.totalIncome || 0)} | 
                Expenses: {formatCurrency(incomeExpensesData?.totalExpenses || 0)} | 
                Net: {formatCurrency((incomeExpensesData?.totalIncome || 0) - (incomeExpensesData?.totalExpenses || 0))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expense Categories Chart */}
        {isCategoriesLoading ? (
          <LoadingCard 
            key="expense-categories-loading"
            title="Expense Categories" 
            description="Breakdown by category" 
          />
        ) : isCategoriesError ? (
          <ErrorCard 
            key="expense-categories-error"
            title="Expense Categories" 
            description="Breakdown by category" 
          />
        ) : (
          <Card key="expense-categories-chart" className="card-hover">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Breakdown by category • Total: {formatCurrency(expenseCategoriesData?.totalAmount || 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdownChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryBreakdownChartData.map((entry, index) => (
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plan vs Reality (Budget vs Actual) */}
      {isBudgetActualLoading ? (
        <Card key="budget-actual-loading" className="card-hover bg-gradient-to-br from-background to-secondary/20">
          <CardHeader>
            <CardTitle>Plan vs Reality</CardTitle>
            <CardDescription>Compare your financial plan with actual results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading budget comparison...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isBudgetActualError ? (
        <Card key="budget-actual-error" className="card-hover bg-gradient-to-br from-background to-secondary/20">
          <CardHeader>
            <CardTitle>Plan vs Reality</CardTitle>
            <CardDescription>Compare your financial plan with actual results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <p className="text-sm text-destructive">Failed to load budget comparison</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card key="budget-actual-chart" className="card-hover bg-gradient-to-br from-background to-secondary/20">
          <CardHeader>
            <CardTitle>Plan vs Reality</CardTitle>
            <CardDescription>Compare your financial plan with actual results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {budgetActualData?.items.slice(0, 3).map((item: BudgetActualItem, index) => (
                <div key={item.id || `budget-item-${index}`} className="space-y-2">
                  <h3 className="font-medium">{item.label}</h3>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Planned</span>
                    <span>{formatCurrency(item.budgetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actual</span>
                    <span>{formatCurrency(item.actualAmount)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Difference</span>
                    <span className={item.variance >= 0 ? "text-income" : "text-expense"}>
                      {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="col-span-3 text-center text-muted-foreground">
                  No budget comparison data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trends Chart */}
      {isMonthlyTrendsLoading ? (
        <LoadingCard 
          key="monthly-trends-loading"
          title="Monthly Trends" 
          description="5-month financial overview" 
        />
      ) : isMonthlyTrendsError ? (
        <ErrorCard 
          key="monthly-trends-error"
          title="Monthly Trends" 
          description="5-month financial overview" 
        />
      ) : monthlyTrendChartData.length > 0 ? (
        <Card key="monthly-trends-chart" className="card-hover">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>5-month financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.4} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--income))" strokeWidth={2} name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="hsl(var(--expense))" strokeWidth={2} name="Expenses" />
                  <Line type="monotone" dataKey="savings" stroke="hsl(var(--savings))" strokeWidth={2} name="Savings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div key="monthly-trends-empty" style={{ display: 'none' }} />
      )}

      {/* Savings Goals Progress */}
      {isSavingsGoalsLoading ? (
        <LoadingCard 
          key="savings-goals-loading"
          title="Savings Goals Progress" 
          description="Track your savings goals" 
        />
      ) : isSavingsGoalsError ? (
        <ErrorCard 
          key="savings-goals-error"
          title="Savings Goals Progress" 
          description="Track your savings goals" 
        />
      ) : savingsGoalsData?.goals && savingsGoalsData.goals.length > 0 ? (
        <Card key="savings-goals-chart" className="card-hover">
          <CardHeader>
            <CardTitle>Savings Goals Progress</CardTitle>
            <CardDescription>
              Track your savings goals • Total Saved: {formatCurrency(savingsGoalsData?.totalSaved || 0)} of {formatCurrency(savingsGoalsData?.totalTarget || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {savingsGoalsData.goals.map((goal: SavingsGoalProgress) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{goal.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.completed ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${goal.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {goal.progressPercentage.toFixed(1)}% complete
                    </span>
                    <span className="text-muted-foreground">
                      {goal.completed ? 'Goal achieved!' : `${formatCurrency(goal.remainingAmount)} remaining`}
                    </span>
                  </div>
                  {goal.targetDate && (
                    <div className="text-xs text-muted-foreground">
                      Target date: {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div key="savings-goals-empty" style={{ display: 'none' }} />
      )}
    </div>
  )
}
