/**
 * Service xử lý các API liên quan đến package features management
 */

import apiClient from "@/lib/apiClient"
import type { ApiErrorResponse } from "@/types/package.types"
import { AxiosError } from "axios"

const FEATURE_API_BASE = "/api/admin/features"

export interface FeatureRequest {
  featureKey: string
  featureName: string
  description?: string
  category: string
  isActive?: boolean
}

export interface FeatureResponse {
  id: number
  featureKey: string
  featureName: string
  description?: string
  category: string
  isActive: boolean
  createdAt: string
}

/**
 * Lấy tất cả features
 */
export const getAllFeatures = async (
  isActive?: boolean
): Promise<FeatureResponse[]> => {
  try {
    const params = isActive !== undefined ? { isActive } : {}
    const response = await apiClient.get<FeatureResponse[]>(FEATURE_API_BASE, {
      params,
    })
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to fetch features",
        status: error.response?.status,
        errors: error.response?.data?.errors,
      }
      throw apiError
    }
    throw {
      message: "Cannot connect to server",
    } as ApiErrorResponse
  }
}

/**
 * Lấy feature theo ID
 */
export const getFeatureById = async (id: number): Promise<FeatureResponse> => {
  try {
    const response = await apiClient.get<FeatureResponse>(
      `${FEATURE_API_BASE}/${id}`
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to fetch feature",
        status: error.response?.status,
        errors: error.response?.data?.errors,
      }
      throw apiError
    }
    throw {
      message: "Cannot connect to server",
    } as ApiErrorResponse
  }
}

/**
 * Tạo feature mới
 */
export const createFeature = async (
  data: FeatureRequest
): Promise<FeatureResponse> => {
  try {
    const response = await apiClient.post<FeatureResponse>(
      FEATURE_API_BASE,
      data
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to create feature",
        status: error.response?.status,
        errors: error.response?.data?.errors,
      }
      throw apiError
    }
    throw {
      message: "Cannot connect to server",
    } as ApiErrorResponse
  }
}

/**
 * Cập nhật feature
 */
export const updateFeature = async (
  id: number,
  data: FeatureRequest
): Promise<FeatureResponse> => {
  try {
    const response = await apiClient.put<FeatureResponse>(
      `${FEATURE_API_BASE}/${id}`,
      data
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to update feature",
        status: error.response?.status,
        errors: error.response?.data?.errors,
      }
      throw apiError
    }
    throw {
      message: "Cannot connect to server",
    } as ApiErrorResponse
  }
}

/**
 * Xóa feature
 */
export const deleteFeature = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${FEATURE_API_BASE}/${id}`)
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to delete feature",
        status: error.response?.status,
        errors: error.response?.data?.errors,
      }
      throw apiError
    }
    throw {
      message: "Cannot connect to server",
    } as ApiErrorResponse
  }
}

