import fs from 'fs';
import path from 'path';
import db from '../db.js';

const migrationsDir = path.join(process.cwd(), 'server/db/migrations');

export async function runMigrations() {
  try {
    // Get all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Execute each migration
    for (const file of files) {
      const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Running migration: ${file}`);
      db.exec(migration);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}