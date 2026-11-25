// Builds links that keep working when the site lives in a sub-folder
// on GitHub Pages (e.g. username.github.io/portfolio/).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path = '/') {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return base + (path.startsWith('/') ? path : `/${path}`);
}

export type PlatformKey = string;

export function formatDate(d: Date, style: 'short' | 'long' = 'short') {
  return d.toLocaleDateString('en-US', style === 'short' ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' });
}
