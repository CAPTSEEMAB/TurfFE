import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

interface UseFetchOptions {
  redirectTo?: string;
  immediate?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

// Fetches data from authenticated API endpoints with auto-redirect on 401 errors
export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { redirectTo = '/auth', immediate = true } = options;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!url) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await apiFetch(url);
      
      if (res.status === 401) {
        navigate(redirectTo);
        return;
      }
      
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [url, navigate, redirectTo]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate(redirectTo);
      return;
    }
    
    if (immediate) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo, immediate, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

interface UseMutationOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseMutationReturn<T> {
  mutate: (body?: T) => Promise<boolean>;
  loading: boolean;
}

/**
 * Custom hook for API mutations (POST, PUT, DELETE)
 */
export function useMutation<T = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options: UseMutationOptions = {}
): UseMutationReturn<T> {
  const { onSuccess, onError, successMessage, errorMessage } = options;
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (body?: T): Promise<boolean> => {
    setLoading(true);
    
    try {
      const res = await apiFetch(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (successMessage) toast.success(successMessage);
        onSuccess?.(data);
        return true;
      } else {
        const msg = data.message || errorMessage || 'Operation failed';
        toast.error(msg);
        onError?.(msg);
        return false;
      }
    } catch (err) {
      const msg = 'Network error';
      toast.error(msg);
      onError?.(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [url, method, onSuccess, onError, successMessage, errorMessage]);

  return { mutate, loading };
}

/**
 * Hook for search/filter functionality with debounce
 */
export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const filtered = items.filter((item) => {
    if (!debouncedQuery) return true;
    const lowerQuery = debouncedQuery.toLowerCase();
    return searchFields.some((field) => {
      const value = item[field];
      return typeof value === 'string' && value.toLowerCase().includes(lowerQuery);
    });
  });

  return { query, setQuery, filtered, isFiltering: query !== debouncedQuery };
}
