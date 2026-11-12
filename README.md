# Birthday Surprise App

A cute, mobile-first birthday wish web app designed for **GitHub Pages** and shared exclusively via a private **QR code URL**.

## How Privacy Works

- Her raw pictures in [`her-photos/`](./her-photos/) and your personal text in `content/birthday.config.json` are `.gitignore`d so they stay on your machine.
- `npm run prepare-vault` optimizes her photos into mobile WebPs and encrypts both the images and your messages with **AES-256-GCM** into `public/vault/`.
- Only the encrypted `.enc` blobs are deployed to GitHub Pages.
- The 256-bit decryption key lives strictly inside the URL hash fragment (`#<key>`) of your QR code URL (and locally in `.env.secret`). Visiting the base URL without the QR code shows only a locked *"Sealed With Love"* screen.

## Quick Commands

1. **Customize names, messages, and letter** (optional):
   Edit `content/birthday.config.json` (template at [`content/birthday.example.json`](./content/birthday.example.json)).

2. **Optimize photos & build encrypted vault**:
   ```bash
   npm run prepare-vault
   ```

3. **Preview locally**:
   ```bash
   npm run dev
   ```
   Open the local URL printed by `prepare-vault` (`http://localhost:5173/#<key>`).

4. **Generate your QR code & printable card**:
   ```bash
   npm run generate-qr -- --url "https://<your-github-username>.github.io/<repo-name>/"
   ```
   Outputs:
   - `qr-output/birthday-qr.png`
   - `qr-output/birthday-qr.svg`
   - `qr-output/printable-card.html`

## Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `birthday-wish`).
2. Push this repo:
   ```bash
   git remote add origin https://github.com/<your-github-username>/<repo-name>.git
   git push -u origin main
   ```
3. In GitHub repo **Settings → Pages → Source**, choose **GitHub Actions**.
4. Once deployed, run `npm run generate-qr -- --url "https://<your-github-username>.github.io/<repo-name>/"` and scan `qr-output/birthday-qr.png`!
