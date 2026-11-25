import { boardRecord, boardText, parseBoardLesson, type BoardAnswer, type BoardFocus, type BoardLesson, type BoardSource } from "./whiteboard.ts";

const MAX_PAGE_CHARS = 12_000;
const fieldLaw = /\bE\s*(?:[_ₖ]\s*)?[kK]?\s*=\s*E\s*[/⁄]\s*[kK]\b/u;
const potentialLaw = /\bE\s*=\s*[(]?\s*[Δ∆]?\s*V\s*[/⁄]\s*d\b|[Δ∆]\s*V\s*=\s*E\s*[·×]?\s*d\b/iu;
const polarization = /positive\s+charge.{0,150}negative\s+plate|(?:field|polarization).{0,75}oppos(?:es|ite|ing)|شحن(?:ة|ات)\s+موجب.{0,130}(?:لوح|صفيح).{0,28}سالب|مجال.{0,95}(?:معاكس|يعاكس|بعكس)/iu;
const connected = /(?:remains?|stays?|still|is)\s+connected\s+to.{0,20}(?:battery|source)|(?:تبقى|بقيت|تبقي|ما زالت)\s+متصل.{0,65}(?:مصدر|بطاري)/iu;
const disconnected = /\bdisconnect(?:ed)?\b|(?:مفصول|فصلت).{0,35}(?:بطاري|مصدر)/iu;

export function selectedBoardPdfSource(value: unknown): BoardSource | null {
  const file = boardRecord(value);
  if (file?.selectedPage !== true || !Array.isArray(file.pages) || file.pages.length !== 1) return null;
  const selected = boardRecord(file.pages[0]);
  const page = selected?.page;
  const title = boardText(file.name, 240);
  const excerpt = typeof selected?.text === "string" ? boardText(selected.text.slice(0, MAX_PAGE_CHARS), MAX_PAGE_CHARS) : null;
  if (!title || !excerpt || excerpt.length < 8 || typeof page !== "number" || !Number.isInteger(page) || page < 1 || page > 10000) return null;
  return { id: "pdf:" + page, kind: "pdf", title, excerpt, pdfPage: page };
}

function excerptAround(text: string, match: RegExpExecArray) {
  const low = Math.max(0, match.index - 75);
  const space = text.indexOf(" ", low);
  const start = low > 0 && space >= 0 && space < match.index ? space + 1 : low;
  const high = Math.min(text.length, match.index + match[0].length + 65, start + 360);
  const lastSpace = text.lastIndexOf(" ", high);
  const end = high < text.length && lastSpace > match.index + match[0].length ? lastSpace : high;
  return text.slice(start, end).trim();
}

export function dielectricPageLesson(source: BoardSource | null, language: "ar" | "en"): BoardLesson | null {
  if (source?.kind !== "pdf") return null;
  const text = source.excerpt;
  const field = fieldLaw.exec(text);
  const polarized = polarization.exec(text);
  if (!field || !polarized || !/capacitor|متسع|مكثف/iu.test(text) || !/dielectric|عازل/iu.test(text)) return null;
  // A statement about a battery-connected capacitor cannot support the isolated-case comparison.
  if (connected.test(text) && !disconnected.test(text)) return null;
  const fieldRef = { sourceId: source.id, quote: excerptAround(text, field) };
  const polarRef = { sourceId: source.id, quote: excerptAround(text, polarized) };
  const en = language === "en";
  const steps = [
    {
      title: en ? "Isolated capacitor" : "متسعة مفصولة عن المصدر",
      narration: "خل نرسم لوحين، واحد موجب وواحد سالب. بهالحالة المتسعة مفصولة عن البطارية والمسافة ثابتة. المجال الأصلي يتجه من اللوح الموجب للسالب.",
      reference: fieldRef,
      actions: [
        { kind: "reveal", target: "plates", at: .07 },
        { kind: "reveal", target: "field", at: .75 },
      ],
    },
    {
      title: en ? "Insert the dielectric" : "دخول العازل واستقطابه",
      narration: "هسه ندخل العازل بين اللوحين. يستقطب، فيظهر على سطحه القريب من اللوح الموجب شحنات سالبة مرتبطة، وعلى السطح المقابل شحنات موجبة. مجال العازل يصير بعكس اتجاه المجال الأصلي.",
      reference: polarRef,
      actions: [
        { kind: "reveal", target: "dielectric", at: .08 },
        { kind: "reveal", target: "polarization", at: .45 },
        { kind: "highlight", target: "polarization", at: .78 },
      ],
    },
    {
      title: en ? "The net field drops" : "المجال المحصّل يقل",
      narration: "مجال الاستقطاب يعاكس المجال الأصلي، فالمحصّلة تصغر. إذا العازل يملي الفراغ كله، نكتب المجال الجديد يساوي المجال الأصلي مقسوم على ثابت العزل كي.",
      reference: fieldRef,
      actions: [
        { kind: "reveal", target: "net-field", at: .25 },
        { kind: "equation", text: "Eₖ = E / k", at: .66 },
        { kind: "highlight", target: "equation", at: .90 },
      ],
    },
  ];
  const voltage = potentialLaw.exec(text);
  if (voltage) steps.push({
    title: en ? "Why the voltage also drops" : "ليش فرق الجهد هم يقل؟",
    narration: "فرق الجهد بين اللوحين يساوي المجال مضروب بالمسافة. مادامت المتسعة مفصولة عن البطارية والمسافة ثابتة، إذا المجال صار واحد على كي من قيمته، فرق الجهد هم يصير واحد على كي.",
    reference: { sourceId: source.id, quote: excerptAround(text, voltage) },
    actions: [
      { kind: "equation", text: "ΔV = Ed", at: .09 },
      { kind: "highlight", target: "net-field", at: .58 },
      { kind: "equation", text: "ΔVₖ = ΔV / k", at: .78 },
    ],
  });
  return parseBoardLesson({ title: en ? "Dielectric between capacitor plates" : "العازل بين لوحي المتسعة", steps }, [source], "dielectric-plates");
}

export function reviewedDielectricAnswer(lesson: BoardLesson, question: string, visible: readonly BoardFocus[]): BoardAnswer | null {
  if (lesson.template !== "dielectric-plates" || !/\b(?:why|how)\b|ليش|شلون|لماذا|كيف/iu.test(question)
    || /\b(?:connected|capacitance|charge|insert)\b|سعة|شحنة|متصلة/iu.test(question)) return null;
  const voltageQuestion = /voltage|potential difference|فرق الجهد|الفولت/iu.test(question);
  const fieldQuestion = /electric field|\bfield\b|المجال/iu.test(question);
  if (!voltageQuestion && !fieldQuestion) return null;
  const step = lesson.steps[voltageQuestion ? 3 : 2];
  if (!step) return null;
  const relevant: BoardFocus[] = voltageQuestion ? ["equation", "net-field"] : ["polarization", "net-field", "dielectric"];
  const highlight = relevant.find(target => visible.includes(target));
  if (!highlight) return null;
  return {
    reply: voltageQuestion
      ? "فرق الجهد يساوي المجال في المسافة. بالحالة المفصولة عن البطارية، المسافة ثابتة والمجال يقل إلى واحد على كي، ففرق الجهد يقل بنفس النسبة."
      : "الشحنات المرتبطة على سطحي العازل تسوّي مجال بعكس الأصلي. المجالين يتعاكسن، فالمجال المحصّل يصغر.",
    reference: voltageQuestion ? step.reference : lesson.steps[1].reference,
    highlight,
  };
}
