import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { validateEmail, validatePassword } from '../middleware/validation.js';

const router = express.Router();

// Register new user
router.post('/register', validateEmail, validatePassword, async (req, res) => {
  const { username, password, email } = req.body;
  
  try {
    // Check if username exists
    const { rows } = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });
    
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);
    
    // Insert new user
    await db.execute({
      sql: `
        INSERT INTO users (username, password_hash, email)
        VALUES (?, ?, ?)
      `,
      args: [username, passwordHash, email]
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get user from database
    const { rows } = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });
    
    const user = rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await db.execute({
      sql: `
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (?, ?, ?)
      `,
      args: [sessionId, user.id, expiresAt.toISOString()]
    });

    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.json({ message: 'Logged out successfully' });
  }

  try {
    await db.execute({
      sql: 'DELETE FROM sessions WHERE id = ?',
      args: [sessionId.toString()]
    });
    
    // Clear session cookie with same options as when it was set
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate session
router.get('/validate', async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (!sessionId) {
      return res.json({ isAuthenticated: false });
    }

    const { rows } = await db.execute({
      sql: `
        SELECT s.*, u.*
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
      `,
      args: [sessionId]
    });

    if (rows.length === 0) {
      return res.json({ isAuthenticated: false });
    }

    res.json({
      isAuthenticated: true,
      user: {
        id: rows[0].user_id,
        username: rows[0].username,
        email: rows[0].email,
        role: rows[0].role
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.json({ isAuthenticated: false });
  }
});

export default router;