const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const BIRDNET_SERVER_URL = Deno.env.get("BIRDNET_SERVER_URL");
    if (!BIRDNET_SERVER_URL) {
      return new Response(
        JSON.stringify({ error: "BIRDNET_SERVER_URL is not configured" }),
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

    const lat = inboundForm.get("lat")?.toString() ?? "-1";
    const lon = inboundForm.get("lon")?.toString() ?? "-1";
    const week = inboundForm.get("week")?.toString() ?? "-1";
    const minConf = inboundForm.get("min_conf")?.toString() ?? "0.1";

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
        JSON.stringify({
          error: `BirdNET server returned ${upstreamRes.status}`,
          details: text.slice(0, 500),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: "BirdNET server returned non-JSON response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const r = raw as Record<string, unknown>;

    // Surface upstream-reported processing errors
    if (r.status === "error") {
      console.error("BirdNET upstream processing error", r);
      return new Response(
        JSON.stringify({
          error: "BirdNET processing failed on the server",
          details: typeof r.message === "string"
            ? r.message
            : typeof r.stderr === "string"
              ? r.stderr
              : JSON.stringify(r).slice(0, 500),
        }),
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
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
