import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ScienceEvidenceCard from "./ScienceEvidenceCard";
import type { ScienceSource } from "../../supabase/functions/_shared/scienceEvidence";
afterEach(cleanup);
const source: ScienceSource = { id: "1", academic_year: "2026-2027", curriculum: "ar", subject: "physics", question: "fixture question", excerpt: "fixture excerpt", book_title: "Fixture textbook", book_edition: "2026-2027", chapter: "الفصل الأول", printed_page: 42, pdf_page: 46, book_url: "https://example.test/book", classification: "curriculum", classification_url: "https://example.test/syllabus", exams: [{ year: 2023, round: "الدور الأول", url: "https://example.test/exam" }] };
describe("science source card", () => {
  it("shows uncertainty without claiming absence or enrichment", () => {
    render(<ScienceEvidenceCard ar evidence={{ academicYear: "2026-2027", sources: [] }} />);
    expect(screen.getByText("صفحة الكتاب: غير متحقق")).toBeInTheDocument();
    expect(screen.getByText("تصنيف السؤال: غير متحقق")).toBeInTheDocument();
    expect(screen.getByText("الورود الوزاري المطابق: غير متحقق")).toBeInTheDocument();
  });
  it("keeps printed/PDF pages separate and displays an evidenced exact exam occurrence", () => {
    render(<ScienceEvidenceCard ar evidence={{ academicYear: "2026-2027", sources: [{ ...source, match: "exact" }] }} />);
    expect(screen.getByText("تصنيف السؤال: من المنهج")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /صفحة الكتاب المطبوعة 42.*صفحة ملف PDF 46/ })).toHaveAttribute("href", source.book_url);
    expect(screen.getByRole("link", { name: "2023 · الدور الأول" })).toHaveAttribute("href", "https://example.test/exam");
  });
  it("never treats a related source as proof of classification or an exact ministerial question", () => {
    render(<ScienceEvidenceCard ar={false} evidence={{ academicYear: "2026-2027", sources: [{ ...source, match: "related" }] }} />);
    expect(screen.getByText("Question classification: Unverified")).toBeInTheDocument();
    expect(screen.getByText("Exact ministerial occurrence: Unverified")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Related ministerial question/ })).toBeInTheDocument();
  });
});
