import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './api/auth.js';
import leadsRouter from './api/leads.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_BASE_URL || 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  partitioned: true,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});