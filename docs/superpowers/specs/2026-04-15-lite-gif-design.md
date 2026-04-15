# Lite GIF — Design Spec
**Date:** 2026-04-15

## What We're Building

A browser-only web app called **Lite GIF** that compresses animated GIFs without damaging colors. Users drop a GIF, pick a compression level, see a live before/after preview, and download the result. No server. No install. Pure static files.

---

## Architecture

- **Stack:** Vite + vanilla JS (no framework)
- **Compression engine:** `gifsicle-wasm-browser` — gifsicle compiled to WebAssembly, runs entirely in the browser
- **Output:** Static build (`dist/`) — deployable to any static host (Netlify, Vercel, GitHub Pages, etc.)

---

## Compression Levels

"Compression %" = how aggressively to compress. Maps to gifsicle's `--lossy` parameter:

| Label | Lossy value | Effect |
|-------|-------------|--------|
| 25%   | 30          | Light — nearly lossless, minimal color impact |
| 50%   | 80          | Medium — good balance, colors mostly intact |
| 75%   | 130         | Strong — visible artifacts on complex gradients |
| 100%  | 200         | Max — smallest file, some dithering |

All levels also apply `--optimize=3` (frame deduplication — no color impact).

---

## UI Layout

Single page, dark theme.

1. **Header** — "Lite GIF" title + tagline
2. **Drop zone** — drag-and-drop or click-to-browse, accepts `.gif` files up to 50 MB
3. **Compression selector** — 4 pill buttons (25 / 50 / 75 / 100%). Selected level highlighted purple. Switching level re-runs compression immediately.
4. **Before / After panels** — side by side. Both play the animated GIF. Show file size (and % reduction on compressed side). Hidden until a file is loaded.
5. **Download button** — downloads compressed GIF. Hidden until compression is done.
6. **Progress state** — spinner/message while WASM is compressing.

---

## Data Flow

```
User drops GIF
  → FileReader reads as ArrayBuffer
  → Store original bytes + render original preview (Blob URL)
  → Run gifsicle-wasm with selected --lossy level
  → Store compressed bytes + render compressed preview (Blob URL)
  → Show size comparison
  → Download button triggers Blob download
```

When user switches compression level → re-run gifsicle on original bytes (not re-compressing already-compressed output).

---

## File Structure

```
compressGif/
├── index.html
├── src/
│   ├── main.js        — app entry, UI event wiring
│   ├── compress.js    — gifsicle-wasm wrapper
│   └── ui.js          — DOM helpers (preview render, size display)
├── style.css
├── package.json
└── vite.config.js
```

---

## Error Handling

- File > 50 MB → show inline error, reject file
- Non-GIF file → show inline error
- WASM compression failure → show error message, keep original available

---

## Verification

1. `npm run dev` — open localhost, drag in an animated GIF
2. Click each compression level — compressed preview updates, size decreases
3. Verify colors look correct at 25% and 50% levels
4. Download compressed file — open in browser, confirm it animates correctly
5. `npm run build` — `dist/` builds without errors
6. Open `dist/index.html` directly — works offline
