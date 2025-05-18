import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

export function useWhisper() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speechToText = useCallback(async (audioData: ArrayBuffer) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert ArrayBuffer to Base64 string
      const base64Audio = btoa(
        new Uint8Array(audioData)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const response = await apiRequest('POST', '/api/stt', { audioData: base64Audio });
      const data = await response.json();
      
      setIsLoading(false);
      return data.transcription;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    speechToText,
    isLoading,
    error
  };
}
