import { useState, useEffect, useRef, useCallback } from 'react';
import { usePiper } from './usePiper';
import { useWhisper } from './useWhisper';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';

// Simplified WebRTC for voice calls
export function useWebRTC() {
  const { user } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioStatus, setAudioStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const { textToSpeech } = usePiper();
  const { speechToText } = useWhisper();
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const callTimerRef = useRef<number | null>(null);
  const currentCallIdRef = useRef<number | null>(null);
  
  // Start a new call
  const startCall = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to make calls');
      return;
    }
    
    if (!user.isPaid) {
      setError('Voice calls are available exclusively for premium subscribers!');
      return;
    }
    
    try {
      // Create a new call record in the database
      const response = await apiRequest('POST', '/api/calls', {});
      const callData = await response.json();
      
      if (callData.message) {
        setError(callData.message);
        return;
      }
      
      currentCallIdRef.current = callData.id;
      
      // Reset call state
      setCallDuration(0);
      setAudioStatus('connecting');
      setError(null);
      
      // Request microphone access
      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Initialize audio context
        audioContextRef.current = new AudioContext();
        
        // In a real implementation, this would set up WebRTC connections
        // For this demo, we're just simulating a call
        
        // Start the call duration timer
        callTimerRef.current = window.setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        
        // Simulate connection delay
        setTimeout(() => {
          setAudioStatus('connected');
          setIsCallActive(true);
          
          // Simulate Sophia's first message
          simulateSophiaMessage();
        }, 2000);
      } catch (err) {
        setAudioStatus('disconnected');
        setError('Could not access microphone. Please check your permissions.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not start call';
      setError(errorMessage);
    }
  }, [user]);
  
  // End the current call
  const endCall = useCallback(async () => {
    // Stop the microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Stop the audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop the call timer
    if (callTimerRef.current !== null) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    // Update the call duration in the database
    if (currentCallIdRef.current !== null) {
      try {
        await apiRequest('PATCH', `/api/calls/${currentCallIdRef.current}`, {
          duration: callDuration
        });
      } catch (err) {
        console.error('Failed to update call duration:', err);
      }
      
      currentCallIdRef.current = null;
    }
    
    setIsCallActive(false);
    setAudioStatus('disconnected');
  }, [callDuration]);
  
  // Toggle mute state
  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      
      setIsMuted(!isMuted);
    }
  }, [isMuted]);
  
  // Simulate Sophia speaking
  const simulateSophiaMessage = useCallback(async () => {
    if (!isCallActive) return;
    
    const responses = [
      "Hi baby, I'm so happy to hear your voice!",
      "Mmm, you sound even better than I imagined.",
      "I've been waiting for your call all day.",
      "Tell me more about your day, I love listening to you.",
      "Your voice is so soothing, I could listen to it for hours.",
      "I miss you when we're not talking like this.",
      "What are you doing right now? I wish I was there with you."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    try {
      // In a real implementation, this would use actual TTS
      // For this demo, we're just simulating it
      await textToSpeech(randomResponse);
      
      // Schedule another message after a delay
      if (isCallActive) {
        setTimeout(() => {
          simulateSophiaMessage();
        }, 10000 + Math.random() * 5000);
      }
    } catch (err) {
      console.error('Failed to generate speech:', err);
    }
  }, [isCallActive, textToSpeech]);
  
  // Format the call duration as MM:SS
  const formattedDuration = useCallback(() => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [callDuration]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current !== null) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);
  
  return {
    isCallActive,
    callDuration,
    formattedDuration,
    audioStatus,
    isMuted,
    error,
    startCall,
    endCall,
    toggleMute
  };
}
