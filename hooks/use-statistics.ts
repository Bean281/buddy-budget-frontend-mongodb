import { useQuery, useQueryClient } from '@tanstack/react-query'
import { statisticsApi } from '@/lib/api/statistics/service'
import {
  IncomeExpensesParams,
  ExpenseCategoriesParams,
  MonthlyTrendsParams,
  DailySpendingParams,
  BudgetActualParams,
  BudgetComparisonGroup,
  StatisticsPeriod,
  StatisticsApiError
} from '@/lib/api/statistics/types'

// Query Keys
const statisticsKeys = {
  all: ['statistics'] as const,
  incomeExpenses: (params: IncomeExpensesParams) => [...statisticsKeys.all, 'income-expenses', params] as const,
  expenseCategories: (params: ExpenseCategoriesParams) => [...statisticsKeys.all, 'expense-categories', params] as const,
  savingsGoals: () => [...statisticsKeys.all, 'savings-goals'] as const,
  monthlyTrends: (params?: MonthlyTrendsParams) => [...statisticsKeys.all, 'monthly-trends', params] as const,
  dailySpending: (params?: DailySpendingParams) => [...statisticsKeys.all, 'daily-spending', params] as const,
  budgetActual: (params: BudgetActualParams) => [...statisticsKeys.all, 'budget-actual', params] as const,
}

// ====================
// QUERIES
// ====================

// 1. Get Income vs Expenses Chart Data
export function useIncomeExpenses(params: IncomeExpensesParams) {
  return useQuery({
    queryKey: statisticsKeys.incomeExpenses(params),
    queryFn: () => statisticsApi.getIncomeExpenses(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

// 2. Get Expense Categories Breakdown
export function useExpenseCategories(params: ExpenseCategoriesParams) {
  return useQuery({
    queryKey: statisticsKeys.expenseCategories(params),
    queryFn: () => statisticsApi.getExpenseCategories(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

// 3. Get Savings Goals Progress
export function useStatisticsSavingsGoals() {
  return useQuery({
    queryKey: statisticsKeys.savingsGoals(),
    queryFn: () => statisticsApi.getSavingsGoals(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// 4. Get Monthly Trends
export function useMonthlyTrends(params?: MonthlyTrendsParams) {
  return useQuery({
    queryKey: statisticsKeys.monthlyTrends(params),
    queryFn: () => statisticsApi.getMonthlyTrends(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

// 5. Get Daily Spending Trend
export function useStatisticsDailySpending(params?: DailySpendingParams) {
  return useQuery({
    queryKey: statisticsKeys.dailySpending(params),
    queryFn: () => statisticsApi.getDailySpending(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

// 6. Get Budget vs Actual Comparison
export function useBudgetActual(params: BudgetActualParams) {
  return useQuery({
    queryKey: statisticsKeys.budgetActual(params),
    queryFn: () => statisticsApi.getBudgetActual(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

// ====================
// UTILITY HOOKS
// ====================

// Invalidate all statistics queries
export function useInvalidateStatisticsQueries() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: statisticsKeys.all })
  }
}

// Prefetch statistics data
export function usePrefetchStatistics() {
  const queryClient = useQueryClient()
  
  return {
    prefetchIncomeExpenses: (params: IncomeExpensesParams) => {
      queryClient.prefetchQuery({
        queryKey: statisticsKeys.incomeExpenses(params),
        queryFn: () => statisticsApi.getIncomeExpenses(params),
        staleTime: 10 * 60 * 1000,
      })
    },
    
    prefetchExpenseCategories: (params: ExpenseCategoriesParams) => {
      queryClient.prefetchQuery({
        queryKey: statisticsKeys.expenseCategories(params),
        queryFn: () => statisticsApi.getExpenseCategories(params),
        staleTime: 10 * 60 * 1000,
      })
    },
    
    prefetchSavingsGoals: () => {
      queryClient.prefetchQuery({
        queryKey: statisticsKeys.savingsGoals(),
        queryFn: () => statisticsApi.getSavingsGoals(),
        staleTime: 5 * 60 * 1000,
      })
    },
    
    prefetchMonthlyTrends: (params?: MonthlyTrendsParams) => {
      queryClient.prefetchQuery({
        queryKey: statisticsKeys.monthlyTrends(params),
        queryFn: () => statisticsApi.getMonthlyTrends(params),
        staleTime: 15 * 60 * 1000,
      })
    },
    
    prefetchDailySpending: (params?: DailySpendingParams) => {
      queryClient.prefetchQuery({
        queryKey: statisticsKeys.dailySpending(params),
        queryFn: () => statisticsApi.getDailySpending(params),
        staleTime: 10 * 60 * 1000,
      })
    },
    
    prefetchBudgetActual: (params: BudgetActualParams) => {
      queryClient.prefetchQuery({
        queryKey: statisticsKeys.budgetActual(params),
        queryFn: () => statisticsApi.getBudgetActual(params),
        staleTime: 10 * 60 * 1000,
      })
    },
  }
} 