import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle, XCircle, Send, Clock, User, FileText } from 'lucide-react';
import apiClient from '../../services/apiClient';

export const ApprovalQueuePage: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    // Real implementation would fetch from /emails?status=PENDING_APPROVAL
    setTimeout(() => {
      setApprovals([
        {
          id: '1',
          type: 'INVITATION',
          subject: 'Invitation: ContextOS Sync',
          senderEmail: 'host@contextos.local',
          recipients: ['alice@contextos.local', 'bob@contextos.local'],
          createdAt: new Date().toISOString(),
          bodyHtml: '<p>You have been invited to ContextOS Sync...</p>',
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleApprove = (id: string) => {
    // Call API to approve and dispatch
    setApprovals(prev => prev.filter(a => a.id !== id));
  };

  const handleReject = (id: string) => {
    // Call API to reject (update status to DRAFT or delete)
    setApprovals(prev => prev.filter(a => a.id !== id));
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading Approval Queue...</div>;
  }

  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted py-20">
        <CheckCircle className="w-16 h-16 mb-4 text-emerald-500/50" />
        <h2 className="text-xl font-bold text-text-primary mb-2">You're all caught up!</h2>
        <p>No emails pending approval.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Approval Queue</h1>
        <p className="text-sm text-text-secondary mt-1">Review AI-generated emails before they are sent.</p>
      </div>

      <div className="space-y-4">
        {approvals.map(email => (
          <GlassCard key={email.id} className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="warning">{email.type}</Badge>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Generated {new Date(email.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">{email.subject}</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={<XCircle className="w-4 h-4 text-rose-400" />} onClick={() => handleReject(email.id)}>
                  Reject
                </Button>
                <Button variant="glow" size="sm" icon={<Send className="w-4 h-4" />} onClick={() => handleApprove(email.id)}>
                  Approve & Send
                </Button>
              </div>
            </div>

            <div className="bg-surface-hover/30 rounded-xl p-4 mb-4 border border-border/50 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2 mb-4">
                <div className="text-text-muted font-semibold">From:</div>
                <div className="text-text-primary">{email.senderEmail}</div>
                <div className="text-text-muted font-semibold">To:</div>
                <div className="text-text-primary">{email.recipients.join(', ')}</div>
              </div>
              <div className="border-t border-border/50 pt-4 prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
