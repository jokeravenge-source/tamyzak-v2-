// Source: Chapter_Three_Ionic_Equilibrium_Flashcards_AR(1).txt — Arabic original, 414 cards across 24 topics.
// Keep q/a and verification notes faithful to the supplied text; no unprovided ministerial years.
import { flashcardsChemCh3AhmedNadawi_001_060 } from "./flashcardsChemCh3AhmedNadawi_001_060";
import { flashcardsChemCh3AhmedNadawi_061_120 } from "./flashcardsChemCh3AhmedNadawi_061_120";
import { flashcardsChemCh3AhmedNadawi_121_180 } from "./flashcardsChemCh3AhmedNadawi_121_180";
import { flashcardsChemCh3AhmedNadawi_181_240 } from "./flashcardsChemCh3AhmedNadawi_181_240";
import { flashcardsChemCh3AhmedNadawi_241_300 } from "./flashcardsChemCh3AhmedNadawi_241_300";
import { flashcardsChemCh3AhmedNadawi_301_360 } from "./flashcardsChemCh3AhmedNadawi_301_360";
import { flashcardsChemCh3AhmedNadawi_361_390 } from "./flashcardsChemCh3AhmedNadawi_361_390";
import { flashcardsChemCh3AhmedNadawi_391_414 } from "./flashcardsChemCh3AhmedNadawi_391_414";

export type AhmedNadawiChemCh3Card = {
  id: string;
  q: string;
  a: string;
  topic: string;
  kind: string;
  pages: string;
  sourceNotes?: string;
};

export const ahmedNadawiChemCh3Cards: AhmedNadawiChemCh3Card[] = [
  ...flashcardsChemCh3AhmedNadawi_001_060,
  ...flashcardsChemCh3AhmedNadawi_061_120,
  ...flashcardsChemCh3AhmedNadawi_121_180,
  ...flashcardsChemCh3AhmedNadawi_181_240,
  ...flashcardsChemCh3AhmedNadawi_241_300,
  ...flashcardsChemCh3AhmedNadawi_301_360,
  ...flashcardsChemCh3AhmedNadawi_361_390,
  ...flashcardsChemCh3AhmedNadawi_391_414,
];

export const ahmedNadawiChemCh3Topics = [
  {
    "key": "01",
    "title": "المحاليل المائية والإلكتروليتات",
    "expectedCount": 27
  },
  {
    "key": "02",
    "title": "برونستد-لوري والتأين الذاتي للماء",
    "expectedCount": 13
  },
  {
    "key": "03",
    "title": "حساب pH وpOH للمحاليل القوية",
    "expectedCount": 29
  },
  {
    "key": "04",
    "title": "التخفيف والتغير في pH",
    "expectedCount": 13
  },
  {
    "key": "05",
    "title": "الحوامض الضعيفة ودرجة التأين",
    "expectedCount": 28
  },
  {
    "key": "06",
    "title": "الحوامض متعددة البروتون",
    "expectedCount": 6
  },
  {
    "key": "07",
    "title": "القواعد الضعيفة ودرجة التأين",
    "expectedCount": 20
  },
  {
    "key": "08",
    "title": "الأملاح والتحلل المائي",
    "expectedCount": 9
  },
  {
    "key": "09",
    "title": "الأملاح المتعادلة",
    "expectedCount": 9
  },
  {
    "key": "10",
    "title": "الأملاح القاعدية",
    "expectedCount": 14
  },
  {
    "key": "11",
    "title": "الأملاح الحامضية",
    "expectedCount": 17
  },
  {
    "key": "12",
    "title": "أملاح الحوامض والقواعد الضعيفة",
    "expectedCount": 5
  },
  {
    "key": "13",
    "title": "الأيون المشترك للحامض الضعيف",
    "expectedCount": 26
  },
  {
    "key": "14",
    "title": "الأيون المشترك للقاعدة الضعيفة",
    "expectedCount": 21
  },
  {
    "key": "15",
    "title": "المحاليل المنظمة وآلية عملها",
    "expectedCount": 14
  },
  {
    "key": "16",
    "title": "المنظم الحامضي وإضافة حامض قوي",
    "expectedCount": 12
  },
  {
    "key": "17",
    "title": "المنظم الحامضي وإضافة قاعدة قوية",
    "expectedCount": 12
  },
  {
    "key": "18",
    "title": "المنظم القاعدي وإضافة حامض قوي",
    "expectedCount": 5
  },
  {
    "key": "19",
    "title": "المنظم القاعدي وإضافة قاعدة قوية",
    "expectedCount": 10
  },
  {
    "key": "20",
    "title": "الذوبانية وحاصل ضرب الذوبانية في الماء",
    "expectedCount": 33
  },
  {
    "key": "21",
    "title": "تأثير الأيون المشترك في الذوبانية",
    "expectedCount": 44
  },
  {
    "key": "22",
    "title": "تأثير pH والحرارة في الذوبانية",
    "expectedCount": 17
  },
  {
    "key": "23",
    "title": "حاصل الأيونات وتوقع الترسيب",
    "expectedCount": 22
  },
  {
    "key": "24",
    "title": "بداية الترسيب والترسيب الانتقائي",
    "expectedCount": 8
  }
] as const;
