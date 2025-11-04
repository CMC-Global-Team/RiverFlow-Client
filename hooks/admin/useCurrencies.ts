/**
 * Custom hook để lấy danh sách currencies
 */

import { useState, useEffect } from "react"
import { getAllCurrencies } from "@/services/admin/package.service"
import type { CurrencyResponse, ApiErrorResponse } from "@/types/package.types"

interface UseCurrenciesResult {
  currencies: CurrencyResponse[]
  isLoading: boolean
  error: ApiErrorResponse | null
  refetch: () => Promise<void>
}

/**
 * Hook lấy danh sách currencies
 */
export const useCurrencies = (): UseCurrenciesResult => {
  const [currencies, setCurrencies] = useState<CurrencyResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const fetchCurrencies = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getAllCurrencies()
      setCurrencies(data)
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrencies()
  }, [])

  return {
    currencies,
    isLoading,
    error,
    refetch: fetchCurrencies,
  }
}

