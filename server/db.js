import Database from 'better-sqlite3';
import 'dotenv/config';

const db = new Database(process.env.DATABASE_PATH);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );
  
  CREATE TABLE IF NOT EXISTS lead_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    notes TEXT,
    type_id INTEGER NOT NULL REFERENCES lead_types(id),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    lead_gen_status TEXT DEFAULT 'Pending',
    message TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Add source column if it doesn't exist
  INSERT OR IGNORE INTO lead_types (name) VALUES
    ('Dentist'),
    ('Roofer');
  
  -- Add source column to existing leads table if it doesn't exist
  PRAGMA foreign_keys=off;
  BEGIN TRANSACTION;
  CREATE TABLE IF NOT EXISTS new_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    notes TEXT,
    type_id INTEGER NOT NULL REFERENCES lead_types(id),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    lead_gen_status TEXT DEFAULT 'Pending',
    message TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Copy data from old table to new table
  INSERT INTO new_leads SELECT
    id, name, email, phone, status, notes,
    type_id, contact_name, contact_email,
    lead_gen_status, message, NULL as source,
    created_at, updated_at
  FROM leads;
  
  -- Drop old table and rename new table
  DROP TABLE leads;
  ALTER TABLE new_leads RENAME TO leads;
  COMMIT;
  PRAGMA foreign_keys=on;
`);

export default db;