import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { paginateBooklet } from "./paginate";
import type { PdfSettings } from "./model";

const settings: PdfSettings = { title: "Booklet", student: "Student", subtitle: "Physics", language: "ar", template: "revision", fontSize: 16, answers: "end" };
// jsdom does not lay out CSS. Model height independently of the pagination algorithm.
function height(element: Element): number {
  if (element.hasAttribute("data-height")) return Number(element.getAttribute("data-height"));
  if (element.children.length) return [...element.children].reduce((total, child) => total + height(child), 0);
  return Array.from(element.textContent ?? "").length * 2;
}
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("pdf-sheet-body") ? Math.max(928, height(this)) : height(this);
  });
});
afterEach(() => { vi.restoreAllMocks(); document.body.replaceChildren(); });
const source = (html: string) => { const root = document.createElement("div"); root.innerHTML = html; return root; };
describe("A4 pagination", () => {
  it("moves a complete question and its choices together and keeps its section heading", () => {
    const root = source('<div class="pdf-unit" data-height="150">Intro</div><h2 class="pdf-unit pdf-section-title" data-height="50">Section</h2><article class="pdf-unit" data-height="800"><p>Question</p><ol><li>Choice A</li><li>Choice B</li></ol></article>');
    const result = paginateBooklet(root, settings);
    expect(result.pages).toHaveLength(2);
    expect(result.pages[0].querySelector(".pdf-sheet-body")?.textContent).toBe("Intro");
    expect(result.pages[1].querySelector(".pdf-sheet-body")?.textContent).toBe("SectionQuestionChoice AChoice B");
    expect(result.pages[1].querySelectorAll("li")).toHaveLength(2);
    expect(result.pages[1].querySelector("footer")?.textContent).toBe("Physics2 / 2");
    expect(result.host.dir).toBe("rtl");
    result.dispose();
    expect(document.querySelector(".pdf-measure")).toBeNull();
  });
  it("preserves every Unicode character of a very long answer across pages", () => {
    const full = "الجواب العلمي 🧪 x² + y² = z². ".repeat(150);
    const root = source('<p class="pdf-unit"></p>'); root.firstElementChild!.textContent = full;
    const result = paginateBooklet(root, settings);
    expect(result.pages.length).toBeGreaterThan(2);
    expect(result.pages.map(page => page.querySelector(".pdf-sheet-body")?.textContent).join("")).toBe(full);
    expect(result.pages.every(page => page.querySelector<HTMLElement>(".pdf-sheet-body")!.scrollHeight <= 929)).toBe(true);
  });
  it("adds a signature cover and starts the answer key on a new page", () => {
    const root = source('<div class="pdf-unit">Question content</div><h2 class="pdf-unit pdf-section-title pdf-answer-heading">Answer key</h2><p class="pdf-unit">The answer</p>');
    const result = paginateBooklet(root, { ...settings, template: "tamayzak" });
    expect(result.pages).toHaveLength(3);
    expect(result.pages[0].classList.contains("pdf-cover")).toBe(true);
    expect(result.pages[0].textContent).toContain("Student");
    expect(result.pages[1].querySelector(".pdf-sheet-body")?.textContent).toBe("Question content");
    expect(result.pages[2].querySelector(".pdf-sheet-body")?.textContent).toBe("Answer keyThe answer");
  });
});
