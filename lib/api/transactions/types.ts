export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type TransactionType = 'EXPENSE' | 'INCOME';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
  description: string | null;
  notes: string | null;
  userId: string;
  categoryId: string;
  billId?: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface TransactionCreateInput {
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  description?: string;
  notes?: string;
  billId?: string;
}

export interface TransactionUpdateInput {
  amount?: number;
  type?: TransactionType;
  date?: string;
  categoryId?: string;
  description?: string;
  notes?: string;
  billId?: string;
} 