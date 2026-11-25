import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const platform = z.enum(['cisco', 'coursera', 'other']);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number(),
    role: z.string(),
    category: z.enum(['Web', 'AI', 'Networking', 'Mobile', 'Other']),
    tech: z.array(z.string()),
    // Screenshots live in /public/images. Leave empty to show a designed placeholder screen.
    desktopImage: z.string().optional(),
    mobileImage: z.string().optional(),
    github: z.string().optional(),
    demo: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    accent: z.enum(['burgundy', 'blue', 'espresso', 'mocha']).default('burgundy'),
    sample: z.boolean().default(false),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    platform,
    provider: z.string(),
    completed: z.coerce.date(),
    hours: z.number().optional(),
    topics: z.array(z.string()).default([]),
    certificate: z.string().optional(), // id of a file in content/certificates
    link: z.string().optional(),
    sample: z.boolean().default(false),
  }),
});

const certificates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/certificates' }),
  schema: z.object({
    title: z.string(),
    issuer: z.string(),
    platform,
    issued: z.coerce.date(),
    credentialId: z.string().optional(),
    verifyUrl: z.string().optional(),
    image: z.string().optional(), // e.g. /images/certs/ccna.jpg
    skills: z.array(z.string()).default([]),
    course: z.string().optional(), // id of a file in content/courses
    sample: z.boolean().default(false),
  }),
});

export const collections = { projects, courses, certificates };
