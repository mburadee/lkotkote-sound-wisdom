import { useState } from "react";
import { MessageCircleQuestion, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTIONS = ["Where has this bird been recorded most?", "Are there recent records near Samburu, Kenya?", "Which months or years have the most records?"];

function linkify(text: string) {
  return text.split(/(\[GBIF \d+\])/g).map((part, i) => {
    const m = part.match(/^\[GBIF (\d+)\]$/);
    return m ? <a key={i} href={`https://www.gbif.org/occurrence/${m[1]}`} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">[GBIF {m[1]}]</a> : part;
  });
}

export default function OccurrenceQA({ taxonKey, speciesName, localName }: { taxonKey?: number; speciesName: string; localName?: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ text: string; used: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (q = question) => {
    if (!taxonKey || !q.trim() || loading) return;
    setQuestion(q); setLoading(true); setError(""); setAnswer(null);
    const { data, error: fnError } = await supabase.functions.invoke("occurrence-qa", { body: { taxonKey, speciesName, localName, question: q } });
    setLoading(false);
    let message = data?.error as string | undefined;
    if (fnError && !message) {
      const body = await (fnError as { context?: Response }).context?.json?.().catch(() => null);
      message = body?.error ?? "Could not get an answer. Please try again.";
    }
    if (message) setError(message);
    else setAnswer({ text: data.answer, used: data.recordsUsed, total: data.totalRecords });
  };

  return (
    <section className="mt-6 rounded-md border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold"><MessageCircleQuestion className="h-5 w-5 text-forest" /> Ask about these records</h2>
      <p className="mt-1 text-xs text-muted-foreground">Ask in your own words. Answers are AI-powered summaries of the GBIF records for {speciesName}, with links to each record used.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => ask(s)} disabled={!taxonKey || loading} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted disabled:opacity-50">{s}</button>)}
      </div>
      <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <label htmlFor="occ-question" className="sr-only">Your question</label>
        <Textarea id="occ-question" value={question} maxLength={600} rows={2} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Has this bird been seen in northern Kenya in the last five years?" className="flex-1" />
        <Button type="submit" disabled={!taxonKey || !question.trim() || loading} className="bg-forest text-secondary-foreground hover:bg-forest/90 sm:self-end">{loading ? <Loader2 className="animate-spin" /> : "Ask"}</Button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {answer && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="whitespace-pre-line text-sm leading-relaxed">{linkify(answer.text)}</p>
          <p className="mt-2 text-[11px] text-muted-foreground">Based on {answer.used} of {answer.total.toLocaleString()} GBIF records. Records show where the bird was observed, not its full habitat.</p>
        </div>
      )}
    </section>
  );
}
