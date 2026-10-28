import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Network, AlertCircle, Search } from 'lucide-react';
import apiClient from '../services/apiClient';

const MOCK_DECISIONS = [
  {
    id: 'd1',
    title: 'Adopt PostgreSQL with pgvector for Unified Organizational Memory',
    reason: 'Eliminates separate vector store infrastructure while guaranteeing ACID compliance and unified SQL joins for context queries.',
    status: 'CONFIRMED',
    meeting: 'Q3 Architecture Review',
    date: 'Oct 24, 2026',
    confidence: 0.96,
  },
  {
    id: 'd2',
    title: 'P2P Mesh WebRTC Signaling via Spring STOMP WebSockets',
    reason: 'Keeps audio/video streams low-latency and private while meeting session metadata is persisted in Redis.',
    status: 'CONFIRMED',
    meeting: 'Real-time Infrastructure Sync',
    date: 'Oct 22, 2026',
    confidence: 0.92,
  },
  {
    id: 'd3',
    title: 'Client-Side Web Speech STT with Server-Side LLM Normalization',
    reason: 'Bypasses expensive third-party audio streaming APIs, keeping capstone project running zero-cost in offline demo mode.',
    status: 'PROPOSED',
    meeting: 'Sprint 3 Design Session',
    date: 'Oct 19, 2026',
    confidence: 0.88,
  }
];

export const DecisionsPage: React.FC = () => {
  const [decisions, setDecisions] = React.useState<any[]>(MOCK_DECISIONS);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const res = await apiClient.get('/decisions');
        if (res.data && res.data.length > 0) {
          setDecisions(res.data);
        }
      } catch (err) {
        // Fallback to demo decisions
      }
    };
    fetchDecisions();
  }, []);

  const filteredDecisions = decisions.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.meeting?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
                <Network className="w-6 h-6 text-brand-DEFAULT" /> Decision Log
            </h1>
            <p className="text-sm text-text-secondary mt-1">Track architectural choices and key organizational decisions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
              {filteredDecisions.length === 0 ? (
                <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-xl">
                  No decisions found matching "{searchQuery}"
                </div>
              ) : (
                filteredDecisions.map(dec => (
                  <GlassCard key={dec.id} className="p-6 transition-all hover:border-brand-DEFAULT/50 cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="text-lg font-bold text-text-primary">{dec.title}</h3>
                              <p className="text-sm text-text-secondary mt-1 max-w-lg">{dec.reason}</p>
                          </div>
                          <Badge variant={dec.status === 'CONFIRMED' ? 'success' : 'warning'}>{dec.status}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-text-muted pt-4 border-t border-border">
                          <span>Meeting: <span className="text-text-primary">{dec.meeting}</span></span>
                          <span>•</span>
                          <span>{dec.date}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-cyan-400">
                              <AlertCircle className="w-3 h-3" /> AI Confidence {(dec.confidence * 100).toFixed(0)}%
                          </span>
                      </div>
                  </GlassCard>
                ))
              )}
          </div>

          <div className="space-y-4">
              <GlassCard className="p-4">
                  <h3 className="font-bold text-text-primary mb-2">Search Memory</h3>
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                      <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search reasons, meetings..." 
                          className="w-full pl-9 pr-4 py-2 bg-surface-hover/50 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-DEFAULT text-text-primary placeholder:text-text-muted"
                      />
                  </div>
              </GlassCard>
          </div>
      </div>
    </div>
  );
};
