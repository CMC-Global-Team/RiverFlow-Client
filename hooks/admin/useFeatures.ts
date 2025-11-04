/**
 * Custom hook để lấy danh sách features
 */

import { useState, useEffect } from "react"
import { getAllFeatures } from "@/services/admin/package.service"
import type { FeatureResponse, ApiErrorResponse } from "@/types/package.types"

interface UseFeaturesResult {
  features: FeatureResponse[]
  isLoading: boolean
  error: ApiErrorResponse | null
  refetch: () => Promise<void>
}

/**
 * Hook lấy danh sách features
 */
export const useFeatures = (): UseFeaturesResult => {
  const [features, setFeatures] = useState<FeatureResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const fetchFeatures = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getAllFeatures()
      setFeatures(data)
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatures()
  }, [])

  return {
    features,
    isLoading,
    error,
    refetch: fetchFeatures,
  }
}

