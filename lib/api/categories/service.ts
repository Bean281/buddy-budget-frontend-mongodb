import apiClient from "../client"
import {
  Category,
  CreateCategoryDTO,
  GetCategoriesParams,
  UpdateCategoryDTO,
  CategoryResponse,
} from "./types"

const CATEGORIES_BASE_URL = "/categories"

export const categoriesApi = {
  getAll: async (params?: GetCategoriesParams): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>(CATEGORIES_BASE_URL, {
      params,
    })
    return data
  },

  create: async (category: CreateCategoryDTO): Promise<Category> => {
    const { data } = await apiClient.post<Category>(CATEGORIES_BASE_URL, category)
    return data
  },

  update: async (id: string, category: UpdateCategoryDTO): Promise<Category> => {
    const { data } = await apiClient.put<Category>(
      `${CATEGORIES_BASE_URL}/${id}`,
      category
    )
    return data
  },

  delete: async (id: string): Promise<CategoryResponse> => {
    const { data } = await apiClient.delete<CategoryResponse>(
      `${CATEGORIES_BASE_URL}/${id}`
    )
    return data
  },
} 