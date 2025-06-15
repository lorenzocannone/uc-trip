import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	 build: {
		target: 'esnext' // Permette l'uso di top-level await
	},
	optimizeDeps: {
		esbuildOptions: {
		target: 'esnext' // Assicura che esbuild supporti top-level await
		}
	}
});
