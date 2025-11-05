import { useState, useEffect } from 'react';
import {
  getAllMindmaps,
  getFavoriteMindmaps,
  getArchivedMindmaps,
  searchMindmaps,
} from '@/services/mindmap/mindmap.service';
import { MindmapSummary } from '@/types/mindmap.types';

/**
 * Hook to fetch and manage mindmaps list
 */
export const useMindmaps = () => {
  const [mindmaps, setMindmaps] = useState<MindmapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMindmaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllMindmaps();
      setMindmaps(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch mindmaps');
      console.error('Error fetching mindmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMindmaps();
  }, []);

  return {
    mindmaps,
    loading,
    error,
    refetch: fetchMindmaps,
  };
};

/**
 * Hook to fetch favorite mindmaps
 */
export const useFavoriteMindmaps = () => {
  const [mindmaps, setMindmaps] = useState<MindmapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFavoriteMindmaps();
      setMindmaps(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch favorite mindmaps');
      console.error('Error fetching favorite mindmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    mindmaps,
    loading,
    error,
    refetch: fetchFavorites,
  };
};

/**
 * Hook to fetch archived mindmaps
 */
export const useArchivedMindmaps = () => {
  const [mindmaps, setMindmaps] = useState<MindmapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArchived = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getArchivedMindmaps();
      setMindmaps(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch archived mindmaps');
      console.error('Error fetching archived mindmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  return {
    mindmaps,
    loading,
    error,
    refetch: fetchArchived,
  };
};

/**
 * Hook to search mindmaps
 */
export const useSearchMindmaps = () => {
  const [mindmaps, setMindmaps] = useState<MindmapSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (keyword: string) => {
    if (!keyword.trim()) {
      setMindmaps([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await searchMindmaps(keyword);
      setMindmaps(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search mindmaps');
      console.error('Error searching mindmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    mindmaps,
    loading,
    error,
    search,
  };
};

