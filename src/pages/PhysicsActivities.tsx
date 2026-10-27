import { useState } from "react";
import { ArrowLeft, Atom, BookOpen, CircuitBoard, Radio, Waves, Zap } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import CapacitorDischarge from "@/components/physics/CapacitorDischarge";
import DielectricCapacitorActivity from "@/components/physics/DielectricCapacitorActivity";
import SelfInductionActivity from "@/components/physics/SelfInductionActivity";
import SpectrumTypesActivity from "@/components/physics/SpectrumTypesActivity";
import PhotoelectricEffectActivity from "@/components/physics/PhotoelectricEffectActivity";
import PolarizationActivity from "@/components/physics/PolarizationActivity";
import LightWavePolarizationActivity from "@/components/physics/LightWavePolarizationActivity";
import MechanicalWavePolarizationActivity from "@/components/physics/MechanicalWavePolarizationActivity";
import LightDiffractionActivity from "@/components/physics/LightDiffractionActivity";
import YoungDoubleSlitActivity from "@/components/physics/YoungDoubleSlitActivity";
import FaradayInductionActivity from "@/components/physics/FaradayInductionActivity";
import EddyCurrentPendulumActivity from "@/components/physics/EddyCurrentPendulumActivity";
import InducedEmfFactorsActivity from "@/components/physics/InducedEmfFactorsActivity";
import ElectromagneticWaveGenerationActivity from "@/components/physics/ElectromagneticWaveGenerationActivity";
import WaveInterferenceActivity from "@/components/physics/WaveInterferenceActivity";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const copy = {
  en: {
    title: "Physics Activities",
    subtitle:
      "Choose a chapter first, then open one of its interactive experiments without searching through a long mixed list.",
    back: "Back",
    chooseChapter: "Choose chapter",
    chooseActivity: "Activities in this chapter",
    activityCount: "activities",
    controls: "Controls",
    reset: "Reset",
    activityName: "Capacitor & Dielectric",
    labels: {
      insertion: "Dielectric insertion",
      kappa: "Dielectric constant κ",
      v0: "Initial voltage V₀ (V)",
      voltage: "Voltmeter reading",
      hint: "Drag the blue slab left / right, or use the slider.",
      inside: "inside",
      outside: "outside",
    },
  },
  ar: {
    title: "أنشطة الفيزياء",
    subtitle:
      "اختر الفصل أولًا، ثم افتح أحد نشاطاته التفاعلية بدون البحث داخل قائمة طويلة ومختلطة.",
    back: "رجوع",
    chooseChapter: "اختر الفصل",
    chooseActivity: "أنشطة هذا الفصل",
    activityCount: "أنشطة",
    controls: "الإعدادات",
    reset: "إعادة",
    activityName: "مكثف وعازل",
    labels: {
      insertion: "مقدار إدخال العازل",
      kappa: "ثابت العازل κ",
      v0: "الجهد الابتدائي V₀ (فولت)",
      voltage: "قراءة الفولتمتر",
      hint: "اسحب اللوح الأزرق يميناً / يساراً، أو استخدم شريط التمرير.",
      inside: "بالداخل",
      outside: "بالخارج",
    },
  },
} as const;

// ------- Page -------

const PhysicsActivities = ({
  language,
  onBack,
}: {
  language: AppLanguage;
  onBack: () => void;
}) => {
  const isRTL = language === "ar";
  const t = copy[language];

  const [activeChapter, setActiveChapter] = useState("chapter-1");
  const [activeActivity, setActiveActivity] = useState("dielectric");

  const chapters = [
    {
      id: "chapter-1",
      number: 1,
      title: isRTL ? "الفصل الأول" : "Chapter 1",
      topic: isRTL ? "المتسعات" : "Capacitors",
      icon: CircuitBoard,
      activities: [
        { id: "dielectric", label: isRTL ? "العازل في المتسعة" : "Dielectric in a Capacitor" },
        { id: "discharge", label: isRTL ? "تفريغ المتسعة" : "Capacitor Discharge" },
      ],
    },
    {
      id: "chapter-2",
      number: 2,
      title: isRTL ? "الفصل الثاني" : "Chapter 2",
      topic: isRTL ? "الحث الكهرومغناطيسي" : "Electromagnetic Induction",
      icon: Zap,
      activities: [
        { id: "self-induction", label: isRTL ? "الحث الذاتي" : "Self-Induction" },
        { id: "faraday-induction", label: isRTL ? "تجربة فاراداي" : "Faraday's Experiment" },
        { id: "eddy-current-pendulum", label: isRTL ? "التيارات الدوامة" : "Eddy Currents" },
        { id: "induced-emf-factors", label: isRTL ? "عوامل القوة الدافعة المحتثة" : "Induced EMF Factors" },
      ],
    },
    {
      id: "chapter-4",
      number: 4,
      title: isRTL ? "الفصل الرابع" : "Chapter 4",
      topic: isRTL ? "الموجات الكهرومغناطيسية" : "Electromagnetic Waves",
      icon: Radio,
      activities: [
        { id: "electromagnetic-wave-generation", label: isRTL ? "توليد الموجات" : "Wave Generation" },
      ],
    },
    {
      id: "chapter-5",
      number: 5,
      title: isRTL ? "الفصل الخامس" : "Chapter 5",
      topic: isRTL ? "البصريات الفيزيائية" : "Physical Optics",
      icon: Waves,
      activities: [
        { id: "wave-interference", label: isRTL ? "تداخل الموجات" : "Wave Interference" },
        { id: "polarization", label: isRTL ? "استقطاب الضوء" : "Light Polarization" },
        { id: "light-wave-polarization", label: isRTL ? "موجات الضوء" : "Light Waves" },
        { id: "mechanical-wave-polarization", label: isRTL ? "استقطاب الموجات الميكانيكية" : "Mechanical Waves" },
        { id: "light-diffraction", label: isRTL ? "حيود الضوء" : "Light Diffraction" },
        { id: "young-double-slit", label: isRTL ? "تجربة يونك" : "Young's Experiment" },
      ],
    },
    {
      id: "chapter-6",
      number: 6,
      title: isRTL ? "الفصل السادس" : "Chapter 6",
      topic: isRTL ? "الفيزياء الحديثة" : "Modern Physics",
      icon: Atom,
      activities: [
        { id: "spectra", label: isRTL ? "أنواع الأطياف" : "Types of Spectra" },
        { id: "photoelectric", label: isRTL ? "الظاهرة الكهروضوئية" : "Photoelectric Effect" },
      ],
    },
  ];

  const selectedChapter = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0];

  const selectChapter = (chapterId: string) => {
    const nextChapter = chapters.find((chapter) => chapter.id === chapterId);
    if (!nextChapter) return;
    setActiveChapter(chapterId);
    setActiveActivity(nextChapter.activities[0].id);
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card text-sm font-medium hover:bg-secondary transition-colors mb-6"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          {t.back}
        </button>

        <header className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Atom className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl">{t.subtitle}</p>
          </div>
        </header>

        <section aria-labelledby="physics-chapter-picker" className="mb-5 rounded-3xl border border-border bg-card/75 p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <h2 id="physics-chapter-picker" className="flex items-center gap-2 text-sm font-black text-foreground">
              <BookOpen className="size-4 text-primary" aria-hidden="true" />
              {t.chooseChapter}
            </h2>
            <span className="text-xs font-bold text-muted-foreground">{chapters.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            {chapters.map((chapter) => {
              const ChapterIcon = chapter.icon;
              const isActive = chapter.id === activeChapter;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => selectChapter(chapter.id)}
                  aria-pressed={isActive}
                  className={`group relative min-h-[104px] overflow-hidden rounded-2xl border p-3 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "border-primary/45 bg-primary text-primary-foreground shadow-[0_14px_36px_-22px_hsl(var(--primary))]"
                      : "border-border bg-background hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5"
                  }`}
                >
                  <span className={`mb-3 grid size-9 place-items-center rounded-xl ${isActive ? "bg-white/15" : "bg-primary/10 text-primary"}`}>
                    <ChapterIcon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="block text-xs font-black opacity-75">{chapter.title}</span>
                  <span className="mt-0.5 block line-clamp-2 text-sm font-black">{chapter.topic}</span>
                  <span className={`mt-2 block text-[11px] font-bold ${isActive ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                    {chapter.activities.length} {chapter.activities.length === 1 && !isRTL ? "activity" : t.activityCount}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <Tabs value={activeActivity} onValueChange={setActiveActivity} className="w-full">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
            <div className="shrink-0 px-1">
              <p className="text-xs font-black text-primary">{selectedChapter.title}</p>
              <p className="text-sm font-black text-foreground">{t.chooseActivity}</p>
            </div>
            <TabsList className="grid h-auto min-w-0 flex-1 grid-cols-1 gap-1 bg-muted/70 p-1 sm:grid-cols-2 lg:grid-cols-3">
              {selectedChapter.activities.map((activity) => (
                <TabsTrigger key={activity.id} value={activity.id} className="min-h-10 whitespace-normal px-3 py-2 text-xs font-black sm:text-sm">
                  {activity.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="dielectric">
            <DielectricCapacitorActivity language={language} />
          </TabsContent>

          <TabsContent value="discharge">
            <CapacitorDischarge language={language} />
          </TabsContent>

          <TabsContent value="self-induction">
            <SelfInductionActivity language={language} />
          </TabsContent>

          <TabsContent value="faraday-induction">
            <FaradayInductionActivity language={language} />
          </TabsContent>

          <TabsContent value="eddy-current-pendulum">
            <EddyCurrentPendulumActivity language={language} />
          </TabsContent>

          <TabsContent value="induced-emf-factors">
            <InducedEmfFactorsActivity language={language} />
          </TabsContent>

          <TabsContent value="electromagnetic-wave-generation">
            <ElectromagneticWaveGenerationActivity language={language} />
          </TabsContent>

          <TabsContent value="wave-interference">
            <WaveInterferenceActivity language={language} />
          </TabsContent>

          <TabsContent value="spectra">
            <SpectrumTypesActivity language={language} />
          </TabsContent>

          <TabsContent value="photoelectric">
            <PhotoelectricEffectActivity language={language} />
          </TabsContent>

          <TabsContent value="polarization">
            <PolarizationActivity language={language} />
          </TabsContent>

          <TabsContent value="light-wave-polarization">
            <LightWavePolarizationActivity language={language} />
          </TabsContent>

          <TabsContent value="mechanical-wave-polarization">
            <MechanicalWavePolarizationActivity language={language} />
          </TabsContent>

          <TabsContent value="light-diffraction">
            <LightDiffractionActivity language={language} />
          </TabsContent>

          <TabsContent value="young-double-slit">
            <YoungDoubleSlitActivity language={language} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default PhysicsActivities;
