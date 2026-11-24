import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { getTodoDay, type TodoDay, type TodoDrop } from "@/lib/todoSchedule";
import type { SyncedTodo } from "@/lib/todosSync";

type DragPreview = { todo: SyncedTodo; width: number; x: number; y: number };
const DRAG_THRESHOLD = 6;
const SCROLL_EDGE = 64;

function dropTarget(board: HTMLElement | null, todo: SyncedTodo, x: number, y: number): TodoDrop | null {
  const zone = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-todo-day]");
  if (!zone || !board?.contains(zone)) return null;
  const day = zone.dataset.todoDay as TodoDay;
  if (todo.source === "parent" && day !== getTodoDay(todo.day)) return null;
  if (zone.dataset.todoAppend !== undefined) return { day, beforeId: null };

  const rows = zone.querySelectorAll<HTMLElement>("[data-todo-id]");
  const before = Array.from(rows).find((row) => {
    if (row.dataset.todoId === todo.id) return false;
    const { top, height } = row.getBoundingClientRect();
    return y < top + height / 2;
  });
  return { day, beforeId: before?.dataset.todoId ?? null };
}

export function useTodoCalendarDrag(onDrop: (id: string, drop: TodoDrop) => void) {
  const boardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const suppressClick = useRef(false);
  const [preview, setPreview] = useState<DragPreview | null>(null);
  const [over, setOver] = useState<TodoDrop | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  function begin(event: PointerEvent<HTMLButtonElement>, todo: SyncedTodo) {
    if (event.button !== 0 || event.isPrimary === false || stopRef.current) return;
    const handle = event.currentTarget;
    const card = handle.closest<HTMLElement>("[data-todo-id]");
    if (!card) return;
    suppressClick.current = false;
    const { pointerId, clientX: originX, clientY: originY } = event;
    const rect = card.getBoundingClientRect();
    const offsetX = originX - rect.left;
    const offsetY = originY - rect.top;
    let x = originX;
    let y = originY;
    let active = false;
    let frame = 0;
    let lastTarget: TodoDrop | null = null;

    const update = () => {
      const height = window.innerHeight;
      const delta = y < SCROLL_EDGE ? -Math.max(1, (SCROLL_EDGE - y) / 5)
        : y > height - SCROLL_EDGE ? Math.max(1, (y - height + SCROLL_EDGE) / 5) : 0;
      if (delta) window.scrollBy(0, delta);
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${x - offsetX}px, ${y - offsetY}px, 0)`;
      }
      const target = dropTarget(boardRef.current, todo, x, y);
      if (target?.day !== lastTarget?.day || target?.beforeId !== lastTarget?.beforeId) {
        lastTarget = target;
        setOver(target);
      }
      frame = window.requestAnimationFrame(update);
    };

    const move = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      x = e.clientX;
      y = e.clientY;
      if (!active) {
        if (Math.hypot(x - originX, y - originY) < DRAG_THRESHOLD) return;
        active = true;
        try { handle.setPointerCapture?.(pointerId); } catch { /* Window listeners still track this pointer. */ }
        setPreview({ todo, width: rect.width, x: x - offsetX, y: y - offsetY });
        frame = window.requestAnimationFrame(update);
      }
      e.preventDefault();
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", escape);
      window.removeEventListener("blur", finish);
      if (handle.hasPointerCapture?.(pointerId)) handle.releasePointerCapture(pointerId);
      stopRef.current = null;
    };
    const finish = () => {
      stop();
      if (!active) return;
      suppressClick.current = true;
      setPreview(null);
      setOver(null);
    };
    const cancel = (e: globalThis.PointerEvent) => {
      if (e.pointerId === pointerId) finish();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    const end = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const target = active ? dropTarget(boardRef.current, todo, e.clientX, e.clientY) : null;
      finish();
      if (target) onDrop(todo.id, target);
    };

    stopRef.current = stop;
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", escape);
    window.addEventListener("blur", finish);
  }

  function preventDragClick(event: MouseEvent) {
    if (suppressClick.current && event.detail !== 0) event.preventDefault();
    suppressClick.current = false;
  }

  return { boardRef, previewRef, preview, over, begin, preventDragClick };
}
