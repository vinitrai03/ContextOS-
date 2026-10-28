import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Video, Calendar as CalendarIcon, Clock, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_MEETINGS = [
  {
    id: 'm1',
    code: 'CTX-7F82K91P',
    title: 'Q3 Architecture Review & Vector RAG',
    description: 'Review system design, STOMP signaling, pgvector schema, and LLM context extraction pipeline.',
    status: 'IN_PROGRESS',
    startTime: new Date().toISOString(),
    durationMinutes: 45,
    hostId: 'Admin User',
    isLocked: false,
  },
  {
    id: 'm2',
    code: 'CTX-2B91A44X',
    title: 'Sprint 4 Planning & Task Assignment',
    description: 'Weekly team sprint sync to track Kanban tasks and commitment deadlines.',
    status: 'SCHEDULED',
    startTime: new Date(Date.now() + 3600000 * 24).toISOString(),
    durationMinutes: 30,
    hostId: 'Abhed Tyagi',
    isLocked: false,
  },
  {
    id: 'm3',
    code: 'CTX-9L55M18Z',
    title: 'PostgreSQL pgvector Optimization',
    description: 'Benchmarking HNSW vs IVFFlat indexing for organizational context graph vector embeddings.',
    status: 'COMPLETED',
    startTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    durationMinutes: 60,
    hostId: 'Vinit Rai',
    isLocked: false,
  }
];

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: meetings = MOCK_MEETINGS, isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/meetings');
        return response.data && response.data.length > 0 ? response.data : MOCK_MEETINGS;
      } catch (err) {
        return MOCK_MEETINGS;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-DEFAULT"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-DEFAULT" />
            Meeting Calendar
          </h1>
          <p className="text-sm text-text-secondary mt-1">View and join your upcoming meetings.</p>
        </div>
        <Button variant="glow" onClick={() => navigate('/meetings/new')} icon={<Plus className="w-4 h-4" />}>
          New Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings?.length === 0 ? (
          <div className="col-span-full p-8 text-center text-text-muted border border-dashed border-border rounded-xl bg-surface/30">
            No meetings scheduled yet. Schedule one to get started!
          </div>
        ) : (
          meetings?.map((meeting: any) => (
            <GlassCard key={meeting.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-brand-DEFAULT/50 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <Badge variant={meeting.status === 'SCHEDULED' ? 'cyan' : meeting.status === 'IN_PROGRESS' ? 'success' : 'purple'} size="sm">
                    {meeting.status}
                  </Badge>
                  {meeting.isLocked && <Badge variant="error" size="sm">Locked</Badge>}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary line-clamp-1">{meeting.title}</h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mt-1">{meeting.description || 'No description provided.'}</p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(meeting.startTime).toLocaleString()} ({meeting.durationMinutes} min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Users className="w-3.5 h-3.5" />
                    <span>Host: {meeting.hostId}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex gap-2">
                <Button 
                  variant="glow" 
                  size="sm" 
                  className="flex-1"
                  icon={<Video className="w-4 h-4" />}
                  onClick={() => navigate(`/meet/${meeting.code || 'CTX-7F82K91P'}`)}
                  disabled={meeting.status === 'COMPLETED' || meeting.status === 'CANCELLED'}
                >
                  Join Room
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/meetings/${meeting.id || 'm1'}`)}
                >
                  Details
                </Button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
