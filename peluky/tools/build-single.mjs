// Inline peluky/index.html + its CSS/JS into one self-contained page fragment
// (no <html>/<head>/<body> wrapper), for hosts that wrap the page themselves.
// Usage: node peluky/tools/build-single.mjs <out.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || join(root, 'peluky-single.html');
const src = readFileSync(join(root, 'index.html'), 'utf8');
const read = (p) => readFileSync(join(root, p), 'utf8');

const head = src.slice(src.indexOf('<head>') + 6, src.indexOf('</head>'));
const body = src.slice(src.indexOf('<body>') + 6, src.indexOf('</body>'));
const keepHead = head
  .split('\n')
  .filter((l) => /<title>|claude:viewport|description|fonts\.(googleapis|gstatic)/.test(l))
  .join('\n');
const css = [...head.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">/g)].map((m) => read(m[1])).join('\n');
const html = body.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, p) => `<script>\n${read(p)}\n</script>`);

writeFileSync(out, `${keepHead}\n<style>\n${css}\n</style>\n${html}`);
console.log(`wrote ${out}`);
