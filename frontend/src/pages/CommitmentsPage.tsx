import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Handshake, AlertCircle } from 'lucide-react';
import apiClient from '../services/apiClient';

const MOCK_COMMITMENTS = [
  {
    id: 'c1',
    person: 'Priya Sharma',
    description: 'Deliver the finalized ERD and System Architecture documentation before Monday 10:00 AM.',
    status: 'IN_PROGRESS',
    deadline: 'Next Monday, 10:00 AM',
    meeting: 'Q3 Architecture Review',
    confidence: 0.95,
  },
  {
    id: 'c2',
    person: 'Abhed Tyagi',
    description: 'Deploy docker-compose configuration with Postgres 16 and pgvector for integration testing.',
    status: 'FULFILLED',
    deadline: 'Friday, 6:00 PM',
    meeting: 'Sprint 3 Design Session',
    confidence: 0.91,
  },
  {
    id: 'c3',
    person: 'Rahul Verma',
    description: 'Review STOMP signaling broker security rules with the faculty evaluator.',
    status: 'PENDING',
    deadline: 'Wednesday, 2:00 PM',
    meeting: 'Faculty Review Preparation',
    confidence: 0.89,
  }
];

export const CommitmentsPage: React.FC = () => {
  const [commitments, setCommitments] = React.useState<any[]>(MOCK_COMMITMENTS);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchCommitments = async () => {
      try {
        const res = await apiClient.get('/commitments');
        if (res.data && res.data.length > 0) {
          setCommitments(res.data);
        }
      } catch (err) {
        // Fallback to demo commitments
      }
    };
    fetchCommitments();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
                <Handshake className="w-6 h-6 text-brand-DEFAULT" /> Commitments
            </h1>
            <p className="text-sm text-text-secondary mt-1">Track interpersonal promises and soft deadlines made during meetings.</p>
        </div>
      </div>

      <div className="space-y-4">
          {commitments.map(com => (
              <GlassCard key={com.id} className="p-4 flex items-center justify-between">
                  <div>
                      <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-text-primary">{com.person} <span className="font-normal text-text-secondary">committed to</span></h3>
                          <Badge variant={com.status === 'PENDING' ? 'warning' : 'info'}>{com.status}</Badge>
                      </div>
                      <p className="text-text-primary">"{com.description}"</p>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                          <span>Deadline: {com.deadline}</span>
                          <span>•</span>
                          <span>Meeting: {com.meeting}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-cyan-400">
                              <AlertCircle className="w-3 h-3" /> AI Confidence {(com.confidence * 100).toFixed(0)}%
                          </span>
                      </div>
                  </div>
              </GlassCard>
          ))}
      </div>
    </div>
  );
};
