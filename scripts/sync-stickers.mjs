import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'stickers');
const destDir = path.join(rootDir, 'public', 'stickers');

async function main() {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && /\.(webp|gif|png|svg)$/i.test(e.name));

  // Remove stale stickers that are no longer in stickers/
  const existing = await fs.readdir(destDir);
  const validSet = new Set(files.map((f) => f.name));
  await Promise.all(
    existing
      .filter((name) => !validSet.has(name))
      .map((name) => fs.unlink(path.join(destDir, name))),
  );

  await Promise.all(
    files.map((f) => fs.copyFile(path.join(srcDir, f.name), path.join(destDir, f.name))),
  );
  console.log(`Synced ${files.length} stickers -> public/stickers/`);
}

main().catch((err) => {
  console.error('Failed to sync stickers:', err);
  process.exit(1);
});

