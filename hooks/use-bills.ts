import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBills,
  getBill,
  getBillReminders,
  createBill,
  updateBill,
  markBillAsPaid,
  deleteBill,
} from '@/lib/api/bills/service';
import {
  Bill,
  BillCreateInput,
  BillUpdateInput,
  BillPaymentInput,
  BillStatusEnum,
} from '@/lib/api/bills/types';

export function useBills(params?: { status?: BillStatusEnum }) {
  return useQuery<Bill[]>({
    queryKey: ['bills', params],
    queryFn: () => getBills(params),
  });
}

export function useBill(id: string) {
  return useQuery<Bill>({
    queryKey: ['bill', id],
    queryFn: () => getBill(id),
    enabled: !!id,
  });
}

export function useBillReminders(params?: { days?: number }) {
  return useQuery<Bill[]>({
    queryKey: ['bill-reminders', params],
    queryFn: () => getBillReminders(params),
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BillUpdateInput }) =>
      updateBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
    },
  });
}

export function useMarkBillAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: BillPaymentInput }) =>
      markBillAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      // Also invalidate transactions since a transaction might be created
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
    },
  });
} 