-- =========================================================================
-- ACCESSIBLE CONNECT - FLYWAY SCHEMA EVOLUTION (V8)
-- ADDS PARTICIPANT USER TO COMMUNICATION SESSIONS
-- =========================================================================

ALTER TABLE communication_sessions ADD COLUMN IF NOT EXISTS participant_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_comm_sessions_participant ON communication_sessions(participant_user_id);
