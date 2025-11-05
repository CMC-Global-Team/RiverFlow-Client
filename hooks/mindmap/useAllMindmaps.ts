import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { MindmapSummary } from '@/types/mindmap.types';

/**
 * Hook to fetch ALL mindmaps (active + archived) for current user
 * This is different from useMindmaps which only fetches active ones
 */
export const useAllMindmaps = () => {
  const [mindmaps, setMindmaps] = useState<MindmapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllMindmaps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both active and archived
      const [activeResponse, archivedResponse] = await Promise.all([
        apiClient.get<MindmapSummary[]>('/api/mindmaps'),
        apiClient.get<MindmapSummary[]>('/api/mindmaps/archived'),
      ]);
      
      // Combine both lists
      const allMindmaps = [...activeResponse.data, ...archivedResponse.data];
      setMindmaps(allMindmaps);
    } catch (err: any) {
      const errorMessage = err.response?.status === 403 
        ? 'Authentication failed (403). Please log in again.'
        : err.response?.data?.message || 'Failed to fetch mindmaps';
      setError(errorMessage);
      console.error('Error fetching all mindmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMindmaps();
  }, []);

  return {
    mindmaps,
    loading,
    error,
    refetch: fetchAllMindmaps,
  };
};

