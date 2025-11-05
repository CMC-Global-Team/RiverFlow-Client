import { useState } from 'react';
import {
  createMindmap,
  updateMindmap,
  deleteMindmap,
  toggleFavoriteMindmap,
  archiveMindmap,
  unarchiveMindmap,
} from '@/services/mindmap/mindmap.service';
import {
  CreateMindmapRequest,
  UpdateMindmapRequest,
  MindmapResponse,
} from '@/types/mindmap.types';

/**
 * Hook for mindmap CRUD actions
 */
export const useMindmapActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateMindmapRequest): Promise<MindmapResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await createMindmap(data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create mindmap';
      setError(errorMsg);
      console.error('Error creating mindmap:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (
    id: string,
    data: UpdateMindmapRequest
  ): Promise<MindmapResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateMindmap(id, data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update mindmap';
      setError(errorMsg);
      console.error('Error updating mindmap:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await deleteMindmap(id);
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete mindmap';
      setError(errorMsg);
      console.error('Error deleting mindmap:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string): Promise<MindmapResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await toggleFavoriteMindmap(id);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to toggle favorite';
      setError(errorMsg);
      console.error('Error toggling favorite:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const archive = async (id: string): Promise<MindmapResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await archiveMindmap(id);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to archive mindmap';
      setError(errorMsg);
      console.error('Error archiving mindmap:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unarchive = async (id: string): Promise<MindmapResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await unarchiveMindmap(id);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to unarchive mindmap';
      setError(errorMsg);
      console.error('Error unarchiving mindmap:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    toggleFavorite,
    archive,
    unarchive,
    loading,
    error,
  };
};

