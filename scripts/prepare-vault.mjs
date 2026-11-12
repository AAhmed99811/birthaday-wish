import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const photosDir = path.join(rootDir, 'her-photos');
const vaultDir = path.join(rootDir, 'public', 'vault');
const vaultPhotosDir = path.join(vaultDir, 'photos');
const secretPath = path.join(rootDir, '.env.secret');

const PHOTO_STICKERS = [
  'bubu-love.webp',
  'peach-goma-love.webp',
  'milk-mocha-heart-bear.webp',
  'bubu-dudu-kiss.webp',
  'peach-goma-cuddle.webp',
  'cute-i-love-you.webp',
  'bubu-dudu-back-hug.webp',
  'peach-goma-kiss.webp',
  'bubu-dudu-playful-love.webp',
  'milk-mocha-love.webp',
  'bubu-cute.webp',
  'bubu-i-love-you.webp',
];

const ACCENT_STICKERS = [
  'emoji-sparkling-heart.webp',
  'floating-love-heart.webp',
  'emoji-kiss.webp',
  'emoji-heart-face.webp',
  'emoji-ribbon-heart.webp',
  'emoji-party.webp',
];

const TAPE_COLORS = ['rose', 'peach', 'lavender', 'mint', 'cream'];
const TILTS = [-2.5, 2.2, -1.8, 2.8, -2.1, 1.5];

function encryptBuffer(plainBuffer, keyBytes) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes, iv);
  const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]);
}

async function readOrCreateSecret(rotateKey) {
  let existingEnv = {};
  try {
    const raw = await fs.readFile(secretPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        existingEnv[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
      }
    }
  } catch {
    // No existing secret file yet
  }

  let keyString = existingEnv.VAULT_KEY;
  if (!keyString || rotateKey) {
    keyString = crypto.randomBytes(32).toString('base64url');
  }
  const keyBytes = Buffer.from(keyString, 'base64url');
  if (keyBytes.length !== 32) {
    throw new Error('VAULT_KEY in .env.secret must decode to 32 bytes');
  }

  const lines = [`VAULT_KEY=${keyString}`];
  if (existingEnv.GITHUB_PAGES_URL) {
    lines.push(`GITHUB_PAGES_URL=${existingEnv.GITHUB_PAGES_URL}`);
  }
  await fs.writeFile(secretPath, `${lines.join('\n')}\n`, { mode: 0o600 });

  return { keyString, keyBytes };
}

async function loadConfig() {
  const customPath = path.join(rootDir, 'content', 'birthday.config.json');
  const fallbackPath = path.join(rootDir, 'content', 'birthday.example.json');
  try {
    return JSON.parse(await fs.readFile(customPath, 'utf8'));
  } catch {
    return JSON.parse(await fs.readFile(fallbackPath, 'utf8'));
  }
}

async function main() {
  const rotateKey = process.argv.includes('--rotate-key');
  const { keyString, keyBytes } = await readOrCreateSecret(rotateKey);
  const config = await loadConfig();

  // Clear old encrypted photo blobs before writing fresh ones
  await fs.rm(vaultPhotosDir, { recursive: true, force: true });
  await fs.mkdir(vaultPhotosDir, { recursive: true });

  const entries = await fs.readdir(photosDir, { withFileTypes: true });
  const imageFiles = entries
    .filter((e) => e.isFile() && /\.(jpe?g|png|webp|gif|heic|avif)$/i.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  let rawTotalBytes = 0;
  let encTotalBytes = 0;
  const items = [];

  for (let i = 0; i < imageFiles.length; i += 1) {
    const filename = imageFiles[i];
    const fullPath = path.join(photosDir, filename);
    const stat = await fs.stat(fullPath);
    rawTotalBytes += stat.size;

    const { data, info } = await sharp(fullPath)
      .rotate()
      .resize(840, 1320, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    const paddedIndex = String(i).padStart(2, '0');
    const vaultFile = `photos/${paddedIndex}.enc`;
    const encryptedPhoto = encryptBuffer(data, keyBytes);
    encTotalBytes += encryptedPhoto.length;
    await fs.writeFile(path.join(vaultDir, vaultFile), encryptedPhoto);

    const customCaption = config.memories?.photoCaptions?.[filename];
    const defaults = config.memories?.defaultCaptions ?? ['My favorite smile 💕'];
    const caption = customCaption || defaults[i % defaults.length];

    items.push({
      id: `photo-${paddedIndex}`,
      vaultFile,
      caption,
      sticker: PHOTO_STICKERS[i % PHOTO_STICKERS.length],
      accentSticker: ACCENT_STICKERS[i % ACCENT_STICKERS.length],
      tilt: TILTS[i % TILTS.length],
      tapeColor: TAPE_COLORS[i % TAPE_COLORS.length],
      width: info.width,
      height: info.height,
    });
  }

  const payload = {
    herName: config.herName,
    senderName: config.senderName,
    theme: config.theme ?? 'blush',
    optionalPin: config.optionalPin ?? '',
    envelope: config.envelope,
    cake: config.cake,
    notes: config.notes,
    memories: {
      title: config.memories?.title ?? 'My Favorite View',
      subtitle: config.memories?.subtitle ?? 'Tap any Polaroid to zoom in',
      items,
    },
    letter: config.letter,
  };

  const metaEncrypted = encryptBuffer(Buffer.from(JSON.stringify(payload), 'utf8'), keyBytes);
  encTotalBytes += metaEncrypted.length;
  await fs.writeFile(path.join(vaultDir, 'meta.enc'), metaEncrypted);

  const rawMB = (rawTotalBytes / (1024 * 1024)).toFixed(2);
  const encMB = (encTotalBytes / (1024 * 1024)).toFixed(2);
  console.log(`Processed ${items.length} photos (${rawMB} MB raw -> ${encMB} MB encrypted WebP vault).`);
  console.log(`Vault written to public/vault/`);
  console.log(`Local test URL: http://localhost:5173/#${keyString}`);
}

main().catch((err) => {
  console.error('Failed to prepare encrypted vault:', err);
  process.exit(1);
});

