/**
 * Custom hook để quản lý mutations (create, update, delete) features
 */

import { useState } from "react"
import {
  createFeature,
  updateFeature,
  deleteFeature,
  FeatureRequest,
  FeatureResponse,
} from "@/services/admin/feature.service"
import type { ApiErrorResponse } from "@/types/package.types"

interface UseFeatureMutationsResult {
  create: (data: FeatureRequest) => Promise<FeatureResponse | null>
  update: (id: number, data: FeatureRequest) => Promise<FeatureResponse | null>
  remove: (id: number) => Promise<boolean>
  isLoading: boolean
  error: ApiErrorResponse | null
  clearError: () => void
}

/**
 * Hook xử lý các thao tác create, update, delete feature
 */
export const useFeatureMutations = (): UseFeatureMutationsResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const create = async (
    data: FeatureRequest
  ): Promise<FeatureResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await createFeature(data)
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
    data: FeatureRequest
  ): Promise<FeatureResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await updateFeature(id, data)
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
      await deleteFeature(id)
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

