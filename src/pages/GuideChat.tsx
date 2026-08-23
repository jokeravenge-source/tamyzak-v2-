import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Compass, Loader2, Send, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

const copy = {
  ar: {
    title: "مرشد التطبيق",
    subtitle: "قل لي ماذا تريد أن تنجز وسأدلّك على الأداة المناسبة",
    intro: "أهلاً بك في تميّزك! أخبرني ماذا تريد أن تفعل اليوم — مثلاً: «أريد أن أراجع الفيزياء» أو «أريد تنظيم وقتي» — وسأشرح لك الأداة المناسبة وأنقلك إليها مباشرة.",
    placeholder: "ماذا تريد أن تفعل؟",
    back: "دخول التطبيق",
    loading: "يفكّر...",
    error: "حدث خطأ، حاول مرة أخرى.",
    quick: ["أريد المراجعة للامتحان", "أريد تنظيم وقتي", "أريد حل أسئلة", "أريد ملاحظات جاهزة"],
  },
  en: {
    title: "App guide",
    subtitle: "Tell me what you want to do and I'll point you to the right tool",
    intro: "Welcome to Tamayzak! Tell me what you'd like to do today — e.g. \"I want to revise physics\" or \"help me plan my time\" — and I'll explain the right tool and take you there.",
    placeholder: "What do you want to do?",
    back: "Enter the app",
    loading: "Thinking...",
    error: "Something went wrong, try again.",
    quick: ["Revise for an exam", "Plan my day", "Practice questions", "Read study notes"],
  },
} as const;

const LINK_RE = /\[\[tool:([a-zA-Z]+)\|([^\]]+)\]\]/g;

function renderParts(text: string) {
  const parts: ({ t: "text"; v: string } | { t: "link"; key: string; label: string })[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    if (m.index! > last) parts.push({ t: "text", v: text.slice(last, m.index) });
    parts.push({ t: "link", key: m[1], label: m[2] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ t: "text", v: text.slice(last) });
  return parts;
}

export default function GuideChat({
  language,
  onBack,
  onOpenTool,
}: {
  language: AppLanguage;
  onBack: () => void;
  onOpenTool: (key: string) => void;
}) {
  const t = copy[language];
  const isAr = language === "ar";
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const history = messages.slice(-10);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("guide-chat", {
        body: { message: text, history },
      });
      if (error) throw error;
      const reply = (data as any)?.reply ?? "";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      toast.error(t.error);
      setMessages((m) => [...m, { role: "assistant", content: t.error }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col px-3 sm:px-4 py-4 sm:py-6 max-w-3xl mx-auto"
      dir={isAr ? "rtl" : "ltr"}
    >
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
          {t.back}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Compass className="w-4 h-4 text-primary" />
          </div>
          <div className={isAr ? "text-right" : "text-left"}>
            <h1 className="text-base font-semibold leading-tight">{t.title}</h1>
            <p className="text-[11px] text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-border bg-secondary/30 backdrop-blur p-3 sm:p-5 space-y-4 min-h-[55vh]"
      >
        {messages.length === 0 ? (
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-foreground/80 leading-relaxed bg-card/60 border border-border rounded-xl p-4"
            >
              {t.intro}
            </motion.div>
            <div className="flex flex-wrap gap-2">
              {t.quick.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80 hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap text-sm leading-relaxed rounded-2xl px-3.5 py-2.5 ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border text-foreground rounded-bl-sm"
                }`}
              >
                {m.role === "assistant"
                  ? renderParts(m.content).map((p, pi) =>
                      p.t === "text" ? (
                        <span key={pi}>{p.v}</span>
                      ) : (
                        <button
                          key={pi}
                          onClick={() => onOpenTool(p.key)}
                          className="my-1 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                          {p.label}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ),
                    )
                  : m.content}
              </div>
            </motion.div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t.loading}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder={t.placeholder}
          className="flex-1 resize-none rounded-xl border border-border bg-card/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />}
        </Button>
      </div>
    </main>
  );
}
