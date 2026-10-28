import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Video, Calendar, Clock, AlignLeft, Users, Shield, ArrowRight, Sparkles, Send } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import apiClient from '../services/apiClient';

export const MeetingSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [previewEmail, setPreviewEmail] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    durationMinutes: 60,
    allowScreenShare: true,
    allowChat: true,
    isLocked: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // startTime needs to be ISO string for backend
      const formattedData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
      };
      
      const response = await apiClient.post('/meetings', formattedData);
      setMeetingId(response.data.id);
      
      // Fetch the generated email
      try {
        const aiResponse = await apiClient.post('/ai/emails/generate', {
          type: 'INVITATION',
          meetingId: response.data.id,
          tone: 'FORMAL'
        });
        setPreviewEmail(aiResponse.data);
      } catch (aiErr) {
        console.error('Failed to fetch AI preview', aiErr);
      }
      
      setShowPreview(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule meeting. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
          <Video className="w-6 h-6 text-brand-DEFAULT" />
          Schedule Meeting
        </h1>
        <p className="text-sm text-text-secondary mt-1">Create a new secure meeting space with integrated AI context.</p>
      </div>

      <GlassCard className="p-6 md:p-8">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2">
              Basic Details
            </h3>
            <Input
              label="Meeting Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Q3 Architecture Review"
              icon={<AlignLeft className="w-4 h-4 text-text-muted" />}
              required
            />
            
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief agenda or context..."
                className="w-full bg-surface-hover/50 border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-DEFAULT/50 focus:border-brand-DEFAULT transition-all resize-y min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2">
              Timing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                icon={<Calendar className="w-4 h-4 text-text-muted" />}
                required
              />
              <Input
                label="Duration (minutes)"
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                min={15}
                max={480}
                icon={<Clock className="w-4 h-4 text-text-muted" />}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2">
              Security & Permissions
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="isLocked"
                    checked={formData.isLocked}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-10 h-5 bg-surface-hover rounded-full border border-border peer-checked:bg-brand-DEFAULT peer-checked:border-brand-DEFAULT transition-all"></div>
                  <div className="absolute left-1 w-3 h-3 bg-text-secondary rounded-full peer-checked:translate-x-5 peer-checked:bg-white transition-all"></div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Require Host Approval
                  </div>
                  <div className="text-xs text-text-muted">Participants wait in lobby until admitted</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="allowScreenShare"
                    checked={formData.allowScreenShare}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-10 h-5 bg-surface-hover rounded-full border border-border peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all"></div>
                  <div className="absolute left-1 w-3 h-3 bg-text-secondary rounded-full peer-checked:translate-x-5 peer-checked:bg-white transition-all"></div>
                </div>
                <div className="text-sm font-semibold text-text-primary">Allow Screen Sharing</div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="allowChat"
                    checked={formData.allowChat}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-10 h-5 bg-surface-hover rounded-full border border-border peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all"></div>
                  <div className="absolute left-1 w-3 h-3 bg-text-secondary rounded-full peer-checked:translate-x-5 peer-checked:bg-white transition-all"></div>
                </div>
                <div className="text-sm font-semibold text-text-primary">Enable In-Meeting Chat</div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => navigate('/calendar')}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="glow" 
              disabled={loading}
              icon={loading ? undefined : <ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </GlassCard>

      {showPreview && meetingId && (
        <GlassCard className="p-6 md:p-8 mt-6 border-brand-cyan/50 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-cyan" />
              AI Invitation Generated
            </h2>
            <Badge variant="cyan">Preview</Badge>
          </div>
          
          <div className="bg-surface/50 border border-border rounded-xl p-4 mb-4">
            <p className="text-sm text-text-muted mb-2">Subject: <strong>{previewEmail?.subject || 'Invitation: ' + formData.title}</strong></p>
            <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: previewEmail?.bodyHtml || '<p>Generating...</p>' }} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/calendar')}>Save as Draft</Button>
            <Button variant="glow" icon={<Send className="w-4 h-4" />} onClick={() => navigate('/calendar')}>
              Approve & Send
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
