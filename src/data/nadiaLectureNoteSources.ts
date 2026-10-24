/**
 * Arabic lecture-note sources used when Nadia's English curriculum does not
 * have its own saved notes yet. Some English topics combine several of the
 * shorter Arabic lectures, so the mapping is intentionally topic-based rather
 * than a simple lecture-number substitution.
 */
const NADIA_ENGLISH_TO_ARABIC_LECTURES: Record<number, Record<number, number[]>> = {
  1: Object.fromEntries(Array.from({ length: 28 }, (_, index) => [index + 1, [index + 1]])),
  2: {
    1: [2],
    2: [3, 4],
    3: [5],
    4: [6, 7],
    5: [8, 9, 10, 11, 12, 13, 14, 15, 16],
    6: [17, 18, 19],
    7: [20, 21, 22],
    8: [23],
    9: [24],
    10: [25, 26, 27, 28],
    11: [29, 30],
  },
  3: {
    1: [1],
    2: [2],
    3: [3],
    4: [4],
    5: [5],
    6: [8],
    7: [6],
    8: [7],
    9: [9],
    10: [10],
    11: [11],
    12: [12],
    13: [13],
    14: [14],
    15: [15],
    16: [16],
    17: [17],
    18: [18],
    19: [19],
    20: [20],
    21: [21],
    22: [22],
    23: [23],
    24: [24],
    25: [25],
    26: [26],
    27: [27],
    28: [28],
    29: [29],
    30: [30, 31],
    31: [32],
    32: [33],
    33: [34],
  },
  4: {
    1: [1],
    2: [2],
    3: [3],
    4: [3],
    5: [4],
    6: [5],
    7: [6],
    8: [5],
    9: [8],
    10: [3],
    11: [6, 7],
    12: [8],
  },
  5: {
    1: [1],
    2: [1],
    3: [2],
    4: [3, 4],
    5: [5, 6, 8, 9],
    6: [7],
    7: [10],
    8: [11, 12],
    9: [13, 14],
    10: [15],
    11: [16],
    12: [17],
    13: [18, 19],
    14: [19],
    15: [15],
    16: [16],
    17: [20, 21],
    18: [22],
    19: [23, 24],
    20: [25],
    21: [21],
  },
};

const ENGLISH_NADIA_STUDY_KEY = /^nadia-en-ch(\d+)-lec(\d+)-study$/;

export function getNadiaArabicLectureNoteSourceKeys(topicKey: string): string[] {
  const match = topicKey.match(ENGLISH_NADIA_STUDY_KEY);
  if (!match) return [];

  const chapter = Number(match[1]);
  const lecture = Number(match[2]);
  const sourceLectures = NADIA_ENGLISH_TO_ARABIC_LECTURES[chapter]?.[lecture] ?? [];

  return sourceLectures.map((sourceLecture) =>
    `nadia-ar-ch${chapter}-lec${sourceLecture}-study`,
  );
}
