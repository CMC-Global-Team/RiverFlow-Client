/**
 * Service xử lý các API liên quan đến package management
 */

import apiClient from "@/lib/apiClient"
import type {
  PackageRequest,
  PackageResponse,
  PackageStatsResponse,
  FeatureResponse,
  CurrencyResponse,
  ApiErrorResponse,
} from "@/types/package.types"
import { AxiosError } from "axios"

const PACKAGE_API_BASE = "/api/admin/packages"

/**
 * Lấy tất cả packages
 */
export const getAllPackages = async (
  isActive?: boolean
): Promise<PackageResponse[]> => {
  try {
    const params = isActive !== undefined ? { isActive } : {}
    const response = await apiClient.get<PackageResponse[]>(PACKAGE_API_BASE, {
      params,
    })
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to fetch packages",
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
 * Lấy package theo ID
 */
export const getPackageById = async (id: number): Promise<PackageResponse> => {
  try {
    const response = await apiClient.get<PackageResponse>(
      `${PACKAGE_API_BASE}/${id}`
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to fetch package",
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
 * Lấy thống kê packages
 */
export const getPackageStats = async (): Promise<PackageStatsResponse> => {
  try {
    const response = await apiClient.get<PackageStatsResponse>(
      `${PACKAGE_API_BASE}/stats`
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message:
          error.response?.data?.message || "Failed to fetch package stats",
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
 * Tạo package mới
 */
export const createPackage = async (
  data: PackageRequest
): Promise<PackageResponse> => {
  try {
    const response = await apiClient.post<PackageResponse>(
      PACKAGE_API_BASE,
      data
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to create package",
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
 * Cập nhật package
 */
export const updatePackage = async (
  id: number,
  data: PackageRequest
): Promise<PackageResponse> => {
  try {
    const response = await apiClient.put<PackageResponse>(
      `${PACKAGE_API_BASE}/${id}`,
      data
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to update package",
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
 * Xóa package
 */
export const deletePackage = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${PACKAGE_API_BASE}/${id}`)
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to delete package",
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
 * Lấy tất cả features có sẵn
 */
export const getAllFeatures = async (): Promise<FeatureResponse[]> => {
  try {
    const response = await apiClient.get<FeatureResponse[]>(
      `${PACKAGE_API_BASE}/features`
    )
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
 * Lấy tất cả currencies active
 */
export const getAllCurrencies = async (): Promise<CurrencyResponse[]> => {
  try {
    const response = await apiClient.get<CurrencyResponse[]>(
      `${PACKAGE_API_BASE}/currencies`
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to fetch currencies",
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

