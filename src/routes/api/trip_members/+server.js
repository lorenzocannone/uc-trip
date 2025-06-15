import { json } from '@sveltejs/kit';
import { getSupabaseClient } from '$lib/server/supabase';

export async function POST(event) { 
  const supabase = getSupabaseClient(event);
  
    // Otteniamo la sessione dell'utente
    const {
      data: { session }
    } = await supabase.auth.getSession();
  
    if (!session) {
      return new Response('Non autorizzato', { status: 401 });
    }
  const { tripId } = await event.request.json();
  const { data, error } = await supabase.from('trip_members').select('*').eq('trip', tripId); 
  if (error) return json({ error: error.message }, { status: 500 });
    return json(data);
}