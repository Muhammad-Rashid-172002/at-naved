// Downloads every photo in src/config/images.ts from Unsplash into public/images/food/photos
// and records them in src/config/photo-manifest.json, so the site serves them from your own domain
// (Next.js then optimises them to AVIF/WebP per device). Safe to re-run; skips files that exist.
// Usage: npm run images:localize        (add --force to re-download)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const config = readFileSync(new URL("src/config/images.ts", root), "utf8");
const entries = [...config.matchAll(/^\s+"?([\w-]+)"?: \{ id: "(photo-[\w-]+)"/gm)].map((m) => ({ key: m[1], id: m[2] }));
const outDir = new URL("public/images/food/photos/", root);
mkdirSync(outDir, { recursive: true });
const force = process.argv.includes("--force");
const manifest = {};
let ok = 0;
for (const { key, id } of entries) {
  const file = new URL(`${key}.jpg`, outDir);
  if (existsSync(file) && !force) {
    manifest[key] = `/images/food/photos/${key}.jpg`;
    ok++;
    continue;
  }
  const url = `https://images.unsplash.com/${id}?fm=jpg&q=82&w=1800&fit=max`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    manifest[key] = `/images/food/photos/${key}.jpg`;
    ok++;
    console.log(`✓ ${key}`);
  } catch (e) {
    console.warn(`✗ ${key} (${id}): ${e.message} — will keep using the Unsplash CDN`);
  }
}
writeFileSync(new URL("src/config/photo-manifest.json", root), JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${ok}/${entries.length} photos stored locally. Manifest updated.`);
