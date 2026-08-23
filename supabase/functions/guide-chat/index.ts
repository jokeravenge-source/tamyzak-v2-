import { protect } from "../_shared/guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TOOLS = `
basics — الرئيسية / Home
todo — قائمة المهام / To-do list (plan your day)
flashcards — البطاقات التعليمية / Flashcards with spaced repetition
mcqBank — بنك الأسئلة / MCQ bank by subject and chapter
ministerialBank — الأسئلة الوزارية / Ministerial questions bank
mistakes — أخطائي / My mistakes review
adminNotes — ملاحظات دراسية / Study notes made by teachers
notes — ملاحظاتي / My own notes
summaries — الملخصات / Summaries
mindmap — الخرائط الذهنية / Mind maps
subjectsHub — المواد / Subjects hub
subjectTutor — المدرّس الذكي / AI subject tutor
companion — رفيق التميز / Excellence companion chat
psych — المساعد النفسي / Psychological assistant
examGenerator — مولّد الامتحانات / Exam generator
ourCourses — الكورسات / Courses and graded exams
teachers — مدرسينا / Our teachers and lectures
challenge — التحدي / Challenge competition
dailyGame — اللعبة اليومية / Daily game
whoIsBest — من الأفضل / Who is best poll
leaderboard — لوحة المتصدرين / Leaderboard
sessions — الجلسات / Study sessions and private rooms
report — تقريري اليومي / Daily report and progress
canvas — اللوحة / Canvas
youtube — مشغّل يوتيوب / YouTube player
videoNotes — من فيديو إلى ملاحظات / Video to notes
essay — المقالات / Essay tools
englishEssays — مقالات الإنجليزي / English essays
englishIsqat — الإسقاط الإنجليزي / English isqat
physicsLaws — قوانين الفيزياء / Physics laws
physicsProblemSolver — حلّال مسائل الفيزياء / Physics problem solver
problemGenerator — مولّد المسائل / Problem generator
organicEquations — المعادلات العضوية / Organic equations
biologyDrawings — رسومات الأحياء / Biology drawings
islamicSurahs — السور / Islamic surahs
hadithChecker — مدقق الحديث / Hadith checker
poemsChecker — مدقق الشعر / Poems checker
frenchSynonyms — مرادفات فرنسية / French synonyms
frenchAntonyms — أضداد فرنسية / French antonyms
account — الحساب / Account settings
`;

const SYSTEM_PROMPT = `أنت مرشد تطبيق "تميّزك" (Tamayzak) — منصة دراسية للسادس الإعدادي في العراق.
مهمتك: افهم ماذا يريد الطالب أن ينجز، ثم اشرح له بإيجاز أي أداة يستخدم وكيف، ووجّهه إليها بروابط قابلة للضغط.

قواعد:
- تحدث بنفس لغة الطالب (عربي أو إنجليزي)، بأسلوب ودود وبسيط جداً.
- ردود قصيرة (٣-٦ أسطر كحد أقصى) وعملية.
- إذا لم تكن نية الطالب واضحة، اسأله سؤالاً واحداً فقط.
- كل رابط أداة يجب أن يُكتب بهذا الشكل بالضبط: [[tool:KEY|النص الظاهر]]
  مثال: [[tool:mcqBank|افتح بنك الأسئلة]]
- استخدم فقط المفاتيح (KEY) من القائمة أدناه، ولا تخترع مفاتيح جديدة.
- ضع رابطاً واحداً إلى ثلاثة روابط في نهاية الرد عند الحاجة.

الأدوات المتاحة (KEY — الوصف):
${TOOLS}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const guard = await protect(req, "guide-chat", { max: 20, windowSeconds: 60 });
  if (!guard.ok) {
    return new Response(JSON.stringify({ error: guard.error }), {
      status: guard.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "invalid message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": lovableKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...((history ?? []).slice(-12).map((m) => ({ role: m.role, content: m.content }))),
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      const status = aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500;
      return new Response(JSON.stringify({ error: "ai_error", detail }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const aiJson = await aiRes.json();
    const reply: string = aiJson?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
