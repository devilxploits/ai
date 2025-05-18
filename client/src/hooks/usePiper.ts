import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

export function usePiper() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textToSpeech = useCallback(async (text: string, voiceTone?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/tts', { text, voiceTone });
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
    textToSpeech,
    isLoading,
    error
  };
}
