import type { ScienceEvidence } from "../../supabase/functions/_shared/scienceEvidence";
import type { WeeklyLearningProfile } from "./weeklyLearning";
import type { AssistantFile } from "./mutamayizFile";
export type AssistantBoardContext = { question: string; topic?: string; attachmentId?: string };
export type AssistantMessage = { id: string; role: "user" | "assistant"; content: string; scienceEvidence?: ScienceEvidence; whiteboard?: AssistantBoardContext };
export type AssistantConversation = { owner: string | null; messages: AssistantMessage[]; busy: boolean; epoch: number; file: (AssistantFile & { id: string }) | null; profile: WeeklyLearningProfile | null; approved: string[]; approvingPlan: string | null };
let state: AssistantConversation = { owner: null, messages: [], busy: false, epoch: 0, file: null, profile: null, approved: [], approvingPlan: null };
const listeners = new Set<() => void>();
const publish = () => { listeners.forEach(fn => fn()); };
export const assistantSnapshot = () => state;
export const subscribeAssistant = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export function setAssistantOwner(owner: string | null) {
  if (state.owner === owner) return;
  state = { owner, messages: [], busy: false, epoch: state.epoch + 1, file: null, profile: null, approved: [], approvingPlan: null }; publish();
}
export function updateAssistant(owner: string, update: (current: AssistantConversation) => AssistantConversation) {
  if (state.owner !== owner) return;
  state = update(state); publish();
}
export function newAssistantConversation(owner: string) {
  updateAssistant(owner, old => ({ owner, messages: [], busy: false, epoch: old.epoch + 1, file: null, profile: null, approved: [], approvingPlan: null }));
}
