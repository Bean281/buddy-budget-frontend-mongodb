import apiClient from '../client';
import { 
  FinancialPlan, 
  PlanItem, 
  PlanItemInput, 
  PlanItemUpdateInput, 
  SavePlanInput,
  PlanType
} from './types';

// Get Financial Plan
export function getFinancialPlan(type: PlanType): Promise<FinancialPlan> {
  return apiClient
    .get<FinancialPlan>('/planning', { params: { type } })
    .then(res => {
      console.log('API /planning response:', res.data);
      return res.data;
    });
}

// Income Items
export function addIncomeItem(type: PlanType, data: PlanItemInput): Promise<PlanItem> {
  return apiClient
    .post<PlanItem>(`/planning/${type}/income`, data)
    .then(res => res.data);
}

export function updateIncomeItem(type: PlanType, id: string, data: PlanItemUpdateInput): Promise<PlanItem> {
  return apiClient
    .put<PlanItem>(`/planning/${type}/income/${id}`, data)
    .then(res => res.data);
}

export function deleteIncomeItem(type: PlanType, id: string): Promise<void> {
  return apiClient
    .delete(`/planning/${type}/income/${id}`)
    .then(() => {});
}

// Expense Items
export function addExpenseItem(type: PlanType, data: PlanItemInput): Promise<PlanItem> {
  return apiClient
    .post<PlanItem>(`/planning/${type}/expenses`, data)
    .then(res => res.data);
}

export function updateExpenseItem(type: PlanType, id: string, data: PlanItemUpdateInput): Promise<PlanItem> {
  return apiClient
    .put<PlanItem>(`/planning/${type}/expenses/${id}`, data)
    .then(res => res.data);
}

export function deleteExpenseItem(type: PlanType, id: string): Promise<void> {
  return apiClient
    .delete(`/planning/${type}/expenses/${id}`)
    .then(() => {});
}

// Savings Items
export function addSavingsItem(type: PlanType, data: PlanItemInput): Promise<PlanItem> {
  return apiClient
    .post<PlanItem>(`/planning/${type}/savings`, data)
    .then(res => res.data);
}

export function updateSavingsItem(type: PlanType, id: string, data: PlanItemUpdateInput): Promise<PlanItem> {
  return apiClient
    .put<PlanItem>(`/planning/${type}/savings/${id}`, data)
    .then(res => res.data);
}

export function deleteSavingsItem(type: PlanType, id: string): Promise<void> {
  return apiClient
    .delete(`/planning/${type}/savings/${id}`)
    .then(() => {});
}

// Save Complete Plan
export function saveCompletePlan(type: PlanType, data: SavePlanInput): Promise<FinancialPlan> {
  return apiClient
    .put<FinancialPlan>(`/planning/${type}`, data)
    .then(res => res.data);
} 