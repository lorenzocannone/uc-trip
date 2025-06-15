import { json } from '@sveltejs/kit';
import {getSupabaseClient} from '$lib/server/supabase.js'; // Importa il client sicuro

export async function GET(event) { 
  console.log('GET /api/trips called', event.cookies.get('sb-user-id'));

  const supabase = getSupabaseClient(event);
  // Ottieni la sessione dell'utente dalla request
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Non autorizzato', { status: 401 });
  }

  const { data, error } = await supabase
    .from('vibe_crews')
    .select(`
      *,
      viberz(*)
    `);
  const viberz = data?.map(d => d.viberz)
  console.log('data', viberz)
  if (error) return json({ error: error.message }, { status: 500 });
    return json(viberz);
}

export async function PUT(event) {
  const { id, ...updatedTrip } = await event.request.json();
  const supabase = getSupabaseClient(event);
  // Ottieni la sessione dell'utente dalla request
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Non autorizzato', { status: 401 });
  }

  const { error } = await supabase
    .from('viberz')
    .update(updatedTrip)
    .eq('id', id);

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ success: true });
}

export async function POST(event) {
  const { id, ...updatedTrip } = await event.request.json();
  const supabase = getSupabaseClient(event);
  // Ottieni la sessione dell'utente dalla request
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Non autorizzato', { status: 401 });
  }

  const { error } = await supabase
    .from('viberz')
    .update(updatedTrip)
    .eq('id', id);

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ success: true });
}

