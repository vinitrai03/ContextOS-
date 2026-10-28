-- meeting_analyses
CREATE TABLE meeting_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    session_id UUID REFERENCES meeting_sessions(id) ON DELETE SET NULL,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL, -- QUEUED|RUNNING|COMPLETED|FAILED
    model_name VARCHAR(100),
    prompt_version VARCHAR(50),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    transcript_hash VARCHAR(255),
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    trigger_type VARCHAR(50) -- AUTO|MANUAL
);

-- meeting_summaries
CREATE TABLE meeting_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES meeting_analyses(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    overview TEXT,
    key_points JSONB,
    unresolved_questions JSONB,
    deadlines JSONB,
    is_current BOOLEAN DEFAULT true,
    edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    edited_at TIMESTAMP WITH TIME ZONE
);

-- decisions
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES meeting_analyses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reason TEXT,
    decided_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL, -- PROPOSED|CONFIRMED|REVERSED|SUPERSEDED
    superseded_by_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
    confidence NUMERIC,
    source_segment_ids UUID[],
    evidence_quote TEXT,
    created_by_ai BOOLEAN DEFAULT true,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- decision_participants
CREATE TABLE decision_participants (
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- PROPOSER|SUPPORTER|OBJECTOR|DECIDER
    PRIMARY KEY (decision_id, user_id)
);

-- commitments
CREATE TABLE commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES meeting_analyses(id) ON DELETE CASCADE,
    person_id UUID REFERENCES users(id) ON DELETE SET NULL,
    person_name_raw VARCHAR(255),
    description TEXT NOT NULL,
    deadline_date TIMESTAMP WITH TIME ZONE,
    deadline_raw TEXT,
    status VARCHAR(50) NOT NULL, -- PENDING|IN_PROGRESS|FULFILLED|OVERDUE|CANCELLED
    confidence NUMERIC,
    source_segment_ids UUID[],
    evidence_quote TEXT,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    created_by_ai BOOLEAN DEFAULT true,
    confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    analysis_id UUID REFERENCES meeting_analyses(id) ON DELETE SET NULL,
    project_id UUID, -- placeholder for later
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_name_raw VARCHAR(255),
    priority VARCHAR(50) NOT NULL, -- LOW|MEDIUM|HIGH|URGENT
    status VARCHAR(50) NOT NULL, -- TODO|IN_PROGRESS|IN_REVIEW|DONE
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    deadline_date TIMESTAMP WITH TIME ZONE,
    deadline_raw TEXT,
    position DOUBLE PRECISION DEFAULT 0, -- for Kanban ordering
    source_segment_ids UUID[],
    evidence_quote TEXT,
    confidence NUMERIC,
    created_by_ai BOOLEAN DEFAULT true,
    confirmed BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    linked_commitment_id UUID REFERENCES commitments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- task_comments
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- task_activity
CREATE TABLE task_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    from_value TEXT,
    to_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- extraction_feedback
CREATE TABLE extraction_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- DECISION|COMMITMENT|TASK
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verdict VARCHAR(50) NOT NULL, -- ACCEPTED|EDITED|REJECTED
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline_date);
CREATE INDEX idx_tasks_meeting ON tasks(meeting_id);
CREATE INDEX idx_commitments_person ON commitments(person_id);
CREATE INDEX idx_commitments_status ON commitments(status);
CREATE INDEX idx_decisions_meeting ON decisions(meeting_id);

-- GIN indexes for full text search (simple)
ALTER TABLE tasks ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B')) STORED;
CREATE INDEX idx_tasks_search ON tasks USING GIN(search_vector);

ALTER TABLE decisions ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B') || setweight(to_tsvector('english', coalesce(reason, '')), 'C')) STORED;
CREATE INDEX idx_decisions_search ON decisions USING GIN(search_vector);

-- Add email_links table updates for phase 5 context linking (Tasks/Decisions)
-- If email_links already exists from Phase 3, we just ensure we can link tasks/decisions. 
-- In Phase 3 we had: entity_type (MEETING|USER|THREAD), entity_id
-- No schema changes needed for email_links if it uses generic entity_id and entity_type.

-- Insert Seed Data for the Demo
-- Note: Assuming the users and meetings from DataSeeder exist.
-- To ensure they match we will rely on DataSeeder.java to inject Phase 5 data since UUIDs are dynamic.
