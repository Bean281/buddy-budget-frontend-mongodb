export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  completed: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  progressPercentage: number;
  daysRemaining: number | null;
}

export interface CreateSavingsGoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  notes?: string;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  targetAmount?: number;
  targetDate?: string;
  notes?: string;
}

export interface AddFundsInput {
  amount: number;
}

export interface SavingsGoalStatistics {
  goals: {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    progressPercentage: number;
    remainingAmount: number;
    targetDate: string | null;
    completed: boolean;
  }[];
  totalSaved: number;
  totalTarget: number;
  averageProgress: number;
}

export interface SavingsGoalHistoryEntry {
  date: string;
  amount: number;
  goalId: string;
  goalName: string;
  progressPercentage: number;
  targetAmount: number;
}

export interface SavingsGoalHistoryData {
  entries: SavingsGoalHistoryEntry[];
  totalEntries: number;
  period: string;
  goals: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
  }[];
}

// New types for the actual API response
export interface SavingsHistoryItem {
  id: string;
  description: string;
  amount: number;
  notes: string;
  createdAt: string;
}

export interface SavingsHistoryPeriod {
  period: string;        // "2025-05"
  periodName: string;    // "May 2025"
  totalSaved: number;
  itemsCount: number;
  items: SavingsHistoryItem[];
}

export interface SavingsHistorySummary {
  totalMonths: number;
  totalAcrossAllMonths: number;
  averagePerMonth: number;
  highestMonth: {
    period: string;
    amount: number;
  };
}

export interface SavingsGoalHistoryResponse {
  summary: SavingsHistorySummary;
  history: SavingsHistoryPeriod[];
} 