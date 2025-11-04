/**
 * Custom hook để quản lý mutations (create, update, delete) currencies
 */

import { useState } from "react"
import {
  createCurrency,
  updateCurrency,
  deleteCurrency,
  CurrencyRequest,
  CurrencyResponse,
} from "@/services/admin/currency.service"
import type { ApiErrorResponse } from "@/types/package.types"

interface UseCurrencyMutationsResult {
  create: (data: CurrencyRequest) => Promise<CurrencyResponse | null>
  update: (id: number, data: CurrencyRequest) => Promise<CurrencyResponse | null>
  remove: (id: number) => Promise<boolean>
  isLoading: boolean
  error: ApiErrorResponse | null
  clearError: () => void
}

/**
 * Hook xử lý các thao tác create, update, delete currency
 */
export const useCurrencyMutations = (): UseCurrencyMutationsResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const create = async (
    data: CurrencyRequest
  ): Promise<CurrencyResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await createCurrency(data)
      return response
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const update = async (
    id: number,
    data: CurrencyRequest
  ): Promise<CurrencyResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await updateCurrency(id, data)
      return response
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const remove = async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await deleteCurrency(id)
      return true
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    create,
    update,
    remove,
    isLoading,
    error,
    clearError,
  }
}

