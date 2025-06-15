<script>
	let { showModal = $bindable(), notify = $bindable(), callable, mode, type, elemId, name } = $props();

	let dialog = $state(); // HTMLDialogElement

	$effect(() => {
		if (showModal) dialog.showModal();
	});

    function handleOk() {
        callable(elemId)
        dialog.close()
    }

    let okButtonClass = $derived(mode == 'delete' ? 'bg-error-500' : mode == 'update' ? 'bg-warning-500' : 'bg-success-500')
    const delateMessage = 'Are you sure you want to delete ' + type
    const updateMessage = 'Are you sure you want to update ' + type
    const createMessage = 'Do you confirm new ' + type

    let modalMessage = $derived(mode == 'delete' ? delateMessage : mode == 'update' ? updateMessage : createMessage)

</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
    class="mx-auto my-auto p-8 card"
	onclose={() => (showModal = false)}
	onclick={(e) => { if (e.target === dialog) dialog.close(); }}
>
	<div>
        {modalMessage} <b>{name}</b>?
        <hr class="my-2">
		<!-- svelte-ignore a11y_autofocus -->
         <label class="flex justify-center space-x-2 text-xs">
            <p>Notify Viberz</p>
            <input class="checkbox" type="checkbox" checked={notify} onchange={() => notify = !notify}/>
        </label>
        <div class="pt-4 flex gap-2 justify-center">
            <button class="btn {okButtonClass} text-surface-50" onclick={handleOk}>Ok</button>
            <button class="btn bg-surface-500 text-surface-50" onclick={() => dialog.close()}>Cancel</button>
        </div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
