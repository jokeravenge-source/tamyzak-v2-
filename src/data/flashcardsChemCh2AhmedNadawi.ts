// Source: user-provided Chapter_Two_Chemical_Equilibrium_Flashcards (429 Q/A cards).
// Questions and answers are preserved in English, including recorded caveats, source pages and ministerial years.
import { flashcardsChemCh2AhmedNadawi_001_075 } from "./flashcardsChemCh2AhmedNadawi_001_075";
import { flashcardsChemCh2AhmedNadawi_076_150 } from "./flashcardsChemCh2AhmedNadawi_076_150";
import { flashcardsChemCh2AhmedNadawi_151_225 } from "./flashcardsChemCh2AhmedNadawi_151_225";
import { flashcardsChemCh2AhmedNadawi_226_300 } from "./flashcardsChemCh2AhmedNadawi_226_300";
import { flashcardsChemCh2AhmedNadawi_301_375 } from "./flashcardsChemCh2AhmedNadawi_301_375";
import { flashcardsChemCh2AhmedNadawi_376_429 } from "./flashcardsChemCh2AhmedNadawi_376_429";

export type AhmedNadawiChemCh2Card = {
  id: string;
  q: string;
  a: string;
  topic: string;
  kind: string;
  pages: string;
  ministerialYear?: number;
  sourceNotes?: string;
};

export const ahmedNadawiChemCh2Cards: AhmedNadawiChemCh2Card[] = [
  ...flashcardsChemCh2AhmedNadawi_001_075,
  ...flashcardsChemCh2AhmedNadawi_076_150,
  ...flashcardsChemCh2AhmedNadawi_151_225,
  ...flashcardsChemCh2AhmedNadawi_226_300,
  ...flashcardsChemCh2AhmedNadawi_301_375,
  ...flashcardsChemCh2AhmedNadawi_376_429,
];

export const ahmedNadawiChemCh2Topics = [
  {
    "key": "01",
    "title": "FUNDAMENTALS",
    "titleAr": "أساسيات الاتزان الكيميائي"
  },
  {
    "key": "02",
    "title": "MASS ACTION AND KEQ",
    "titleAr": "قانون فعل الكتلة وثابت الاتزان Keq"
  },
  {
    "key": "03",
    "title": "KP–KC RELATION",
    "titleAr": "العلاقة بين Kp وKc"
  },
  {
    "key": "04",
    "title": "ICE TABLES",
    "titleAr": "جداول البداية والتغير والاتزان (ICE)"
  },
  {
    "key": "05",
    "title": "MAGNITUDE OF K",
    "titleAr": "دلالة قيمة ثابت الاتزان K"
  },
  {
    "key": "06",
    "title": "EQUATION MANIPULATION",
    "titleAr": "تعديل معادلات الاتزان وثوابتها"
  },
  {
    "key": "07",
    "title": "REACTION QUOTIENT Q",
    "titleAr": "حاصل التفاعل Q"
  },
  {
    "key": "08",
    "title": "GIBBS FREE ENERGY",
    "titleAr": "طاقة غيبس الحرة"
  },
  {
    "key": "09",
    "title": "LE CHATELIER",
    "titleAr": "مبدأ لوشاتلييه"
  },
  {
    "key": "10",
    "title": "TEMPERATURE EFFECTS",
    "titleAr": "تأثير درجة الحرارة في الاتزان"
  },
  {
    "key": "11",
    "title": "CATALYSTS",
    "titleAr": "العوامل المساعدة"
  },
  {
    "key": "12",
    "title": "EXAM NOTES",
    "titleAr": "ملاحظات وأسئلة امتحانية مهمة"
  },
  {
    "key": "13",
    "title": "KEQ CALCULATION",
    "titleAr": "مسائل حساب ثابت الاتزان Keq"
  },
  {
    "key": "14",
    "title": "KC DIRECT PROBLEMS",
    "titleAr": "مسائل مباشرة على Kc"
  },
  {
    "key": "15",
    "title": "KP DIRECT PROBLEMS",
    "titleAr": "مسائل مباشرة على Kp"
  },
  {
    "key": "16",
    "title": "KP–KC CALCULATION",
    "titleAr": "مسائل العلاقة بين Kp وKc"
  },
  {
    "key": "17",
    "title": "ICE TABLE PROBLEM",
    "titleAr": "مسائل جدول ICE"
  },
  {
    "key": "18",
    "title": "REACTION QUOTIENT PROBLEM",
    "titleAr": "مسائل حاصل التفاعل"
  },
  {
    "key": "19",
    "title": "GIBBS NUMERICAL PROBLEM",
    "titleAr": "مسائل طاقة غيبس الحرة"
  },
  {
    "key": "20",
    "title": "LE CHATELIER APPLICATION",
    "titleAr": "تطبيقات مبدأ لوشاتلييه"
  },
  {
    "key": "21",
    "title": "NUMERIC PROBLEM BANK",
    "titleAr": "بنك المسائل الحسابية"
  },
  {
    "key": "22",
    "title": "EQUATION TRANSFORMATIONS — PROBLEMS",
    "titleAr": "مسائل تعديل معادلات الاتزان"
  },
  {
    "key": "23",
    "title": "REACTION QUOTIENT — PROBLEMS",
    "titleAr": "مسائل حاصل التفاعل Q"
  },
  {
    "key": "24",
    "title": "GIBBS ENERGY — PROBLEMS",
    "titleAr": "مسائل طاقة غيبس"
  },
  {
    "key": "25",
    "title": "LE CHATELIER — EXAM PROBLEMS",
    "titleAr": "أسئلة امتحانية على مبدأ لوشاتلييه"
  },
  {
    "key": "26",
    "title": "MIXED CHAPTERS — ADVANCED PROBLEMS",
    "titleAr": "مسائل متقدمة ومتنوعة"
  },
  {
    "key": "27",
    "title": "FINAL MINISTERIAL REVIEW",
    "titleAr": "المراجعة النهائية للأسئلة الوزارية"
  }
] as const;
