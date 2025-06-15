// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { getSupabaseClient } from '$lib/server/supabase.js';

export async function load(event) {
  const access_token = event.cookies.get('sb-access-token');
  if (!access_token) {
    // Non c'è il token, quindi redirigi a /login
    throw redirect(303, '/login');
  }

  console.log('OK SB AT')

  const supabase = getSupabaseClient(event);
  const { data: { session } } = await supabase.auth.getSession();
  console.log('SESSION', session)

  if (!session) {
    throw redirect(303, '/login');
  }

  // Se esiste la sessione, redirigi a una pagina privata (es. dashboard)
  throw redirect(303, '/trips');
}