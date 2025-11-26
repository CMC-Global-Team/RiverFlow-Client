import apiClient from '@/lib/apiClient';
import { AxiosError } from 'axios';
import {
  CreateMindmapRequest,
  UpdateMindmapRequest,
  MindmapResponse,
  MindmapSummary,
  MessageResponse,
} from '@/types/mindmap.types';

/**
 * Service for Mindmap API operations
 */

const MINDMAP_API_BASE = '/mindmaps';

/**
 * Create a new mindmap
 */
export const createMindmap = async (
  data: CreateMindmapRequest
): Promise<MindmapResponse> => {
  const response = await apiClient.post<MindmapResponse>(MINDMAP_API_BASE, data);
  return response.data;
};

export const generateMindmapByAI = async (
  payload: {
    prompt: string;
    mode: 'normal' | 'max';
    model?: string;
    files?: File[];
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
): Promise<MindmapResponse> => {
  const formData = new FormData();
  formData.append('prompt', payload.prompt);
  // Compatibility: some backends expect 'topic' instead of 'prompt'
  formData.append('topic', payload.prompt);
  formData.append('mode', payload.mode);
  formData.append('model', payload.model ?? 'gemini-2.5-flash');
  formData.append('messages', JSON.stringify(payload.messages ?? []));
  (payload.files || []).forEach((f) => formData.append('files', f));

  const response = await apiClient.post<MindmapResponse>(
    `${MINDMAP_API_BASE}/ai/generate`,
    formData,
    {
      headers: {
        // Để axios tự set boundary cho multipart/form-data
        'Accept': 'application/json',
        'X-Suppress-403-Logout': '1',
        'Idempotency-Key': (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`)
      },
    }
  );
  return response.data;
};

export const optimizeMindmapByAI = async (
  payload: {
    mindmapId: string;
    targetType: 'node' | 'description' | 'structure';
    nodeId?: string;
    language?: string;
    mode?: string;
    hints?: string[];
    levels?: number;
    firstLevelCount?: number;
    tags?: string[];
  }
): Promise<MindmapResponse> => {
  const response = await apiClient.post<MindmapResponse>(
    `${MINDMAP_API_BASE}/ai/optimize`,
    payload,
    {
      headers: {
        Accept: 'application/json',
        'Idempotency-Key': (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`)
      },
    }
  );
  return response.data;
};

/**
 * Get all mindmaps for current user
 */
export const getAllMindmaps = async (): Promise<MindmapSummary[]> => {
  const response = await apiClient.get<MindmapSummary[]>(MINDMAP_API_BASE);
  return response.data;
};

/**
 * Get mindmap by ID
 */
export const getMindmapById = async (id: string): Promise<MindmapResponse> => {
  const response = await apiClient.get<MindmapResponse>(`${MINDMAP_API_BASE}/${id}`);
  return response.data;
};

/**
 * Get public mindmap by share token (NO AUTH REQUIRED)
 */
export const getPublicMindmap = async (shareToken: string): Promise<MindmapResponse> => {
  try {
    // Use configured API client to call backend directly (handles baseURL and CORS)
    const response = await apiClient.get<MindmapResponse>(`${MINDMAP_API_BASE}/public/${shareToken}`, {
      headers: { 'X-Allow-Public-Auth': '1', 'X-Share-Token': shareToken },
      params: { token: shareToken },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching public mindmap:', error);
    throw error as Error;
  }
};

export const updatePublicMindmap = async (
  shareToken: string,
  data: UpdateMindmapRequest
): Promise<MindmapResponse> => {
  try {
    const response = await apiClient.put<MindmapResponse>(
      `${MINDMAP_API_BASE}/public/${shareToken}`,
      data,
      {
        headers: { 'X-Share-Token': shareToken },
        params: { token: shareToken, id: (data as any).id },
      }
    );
    return response.data;
  } catch (e) {
    try {
      const response2 = await apiClient.put<MindmapResponse>(
        `${MINDMAP_API_BASE}/public`,
        data,
        {
          headers: { 'X-Share-Token': shareToken },
          params: { token: shareToken, id: (data as any).id },
        }
      );
      return response2.data;
    } catch (e2) {
      try {
        const response3 = await apiClient.patch<MindmapResponse>(
          `${MINDMAP_API_BASE}/public/${shareToken}`,
          data,
          {
            headers: { 'X-Share-Token': shareToken },
            params: { token: shareToken, id: (data as any).id },
          }
        );
        return response3.data;
      } catch (e3) {
        const response4 = await apiClient.put<MindmapResponse>(
          `${MINDMAP_API_BASE}/public/${shareToken}`,
          data,
          {
            headers: { 'X-Allow-Public-Auth': '1', 'X-Share-Token': shareToken },
            params: { token: shareToken, id: (data as any).id },
          }
        );
        return response4.data;
      }
    }
  }
};

export const updateMindmapByTokenFallback = async (
  id: string,
  shareToken: string,
  data: UpdateMindmapRequest
): Promise<MindmapResponse> => {
  const response = await apiClient.put<MindmapResponse>(
    `${MINDMAP_API_BASE}/${id}`,
    data,
    {
      headers: { 'X-Share-Token': shareToken },
      params: { token: shareToken },
    }
  );
  return response.data;
};

/**
 * Update mindmap
 */
export const updateMindmap = async (
  id: string,
  data: UpdateMindmapRequest
): Promise<MindmapResponse> => {
  const response = await apiClient.put<MindmapResponse>(
    `${MINDMAP_API_BASE}/${id}`,
    data
  );
  return response.data;
};

/**
 * Delete mindmap (soft delete)
 */
export const deleteMindmap = async (id: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`${MINDMAP_API_BASE}/${id}`);
  return response.data;
};

/**
 * Permanently delete mindmap
 */
export const permanentlyDeleteMindmap = async (id: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(
    `${MINDMAP_API_BASE}/${id}/permanent`
  );
  return response.data;
};

/**
 * Get mindmaps by category
 */
export const getMindmapsByCategory = async (
  category: string
): Promise<MindmapSummary[]> => {
  const response = await apiClient.get<MindmapSummary[]>(
    `${MINDMAP_API_BASE}/category/${category}`
  );
  return response.data;
};

/**
 * Get favorite mindmaps
 */
export const getFavoriteMindmaps = async (): Promise<MindmapSummary[]> => {
  const response = await apiClient.get<MindmapSummary[]>(
    `${MINDMAP_API_BASE}/favorites`
  );
  return response.data;
};

/**
 * Get archived mindmaps
 */
export const getArchivedMindmaps = async (): Promise<MindmapSummary[]> => {
  const response = await apiClient.get<MindmapSummary[]>(
    `${MINDMAP_API_BASE}/archived`
  );
  return response.data;
};

/**
 * Toggle favorite status
 */
export const toggleFavoriteMindmap = async (id: string): Promise<MindmapResponse> => {
  const response = await apiClient.post<MindmapResponse>(
    `${MINDMAP_API_BASE}/${id}/toggle-favorite`
  );
  return response.data;
};

/**
 * Archive mindmap
 */
export const archiveMindmap = async (id: string): Promise<MindmapResponse> => {
  const response = await apiClient.post<MindmapResponse>(
    `${MINDMAP_API_BASE}/${id}/archive`
  );
  return response.data;
};

/**
 * Unarchive mindmap
 */
export const unarchiveMindmap = async (id: string): Promise<MindmapResponse> => {
  const response = await apiClient.post<MindmapResponse>(
    `${MINDMAP_API_BASE}/${id}/unarchive`
  );
  return response.data;
};

/**
 * Search mindmaps
 */
export const searchMindmaps = async (keyword: string): Promise<MindmapSummary[]> => {
  const response = await apiClient.get<MindmapSummary[]>(
    `${MINDMAP_API_BASE}/search`,
    {
      params: { keyword },
    }
  );
  return response.data;
};

export const undoMindmap = async (mindmapId: string): Promise<MindmapResponse> => {
    // Gọi API /api/mindmaps/{id}/undo
    const response = await apiClient.post(`/mindmaps/${mindmapId}/undo`);
    return response.data;
};

export const redoMindmap = async (mindmapId: string): Promise<MindmapResponse> => {
    // Gọi API /api/mindmaps/{id}/redo
    const response = await apiClient.post(`/mindmaps/${mindmapId}/redo`);
    return response.data;
};

/**
 * Gọi API để nhân bản một mindmap
 * @param mindmapId ID của mindmap gốc
 * @returns Promise chứa dữ liệu mindmap MỚI
 */
export const duplicateMindmap = async (mindmapId: string): Promise<MindmapResponse> => {
  try {
    const response = await apiClient.post<MindmapResponse>(`/mindmaps/${mindmapId}/duplicate`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Lỗi khi nhân bản mindmap:', error.response?.data || error.message);
    }
    throw error; 
  }
};

/**
 * Mời cộng tác viên
 * POST /api/mindmaps/{id}/collaborators/invite
 */
export const inviteCollaborator = async (
  mindmapId: string, 
  email: string, 
  role: "EDITOR" | "VIEWER"
) => {
  const response = await apiClient.post(`/mindmaps/${mindmapId}/collaborators/invite`, {
    email,
    role
  });
  return response.data;
};

/**
 * Cập nhật quyền của cộng tác viên
 * PUT /api/mindmaps/{id}/collaborators/{email}/role
 */
export const updateCollaboratorRole = async (
  mindmapId: string,
  email: string,
  role: "EDITOR" | "VIEWER"
) => {
  const response = await apiClient.put(`/mindmaps/${mindmapId}/collaborators/${email}/role`, {
    role
  });
  return response.data;
};

/**
 * Xóa cộng tác viên khỏi mindmap
 * DELETE /api/mindmaps/{id}/collaborators/{email}
 */
export const removeCollaborator = async (
  mindmapId: string,
  email: string
) => {
  const response = await apiClient.delete(`/mindmaps/${mindmapId}/collaborators/${email}`);
  return response.data;
};

/**
 * Lấy danh sách cộng tác viên của mindmap
 * GET /api/mindmaps/{id}/collaborators
 */
export const getCollaborators = async (mindmapId: string) => {
  const response = await apiClient.get(`/mindmaps/${mindmapId}/collaborators`);
  return response.data;
};

/**
 * Lấy danh sách lời mời đang chờ xác nhận
 * GET /api/mindmaps/{id}/pending-invitations
 */
export const getPendingInvitations = async (mindmapId: string) => {
  const response = await apiClient.get(`/mindmaps/${mindmapId}/pending-invitations`);
  return response.data;
};

/**
 * Rời khỏi collaboration trên mindmap
 * POST /api/mindmaps/{id}/leave-collaboration
 */
export const leaveCollaboration = async (mindmapId: string) => {
  const response = await apiClient.post(`/mindmaps/${mindmapId}/leave-collaboration`);
  return response.data;
};

/**
 * Cập nhật quyền truy cập công khai của mindmap
 * PUT /api/mindmaps/{id}/public-access
 */
export const updatePublicAccess = async (
  mindmapId: string,
  isPublic: boolean,
  accessLevel?: "view" | "edit" | "private"
) => {
  const response = await apiClient.put(`/mindmaps/${mindmapId}/public-access`, {
    isPublic,
    accessLevel: accessLevel || "private"
  });
  return response.data;
};

