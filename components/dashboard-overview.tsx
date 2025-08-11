"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, ArrowDownRight, Loader2, AlertCircle, Target } from "lucide-react"
import { UpcomingBills } from "./upcoming-bills"
import { SavingsGoals } from "./savings-goals"
import { RecentExpenses } from "./recent-expenses"
import { DailySpendingTrend } from "./daily-spending-trend"
import { BudgetProgress } from "./budget-progress"
import { 
  useFinancialSummary, 
  useTodaySpending, 
  useBudgetProgress as useBudgetProgressData 
} from "@/hooks/use-dashboard"
import { useFinancialPlan } from "@/hooks/use-planning"
import { BudgetPeriodEnum } from "@/lib/api/dashboard/types"

export function DashboardOverview() {
  // API hooks
  const { data: financialSummary, isLoading: isLoadingSummary, isError: isErrorSummary } = useFinancialSummary()
  const { data: todaySpending, isLoading: isLoadingToday, isError: isErrorToday } = useTodaySpending()
  const { data: weeklyBudget, isLoading: isLoadingWeekly } = useBudgetProgressData(BudgetPeriodEnum.WEEKLY)
  const { data: monthlyBudget, isLoading: isLoadingMonthly } = useBudgetProgressData(BudgetPeriodEnum.MONTHLY)
  
  // Financial Planning data for comparison
  const { data: monthlyPlan, isLoading: isLoadingPlan } = useFinancialPlan("monthly")
  const { data: weeklyPlan, isLoading: isLoadingWeeklyPlan } = useFinancialPlan("weekly")
  const { data: dailyPlan, isLoading: isLoadingDailyPlan } = useFinancialPlan("daily")

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Helper function to format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Calculate plan vs actual variations
  const getIncomeVariation = () => {
    if (!financialSummary || !monthlyPlan) return null
    const planned = monthlyPlan.incomeTotal || 0
    const actual = financialSummary.incomeTotal || 0
    if (planned === 0) return null
    return ((actual - planned) / planned) * 100
  }

  const getExpenseVariation = () => {
    if (!financialSummary || !monthlyPlan) return null
    const planned = monthlyPlan.expensesTotal || 0
    const actual = financialSummary.expenseTotal || 0
    if (planned === 0) return null
    return ((actual - planned) / planned) * 100
  }

  const getSavingsVariation = () => {
    if (!financialSummary || !monthlyPlan) return null
    const planned = monthlyPlan.savingsTotal || 0
    const actual = financialSummary.savingsTotal || 0
    if (planned === 0) return null
    return ((actual - planned) / planned) * 100
  }

  const getRemainingPercentage = () => {
    if (!financialSummary || financialSummary.incomeTotal === 0) return 0
    return (financialSummary.remainingAmount / financialSummary.incomeTotal) * 100
  }

  // Helper function to get variation display
  const getVariationDisplay = (variation: number | null, type: 'income' | 'expense' | 'savings') => {
    if (variation === null) {
      // Fallback to placeholder data when no plan comparison available
      const placeholderVariation = type === 'income' ? 20.1 : type === 'expense' ? 5.2 : 12.5
      return (
        <p className="text-xs text-primary flex items-center">
          <TrendingUp className="mr-1 h-4 w-4 inline" />
          {formatPercentage(placeholderVariation)} from last month
        </p>
      )
    }
    
    const isPositive = variation > 0
    const isGood = (type === 'income' && isPositive) || 
                   (type === 'expense' && !isPositive) || 
                   (type === 'savings' && isPositive)
    
    return (
      <p className={`text-xs flex items-center ${isGood ? 'text-primary' : 'text-expense'}`}>
        {isPositive ? <TrendingUp className="mr-1 h-4 w-4 inline" /> : <TrendingDown className="mr-1 h-4 w-4 inline" />}
        {formatPercentage(variation)} vs planned
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income Card */}
        <Card className="border-l-4 border-l-primary card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <div className="rounded-full bg-primary-muted p-2 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="space-y-2">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            ) : isErrorSummary ? (
              <div className="text-destructive text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error loading data
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(financialSummary?.incomeTotal || 0)}</div>
                {getVariationDisplay(getIncomeVariation(), 'income')}
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Expenses Card */}
        <Card className="border-l-4 border-l-expense card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <div className="rounded-full bg-expense-muted p-2 text-expense">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="space-y-2">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            ) : isErrorSummary ? (
              <div className="text-destructive text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error loading data
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(financialSummary?.expenseTotal || 0)}</div>
                {getVariationDisplay(getExpenseVariation(), 'expense')}
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Savings Card */}
        <Card className="border-l-4 border-l-savings card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <div className="rounded-full bg-savings-muted p-2 text-savings">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="space-y-2">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            ) : isErrorSummary ? (
              <div className="text-destructive text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error loading data
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(financialSummary?.savingsTotal || 0)}</div>
                {getVariationDisplay(getSavingsVariation(), 'savings')}
              </>
            )}
          </CardContent>
        </Card>

        {/* Remaining Amount Card */}
        <Card className="border-l-4 border-l-info card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <div className="rounded-full bg-info-muted p-2 text-info">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="space-y-2">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            ) : isErrorSummary ? (
              <div className="text-destructive text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error loading data
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(financialSummary?.remainingAmount || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {getRemainingPercentage().toFixed(0)}% of monthly income
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Spending */}
      <Card className="bg-gradient-to-br from-background to-secondary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Today's Spending</CardTitle>
          <CardDescription>
            Your spending for {todaySpending?.date ? new Date(todaySpending.date).toLocaleDateString() : new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingToday ? (
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 bg-muted animate-pulse rounded w-24" />
                <div className="h-4 bg-muted animate-pulse rounded w-32" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-20" />
                <div className="h-6 bg-muted animate-pulse rounded w-16" />
                <div className="h-3 bg-muted animate-pulse rounded w-24" />
              </div>
            </div>
          ) : isErrorToday ? (
            <div className="text-destructive text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Error loading today's spending data
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{formatCurrency(todaySpending?.totalSpentToday || 0)}</div>
                <div className="text-sm text-muted-foreground">
                  <ArrowDownRight className="inline h-4 w-4 text-expense mr-1" />
                  {todaySpending?.transactionCount || 0} transactions today
                </div>
              </div>
              <div className="text-right">
                {(() => {
                  const actualBudget = todaySpending?.dailyBudget || 0
                  const plannedAmount = dailyPlan?.expensesTotal || (monthlyPlan?.expensesTotal || 0) / 30
                  const totalBudget = actualBudget + (plannedAmount || 0)
                  const spent = todaySpending?.totalSpentToday || 0
                  const combinedRemaining = totalBudget - spent
                  const isOverBudget = combinedRemaining < 0

                  return (
                    <>
                      <div className="text-sm font-medium">
                        Daily Budget
                        {/* {plannedAmount > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (${actualBudget.toFixed(2)} + ${plannedAmount.toFixed(2)})
                          </span>
                        )} */}
                      </div>
                      <div className="text-lg">{formatCurrency(totalBudget)}</div>
                      <div className={`text-xs ${isOverBudget ? 'text-expense' : 'text-income'}`}>
                        {formatCurrency(Math.abs(combinedRemaining))} {isOverBudget ? 'over budget' : 'remaining'}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        <BudgetProgress 
          key="weekly-budget"
          title="Weekly Budget" 
          current={weeklyBudget?.currentSpending || 0} 
          target={weeklyBudget?.targetBudget || 0} 
          period="This Week"
          plannedAmount={
            weeklyPlan?.expensesTotal || 
            (monthlyPlan ? (monthlyPlan.expensesTotal || 0) / 4.33 : undefined)
          }
        />
        <BudgetProgress 
          key="monthly-budget"
          title="Monthly Budget" 
          current={monthlyBudget?.currentSpending || 0} 
          target={monthlyBudget?.targetBudget || 0} 
          period="This Month"
          plannedAmount={monthlyPlan?.expensesTotal}
        />
      </div>

      {/* Daily Spending Trend */}
      <DailySpendingTrend />

      <div className="grid gap-4 md:grid-cols-2">
        <UpcomingBills key="upcoming-bills" />
        <SavingsGoals key="savings-goals" />
      </div>

      {/* Recent Expenses */}
      <RecentExpenses />
    </div>
  )
}
