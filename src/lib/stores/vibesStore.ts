// src/lib/stores/vibesStore.ts
import { browser } from '$app/environment';
import { writable, get, type Writable } from 'svelte/store';
import type { Vibe } from '$lib/classes/classes';

/**
 * LO STORE DI VIBES:
 * - Contiene un array di Vibe[].
 * - Quando si inizializza si passa il trip_id per caricare solo le vibes relative a quel trip.
 */
export const vibesStore: Writable<Vibe[]> = writable([]);

/**
 * FETCH DELLE VIBES:
 * - Effettua una fetch all’endpoint /api/vibes passando il trip_id.
 * - Sanitizza i dati mappando esplicitamente i campi utili della vibe.
 */
export async function fetchVibes(trip_id: string): Promise<{
  success: boolean;
  data?: Vibe[];
  error?: string;
}> {
  if (!browser) {
    return { success: false, error: 'SSR: fetchVibes non esegue nulla sul server.' };
  }
  try {
    console.log(`[vibesStore] Fetching vibes for trip_id=${trip_id}...`);
    const res = await fetch(`/api/vibes?trip_id=${trip_id}`);
    const json = await res.json();

    if (!res.ok) {
      const errMsg = json?.error ?? `HTTP ${res.status}`;
      console.error(`[vibesStore] Errore fetchVibes: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    // Sanitizzazione: mappa i campi utili per ogni vibe
    const sanitized: Vibe[] = Array.isArray(json)
      ? json.map((item: any) => ({
          id: item.id,
          type: item.type,
          name: item.name,
          day: item.day,
          day_position: item.day_position,
          date: item.date,
          time: item.time,
          estimated_cost: item.estimated_cost,
          location: item.location,
          reference: item.reference,
          description: item.description,
          trip_id: item.trip_id,
          // Assumiamo che i membri della vibe siano forniti nella proprietà "vibe_members"
          vibers: item.vibe_members.map(vm => vm.viberz)
        }))
      : [];

    vibesStore.set(sanitized);
    return { success: true, data: sanitized };
  } catch (err) {
    console.error('[vibesStore] Network o parsing error:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * AGGIUNTA DI UNA NUOVA VIBE:
 * - Effettua una POST a /api/vibes.
 * - Si assume che l’endpoint gestisca anche l’inserimento in vibe_members se presenti.
 * - Aggiorna in modo reattivo lo store aggiungendo la nuova vibe.
 */
export async function addVibe(newVibe: Vibe): Promise<{
  success: boolean;
  vibe?: Vibe;
  error?: string;
}> {
  if (!browser) {
    return { success: false, error: 'SSR: addVibe non è disponibile sul server.' };
  }
  try {
    console.log('[vibesStore] Adding new vibe...', newVibe);
    const res = await fetch('/api/vibes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVibe)
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = json?.error ?? `HTTP ${res.status}`;
      console.error('[vibesStore] Errore addVibe:', errMsg);
      return { success: false, error: errMsg };
    }

    // Supponiamo che la risposta sia del tipo: { success: true, vibe: { ... } }
    const addedVibe: Vibe = json.vibe;

    vibesStore.update((current) => [...current, addedVibe]);

    return { success: true, vibe: addedVibe };
  } catch (err) {
    console.error('[vibesStore] Network error in addVibe:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * AGGIORNAMENTO DI UNA VIBE:
 * - Effettua una PUT a /api/vibes con la vibe modificata.
 * - Se l’operazione va a buon fine, sostituisce la vibe corrispondente nello store.
 */
export async function updateVibe(
  modifiedVibe: Vibe,
): Promise<{ success: boolean; vibe?: Vibe; error?: string }> {
  if (!browser) {
    return { success: false, error: 'SSR: updateVibe non è disponibile sul server.' };
  }
  try {
    console.log('[vibesStore] Updating vibe...', modifiedVibe);
    const res = await fetch('/api/vibes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modifiedVibe),
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = json?.error ?? `HTTP ${res.status}`;
      console.error('[vibesStore] Errore updateVibe:', errMsg);
      return { success: false, error: errMsg };
    }
    // Aggiorna la vibe nello store
    vibesStore.update((current) => current.map(v => (v.id === json.id ? json : v)));

    return { success: true, vibe: json };
  } catch (err) {
    console.error('[vibesStore] Network error in updateVibe:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * CANCELLAZIONE DI UNA VIBE:
 * - Effettua una DELETE a /api/vibes per la vibe da eliminare.
 * - Se l’operazione va a buon fine, rimuove la vibe dallo store.
 */
export async function deleteVibe(
  vibeId: string | undefined
): Promise<{ success: boolean; error?: string }> {
  if (!browser) {
    return { success: false, error: 'SSR: deleteVibe non è disponibile sul server.' };
  }
  try {
    console.log(`[vibesStore] Deleting vibe with id=${vibeId}`);
    const res = await fetch('/api/vibes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vibeId }),
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = json?.error ?? `HTTP ${res.status}`;
      console.error('[vibesStore] Errore deleteVibe:', errMsg);
      return { success: false, error: errMsg };
    }
    // Rimuove la vibe dallo store
    vibesStore.update((current) => current.filter(v => v.id !== vibeId));
    return { success: true };
  } catch (err) {
    console.error('[vibesStore] Network error in deleteVibe:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * INIZIALIZZAZIONE DELLO STORE DI VIBES:
 * - Questa funzione va chiamata nelle pagine dedicate al trip, passando il trip_id.
 * - In questo modo lo store carica solo le vibes relative a quel trip.
 */
export async function initVibesStore(trip_id: string): Promise<void> {
  if (!browser) return;
  await fetchVibes(trip_id);
  console.log('Initialized vibes store:', get(vibesStore));
}
