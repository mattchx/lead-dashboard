import express from 'express';
import cors from 'cors';
import db from './db.js';
import authRouter from './api/auth.js';
import leadsRouter from './api/leads.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});