export const schema = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  filters_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  checkpoint_page INTEGER NOT NULL DEFAULT 1,
  lead_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  hash TEXT NOT NULL,
  source_url TEXT NOT NULL,
  page INTEGER NOT NULL,
  extracted_at TEXT NOT NULL,
  fields_json TEXT NOT NULL,
  visible_text TEXT NOT NULL,
  UNIQUE(session_id, hash),
  FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  context_json TEXT,
  FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_leads_session ON leads(session_id);
CREATE INDEX IF NOT EXISTS idx_logs_session ON logs(session_id);
`;
