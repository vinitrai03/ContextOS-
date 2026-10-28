CREATE TABLE email_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255) NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    participant_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES email_threads(id) ON DELETE SET NULL,
    message_id VARCHAR(255) UNIQUE,
    in_reply_to_id VARCHAR(255),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT,
    body_text TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'MANUAL', -- MANUAL|INVITATION|UPDATE|CANCELLATION|REMINDER|FOLLOW_UP|SUMMARY
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT|PENDING_APPROVAL|QUEUED|SENT|DELIVERED|FAILED|BOUNCED
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email_address VARCHAR(255) NOT NULL,
    kind VARCHAR(50) NOT NULL DEFAULT 'TO', -- TO|CC|BCC
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING|SENT|DELIVERED|FAILED|BOUNCED
    failure_reason TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mailbox_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    folder VARCHAR(50) NOT NULL DEFAULT 'INBOX', -- INBOX|SENT|DRAFTS|TRASH
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_starred BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT '#4F46E5',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_label_assignments (
    mailbox_item_id UUID NOT NULL REFERENCES mailbox_items(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES email_labels(id) ON DELETE CASCADE,
    PRIMARY KEY (mailbox_item_id, label_id)
);

CREATE TABLE email_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- MEETING|TASK|DECISION|PROJECT|USER|DOCUMENT
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    send_mode VARCHAR(50) NOT NULL DEFAULT 'AUTO', -- AUTO|APPROVAL
    reminder_offsets_minutes INT[] DEFAULT '{1440, 15}',
    from_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at
CREATE TRIGGER update_email_threads_modtime
    BEFORE UPDATE ON email_threads
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_emails_modtime
    BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_mailbox_items_modtime
    BEFORE UPDATE ON mailbox_items
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_email_settings_modtime
    BEFORE UPDATE ON email_settings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
