import { describe, expect, it } from "vitest";
import { flashcardsBioCh1NadiaAr } from "./flashcardsBioCh1NadiaAr";
import { flashcardsBioCh2NadiaAr } from "./flashcardsBioCh2NadiaAr";
import { flashcardsBioCh3NadiaAr } from "./flashcardsBioCh3NadiaAr";
import { flashcardsBioCh4NadiaAr } from "./flashcardsBioCh4NadiaAr";
import { flashcardsBioCh5NadiaAr } from "./flashcardsBioCh5NadiaAr";
import { flashcardsBioCh5NadiaEn } from "./flashcardsBioCh5NadiaEn";

const arabicText = /[\u0600-\u06ff]/;

describe("Arabic Nadia Al-Nuaimi Biology decks", () => {
  it("contains all 186 translated Chapter 1 cards", () => {
    expect(flashcardsBioCh1NadiaAr).toHaveLength(186);
    expect(flashcardsBioCh1NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh1NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("uses the Arabic ministerial wording from the supplied Chapter 1 source", () => {
    expect(flashcardsBioCh1NadiaAr.some((card) => card.q.includes("بحسب الملف"))).toBe(false);
    expect(flashcardsBioCh1NadiaAr).toContainEqual({
      q: "علل: تُعرف المايتوكوندريا ببيوت الطاقة في الخلية؟",
      a: "لما لها من علاقة بإنتاج معظم جزيئات أدينوسين ثلاثي الفوسفات (ATP) ذات الطاقة العالية.",
    });
    expect(flashcardsBioCh1NadiaAr).toContainEqual({
      q: "عرّف التناضح؟",
      a: "هو حركة جزيئات الماء خلال غشاء اختياري النفوذية (الغشاء البلازمي) تبعاً لاختلاف التركيز، وتتم حركة جزيئات الماء وفقاً لقانون الانتشار.",
    });
  });

  it("contains all 138 translated Chapter 2 cards", () => {
    expect(flashcardsBioCh2NadiaAr).toHaveLength(138);
    expect(flashcardsBioCh2NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh2NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("uses the Arabic ministerial wording from the supplied Chapter 2 source", () => {
    expect(flashcardsBioCh2NadiaAr.some((card) => card.q.includes("بحسب الملف"))).toBe(false);
    expect(flashcardsBioCh2NadiaAr).toContainEqual({
      q: "ما موقع وأهمية أو وظيفة النسيج المرستيمي القمي؟",
      a: "يوجد في قمم الجذور والسيقان، ووظيفته النمو في قمم الجذور والسيقان.",
    });
    expect(flashcardsBioCh2NadiaAr).toContainEqual({
      q: "علل: تؤدي الخلايا البرنكيمية وظيفة التهوية؟",
      a: "بسبب وجود المسافات البينية بين الخلايا.",
    });
  });

  it("contains all 264 translated Chapter 3 cards", () => {
    expect(flashcardsBioCh3NadiaAr).toHaveLength(264);
    expect(flashcardsBioCh3NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh3NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("uses the Arabic ministerial wording from the supplied Chapter 3 source", () => {
    expect(flashcardsBioCh3NadiaAr.some((card) => card.q.includes("بحسب الملف"))).toBe(false);
    expect(flashcardsBioCh3NadiaAr).toContainEqual({
      q: "ما منشأ الجسم القطبي الثاني؟",
      a: "ينشأ من الانقسام الاختزالي الثاني للخلية البيضية الثانوية.",
    });
    expect(flashcardsBioCh3NadiaAr).toContainEqual({
      q: "عرّف الحويصلة المبيضية؟",
      a: "تركيب يتكون في كثير من الحيوانات وخاصة الفقريات، وينشأ من الخلية البيضية الأولية المحاطة بخلايا صغيرة الحجم تدعى الخلايا الحويصلية.",
    });
    expect(flashcardsBioCh3NadiaAr).toContainEqual({
      q: "علل: تحتوي الأبواغ على نصف العدد الأصلي من الكروموسومات؟ (2018/2–2020/2)",
      a: "لأنها تتكون بالانقسام الاختزالي لخلايا الأبواغ الأم.",
    });
  });

  it("contains all 120 translated Chapter 4 cards", () => {
    expect(flashcardsBioCh4NadiaAr).toHaveLength(120);
    expect(flashcardsBioCh4NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh4NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("uses the Arabic ministerial wording from the supplied Chapter 4 source", () => {
    expect(flashcardsBioCh4NadiaAr.some((card) => card.q.includes("بحسب المصدر"))).toBe(false);
    expect(flashcardsBioCh4NadiaAr).toContainEqual({
      q: "عرّف الخلايا الجذعية؟",
      a: "هي خلايا غير متخصصة تمتلك القدرة على الانقسام والتجدد وإنتاج خلايا متخصصة جديدة تستطيع إصلاح وتعويض خلايا الجسم التالفة.",
    });
    expect(flashcardsBioCh4NadiaAr).toContainEqual({
      q: "علل: تكون نسبة نجاح تجميد البويضة أقل من نسب نجاح تجميد الأجنة؟",
      a: "بسبب أن التجميد قد يؤثر على كروموسومات البويضة.",
    });
    expect(flashcardsBioCh4NadiaAr).toContainEqual({
      q: "متى تستخدم تقنية البنوك المنوية؟",
      a: "للرجال المصابين بأمراض السرطان والمحتاجين إلى العلاج الكيميائي، وللرجال المصابين بأمراض الخصية والمعرضين لاستئصالها، وللرجال المعرضين إلى تناقص الحيوانات المنوية لديهم باستمرار.",
    });
  });

  it("contains all 330 translated Chapter 5 cards", () => {
    expect(flashcardsBioCh5NadiaAr).toHaveLength(330);
    expect(flashcardsBioCh5NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh5NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("uses the Arabic ministerial wording from the supplied Chapter 5 source", () => {
    expect(flashcardsBioCh5NadiaAr.some((card) => card.q.includes("بحسب المصدر"))).toBe(false);
    expect(flashcardsBioCh5NadiaAr).toContainEqual({
      q: "عرّف علم الوراثة؟",
      a: "هو ذلك الفرع من علم الحياة الذي يهتم بدراسة التغايرات الموروثة لكائن حي أو لمجموعة من الكائنات، وكذلك كيفية تعبير المورثات المسؤولة عن تلك التغايرات.",
    });
    expect(flashcardsBioCh5NadiaAr).toContainEqual({
      q: "علل: استعمال التضريب الاختباري؟",
      a: "للتعرف على الطراز الوراثي للفرد الذي يحمل الصفة السائدة المجهولة النقاوة.",
    });
    expect(flashcardsBioCh5NadiaAr).toContainEqual({
      q: "عرّف السيادة المشتركة (المواكبة)؟",
      a: "هي الحالة التي يظهر فيها تأثير كلا الأليلين معاً في الطراز المظهري للفرد الهجين.",
    });
  });

  it("preserves the critical Chapter 5 numbers and genetic notation", () => {
    expect(flashcardsBioCh5NadiaAr[44].a).toBe("14.");
    expect(flashcardsBioCh5NadiaAr[51].a).toBe("8.");
    expect(flashcardsBioCh5NadiaAr[55].a).toBe("46.");
    expect(flashcardsBioCh5NadiaAr[72].a).toBe("1 TT : 2 Tt : 1 tt.");
    expect(flashcardsBioCh5NadiaAr[81].a).toBe("9:3:3:1.");
    expect(flashcardsBioCh5NadiaAr[128].a).toBe("بينهما سيادة مشتركة.");
    expect(flashcardsBioCh5NadiaAr[173].a).toContain("³²P");
    expect(flashcardsBioCh5NadiaAr[175].a).toContain("³⁵S");
    expect(flashcardsBioCh5NadiaAr[214].a).toBe("AGA CAC CTG.");
  });

  it("keeps every numeric value aligned with the Chapter 5 English source", () => {
    const numericTokens = (value: string) => value.match(/\d+(?:\.\d+)?/g) ?? [];

    flashcardsBioCh5NadiaEn.forEach((card, index) => {
      expect(numericTokens(`${flashcardsBioCh5NadiaAr[index].q} ${flashcardsBioCh5NadiaAr[index].a}`))
        .toEqual(numericTokens(`${card.q} ${card.a}`));
    });
  });
});
