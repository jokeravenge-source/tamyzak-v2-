import { useState, type MouseEventHandler, type PointerEventHandler } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, GripVertical, Lock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { AppLanguage } from "@/components/LanguageGate";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TODO_DAYS, type TodoDay } from "@/lib/todoSchedule";
import type { SyncedTodo } from "@/lib/todosSync";
import { cn } from "@/lib/utils";

const copy = {
  ar: {
    options: "ترتيب المهمة",
    complete: "تحديد كمنجزة",
    reopen: "إعادة فتح المهمة",
    moveTo: "انقل إلى يوم",
    up: "حرّك للأعلى",
    down: "حرّك للأسفل",
    parent: "اليوم محدد من ولي الأمر",
    remove: "حذف المهمة",
    unscheduled: "بدون موعد",
  },
  en: {
    options: "Task options",
    complete: "Mark complete",
    reopen: "Mark incomplete",
    moveTo: "Move to day",
    up: "Move up",
    down: "Move down",
    parent: "Day set by your parent",
    remove: "Delete task",
    unscheduled: "Unscheduled",
  },
} as const;

interface DaySelectProps {
  language: AppLanguage;
  value: TodoDay;
  onChange: (day: TodoDay) => void;
  label: string;
}

export function TodoDaySelect({ language, value, onChange, label }: DaySelectProps) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-foreground">
      <span>{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as TodoDay)}
          className="min-h-11 w-full appearance-none rounded-lg border border-border bg-background ps-3 pe-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TODO_DAYS.map(({ key, ar }) => <option value={key} key={key}>{language === "ar" ? ar : key}</option>)}
          <option value="unscheduled">{copy[language].unscheduled}</option>
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </span>
    </label>
  );
}

type TaskProps = {
  todo: SyncedTodo;
  day: TodoDay;
  language: AppLanguage;
  dragging: boolean;
  insertBefore: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onMove: (day: TodoDay) => void;
  onEarlier?: () => void;
  onLater?: () => void;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
  onGripClick: MouseEventHandler<HTMLButtonElement>;
};

const optionClass = "flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-start text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-45";

export default function TodoCalendarTask({
  todo, day, language, dragging, insertBefore, onToggle, onRemove, onMove, onEarlier, onLater, onPointerDown, onGripClick,
}: TaskProps) {
  const t = copy[language];
  const [open, setOpen] = useState(false);
  const parentAssigned = todo.source === "parent";

  return (
    <motion.li
      layout="position"
      transition={{ layout: { type: "spring", stiffness: 440, damping: 37 } }}
      data-todo-id={todo.id}
      className={cn(
        "relative flex min-h-12 items-start gap-1 rounded-xl border border-s-[3px] bg-card p-1.5 text-sm shadow-sm transition-colors",
        todo.done ? "border-border bg-muted/30" : "border-primary/15 border-s-primary/60 hover:border-primary/35",
        dragging && "opacity-35",
        insertBefore && "before:absolute before:inset-x-0 before:-top-[5px] before:h-[3px] before:rounded-full before:bg-primary",
      )}
    >
      <button
        type="button"
        aria-label={`${todo.done ? t.reopen : t.complete} · ${todo.text}`}
        aria-pressed={todo.done}
        onClick={onToggle}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:size-7"
      >
        <span className={cn("grid size-[17px] place-items-center rounded-full border", todo.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/70")}>
          {todo.done && <Check aria-hidden className="size-3" strokeWidth={2.6} />}
        </span>
      </button>
      <p className={cn("min-w-0 flex-1 py-2 font-medium leading-snug [overflow-wrap:anywhere] lg:py-1", todo.done && "text-muted-foreground line-through")}>
        {todo.text}
        {parentAssigned && <span title={t.parent} className="ms-1 inline-block align-middle"><Lock aria-label={t.parent} className="size-3.5 text-muted-foreground" /></span>}
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-todo-grip
            onPointerDown={onPointerDown}
            onClick={onGripClick}
            aria-label={`${t.options} · ${todo.text}`}
            title={t.options}
            className="grid size-9 shrink-0 touch-none select-none place-items-center rounded-lg text-muted-foreground [cursor:grab] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing lg:size-7"
          >
            <GripVertical aria-hidden className="size-[17px]" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={6} collisionPadding={12} dir={language === "ar" ? "rtl" : "ltr"} className="w-56 space-y-1.5 rounded-xl p-2">
          {parentAssigned ? (
            <p className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground"><Lock aria-hidden className="size-4" />{t.parent}</p>
          ) : (
            <div className="px-1 pb-1">
              <TodoDaySelect language={language} value={day} label={t.moveTo} onChange={(value) => { setOpen(false); onMove(value); }} />
            </div>
          )}
          <button type="button" className={optionClass} disabled={!onEarlier} onClick={() => { setOpen(false); onEarlier?.(); }}>
            <ArrowUp aria-hidden className="size-4" />{t.up}
          </button>
          <button type="button" className={optionClass} disabled={!onLater} onClick={() => { setOpen(false); onLater?.(); }}>
            <ArrowDown aria-hidden className="size-4" />{t.down}
          </button>
          <button type="button" className={cn(optionClass, "text-destructive")} onClick={onRemove}>
            <Trash2 aria-hidden className="size-4" />{t.remove}
          </button>
        </PopoverContent>
      </Popover>
    </motion.li>
  );
}
