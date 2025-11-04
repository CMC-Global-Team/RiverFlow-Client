/**
 * Service xử lý các API liên quan đến currency management
 */

import apiClient from "@/lib/apiClient"
import type { ApiErrorResponse } from "@/types/package.types"
import { AxiosError } from "axios"

const CURRENCY_API_BASE = "/api/admin/currencies"

export interface CurrencyRequest {
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  isActive?: boolean
  displayOrder?: number
}

export interface CurrencyResponse {
  id: number
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  isActive: boolean
}

/**
 * Lấy tất cả currencies
 */
export const getAllCurrencies = async (
  isActive?: boolean
): Promise<CurrencyResponse[]> => {
  try {
    const params = isActive !== undefined ? { isActive } : {}
    const response = await apiClient.get<CurrencyResponse[]>(CURRENCY_API_BASE, {
      params,
    })
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

/**
 * Lấy currency theo ID
 */
export const getCurrencyById = async (
  id: number
): Promise<CurrencyResponse> => {
  try {
    const response = await apiClient.get<CurrencyResponse>(
      `${CURRENCY_API_BASE}/${id}`
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to fetch currency",
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
 * Tạo currency mới
 */
export const createCurrency = async (
  data: CurrencyRequest
): Promise<CurrencyResponse> => {
  try {
    const response = await apiClient.post<CurrencyResponse>(
      CURRENCY_API_BASE,
      data
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to create currency",
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
 * Cập nhật currency
 */
export const updateCurrency = async (
  id: number,
  data: CurrencyRequest
): Promise<CurrencyResponse> => {
  try {
    const response = await apiClient.put<CurrencyResponse>(
      `${CURRENCY_API_BASE}/${id}`,
      data
    )
    return response.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to update currency",
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
 * Xóa currency
 */
export const deleteCurrency = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${CURRENCY_API_BASE}/${id}`)
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Failed to delete currency",
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

