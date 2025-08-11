export type BillFrequencyEnum = 
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'BIANNUALLY'
  | 'ANNUALLY';

export type BillStatusEnum = 'UPCOMING' | 'PAID' | 'OVERDUE';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  frequency: BillFrequencyEnum;
  autopay: boolean;
  notes: string | null;
  lastPaymentDate: string | null; // ISO date string
  userId: string;
  categoryId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  status: BillStatusEnum;
  daysUntilDue: number;
  category: Category;
}

export interface BillCreateInput {
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  frequency: BillFrequencyEnum;
  categoryId: string;
  autopay?: boolean;
  notes?: string;
}

export interface BillUpdateInput {
  name?: string;
  amount?: number;
  dueDate?: string; // ISO date string
  frequency?: BillFrequencyEnum;
  categoryId?: string;
  autopay?: boolean;
  notes?: string;
}

export interface BillPaymentInput {
  paymentDate?: string; // ISO date string
  createTransaction?: boolean;
} 