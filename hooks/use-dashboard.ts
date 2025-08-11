import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard/service'
import {
  FinancialSummaryParams,
  BudgetProgressParams,
  RecentExpensesParams,
  BudgetPeriod,
  DashboardApiError
} from '@/lib/api/dashboard/types'

// Query Keys
const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (params?: FinancialSummaryParams) => [...dashboardKeys.all, 'summary', params] as const,
  todaySpending: () => [...dashboardKeys.all, 'today-spending'] as const,
  budgetProgress: (period: BudgetPeriod) => [...dashboardKeys.all, 'budget-progress', period] as const,
  recentExpenses: (params?: RecentExpensesParams) => [...dashboardKeys.all, 'recent-expenses', params] as const,
}

// ====================
// QUERIES
// ====================

// Get Financial Summary
export function useFinancialSummary(params?: FinancialSummaryParams) {
  return useQuery({
    queryKey: dashboardKeys.summary(params),
    queryFn: () => dashboardApi.getFinancialSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get Today's Spending
export function useTodaySpending() {
  return useQuery({
    queryKey: dashboardKeys.todaySpending(),
    queryFn: () => dashboardApi.getTodaySpending(),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for today's data)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

// Get Budget Progress
export function useBudgetProgress(period: BudgetPeriod) {
  return useQuery({
    queryKey: dashboardKeys.budgetProgress(period),
    queryFn: () => dashboardApi.getBudgetProgress({ period }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get Recent Expenses
export function useRecentExpenses(params?: RecentExpensesParams) {
  return useQuery({
    queryKey: dashboardKeys.recentExpenses(params),
    queryFn: () => dashboardApi.getRecentExpenses(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ====================
// UTILITY HOOKS
// ====================

// Invalidate all dashboard queries
export function useInvalidateDashboardQueries() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
  }
}

// Prefetch dashboard data
export function usePrefetchDashboard() {
  const queryClient = useQueryClient()
  
  return {
    prefetchFinancialSummary: (params?: FinancialSummaryParams) => {
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.summary(params),
        queryFn: () => dashboardApi.getFinancialSummary(params),
        staleTime: 5 * 60 * 1000,
      })
    },
    
    prefetchTodaySpending: () => {
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.todaySpending(),
        queryFn: () => dashboardApi.getTodaySpending(),
        staleTime: 2 * 60 * 1000,
      })
    },
    
    prefetchBudgetProgress: (period: BudgetPeriod) => {
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.budgetProgress(period),
        queryFn: () => dashboardApi.getBudgetProgress({ period }),
        staleTime: 5 * 60 * 1000,
      })
    },
    
    prefetchRecentExpenses: (params?: RecentExpensesParams) => {
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.recentExpenses(params),
        queryFn: () => dashboardApi.getRecentExpenses(params),
        staleTime: 2 * 60 * 1000,
      })
    },
  }
} 