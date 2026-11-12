import { describe, expect, it } from "vitest";
import { getNadiaNavigationItems } from "./nadiaTeacherContent";
import { getNadiaYouTubeLectures, NADIA_YOUTUBE_LECTURE_GROUPS } from "./nadiaYouTubeLectures";

const teacher = "nadia-al-nuaimy";
const ids = (key: string) => getNadiaYouTubeLectures(teacher, key).map((video) => video.videoId);

describe("Nadia's verified YouTube catalog", () => {
  it("only targets visible study topics, with valid IDs and no repeated video in a topic", () => {
    const links = new Set<string>();
    for (const group of NADIA_YOUTUBE_LECTURE_GROUPS) {
      const visible = getNadiaNavigationItems(group.curriculum, group.chapter).map((item) => item.lecture);
      for (const video of group.videos) {
        expect(video.videoId).toMatch(/^[\w-]{11}$/);
        expect(group.playlistId).toMatch(/^PL[\w-]+$/);
        for (const topic of video.topics) {
          expect(visible).toContain(topic);
          const key = `${group.curriculum}:${group.chapter}:${topic}:${video.videoId}`;
          expect(links.has(key), key).toBe(false);
          links.add(key);
        }
      }
    }
  });

  it("matches scientific topics rather than reusing YouTube lecture numbers", () => {
    expect(ids("nadia-ar-ch1-lec12-study")).toEqual(["mGsCyjlwkcU"]); // YouTube lecture 11.
    expect(ids("nadia-en-ch3-lec6-study")).toEqual(["oAWP_Ndj5IA"]); // Paramecium, YouTube part 8.
    expect(ids("nadia-en-ch3-lec7-study")).toEqual(["xzazuRlu2z0"]); // Bacterial conjugation, part 6.
    expect(ids("nadia-ar-ch3-lec30-study")).toEqual(["f0UMJhVTA8I"]); // Fertilization, not the female anatomy lecture.
    expect(ids("nadia-en-ch5-lec18-study")).toEqual(["2JCyHFW-5Zw"]); // RNA, YouTube lecture 25.
  });

  it("keeps curricula separate and excludes exams, other teachers and invalid keys", () => {
    expect(ids("nadia-ar-ch3-lec9-study")).toEqual(["3AKLKDxRz_4"]);
    expect(ids("nadia-en-ch3-lec9-study")).toEqual(["O_1vwmxKZ3o"]);
    expect(ids("nadia-en-ch3-lec9-exam")).toEqual([]);
    expect(getNadiaYouTubeLectures("another-teacher", "nadia-en-ch3-lec9-study")).toEqual([]);
    expect(ids("nadia-en-ch6-lec1-study")).toEqual([]);
    expect(ids("nadia-en-ch3-lec0-study")).toEqual([]);
  });

  it("retains every part of multi-part topics and explicitly marks partial coverage", () => {
    expect(ids("nadia-en-ch2-lec10-study")).toEqual(["3buRMu6fRXk", "F8VqQ8fyxuo", "LWhAb30K-50"]);
    expect(ids("nadia-ar-ch4-lec9-study")).toEqual(["235orb9cyBs", "-JwFr2xop5w"]);
    expect(getNadiaYouTubeLectures(teacher, "nadia-en-ch4-lec11-study")[0].remainingCoverage).toContain("nanotechnology");
    expect(ids("nadia-en-ch4-lec8-study")).toEqual([]); // No verified birth-spacing lecture.
    expect(ids("nadia-en-ch4-lec12-study")).toEqual([]); // No verified freezing-techniques lecture.
  });
});
