import type { PdfSettings } from "./model";

export type RenderedBooklet = { pages: HTMLElement[]; host: HTMLElement; dispose: () => void };
const BODY_HEIGHT = 928;

/** Lay out at real A4 width. Split oversized content at text boundaries, never crop it. */
export function paginateBooklet(source: HTMLElement, settings: PdfSettings): RenderedBooklet {
  const host = document.createElement("div");
  host.className = "pdf-measure pdf-document"; host.dataset.template = settings.template;
  host.style.setProperty("--pdf-font-size", `${settings.fontSize}px`); host.dir = settings.language === "ar" ? "rtl" : "ltr";
  document.body.appendChild(host);
  const pages: HTMLElement[] = [];
  let body: HTMLElement;
  const text = (tag: string, value: string) => { const element = document.createElement(tag); element.textContent = value; return element; };
  const newPage = () => {
    const page = document.createElement("article"); page.className = "pdf-sheet";
    const header = document.createElement("header"); header.className = "pdf-sheet-header";
    header.append(text("b", "TAMAYZAK"), text("span", settings.title));
    body = document.createElement("div"); body.className = "pdf-sheet-body";
    const footer = document.createElement("footer"); footer.className = "pdf-sheet-footer";
    footer.append(text("span", settings.subtitle), text("span", ""));
    page.append(header, body, footer); host.append(page); pages.push(page);
  };
  if (settings.template === "tamayzak") {
    const cover = document.createElement("article"); cover.className = "pdf-sheet pdf-cover";
    const brand = text("p", "TAMAYZAK / تميّزك"); brand.className = "pdf-cover-brand";
    const subtitle = text("p", settings.subtitle); subtitle.className = "pdf-cover-subtitle";
    const detail = text("p", settings.student); detail.className = "pdf-cover-detail";
    cover.append(brand, text("h1", settings.title), subtitle, detail); host.append(cover); pages.push(cover);
  }
  newPage();
  const fits = () => body.scrollHeight <= BODY_HEIGHT + 1;
  const place = (element: HTMLElement) => {
    // Keep section headings with the following question whenever practical.
    body.append(element);
    if (fits()) return;
    element.remove();
    if (body.children.length) {
      const previous = body.lastElementChild;
      const heading = previous?.classList.contains("pdf-section-title") ? previous : null;
      heading?.remove();
      if (body.children.length) newPage();
      if (heading) body.append(heading);
    }
    body.append(element);
    if (fits()) return;
    element.remove();
    // Very long question/answer blocks continue on later pages, retaining their text and styles.
    if (element.children.length) {
      for (const child of [...element.children]) place(child as HTMLElement);
      return;
    }
    const characters = Array.from(element.textContent ?? "");
    let offset = 0;
    while (offset < characters.length) {
      const part = element.cloneNode(false) as HTMLElement;
      body.append(part);
      let low = 1, high = characters.length - offset, best = 0;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        part.textContent = characters.slice(offset, offset + middle).join("");
        if (fits()) { best = middle; low = middle + 1; } else high = middle - 1;
      }
      if (!best) { part.remove(); if (!body.children.length) throw new Error("unprintable_content"); newPage(); continue; }
      // Prefer a word boundary, preserving every original character in the continuation.
      const candidate = characters.slice(offset, offset + best).join("");
      const boundary = candidate.search(/\s+\S*$/u);
      if (offset + best < characters.length && boundary > best / 2) best = Array.from(candidate.slice(0, boundary + 1)).length;
      part.textContent = characters.slice(offset, offset + best).join(""); offset += best;
      if (offset < characters.length) newPage();
    }
  };
  try {
    const units = [...source.querySelectorAll<HTMLElement>(".pdf-unit")];
    for (const unit of units) {
      if (unit.classList.contains("pdf-answer-heading") && body.children.length) newPage();
      place(unit.cloneNode(true) as HTMLElement);
    }
    pages.forEach((page, index) => {
      const footer = page.querySelector(".pdf-sheet-footer");
      if (footer?.lastElementChild) footer.lastElementChild.textContent = `${index + 1} / ${pages.length}`;
    });
    return { pages, host, dispose: () => host.remove() };
  } catch (error) { host.remove(); throw error; }
}
