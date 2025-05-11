// src/app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const auth = require('./middleware/auth');

const tripRoutes     = require('./routes/trips');
const dayRoutes      = require('./routes/days');
const activityRoutes = require('./routes/activities');

const app = express();

// 1) Expose config for frontend
app.get('/config', (req, res) => {
  res.json({
    supabaseUrl:     process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
});

// 2) Serve static files from public/
app.use(express.static(path.join(__dirname, '../public')));

// 3) JSON body parser
app.use(express.json());

// 4) Protect only /api routes
app.use('/api', auth);

// 5) Mount your API routes
app.use('/api/trips', tripRoutes);
app.use('/api/trips/:tripId/days', dayRoutes);
app.use('/api/days', activityRoutes);

// 6) Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
