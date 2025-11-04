/**
 * Custom hook để quản lý mutations (create, update, delete) packages
 */

import { useState } from "react"
import {
  createPackage,
  updatePackage,
  deletePackage,
} from "@/services/admin/package.service"
import type {
  PackageRequest,
  PackageResponse,
  ApiErrorResponse,
} from "@/types/package.types"

interface UsePackageMutationsResult {
  create: (data: PackageRequest) => Promise<PackageResponse | null>
  update: (id: number, data: PackageRequest) => Promise<PackageResponse | null>
  remove: (id: number) => Promise<boolean>
  isLoading: boolean
  error: ApiErrorResponse | null
  clearError: () => void
}

/**
 * Hook xử lý các thao tác create, update, delete package
 */
export const usePackageMutations = (): UsePackageMutationsResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const create = async (
    data: PackageRequest
  ): Promise<PackageResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await createPackage(data)
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
    data: PackageRequest
  ): Promise<PackageResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await updatePackage(id, data)
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
      await deletePackage(id)
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

