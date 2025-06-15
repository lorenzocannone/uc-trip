<script>
    import { goto } from "$app/navigation";
    import { Mail, Lock } from "@lucide/svelte";

  let email = '';
  let password = '';
  let errorMessage = '';

  /**
     * @param {{ preventDefault: () => void; }} event
     */
  async function handleLogin(event) {
    event.preventDefault();

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    if (!response.ok) {
      errorMessage = result.error;
    } else {
      // Gestisci il login, es. salvando la sessione in uno store client o reindirizzando l'utente
      goto('/')
      console.log('User authenticated:', result.user);
    }
  }
</script>
    <form on:submit|preventDefault={handleLogin} class="w-full  space-y-8">
    <div class="flex w-full justify-center mt-40 gap-4">
    <!-- PWD -->
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="ig-cell preset-tonal">
            <Mail size={16} />
            </div>
            <input class="ig-input" type="email" bind:value={email} placeholder="Email"  required/>
        </div>
        <!-- PWD -->
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="ig-cell preset-tonal">
            <Lock size={16} />
            </div>
            <input class="ig-input" type="password" bind:value={password} placeholder="Password" required/>
        </div>
        <button class="btn bg-primary-500 text-surface-50" type='submit'>Login</button>
    </div>
    {#if errorMessage}
        <p style="color: red;">{errorMessage}</p>
    {/if}
    </form>