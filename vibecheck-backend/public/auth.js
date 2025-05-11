// public/auth.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://YOUR_PROJECT_REF.supabase.co',
  'YOUR_ANON_KEY'
);

// Sign up a new user
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  alert('Check your email for a confirmation link!');
  return data;
}

// Sign in an existing user
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // supabase-js auto-stores the session in localStorage
  return data.session.access_token;
}

// Get current JWT
export function getToken() {
  return supabase.auth.getSession()
    .then(({ data }) => data.session?.access_token);
}
