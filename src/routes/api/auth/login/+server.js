import { json } from '@sveltejs/kit';
import {getSupabaseClient} from '$lib/server/supabase.js'; // Importa il client sicuro

export async function POST(event) {
    const { email, password } = await event.request.json();
    const supabase = getSupabaseClient(event);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    // Supponendo che il token sia presente in data.session.access_token
    const token = data.session.access_token;
    const refreshToken = data.session.refresh_token; // Recupera il refresh token dalla sessione
    const expiresIn = data.session.expires_in; // durata in secondi, ad es. 3600
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    event.cookies.set('sb-token-expires', expiresAt.toString(), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: expiresIn
    });

    // Imposta il cookie con opzioni di sicurezza
    event.cookies.set('sb-access-token', token, {
        path: '/', // il cookie sarà visibile a tutta l'app
        httpOnly: true, // il cookie non è accessibile via JavaScript sul client
        secure: process.env.NODE_ENV === 'production', // in produzione si usa sempre HTTPS
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // durata del cookie, ad esempio una settimana
    });
    // Imposta il cookie per il refresh token
    event.cookies.set('sb-refresh-token', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7
    });
    // Imposta il cookie con opzioni di sicurezza
    event.cookies.set('sb-user-id', data.user.id, {
        path: '/', // il cookie sarà visibile a tutta l'app
        httpOnly: true, // il cookie non è accessibile via JavaScript sul client
        secure: process.env.NODE_ENV === 'production', // in produzione si usa sempre HTTPS
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // durata del cookie, ad esempio una settimana
    });
  // Imposta anche eventuali cookie di sessione o restituisci solo dati necessari
  return json({ user: data.user });
}
