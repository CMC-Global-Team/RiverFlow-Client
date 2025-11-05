import { useState, useEffect } from 'react';
import {
  getAllMindmaps,
  getArchivedMindmaps,
} from '@/services/mindmap/mindmap.service';
import { MindmapSummary } from '@/types/mindmap.types';

/**
 * Hook to fetch mindmaps by status (active or archived)
 */
export const useMindmapsByStatus = (status: 'active' | 'archived') => {
  const [mindmaps, setMindmaps] = useState<MindmapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMindmaps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = status === 'archived' 
        ? await getArchivedMindmaps()
        : await getAllMindmaps();
      
      setMindmaps(data);
    } catch (err: any) {
      const errorMessage = err.response?.status === 403 
        ? 'Authentication failed (403). Please log in again.'
        : err.response?.data?.message || 'Failed to fetch mindmaps';
      setError(errorMessage);
      console.error('Error fetching mindmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMindmaps();
  }, [status]);

  return {
    mindmaps,
    loading,
    error,
    refetch: fetchMindmaps,
  };
};

