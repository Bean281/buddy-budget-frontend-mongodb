import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from '@/lib/api/transactions/service';
import {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionType,
} from '@/lib/api/transactions/types';

export function useTransactions(params?: {
  fromDate?: string;
  toDate?: string;
  type?: TransactionType;
  categoryId?: string;
}) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
  });
}

export function useTransaction(id: string) {
  return useQuery<Transaction>({
    queryKey: ['transaction', id],
    queryFn: () => getTransaction(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionUpdateInput }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useTransactionStats(params?: { fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: ['transaction-stats', params],
    queryFn: () => getTransactionStats(params),
  });
} 