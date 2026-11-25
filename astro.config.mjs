// @ts-check
import { defineConfig } from 'astro/config';

// When deployed with GitHub Actions, SITE_URL and BASE_PATH are filled in
// automatically (see .github/workflows/deploy.yml). Locally they fall back
// to sensible defaults so `npm run dev` just works.
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
});
