import apiClient from "../client"
import {
  FinancialSummary,
  FinancialSummaryParams,
  TodaySpending,
  BudgetProgress,
  BudgetProgressParams,
  RecentExpenses,
  RecentExpensesParams,
} from "./types"

const DASHBOARD_BASE_URL = "/dashboard"

export const dashboardApi = {
  // Get Financial Summary
  getFinancialSummary: async (params?: FinancialSummaryParams): Promise<FinancialSummary> => {
    return apiClient.get<FinancialSummary>(`${DASHBOARD_BASE_URL}/summary`, {
      params,
    }).then(res => res.data)
  },

  // Get Today's Spending
  getTodaySpending: async (): Promise<TodaySpending> => {
    return apiClient.get<TodaySpending>(`${DASHBOARD_BASE_URL}/today`)
      .then(res => res.data)
  },

  // Get Budget Progress
  getBudgetProgress: async (params: BudgetProgressParams): Promise<BudgetProgress> => {
    return apiClient.get<BudgetProgress>(`${DASHBOARD_BASE_URL}/budget-progress`, {
      params,
    }).then(res => res.data)
  },

  // Get Recent Expenses
  getRecentExpenses: async (params?: RecentExpensesParams): Promise<RecentExpenses> => {
    return apiClient.get<RecentExpenses>(`${DASHBOARD_BASE_URL}/recent-expenses`, {
      params,
    }).then(res => res.data)
  },
} 