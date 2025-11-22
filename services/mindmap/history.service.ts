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
  params?: { action?: string; after?: string; limit?: number; userId?: number | string; from?: string; to?: string; q?: string }
): Promise<HistoryItem[]> => {
  const response = await apiClient.get<HistoryItem[]>(`/mindmaps/${mindmapId}/history`, {
    params: {
      action: params?.action,
      after: params?.after,
      limit: params?.limit ?? 100,
      userId: params?.userId,
      from: params?.from,
      to: params?.to,
      q: params?.q,
    },
  })
  return response.data
}

export interface HistoryPageMeta { totalCount: number; totalPages: number }
export interface HistoryPage { items: HistoryItem[]; meta: HistoryPageMeta }

export const fetchHistoryPage = async (
  mindmapId: string,
  params?: { action?: string; page?: number; size?: number; from?: string; to?: string; q?: string }
): Promise<HistoryPage> => {
  const response = await apiClient.get<HistoryItem[]>(`/mindmaps/${mindmapId}/history`, {
    params: {
      action: params?.action,
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      from: params?.from,
      to: params?.to,
      q: params?.q,
    },
  })
  const totalPages = Number(response.headers['x-total-pages'] || 0)
  const totalCount = Number(response.headers['x-total-count'] || 0)
  return { items: response.data, meta: { totalPages, totalCount } }
}

export const logHistory = async (
  mindmapId: string,
  payload: { action: string; changes?: unknown; snapshot?: unknown; metadata?: unknown; status?: 'active' | 'undone' }
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/mindmaps/${mindmapId}/history`, payload)
  return response.data
}
