import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const commands = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/commands' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		group: z.enum(['setup', 'maintain', 'inspect']),
		order: z.number()
	})
});

const docs = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/docs' }),
	schema: z.object({
		title: z.string(),
		summary: z.string()
	})
});

export const collections = { commands, docs };
