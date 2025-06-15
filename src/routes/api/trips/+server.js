import { json } from '@sveltejs/kit';
import {getSupabaseClient} from '$lib/server/supabase.js'; // Importa il client sicuro


/**
 * @param {any} tripId
 * @param {any} viberId
 * @param {import("@supabase/supabase-js").SupabaseClient<any, "public", any>} supabaseClient
 */
async function insertRelation(tripId, viberId, supabaseClient) {
  const insert = {
      trip_id: tripId,
      viber_id: viberId
    };
    console.log('inserting', insert)
    const { error: insertError } = await supabaseClient
      .from('trip_members')
      .insert(insert);
    if (insertError) {
      return json({ error: insertError.message }, { status: 500 });
    }
}

export async function GET(event) {
  console.log('GET /api/trips called');

  const supabase = getSupabaseClient(event);

  // Otteniamo la sessione dell'utente
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Non autorizzato', { status: 401 });
  }

  // Assicurati di usare await per ottenere i dati
  const { data, error } = await supabase
    .from('trips_rbac')
    .select(`
      *,
      trips(
        *,
        trip_members (
          viberz (
            id,
            first_name,
            last_name,
            label,
            email,
            vibepic_url
          )
        ),
        vibes (
          *,
          vibe_members(*)
        )
      )
    `);

  if (error) {
    console.log('error', error.message);
    return json({ error: error.message }, { status: 500 });
  }
  // Pulisci i dati secondo necessità
  const trips = data.map(d => d.trips);
/*   const cleaned = trips.map(({ trip_members, ...trip }) => ({
    ...trip,
    vibers: trip_members.map((tm) => tm.viberz)
  })); */

  // "Join" i due array in base al campo 'id'
  const cleaned = trips.map(({ trip_members, ...trip }) => {
    // Cerca in 'ordini' un oggetto che abbia lo stesso id dell'utente
    const role = data.find(d => d.trip_id === trip.id).role;
    // Unisci l'utente con l'ordine (se presente)
    return {
      ...trip,
      role: role, // se non troviamo l'ordine, restituiamo solo l'utente
      vibers: trip_members.map((tm) => tm.viberz)
    };
  });


  console.log('DATA', cleaned)
  

  return json(cleaned);
}

// @ts-ignore
export async function PUT(event) {
  const body = await event.request.json();
  const supabase = getSupabaseClient(event);
  // Ottieni la sessione dell'utente dalla request
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Non autorizzato', { status: 401 });
  }
  
  const vibers = body.vibers
  const tripData = {
      id: body.id,
      destination: body.destination,
      first_night: body.first_night,
      last_night: body.last_night,
      days: body.days
  }
  console.log(vibers, tripData)

  // 1. Aggiorna la tabella trips
  const { error: tripError } = await supabase
    .from('trips')
    .update(tripData)
    .eq('id', tripData.id);

  if (tripError) {
    return json({ error: tripError.message }, { status: 500 });
  }

  // 2. Cancella tutti i membri associati
  const { error: deleteError } = await supabase
    .from('trip_members')
    .delete()
    .eq('trip_id', tripData.id);

  if (deleteError) {
    return json({ error: deleteError.message }, { status: 500 });
  }

  // 3. Inserisci i nuovi membri
  if (vibers?.length > 0) {
    for (const viber of vibers) {
      insertRelation(tripData.id, viber.id, supabase)
    }
  }

  const RBACToInsert = vibers.filter(v => v.id != session.user.id).map((/** @type {{ id: any; }} */ v) => ({
        trip_id: tripData.id,
        user_id: v.id,
        role: 'viewer'
  }));

  const { error: RBACIDeleteError } = await supabase
    .from('trips_rbac')
    .delete()
    .eq('trip_id', tripData.id)
    .neq('user_id', session.user.id);
    
  if (RBACIDeleteError) {
    console.error('[POST /api/trips] Errore delete RBACs:', RBACIDeleteError);
    // Facoltativo: potresti fare rollback cancellando il trip appena creato
    // await supabaseServer.from('trips').delete().eq('id', newTripId);
    return json({ error: RBACIDeleteError.message }, { status: 500 });
  }
  const { error: RBACUpdateError } = await supabase
    .from('trips_rbac')
    .insert(RBACToInsert);
    
  if (RBACUpdateError) {
    console.error('[POST /api/trips] Errore delete RBACs:', RBACUpdateError);
    // Facoltativo: potresti fare rollback cancellando il trip appena creato
    // await supabaseServer.from('trips').delete().eq('id', newTripId);
    return json({ error: RBACUpdateError.message }, { status: 500 });
  }

  return json({ success: true });
}


// @ts-ignore
export async function POST(event) {

    const supabase = getSupabaseClient(event);
    // Ottieni la sessione dell'utente dalla request
    const { data: { session } } = await supabase.auth.getSession();
    console.log('SUPABASE SESSION', session)
    if (!session) {
      return new Response('Non autorizzato', { status: 401 });
    }
    const body = await event.request.json();

    // 1. Estrai i campi necessari per il nuovo trip e l’array di vibers
    const destination = body.destination;
    const first_night = body.first_night;
    const last_night = body.last_night;
    const days = body.days;
    const vibers = Array.isArray(body.vibers) ? body.vibers : [];
    
    // 2. Inserisci il nuovo trip in "trips", restituendone l'id
    const { data: insertedTrip, error: tripInsertError } = await supabase
      .from('trips')
      .insert({
        destination,
        first_night,
        last_night,
        days,
        created_by: session.user.id
      })
      .select('id')
      .single();

    if (tripInsertError) {
      console.error('[POST /api/trips] Errore insert trip:', tripInsertError);
      return json({ error: tripInsertError.message }, { status: 500 });
    }
    const trip_id = insertedTrip.id;

    console.log('[POST /api/trips] Nuovo trip inserito con id:', trip_id);

    // 3. Inserisci il nuovo trip in "trips_rbac"
    // @ts-ignore
    const { data: insertedTripRBAC, error: tripRBACInsertError } = await supabase
      .from('trips_rbac')
      .insert({
        trip_id: trip_id,
        user_id: session.user.id,
        role: 'owner'
      })

    if (tripRBACInsertError) {
      console.error('[POST /api/trips] Errore insert trip:', tripRBACInsertError);
      return json({ error: tripRBACInsertError.message }, { status: 500 });
    }

    // 3. Se ci sono vibers, inseriscili in batch in "trip_members"
    if (vibers.length > 0) {
      const relationsToInsert = vibers.map((/** @type {{ id: any; }} */ v) => ({
        trip_id: trip_id,
        viber_id: v.id
      }));

      const { error: membersInsertError } = await supabase
        .from('trip_members')
        .insert(relationsToInsert);

      if (membersInsertError) {
        console.error('[POST /api/trips] Errore insert trip_members:', membersInsertError);
        // Facoltativo: potresti fare rollback cancellando il trip appena creato
        // await supabaseServer.from('trips').delete().eq('id', newTripId);
        return json({ error: membersInsertError.message }, { status: 500 });
      }
      const RBACToInsert = vibers.filter(v => v.id != session.user.id).map((/** @type {{ id: any; }} */ v) => ({
        trip_id: trip_id,
        user_id: v.id,
        role: 'viewer'
      }));

      const { error: RBACInsertError } = await supabase
        .from('trips_rbac')
        .insert(RBACToInsert);
    
      if (RBACInsertError) {
        console.error('[POST /api/trips] Errore insert RBACs:', RBACToInsert);
        // Facoltativo: potresti fare rollback cancellando il trip appena creato
        // await supabaseServer.from('trips').delete().eq('id', newTripId);
        return json({ error: RBACToInsert.message }, { status: 500 });
      }

      console.log(
        `[POST /api/trips] Inseriti ${relationsToInsert.length} record in trip_members per trip_id=${trip_id}`
      );
    }

    // 4. Restituisci la risposta di successo con il nuovo trip e i vibers associati
    return json(
      {
        success: true,
        trip: {
          id: trip_id,
          destination,
          first_night,
          last_night,
          days
        },
        addedVibers: vibers.map((/** @type {{ id: any; }} */ v) => v.id)
      },
      { status: 201 }
    );
}


// @ts-ignore
export async function DELETE(event) {
  try {
    let supabaseClient;
    try {
      supabaseClient = await getSupabaseClient(event);
    } catch (error) {
      // @ts-ignore
      return json({ error: error.message }, { status: 401 });
    }
    const body = await event.request.json();
    const tripId = body.tripId;

    if (!tripId) {
      return json({ error: 'tripId is requested' }, { status: 400 });
    }

    // Elimina direttamente il trip, i membri associati verranno eliminati automaticamente
    const { error: tripDeleteError } = await supabaseClient
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (tripDeleteError) {
      console.error('[DELETE /api/trips] Errore eliminazione trip:', tripDeleteError);
      return json({ error: tripDeleteError.message }, { status: 500 });
    }

    console.log(`[DELETE /api/trips] Trip eliminato con id=${tripId}`);

    return json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[DELETE /api/trips] Eccezione:', err);
    return json({ error: 'error' }, { status: 500 });
  }
}

