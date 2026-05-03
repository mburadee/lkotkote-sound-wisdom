<div align="center">

<img src="docs/logo.png" alt="Lkotkote logo" width="140" />

# Lkotkote — Sound Wisdom

### *Bird sound identification powered by BirdNET, named after the Samburu word for the Eastern Yellow-billed Hornbill.*

[![Live App](https://img.shields.io/badge/Live%20App-lkotkote.org-2E7D5B?style=for-the-badge&logo=vercel&logoColor=white)](https://lkotkote.org)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-46E3B7?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

<br />

<img src="docs/screenshots/hero.png" alt="Lkotkote hero — savanna at golden hour with the tagline 'Named after the Samburu word for the Eastern Yellow-billed Hornbill'" width="900" />

</div>

---

**Lkotkote platform represents a new class of tools that bridge Indigenous knowledge systems with global biodiversity infrastructures.**

Lkotkote turns bird audio into ecological insight. Record or upload a clip, run it through the **BirdNET** acoustic model, plot detections on a timeline and map, capture **Traditional Ecological Knowledge (TEK)** annotations, and export in **Darwin Core** format for biodiversity research.

> 🔗 **Try it now:** **https://lkotkote.org**

---

## ✨ Highlights

- **Record or upload** — WAV, MP3, OGG, FLAC, or M4A (≤ 50 MB)
- **BirdNET-Analyzer** species detection with confidence scores
- **TEK annotations** — capture local names, behaviour, and cultural context
- **Darwin Core export** — CSV, GeoJSON/ ZIP bundle ready for GBIF.

---

## 🚀 1 · Quick Start (Simple, Step-by-Step)

### Use it (no install)
1. Open **https://lkotkote.org**
2. **Record** with your mic or **Upload** an audio file
3. Set your **location** (search, map click, or GPS)
4. Click **Analyze** — BirdNET identifies the species
5. Review on the **timeline**, add **TEK** notes, then **Export**

### Run it locally
```bash
git clone <YOUR_GITHUB_URL>
cd <YOUR_REPO_NAME>
npm install
npm run dev
```
Open **http://localhost:8080**.

> The `.env` file with backend keys is auto-managed by Vercel Cloud. For self-hosted builds, see [Environment Variables](#environment-variables).

---

## 🖼️ Screenshots

<table>
  <tr>
    <td align="center"><b>Landing</b><br /><img src="docs/screenshots/hero.png" alt="Landing page" width="420" /></td>
    <td align="center"><b>How It Works</b><br /><img src="docs/screenshots/how-it-works.png" alt="How It Works section showing the four-step workflow" width="420" /></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><b>Upload a Recording</b><br /><img src="docs/screenshots/upload.png" alt="Upload screen with drag-and-drop area and live recording option" width="700" /></td>
  </tr>
</table>

---

## 🧱 2 · Technical Details

### Architecture

| Layer | Technology |
|---|---|
| Frontend | React 18 · Vite 5 · TypeScript 5 |
| Styling | Tailwind CSS v3 · shadcn/ui (Radix) |
| State / Data | TanStack Query · React Hook Form + Zod |
| Audio | WaveSurfer.js · MediaRecorder API |
| Maps | Leaflet · React-Leaflet |
| Animation | Framer Motion |
| Backend | (Supabase: Postgres, Auth, Storage, Edge Functions) |
| ML inference | BirdNET via `supabase/functions/birdnet-analyze` (Deno edge function) |
| Export | Darwin Core CSV → ZIP via `jszip` + `file-saver` |
| Tests | Vitest · Testing Library · jsdom |

### Project structure
```
src/
├── components/         # HeroSection, AudioRecorder, AudioUpload,
│                       # SpeciesResults, DetectionTimeline, LocationMap,
│                       # TEKAnnotationModal, ExportPanel, Navbar, …
├── pages/              # Index.tsx (main flow), NotFound.tsx
├── lib/
│   ├── darwin-core-export.ts
│   └── utils.ts
├── integrations/supabase/      # Auto-generated client + types (do not edit)
├── hooks/              # use-toast, use-mobile
├── assets/             # logo, hero, hornbill imagery
└── index.css           # HSL semantic design tokens

supabase/
├── config.toml
└── functions/birdnet-analyze/  # Edge function calling BirdNET

docs/                    # README media (logo, screenshots)
public/                  # Static assets, logo, robots.txt
render.yaml              # Render Blueprint for static deploy
```

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (port 8080) |
| `npm run build` | Production build → `dist/` |
| `npm run build:dev` | Dev-mode build (sourcemaps) |
| `npm run preview` | Preview the built app |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |

### Environment variables

Required at **build time** (Vite inlines them):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Lovable Cloud project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon key (safe in client) |
| `VITE_SUPABASE_PROJECT_ID` | Project ref |

For self-hosted builds, copy them from Supabase settings into your hosting provider.

### Backend

- **Storage** — uploaded recordings stored in a private bucket
- **Edge function `birdnet-analyze`** — receives audio + lat/lon, runs BirdNET, returns `{ species, confidence, start, end }[]`
- **Database** — recordings, detections, and TEK annotations protected by Row-Level Security so users only see their own data

---

## 🧭 3 · How to Use the Application

1. **Visit Lktokote.org** (or continue as a guest, depending on the configured policy).
2. **Capture audio**
   - *Record* — press the mic, speak/listen, stop when done.
   - *Upload* — drag & drop a `.wav`, `.mp3`, `.flac`, `.ogg`, or `.m4a` file (≤ 50 MB).
3. **Set location** — required for BirdNET's geographic species filter.
4. **Analyze** — the edge function runs BirdNET on your clip.
5. **Review results**
   - Species list with confidence scores
   - Click a row to jump the waveform to that detection
   - Timeline view shows detections over time
6. **Annotate (TEK)** — local name, cultural notes, behaviour observations.
7. **Export** — Darwin Core, GeoJSON, CSV (single file) or ZIP bundle (media + metadata) for GBIF / eBird-style platforms.

---

## ☁️ 4 · Deployment

### Option A — Render (static site via Blueprint)
A ready-to-use `render.yaml` is included at the repo root.

1. Push this repo to GitHub (Lovable: top-right → **GitHub → Connect**).
2. In Render: **New + → Blueprint** → select your repo.
3. When prompted, fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
4. Render runs:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. SPA routing (`/* → /index.html`) and security/cache headers are pre-configured in `render.yaml`.

### Option B — Any static host (Netlify, Vercel, Cloudflare Pages, S3 + CloudFront)
1. `npm install && npm run build`
2. Upload the contents of `dist/` to your host.
3. Configure a SPA fallback so unknown paths serve `/index.html`.
4. Set the three `VITE_SUPABASE_*` env vars in your host's build settings.

>** Note that for fast deployment Vercel is recommended: Just connect your repo and it auto-detects Vite (npm run build + dist)**

---

## 🛠️ 5 · Troubleshooting

| Problem | Fix |
|---|---|
| Blank page after deploy | Verify the three `VITE_SUPABASE_*` env vars are set in your host. |
| 404 on page refresh | Ensure SPA rewrite `/* → /index.html` is configured. |
| `bun: command not found` on Render | Already handled — `render.yaml` uses `npm`. |
| BirdNET returns no detections | Audio should be ≥ 3 s, contain bird calls, and have a location set. |
| CORS errors | Add your deployed URL to allowed origins in Lovable Cloud settings. |

---

## 🐦 6 · Setting up BirdNET-Analyzer on Hugging Face Spaces

Lkotkote's `birdnet-analyze` edge function calls a public BirdNET REST endpoint via the `BIRDNET_SERVER_URL` secret. The simplest way to host this endpoint for free is a **Hugging Face Space** running BirdNET in Docker.

A working reference Space lives here: **https://huggingface.co/spaces/deembura/BirdNET-Analyzer/tree/main** — the three files below are copied from it.

### 6.1 Create the Space
1. Sign in at **https://huggingface.co**.
2. Click **New → Space**.
3. Pick a name (e.g. `BirdNET-Analyzer`), set **SDK = Docker**, visibility **Public**, hardware **CPU basic (free)**.
4. Click **Create Space** — you now have an empty Docker Space repo.

### 6.2 Add `README.md` (Space metadata)
Hugging Face needs a YAML front-matter block so it knows which port to expose:

```yaml
---
title: BirdNET Analyzer
emoji: 🐦
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

BirdNET-Analyzer REST API server.
```

### 6.3 Add the `Dockerfile`
Installs ffmpeg + the BirdNET Analyzer Python package and launches a FastAPI server on port 7860:

```dockerfile
FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# System deps for audio decoding + TFLite runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg libsndfile1 libgomp1 curl \
    && rm -rf /var/lib/apt/lists/*

# HF Spaces requires a non-root user
RUN useradd -m -u 1000 user
USER user
WORKDIR /home/user/app

# Python deps
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
        "birdnet-analyzer" fastapi "uvicorn[standard]" python-multipart

COPY --chown=user:user app.py /home/user/app/app.py
RUN mkdir -p /home/user/app/uploads /home/user/app/output

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

### 6.4 Add `app.py` (FastAPI wrapper around BirdNET)
Exposes `GET /health` and `POST /analyze` (multipart `file` + optional `lat`, `lon`, `week`, `min_conf`, `sensitivity`, `overlap`). It runs `python -m birdnet_analyzer.analyze`, parses the CSV output and returns JSON:

```python
import csv, shutil, subprocess, uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="BirdNET Analyzer REST", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

BASE_DIR = Path("/home/user/app")
UPLOAD_DIR = BASE_DIR / "uploads"; UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR = BASE_DIR / "output";  OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/")
def root():
    return {"status": "ok", "message": "POST audio to /analyze"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    lat: Optional[str] = Form(None),
    lon: Optional[str] = Form(None),
    week: Optional[str] = Form(None),
    min_conf: Optional[str] = Form(None),
):
    job_id = uuid.uuid4().hex
    job_in = UPLOAD_DIR / job_id; job_in.mkdir(parents=True, exist_ok=True)
    job_out = OUTPUT_DIR / job_id; job_out.mkdir(parents=True, exist_ok=True)

    audio_path = job_in / (file.filename or "audio.wav")
    with audio_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    cmd = ["python", "-m", "birdnet_analyzer.analyze", str(audio_path),
           "--output", str(job_out), "--rtype", "csv",
           "--lat", str(lat or -1), "--lon", str(lon or -1),
           "--week", str(week or -1), "--min_conf", str(min_conf or 0.1),
           "--threads", "2"]

    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if proc.returncode != 0:
        return JSONResponse(status_code=500,
            content={"status": "error", "stderr": proc.stderr[-2000:]})

    detections = []
    for csv_path in sorted(job_out.glob("**/*.csv")):
        with csv_path.open("r", encoding="utf-8", errors="replace") as fh:
            for row in csv.DictReader(fh):
                try:
                    detections.append({
                        "start": float(row.get("Start (s)") or 0),
                        "end":   float(row.get("End (s)") or 0),
                        "scientific_name": row.get("Scientific name", "Unknown"),
                        "common_name":     row.get("Common name", "Unknown"),
                        "confidence":      float(row.get("Confidence") or 0),
                    })
                except ValueError:
                    continue

    shutil.rmtree(job_in, ignore_errors=True)
    shutil.rmtree(job_out, ignore_errors=True)
    return {"status": "ok", "count": len(detections), "detections": detections}
```

> The full reference `app.py` (with extra params like `sensitivity` / `overlap` and richer error handling) is in the [reference Space](https://huggingface.co/spaces/deembura/BirdNET-Analyzer/blob/main/app.py).

### 6.5 Push the three files
Either use the Space's web UI (**Files → + Add file → Upload**) or git:

```bash
git clone https://huggingface.co/spaces/<your-username>/BirdNET-Analyzer
cd BirdNET-Analyzer
# add README.md, Dockerfile, app.py
git add . && git commit -m "Initial BirdNET REST API"
git push
```

The Space rebuilds automatically (~5–8 min). When the build log shows `Application startup complete`, test it:

```bash
curl https://<your-username>-birdnet-analyzer.hf.space/health
# → {"status":"ok"}
```

### 6.6 Wire it into Lkotkote
Copy your Space's public URL (e.g. `https://<your-username>-birdnet-analyzer.hf.space`) and set it as the `BIRDNET_SERVER_URL` secret in **Lovable Cloud → Project Settings → Secrets**. The `birdnet-analyze` edge function will pick it up automatically — no redeploy needed.

---

## 🗄️ 7 · Setting up Supabase manually (only for self-hosted forks)

If you're using **Lovable Cloud**, the backend is already provisioned and the `VITE_SUPABASE_*` variables are auto-injected — **skip this section**. Follow these steps only if you're forking Lkotkote and want to run it against your own standalone Supabase project.

### 7.1 Create the project
1. Sign in at **https://supabase.com**.
2. Click **New project**, pick an organization, set a name (e.g. `lkotkote`), choose a strong database password, and select the region closest to your users.
3. Wait ~2 minutes for provisioning.

### 7.2 Grab the three frontend env vars
In the Supabase dashboard, open **Project Settings → API**:

| Lkotkote variable | Where to find it in Supabase |
|---|---|
| `VITE_SUPABASE_URL` | **Project URL** (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Project API keys → `anon` `public`** |
| `VITE_SUPABASE_PROJECT_ID` | The `xxxx` subdomain in the Project URL (also shown as **Reference ID** under **Settings → General**) |

Add them to a local `.env` file (for `npm run dev`) **and** to your hosting provider's env vars (Render / Vercel / Netlify) for production builds.

### 7.3 Apply the database schema
The schema lives in `supabase/migrations/` in this repo. Apply it with the Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-id>
supabase db push
```

This creates the `recordings`, `detections`, and `tek_annotations` tables along with their Row-Level Security policies.

### 7.4 Deploy the edge function
```bash
supabase functions deploy birdnet-analyze
```

Then set the BirdNET endpoint as a function secret (from section 6):

```bash
supabase secrets set BIRDNET_SERVER_URL=https://<your-username>-birdnet-analyzer.hf.space
```

### 7.5 Configure Auth
In **Authentication → Providers**:
- Enable **Email** (turn on "Confirm email" for production).
- Enable **Google** and paste your Google OAuth client ID + secret (create them at **https://console.cloud.google.com → APIs & Services → Credentials**, redirect URI = `https://<your-project-id>.supabase.co/auth/v1/callback`).

In **Authentication → URL Configuration**, set **Site URL** to your deployed frontend URL and add it under **Redirect URLs**.

### 7.6 Create the storage bucket
**Storage → New bucket** → name `recordings`, **Private**. The migrations include RLS policies that let authenticated users read/write only their own files.

### 7.7 Verify
```bash
npm run dev
```
Sign up, upload a clip, run analysis — if detections come back, every layer (Auth, DB, Storage, Edge Function, BirdNET Space) is wired correctly.

---

## 🤝 8 · Contributing

1. Create a feature branch.
2. Run `npm run lint && npm test` before pushing.
3. Open a PR — Lovable's GitHub integration syncs changes back to the editor automatically.

---

## 📜 License
MIT License
Copyright (c) 2026 mburadee

<br />

<div align="center">

<img src="docs/logo.png" alt="Lkotkote" width="60" />

**Lkotkote — listening to the land, with the people who know it best.**

</div>
