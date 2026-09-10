# Codex Automation Admin

## Storage

Codex stores automations in two places:

- **Primary (sqlite):** `~/.codex/sqlite/codex-dev.db` table `automations`
- **Mirror (TOML):** `~/.codex/automations/<slug>/automation.toml`

The sqlite DB is authoritative. TOML files are read by the scheduler but the DB is what the UI and CLI query.

## Schema

```sql
CREATE TABLE automations (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL,  -- 'ACTIVE' | 'PAUSED'
  cwds          TEXT,           -- JSON array of working directories
  rrule         TEXT,           -- iCal RRULE string (e.g. "FREQ=DAILY;INTERVAL=1")
  model         TEXT,           -- model slug (e.g. "o3")
  reasoning_effort TEXT,        -- 'low' | 'medium' | 'high'
  prompt        TEXT,           -- the automation prompt
  next_run_at   TEXT,           -- ISO 8601 timestamp
  created_at    TEXT            -- ISO 8601 timestamp
);
```

## Common Operations

### List all automations
```bash
sqlite3 ~/.codex/sqlite/codex-dev.db "SELECT id, name, status, rrule, next_run_at FROM automations;"
```

### Pause all automations
```bash
sqlite3 ~/.codex/sqlite/codex-dev.db "UPDATE automations SET status = 'PAUSED';"
```

### Pause one automation
```bash
sqlite3 ~/.codex/sqlite/codex-dev.db "UPDATE automations SET status = 'PAUSED' WHERE name = '<name>';"
```

### Activate one automation
```bash
sqlite3 ~/.codex/sqlite/codex-dev.db "UPDATE automations SET status = 'ACTIVE' WHERE name = '<name>';"
```

### Create a new automation
```bash
sqlite3 ~/.codex/sqlite/codex-dev.db "INSERT INTO automations (id, name, status, cwds, rrule, model, reasoning_effort, prompt, next_run_at, created_at) VALUES (
  lower(hex(randomblob(16))),
  '<name>',
  'ACTIVE',
  '[\"<working-directory>\"]',
  'FREQ=DAILY;INTERVAL=1',
  'o3',
  'medium',
  '<prompt text>',
  datetime('now'),
  datetime('now')
);"
```

### Delete an automation
```bash
sqlite3 ~/.codex/sqlite/codex-dev.db "DELETE FROM automations WHERE name = '<name>';"
```

## Known Issues

- `$CODEX_HOME` does not resolve in sandboxed shell environments. Always use `~/.codex` explicitly.
- The TOML mirror at `~/.codex/automations/` may be stale. Trust the sqlite DB.
- Valid status values are exactly `ACTIVE` and `PAUSED` (case-sensitive).
