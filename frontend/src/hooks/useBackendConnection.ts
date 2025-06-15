
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useToast } from './use-toast';

export const useBackendConnection = () => {
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const { toast } = useToast();

  const checkBackendConnection = async () => {
    console.log('Checking backend connection...');
    const isConnected = await apiService.healthCheck();
    console.log('Backend connected:', isConnected);
    setBackendConnected(isConnected);
    
    if (!isConnected) {
      toast({
        title: "Backend Connection Failed",
        description: "Please ensure the FastAPI backend is running on http://localhost:8000",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkBackendConnection();
  }, []);

  return {
    backendConnected,
    checkBackendConnection
  };
};
