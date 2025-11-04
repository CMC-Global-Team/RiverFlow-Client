/**
 * Custom hook để lấy danh sách currencies
 */

import { useState, useEffect } from "react"
import { getAllCurrencies } from "@/services/admin/currency.service"
import type { ApiErrorResponse } from "@/types/package.types"
import type { CurrencyResponse } from "@/services/admin/currency.service"

interface UseCurrenciesResult {
  currencies: CurrencyResponse[]
  isLoading: boolean
  error: ApiErrorResponse | null
  refetch: (isActive?: boolean) => Promise<void>
}

/**
 * Hook lấy danh sách currencies
 */
export const useCurrencies = (isActive?: boolean): UseCurrenciesResult => {
  const [currencies, setCurrencies] = useState<CurrencyResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const fetchCurrencies = async (activeFilter?: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getAllCurrencies(activeFilter)
      setCurrencies(data)
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrencies(isActive)
  }, [isActive])

  return {
    currencies,
    isLoading,
    error,
    refetch: fetchCurrencies,
  }
}

