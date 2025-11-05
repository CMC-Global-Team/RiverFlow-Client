import apiClient from '@/lib/apiClient';
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

const MINDMAP_API_BASE = '/api/mindmaps';

/**
 * Create a new mindmap
 */
export const createMindmap = async (
  data: CreateMindmapRequest
): Promise<MindmapResponse> => {
  const response = await apiClient.post<MindmapResponse>(MINDMAP_API_BASE, data);
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

