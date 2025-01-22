import crypto from 'crypto';
import db from '../db.js';
import { sendEmail } from './email.js';
import { BASE_URL } from '../config.js';

const MAGIC_LINK_EXPIRATION = 15 * 60 * 1000; // 15 minutes

export async function sendMagicLink(email) {
  // Generate a secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRATION);

  // Store token in database
  db.prepare(`
    INSERT INTO magic_links (email, token, expires_at)
    VALUES (?, ?, ?)
  `).run(email, token, expiresAt.toISOString());

  // Send email with magic link
  const loginUrl = `${BASE_URL}/auth/magic-link?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Your Login Link',
    text: `Click here to login: ${loginUrl}`,
    html: `<p>Click <a href="${loginUrl}">here</a> to login</p>`
  });

  return { success: true };
}

export async function verifyMagicLink(token) {
  // Find and validate token
  const magicLink = db.prepare(`
    SELECT * FROM magic_links
    WHERE token = ? AND expires_at > datetime('now')
  `).get(token);

  if (!magicLink) {
    return { error: 'Invalid or expired token' };
  }

  // Get or create user
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(magicLink.email);
  if (!user) {
    // Generate username from email
    const username = magicLink.email.split('@')[0];
    
    db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, '')
    `).run(username, magicLink.email);
    
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(magicLink.email);
  }

  // Clean up used token
  db.prepare('DELETE FROM magic_links WHERE token = ?').run(token);

  return { user };
}