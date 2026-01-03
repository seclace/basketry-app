import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true
			},
			includeAssets: ['icons/icon.svg'],
			manifest: {
				name: 'Basketry',
				short_name: 'Basketry',
				start_url: '/',
				display: 'standalone',
				background_color: '#0b0d10',
				theme_color: '#0b0d10',
				icons: [
					{
						src: 'icons/icon.svg',
						sizes: 'any',
						type: 'image/svg+xml'
					}
				]
			}
		})
	],
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});
