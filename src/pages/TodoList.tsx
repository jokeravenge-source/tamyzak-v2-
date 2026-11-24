import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, CalendarDays, GripVertical, Inbox, Plus, Send, Trophy } from "lucide-react";
import { MotionConfig, useReducedMotion } from "framer-motion";
import type { AppLanguage } from "@/components/LanguageGate";
import TodoCalendarTask, { TodoDaySelect } from "@/components/TodoCalendarTask";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFeatureUsed } from "@/hooks/useFeatureUsed";
import { useStudentTodos } from "@/hooks/useStudentTodos";
import { useTodoCalendarDrag } from "@/hooks/useTodoCalendarDrag";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStudyWeek, groupTodos, moveTodo, TODO_DAYS, withTodoDay, type TodoDay, type TodoDrop } from "@/lib/todoSchedule";
import { cn } from "@/lib/utils";

const CELEBRATED_KEY = "app_todos_celebrated_v1";
const copy = {
  en: {
    title: "Study calendar", back: "Back", thisWeek: "This week", today: "Today",
    newTask: "New task", add: "Add task", name: "Task name", example: "e.g. Review physics chapter 3",
    day: "Day", cancel: "Cancel", emptyDay: "No tasks planned", unscheduled: "Unscheduled",
    emptyInbox: "Tasks without a day appear here.", done: "done",
    hint: "Drag by the grip to move a task. Tap it for more options.",
    drop: "Drop task here", moved: "Task moved", clear: "Clear all tasks",
    telegram: "Telegram", sendTelegram: "Send today's tasks to Telegram", sending: "Sending…",
    sent: "Sent to your Telegram", notLinked: "Link Telegram in your account settings first.", sendFail: "Could not send to Telegram.",
    congrats: "All tasks completed", congratsBody: "You finished every task on your list.", close: "Done",
  },
  ar: {
    title: "تقويم الدراسة", back: "رجوع", thisWeek: "هذا الأسبوع", today: "اليوم",
    newTask: "مهمة جديدة", add: "أضف المهمة", name: "اسم المهمة", example: "مثلاً، مراجعة الفصل الثالث في الفيزياء",
    day: "اليوم", cancel: "إلغاء", emptyDay: "ماكو مهام لهذا اليوم", unscheduled: "بدون موعد",
    emptyInbox: "المهام اللي ما إلها يوم تظهر هنا.", done: "منجزة",
    hint: "اسحب من المقبض حتى تنقل المهمة، أو اضغط عليه حتى تشوف الخيارات.",
    drop: "أفلت المهمة هنا", moved: "انتقلت المهمة", clear: "مسح كل المهام",
    telegram: "تيليجرام", sendTelegram: "أرسل مهام اليوم إلى تيليجرام", sending: "جارٍ الإرسال…",
    sent: "انرسلت المهام إلى تيليجرام", notLinked: "اربط تيليجرام أولاً من إعدادات الحساب.", sendFail: "تعذّر الإرسال إلى تيليجرام.",
    congrats: "أنجزت كل المهام", congratsBody: "كمّلت كل المهام الموجودة بقائمتك.", close: "تم",
  },
} as const;

const dayId = (day: TodoDay) => `study-calendar-${day}`;

export default function TodoList({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  useFeatureUsed("todo_list");
  const t = copy[language];
  const ar = language === "ar";
  const direction = ar ? "rtl" : "ltr";
  const locale = ar ? "ar-IQ" : "en-GB";
  const week = getStudyWeek();
  const today = week.find((day) => day.isToday)!.key;
  const { todos, update, sync } = useStudentTodos();
  const [selected, setSelected] = useState<TodoDay>(today);
  const [draftDay, setDraftDay] = useState<TodoDay>(today);
  const [input, setInput] = useState("");
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const composerTrigger = useRef<HTMLButtonElement | null>(null);
  const reducedMotion = useReducedMotion();
  const groups = groupTodos(todos);
  const completed = todos.filter((item) => item.done).length;

  function dayLabel(day: TodoDay) {
    if (day === "unscheduled") return t.unscheduled;
    return ar ? TODO_DAYS.find(({ key }) => key === day)!.ar : day;
  }

  function move(id: string, drop: TodoDrop, focus = false) {
    if (!update((items) => moveTodo(items, id, drop))) return;
    setSelected(drop.day);
    const task = todos.find((item) => item.id === id);
    setAnnouncement(`${t.moved} · ${task?.text ?? ""} · ${dayLabel(drop.day)}`);
    if (focus) {
      window.requestAnimationFrame(() => {
        const cards = document.getElementById(dayId(drop.day))?.querySelectorAll<HTMLElement>("[data-todo-id]");
        Array.from(cards ?? []).find((card) => card.dataset.todoId === id)
          ?.querySelector<HTMLElement>("[data-todo-grip]")?.focus();
      });
    }
  }

  const drag = useTodoCalendarDrag(move);
  const edgeFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const weekStart = week[0].date;
  const weekEnd = week[6].date;
  const weekRange = weekStart.getUTCMonth() === weekEnd.getUTCMonth()
    ? `${weekStart.getUTCDate().toLocaleString(locale)}–${weekEnd.getUTCDate().toLocaleString(locale)} ${monthFormat.format(weekEnd)}`
    : `${edgeFormat.format(weekStart)} – ${edgeFormat.format(weekEnd)} ${weekEnd.getUTCFullYear().toLocaleString(locale, { useGrouping: false })}`;

  useEffect(() => {
    if (todos.length && todos.every((item) => item.done)) {
      if (localStorage.getItem(CELEBRATED_KEY) !== "1") {
        localStorage.setItem(CELEBRATED_KEY, "1");
        setShowCongrats(true);
      }
    } else {
      localStorage.removeItem(CELEBRATED_KEY);
    }
  }, [todos]);

  function chooseDay(day: TodoDay) {
    setSelected(day);
    if (window.scrollY > 100 && !window.matchMedia("(min-width: 1024px)").matches) {
      window.requestAnimationFrame(() => {
        document.getElementById(dayId(day))?.scrollIntoView({
          block: "start", behavior: reducedMotion ? "instant" : "smooth",
        });
      });
    }
  }

  function openComposer(day: TodoDay, trigger: HTMLButtonElement) {
    composerTrigger.current = trigger;
    setDraftDay(day);
    setInput("");
    setComposing(true);
  }

  function add(event: FormEvent) {
    event.preventDefault();
    const name = input.trim();
    if (!name) return;
    const newTodo = withTodoDay({ id: crypto.randomUUID(), text: name, done: false }, draftDay);
    update((items) => [...items, newTodo]);
    chooseDay(draftDay);
    setComposing(false);
  }

  async function sendToTelegram() {
    if (sending) return;
    setSending(true);
    try {
      await sync();
      const { data, error } = await supabase.functions.invoke("todo-telegram-reminder", {
        body: { language, items: todos },
      });
      let reason = (data as { error?: string } | null)?.error;
      if (!reason && error) {
        const ctx = (error as { context?: Response }).context;
        const payload = await ctx?.json().catch(() => null);
        reason = payload?.error || error.message;
      }
      if (reason) toast({ title: reason === "telegram_not_linked" ? t.notLinked : t.sendFail, variant: "destructive" });
      else toast({ title: t.sent });
    } catch {
      toast({ title: t.sendFail, variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  function renderLane(day: TodoDay) {
    const items = groups.get(day)!;
    const isInbox = day === "unscheduled";
    const targeted = drag.over?.day === day;
    const append = targeted && !drag.over?.beforeId;

    return (
      <section
        key={day}
        id={dayId(day)}
        data-todo-day={day}
        aria-label={dayLabel(day)}
        className={cn(
          "scroll-mt-24 grid content-start gap-2 border-t border-border p-3 transition-colors lg:p-2.5",
          isInbox ? "bg-muted/25 sm:px-5" : "min-w-0 lg:min-h-[24rem] lg:border-e lg:last:border-e-0",
          !isInbox && selected !== day && "hidden lg:grid",
          !isInbox && selected === day && "bg-primary/[0.035]",
          targeted && "bg-primary/10",
        )}
      >
        <div className="flex min-h-9 items-center justify-between gap-1">
          <h2 className={cn("flex items-center gap-2 text-sm font-bold text-foreground", !isInbox && "lg:sr-only")}>
            {isInbox && <Inbox aria-hidden className="size-4 text-primary" />}
            {dayLabel(day)}
          </h2>
          {!isInbox && <span className="hidden text-xs text-muted-foreground lg:inline">{items.length ? `${items.filter((item) => item.done).length}/${items.length}` : ""}</span>}
          <button
            type="button"
            onClick={(event) => openComposer(day, event.currentTarget)}
            aria-label={`${t.add} · ${dayLabel(day)}`}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus aria-hidden className="size-[18px]" />
          </button>
        </div>
        {items.length ? (
          <ul className={cn("grid gap-2", isInbox && "sm:max-w-lg")}>
            {items.map((todo, index) => (
              <TodoCalendarTask
                key={todo.id} language={language} todo={todo} day={day}
                dragging={drag.preview?.todo.id === todo.id} insertBefore={drag.over?.beforeId === todo.id}
                onToggle={() => update((all) => all.map((item) => item.id === todo.id ? { ...item, done: !item.done } : item))}
                onRemove={() => update((all) => all.filter((item) => item.id !== todo.id))}
                onMove={(nextDay) => move(todo.id, { day: nextDay, beforeId: null }, true)}
                onEarlier={index > 0 ? () => move(todo.id, { day, beforeId: items[index - 1].id }, true) : undefined}
                onLater={index < items.length - 1 ? () => move(todo.id, { day, beforeId: items[index + 2]?.id ?? null }, true) : undefined}
                onPointerDown={(event) => drag.begin(event, todo)}
                onGripClick={drag.preventDragClick}
              />
            ))}
          </ul>
        ) : (
          <p className={cn("rounded-xl border border-dashed border-border px-3 py-3 text-sm leading-snug text-muted-foreground", targeted && "border-primary/60 text-foreground")}>
            {targeted ? t.drop : isInbox ? t.emptyInbox : t.emptyDay}
          </p>
        )}
        {items.length > 0 && (
          <div aria-hidden className={cn("h-[3px] rounded-full", append ? "bg-primary" : "bg-transparent")} />
        )}
      </section>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <main dir={direction} lang={language} className="min-h-screen bg-muted/25 px-3 pb-28 pt-5 text-foreground sm:px-6 sm:pt-8">
        <div className="mx-auto max-w-[1280px]">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <Button variant="ghost" size="icon" onClick={onBack} aria-label={t.back} className="size-9 shrink-0 rounded-xl sm:size-10">
                <ArrowLeft aria-hidden className={cn("size-5", ar && "rotate-180")} />
              </Button>
              <div className="hidden size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary sm:grid">
                <CalendarDays aria-hidden className="size-5" />
              </div>
              <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-3xl">{t.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={sendToTelegram} disabled={sending} aria-label={t.sendTelegram} title={t.sendTelegram} className="min-h-10 w-10 gap-2 rounded-xl bg-card p-0 sm:w-auto sm:px-4">
                <Send aria-hidden className="size-4" /><span className="hidden sm:inline">{sending ? t.sending : t.telegram}</span>
              </Button>
              <Button type="button" onClick={(event) => openComposer(selected, event.currentTarget)} className="min-h-10 gap-1.5 rounded-xl px-2.5 sm:gap-2 sm:px-4">
                <Plus aria-hidden className="size-4" />{t.newTask}
              </Button>
            </div>
          </header>

          <div ref={drag.boardRef} aria-label={t.thisWeek} className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => chooseDay(today)} className="h-9 rounded-lg bg-card">{t.today}</Button>
                <div>
                  <h2 className="text-base font-bold sm:text-lg"><bdi>{weekRange}</bdi></h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">{t.thisWeek}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span aria-hidden className="h-1.5 w-10 overflow-hidden rounded-full bg-muted sm:w-16">
                  <span className="block h-full rounded-full bg-primary motion-safe:transition-[width]" style={{ width: todos.length ? `${completed / todos.length * 100}%` : "0%" }} />
                </span>
                <span aria-live="polite"><bdi>{completed.toLocaleString(locale)}/{todos.length.toLocaleString(locale)}</bdi> {t.done}</span>
              </div>
            </div>

            <div className="sticky top-0 z-10 grid grid-cols-7 border-t border-border bg-card/95 backdrop-blur-sm">
              {week.map((day) => (
                <button
                  type="button" key={day.key} onClick={() => chooseDay(day.key)}
                  data-todo-day={day.key} data-todo-append
                  aria-label={`${dayLabel(day.key)} · ${edgeFormat.format(day.date)}`}
                  aria-pressed={selected === day.key} aria-current={day.isToday ? "date" : undefined}
                  className={cn(
                    "flex min-h-[4.55rem] min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:border-e lg:last:border-e-0",
                    selected === day.key && "bg-primary/[0.06] font-semibold text-primary",
                    drag.over?.day === day.key && "bg-primary/15 ring-2 ring-inset ring-primary/50",
                  )}
                >
                  <span className="lg:hidden">{ar ? day.shortAr : day.key.slice(0, 3)}</span>
                  <span className="hidden lg:inline">{dayLabel(day.key)}</span>
                  <time dateTime={day.dateKey} className={cn("grid size-8 place-items-center rounded-full text-base font-bold leading-none", day.isToday ? "bg-primary text-primary-foreground" : "text-foreground")}>
                    {day.date.getUTCDate().toLocaleString(locale)}
                  </time>
                </button>
              ))}
            </div>
            <div className="grid lg:grid-cols-7">{week.map((day) => renderLane(day.key))}</div>
            {renderLane("unscheduled")}
          </div>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-3 px-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5"><GripVertical aria-hidden className="size-4 shrink-0" />{t.hint}</p>
            {todos.length > 0 && <button type="button" className="rounded-md font-medium hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => update(() => [])}>{t.clear}</button>}
          </div>
          <p role="status" className="sr-only">{announcement}</p>
        </div>

        <Dialog open={composing} onOpenChange={setComposing}>
          <DialogContent dir={direction} aria-describedby={undefined} className="rounded-2xl" onCloseAutoFocus={(event) => {
            event.preventDefault();
            composerTrigger.current?.focus({ preventScroll: true });
          }}>
            <DialogHeader><DialogTitle>{t.newTask}</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={add}>
              <label className="block space-y-1.5 text-sm font-medium">
                <span>{t.name}</span>
                <input required value={input} onChange={(event) => setInput(event.target.value)} maxLength={120} placeholder={t.example} className="min-h-11 w-full rounded-lg border border-border bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
              <TodoDaySelect language={language} value={draftDay} onChange={setDraftDay} label={t.day} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setComposing(false)}>{t.cancel}</Button>
                <Button type="submit" disabled={!input.trim()}>{t.add}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
          <DialogContent dir={direction} className="rounded-2xl">
            <DialogHeader>
              <Trophy aria-hidden className="mb-2 size-7 text-primary" />
              <DialogTitle>{t.congrats}</DialogTitle>
              <DialogDescription>{t.congratsBody}</DialogDescription>
            </DialogHeader>
            <Button type="button" onClick={() => setShowCongrats(false)}>{t.close}</Button>
          </DialogContent>
        </Dialog>

        {drag.preview && createPortal(
          <div
            ref={drag.previewRef} dir={direction} aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[100] flex items-start gap-2 rounded-xl border border-primary/40 border-s-[3px] border-s-primary bg-card p-3 text-sm font-semibold text-foreground shadow-xl will-change-transform"
            style={{ width: drag.preview.width, transform: `translate3d(${drag.preview.x}px, ${drag.preview.y}px, 0)` }}
          >
            <GripVertical aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{drag.preview.todo.text}</span>
          </div>,
          document.body,
        )}
      </main>
    </MotionConfig>
  );
}
