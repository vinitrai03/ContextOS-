import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

const MOCK_DASHBOARD_DATA = {
  upcomingMeetings: 4,
  todayMeetings: 2,
  completedMeetings: 18,
  recentActivity: [
    {
      id: 'act-1',
      action: 'AI Context Analyzed: Q3 Architecture Review',
      entityType: 'MEETING_ANALYSIS',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'act-2',
      action: 'Automated Follow-up Email Dispatched to 4 Attendees',
      entityType: 'EMAIL_DISPATCH',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'act-3',
      action: 'Vector Embeddings Indexed in pgvector',
      entityType: 'KNOWLEDGE_GRAPH',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'act-4',
      action: 'New Commitment Logged: PostgreSQL Optimization by Monday',
      entityType: 'COMMITMENT',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ],
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/dashboard/summary');
        return response.data || MOCK_DASHBOARD_DATA;
      } catch (err) {
        return MOCK_DASHBOARD_DATA;
      }
    },
    refetchInterval: 30000,
  });
};
