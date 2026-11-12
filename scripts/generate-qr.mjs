import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const secretPath = path.join(rootDir, '.env.secret');
const outDir = path.join(rootDir, 'qr-output');

function parseArgUrl() {
  const idx = process.argv.indexOf('--url');
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1].trim();
  }
  return '';
}

async function readSecretEnv() {
  const raw = await fs.readFile(secretPath, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function buildCardHtml(svgMarkup, fullUrl) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Birthday QR Surprise Card</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #fff1f5;
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        color: #4a2535;
        padding: 24px;
      }
      .card {
        width: 100%;
        max-width: 390px;
        background: #ffffff;
        border: 3px solid #fbcfe8;
        border-radius: 28px;
        padding: 28px 24px;
        text-align: center;
        box-shadow: 0 20px 45px rgba(219, 39, 119, 0.14);
      }
      .badge {
        display: inline-block;
        background: #ffe4e6;
        color: #be123c;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 6px 14px;
        border-radius: 999px;
      }
      h1 {
        margin: 14px 0 8px;
        font-size: 24px;
        color: #881337;
      }
      p {
        margin: 0 0 20px;
        font-size: 14px;
        line-height: 1.5;
        color: #7f495f;
      }
      .qr-box {
        background: #fffafb;
        border: 2px dashed #f9a8d4;
        border-radius: 22px;
        padding: 16px;
        display: inline-block;
      }
      .qr-box svg {
        width: 240px;
        height: 240px;
        display: block;
      }
      .footer {
        margin-top: 18px;
        font-size: 12px;
        color: #9d687f;
      }
      @media print {
        body { background: #ffffff; padding: 0; }
        .card { box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="badge">Private Birthday Surprise</div>
      <h1>Scan With Your Camera 💌</h1>
      <p>A little secret birthday gift made just for you. Only this special QR link can unlock it!</p>
      <div class="qr-box">${svgMarkup}</div>
      <div class="footer">Tip: Print or screenshot this card ✨</div>
      <!-- Full URL: ${fullUrl.replace(/--/g, '')} -->
    </main>
  </body>
</html>
`;
}

async function main() {
  const env = await readSecretEnv();
  if (!env.VAULT_KEY) {
    throw new Error('VAULT_KEY missing in .env.secret. Run `npm run prepare-vault` first.');
  }

  let baseUrl = parseArgUrl() || env.GITHUB_PAGES_URL || 'http://localhost:5173/';
  const hashIndex = baseUrl.indexOf('#');
  if (hashIndex !== -1) baseUrl = baseUrl.slice(0, hashIndex);
  if (!baseUrl.endsWith('/')) baseUrl += '/';

  // Persist GITHUB_PAGES_URL if user passed a deployed URL
  if (parseArgUrl()) {
    await fs.writeFile(
      secretPath,
      `VAULT_KEY=${env.VAULT_KEY}\nGITHUB_PAGES_URL=${baseUrl}\n`,
      { mode: 0o600 },
    );
  }

  const fullUrl = `${baseUrl}#${env.VAULT_KEY}`;
  await fs.mkdir(outDir, { recursive: true });

  const qrOptions = {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 1024,
    color: {
      dark: '#5b1933',
      light: '#fffafb',
    },
  };

  await QRCode.toFile(path.join(outDir, 'birthday-qr.png'), fullUrl, qrOptions);
  const svgMarkup = await QRCode.toString(fullUrl, { ...qrOptions, type: 'svg' });
  await fs.writeFile(path.join(outDir, 'birthday-qr.svg'), svgMarkup, 'utf8');
  await fs.writeFile(path.join(outDir, 'printable-card.html'), buildCardHtml(svgMarkup, fullUrl), 'utf8');

  console.log('Generated QR code files in qr-output/:');
  console.log('  - qr-output/birthday-qr.png');
  console.log('  - qr-output/birthday-qr.svg');
  console.log('  - qr-output/printable-card.html');
  console.log(`Target secret URL: ${fullUrl}`);
}

main().catch((err) => {
  console.error('Failed to generate QR code:', err.message);
  process.exit(1);
});

