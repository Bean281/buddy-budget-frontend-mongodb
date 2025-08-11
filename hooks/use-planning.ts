import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFinancialPlan,
  addIncomeItem,
  addExpenseItem,
  addSavingsItem,
  updateIncomeItem,
  updateExpenseItem,
  updateSavingsItem,
  deleteIncomeItem,
  deleteExpenseItem,
  deleteSavingsItem,
  saveCompletePlan
} from '@/lib/api/planning/service'
import {
  PlanType,
  PlanItemInput,
  PlanItemUpdateInput,
  SavePlanInput,
  PlanningApiError
} from '@/lib/api/planning/types'

// Query Keys
const planningKeys = {
  all: ['planning'] as const,
  plan: (type: PlanType) => [...planningKeys.all, 'plan', type] as const,
}

// ====================
// QUERIES
// ====================

// Get Financial Plan
export function useFinancialPlan(type: PlanType) {
  return useQuery({
    queryKey: planningKeys.plan(type),
    queryFn: () => getFinancialPlan(type),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ====================
// MUTATIONS
// ====================

// Add Income Item
export function useAddIncomeItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, data }: { type: PlanType; data: PlanItemInput }) =>
      addIncomeItem(type, data),
    onSuccess: (_, { type }) => {
      // Invalidate and refetch the financial plan
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error adding income item:', error)
    }
  })
}

// Add Expense Item
export function useAddExpenseItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, data }: { type: PlanType; data: PlanItemInput }) =>
      addExpenseItem(type, data),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error adding expense item:', error)
    }
  })
}

// Add Savings Item
export function useAddSavingsItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, data }: { type: PlanType; data: PlanItemInput }) =>
      addSavingsItem(type, data),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error adding savings item:', error)
    }
  })
}

// Update Income Item
export function useUpdateIncomeItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      type, 
      id, 
      data 
    }: { 
      type: PlanType; 
      id: string; 
      data: PlanItemUpdateInput 
    }) => updateIncomeItem(type, id, data),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error updating income item:', error)
    }
  })
}

// Update Expense Item
export function useUpdateExpenseItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      type, 
      id, 
      data 
    }: { 
      type: PlanType; 
      id: string; 
      data: PlanItemUpdateInput 
    }) => updateExpenseItem(type, id, data),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error updating expense item:', error)
    }
  })
}

// Update Savings Item
export function useUpdateSavingsItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      type, 
      id, 
      data 
    }: { 
      type: PlanType; 
      id: string; 
      data: PlanItemUpdateInput 
    }) => updateSavingsItem(type, id, data),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error updating savings item:', error)
    }
  })
}

// Delete Income Item
export function useDeleteIncomeItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, id }: { type: PlanType; id: string }) =>
      deleteIncomeItem(type, id),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error deleting income item:', error)
    }
  })
}

// Delete Expense Item
export function useDeleteExpenseItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, id }: { type: PlanType; id: string }) =>
      deleteExpenseItem(type, id),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error deleting expense item:', error)
    }
  })
}

// Delete Savings Item
export function useDeleteSavingsItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, id }: { type: PlanType; id: string }) =>
      deleteSavingsItem(type, id),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error deleting savings item:', error)
    }
  })
}

// Save Complete Plan
export function useSaveCompletePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, data }: { type: PlanType; data: SavePlanInput }) =>
      saveCompletePlan(type, data),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: planningKeys.plan(type) })
    },
    onError: (error: PlanningApiError) => {
      console.error('Error saving complete plan:', error)
    }
  })
}

// ====================
// UTILITY HOOKS
// ====================

// Hook to invalidate all planning queries
export function useInvalidatePlanningQueries() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: planningKeys.all })
  }
}

// Hook to prefetch a financial plan
export function usePrefetchFinancialPlan() {
  const queryClient = useQueryClient()
  
  return (type: PlanType) => {
    queryClient.prefetchQuery({
      queryKey: planningKeys.plan(type),
      queryFn: () => getFinancialPlan(type),
      staleTime: 5 * 60 * 1000,
    })
  }
} 