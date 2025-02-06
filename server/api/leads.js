import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import db from '../db.js';
import { sendAdminNotification, sendLeadConfirmation, sendProviderNotification } from '../services/email.js'

const router = express.Router();

// Get all leads
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await db.execute(`
      SELECT
        l.*,
        lt.name as type_name
      FROM leads l
      LEFT JOIN lead_types lt ON l.type_id = lt.id
      ORDER BY l.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new lead
router.post('/', authenticate, authorize(['admin', 'user']), async (req, res) => {
  const lead = req.body;

  try {
    const { lastInsertRowid } = await db.execute({
      sql: `
        INSERT INTO leads (
          name, email, phone, type_id, contact_name, 
          contact_email, message, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        lead.name,
        lead.email,
        lead.phone,
        lead.type_id,
        lead.contact_name,
        lead.contact_email,
        lead.message,
        lead.source
      ]
    });

    const { rows } = await db.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: [lastInsertRowid.toString()]
    });

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update lead
router.put('/:id', authenticate, authorize(['admin', 'user']), async (req, res) => {
  const { id } = req.params;
  const lead = req.body;

  try {
    await db.execute({
      sql: `
        UPDATE leads
        SET
          name = ?,
          email = ?,
          phone = ?,
          type_id = ?,
          contact_name = ?,
          contact_email = ?,
          message = ?,
          source = ?,
          status = ?,
          notes = ?,
          lead_gen_status = ?
        WHERE id = ?
      `,
      args: [
        lead.name,
        lead.email,
        lead.phone,
        lead.type_id,
        lead.contact_name,
        lead.contact_email,
        lead.message,
        lead.source,
        lead.status,
        lead.notes,
        lead.lead_gen_status,
        id
      ]
    });

    const { rows } = await db.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: [id]
    });

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete lead
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute({
      sql: 'DELETE FROM leads WHERE id = ?',
      args: [id]
    });

    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send email to provider
router.post('/send-email', authenticate, (req, res) => {
  const lead = req.body;

  const leadDetails = {
    name: lead.name, email: lead.email, phone: lead.phone, contact_name: lead.contact_name, contact_email: lead.contact_email
  }

  try {
    sendProviderNotification(leadDetails, contact_email)

    res.status(400).send({ message: 'Email sent sucessfullly.' })
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// Create lead from external source
router.post('/external', async (req, res) => {
  const lead = req.body;

  // Basic validation
  if (!lead.name || !lead.email) {
    return res.status(400).json({
      error: 'Name and email are required'
    });
  }

  try {
    const { lastInsertRowid } = await db.execute({
      sql: `
        INSERT INTO leads (
          name, email, phone, type_id, contact_name,
          contact_email, message, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        lead.name,
        lead.email,
        lead.phone || null,
        lead.type_id || null,
        lead.contact_name || null,
        lead.contact_email || null,
        lead.message || null,
        lead.source || 'external'
      ]
    });

    const { rows } = await db.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: [lastInsertRowid.toString()]
    });

    const emailDetails = {
      contact_name: lead.contact_name,
      name: lead.name,
      email: lead.email,
      phone: lead.phone
    }

    sendLeadConfirmation(emailDetails)
    sendAdminNotification(emailDetails)

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating external lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;