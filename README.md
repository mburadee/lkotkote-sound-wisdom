# Lkotkote — Sound Wisdom

> Bird sound identification powered by BirdNET, named after the Samburu word for the Eastern Yellow-billed Hornbill.

Lkotkote lets you record or upload bird audio, runs it through the BirdNET acoustic model, plots detections on an interactive timeline and map, captures Traditional Ecological Knowledge (TEK) annotations, and exports results in Darwin Core format for biodiversity research.

🔗 **Live app:** https://lkotkote-sound-wisdom.lovable.app

---

## 1. Quick Start — Simple Step-by-Step

### Use the app (no install)
1. Open the live app: https://lkotkote-sound-wisdom.lovable.app
2. **Record** audio with your microphone, or **Upload** a `.wav` / `.mp3` file.
3. Add a **location** (search, click the map, or use your GPS).
4. Click **Analyze** — BirdNET will identify the species in the recording.
5. Review detections on the **timeline**, add **TEK annotations**, then **Export** as Darwin Core CSV/ZIP.

### Run it locally
```bash
# 1. Clone the repo
git clone <YOUR_GITHUB_URL>
cd <YOUR_REPO_NAME>

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```
Then open http://localhost:8080.

> The `.env` file with backend keys is auto-managed by Lovable Cloud. If self-hosting, see **Environment Variables** below.

---

## 2. Technical Details

### Architecture
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix primitives) |
| State / Data | TanStack Query, React Hook Form + Zod |
| Audio | WaveSurfer.js (waveform), MediaRecorder API |
| Maps | Leaflet + React-Leaflet |
| Animation | Framer Motion |
| Backend | Lovable Cloud (Supabase: Postgres, Auth, Storage, Edge Functions) |
| ML inference | BirdNET via `supabase/functions/birdnet-analyze` (Deno edge function) |
| Export | Darwin Core CSV bundled into ZIP via `jszip` + `file-saver` |
| Tests | Vitest + Testing Library + jsdom |

### Project structure
```
src/
├── components/         # UI: HeroSection, AudioRecorder, AudioUpload,
│                       # SpeciesResults, DetectionTimeline, LocationMap,
│                       # TEKAnnotationModal, ExportPanel, Navbar, …
├── pages/              # Index.tsx (main flow), NotFound.tsx
├── lib/
│   ├── darwin-core-export.ts   # Biodiversity data export
│   └── utils.ts
├── integrations/supabase/      # Auto-generated client + types (do not edit)
├── hooks/              # use-toast, use-mobile
├── assets/             # logo, images
└── index.css           # Design tokens (HSL semantic colors)

supabase/
├── config.toml
└── functions/birdnet-analyze/  # Edge function calling BirdNET

public/                  # Static assets, logo, robots.txt
render.yaml              # Render Blueprint for static deploy
```

### Available scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run build:dev` | Dev-mode build (sourcemaps) |
| `npm run preview` | Preview the built app |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |

### Environment variables
Required at **build time** (Vite inlines them):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

For Lovable users these are auto-provisioned via Lovable Cloud. For self-hosted builds, copy them from your Lovable Cloud settings into your hosting provider's env config.

### Backend (Lovable Cloud / Supabase)
- **Auth:** email + password and Google OAuth.
- **Storage:** uploaded recordings stored in a private bucket.
- **Edge function `birdnet-analyze`:** receives an audio file reference + lat/lon, runs BirdNET, returns `{ species, confidence, start, end }[]`.
- **Database:** stores recordings, detections, and TEK annotations with Row-Level Security so users only see their own data.

---

## 3. How to Use the Application

1. **Sign in** (or continue as guest, depending on configured policy).
2. **Capture audio**
   - *Record:* press the mic button, stop when done.
   - *Upload:* drag & drop a `.wav`, `.mp3`, or `.flac` file.
3. **Set location** — required for BirdNET's geographic species filter.
4. **Analyze** — the edge function runs BirdNET on your clip.
5. **Review results**
   - Species list with confidence scores.
   - Click a row to jump the waveform to that detection.
   - Timeline view shows detections over time.
6. **Annotate (TEK)** — add Traditional Ecological Knowledge: local name, cultural notes, behavior observations.
7. **Export** — download Darwin Core-compliant CSV (single occurrence file or ZIP bundle with media + metadata) for upload to GBIF/eBird-style platforms.

---

## 4. Deployment

### Option A — Lovable (recommended, one click)
1. In the Lovable editor, click **Publish** (top-right).
2. Your app is live at `https://<your-project>.lovable.app`.
3. Connect a custom domain in **Project Settings → Domains**.

Frontend changes require clicking **Update** in the publish dialog. Backend changes (edge functions, migrations) deploy automatically.

### Option B — Render (static site via Blueprint)
A ready-to-use `render.yaml` is included at the repo root.

1. Push this repo to GitHub (Lovable: top-right → **GitHub → Connect**).
2. In Render: **New + → Blueprint** → select your repo.
3. When prompted, fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
4. Render will run:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. SPA routing (`/* → /index.html`) and security/cache headers are pre-configured in `render.yaml`.

### Option C — Any static host (Netlify, Vercel, Cloudflare Pages, S3+CloudFront)
1. `npm install && npm run build`
2. Upload the contents of `dist/` to your host.
3. Configure a SPA fallback so unknown paths serve `/index.html`.
4. Set the three `VITE_SUPABASE_*` env vars in your host's build settings.

> The Lovable Cloud backend (database, storage, edge functions) keeps running regardless of where the frontend is hosted — you only need to redeploy the frontend.

---

## 5. Troubleshooting

| Problem | Fix |
|---|---|
| Blank page after deploy | Verify the three `VITE_SUPABASE_*` env vars are set in your host. |
| 404 on page refresh | Ensure SPA rewrite `/* → /index.html` is configured. |
| `bun: command not found` on Render | Already handled — `render.yaml` uses `npm`. |
| BirdNET returns no detections | Check audio is ≥3 s, contains bird calls, and location is set. |
| CORS errors | Add your deployed URL to allowed origins in Lovable Cloud settings. |

---

## 6. Contributing

1. Create a feature branch.
2. Run `npm run lint && npm test` before pushing.
3. Open a PR — Lovable's GitHub integration syncs changes back to the editor automatically.

---

## License

MIT — see `LICENSE` (add one if distributing).
