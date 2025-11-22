import apiClient from '@/lib/apiClient'

export interface HistoryItem {
  id: string
  mindmapId: string
  mysqlUserId: number
  action: string
  changes?: unknown
  snapshot?: unknown
  metadata?: unknown
  createdAt: string
  status: 'active' | 'undone'
}

export const fetchHistory = async (
  mindmapId: string,
  params?: { action?: string; after?: string; limit?: number }
): Promise<HistoryItem[]> => {
  const response = await apiClient.get<HistoryItem[]>(`/mindmaps/${mindmapId}/history`, {
    params: {
      action: params?.action,
      after: params?.after,
      limit: params?.limit ?? 100,
    },
  })
  return response.data
}

export const logHistory = async (
  mindmapId: string,
  payload: { action: string; changes?: unknown; snapshot?: unknown; metadata?: unknown; status?: 'active' | 'undone' }
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/mindmaps/${mindmapId}/history`, payload)
  return response.data
}

