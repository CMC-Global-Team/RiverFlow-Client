/**
 * Custom hook để lấy danh sách features
 */

import { useState, useEffect } from "react"
import { getAllFeatures } from "@/services/admin/feature.service"
import type { ApiErrorResponse } from "@/types/package.types"
import type { FeatureResponse } from "@/services/admin/feature.service"

interface UseFeaturesResult {
  features: FeatureResponse[]
  isLoading: boolean
  error: ApiErrorResponse | null
  refetch: (isActive?: boolean) => Promise<void>
}

/**
 * Hook lấy danh sách features
 */
export const useFeatures = (isActive?: boolean): UseFeaturesResult => {
  const [features, setFeatures] = useState<FeatureResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const fetchFeatures = async (activeFilter?: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getAllFeatures(activeFilter)
      setFeatures(data)
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatures(isActive)
  }, [isActive])

  return {
    features,
    isLoading,
    error,
    refetch: fetchFeatures,
  }
}

