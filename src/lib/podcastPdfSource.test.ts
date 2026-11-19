import { expect, it } from "vitest";
import { readPodcastPdf } from "../../supabase/functions/_shared/podcastPdfSource";

it("accepts PDF text and scanned page images without a YouTube link", () => {
  expect(
    readPodcastPdf({
      pdf_name: "lesson.pdf",
      pdf_text: "معلومة علمية ".repeat(20),
      pdf_images: [],
    })?.name,
  ).toBe("lesson.pdf");
  expect(
    readPodcastPdf({
      pdf_name: "scan.PDF",
      pdf_text: "",
      pdf_images: ["data:image/jpeg;base64,YQ=="],
    })?.images,
  ).toHaveLength(1);
  expect(readPodcastPdf({ youtube_url: "legacy" })).toBeNull();
});

it("rejects oversized or empty sources and invalid page URLs", () => {
  expect(() =>
    readPodcastPdf({ pdf_name: "lesson.pdf", pdf_text: "a".repeat(90001) }),
  ).toThrow();
  expect(() =>
    readPodcastPdf({ pdf_name: "lesson.pdf", pdf_images: [] }),
  ).toThrow();
  expect(() =>
    readPodcastPdf({
      pdf_name: "lesson.pdf",
      pdf_images: ["https://example.com/page.png"],
    }),
  ).toThrow();
  expect(() =>
    readPodcastPdf({
      pdf_name: "lesson.pdf",
      pdf_images: Array(21).fill("data:image/jpeg;base64,YQ=="),
    }),
  ).toThrow();
});
