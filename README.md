# Birthday Surprise App

A cute, mobile-first birthday wish web app designed for GitHub Pages and shared exclusively via a private QR code URL.

## Where to Put Her Photos

Drop her pictures directly into the [`her-photos/`](./her-photos/) folder:
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` (and `.heic` from iPhone)
- Tip: Name files in the order you'd like them to appear if you have a sequence in mind (e.g., `01-first-date.jpg`, `02-smile.png`), or just drop them in as-is!

## Optional Custom Stickers / GIFs

Built-in cute animated stickers will be included automatically. If you also have specific `.gif` or `.webp` stickers you love, you can drop them in [`her-stickers/`](./her-stickers/).

## Privacy Design

Raw photos in `her-photos/` and the generated secret key / QR files stay local (`.gitignore`d). During the build, photos and messages can be optimized for mobile and encrypted with AES-256-GCM so the deployed GitHub Pages bundle only unlocks when opened with the full QR code URL.
