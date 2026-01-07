<script lang="ts">
	// Copyright 2026 Vadim Goldenko
	// SPDX-License-Identifier: Apache-2.0
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
