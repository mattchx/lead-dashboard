import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for external submissions
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many submissions from this IP, please try again later'
});

// External lead submission endpoint
router.post('/external', submissionLimiter, (req, res) => {
  const { name, email, phone, type_id, contact_name, contact_email, source } = req.body;
  
  // Basic validation
  if (!name || !email || !phone || !type_id || !contact_name || !contact_email) {
    console.log('Invalid submission attempt:', { name, email, phone, type_id });
    return res.status(400).json({
      error: 'Name, email, phone, type, contact name and contact email are required'
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO leads (
        name, email, phone, status, notes,
        type_id, message, contact_name, contact_email,
        lead_gen_status, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, email, phone, 'New', '',
      type_id, null, contact_name, contact_email,
      'Pending', source || null
    );

    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
    console.log('New external lead received:', newLead);
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating external lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

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
  const { name, email, phone, status, notes, type_id, message, contact_name, contact_email } = req.body;
  
  if (!name || !email || !phone || !type_id || !contact_name || !contact_email) {
    return res.status(400).json({
      error: 'Name, email, phone, type, contact name and contact email are required'
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO leads (
        name, email, phone, status, notes,
        type_id, message, contact_name, contact_email,
        lead_gen_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, email, phone, status || 'New', notes,
      type_id, message || null, contact_name, contact_email,
      'Pending'
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
  const { name, email, phone, status, notes, type_id, message, contact_name, contact_email } = req.body;

  if (!name || !email || !phone || !type_id || !contact_name || !contact_email) {
    return res.status(400).json({
      error: 'Name, email, phone, type, contact name and contact email are required'
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
        contact_name = ?,
        contact_email = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, phone, status, notes, type_id, message, contact_name, contact_email, id);

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