// Course folders come from src/content/folders/*.md — add a file there to add a folder.
import { getCollection } from 'astro:content';

export type FolderInfo = { id: string; label: string; long: string; folder: 'burgundy' | 'blue' | 'mocha' | 'paper' | 'espresso'; order: number; code: string };

export async function getFolders(): Promise<Record<string, FolderInfo>> {
  const list = (await getCollection('folders'))
    .map((f) => ({ id: f.id, label: f.data.label, long: f.data.long ?? f.data.label, folder: f.data.color, order: f.data.order }))
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  return Object.fromEntries(list.map((f, i) => [f.id, { ...f, code: `FILE ${String(i + 1).padStart(2, '0')}` }]));
}
