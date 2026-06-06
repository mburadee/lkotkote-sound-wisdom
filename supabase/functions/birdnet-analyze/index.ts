const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50MB

interface BirdNetSegment {
  start: number;
  end: number;
  common_name?: string;
  scientific_name?: string;
  confidence: number;
}

interface NormalizedDetection {
  id: string;
  species: string;
  commonName: string;
  confidence: number;
  startTime: number;
  endTime: number;
}

// Clamp a numeric form value within [min, max], falling back to a default.
function clampNumber(
  value: FormDataEntryValue | null,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = parseFloat(value?.toString() ?? "");
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const BIRDNET_SERVER_URL = Deno.env.get("BIRDNET_SERVER_URL");
    if (!BIRDNET_SERVER_URL) {
      console.error("BIRDNET_SERVER_URL is not configured");
      return new Response(
        JSON.stringify({ error: "Service is temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const inboundForm = await req.formData();
    const audio = inboundForm.get("audio");
    if (!(audio instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Missing 'audio' file in form data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- Server-side input validation ---
    if (audio.size === 0) {
      return new Response(
        JSON.stringify({ error: "Uploaded audio file is empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return new Response(
        JSON.stringify({ error: "Audio file exceeds the 50MB limit." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const audioType = (audio.type || "").toLowerCase();
    if (audioType && !audioType.startsWith("audio/")) {
      return new Response(
        JSON.stringify({ error: "Uploaded file must be an audio file." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const lat = clampNumber(inboundForm.get("lat"), -90, 90, -1).toString();
    const lon = clampNumber(inboundForm.get("lon"), -180, 180, -1).toString();
    const week = Math.round(clampNumber(inboundForm.get("week"), -1, 52, -1)).toString();
    const minConf = clampNumber(inboundForm.get("min_conf"), 0, 1, 0.1).toString();

    const upstreamForm = new FormData();
    upstreamForm.append("file", audio, audio.name);
    upstreamForm.append("lat", lat);
    upstreamForm.append("lon", lon);
    upstreamForm.append("week", week);
    upstreamForm.append("min_conf", minConf);
    upstreamForm.append("sensitivity", "1.0");
    upstreamForm.append("overlap", "0.0");

    let base = BIRDNET_SERVER_URL.replace(/\/$/, "");
    if (!/^https?:\/\//i.test(base)) base = `https://${base}`;

    const upstreamRes = await fetch(`${base}/analyze`, {
      method: "POST",
      body: upstreamForm,
    });

    const text = await upstreamRes.text();
    if (!upstreamRes.ok) {
      console.error("BirdNET upstream HTTP error", upstreamRes.status, text);
      return new Response(
        JSON.stringify({ error: "BirdNET analysis failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      console.error("BirdNET server returned non-JSON response");
      return new Response(
        JSON.stringify({ error: "BirdNET analysis failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const r = raw as Record<string, unknown>;

    // Surface upstream-reported processing errors (logged server-side only)
    if (r.status === "error") {
      console.error("BirdNET upstream processing error", r);
      return new Response(
        JSON.stringify({ error: "BirdNET analysis failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const detections: NormalizedDetection[] = [];
    const pushDetection = (seg: BirdNetSegment) => {
      detections.push({
        id: crypto.randomUUID(),
        species: seg.scientific_name ?? "Unknown",
        commonName: seg.common_name ?? seg.scientific_name ?? "Unknown",
        confidence: seg.confidence,
        startTime: seg.start,
        endTime: seg.end,
      });
    };

    // Preferred shape from our updated HF wrapper: { status, detections: [...] }
    if (Array.isArray(r.detections)) {
      (r.detections as BirdNetSegment[]).forEach(pushDetection);
    } else if (Array.isArray(r.results)) {
      (r.results as BirdNetSegment[]).forEach(pushDetection);
    } else if (r.results && typeof r.results === "object") {
      // Legacy shape: { results: { "0.0;3.0": [{...}] } }
      for (const [range, items] of Object.entries(r.results as Record<string, unknown>)) {
        const [startStr, endStr] = range.split(";");
        const start = parseFloat(startStr);
        const end = parseFloat(endStr);
        if (Array.isArray(items)) {
          for (const it of items as Array<Record<string, unknown>>) {
            pushDetection({
              start,
              end,
              common_name: it.common_name as string | undefined,
              scientific_name: it.scientific_name as string | undefined,
              confidence: Number(it.confidence ?? 0),
            });
          }
        }
      }
    } else if (Array.isArray(raw)) {
      (raw as BirdNetSegment[]).forEach(pushDetection);
    }

    // Sort by start time then confidence desc
    detections.sort((a, b) => a.startTime - b.startTime || b.confidence - a.confidence);

    return new Response(JSON.stringify({ detections }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("birdnet-analyze error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
