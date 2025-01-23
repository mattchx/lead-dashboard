import db from './db.js';
import bcrypt from 'bcryptjs';

async function setupAdmin() {
  try {
    // Create admin user if it doesn't exist
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    
    await db.execute({
      sql: `
        INSERT OR IGNORE INTO users (username, password_hash, role)
        VALUES ('admin', ?, 'admin')
      `,
      args: [adminPasswordHash]
    });

    console.log('Admin user setup complete');
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

setupAdmin();