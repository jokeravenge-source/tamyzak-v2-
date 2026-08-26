/**
 * supabase.functions.invoke() hides the real message behind
 * "Edge Function returned a non-2xx status code". This unwraps the response
 * body so users see the actual reason (daily limit, rate limit, bad file...).
 */
export async function edgeErrorMessage(error: unknown, fallback = "Request failed"): Promise<string> {
  const ctx = (error as { context?: unknown })?.context as Response | undefined;
  if (ctx && typeof (ctx as any).text === "function") {
    try {
      const raw = await ctx.text();
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.error) return String(parsed.error);
        if (parsed?.message) return String(parsed.message);
      } catch {
        /* not JSON */
      }
      if (raw?.trim()) return raw.trim().slice(0, 300);
    } catch {
      /* body already consumed */
    }
    if (ctx.status === 429) return "You reached today's limit for this tool. Try again tomorrow.";
    if (ctx.status === 504) return "The file took too long. Try fewer questions or a smaller PDF.";
  }
  const msg = (error as { message?: string })?.message;
  if (msg && !/non-2xx/i.test(msg)) return msg;
  return fallback;
}
