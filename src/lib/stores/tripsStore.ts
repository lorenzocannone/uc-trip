// src/lib/stores/tripsStore.ts
import { browser } from '$app/environment';
import { writable, get, type Writable } from 'svelte/store';
import type { Trip, Vibe } from '$lib/classes/classes';

/**
 * LO STORE:
 * - Contiene un array di Trip[] oppure undefined se non è ancora stato fetchato.
 * - Lato SSR rimane undefined; lato client, al primo import, parte il fetch in background.
 */
export const tripsStore: Writable<Trip[]> = writable();


function generatedDates(firstDate: Date | undefined, lastDate: Date | undefined) {
  let dates = [];
  let currentDate = new Date(firstDate ? firstDate : Date.now());

  while (currentDate < new Date(lastDate ? lastDate : Date.now())) {
    dates.push(new Date(currentDate)); // Aggiunge una copia della data
    currentDate.setDate(currentDate.getDate() + 1); // Incrementa di un giorno
  }
  console.log('adding date', currentDate)
  console.log('updated dates', dates)

  return dates;
}

/**
 * FUNZIONE DI FETCH:
 * - Se non siamo in browser (SSR), esce subito.
 * - Se è già stato inizializzato e `force=false`, non fa nulla.
 * - Ritorna un oggetto con `{ success: boolean; data?: Trip[]; error?: string }`
 *   così da poter dare feedback al chiamante.
 */
export async function fetchTrips(): Promise<{
  success: boolean;
  data?: Trip[];
  error?: string;
}> {
  if (!browser) {
    return { success: false, error: 'SSR: fetchTrips non esegue nulla sul server.' };
  }
  
  try {
    console.log('[tripsStore] Fetching trips...');
    const res = await fetch('/api/trips');
    const json = await res.json();
    console.log('json', json);

    if (!res.ok) {
      const errMsg = json?.error ?? `HTTP ${res.status}`;
      console.error(`[tripsStore] Errore fetchTrips: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    const tripsWithVibes = await Promise.all(
      json.map(async (trip: any) => {
        const vibeRes = await fetch(`/api/vibes?trip_id=${trip.id}`);
        const vibeJson = await vibeRes.json();

        return {
          id: trip.id,
          destination: trip.destination,
          first_night: trip.first_night,
          last_night: trip.last_night,
          days: trip.days,
          vibers: trip.vibers,
          role: trip.role,
          vibes: vibeRes.ok ? vibeJson.map((vibe: any) => vibe) : []
        };
      })
    );

    tripsStore.set(tripsWithVibes);
    return { success: true, data: tripsWithVibes };
  } catch (err) {
    console.error('[tripsStore] Network o parsing error:', err);
    return { success: false, error: (err as Error).message };
  }
}


/**
 * FUNZIONE DI AGGIUNTA (POST):
 * - Fa la POST su /api/trips.
 * - In caso di successo, aggiunge il nuovo trip nello store in modo reattivo.
 * - Se lo store era ancora undefined (non inizializzato), lo inizializza con [json].
 * - Ritorna { success, trip?, error? }.
 */
export async function addTrip(newTrip: Trip): Promise<{
  success: boolean;
  trip?: Trip;
  error?: string;
}> {
  if (!browser) {
    return { success: false, error: 'SSR: addTrip non è disponibile sul server.' };
  }

  try {
    const tripRes = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTrip),
    });
    let tripJson = await tripRes.json();
    console.log('tripJson', tripJson)

    let vibes : Vibe[] = []
    const days = generatedDates(newTrip.first_night, newTrip.last_night)
    console.log('days iterating through', days)
    for (const [index, date] of days.entries()) {
      vibes.push({
        type: 'night',
        name: `Night ${index+1}`,
        day: index + 1,
        day_position: -1,
        date: date,
        trip_id: tripJson.trip.id
      })
    }
    const vibesRes = await fetch('/api/vibes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vibes),
    });
    const vibesJson = await vibesRes.json();
    console.log('asked to add vibes:', vibes)
    console.log('added vibes:', vibesJson)

    if (!tripRes.ok) {
      const errMsg = tripJson?.error ?? `HTTP ${tripRes.status}`;
      console.error('[tripsStore] Errore addTrip:', errMsg);
      return { success: false, error: errMsg };
    }

    if (!vibesRes.ok) {
      const errMsg = vibesJson?.error ?? `HTTP ${vibesJson.status}`;
      console.error('[tripsStore] Errore addVibes:', errMsg);
      return { success: false, error: errMsg };
    }
    tripJson.vibes = vibesJson

    return { success: true, trip: tripJson };
  } catch (err) {
    console.error('[tripsStore] Network error in addTrip:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * FUNZIONE DI AGGIORNAMENTO (PUT):
 * - Fa la PUT su /api/trips con il trip aggiornato.
 * - Se OK, sostituisce il trip corrispondente nello store.
 * - Se lo store è ancora undefined, lo ignora (non dovrebbe succedere, ma evitiamo crash).
 * - Ritorna { success, trip?, error? }.
 */
export async function updateTrip(
  modifiedTrip: Trip,
): Promise<{ success: boolean; trip?: Trip; error?: string }> {
  if (!browser) {
    return { success: false, error: 'SSR: updateTrip non è disponibile sul server.' };
  }

  try {
    const res = await fetch('/api/trips', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modifiedTrip),
    });
    const json = await res.json();

    if (!res.ok) {
      const errMsg = json?.error ?? `HTTP ${res.status}`;
      console.error('[tripsStore] Errore updateTrip:', errMsg);
      return { success: false, error: errMsg };
    }

/*     // json dovrebbe essere il Trip aggiornato.
    tripsStore.update((current) => {
      if (!current) return current; // se è undefined, lo lasciamo così
      return current.map((t) => (t.id === json.id ? json : t));
    }); */

    return { success: true, trip: json };
  } catch (err) {
    console.error('[tripsStore] Network error in updateTrip:', err);
    return { success: false, error: (err as Error).message };
  }
}


/**
 * FUNZIONE DI CANCELLAZIONE (DELETE):
 * - Fa la DELETE su /api/trips con il trip da cancellare.
 * - Se OK, elimina il trip corrispondente nello store.
 * - Se lo store è ancora undefined, lo ignora (non dovrebbe succedere, ma evitiamo crash).
 * - Ritorna { success, trip?, error? }.
 */
export async function deleteTrip(
  tripId: string
): Promise<{ success: boolean; error?: string }> {
  if (!browser) {
    return { success: false, error: 'SSR: deleteTrip non è disponibile sul server.' };
  }

  try {
    const res = await fetch('/api/trips', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId }),
    });
    const json = await res.json();

    if (!res.ok) {
      const errMsg = json?.error ?? `HTTP ${res.status}`;
      console.error('[tripsStore] Errore deleteTrip:', errMsg);
      return { success: false, error: errMsg };
    }
/* 
    // Se la chiamata ha avuto successo, rimuoviamo il trip dallo store
    tripsStore.update((current) => {
      if (!current) return current; // Se lo store è undefined, lo lasciamo invariato
      return current.filter((t) => t.id !== tripId);
    }); */

    return { success: true };
  } catch (err) {
    console.error('[tripsStore] Network error in deleteTrip:', err);
    return { success: false, error: (err as Error).message };
  }
}



/**
 * FETCH AUTOMATICO ALL’IMPORT:
 * - Se siamo in browser, chiamiamo fetchTrips() automaticamente al primo import.
 * - Grazie al flag `initialized`, il fetch verrà eseguito solo una volta,
 *   a meno che non passi `force = true` a fetchTrips().
 */
if (browser) {
  // Non usiamo await qui perché è auto-invocato in background.
  await fetchTrips();
  console.log('initialized store:', get(tripsStore))
}