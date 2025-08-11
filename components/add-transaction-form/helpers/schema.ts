import { z } from 'zod';

export const transactionFormSchema = z.object({
  amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
  type: z.enum(['EXPENSE', 'INCOME']),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  notes: z.string().optional(),
  billId: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>; 