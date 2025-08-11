import apiClient from "../client"
import {
  IncomeExpensesData,
  IncomeExpensesParams,
  ExpenseCategoriesData,
  ExpenseCategoriesParams,
  SavingsGoalsData,
  MonthlyTrendsData,
  MonthlyTrendsParams,
  DailySpendingData,
  DailySpendingParams,
  BudgetActualData,
  BudgetActualParams,
} from "./types"

const STATISTICS_BASE_URL = "/statistics"

export const statisticsApi = {
  // 1. Get Income vs Expenses Chart Data
  getIncomeExpenses: async (params: IncomeExpensesParams): Promise<IncomeExpensesData> => {
    return apiClient.get<IncomeExpensesData>(`${STATISTICS_BASE_URL}/income-expenses`, {
      params,
    }).then(res => res.data)
  },

  // 2. Get Expense Categories Breakdown
  getExpenseCategories: async (params: ExpenseCategoriesParams): Promise<ExpenseCategoriesData> => {
    return apiClient.get<ExpenseCategoriesData>(`${STATISTICS_BASE_URL}/expense-categories`, {
      params,
    }).then(res => res.data)
  },

  // 3. Get Savings Goals Progress
  getSavingsGoals: async (): Promise<SavingsGoalsData> => {
    return apiClient.get<SavingsGoalsData>(`${STATISTICS_BASE_URL}/savings-goals`)
      .then(res => res.data)
  },

  // 4. Get Monthly Trends
  getMonthlyTrends: async (params?: MonthlyTrendsParams): Promise<MonthlyTrendsData> => {
    return apiClient.get<MonthlyTrendsData>(`${STATISTICS_BASE_URL}/monthly-trends`, {
      params,
    }).then(res => res.data)
  },

  // 5. Get Daily Spending Trend
  getDailySpending: async (params?: DailySpendingParams): Promise<DailySpendingData> => {
    return apiClient.get<DailySpendingData>(`${STATISTICS_BASE_URL}/daily-spending`, {
      params,
    }).then(res => res.data)
  },

  // 6. Get Budget vs Actual Comparison
  getBudgetActual: async (params: BudgetActualParams): Promise<BudgetActualData> => {
    return apiClient.get<BudgetActualData>(`${STATISTICS_BASE_URL}/budget-actual`, {
      params,
    }).then(res => res.data)
  },
} 