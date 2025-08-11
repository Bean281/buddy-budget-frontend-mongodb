export type CategoryType = "INCOME" | "EXPENSE"

export interface Category {
  id: string
  userId: string
  name: string
  type: CategoryType
  icon: string
  color: string
  isDefault: boolean
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryDTO {
  name: string
  type: CategoryType
  icon: string
  color: string
  description?: string
}

export interface UpdateCategoryDTO {
  name?: string
  type?: CategoryType
  icon?: string
  color?: string
  description?: string
}

export interface GetCategoriesParams {
  type?: CategoryType
}

export interface CategoryResponse {
  message: string
} 