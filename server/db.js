import { createClient } from '@libsql/client';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

console.log('Connected to Turso database');

// Helper function to execute SQL statements sequentially
async function executeStatements(statements) {
  for (const sql of statements) {
    await db.execute(sql);
  }
}

// Initialize database
try {
  const initializationStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'user'
    )`,
    
    `CREATE TABLE IF NOT EXISTS lead_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`,
    
    `CREATE TABLE IF NOT EXISTS leads (
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
    )`,
    
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
    `CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`,
    `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`,
    
    `INSERT OR IGNORE INTO lead_types (name) VALUES ('Dentist')`,
    `INSERT OR IGNORE INTO lead_types (name) VALUES ('Roofer')`
  ];

  await executeStatements(initializationStatements);

  // Create admin user if it doesn't exist
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  await db.execute({
    sql: `
      INSERT OR IGNORE INTO users (username, password_hash, role)
      VALUES ('admin', ?, 'admin')
    `,
    args: [adminPasswordHash]
  });
  
  console.log('Database initialization complete');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}

export default db;