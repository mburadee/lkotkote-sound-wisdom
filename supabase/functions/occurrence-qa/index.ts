const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const json = (body: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, ...extra, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { taxonKey, speciesName, localName, question } = await req.json();
    const q = typeof question === "string" ? question.trim().slice(0, 600) : "";
    if (!Number.isInteger(taxonKey) || !q) return json({ error: "A species and a question are required." }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI service is not configured." }, 500);

    // Evidence is fetched server-side from GBIF so answers are grounded in the real records.
    const gbif = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${taxonKey}&hasCoordinate=true&hasGeospatialIssue=false&limit=300`);
    if (!gbif.ok) return json({ error: "Occurrence records are unavailable right now." }, 502);
    const data = await gbif.json();
    const records = (data.results ?? []).map((r: Record<string, unknown>) =>
      [r.key, r.eventDate ? String(r.eventDate).slice(0, 10) : r.year ?? "?", r.country ?? "?", r.stateProvince ?? "", r.locality ?? "",
        typeof r.decimalLatitude === "number" ? r.decimalLatitude.toFixed(2) : "", typeof r.decimalLongitude === "number" ? r.decimalLongitude.toFixed(2) : "",
        r.basisOfRecord ?? "", r.datasetName ?? r.institutionCode ?? ""].join(" | "));

    const instructions = `You help Indigenous community members understand GBIF occurrence records for one bird species. Answer ONLY from the records provided. Be concise (under 200 words), plain language. Cite supporting records as [GBIF <key>]. State clearly when the records cannot answer the question, and remind that records show observed presence, not complete habitat or abundance. Respect the community's knowledge; do not contradict Traditional Ecological Knowledge, only describe what the records show.`;
    const input = `Species: ${String(speciesName ?? "").slice(0, 120)}${localName ? ` (local name: ${String(localName).slice(0, 80)})` : ""}
Total georeferenced GBIF records: ${data.count}. Sample of ${records.length} most recent indexed records below.
Format: key | date | country | region | locality | lat | lng | basis | dataset
${records.join("\n")}

Question: ${q}`;

    const runId = req.headers.get("X-Lovable-AIG-Run-ID")?.trim();
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST", signal: req.signal,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch", ...(runId ? { "X-Lovable-AIG-Run-ID": runId } : {}) },
      body: JSON.stringify({ model: "openai/gpt-6-astra", instructions, input, stream: true, store: false, reasoning: { effort: "low", summary: "auto" }, include: ["reasoning.encrypted_content"] }),
    });
    const aig: Record<string, string> = {};
    res.headers.forEach((v, k) => { if (k.toLowerCase().startsWith("x-lovable-aig-")) aig[k] = v; });
    if (!res.ok || !res.body) {
      const detail = await res.json().catch(() => ({}));
      const message = res.status === 402 ? "AI credits are used up. Please add credits to continue."
        : res.status === 429 ? "Too many questions right now. Please wait a moment and try again."
        : detail?.error?.message ?? detail?.message ?? "The AI service could not answer.";
      return json({ error: message }, res.status, aig);
    }
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "", answer = "", failed = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") answer += ev.delta ?? "";
          else if (ev.type === "response.failed" || ev.type === "error") failed = ev.response?.error?.message ?? ev.message ?? "The AI service could not answer.";
        } catch { /* partial line */ }
      }
    }
    if (failed) return json({ error: failed }, 502, aig);
    if (!answer.trim()) return json({ error: "The AI returned no answer for this question." }, 502, aig);
    return json({ answer: answer.trim(), recordsUsed: records.length, totalRecords: data.count }, 200, aig);
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    console.error("occurrence-qa error", e);
    return json({ error: "Something went wrong answering this question." }, 500);
  }
});
