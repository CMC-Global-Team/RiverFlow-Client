/**
 * Custom hook để quản lý packages
 */

import { useState, useEffect } from "react"
import { getAllPackages } from "@/services/admin/package.service"
import type { PackageResponse, ApiErrorResponse } from "@/types/package.types"

interface UsePackagesResult {
  packages: PackageResponse[]
  isLoading: boolean
  error: ApiErrorResponse | null
  refetch: (isActive?: boolean) => Promise<void>
}

/**
 * Hook lấy danh sách packages
 */
export const usePackages = (isActive?: boolean): UsePackagesResult => {
  const [packages, setPackages] = useState<PackageResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const fetchPackages = async (activeFilter?: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getAllPackages(activeFilter)
      setPackages(data)
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages(isActive)
  }, [isActive])

  return {
    packages,
    isLoading,
    error,
    refetch: fetchPackages,
  }
}

