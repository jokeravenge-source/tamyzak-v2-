import type { NadiaChapterNumber, NadiaCurriculum } from "./nadiaTeacherContent";

/** Public lectures from Nadia's own channel, checked against their board content.
 * Topic numbers are Tamayzak navigation IDs, NOT YouTube lecture numbers.
 * Keep the provenance and any remaining gaps in docs/nadia-youtube-catalog.md.
 */
export const NADIA_YOUTUBE_CHANNEL_ID = "UCFSawGyoCK6PjXSTZCT0TmQ";
export const NADIA_YOUTUBE_VERIFIED_AT = "2026-11-12T00:00:00Z";

type LectureSource = {
  topics: readonly number[];
  videoId: string;
  title: string;
  /** This lecture covers the named part, but the topic still needs more video. */
  remainingCoverage?: string;
};
type LectureGroup = {
  curriculum: NadiaCurriculum;
  chapter: NadiaChapterNumber;
  playlistId: string;
  videos: readonly LectureSource[];
};

export const NADIA_YOUTUBE_LECTURE_GROUPS: readonly LectureGroup[] = [
  {
    curriculum: "ar", chapter: 1, playlistId: "PLHkVwxlbqrZlocDBRf-AtPWhzvRhVp7fJ",
    videos: [
      { topics: [12], videoId: "mGsCyjlwkcU", title: "الجسيم المركزي والجسيم الحركي" },
    ],
  },
  {
    curriculum: "ar", chapter: 3, playlistId: "PLHkVwxlbqrZmWaxoPy585si-Qpi5jWvXM",
    videos: [
      { topics: [9], videoId: "3AKLKDxRz_4", title: "التكاثر الجنسي في الباراميسيوم" },
      { topics: [10], videoId: "vtZ_WCWXrRY", title: "التكاثر في اليوغلينا والفطريات" },
      { topics: [12], videoId: "XJ4R28vqakc", title: "التكاثر في الحزازيات" },
      { topics: [13], videoId: "QECy97t-mgs", title: "التكاثر في السرخسيات" },
      { topics: [14], videoId: "NOxhfysPuSU", title: "تركيب الزهرة" },
      { topics: [15], videoId: "BB_leSWmJ0I", title: "تصنيف الأزهار وأحاديات وثنائيات الفلقة" },
      { topics: [16], videoId: "Tnx8iNCFvJM", title: "المتك وتكوين حبوب اللقاح" },
      { topics: [17], videoId: "g3RyVIlXuWk", title: "المبيض وتكوين البويضات" },
      { topics: [18], videoId: "RowMeRqBBD4", title: "التلقيح" },
      { topics: [19], videoId: "MUGxj8fYJ_M", title: "تكوين أنبوب اللقاح" },
      { topics: [20], videoId: "Lkx2ZSsqxfc", title: "الإخصاب وتكوين الجنين" },
      { topics: [21], videoId: "qn6RnCYoEGw", title: "تكوين البذرة" },
      { topics: [22], videoId: "qtjcrPc8mKA", title: "تكوين الثمرة والإثمار العذري" },
      { topics: [23], videoId: "UjjsxA01pOw", title: "تركيب الثمرة وأنواعها وانتشار البذور" },
      { topics: [24], videoId: "LvLIPa1lYuE", title: "التكاثر في الحشرات — الجزء الأول" },
      { topics: [25], videoId: "RD5vjBpZYno", title: "التكاثر في الحشرات — الجزء الثاني" },
      { topics: [26], videoId: "AH5mY4H9ZTA", title: "التكاثر في الضفدع — الجزء الأول" },
      { topics: [27], videoId: "fxUGT9RrDHY", title: "التكاثر في الضفدع — الجزء الثاني" },
      { topics: [28], videoId: "OMbh5H6p4b0", title: "الجهاز التناسلي الذكري في الإنسان" },
      { topics: [29], videoId: "jqqA4aFx_-k", title: "تركيب النطفة وانتقالها في الإنسان" },
      { topics: [30, 31], videoId: "f0UMJhVTA8I", title: "الإخصاب والحمل في الإنسان" },
      { topics: [32], videoId: "7CoZWLnl4qo", title: "الدورة الحيضية والتغيرات المبيضية" },
      { topics: [33], videoId: "IFkeJXiIHw4", title: "الدورة الرحمية" },
      { topics: [34], videoId: "ZlLc6PJXwLs", title: "التكاثر العذري والخنثي" },
    ],
  },
  {
    curriculum: "ar", chapter: 4, playlistId: "PLHkVwxlbqrZna5tY_OjSMPfeF9QwiN5Cw",
    videos: [
      { topics: [9], videoId: "235orb9cyBs", title: "الاستنساخ في الحيوان" },
      { topics: [9], videoId: "-JwFr2xop5w", title: "تقنيات علاج العقم والإخصاب المساعد" },
    ],
  },
  {
    curriculum: "en", chapter: 1, playlistId: "PLHkVwxlbqrZn7fODiZKQzbkpKO2H9U4Dl",
    videos: [
      { topics: [18, 22], videoId: "7eTPJKsrtIM", title: "Osmosis, Osmotic Pressure, and the Funnel Experiment" },
      { topics: [19, 22], videoId: "H8EdianMC_0", title: "Solution Concentrations and Plasmolysis" },
      { topics: [22], videoId: "QxEtRRH_lY0", title: "Material Exchange — Permeability and Membrane Types" },
      { topics: [22], videoId: "WQ2htJJWeCM", title: "Material Exchange — Active Transport and Phagocytosis" },
      { topics: [22], videoId: "iM2ZIJgyToY", title: "Material Exchange — Pinocytosis and Exocytosis" },
      { topics: [27], videoId: "7KoooJQX28I", title: "Mitosis — Interphase and Prophase" },
      { topics: [28], videoId: "GaP5XHGrcz8", title: "Mitosis — Metaphase and Anaphase" },
    ],
  },
  {
    curriculum: "en", chapter: 2, playlistId: "PLHkVwxlbqrZnSC_rE4UFGsDGXj14YiPyG",
    videos: [
      { topics: [1], videoId: "IXHbE1-wXEw", title: "Meristematic Tissue" },
      { topics: [2], videoId: "6cVLH2zZ0Eg", title: "Ground Tissue" },
      { topics: [3, 4], videoId: "mk8hrEOF40Q", title: "Epidermal and Vascular Tissues" },
      { topics: [5], videoId: "sqww-x24ttY", title: "Animal Tissues and Simple Epithelium" },
      { topics: [5], videoId: "WI9S9GsEtJM", title: "Stratified Epithelium" },
      { topics: [6], videoId: "m_3-nJzoMh0", title: "Connective Tissue Cells" },
      { topics: [7], videoId: "tL_g85hGrYE", title: "Connective Tissue Fibers and Tissue Types" },
      { topics: [8], videoId: "4iondJuynJ0", title: "Cartilage" },
      { topics: [9], videoId: "D5teWKiIC7M", title: "Bone" },
      { topics: [10], videoId: "3buRMu6fRXk", title: "Blood — Part 1" },
      { topics: [10], videoId: "F8VqQ8fyxuo", title: "Blood — Part 2" },
      { topics: [10], videoId: "LWhAb30K-50", title: "Blood — Part 3" },
      { topics: [11], videoId: "BNjcgkHaahk", title: "Muscular Tissue" },
    ],
  },
  {
    curriculum: "en", chapter: 3, playlistId: "PLHkVwxlbqrZlVyKP1be6kqUSrJSAp8NEe",
    videos: [
      { topics: [1], videoId: "X9Rp3gawMsQ", title: "Introduction to Reproduction" },
      { topics: [2], videoId: "1OAKAhNITTE", title: "Spermatogenesis" },
      { topics: [3], videoId: "XuXZXY-ODJc", title: "Oogenesis" },
      { topics: [4], videoId: "ZOESZVaFhqU", title: "Viral Reproduction" },
      { topics: [5], videoId: "fyEizwyAt_U", title: "Asexual Reproduction in Bacteria" },
      { topics: [6], videoId: "oAWP_Ndj5IA", title: "Asexual Reproduction in Paramecium" },
      { topics: [7], videoId: "xzazuRlu2z0", title: "Bacterial Conjugation" },
      { topics: [8], videoId: "4MYVmg30Ra4", title: "Reproduction in Chlamydomonas" },
      { topics: [9], videoId: "O_1vwmxKZ3o", title: "Sexual Reproduction in Paramecium" },
      { topics: [10], videoId: "jDUaxRABtUQ", title: "Reproduction in Euglena and Fungi" },
      { topics: [11], videoId: "Lu0Y9cDcr7I", title: "Land Plants and Alternation of Generations" },
      { topics: [12], videoId: "1DStrZcal7E", title: "Reproduction in Polytrichum" },
      { topics: [13], videoId: "I7tP_sBexxU", title: "Reproduction in Polypodium" },
      { topics: [14], videoId: "fGnUwaB668Y", title: "Flower Structure" },
      { topics: [16], videoId: "_WF0-yXgxPw", title: "Anther and Pollen Grain Formation" },
      { topics: [17], videoId: "SwcIw4XwyjE", title: "Ovule and Embryo Sac Formation" },
      { topics: [18], videoId: "cJg4vNwizoA", title: "Pollination" },
      { topics: [19, 20], videoId: "cBX-iGUeolk", title: "Pollen Tube Growth and Double Fertilization" },
      { topics: [21], videoId: "b6Rx2mVJskw", title: "Seed Formation" },
      { topics: [22], videoId: "gEliwP_mBpA", title: "Fruit Formation" },
      { topics: [23], videoId: "jsKUB0MxoFc", title: "Fruit Classification and Seed Dispersal" },
      { topics: [24], videoId: "z4Bgfd47yR0", title: "Reproduction in Insects — Part 1" },
      { topics: [25], videoId: "Kjg2JqvJAjI", title: "Reproduction in Insects — Part 2" },
      { topics: [26], videoId: "7lbw126lSvE", title: "Reproduction in Frogs — Part 1" },
      { topics: [27], videoId: "GK06qHOv_Ck", title: "Reproduction in Frogs — Part 2" },
      { topics: [28], videoId: "XgbPpYGbZx4", title: "Human Male Reproductive System" },
      { topics: [29], videoId: "22OvPN_mB0g", title: "Human Sperm Formation and Structure" },
      { topics: [30], videoId: "SeoC9N9bck4", title: "Human Fertilization and Pregnancy" },
      { topics: [31], videoId: "rOWkqOQXV3w", title: "Menstrual Cycle — Part 1" },
      { topics: [32], videoId: "9ndg2suPxuo", title: "Menstrual Cycle — Part 2" },
      { topics: [33], videoId: "rmHjt3aU-oI", title: "Parthenogenesis", remainingCoverage: "A matching lecture on hermaphroditism is still needed." },
    ],
  },
  {
    curriculum: "en", chapter: 4, playlistId: "PLHkVwxlbqrZniAZjfoDM5CYTfrCI5wIBO",
    videos: [
      { topics: [1, 4], videoId: "_0dnoSq1TR0", title: "Embryonic Development and Cell Differentiation" },
      { topics: [2], videoId: "03Go1-6sc5w", title: "Cleavage, Gastrulation, and Germ Layers" },
      { topics: [3, 4], videoId: "fHR16t1dGFI", title: "Morphogenesis and the History of Embryology" },
      { topics: [3, 4], videoId: "Ki06pgpB3hw", title: "Embryological Experiments and Embryonic Induction" },
      { topics: [10], videoId: "Ki06pgpB3hw", title: "Experimental Embryology", remainingCoverage: "A matching lecture on molecular embryology is still needed." },
      { topics: [5], videoId: "oHFUOQ7ccfc", title: "Congenital Malformations — Part 1" },
      { topics: [5], videoId: "oJ_IJnBDYXg", title: "Congenital Malformations — Part 2" },
      { topics: [6], videoId: "AuUqE8gZsOg", title: "Twins and Multiple Births" },
      { topics: [7], videoId: "h_CCuj5BBy0", title: "Stem Cells" },
      { topics: [9], videoId: "XpBG7g1mLHk", title: "Infertility and Assisted Reproduction" },
      { topics: [11], videoId: "H1xIYg-8-nQ", title: "Animal Cloning", remainingCoverage: "A matching lecture on nanotechnology is still needed." },
    ],
  },
  {
    curriculum: "en", chapter: 5, playlistId: "PLHkVwxlbqrZkdpG41_A3Fa2x6x8gNwubw",
    videos: [
      { topics: [18], videoId: "2JCyHFW-5Zw", title: "RNA Structure, Types, and Functions" },
      { topics: [19], videoId: "cxO7dfsZ_ac", title: "Genetic Code and Transcription" },
    ],
  },
  {
    curriculum: "en", chapter: 5, playlistId: "PLHkVwxlbqrZnyiW8oFxIFlkp0IyAK6Vr_",
    videos: [
      { topics: [19], videoId: "enSIbgoLgEU", title: "Steps of Transcription" },
      { topics: [21], videoId: "QvjsKpJ6LLk", title: "Genetic Engineering and Its Applications" },
    ],
  },
];

export function getNadiaYouTubeLectures(teacherId: string, topicKey: string): readonly LectureSource[] {
  if (teacherId !== "nadia-al-nuaimy") return [];
  const match = /^nadia-(ar|en)-ch([1-5])-lec([1-9]\d*)-study$/.exec(topicKey);
  if (!match) return [];
  return NADIA_YOUTUBE_LECTURE_GROUPS
    .filter((group) => group.curriculum === match[1] && group.chapter === Number(match[2]))
    .flatMap((group) => group.videos.filter((video) => video.topics.includes(Number(match[3]))));
}
