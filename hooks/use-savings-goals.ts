import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSavingsGoals,
  getSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addFundsToSavingsGoal,
  completeSavingsGoal,
  getSavingsGoalStatistics,
  getSavingsGoalsHistory,
} from '@/lib/api/savings-goals/service';
import { 
  SavingsGoal,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  AddFundsInput,
  SavingsGoalStatistics,
  SavingsGoalHistoryData,
  SavingsGoalHistoryResponse
} from '@/lib/api/savings-goals/types';

/**
 * Hook to fetch all savings goals with optional status filter
 */
export function useSavingsGoals(params?: { status?: 'active' | 'completed' }) {
  return useQuery<SavingsGoal[]>({
    queryKey: ['savings-goals', params],
    queryFn: () => getSavingsGoals(params),
  });
}

/**
 * Hook to fetch a single savings goal by ID
 */
export function useSavingsGoal(id: string) {
  return useQuery<SavingsGoal>({
    queryKey: ['savings-goal', id],
    queryFn: () => getSavingsGoal(id),
    enabled: !!id, // Only run the query if an ID is provided
  });
}

/**
 * Hook to create a new savings goal
 */
export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSavingsGoal,
    onSuccess: () => {
      // Invalidate and refetch savings goals queries
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-goal-statistics'] });
    },
  });
}

/**
 * Hook to update an existing savings goal
 */
export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavingsGoalInput }) =>
      updateSavingsGoal(id, data),
    onSuccess: (updatedGoal) => {
      // Update the cache with the updated goal
      queryClient.setQueryData(['savings-goal', updatedGoal.id], updatedGoal);
      // Also invalidate the goals list and statistics
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-goal-statistics'] });
    },
  });
}

/**
 * Hook to delete a savings goal
 */
export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSavingsGoal,
    onSuccess: (_, deletedId) => {
      // Remove the goal from the cache
      queryClient.removeQueries({ queryKey: ['savings-goal', deletedId] });
      // Invalidate the goals list and statistics
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-goal-statistics'] });
    },
  });
}

/**
 * Hook to add funds to a savings goal
 */
export function useAddFundsToSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      addFundsToSavingsGoal(id, { amount }),
    onSuccess: (updatedGoal) => {
      // Update the cache with the updated goal
      queryClient.setQueryData(['savings-goal', updatedGoal.id], updatedGoal);
      // Also invalidate the goals list and statistics
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-goal-statistics'] });
    },
  });
}

/**
 * Hook to mark a savings goal as completed
 */
export function useCompleteSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeSavingsGoal,
    onSuccess: (updatedGoal) => {
      // Update the cache with the updated goal
      queryClient.setQueryData(['savings-goal', updatedGoal.id], updatedGoal);
      // Also invalidate the goals list and statistics
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-goal-statistics'] });
    },
  });
}

/**
 * Hook to fetch savings goals statistics
 */
export function useSavingsGoalStatistics() {
  return useQuery<SavingsGoalStatistics>({
    queryKey: ['savings-goal-statistics'],
    queryFn: getSavingsGoalStatistics,
  });
}

/**
 * Hook to fetch savings goals history
 */
export function useSavingsGoalsHistory(params?: { 
  months?: number;
  period?: string; 
  goalId?: string 
}) {
  return useQuery<SavingsGoalHistoryResponse>({
    queryKey: ['savings-goals-history', params],
    queryFn: () => getSavingsGoalsHistory(params),
  });
} 