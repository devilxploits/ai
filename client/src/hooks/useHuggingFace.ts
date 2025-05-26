import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

export function useHuggingFace() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/messages', { content: message });
      const data = await response.json();
      
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    generateResponse,
    isLoading,
    error
  };
}