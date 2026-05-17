#!/usr/bin/env node
// Scans all MDX files and syncs unique tags into .frontmatter/database/taxonomyDb.json
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = new URL('..', import.meta.url).pathname;
const blogDir = join(root, 'src/data/blog');
const dbPath = join(root, '.frontmatter/database/taxonomyDb.json');

const tags = new Set();

for (const file of readdirSync(blogDir)) {
  if (!file.endsWith('.mdx')) continue;
  const content = readFileSync(join(blogDir, file), 'utf8');
  const match = content.match(/^tags:\n((?:  - .+\n?)+)/m);
  if (!match) continue;
  for (const line of match[1].split('\n')) {
    const tag = line.trim().replace(/^- /, '');
    if (tag) tags.add(tag);
  }
}

const sorted = [...tags].sort((a, b) => a.localeCompare(b));
const db = JSON.parse(readFileSync(dbPath, 'utf8'));
db.taxonomy.tags = sorted;
writeFileSync(dbPath, JSON.stringify(db), 'utf8');

console.log(`synced ${sorted.length} tags →`, sorted.join(', '));
