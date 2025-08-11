import apiClient from '../client';
import { 
  SavingsGoal, 
  CreateSavingsGoalInput, 
  UpdateSavingsGoalInput, 
  AddFundsInput,
  SavingsGoalStatistics,
  SavingsGoalHistoryData,
  SavingsGoalHistoryResponse
} from './types';

const BASE_URL = '/goals';

/**
 * Get all savings goals, optionally filtered by status
 */
export function getSavingsGoals(
  params?: { status?: 'active' | 'completed' }
): Promise<SavingsGoal[]> {
  return apiClient.get<SavingsGoal[]>(BASE_URL, { params }).then(res => res.data);
}

/**
 * Get a single savings goal by id
 */
export function getSavingsGoal(id: string): Promise<SavingsGoal> {
  return apiClient.get<SavingsGoal>(`${BASE_URL}/${id}`).then(res => res.data);
}

/**
 * Create a new savings goal
 */
export function createSavingsGoal(
  data: CreateSavingsGoalInput
): Promise<SavingsGoal> {
  return apiClient.post<SavingsGoal>(BASE_URL, data).then(res => res.data);
}

/**
 * Update an existing savings goal
 */
export function updateSavingsGoal(
  id: string,
  data: UpdateSavingsGoalInput
): Promise<SavingsGoal> {
  return apiClient.put<SavingsGoal>(`${BASE_URL}/${id}`, data).then(res => res.data);
}

/**
 * Delete a savings goal
 */
export function deleteSavingsGoal(id: string): Promise<void> {
  return apiClient.delete(`${BASE_URL}/${id}`).then(res => res.data);
}

/**
 * Add funds to a savings goal
 */
export function addFundsToSavingsGoal(
  id: string,
  data: AddFundsInput
): Promise<SavingsGoal> {
  return apiClient.put<SavingsGoal>(`${BASE_URL}/${id}/add-funds`, data).then(res => res.data);
}

/**
 * Mark a savings goal as completed
 */
export function completeSavingsGoal(id: string): Promise<SavingsGoal> {
  return apiClient.put<SavingsGoal>(`${BASE_URL}/${id}/complete`).then(res => res.data);
}

/**
 * Get savings goals statistics
 */
export function getSavingsGoalStatistics(): Promise<SavingsGoalStatistics> {
  return apiClient.get<SavingsGoalStatistics>('/statistics/savings-goals').then(res => res.data);
}

/**
 * Get savings goals history for trends
 */
export function getSavingsGoalsHistory(params?: { 
  months?: number;
  period?: string; 
  goalId?: string 
}): Promise<SavingsGoalHistoryResponse> {
  // Default to 12 months if no months specified
  const queryParams = {
    months: params?.months || 12,
    ...(params?.period && { period: params.period }),
    ...(params?.goalId && { goalId: params.goalId })
  };
  
  return apiClient.get<SavingsGoalHistoryResponse>(`${BASE_URL}/history`, { 
    params: queryParams 
  }).then(res => res.data);
} 