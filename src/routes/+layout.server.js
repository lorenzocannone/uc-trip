// src/routes/dashboard/+layout.server.js
import { redirect } from '@sveltejs/kit';
import {getSupabaseClient} from '$lib/server/supabase.js'; // il client che hai già creato

export async function load(event) {
  // Recupera la sessione, ad esempio da un cookie (se hai impostato Supabase Auth per salvarla)
  // Oppure usa il metodo di Supabase che richiede la sessione dal client lato server.
  const access_token = event.cookies.get('sb-access-token');

  // Se non hai il token, l'utente non risulta autenticato
  if (!access_token) {
    throw redirect(303, '/login');
  }
  const supabase = getSupabaseClient(event)
  console.log('CREATED CLIENT', supabase.auth)
  // Puoi anche verificare la sessione fatta una chiamata a Supabase se necessario:
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw redirect(303, '/login');
  }
  
  // Se vuoi passare i dati dell'utente al layout:
  return {
    user: session.user
  };
}