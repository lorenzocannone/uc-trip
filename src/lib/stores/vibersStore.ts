import { browser } from '$app/environment';
import type { Viber } from '$lib/classes/classes';
import { writable } from 'svelte/store';


export const vibersStore = writable<any[]>([], (set) => {
  if (!browser) return;
  const fetchVibers = async () => {
    console.log('fecthing')
    try {
      const res = await fetch('/api/vibers');
      const json = await res.json();
      if (res.ok) {
        console.log('Fetched vibers:', json);
        set(json);
      } else {
        console.error('Error fetching trips:', json.error);
      }
    } catch (err) {
      console.error('Network or parsing error:', err);
    }
  };
  fetchVibers();
  }
)

export async function addViber(newViber: Viber) {
  const res = await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newViber)
  });

  const json = await res.json();
  if (res.ok) {
    vibersStore.update((vibers) => [...vibers, json]); // aggiorna reattivamente
  } else {
    console.error('Errore add:', json.error);
  }
}

export async function updateViber(viber: Viber) {
  const res = await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(viber)
  });

  const json = await res.json();
  if (res.ok) {
    vibersStore.update((vibers) => [...vibers, json]); // aggiorna reattivamente
  } else {
    console.error('Errore add:', json.error);
  }
}
