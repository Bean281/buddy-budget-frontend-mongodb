// Statistics API Types

// Enums
export const StatisticsPeriodEnum = {
  WEEK: 'week',
  MONTH: 'month'
} as const

export type StatisticsPeriod = typeof StatisticsPeriodEnum[keyof typeof StatisticsPeriodEnum]

export const BudgetComparisonGroupEnum = {
  MONTH: 'month',
  CATEGORY: 'category'
} as const

export type BudgetComparisonGroup = typeof BudgetComparisonGroupEnum[keyof typeof BudgetComparisonGroupEnum]

// 1. Income vs Expenses Chart Types
export interface IncomeExpenseDataPoint {
  label: string
  income: number
  expense: number
  net: number
  startDate: Date
  endDate: Date
}

export interface IncomeExpensesData {
  data: IncomeExpenseDataPoint[]
  totalIncome: number
  totalExpenses: number
  period: StatisticsPeriod
}

export interface IncomeExpensesParams {
  period: StatisticsPeriod
  months?: number // Default: 3, Range: 1-24
}

// 2. Expense Categories Breakdown Types
export interface ExpenseCategoryBreakdown {
  id: string
  name: string
  color: string
  icon: string
  amount: number
  percentage: number
  count: number
}

export interface ExpenseCategoriesData {
  categories: ExpenseCategoryBreakdown[]
  totalAmount: number
  startDate: Date
  endDate: Date
}

export interface ExpenseCategoriesParams {
  startDate: string // ISO format: "2024-01-01"
  endDate: string   // ISO format: "2024-12-31"
}

// 3. Savings Goals Progress Types
export interface SavingsGoalProgress {
  id: string
  name: string
  currentAmount: number
  targetAmount: number
  progressPercentage: number
  remainingAmount: number
  targetDate: Date
  completed: boolean
}

export interface SavingsGoalsData {
  goals: SavingsGoalProgress[]
  totalSaved: number
  totalTarget: number
  averageProgress: number
}

// 4. Monthly Trends Types
export interface MonthlyTrendPoint {
  month: string
  income: number
  expenses: number
  savings: number
  net: number
  date: Date
}

export interface MonthlyTrendsData {
  months: MonthlyTrendPoint[]
  averageIncome: number
  averageExpenses: number
  averageSavings: number
  incomeTrend: number
  expensesTrend: number
  savingsTrend: number
}

export interface MonthlyTrendsParams {
  months?: number // Default: 6, Range: 1-36
}

// 5. Daily Spending Trend Types
export interface DailySpendingPoint {
  day: string
  amount: number
  transactionCount: number
  date: Date
  comparisonToAverage: number
}

export interface DailySpendingData {
  days: DailySpendingPoint[]
  totalAmount: number
  averageAmount: number
  highestAmount: number
  lowestAmount: number
}

export interface DailySpendingParams {
  days?: number // Default: 14, Range: 1-90
}

// 6. Budget vs Actual Comparison Types
export interface BudgetActualItem {
  label: string
  id: string
  budgetAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  color: string
}

export interface BudgetActualData {
  items: BudgetActualItem[]
  totalBudget: number
  totalActual: number
  totalVariance: number
  totalVariancePercentage: number
  groupBy: BudgetComparisonGroup
}

export interface BudgetActualParams {
  by: BudgetComparisonGroup
}

// API Error Response
export interface StatisticsApiError {
  statusCode: number
  message: string
  error: string
} 