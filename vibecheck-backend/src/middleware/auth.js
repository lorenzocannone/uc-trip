// src/middleware/auth.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function auth(req, res, next) {
  // 1) Get token from header
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  // 2) Validate the JWT
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // 3) Upsert into profiles so owner_id always exists
  const { error: upsertErr } = await supabase
    .from('profiles')
    .upsert({
      id:        user.id,
      auth_id:   user.id,
      full_name: user.email  
    });
  if (upsertErr) {
    console.error('Profile upsert failed:', upsertErr);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // 4) Attach userId and continue
  req.userId = user.id;
  next();
};
