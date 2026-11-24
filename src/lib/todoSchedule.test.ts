import { describe, expect, it } from "vitest";
import { getStudyWeek, groupTodos, moveTodo } from "./todoSchedule";

const tasks = [
  { id: "first", text: "Physics", day: "الاثنين", done: false },
  { id: "second", text: "Chemistry", day: "Monday", done: false },
  { id: "third", text: "English", day: "Tuesday", done: true },
  { id: "parent", text: "Math", day: "Monday", done: false, source: "parent" },
  { id: "inbox", text: "Biology", done: false },
];

describe("the weekly study calendar", () => {
  it("starts the week on Saturday at Baghdad midnight", () => {
    expect(getStudyWeek(new Date("2026-11-20T20:59:59Z")).find((day) => day.isToday)?.key).toBe("Friday");
    const week = getStudyWeek(new Date("2026-11-20T21:00:00Z"));
    expect(week[0]).toMatchObject({ key: "Saturday", dateKey: "2026-11-21", isToday: true });
    expect(week[6].dateKey).toBe("2026-11-27");
  });

  it("moves finished or unfinished tasks across days without dropping their fields", () => {
    const updated = moveTodo(tasks, "third", { day: "Monday", beforeId: "second" });
    expect(groupTodos(updated).get("Monday")?.map((item) => item.id)).toEqual(["first", "third", "second", "parent"]);
    expect(updated.find((item) => item.id === "third")).toEqual({ ...tasks[2], day: "Monday" });
    expect(groupTodos(moveTodo(updated, "third", { day: "unscheduled", beforeId: null })).get("unscheduled")?.map((item) => item.id))
      .toEqual(["inbox", "third"]);
  });

  it("reorders tasks using legacy day names and keeps parent-assigned days fixed", () => {
    expect(moveTodo(tasks, "first", { day: "Monday", beforeId: "second" })).toBe(tasks);
    expect(moveTodo(tasks, "parent", { day: "Tuesday", beforeId: null })).toBe(tasks);
    const updated = moveTodo(tasks, "parent", { day: "Monday", beforeId: "first" });
    expect(groupTodos(updated).get("Monday")?.map((item) => item.id)).toEqual(["parent", "first", "second"]);
  });
});
