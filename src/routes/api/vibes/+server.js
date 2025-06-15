import { json } from '@sveltejs/kit';
import {getSupabaseClient} from '$lib/server/supabase.js'; // Importa il client sicuro

/**
 * @param {any} vibeId
 * @param {string} viberId
 * @param {import("@supabase/supabase-js").SupabaseClient<any, "public", any>} supabaseClient
 */
async function insertRelation(vibeId, viberId, supabaseClient) {
  const insert = {
      vibe_id: vibeId,
      viber_id: viberId
    };
    console.log('inserting', insert)
    const { error: insertError } = await supabaseClient
      .from('vibe_members')
      .insert(insert);
    if (insertError) {
      return json({ error: insertError.message }, { status: 500 });
    }
}

export async function GET(event) {
  console.log('GET /api/vibes called');

  const trip_id = event.url.searchParams.get('trip_id');

  if (!trip_id) {
    return json({ error: 'trip_id is required' }, { status: 400 });
  }

  const supabase = getSupabaseClient(event);

  // Otteniamo la sessione dell'utente
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Non autorizzato', { status: 401 });
  }

  const { data, error } = await supabase
    .from('vibes')
    .select(`
      *,
      vibe_members (
        viberz(*)
      )
    `)
    .eq('trip_id', trip_id);

  if (error) {
    console.log('error', error.message);
    return json({ error: error.message }, { status: 500 });
  }
  console.log(data)

  return json(data);
}


export async function PUT(event) {
  const body = await event.request.json();
  const {vibers, ...vibeData} = body
  console.log(vibers, vibeData)

  const supabase = getSupabaseClient(event);

  // Otteniamo la sessione dell'utente
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Non autorizzato', { status: 401 });
  }

  // 1. Aggiorna la tabella vibes
  const { error: vibeError } = await supabase
    .from('vibes')
    .update(vibeData)
    .eq('id', vibeData.id);

  if (vibeError) {
    return json({ error: vibeError.message }, { status: 500 });
  }

  // 2. Cancella tutti i membri associati
  const { error: deleteError } = await supabase
    .from('vibe_members')
    .delete()
    .eq('vibe_id', vibeData.id);

  if (deleteError) {
    return json({ error: deleteError.message }, { status: 500 });
  }

  // 3. Inserisci i nuovi membri
  if (vibers?.length > 0) {
    for (const viber of vibers) {
      insertRelation(vibeData.id, viber.id, supabase)
    }
  }

  return json({ success: true });
}


export async function POST(event) {
  try {
    const supabase = getSupabaseClient(event);

    // Otteniamo la sessione dell'utente
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response('Non autorizzato', { status: 401 });
    }

    const body = await event.request.json();
    // Se il body non è un array, creane uno con un solo elemento
    const payloads = Array.isArray(body) ? body : [body];

    // Array in cui accumuleremo i risultati per ogni insert
    const results = [];

    // Cicla per ogni insert da effettuare
    for (const vibePayload of payloads) {
      // 1. Estrai i campi necessari per la nuova vibe e l’array di vibers
      const { type, name, day, day_position, date, reference, estimated_cost, time, vibers, trip_id } = vibePayload;
      const validVibers = Array.isArray(vibers) ? vibers : [];

      // 2. Inserisci la nuova vibe in "vibes", restituendone l'id
      const { data: insertedVibe, error: vibeInsertError } = await supabase
        .from('vibes')
        .insert({
          type,
          name,
          day,
          reference,
          estimated_cost,
          day_position,
          date,
          time,
          trip_id
        })
        .select('id')
        .single();

      if (vibeInsertError) {
        console.error('[POST /api/vibes] Errore insert vibe:', vibeInsertError);
        return json({ error: vibeInsertError.message }, { status: 500 });
      }

      const newVibeId = insertedVibe.id;
      console.log('[POST /api/vibes] Nuova vibe inserita con id:', newVibeId);

      // 3. Se ci sono vibers, inseriscili in batch in "vibe_members"
      if (validVibers.length > 0) {
        const relationsToInsert = validVibers.map(v => ({
          vibe_id: newVibeId,
          viber_id: v.id
        }));

        const { error: membersInsertError } = await supabase
          .from('vibe_members')
          .insert(relationsToInsert);

        if (membersInsertError) {
          console.error('[POST /api/vibes] Errore insert vibe_members:', membersInsertError);
          // Facoltativo: potresti fare rollback cancellando la vibe appena creata
          return json({ error: membersInsertError.message }, { status: 500 });
        }

        console.log(
          `[POST /api/vibes] Inseriti ${relationsToInsert.length} record in vibe_members per vibe_id=${newVibeId}`
        );
      }

      // 4. Aggiungi il risultato dell'insert al nostro array di risposte
      results.push({
        id: newVibeId,
        type,
        name,
        day,
        day_position,
        date,
        vibers: validVibers.map(v => v.id),
        trip_id
      });
    }

    // Se viene fatto un inserimento singolo, restituisci direttamente l'oggetto,
    // altrimenti restituisci l'array completo
    const responsePayload = Array.isArray(body) ? results : results[0];

    return json(
      {
        success: true,
        vibe: responsePayload
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/vibes] Eccezione:', err);
    return json({ error: 'error' }, { status: 500 });
  }
}


export async function DELETE(event) {
  try {
    const supabase = getSupabaseClient(event);

    // Otteniamo la sessione dell'utente
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response('Non autorizzato', { status: 401 });
    }
    const body = await event.request.json();
    const vibeId = body.vibeId;

    if (!vibeId) {
      return json({ error: 'vibeId è richiesto' }, { status: 400 });
    }

    // Elimina direttamente il vibe, i membri associati verranno eliminati automaticamente
    const { error: vibeDeleteError } = await supabase
      .from('vibes')
      .delete()
      .eq('id', vibeId);

    if (vibeDeleteError) {
      console.error('[DELETE /api/vibes] Errore eliminazione vibe:', vibeDeleteError);
      return json({ error: vibeDeleteError.message }, { status: 500 });
    }

    console.log(`[DELETE /api/vibes] Vibe eliminato con id=${vibeId}`);

    return json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[DELETE /api/vibes] Eccezione:', err);
    return json({ error: 'error' }, { status: 500 });
  }
}

