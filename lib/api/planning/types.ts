// Planning API Types

export const PlanTypeEnum = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const

export type PlanType = typeof PlanTypeEnum[keyof typeof PlanTypeEnum]

export const PlanItemTypeEnum = {
  INCOME: 'income',
  EXPENSE: 'expense',
  SAVINGS: 'savings'
} as const

export type PlanItemType = typeof PlanItemTypeEnum[keyof typeof PlanItemTypeEnum]

// Plan Item Interface
export interface PlanItem {
  id: string
  description: string
  amount: number
  categoryId: string | null
  userId: string
  planType: string
  itemType: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

// Financial Plan Response Interface
export interface FinancialPlan {
  type: string
  userId: string
  income: PlanItem[]
  expenses: PlanItem[]
  savings: PlanItem[]
  incomeTotal: number
  expensesTotal: number
  savingsTotal: number
  balance: number
  updatedAt: Date
}

// Input Types for Creating/Updating Plan Items
export interface PlanItemInput {
  description: string
  amount: number
  categoryId?: string
  notes?: string
}

// Input Types for Updating Plan Items (all fields optional)
export interface PlanItemUpdateInput {
  description?: string
  amount?: number
  categoryId?: string
  notes?: string
}

// Complete Plan Save Input
export interface SavePlanInput {
  income?: PlanItemInput[]
  expenses?: PlanItemInput[]
  savings?: PlanItemInput[]
  incomeTotal?: number
  expensesTotal?: number
  savingsTotal?: number
}

// API Error Response
export interface PlanningApiError {
  message: string
  status: number
} 