<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { registerSW } from 'virtual:pwa-register';
	import { browser } from '$app/environment';

	onMount(() => {
		if (browser && import.meta.env.PROD) {
			registerSW({ immediate: true });
		}
	});
</script>

<slot />
