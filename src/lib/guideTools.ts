import type { MainMenuChoice } from "@/pages/MainMenu";
import { STUDENT_TOOLS, isStudentToolKey, type StudentToolKey } from "../../supabase/functions/_shared/mutamayizTools";
export const GUIDE_TOOL_KEYS = STUDENT_TOOLS.map(tool => tool.key) satisfies readonly MainMenuChoice[];
export type GuideToolKey = StudentToolKey;
export const isGuideToolKey = isStudentToolKey;
