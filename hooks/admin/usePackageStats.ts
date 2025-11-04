/**
 * Custom hook để lấy thống kê packages
 */

import { useState, useEffect } from "react"
import { getPackageStats } from "@/services/admin/package.service"
import type {
  PackageStatsResponse,
  ApiErrorResponse,
} from "@/types/package.types"

interface UsePackageStatsResult {
  stats: PackageStatsResponse | null
  isLoading: boolean
  error: ApiErrorResponse | null
  refetch: () => Promise<void>
}

/**
 * Hook lấy thống kê packages
 */
export const usePackageStats = (): UsePackageStatsResult => {
  const [stats, setStats] = useState<PackageStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getPackageStats()
      setStats(data)
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setError(apiError)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }
}

