import { useEffect, useMemo, useRef, useState } from "react";
import { useFeatureUsed } from "@/hooks/useFeatureUsed";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, RotateCcw, Bookmark, BookmarkCheck, Star } from "lucide-react";
import { Brain } from "lucide-react";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setRedoRequired, clearRedoAndZombie } from "@/components/ZombieGuard";
import { awardPoints } from "@/lib/points";
import { awardAction } from "@/lib/unlocks";
import PointsHint from "@/components/PointsHint";
import SeoHead from "@/components/SeoHead";
import { flashcards } from "@/data/flashcards";
import { flashcardsCh1Ar } from "@/data/flashcardsCh1Ar";
import { flashcardsCh2Ar } from "@/data/flashcardsCh2Ar";
import { flashcardsCh3Ar } from "@/data/flashcardsCh3Ar";
import { flashcardsCh4Ar } from "@/data/flashcardsCh4Ar";
import { flashcardsCh5Ar } from "@/data/flashcardsCh5Ar";
import { flashcardsCh6Ar } from "@/data/flashcardsCh6Ar";
import { flashcardsCh7Ar } from "@/data/flashcardsCh7Ar";
import { flashcardsCh8Ar } from "@/data/flashcardsCh8Ar";
import { flashcardsBioCh1Ar } from "@/data/flashcardsBioCh1Ar";
import { flashcardsBioCh2Ar } from "@/data/flashcardsBioCh2Ar";
import { flashcardsBioCh5Ar } from "@/data/flashcardsBioCh5Ar";
import { flashcardsBioCh1En } from "@/data/flashcardsBioCh1En";
import { flashcardsBioCh2En } from "@/data/flashcardsBioCh2En";
import { flashcardsBioCh3En } from "@/data/flashcardsBioCh3En";
import { flashcardsBioCh3Ar } from "@/data/flashcardsBioCh3Ar";
import { flashcardsBioCh5En } from "@/data/flashcardsBioCh5En";
import { flashcardsChemCh1En } from "@/data/flashcardsChemCh1En";
import { flashcardsChemCh2En } from "@/data/flashcardsChemCh2En";
import { flashcardsChemCh3En } from "@/data/flashcardsChemCh3En";
import { flashcardsChemCh4En } from "@/data/flashcardsChemCh4En";
import { flashcardsChemCh5En } from "@/data/flashcardsChemCh5En";
import { flashcardsChemCh6En } from "@/data/flashcardsChemCh6En";
import { flashcardsChemCh1Ar } from "@/data/flashcardsChemCh1Ar";
import { flashcardsChemCh2Ar } from "@/data/flashcardsChemCh2Ar";
import { flashcardsChemCh3Ar } from "@/data/flashcardsChemCh3Ar";
import { flashcardsChemCh4Ar } from "@/data/flashcardsChemCh4Ar";
import { flashcardsChemCh5Ar } from "@/data/flashcardsChemCh5Ar";
import { flashcardsChemCh6Ar } from "@/data/flashcardsChemCh6Ar";
import { flashcardsArabicTaajjubAr } from "@/data/flashcardsArabicTaajjubAr";
import { flashcardsArabicTawkeedAr } from "@/data/flashcardsArabicTawkeedAr";
import { flashcardsArabicTaqdimAr } from "@/data/flashcardsArabicTaqdimAr";
import { flashcardsArabicNidaAr } from "@/data/flashcardsArabicNidaAr";
import { flashcardsArabicIstifhamAr } from "@/data/flashcardsArabicIstifhamAr";
import { flashcardsIslamicMeaningsAr } from "@/data/flashcardsIslamicMeaningsAr";
import { flashcardsEngGrammar1 } from "@/data/flashcardsEngGrammar1";
import { flashcardsEngParagraphs } from "@/data/flashcardsEngParagraphs";
import { flashcardsFrenchNegationAr } from "@/data/flashcardsFrenchNegationAr";
import { flashcardsFrenchInterrogationAr } from "@/data/flashcardsFrenchInterrogationAr";
import { flashcardsFrenchRelativePronounsAr } from "@/data/flashcardsFrenchRelativePronounsAr";
import { flashcardsFrenchFeminineAr } from "@/data/flashcardsFrenchFeminineAr";
import { flashcardsFrenchPluralAr } from "@/data/flashcardsFrenchPluralAr";
import { flashcardsFrenchAdverbsAr } from "@/data/flashcardsFrenchAdverbsAr";
import { flashcardsCh1 } from "@/data/flashcardsCh1";
import { flashcardsCh2 } from "@/data/flashcardsCh2";
import { flashcardsCh4 } from "@/data/flashcardsCh4";
import { flashcardsCh5 } from "@/data/flashcardsCh5";
import { flashcardsCh6 } from "@/data/flashcardsCh6";
import { flashcardsCh7 } from "@/data/flashcardsCh7";
import { flashcardsCh8 } from "@/data/flashcardsCh8";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import type { AppLanguage } from "@/components/LanguageGate";
import type { AppSubject } from "@/pages/Subjects";
import { groupFlashcardsByTopic } from "@/lib/flashcardTopics";
import { explicitTopics, type TopicGroup } from "@/lib/flashcardTopics";
import { buildPresetGroups } from "@/lib/flashcardTopicPresets";
import { useTodos } from "@/lib/todoTopicProgress";
import {
  cardKey as srsCardKey,
  defaultState,
  isDue,
  loadDeckStates,
  previewInterval,
  rateCard,
  type SrsRating,
  type SrsState,
} from "@/lib/srs";
import { PREVIOUS_SUBJECT_STORAGE_KEY } from "@/pages/Subjects";
import CrossfadeSubjectTheme from "@/components/CrossfadeSubjectTheme";


const decks: Record<string, { title: string; eyebrow: string; cards: typeof flashcards }> = {
  "1": { title: "Flashcards", eyebrow: "Ch 01 · Capacitors", cards: flashcardsCh1 },
  "2": { title: "Flashcards", eyebrow: "Ch 02 · Electromagnetic Induction", cards: flashcardsCh2 },
  "3": { title: "Flashcards", eyebrow: "Ch 03 · Alternating Current", cards: flashcards },
  "4": { title: "Flashcards", eyebrow: "Ch 04 · Electromagnetic Waves", cards: flashcardsCh4 },
  "5": { title: "Flashcards", eyebrow: "Ch 05 · Physical Optics", cards: flashcardsCh5 },
  "6": { title: "Flashcards", eyebrow: "Ch 06 · Modern Physics", cards: flashcardsCh6 },
  "7": { title: "Flashcards", eyebrow: "Ch 07 · Solid State Electronics", cards: flashcardsCh7 },
  "8": { title: "Flashcards", eyebrow: "Ch 08 · Atomic Spectra and Laser", cards: flashcardsCh8 },
};

const SUBJECT_LABEL: Record<string, Record<string, string>> = {
  ar: { physics: "الفيزياء", chemistry: "الكيمياء", biology: "الأحياء", english: "الإنجليزية", french: "الفرنسية", arabic: "العربية", islamic: "التربية الإسلامية", revision: "المراجعة" },
  en: { physics: "Physics", chemistry: "Chemistry", biology: "Biology", english: "English", french: "French", arabic: "Arabic", islamic: "Islamic", revision: "Revision" },
};

const copy = {
  en: { chapters: "Chapters", of: "of", shuffle: "Shuffle", reset: "Reset" },
  ar: { chapters: "الفصول", of: "من", shuffle: "خلط", reset: "إعادة" },
};

const Index = ({ language, subject }: { language: AppLanguage; subject: AppSubject }) => {
  useFeatureUsed("flashcards");
  const { chapter = "3" } = useParams();
  const baseDeck = decks[chapter] ?? decks["3"];
  const [extraRows, setExtraRows] = useState<{ id: string; q: string; a: string }[]>([]);
  const extraCards = useMemo(() => extraRows.map((r) => ({ q: r.q, a: r.a })), [extraRows]);
  const [isAdmin, setIsAdmin] = useState(false);
  const SAVED_KEY = "saved_flashcards_v1";
  type SavedCard = { q: string; a: string; subject: string; chapter: string };
  const [saved, setSaved] = useState<SavedCard[]>(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; }
  });
  const [savedView, setSavedView] = useState(false);
  const persistSaved = (next: SavedCard[]) => {
    setSaved(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      if (active) setIsAdmin(!!data);
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (subject === "arabic" && (chapter === "1" || chapter === "7")) {
      setExtraRows([]);
      return;
    }
    let active = true;
    supabase
      .from("custom_flashcards")
      .select("id, question, answer")
      .eq("subject", subject)
      .eq("chapter", String(chapter))
      .eq("language", language)
      .eq("approved", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setExtraRows((data ?? []).map((r) => ({ id: r.id, q: r.question, a: r.answer })));
      });
    return () => { active = false; };
  }, [subject, chapter, language]);

  const loading = false;
  const useRemote = false;

  const deck = useMemo(
    () => {
      if (subject === "biology" && chapter === "1") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "الأحياء · الخلية" : "Biology · The Cell",
          cards: language === "ar" ? flashcardsBioCh1Ar : flashcardsBioCh1En,
        };
      }
      if (subject === "biology" && chapter === "2") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "الأحياء · الأنسجة" : "Biology · Tissues",
          cards: language === "ar" ? flashcardsBioCh2Ar : flashcardsBioCh2En,
        };
      }
      if (subject === "biology" && chapter === "3") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "الأحياء · التكاثر" : "Biology · Reproduction",
          cards: language === "ar" ? flashcardsBioCh3Ar : flashcardsBioCh3En,
        };
      }
      if (subject === "biology" && chapter === "5") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "الأحياء · الوراثة" : "Biology · Genetics",
          cards: language === "ar" ? flashcardsBioCh5Ar : flashcardsBioCh5En,
        };
      }

      if (subject === "chemistry") {
        const chemEn: Record<string, typeof flashcards> = {
          "1": flashcardsChemCh1En, "2": flashcardsChemCh2En, "3": flashcardsChemCh3En,
          "4": flashcardsChemCh4En, "5": flashcardsChemCh5En, "6": flashcardsChemCh6En,
        };
        const chemAr: Record<string, typeof flashcards> = {
          "1": flashcardsChemCh1Ar, "2": flashcardsChemCh2Ar, "3": flashcardsChemCh3Ar,
          "4": flashcardsChemCh4Ar, "5": flashcardsChemCh5Ar, "6": flashcardsChemCh6Ar,
        };
        const cards = (language === "ar" ? chemAr : chemEn)[chapter];
        if (cards) {
          return {
            title: "بطاقات تعليمية",
            eyebrow: language === "ar" ? `الكيمياء · الفصل ${chapter}` : `Chemistry · Chapter ${chapter}`,
            cards,
          };
        }
      }

      if (subject === "arabic" && chapter === "1") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "العربية · الأدب" : "Arabic · Literature",
          cards: [],
        };
      }

      if (subject === "arabic" && chapter === "2") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "العربية · التعجب" : "Arabic · Exclamation",
          cards: flashcardsArabicTaajjubAr,
        };
      }

      if (subject === "arabic" && chapter === "3") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "العربية · التوكيد" : "Arabic · Tawkeed",
          cards: flashcardsArabicTawkeedAr,
        };
      }

      if (subject === "arabic" && chapter === "4") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "العربية · التقديم والتاخير" : "Arabic · Taqdim wa Ta'kheer",
          cards: flashcardsArabicTaqdimAr,
        };
      }

      if (subject === "arabic" && chapter === "5") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "العربية · النداء" : "Arabic · Nida",
          cards: flashcardsArabicNidaAr,
        };
      }

      if (subject === "arabic" && chapter === "6") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar" ? "العربية · الاستفهام" : "Arabic · Istifham",
          cards: flashcardsArabicIstifhamAr,
        };
      }

      if (subject === "arabic" && chapter === "7") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: language === "ar"
            ? "العربية · الأدب · سنوات · معاني · تراث أدبي"
            : "Arabic · Literature · Years · Meanings · Heritage",
          cards: [],
        };
      }

      if (subject === "islamic" && chapter === "1") {
        return {
          title: "بطاقات تعليمية",
          eyebrow: "التربية الإسلامية · المعاني",
          cards: flashcardsIslamicMeaningsAr,
        };
      }

      const engCat = typeof window !== "undefined" ? localStorage.getItem("app_english_category_v1") : null;

      if (subject === "english" && engCat === "paragraphs" && chapter === "1") {
        return {
          title: language === "ar" ? "بطاقات تعليمية" : "Flashcards",
          eyebrow: language === "ar" ? "الإنجليزية · الفقرات" : "English · Paragraphs",
          cards: flashcardsEngParagraphs,
        };
      }

      if (subject === "english" && chapter === "1") {
        return {
          title: language === "ar" ? "بطاقات تعليمية" : "Flashcards",
          eyebrow: language === "ar" ? "الإنجليزية · القواعد · الوحدة 1" : "English · Grammar · Unit 1",
          cards: flashcardsEngGrammar1,
        };
      }

      if (subject === "french") {
        const frenchDecks: Record<string, { ar: string; en: string; cards: typeof flashcards }> = {
          "1": { ar: "الفرنسية · النفي", en: "French · Negation", cards: flashcardsFrenchNegationAr },
          "2": { ar: "الفرنسية · الاستفهام", en: "French · Interrogation", cards: flashcardsFrenchInterrogationAr },
          "3": { ar: "الفرنسية · ضمائر الوصل", en: "French · Relative Pronouns", cards: flashcardsFrenchRelativePronounsAr },
          "4": { ar: "الفرنسية · التأنيث", en: "French · Feminization", cards: flashcardsFrenchFeminineAr },
          "5": { ar: "الفرنسية · الجمع", en: "French · Plural", cards: flashcardsFrenchPluralAr },
          "6": { ar: "الفرنسية · اشتقاق الظروف", en: "French · Adverbs", cards: flashcardsFrenchAdverbsAr },
        };
        const d = frenchDecks[chapter];
        if (d) {
          return {
            title: language === "ar" ? "بطاقات تعليمية" : "Flashcards",
            eyebrow: language === "ar" ? d.ar : d.en,
            cards: d.cards,
          };
        }
      }

      if (language === "ar" && chapter === "1") {
        return { ...baseDeck, title: "بطاقات تعليمية", eyebrow: "الفصل 01 · المتسعات", cards: flashcardsCh1Ar };
      }

      if (language === "ar" && chapter === "2") {
        return { ...baseDeck, title: "بطاقات تعليمية", eyebrow: "الفصل 02 · الحث الكهرومغناطيسي", cards: flashcardsCh2Ar };
      }

      if (language === "ar" && chapter === "3") {
        return { ...baseDeck, title: "بطاقات تعليمية", eyebrow: "الفصل 03 · التيار المتناوب", cards: flashcardsCh3Ar };
      }

      if (language === "ar" && chapter === "4") {
        return { ...baseDeck, title: "بطاقات تعليمية", eyebrow: "الفصل 04 · الموجات الكهرومغناطيسية", cards: flashcardsCh4Ar };
      }

      if (language === "ar" && chapter === "5") {
        return { ...baseDeck, title: "بطاقات تعليمية", eyebrow: "الفصل 05 · البصريات الفيزيائية", cards: flashcardsCh5Ar };
      }

      if (language === "ar" && chapter === "6") {
        return { ...baseDeck, title: "بطاقات تعليمية", eyebrow: "الفصل 06 · الفيزياء الحديثة", cards: flashcardsCh6Ar };
      }

      if (language === "ar" && chapter === "7") {
        return { ...baseDeck, title: "بطاقات تعليمية", eyebrow: "الفصل 07 · إلكترونيات الحالة الصلبة", cards: flashcardsCh7Ar };
      }

      if (language === "ar" && chapter === "8") {
        return { ...baseDeck, title: "بطاقات تعليمية", eyebrow: "الفصل 08 · الأطياف الذرية والليزر", cards: flashcardsCh8Ar };
      }

      return baseDeck;
    },
    [baseDeck, chapter, language, subject]
  );
  const text = copy[language];
  // Explicit, source-derived topic groups for decks that are built from
  // multiple named source files. Falls back to keyword auto-detection
  // when no preset matches.
  const explicitGroups: TopicGroup[] | null = useMemo(() => {
    return null;
  }, [subject, chapter, language]);

  // Topic grouping (per-deck, auto-detected).
  const topicResult = useMemo(
    () => {
      if (explicitGroups) {
        const withExtras: TopicGroup[] =
          extraCards.length > 0
            ? [
                ...explicitGroups,
                {
                  key: "user-added",
                  label: language === "ar" ? "إضافات الطلبة" : "User-added",
                  cards: extraCards,
                },
              ]
            : explicitGroups;
        const preset = explicitTopics(withExtras, language);
        if (preset) return preset;
      }
      // Curriculum-driven preset groups (PDF: دفتر مراجعة المتميزين).
      const baseCards = [...deck.cards, ...extraCards];
      const presetGroups = buildPresetGroups(subject, String(chapter), language, baseCards);
      if (presetGroups) {
        const preset = explicitTopics(presetGroups, language);
        if (preset) return preset;
      }
      return groupFlashcardsByTopic([...deck.cards, ...extraCards], language);
    },
    [deck, extraCards, language, explicitGroups, subject, chapter]
  );
  const hasTopics = topicResult.topics.length > 1;
  const [topicKey, setTopicKey] = useState<string>(topicResult.allKey);
  const todos = useTodos();
  useEffect(() => {
    setTopicKey(topicResult.allKey);
  }, [topicResult]);
  const activeTopicCards = useMemo(() => {
    const t = topicResult.topics.find((g) => g.key === topicKey) ?? topicResult.topics[0];
    return t?.cards ?? [];
  }, [topicResult, topicKey]);

  const [cards, setCards] = useState(activeTopicCards);
  const progressKey = `flashcard-progress:${subject}:${chapter}:${savedView ? "saved" : topicKey}`;
  const readSavedIndex = (max: number) => {
    try {
      const raw = localStorage.getItem(progressKey);
      const n = raw ? parseInt(raw, 10) : 0;
      if (!Number.isFinite(n) || n < 0) return 0;
      return Math.min(n, Math.max(0, max - 1));
    } catch { return 0; }
  };
  const [index, setIndex] = useState(() => readSavedIndex(activeTopicCards.length));
  const [direction, setDirection] = useState<"left" | "right">("right");

  /* ---------------- spaced repetition ---------------- */
  const [srs, setSrs] = useState<Map<string, SrsState>>(new Map());
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    let active = true;
    loadDeckStates(subject, String(chapter)).then((m) => {
      if (active) setSrs(m);
    });
    return () => { active = false; };
  }, [subject, chapter]);

  const keyOf = (c: { q: string }) => srsCardKey(subject, String(chapter), c.q);

  const { dueCards, newCards } = useMemo(() => {
    const now = Date.now();
    const due: typeof activeTopicCards = [];
    const fresh: typeof activeTopicCards = [];
    activeTopicCards.forEach((c) => {
      const st = srs.get(keyOf(c));
      if (!st) fresh.push(c);
      else if (isDue(st, now)) due.push(c);
    });
    return { dueCards: due, newCards: fresh };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopicCards, srs, subject, chapter]);

  const queueSize = dueCards.length + Math.min(newCards.length, 10);

  const startReview = () => {
    const queue = [...dueCards, ...newCards.slice(0, 10)];
    if (queue.length === 0) {
      toast.success(language === "ar" ? "لا توجد بطاقات مستحقة الآن — عد لاحقاً!" : "Nothing due right now — come back later!");
      return;
    }
    setReviewMode(true);
    setSavedView(false);
    setCards(queue);
    setIndex(0);
    setDirection("right");
  };

  const exitReview = () => {
    setReviewMode(false);
    setCards(activeTopicCards);
    setIndex(0);
  };

  const handleRate = async (rating: SrsRating) => {
    const current = cards[index];
    if (!current) return;
    const key = keyOf(current);
    const prev = srs.get(key) ?? defaultState(key);
    const updated = await rateCard({
      subject,
      chapter: String(chapter),
      language,
      card: current,
      rating,
      prev,
    });
    setSrs((m) => new Map(m).set(key, updated));

    const when = previewInterval(prev, rating, language);
    if (rating === "forgot") {
      toast(language === "ar" ? `نسيت — ستعود البطاقة بعد ${when}` : `Forgot — this card returns in ${when}`);
    } else {
      toast.success(language === "ar" ? `المراجعة القادمة بعد ${when}` : `Next review in ${when}`);
    }

    if (!reviewMode) {
      next();
      return;
    }

    // In review mode the card leaves the queue; forgotten cards come back last.
    setCards((prevCards) => {
      const rest = prevCards.filter((_, i) => i !== index);
      const queue = rating === "forgot" ? [...rest, current] : rest;
      if (queue.length === 0) {
        toast.success(language === "ar" ? "أنهيت مراجعة اليوم — أحسنت!" : "Review finished for now — nice work!");
        setReviewMode(false);
        setIndex(0);
        return activeTopicCards;
      }
      setIndex((i) => Math.min(i, queue.length - 1));
      return queue;
    });
    setDirection("right");
  };

  const intervalHints = useMemo(() => {
    const current = cards[index];
    if (!current) return undefined;
    const st = srs.get(keyOf(current)) ?? defaultState(keyOf(current));
    return {
      forgot: previewInterval(st, "forgot", language),
      hard: previewInterval(st, "hard", language),
      good: previewInterval(st, "good", language),
      easy: previewInterval(st, "easy", language),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, index, srs, language, subject, chapter]);

  // Deep-link from the home screen's "due cards" banner.
  const autoReviewDone = useRef(false);
  useEffect(() => {
    if (autoReviewDone.current || srs.size === 0) return;
    let flag: string | null = null;
    try { flag = sessionStorage.getItem("flashcards:review"); } catch { /* ignore */ }
    if (flag !== "1") return;
    autoReviewDone.current = true;
    try { sessionStorage.removeItem("flashcards:review"); } catch { /* ignore */ }
    startReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srs]);

  const next = () => {
    setDirection("right");
    setIndex((i) => {
      const ni = (i + 1) % cards.length;
      if (i === cards.length - 1) setShowRating(true);
      return ni;
    });
  };
  const prev = () => {
    setDirection("left");
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };
  const shuffle = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setIndex(0);
    setDirection("right");
  };
  const reset = () => {
    setCards(activeTopicCards);
    setIndex(0);
    setDirection("left");
  };

  // Rebuild deck only when the underlying source changes — restore saved index.
  useEffect(() => {
    const nextCards = savedView
      ? saved.map((s) => ({ q: s.q, a: s.a }))
      : activeTopicCards;
    setCards(nextCards);
    setIndex(readSavedIndex(nextCards.length));
    // intentionally exclude `saved` so bookmarking a card doesn't reset position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopicCards, savedView, progressKey]);

  // Persist current card position so the user resumes where they left off.
  useEffect(() => {
    try { localStorage.setItem(progressKey, String(index)); } catch { /* noop */ }
  }, [index, progressKey]);

  // When in saved view and the saved list changes (e.g. unbookmark),
  // update cards in place without snapping back to the first card.
  useEffect(() => {
    if (!savedView) return;
    setCards((prev) => {
      const next = saved.map((s) => ({ q: s.q, a: s.a }));
      setIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const card = cards[index];
  const cardProgress = cards.length ? ((index + 1) / cards.length) * 100 : 0;
  // Keep deck progress and weekly to-do progress separate. Mixing them made
  // the card counter appear to jump when an unrelated task was completed.
  const totalTodos = todos.length;
  const doneTodos = todos.filter((t) => t.done).length;
  const progress = cardProgress;
  const isSaved = !!card && saved.some((s) => s.q === card.q && s.a === card.a);
  const toggleSave = () => {
    if (!card) return;
    if (isSaved) {
      persistSaved(saved.filter((s) => !(s.q === card.q && s.a === card.a)));
    } else {
      persistSaved([...saved, { q: card.q, a: card.a, subject, chapter: String(chapter) }]);
    }
  };

  // User-submitted flashcards (await admin approval)
  const [showSubmit, setShowSubmit] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const handleRating = (level: "good" | "bad") => {
    setShowRating(false);
    if (level === "good") {
      clearRedoAndZombie();
      // Award 2 points per (subject, chapter) deck — unique per user via DB constraint
      awardPoints("flashcard", `${subject}:${chapter}`);
      awardAction("flashcard_session", { subject, chapter });
      toast.success(language === "ar" ? "أحسنت! استمر." : "Great work — keep it up!");
    } else {
      setRedoRequired(subject, String(chapter), 10);
      toast.warning(
        language === "ar"
          ? "أعد البطاقات الآن — وإلا سيتحول الموقع إلى وضع الزومبي!"
          : "Redo these flashcards now — or the site will turn into zombie mode!",
        { duration: 8000 }
      );
    }
  };
  const [submitQ, setSubmitQ] = useState("");
  const [submitA, setSubmitA] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitQ.trim() || !submitA.trim()) return;
    setSubmitting(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("custom_flashcards").insert({
        subject,
        chapter: String(chapter),
        language,
        question: submitQ.trim(),
        answer: submitA.trim(),
        created_by: u.user.id,
        approved: false,
      });
      if (error) throw error;
      toast.success(language === "ar" ? "تم الإرسال — بانتظار موافقة المسؤول" : "Submitted — waiting for admin approval");
      setSubmitQ(""); setSubmitA(""); setShowSubmit(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally { setSubmitting(false); }
  };

  if (useRemote && (loading || cards.length === 0)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden" dir={language === "ar" ? "rtl" : "ltr"}>
        <Link
          to="/"
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-secondary/60 backdrop-blur text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{text.chapters}</span>
        </Link>
        <SeoHead
          path={chapter ? `/flashcards/${chapter}` : "/flashcards"}
          title={`${deck.title}${SUBJECT_LABEL[language]?.[subject as string] ? ` — ${SUBJECT_LABEL[language]?.[subject as string]}` : ""} | ${language === "ar" ? "فلاش كاردات تميزك" : "Tamayzak flashcards"}`}
          description={language === "ar"
            ? `فلاش كاردات ${deck.title} لطلاب السادس العلمي في العراق مع مراجعة متباعدة ومتابعة تقدم على منصة تميزك.`
            : `${deck.title} flashcards for Iraq's Sixth Scientific students, with spaced repetition and progress tracking on Tamayzak.`}
        />
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">{deck.eyebrow}</p>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">{deck.title}{SUBJECT_LABEL[language]?.[subject as string] ? ` — ${SUBJECT_LABEL[language]?.[subject as string]}` : ""}</h1>
        <p className="text-muted-foreground">
          {loading
            ? language === "ar" ? "جارٍ التحميل..." : "Loading..."
            : language === "ar" ? "لا توجد بطاقات بعد" : "No cards yet"}
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background px-3 pb-12 pt-4 sm:px-6 md:pt-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Subject theme crossfade */}
      <CrossfadeSubjectTheme
        subject={subject}
        previousSubject={typeof window !== "undefined" ? (localStorage.getItem(PREVIOUS_SUBJECT_STORAGE_KEY) as AppSubject | null) : null}
        onComplete={() => {
          try { localStorage.removeItem(PREVIOUS_SUBJECT_STORAGE_KEY); } catch { /* ignore */ }
        }}
      />

      <Link
        to="/"
        className="fixed left-4 top-4 z-30 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/90 px-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-xl transition-colors hover:border-primary/40 hover:bg-secondary sm:left-6 sm:top-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{text.chapters}</span>
      </Link>

      <header className="relative z-10 mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card/80 px-4 pb-4 pt-14 text-center shadow-sm backdrop-blur-xl animate-fade-up sm:px-6 sm:pt-5">
        <SeoHead
          path={chapter ? `/flashcards/${chapter}` : "/flashcards"}
          title={`${deck.title}${SUBJECT_LABEL[language]?.[subject as string] ? ` — ${SUBJECT_LABEL[language]?.[subject as string]}` : ""} | ${language === "ar" ? "فلاش كاردات تميزك" : "Tamayzak flashcards"}`}
          description={language === "ar"
            ? `فلاش كاردات ${deck.title} لطلاب السادس العلمي في العراق مع مراجعة متباعدة ومتابعة تقدم على منصة تميزك.`
            : `${deck.title} flashcards for Iraq's Sixth Scientific students, with spaced repetition and progress tracking on Tamayzak.`}
        />
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">{deck.eyebrow}</p>
        <h1 className="text-2xl font-black text-foreground sm:text-3xl">{deck.title}{SUBJECT_LABEL[language]?.[subject as string] ? ` — ${SUBJECT_LABEL[language]?.[subject as string]}` : ""}</h1>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="text-foreground">
            {(language === "ar"
              ? { physics: "الفيزياء", chemistry: "الكيمياء", biology: "الأحياء", english: "الإنجليزية", french: "الفرنسية", arabic: "العربية", islamic: "التربية الإسلامية", revision: "المراجعة" }
              : { physics: "Physics", chemistry: "Chemistry", biology: "Biology", english: "English", french: "French", arabic: "Arabic", islamic: "Islamic", revision: "Revision" }
            )[subject]}
          </span>
          <span className="opacity-40">·</span>
          <span>{language === "ar" ? `الفصل ${chapter}` : `Chapter ${chapter}`}</span>
        </p>
        <div className="mt-3 flex justify-center">
          <PointsHint action="flashcard_session" language={language === "ar" ? "ar" : "en"} />
        </div>
        <div className="mt-4 grid grid-cols-2 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-background/60 rtl:divide-x-reverse">
          <div className="px-2 py-3">
            <strong className="block text-lg font-black tabular-nums text-foreground">{cards.length}</strong>
            <span className="text-[10px] font-semibold text-muted-foreground">{language === "ar" ? "بطاقة" : "Cards"}</span>
          </div>
          <div className="px-2 py-3">
            <strong className="block text-lg font-black tabular-nums text-primary">{queueSize}</strong>
            <span className="text-[10px] font-semibold text-muted-foreground">{language === "ar" ? "مراجعة اليوم" : "Due today"}</span>
          </div>
        </div>
      </header>

      {hasTopics && !savedView && (
        <nav
          className="relative z-10 mx-auto mt-4 w-full max-w-3xl rounded-2xl border border-border bg-card/75 p-3 shadow-sm backdrop-blur-xl"
          aria-label={language === "ar" ? "المواضيع" : "Topics"}
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <span className="text-xs font-bold text-foreground">
              {language === "ar" ? "اختر الموضوع" : "Choose a topic"}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {topicResult.topics.length} {language === "ar" ? "مواضيع" : "topics"}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {topicResult.topics.map((t) => {
              const active = t.key === topicKey;
              return (
                <button
                  key={t.key}
                  onClick={() => setTopicKey(t.key)}
                  className={
                    "shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 " +
                    (active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground")
                  }
                >
                  {t.label}
                  <span className="ms-1 opacity-65">{t.cards.length}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <section
        className="relative z-10 mx-auto my-5 flex w-full max-w-3xl flex-col items-center gap-4 overflow-hidden"
        style={(() => {
          // Subject-tinted flashcard back. Overrides only the back gradient
          // and ensures readable foreground, while keeping the user's chosen
          // theme for the front face and everything else.
          const tints: Partial<Record<AppSubject, { from: string; to: string }>> = {
            physics:   { from: "217 91% 55%", to: "199 95% 50%" }, // blue
            chemistry: { from: "0 80% 55%",   to: "12 85% 58%"  }, // red
            biology:   { from: "142 70% 38%", to: "158 65% 45%" }, // green
          };
          const t = tints[subject];
          if (!t) return undefined;
          return {
            ["--gradient-card-back" as any]: `linear-gradient(135deg, hsl(${t.from}), hsl(${t.to}))`,
            ["--card-back-fg" as any]: "0 0% 100%",
          } as React.CSSProperties;
        })()}
      >
        {card ? (
          <Flashcard
            question={card.q}
            answer={card.a}
            index={index}
            total={cards.length}
            direction={direction}
            language={language}
            onRate={savedView ? undefined : handleRate}
            intervalHints={intervalHints}
          />
        ) : (
          <div className="flex min-h-72 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/70 px-6 text-center shadow-sm">
            <Bookmark className="mb-3 size-8 text-muted-foreground" />
            <h2 className="font-bold text-foreground">
              {language === "ar" ? "لا توجد بطاقات هنا بعد" : "No cards here yet"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === "ar" ? "ارجع إلى كل البطاقات أو أضف بطاقة جديدة." : "Return to all cards or submit a new one."}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-border bg-card/80 p-2 shadow-sm backdrop-blur-xl" dir="ltr">
          <button
            onClick={prev}
            disabled={!card}
            aria-label="Previous card"
            className="group flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="min-w-0 flex-1 px-1 text-center">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>{language === "ar" ? "تقدم البطاقات" : "Card progress"}</span>
              <span className="font-mono tabular-nums text-foreground">
                {card ? index + 1 : 0} / {cards.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
              />
            </div>
          </div>

          <button
            onClick={next}
            disabled={!card}
            aria-label="Next card"
            className="group flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 mx-auto grid w-full max-w-3xl grid-cols-2 gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-sm backdrop-blur-xl sm:flex sm:flex-wrap sm:justify-center">
        <Button
          variant={reviewMode ? "default" : "ghost"}
          size="sm"
          onClick={reviewMode ? exitReview : startReview}
          className="col-span-2 gap-2 sm:col-span-1"
        >
          <Brain className="w-4 h-4" />
          {reviewMode
            ? (language === "ar" ? `إنهاء المراجعة (${cards.length})` : `Exit review (${cards.length})`)
            : (language === "ar" ? `مراجعة اليوم (${queueSize})` : `Review today (${queueSize})`)}
        </Button>
        <Button variant="ghost" size="sm" onClick={shuffle} className="gap-2" disabled={!card}>
          <Shuffle className="w-4 h-4" /> {text.shuffle}
        </Button>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-2" disabled={!card}>
          <RotateCcw className="w-4 h-4" /> {text.reset}
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleSave} className="gap-2" disabled={!card}>
          {isSaved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
          {language === "ar" ? (isSaved ? "محفوظة" : "حفظ") : (isSaved ? "Saved" : "Save")}
        </Button>
        <Button
          variant={savedView ? "default" : "ghost"}
          size="sm"
          onClick={() => setSavedView((v) => !v)}
          className="gap-2"
        >
          <Star className="w-4 h-4" />
          {language === "ar"
            ? (savedView ? "كل البطاقات" : `المحفوظة (${saved.length})`)
            : (savedView ? "All cards" : `Saved (${saved.length})`)}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowSubmit(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === "ar" ? "أضف بطاقة" : "Submit card"}
        </Button>
      </footer>

      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4" onClick={() => !submitting && setShowSubmit(false)}>
          <form onSubmit={submitFlashcard} onClick={(e) => e.stopPropagation()} dir={language === "ar" ? "rtl" : "ltr"} className="w-full max-w-md rounded-3xl border border-white/10 bg-secondary p-6 space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold gradient-text">
                {language === "ar" ? "أرسل بطاقة جديدة" : "Submit a flashcard"}
              </h2>
              <button type="button" onClick={() => setShowSubmit(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "ar"
                ? `سيُراجع المسؤول بطاقتك قبل ظهورها. (${subject} · ${chapter} · ${language.toUpperCase()})`
                : `An admin will review your card before it appears. (${subject} · Ch ${chapter} · ${language.toUpperCase()})`}
            </p>
            <div>
              <label className="text-xs text-muted-foreground">{language === "ar" ? "السؤال *" : "Question *"}</label>
              <textarea required value={submitQ} onChange={(e) => setSubmitQ(e.target.value)} rows={2} maxLength={500} className="mt-1 w-full px-3 py-2 rounded-xl bg-background/60 border border-white/10 focus:border-primary/60 outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{language === "ar" ? "الإجابة *" : "Answer *"}</label>
              <textarea required value={submitA} onChange={(e) => setSubmitA(e.target.value)} rows={4} maxLength={2000} className="mt-1 w-full px-3 py-2 rounded-xl bg-background/60 border border-white/10 focus:border-primary/60 outline-none text-sm" />
            </div>
            <button type="submit" disabled={submitting || !submitQ.trim() || !submitA.trim()} className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {language === "ar" ? "جارٍ الإرسال…" : "Submitting…"}</>
                : <><Plus className="w-4 h-4" /> {language === "ar" ? "إرسال للموافقة" : "Submit for approval"}</>}
            </button>
          </form>
        </div>
      )}

      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div dir={language === "ar" ? "rtl" : "ltr"} className="w-full max-w-md rounded-3xl border border-white/10 bg-secondary p-6 space-y-5 animate-fade-up text-center">
            <h2 className="text-2xl font-bold gradient-text">
              {language === "ar" ? "كيف كان مستواك؟" : "How did you do?"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === "ar" ? "قيّم نفسك بصراحة بعد إنهاء البطاقات." : "Rate yourself honestly after finishing the deck."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRating("good")}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {language === "ar" ? "جيد 👍" : "Good 👍"}
              </button>
              <button
                onClick={() => handleRating("bad")}
                className="flex-1 h-12 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold"
              >
                {language === "ar" ? "سيئ 👎" : "Bad 👎"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Index;
