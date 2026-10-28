import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Tabs } from '../components/ui/Tabs';
import { Mail, Clock, CheckCircle2, FileText, Video } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import apiClient from '../services/apiClient';

export const MeetingDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mocked state for now
  const status = 'LIVE'; 
  const meetingCode = 'mock-code';

  const emails = [
    { id: '1', type: 'INVITATION', subject: 'Invitation: Q3 Architecture Review', status: 'DELIVERED', time: '2 hours ago' },
  ];

  const transcripts = [
    { id: 't1', speaker: 'Rahul', text: 'Should we use PostgreSQL or MongoDB?', time: '00:01' },
    { id: 't2', speaker: 'Abhed', text: 'PostgreSQL has vector support now, which is perfect for AI.', time: '00:05' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Meeting Details</h1>
          <p className="text-sm text-text-secondary mt-1">ID: {id}</p>
        </div>
        <div className="flex items-center gap-4">
            {status === 'LIVE' ? (
                <Button onClick={() => navigate(`/meet/${meetingCode}`)} className="animate-pulse bg-red-500 hover:bg-red-600 border-none shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    <Video className="w-4 h-4 mr-2" />
                    Join Now
                </Button>
            ) : (
                <Badge variant="success">Scheduled</Badge>
            )}
        </div>
      </div>

      <Tabs 
        tabs={[
          { id: 'overview', label: 'Summary' },
          { id: 'decisions', label: 'Decisions' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'commitments', label: 'Commitments' },
          { id: 'transcript', label: 'Transcript' },
          { id: 'emails', label: 'Emails' },
        ]} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <GlassCard className="p-6 md:p-8 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-brand-DEFAULT/10 border border-brand-DEFAULT/30 rounded-xl p-5">
              <h3 className="font-bold text-brand-light mb-2">AI Summary</h3>
              <p className="text-text-secondary leading-relaxed">
                Project Architecture Meeting to decide on the core database technology and assign initial development tasks. The team evaluated PostgreSQL vs MongoDB and ultimately decided on PostgreSQL due to its relational transaction requirements and pgvector support.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold text-text-primary mb-3">Key Points</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                        <li>Discussed relational vs NoSQL databases</li>
                        <li>Evaluated PostgreSQL vector capabilities</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-text-primary mb-3">Deadlines</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                        <li>Friday: Auth API</li>
                        <li>Monday: Project docs</li>
                    </ul>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Live Transcript
              </h3>
              <Button variant="outline" size="sm">Export</Button>
            </div>
            
            <div className="space-y-4">
              {transcripts.map(t => (
                  <div key={t.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center font-bold text-text-primary flex-shrink-0">
                          {t.speaker.charAt(0)}
                      </div>
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-text-primary">{t.speaker}</span>
                              <span className="text-xs text-text-muted">{t.time}</span>
                          </div>
                          <p className="text-text-secondary">{t.text}</p>
                      </div>
                  </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center justify-center border-t border-border pt-6">
                <Button 
                    variant="primary" 
                    onClick={async () => {
                        try {
                            await apiClient.post(`/meetings/${id}/analyze`);
                            alert("Analysis queued successfully!");
                        } catch (err) {
                            console.error("Failed to start analysis", err);
                            alert("Failed to start analysis.");
                        }
                    }}
                >
                    Start AI Analysis
                </Button>
                <p className="text-xs text-text-muted mt-2">Extracts summary, decisions, tasks, and commitments</p>
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Communication History
              </h3>
            </div>
            
            <div className="relative border-l-2 border-surface-hover ml-3 space-y-8 pb-4">
              {emails.map(email => (
                <div key={email.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-DEFAULT border-4 border-background"></div>
                  <div className="bg-surface/50 border border-border rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="cyan" size="sm">{email.type}</Badge>
                        <span className="text-sm font-bold text-text-primary">{email.subject}</span>
                      </div>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {email.time}
                      </span>
                    </div>
                    <div className="text-sm text-text-muted flex items-center gap-2">
                      Status: <Badge variant="success" size="sm">{email.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary mb-4">Decisions Made</h3>
            <div className="bg-surface/50 border border-border rounded-xl p-4">
               <h4 className="font-bold text-text-primary">Use PostgreSQL instead of MongoDB</h4>
               <p className="text-sm text-text-secondary mt-1">Need robust relational features and pgvector for AI memory.</p>
               <div className="mt-3 flex gap-2">
                 <Badge variant="success" size="sm">CONFIRMED</Badge>
                 <Badge variant="default" size="sm">Abhed (Proposer)</Badge>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'commitments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary mb-4">Commitments</h3>
            <div className="bg-surface/50 border border-border rounded-xl p-4">
               <p className="text-text-primary font-medium">Rahul <span className="font-normal text-text-secondary">committed to</span> "Complete the authentication API"</p>
               <div className="mt-3 flex gap-2">
                 <Badge variant="warning" size="sm">PENDING</Badge>
                 <Badge variant="default" size="sm">by Friday</Badge>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="text-text-muted text-center py-20">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Go to the Tasks board to see all tracked tasks.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/tasks')}>Open Kanban Board</Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
