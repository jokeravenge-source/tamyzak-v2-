import { useEffect, useState } from "react";

export const STUDY_TOOL_VISIBILITY_KEY = "app_hidden_study_tools_v1";
export const STUDY_TOOL_VISIBILITY_EVENT = "app:study-tools-visibility-changed";

export const CUSTOMIZABLE_STUDY_TOOLS = [
  { key: "notes", en: "Notes", ar: "ملاحظاتي" },
  { key: "adminNotes", en: "Study Notes", ar: "الملاحظات الدراسية" },
  { key: "canvas", en: "Canvas", ar: "اللوحة" },
  { key: "summaries", en: "Summaries", ar: "الملخصات" },
  { key: "mcq", en: "MCQ Generator", ar: "مولّد الأسئلة" },
  { key: "mcqBank", en: "MCQ Bank", ar: "بنك الأسئلة" },
  { key: "mistakes", en: "My Mistakes", ar: "أخطائي" },
  { key: "mindmap", en: "Mind Map", ar: "الخريطة الذهنية" },
  { key: "videoNotes", en: "Video Notes", ar: "ملاحظات الفيديو" },
  { key: "textToVideo", en: "Text to Video", ar: "نص إلى فيديو" },
  { key: "youtube", en: "YouTube Player", ar: "مشغّل يوتيوب" },
  { key: "companion", en: "Success Companion", ar: "رفيق النجاح" },
  { key: "liveBattle", en: "Live Battle", ar: "المعركة المباشرة" },
] as const;

export type CustomizableStudyToolKey = typeof CUSTOMIZABLE_STUDY_TOOLS[number]["key"];

const validKeys = new Set<string>(CUSTOMIZABLE_STUDY_TOOLS.map((tool) => tool.key));

export function getHiddenStudyTools(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const parsed = JSON.parse(localStorage.getItem(STUDY_TOOL_VISIBILITY_KEY) || "[]");
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((key): key is string => typeof key === "string" && validKeys.has(key)));
  } catch {
    return new Set();
  }
}

export function saveHiddenStudyTools(hidden: Set<string>) {
  const cleaned = [...hidden].filter((key) => validKeys.has(key));
  if (cleaned.length === 0) localStorage.removeItem(STUDY_TOOL_VISIBILITY_KEY);
  else localStorage.setItem(STUDY_TOOL_VISIBILITY_KEY, JSON.stringify(cleaned));
  window.dispatchEvent(new Event(STUDY_TOOL_VISIBILITY_EVENT));
}

export function useHiddenStudyTools() {
  const [hiddenTools, setHiddenTools] = useState<Set<string>>(() => getHiddenStudyTools());

  useEffect(() => {
    const sync = () => setHiddenTools(getHiddenStudyTools());
    window.addEventListener(STUDY_TOOL_VISIBILITY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STUDY_TOOL_VISIBILITY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return hiddenTools;
}
