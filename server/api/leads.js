import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all leads
router.get('/', authenticateToken, (req, res) => {
  try {
    const leads = db.prepare(`
      SELECT
        leads.*,
        lead_types.name as type_name
      FROM leads
      JOIN lead_types ON leads.type_id = lead_types.id
      ORDER BY leads.created_at DESC
    `).all();
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Create new lead
router.post('/', authenticateToken, (req, res) => {
  const { name, email, phone, status, notes, type_id, message } = req.body;
  
  if (!name || !email || !phone || !type_id) {
    return res.status(400).json({
      error: 'Name, email, phone and type are required'
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO leads (
        name, email, phone, status, notes,
        type_id, message,
        lead_gen_status, time_received
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, email, phone, status || 'New', notes,
      type_id, message,
      'Pending', new Date().toISOString()
    );

    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status, notes, type_id, message } = req.body;

  if (!name || !email || !phone || !type_id) {
    return res.status(400).json({
      error: 'Name, email, phone and type are required'
    });
  }

  try {
    db.prepare(`
      UPDATE leads
      SET
        name = ?,
        email = ?,
        phone = ?,
        status = ?,
        notes = ?,
        type_id = ?,
        message = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, phone, status, notes, type_id, message, id);

    const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;