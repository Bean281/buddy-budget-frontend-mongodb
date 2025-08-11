import apiClient from '../client';
import {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionType,
} from './types';

export function getTransactions(params?: {
  fromDate?: string;
  toDate?: string;
  type?: TransactionType;
  categoryId?: string;
}): Promise<Transaction[]> {
  return apiClient
    .get<Transaction[]>('/transactions', { params })
    .then(res => {
        console.log('API /transactions response:', res.data);
        return res.data;
      });
}

export function getTransaction(id: string): Promise<Transaction> {
  return apiClient.get<Transaction>(`/transactions/${id}`).then(res => res.data);
}

export function createTransaction(
  data: TransactionCreateInput
): Promise<Transaction> {
  return apiClient.post<Transaction>('/transactions', data).then(res => res.data);
}

export function updateTransaction(
  id: string,
  data: TransactionUpdateInput
): Promise<Transaction> {
  return apiClient.put<Transaction>(`/transactions/${id}`, data).then(res => res.data);
}

export function deleteTransaction(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/transactions/${id}`).then(res => res.data);
}

export function getTransactionStats(params?: {
  fromDate?: string;
  toDate?: string;
}): Promise<any> {
  return apiClient
    .get('/transactions/stats/summary', { params })
    .then(res => res.data);
} 