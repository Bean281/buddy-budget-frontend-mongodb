"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, BarChart } from "recharts"
import { Loader2, AlertCircle, TrendingUp, Calendar, Filter } from "lucide-react"
import { useSavingsGoalsHistory, useSavingsGoals } from "@/hooks/use-savings-goals"
import { useState, useMemo } from "react"

export function SavingsGoalsHistory() {
  const [selectedMonths, setSelectedMonths] = useState("12")
  const [selectedGoalId, setSelectedGoalId] = useState<string>("all")

  // Fetch history data with months parameter
  const { data: historyData, isLoading, isError, error } = useSavingsGoalsHistory({
    months: parseInt(selectedMonths),
    goalId: selectedGoalId === "all" ? undefined : selectedGoalId
  })

  // Fetch all goals for filter dropdown
  const { data: allGoals } = useSavingsGoals()

  // Debug logging
  console.log('History API call:', {
    months: selectedMonths,
    goalId: selectedGoalId === "all" ? undefined : selectedGoalId,
    isLoading,
    isError,
    error,
    data: historyData
  })

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!historyData?.history) return []
    
    return historyData.history.map((period) => ({
      period: period.periodName,
      totalSaved: period.totalSaved,
      itemsCount: period.itemsCount,
      monthYear: period.period,
      items: period.items
    })).filter(item => item.totalSaved > 0) // Only show months with savings
  }, [historyData])

  // Calculate statistics from the summary
  const statistics = useMemo(() => {
    if (!historyData?.summary) return null

    const activePeriods = historyData.history.filter(period => period.totalSaved > 0).length
    const totalItems = historyData.history.reduce((sum, period) => sum + period.itemsCount, 0)

    return {
      totalSaved: historyData.summary.totalAcrossAllMonths,
      averagePerMonth: historyData.summary.averagePerMonth,
      activePeriods,
      totalItems,
      highestMonth: historyData.summary.highestMonth,
      totalMonths: historyData.summary.totalMonths
    }
  }, [historyData])

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Savings Goals History</CardTitle>
          <CardDescription>Track your savings progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading history data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Savings Goals History</CardTitle>
          <CardDescription>Track your savings progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive">Failed to load history data</p>
              {error && (
                <details className="text-xs text-muted-foreground max-w-md">
                  <summary className="cursor-pointer">Show error details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Savings Goals History
            </CardTitle>
            <CardDescription>
              Track your savings progress over time
              {statistics && (
                <span className="text-muted-foreground">
                  {' '}• {statistics.activePeriods} active months • Total: {formatCurrency(statistics.totalSaved)}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonths} onValueChange={setSelectedMonths}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
                <SelectItem value="18">18 Months</SelectItem>
                <SelectItem value="24">24 Months</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                {allGoals?.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!chartData.length ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-medium">No Savings History</h3>
              <p className="text-muted-foreground">No savings contributions found for the selected period.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[400px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.4} />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Bar
                    dataKey="totalSaved"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null

                      const data = payload[0].payload

                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="font-bold mb-2">{label}</div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Total Saved:</span>
                              <span className="font-semibold">{formatCurrency(data.totalSaved)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Contributions:</span>
                              <span className="font-semibold">{data.itemsCount}</span>
                            </div>
                          </div>
                          {data.items.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <div className="font-medium">Recent items:</div>
                              {data.items.slice(0, 3).map((item: any, index: number) => (
                                <div key={index} className="truncate">
                                  {item.description}: {formatCurrency(item.amount)}
                                </div>
                              ))}
                              {data.items.length > 3 && (
                                <div>...and {data.items.length - 3} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="text-sm text-muted-foreground">Total Saved</div>
                  <div className="text-xl font-bold text-primary">{formatCurrency(statistics.totalSaved)}</div>
                  <div className="text-xs text-muted-foreground">Across {statistics.totalMonths} months</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-muted-foreground">Average per Month</div>
                  <div className="text-xl font-bold">{formatCurrency(statistics.averagePerMonth)}</div>
                  <div className="text-xs text-muted-foreground">When saving</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-muted-foreground">Active Months</div>
                  <div className="text-xl font-bold">{statistics.activePeriods}</div>
                  <div className="text-xs text-muted-foreground">With contributions</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-muted-foreground">Best Month</div>
                  <div className="text-xl font-bold">{formatCurrency(statistics.highestMonth.amount)}</div>
                  <div className="text-xs text-muted-foreground">{statistics.highestMonth.period}</div>
                </div>
              </div>
            )}

            {/* Recent Items Section */}
            {historyData?.history && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Savings Items</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {historyData.history
                    .flatMap(period => 
                      period.items.map(item => ({
                        ...item,
                        periodName: period.periodName
                      }))
                    )
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.periodName} • {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {item.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 