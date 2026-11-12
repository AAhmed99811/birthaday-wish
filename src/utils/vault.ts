import type { BirthdayPayload, PhotoManifestItem } from '../types/birthday';

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const clean = base64Url.trim();
  const base64 = clean.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padding);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importVaultKey(hashSecret: string): Promise<CryptoKey> {
  const keyBytes = base64UrlToUint8Array(hashSecret);
  if (keyBytes.length !== 32) {
    throw new Error('Invalid key length');
  }
  return window.crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );
}

async function fetchAndDecrypt(relativeVaultPath: string, key: CryptoKey): Promise<ArrayBuffer> {
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const response = await fetch(`${normalizedBase}vault/${relativeVaultPath}`, {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch vault asset: ${relativeVaultPath}`);
  }
  const encryptedBuffer = await response.arrayBuffer();
  if (encryptedBuffer.byteLength < 28) {
    throw new Error('Corrupt vault payload');
  }
  const iv = encryptedBuffer.slice(0, 12);
  const ciphertext = encryptedBuffer.slice(12);
  return window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
}

export async function unlockBirthdayVault(hashSecret: string): Promise<{
  payload: BirthdayPayload;
  cryptoKey: CryptoKey;
}> {
  const cryptoKey = await importVaultKey(hashSecret);
  const metaPlain = await fetchAndDecrypt('meta.enc', cryptoKey);
  const jsonText = new TextDecoder().decode(metaPlain);
  const payload = JSON.parse(jsonText) as BirthdayPayload;
  return { payload, cryptoKey };
}

export async function decryptPhotosInBatches(
  items: PhotoManifestItem[],
  cryptoKey: CryptoKey,
  onPhotoDecrypted: (id: string, blobUrl: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const BATCH_SIZE = 4;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    if (signal?.aborted) return;
    const batch = items.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (item) => {
        if (signal?.aborted) return;
        const plainBuffer = await fetchAndDecrypt(item.vaultFile, cryptoKey);
        if (signal?.aborted) return;
        const blob = new Blob([plainBuffer], { type: 'image/webp' });
        const objectUrl = URL.createObjectURL(blob);
        onPhotoDecrypted(item.id, objectUrl);
      }),
    );
  }
}

export function getStickerUrl(filename: string): string {
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}stickers/${filename}`;
}

