import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Crea un client Supabase autenticato, utilizzando i cookie della request.
 *
 * @param {object} param0 - Oggetto contenente i cookie.
 * @param {Cookies} param0.cookies - I cookie estratti dalla request.
 * @returns Il client Supabase configurato.
 */
export function getSupabaseClient(event: RequestEvent) {
  return createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event
  });
}