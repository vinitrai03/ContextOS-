import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // In a real app we would have a /notifications endpoint
      // Mocking for now since Phase 2 backend doesn't have a GET /notifications controller yet, though the entity exists.
      try {
        const response = await apiClient.get('/dashboard/summary');
        return response.data.recentActivity || [];
      } catch (e) {
        return [];
      }
    },
    refetchInterval: 30000,
  });
};
