// Dashboard API Types

export const BudgetPeriodEnum = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const

export type BudgetPeriod = typeof BudgetPeriodEnum[keyof typeof BudgetPeriodEnum]

// Financial Summary Types
export interface FinancialSummary {
  incomeTotal: number
  expenseTotal: number
  savingsTotal: number
  remainingAmount: number
  startDate: Date
  endDate: Date
}

export interface FinancialSummaryParams {
  fromDate?: string
  toDate?: string
}

// Today's Spending Types
export interface TodaySpending {
  totalSpentToday: number
  transactionCount: number
  dailyBudget: number
  remainingBudget: number
  date: Date
}

// Budget Progress Types
export interface BudgetProgress {
  currentSpending: number
  targetBudget: number
  percentageUsed: number
  remainingAmount: number
  period: string
  startDate: Date
  endDate: Date
}

export interface BudgetProgressParams {
  period: BudgetPeriod
}

// Recent Expenses Types
export interface ExpenseCategory {
  id: string
  name: string
  icon: string
  color: string
}

export interface RecentExpenseItem {
  id: string
  amount: number
  date: Date
  description: string | null
  category: ExpenseCategory
}

export interface RecentExpenseDay {
  date: Date
  totalAmount: number
  expenses: RecentExpenseItem[]
}

export interface RecentExpenses {
  days: RecentExpenseDay[]
  totalAmount: number
  count: number
}

export interface RecentExpensesParams {
  limit?: number
}

// API Error Response
export interface DashboardApiError {
  message: string
  status: number
} 