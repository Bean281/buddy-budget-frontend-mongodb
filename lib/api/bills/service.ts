import apiClient from '../client';
import {
  Bill,
  BillCreateInput,
  BillUpdateInput,
  BillPaymentInput,
  BillStatusEnum
} from './types';

export function getBills(params?: { status?: BillStatusEnum }): Promise<Bill[]> {
  return apiClient
    .get<Bill[]>('/bills', { params })
    .then(res => {
      console.log('API /bills response:', res.data);
      return res.data;
    });
}

export function getBillReminders(params?: { days?: number }): Promise<Bill[]> {
  return apiClient
    .get<Bill[]>('/bills/reminders', { params })
    .then(res => res.data);
}

export function getBill(id: string): Promise<Bill> {
  return apiClient
    .get<Bill>(`/bills/${id}`)
    .then(res => res.data);
}

export function createBill(data: BillCreateInput): Promise<Bill> {
  return apiClient
    .post<Bill>('/bills', data)
    .then(res => res.data);
}

export function updateBill(id: string, data: BillUpdateInput): Promise<Bill> {
  return apiClient
    .put<Bill>(`/bills/${id}`, data)
    .then(res => res.data);
}

export function markBillAsPaid(id: string, data?: BillPaymentInput): Promise<Bill> {
  return apiClient
    .put<Bill>(`/bills/${id}/pay`, data || {})
    .then(res => res.data);
}

export function deleteBill(id: string): Promise<void> {
  return apiClient
    .delete(`/bills/${id}`)
    .then(() => {});
} 