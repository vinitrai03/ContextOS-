import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, Video, Mail, CheckSquare, GitFork, Cpu, ShieldCheck, 
  ArrowRight, Play, CheckCircle2, Zap, Database, Lock 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      title: '1. Conduct Meeting',
      subtitle: 'WebRTC Conferencing & Speech STT',
      desc: 'Real-time video meeting with automated speaker-attributed transcription. "Rahul: We should use PostgreSQL for transaction safety."',
      icon: <Video className="w-6 h-6 text-brand-DEFAULT" />,
      color: 'from-brand-DEFAULT to-indigo-600',
    },
    {
      title: '2. AI Extraction',
      subtitle: 'Decisions, Tasks & Commitments',
      desc: 'LLM analyzes transcript to extract structured JSON data. Decision: Use PostgreSQL. Task: Priya prepares documentation by Monday.',
      icon: <GitFork className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-500 to-violet-600',
    },
    {
      title: '3. AI Follow-Up Email',
      subtitle: 'Automated Invitation & Summary',
      desc: 'AI generates professional follow-up email sent to all participants with linked meeting context, tasks, and deadlines.',
      icon: <Mail className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      title: '4. Context Memory Graph',
      subtitle: 'RAG Knowledge Assistant',
      desc: 'Every meeting, task, decision, and email is stored in a pgvector knowledge graph for instant natural-language Q&A.',
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden selection:bg-brand-DEFAULT selection:text-white">
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-DEFAULT via-brand-accent to-brand-cyan flex items-center justify-center text-white font-extrabold shadow-glow-indigo text-xl">
            C
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gradient">ContextOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
          <Button variant="glow" onClick={() => navigate('/dashboard')} icon={<Sparkles className="w-4 h-4" />}>
            Explore Demo
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Animated ambient backdrop glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-DEFAULT/30 via-brand-accent/20 to-brand-cyan/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <Badge variant="cyan" size="md" icon={<Sparkles className="w-4 h-4 animate-spin" />}>
            B.Tech CS Capstone Project • Powered by AI & pgvector
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15]">
            The AI-Powered Unified Meeting, Email &{' '}
            <span className="text-gradient">Organizational Context Layer</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary font-normal max-w-2xl mx-auto leading-relaxed">
            Stop asking <em>"Where is that file?"</em> ContextOS automatically turns video meetings, emails, decisions, tasks, and commitments into a single searchable knowledge graph.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="glow"
              onClick={() => navigate('/dashboard')}
              icon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Launch Platform Demo
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/auth')}
              icon={<Play className="w-4 h-4 text-brand-cyan" />}
              className="w-full sm:w-auto"
            >
              Sign Up as Admin
            </Button>
          </div>
        </motion.div>

        {/* Hero Interactive Product Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 glass-panel rounded-3xl p-4 sm:p-6 border border-border shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-text-muted ml-2">https://contextos.app/dashboard</span>
            </div>
            <Badge variant="purple" size="sm">Live Capstone Architecture Preview</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
            <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-3">
              <div className="flex items-center gap-2 text-brand-DEFAULT font-bold text-sm">
                <Video className="w-4 h-4" /> Meeting Transcripts
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                "Rahul: Let's choose PostgreSQL over MongoDB due to relational consistency requirements for our capstone data layer."
              </p>
              <Badge variant="cyan" size="sm">Speech STT Captured</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <GitFork className="w-4 h-4" /> AI Extracted Decision
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                <strong>Decision:</strong> Use PostgreSQL DB<br />
                <strong>Reason:</strong> Relational transaction safety<br />
                <strong>Assigned Task:</strong> Priya creates schema
              </p>
              <Badge variant="purple" size="sm">JSON Schema Validated</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Cpu className="w-4 h-4" /> Context Graph & RAG
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                <em>Prompt:</em> "Why did we choose PostgreSQL?"<br />
                <em>AI Answer:</em> "Chosen in Architecture Meeting on Sept 20 by Rahul & Priya for transaction safety."
              </p>
              <Badge variant="success" size="sm">Vector Search Verified</Badge>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Interactive Workflow Flow Step-Through */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-3xl font-extrabold text-gradient">The ContextOS End-to-End Workflow</h2>
          <p className="text-text-secondary">
            From scheduling and WebRTC video calls to AI extraction, email follow-ups, and natural-language organizational memory search.
          </p>
        </div>

        {/* Step Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {workflowSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeStep === idx
                  ? 'bg-brand-DEFAULT/15 border-brand-DEFAULT text-text-primary shadow-glow-indigo'
                  : 'bg-surface/50 border-border text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {step.icon}
                <span className="text-xs font-mono font-bold text-text-muted">STEP 0{idx + 1}</span>
              </div>
              <h3 className="font-bold text-sm truncate">{step.title}</h3>
            </button>
          ))}
        </div>

        {/* Active Step Showcase */}
        <GlassCard className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="cyan" size="md">
                Phase {activeStep + 1} Pipeline
              </Badge>
              <h3 className="text-2xl font-bold text-text-primary">{workflowSteps[activeStep].title}</h3>
              <p className="text-lg font-semibold text-brand-DEFAULT">{workflowSteps[activeStep].subtitle}</p>
              <p className="text-text-secondary leading-relaxed">{workflowSteps[activeStep].desc}</p>
              <div className="pt-2 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium">Automatic context linking across emails & tasks</span>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-surface/80 border border-border font-mono text-xs text-text-secondary space-y-3">
              <div className="flex items-center justify-between text-text-muted border-b border-border pb-2">
                <span>context_os_pipeline.json</span>
                <span className="text-emerald-400">STATUS_200_OK</span>
              </div>
              <pre className="text-brand-cyan overflow-x-auto">
{`{
  "step": ${activeStep + 1},
  "subsystem": "${workflowSteps[activeStep].title}",
  "status": "PROCESSED",
  "contextNodesCreated": 14,
  "pgvectorEmbedded": true
}`}
              </pre>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl font-extrabold text-text-primary">Built for Modern Engineering Organizations</h2>
          <p className="text-text-secondary">Comprehensive feature suite powering seamless remote collaboration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="md:col-span-2 space-y-4">
            <div className="p-3 rounded-xl bg-brand-DEFAULT/10 border border-brand-DEFAULT/20 w-fit text-brand-DEFAULT">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">WebRTC Video Conferencing & Live Transcription</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Browser-native peer-to-peer WebRTC video rooms with live Web Speech API transcription, mute controls, screen sharing, active speaker highlights, and in-meeting STOMP WebSocket chat.
            </p>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit text-purple-400">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">AI Decision & Task Extraction</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              LLM JSON parsing automatically resolves relative dates and populates Kanban boards and commitment registries.
            </p>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 w-fit text-cyan-400">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Context-Linked Email Hub</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              3-pane email client with clickable meeting & task context chips, delivery status tracking, and AI email writer.
            </p>
          </GlassCard>

          <GlassCard className="md:col-span-2 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Interactive Organizational Knowledge Graph & Vector RAG</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Visual React Flow knowledge graph connecting Meetings, People, Decisions, Tasks, and Emails. Natural language Q&A backed by pgvector dense embeddings with source citations.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-border bg-surface/30 py-12 px-6 text-center text-text-muted text-sm space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-brand-DEFAULT flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <span className="font-bold text-text-primary">ContextOS</span>
        </div>
        <p>B.Tech CS Capstone Project • Java 21 Spring Boot 3 & React TypeScript Architecture</p>
        <p className="text-xs text-text-muted">© 2026 ContextOS. All rights reserved.</p>
      </footer>
    </div>
  );
};
