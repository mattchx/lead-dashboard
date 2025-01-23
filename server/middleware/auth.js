import db from '../db.js';

export const authenticateSession = (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) return res.sendStatus(401);

  try {
    // Get session and user
    const session = db.prepare(`
      SELECT s.*, u.*
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
    `).get(sessionId);

    if (!session) {
      return res.sendStatus(401);
    }

    // Attach user to request
    req.user = {
      id: session.user_id,
      username: session.username,
      email: session.email
    };

    // Refresh session expiration
    db.prepare(`
      UPDATE sessions
      SET expires_at = datetime('now', '+30 minutes')
      WHERE id = ?
    `).run(sessionId);

    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.sendStatus(500);
  }
};