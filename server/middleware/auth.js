import db from '../db.js';

export const authenticate = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Get session and user
    const { rows } = await db.execute({
      sql: `
        SELECT s.*, u.*
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
      `,
      args: [sessionId]
    });

    const session = rows[0];
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Refresh session expiration
    const newExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await db.execute({
      sql: `
        UPDATE sessions
        SET expires_at = ?
        WHERE id = ?
      `,
      args: [newExpiration.toISOString(), sessionId]
    });

    // Attach user to request
    req.user = {
      id: session.user_id,
      username: session.username,
      email: session.email,
      role: session.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
  };
};