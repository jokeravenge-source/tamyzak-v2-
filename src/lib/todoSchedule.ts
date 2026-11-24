import { baghdadDayKey } from "@/lib/dailyCache";
import type { SyncedTodo } from "@/lib/todosSync";

export const TODO_DAYS = [
  { key: "Saturday", ar: "السبت", shortAr: "سبت" },
  { key: "Sunday", ar: "الأحد", shortAr: "أحد" },
  { key: "Monday", ar: "الإثنين", shortAr: "اثن" },
  { key: "Tuesday", ar: "الثلاثاء", shortAr: "ثلا" },
  { key: "Wednesday", ar: "الأربعاء", shortAr: "أرب" },
  { key: "Thursday", ar: "الخميس", shortAr: "خمي" },
  { key: "Friday", ar: "الجمعة", shortAr: "جمع" },
] as const;

export type TodoDay = typeof TODO_DAYS[number]["key"] | "unscheduled";
export type TodoDrop = { day: TodoDay; beforeId: string | null };

export function getTodoDay(label?: string): TodoDay {
  const key = label?.trim().replace(/[أإ]/g, "ا");
  return TODO_DAYS.find((day) => day.key === key || day.ar.replace(/[أإ]/g, "ا") === key)?.key ?? "unscheduled";
}

export function getStudyWeek(now = new Date()) {
  const today = baghdadDayKey(now);
  const start = new Date(`${today}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 1) % 7);
  return TODO_DAYS.map((day, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const dateKey = date.toISOString().slice(0, 10);
    return { ...day, date, dateKey, isToday: dateKey === today };
  });
}

export function groupTodos(todos: SyncedTodo[]) {
  const groups = new Map<TodoDay, SyncedTodo[]>([["unscheduled", []]]);
  for (const { key } of TODO_DAYS) groups.set(key, []);
  for (const todo of todos) groups.get(getTodoDay(todo.day))!.push(todo);
  return groups;
}

export function withTodoDay(todo: SyncedTodo, day: TodoDay): SyncedTodo {
  return { ...todo, day: day === "unscheduled" ? undefined : day };
}

/** Preserve the other tasks' order and accept anchors only from the target day. */
export function moveTodo(todos: SyncedTodo[], id: string, target: TodoDrop): SyncedTodo[] {
  const todo = todos.find((item) => item.id === id);
  if (!todo || target.beforeId === id) return todos;
  const sourceDay = getTodoDay(todo.day);
  if (todo.source === "parent" && sourceDay !== target.day) return todos;

  const remaining = todos.filter((item) => item.id !== id);
  const destination = remaining.filter((item) => getTodoDay(item.day) === target.day);
  const anchor = destination.find((item) => item.id === target.beforeId);
  if (sourceDay === target.day) {
    const next = todos.slice(todos.indexOf(todo) + 1).find((item) => getTodoDay(item.day) === sourceDay);
    if (next === anchor) return todos;
  }

  const last = destination[destination.length - 1];
  const index = anchor ? remaining.indexOf(anchor) : last ? remaining.indexOf(last) + 1 : remaining.length;
  remaining.splice(index, 0, sourceDay === target.day ? todo : withTodoDay(todo, target.day));
  return remaining;
}
