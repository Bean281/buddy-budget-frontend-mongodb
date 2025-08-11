import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoriesApi } from "@/lib/api/categories/service"
import type { Category, CategoryType, CreateCategoryDTO, UpdateCategoryDTO } from "@/lib/api/categories/types"

export const CATEGORIES_QUERY_KEY = ["categories"] as const

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, { type }],
    queryFn: () => categoriesApi.getAll({ type }),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (category: CreateCategoryDTO) => categoriesApi.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCategoryDTO & { id: string }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
} 