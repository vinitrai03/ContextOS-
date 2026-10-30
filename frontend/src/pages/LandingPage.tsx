import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, Mail, CheckSquare, GitFork, Cpu, ShieldCheck, 
  ArrowRight, Play, CheckCircle2, Zap, Database, Lock, 
  Sparkles, Terminal, FileText, Bot
} from 'lucide-react';

function Mark({ stroke = 6, className = "w-6 h-6" }: { stroke?: number; className?: string }) {
  return (
    <svg viewBox='0 0 120 120' fill='none' stroke='currentColor' strokeWidth={stroke} className={className} aria-hidden='true'>
      <path d='M60 60V18M60 60l36-21M60 60l36 21M60 60v42M60 60 24 81M60 60 24 39' />
      {[
        [60, 18],
        [96, 39],
        [96, 81],
        [60, 102],
        [24, 81],
        [24, 39],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r='8' fill='currentColor' />
      ))}
    </svg>
  );
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      num: '01',
      title: 'WebRTC Conferencing & STT',
      subtitle: 'Real-Time Voice Streaming',
      desc: 'High-definition WebRTC video meetings with automatic speech recognition, attributed to individual speakers.',
      code: `// WebRTC Audio Stream Captured\n[10:14:02] Rahul: "Let us use PostgreSQL with pgvector for relational integrity and fast vector embeddings."`,
      tag: 'WEBRTC + SPEECH STT',
    },
    {
      num: '02',
      title: 'Autonomous AI Extraction',
      subtitle: 'Decisions, Tasks & Commitments',
      desc: 'LLM agents continuously parse meeting transcripts into structured JSON schemas with zero manual note-taking.',
      code: `{\n  "decision": "Use PostgreSQL + pgvector",\n  "rationale": "ACID compliance & vector search",\n  "action_items": [\n    { "assignee": "Priya", "task": "Design schema", "due": "Monday" }\n  ]\n}`,
      tag: 'LLM AGENT JSON',
    },
    {
      num: '03',
      title: 'Agentic Follow-Up Emails',
      subtitle: 'Approval Queue & Distribution',
      desc: 'Executive summaries and assigned action items are automatically composed into ready-to-approve email drafts.',
      code: `TO: team@contextos.local\nSUBJECT: Architecture Decision: PostgreSQL Adopted\nSUMMARY: PostgreSQL selected. Priya assigned to deliver schema by Monday.\nSTATUS: PENDING_APPROVAL`,
      tag: 'HUMAN-IN-THE-LOOP',
    },
    {
      num: '04',
      title: 'Vector Context Graph',
      subtitle: 'pgvector RAG Organizational Memory',
      desc: 'All historical meetings, transcripts, decisions, and emails are indexed for sub-150ms natural language search.',
      code: `QUERY: "Why did we choose PostgreSQL over MongoDB?"\nANSWER: "Decided on Sept 20 by Rahul & Priya for transaction safety and ACID guarantees."`,
      tag: 'PGVECTOR RAG',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-foreground selection:text-background font-sans antialiased overflow-x-hidden">
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center text-text-primary shadow-minimal">
            <Mark stroke={8} className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight">ContextOS.</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-text-secondary">
          <span className="hover:text-text-primary cursor-pointer transition-colors" onClick={() => navigate('/meet/mock%20code/room')}>Conferencing</span>
          <span className="hover:text-text-primary cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Decision Log</span>
          <span className="hover:text-text-primary cursor-pointer transition-colors" onClick={() => navigate('/email')}>Email Hub</span>
          <span className="hover:text-text-primary cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Memory Graph</span>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-1.5 rounded-full border border-border text-xs font-semibold uppercase tracking-wider hover:border-foreground/40 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Open Workspace &rarr;
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 max-w-6xl mx-auto">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-[11px] font-mono tracking-widest uppercase text-text-secondary bg-surface">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            Autonomous Context Platform • Capstone 2026
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[0.96]">
            Every meeting.
            <br />
            <em className="font-normal italic text-text-secondary">Remembered.</em>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed pt-2">
            ContextOS unifies WebRTC video rooms, speech transcription, automated decision extraction, email follow-ups, and vector knowledge memory into a single organizational operating system.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-full bg-foreground text-background font-semibold text-xs tracking-wider uppercase flex items-center gap-3 hover:opacity-90 transition-opacity shadow-minimal"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/meet/mock%20code/room')}
              className="px-6 py-3 rounded-full border border-border text-text-primary hover:border-foreground/40 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-colors"
            >
              <Video className="w-4 h-4 text-text-secondary" />
              <span>Launch Video Room</span>
            </button>
          </div>
        </div>

        {/* Stats Row Matching Auth Page */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-16 mt-16 border-t border-border">
          <div>
            <b className="block text-3xl sm:text-4xl font-bold tracking-tight">8+</b>
            <span className="text-xs font-mono tracking-widest uppercase text-text-muted">Conferencing Integrations</span>
          </div>
          <div>
            <b className="block text-3xl sm:text-4xl font-bold tracking-tight">100%</b>
            <span className="text-xs font-mono tracking-widest uppercase text-text-muted">Searchable Decisions</span>
          </div>
          <div>
            <b className="block text-3xl sm:text-4xl font-bold tracking-tight">0</b>
            <span className="text-xs font-mono tracking-widest uppercase text-text-muted">Manual Notes to Take</span>
          </div>
          <div>
            <b className="block text-3xl sm:text-4xl font-bold tracking-tight">&lt;150ms</b>
            <span className="text-xs font-mono tracking-widest uppercase text-text-muted">pgvector Query Latency</span>
          </div>
        </div>

        {/* Live Architecture Wireframe Panel */}
        <div className="mt-16 bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between text-xs font-mono text-text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-border bg-surface-hover" />
              <span className="w-2.5 h-2.5 rounded-full border border-border bg-surface-hover" />
              <span className="w-2.5 h-2.5 rounded-full border border-border bg-surface-hover" />
              <span className="ml-2">contextos://pipeline/live-stream</span>
            </div>
            <span className="text-status-success font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping" />
              READY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Tile 1 */}
            <div className="p-6 space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-text-muted">01 / CAPTURE</div>
              <h3 className="font-semibold text-sm text-text-primary">Speech to Text Stream</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-mono bg-surface-hover/60 p-3 rounded-lg border border-border">
                "We need PostgreSQL with pgvector for relational integrity and vector retrieval."
              </p>
            </div>

            {/* Tile 2 */}
            <div className="p-6 space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-text-muted">02 / STRUCTURE</div>
              <h3 className="font-semibold text-sm text-text-primary">Autonomous Decision Extraction</h3>
              <div className="text-xs text-text-secondary font-mono bg-surface-hover/60 p-3 rounded-lg border border-border space-y-1">
                <div><span className="text-text-muted">DECISION:</span> PostgreSQL Adopted</div>
                <div><span className="text-text-muted">TASK:</span> Priya - Schema DDL</div>
                <div><span className="text-text-muted">STATUS:</span> Recorded in DB</div>
              </div>
            </div>

            {/* Tile 3 */}
            <div className="p-6 space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-text-muted">03 / MEMORY</div>
              <h3 className="font-semibold text-sm text-text-primary">Semantic Vector Retrieval</h3>
              <div className="text-xs text-text-secondary font-mono bg-surface-hover/60 p-3 rounded-lg border border-border space-y-1">
                <div><span className="text-text-muted">Q:</span> Why PostgreSQL?</div>
                <div><span className="text-text-muted">A:</span> Rahul & Priya decided for ACID transaction safety on Sept 20.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Step-Through */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-border">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-text-muted mb-2">END-TO-END SYSTEM</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">The 4-stage pipeline.</h2>
        </div>

        {/* Step Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {workflowSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeStep === idx
                  ? 'border-foreground bg-surface-hover shadow-minimal'
                  : 'border-border bg-surface hover:border-foreground/30'
              }`}
            >
              <div className="text-xs font-mono text-text-muted mb-1">{step.num}</div>
              <div className="font-semibold text-sm text-text-primary">{step.title}</div>
            </button>
          ))}
        </div>

        {/* Active Step Showcase */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-2.5 py-0.5 rounded-full border border-border text-[10px] font-mono uppercase tracking-widest text-text-secondary">
              {workflowSteps[activeStep].tag}
            </span>
            <h3 className="text-2xl font-bold tracking-tight">{workflowSteps[activeStep].title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{workflowSteps[activeStep].desc}</p>
            <div className="pt-2">
              <button
                onClick={() => navigate(activeStep === 0 ? '/meet/mock%20code/room' : activeStep === 2 ? '/email' : '/dashboard')}
                className="px-4 py-2 rounded-full border border-border hover:border-foreground/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <span>Launch {workflowSteps[activeStep].title.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-surface-hover border border-border rounded-xl p-4 font-mono text-xs text-text-secondary overflow-x-auto leading-relaxed">
            <pre className="whitespace-pre-wrap">{workflowSteps[activeStep].code}</pre>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-border py-12 px-6 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-text-muted">
        <div className="flex items-center gap-2">
          <Mark stroke={8} className="w-3.5 h-3.5 text-text-primary" />
          <span className="font-bold text-text-primary tracking-tight">ContextOS.</span>
          <span>&copy; 2026 B.Tech CS Capstone Project</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-1.5 text-status-success">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            All systems normal
          </span>
          <span className="cursor-pointer hover:text-text-primary transition-colors" onClick={() => navigate('/auth')}>Sign In</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors" onClick={() => navigate('/dashboard')}>Workspace</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
