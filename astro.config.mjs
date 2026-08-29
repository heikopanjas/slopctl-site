// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://panjas.com',
	base: '/slopctl',
	integrations: [
		starlight({
			title: 'slopctl',
			description: 'A manager for coding agent instruction files',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/heikopanjas/slopctl' }],
			favicon: '/favicon.ico',
			customCss: ['./src/styles/custom.css'],
			head: [
				{
					tag: 'link',
					attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/slopctl/favicon-32x32.png' }
				},
				{
					tag: 'link',
					attrs: { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/slopctl/favicon-16x16.png' }
				},
				{
					tag: 'link',
					attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/slopctl/apple-touch-icon.png' }
				}
			],
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Getting Started', slug: 'getting-started' },
						{ label: 'FAQ', slug: 'faq' }
					]
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Templates & templates.yml', slug: 'templates' },
						{ label: 'Agent Skills', slug: 'skills' },
						{ label: 'Agents & Languages', slug: 'agents-and-languages' }
					]
				},
				{
					label: 'CLI Commands',
					items: [
						{ label: 'templates', slug: 'commands/templates' },
						{ label: 'agents', slug: 'commands/agents' },
						{ label: 'models', slug: 'commands/models' },
						{ label: 'init', slug: 'commands/init' },
						{ label: 'update', slug: 'commands/update' },
						{ label: 'merge', slug: 'commands/merge' },
						{ label: 'remove', slug: 'commands/remove' },
						{ label: 'doctor', slug: 'commands/doctor' },
						{ label: 'status', slug: 'commands/status' },
						{ label: 'config', slug: 'commands/config' },
						{ label: 'completions', slug: 'commands/completions' }
					]
				}
			]
		})
	]
});
