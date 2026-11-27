import { captureBattleChannelLink, pendingBattleChannelId } from "./lib/battleChannelLink";
import { captureSessionRoomLink } from "./lib/sessionRoyale";
import { useFlightStudySync } from "./hooks/useFlightStudySync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
const Index = lazy(() => import("./pages/Index.tsx"));
const Chapters = lazy(() => import("./pages/Chapters.tsx"));
import NotFound from "./pages/NotFound.tsx";
import { useState, useCallback, Suspense } from "react";

import { AppLanguage, LanguageGate, LANGUAGE_STORAGE_KEY } from "./components/LanguageGate";
import { markUsageIntroAnswered } from "./lib/usageIntro";
import Subjects, {
  BIOLOGY_FLASHCARD_TEACHER_STORAGE_KEY,
  CHEMISTRY_FLASHCARD_TEACHER_STORAGE_KEY,
  SUBJECT_STORAGE_KEY,
  PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY,
  type AppSubject,
} from "./pages/Subjects";
import { applyTheme, getInitialTheme } from "./components/ThemePicker";
import { useEffect } from "react";
import Auth from "./pages/Auth";
import { supabase } from "./integrations/supabase/client";
import { readOAuthCallback } from "@/lib/oauthCallback";
const Missions = lazy(() => import("./pages/Missions"));
const MCQ = lazy(() => import("./pages/MCQ"));
const StudyRace = lazy(() => import("./pages/StudyRace"));
const Summaries = lazy(() => import("./pages/Summaries"));
const MalazamLibrary = lazy(() => import("./pages/MalazamLibrary"));
const Advices = lazy(() => import("./pages/Advices"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Community = lazy(() => import("./pages/Community"));
const Friends = lazy(() => import("./pages/Friends"));
const CommunityChat = lazy(() => import("./pages/CommunityChat"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminMalazamPortal = lazy(() => import("./pages/AdminMalazamPortal"));
const AdminCouponsTab = lazy(() => import("./components/AdminCouponsTab"));
const FrenchTeacherDashboard = lazy(() => import("./pages/FrenchTeacherDashboard"));
const AdminAhmedFlashcardsReview = lazy(() => import("./pages/AdminAhmedFlashcardsReview"));
const NadiaFlashcardsDashboard = lazy(() => import("./pages/NadiaFlashcardsDashboard"));
const FlashcardsDashboard = lazy(() => import("./pages/FlashcardsDashboard"));
const NadiaMinisterialQuestions = lazy(() => import("./pages/NadiaMinisterialQuestions"));
import AdminLogin from "./pages/AdminLogin";
import AdminMcqReview from "./pages/AdminMcqReview";

// Secret admin panel URL — not linked anywhere in the UI.
const ADMIN_PANEL_PATH = "/tmz-ctrl-8462";
const ADMIN_MALAZAM_PATH = `${ADMIN_PANEL_PATH}/malazam`;

const AccountCenter = lazy(() => import("./pages/AccountCenter"));
const Essay = lazy(() => import("./pages/Essay"));
const VideoNotes = lazy(() => import("./pages/VideoNotes"));
const PodcastTutor = lazy(() => import("./pages/PodcastTutor"));
import ZombieGuard from "./components/ZombieGuard";
import ChallengeInviteWatcher from "./components/ChallengeInviteWatcher";
import StudyChallengeInviteWatcher from "./components/StudyChallengeInviteWatcher";
import EnglishCategoryPage, { ENGLISH_CATEGORY_STORAGE_KEY, type EnglishCategory } from "./pages/EnglishCategory";
import type { BasicsChoice } from "./pages/Basics";
import type { MainMenuChoice } from "./pages/MainMenu";
const Basics = lazy(() => import("./pages/Basics"));
import { captureAttribution, syncAttribution, logSignupCompleted, logFirstFeatureTouch } from "@/lib/userEvents";
import { recordToolUse } from "@/lib/recentTools";
import { useSubscription } from "@/hooks/useSubscription";
import { isPremiumTool } from "@/lib/premium";
import PremiumToolLock from "@/components/PremiumToolLock";
const BiologyDrawings = lazy(() => import("./pages/BiologyDrawings"));
const BiologySketchpad = lazy(() => import("./pages/BiologySketchpad"));
const BiologySchemes = lazy(() => import("./pages/BiologySchemes"));
const PhysicsSchemes = lazy(() => import("./pages/PhysicsSchemes"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const PointsAwardOverlay = lazy(() => import("./components/PointsAwardOverlay"));
const FeatureUnlockCelebration = lazy(() => import("./components/FeatureUnlockCelebration"));
const StudentCharacter = lazy(() => import("./components/StudentCharacter"));

const MutamayizChat = lazy(() => import("./pages/MutamayizChat"));

const FeatureUnlocks = lazy(() => import("./pages/FeatureUnlocks"));
import { ensureDailyLogin, fetchUnlockedKeys, isGatedMenu, type FeatureKey } from "@/lib/unlocks";
const TodoList = lazy(() => import("./pages/TodoList"));
const News = lazy(() => import("./pages/News"));
const Premium = lazy(() => import("./pages/Premium"));
const MinisterialBank = lazy(() => import("./pages/MinisterialBank"));
const McqBank = lazy(() => import("./pages/McqBank"));
const McqReviewDashboard = lazy(() => import("./pages/McqReviewDashboard"));
const MyMistakes = lazy(() => import("./pages/MyMistakes"));
const MindMap = lazy(() => import("./pages/MindMap"));
const IslamicSurahs = lazy(() => import("./pages/IslamicSurahs"));
const HadithChecker = lazy(() => import("./pages/HadithChecker"));
const PoemsChecker = lazy(() => import("./pages/PoemsChecker"));
const EnglishEssays = lazy(() => import("./pages/EnglishEssays"));
const EnglishIsqat = lazy(() => import("./pages/EnglishIsqat"));
const EnglishVerbForms = lazy(() => import("./pages/EnglishVerbForms"));
const EnglishReadingPractice = lazy(() => import("./pages/EnglishReadingPractice"));
const DailyReport = lazy(() => import("./pages/DailyReport"));
const Notes = lazy(() => import("./pages/Notes"));
const Canvas = lazy(() => import("./pages/Canvas"));
const YoutubePlayer = lazy(() => import("./pages/YoutubePlayer"));
const OrganicEquations = lazy(() => import("./pages/OrganicEquations"));
const ChemicalEquations = lazy(() => import("./pages/ChemicalEquations"));
const AtomAtlas = lazy(() => import("./pages/AtomAtlas"));
const LiveBattle = lazy(() => import("./pages/LiveBattle"));
const SubjectsHub = lazy(() => import("./pages/SubjectsHub"));
const TheoremVisualizerPage = lazy(() => import("./pages/TheoremVisualizerPage"));
const PerpendicularLineContainmentPage = lazy(() => import("./pages/PerpendicularLineContainmentPage"));
const PlanePerpendicularityCriterionPage = lazy(() => import("./pages/PlanePerpendicularityCriterionPage"));
const UniquePerpendicularPlanePage = lazy(() => import("./pages/UniquePerpendicularPlanePage"));
const IntersectionPerpendicularResultPage = lazy(() => import("./pages/IntersectionPerpendicularResultPage"));
const TextToVideo = lazy(() => import("./pages/TextToVideo"));
const PhysicsLaws = lazy(() => import("./pages/PhysicsLaws"));
const PhysicsQuickMcq = lazy(() => import("./pages/PhysicsQuickMcq"));
const PhysicsProblemSolver = lazy(() => import("./pages/PhysicsProblemSolver"));
const ProblemGenerator = lazy(() => import("./pages/ProblemGenerator"));
const FrenchSynonyms = lazy(() => import("./pages/FrenchSynonyms"));
const FrenchAntonyms = lazy(() => import("./pages/FrenchAntonyms"));
const FrenchConjugator = lazy(() => import("./pages/FrenchConjugator"));
const ToolPlaceholder = lazy(() => import("./pages/ToolPlaceholder"));
const PhysicsActivities = lazy(() => import("./pages/PhysicsActivities"));
const ChemistryExperiments = lazy(() => import("./pages/ChemistryExperiments"));
const OurCourses = lazy(() => import("./pages/OurCourses"));
const PdfBuilder = lazy(() => import("./pages/PdfBuilder"));
const ExamGenerator = lazy(() => import("./pages/ExamGenerator"));
const Teachers = lazy(() => import("./pages/Teachers"));
const TeacherDirectory = lazy(() => import("./pages/TeacherDirectory"));
const AdminNotes = lazy(() => import("./pages/AdminNotes"));
const DailyGame = lazy(() => import("./pages/DailyGame"));
const WhoIsBest = lazy(() => import("./pages/WhoIsBest"));
const ChallengePage = lazy(() => import("./pages/Challenge"));
const JoinTamayzak = lazy(() => import("./pages/JoinTamayzak"));
const MinisterialQuestions = lazy(() => import("./pages/MinisterialQuestions"));
const ToolLanding = lazy(() => import("./pages/ToolLanding"));
const ToolsIndex = lazy(() => import("./pages/ToolsIndex"));
import { PUBLIC_TOOL_SLUGS } from "@/data/publicTools";
import { readWeeklyLearningProfile } from "@/lib/weeklyLearning";
import { RETURN_TO_PROGRESS_KEY, TOPIC_PRACTICE_TARGET_KEY } from "@/lib/topicPracticeQuiz";
import { useStudyBackHistory } from "@/hooks/useStudyBackHistory";
import { isGuideToolKey } from "@/lib/guideTools";

const Welcome = lazy(() => import("./pages/Welcome"));
const ParentFollow = lazy(() => import("./pages/ParentFollow"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
import { PaymentTestModeBanner } from "./components/PaymentTestModeBanner";
const SearchFAB = lazy(() => import("./components/SearchFAB"));
// Optional global widget: if its file can't load (stale deploy), render nothing instead of blanking the app.
const WeaknessCheckInAgent = lazy(() =>
  import("./components/WeaknessCheckInAgent").catch(() =>
    import("./components/WeaknessCheckInAgent").catch(() => ({ default: (() => null) as unknown as typeof import("./components/WeaknessCheckInAgent").default })),
  ),
);
import PageTransition from "./components/PageTransition";
import BottomGroupNav from "./components/BottomGroupNav";
import { startAnalyticsSession, captureSignupSource } from "@/lib/analytics";
import { captureReferralCode, redeemPendingReferral } from "@/lib/referral";

captureSignupSource();
captureReferralCode();

const MENU_STORAGE_KEY = "app_menu_choice_v1";
const NADIA_MINISTERIAL_ROUTE = /^(?:\/ministerial-questions-for-nadia-al-nuamey|\/ministerial-questions\/nadia-biology)(?:\/chapter\/([1-5]))?\/?$/;

function getNadiaMinisterialRouteMatch(): RegExpMatchArray | null {
  if (typeof window === "undefined") return null;
  return window.location.pathname.match(NADIA_MINISTERIAL_ROUTE);
}

// Reading the persisted auth snapshot is synchronous. This lets returning
// users render immediately instead of waiting on a refresh request that can
// be slow or stalled in Android in-app browsers.
function hasPersistedAuthSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const stored = JSON.parse(raw) as { access_token?: unknown; user?: { id?: unknown } };
      if (typeof stored.access_token === "string" && typeof stored.user?.id === "string") return true;
    }
  } catch {
    // Blocked or malformed storage is not a trusted persisted session.
  }
  return false;
}

const SpotifyAuthCallback = () => {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("state") === "spotify" && url.searchParams.get("code")) {
      import("@/lib/spotifyAuth").then((m) => m.handleRedirectCallback());
    }
  }, []);
  return null;
};

const queryClient = new QueryClient();

const normalizeNadiaTeacherLink = () => {
  if (typeof window === "undefined") return;
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path === "/nadia-arabic") {
    window.history.replaceState({}, "", "/teachers?nadia=1&curriculum=ar");
  } else if (path === "/nadia-english") {
    window.history.replaceState({}, "", "/teachers?nadia=1&curriculum=en");
  } else if (path === "/nadia-arabic-mcqs") {
    window.history.replaceState({}, "", "/teachers?nadia=1&curriculum=ar&section=mcq");
  } else if (path === "/nadia-arabic-lectures") {
    window.history.replaceState({}, "", "/teachers?nadia=1&curriculum=ar&section=lectures");
  }
};

const McqBankDeepLink = () => {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const language: AppLanguage = (() => { try { return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "ar"; } catch { return "ar"; } })();
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setAuthed(!!data.user); setChecking(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (active) setAuthed(!!session?.user); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  return <QueryClientProvider client={queryClient}><TooltipProvider><Suspense fallback={null}>
    {checking ? null : authed ? <McqBank language={language} onBack={() => { window.location.href = "/"; }} /> : <Auth onAuthed={() => setAuthed(true)} />}
  </Suspense></TooltipProvider></QueryClientProvider>;
};

const App = () => {
  captureBattleChannelLink();
  captureSessionRoomLink();
  normalizeNadiaTeacherLink();
  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/mcq-review") return <QueryClientProvider client={queryClient}><TooltipProvider><Suspense fallback={null}><McqReviewDashboard /></Suspense></TooltipProvider></QueryClientProvider>;
  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/mcq-bank") return <McqBankDeepLink />;

  // Standalone password-protected flashcards management dashboard.
  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/flashcards-dashboard") {
    return (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <FlashcardsDashboard />
        </Suspense>
      </QueryClientProvider>
    );
  }

  // Standalone password-protected review dashboard for Nadia's Biology decks.
  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/nadia-flashcards") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <NadiaFlashcardsDashboard />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Standalone password-protected ministerial questions dashboard for Nadia's Biology material.
  const normalizedPath = typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") : "";
  if (normalizedPath === "/nadia-ministerial-questions" || normalizedPath === "/nadia-ministerial-dashboard") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <NadiaMinisterialQuestions />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Public parent follow-up route — intercept before any auth gating
  const followMatch = typeof window !== "undefined" ? window.location.pathname.match(/^\/follow\/([A-Za-z0-9_-]+)/) : null;
  if (followMatch) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
            <ParentFollow token={followMatch[1]} />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // OAuth consent route for MCP clients — intercept before any auth gating
  if (typeof window !== "undefined" && window.location.pathname === "/.lovable/oauth/consent") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
            <OAuthConsent />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Public password-reset landing — must run before any auth gate so the
  // recovery link works even when the user is signed out.
  if (typeof window !== "undefined" && window.location.pathname === "/reset-password") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
            <ResetPassword />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Public standalone mathematics visualizers with shareable direct URLs.
  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/math/theorem-visualizer/result-9") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <IntersectionPerpendicularResultPage />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/math/theorem-visualizer/theorem-9") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <UniquePerpendicularPlanePage />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/math/theorem-visualizer/theorem-8") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <PlanePerpendicularityCriterionPage />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/math/theorem-visualizer/result-7") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <PerpendicularLineContainmentPage />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/math/theorem-visualizer") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <TheoremVisualizerPage />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Public, crawlable Al-Malazam pages. Each SEO URL renders the real
  // Al-Malazam subject picker while preserving its unique title and description.
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/malazam")) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={null}><MalazamLibrary /></Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Public, crawlable ministerial questions landing page — before any auth gate.
  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/ministerial-questions") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <MinisterialQuestions />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Public, crawlable tools hub (/tools).
  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/tools") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={null}>
            <ToolsIndex />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Public, crawlable tool landing pages (/tools/flashcards, /tools/mcq, ...).
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/tools/")) {
    const slug = window.location.pathname.replace(/\/+$/, "").replace(/^\/tools\//, "");
    if (PUBLIC_TOOL_SLUGS.includes(slug)) {
      return (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Suspense fallback={null}>
              <ToolLanding slug={slug} />
            </Suspense>
          </TooltipProvider>
        </QueryClientProvider>
      );
    }
  }


  if (typeof window !== "undefined" && window.location.pathname === "/welcome") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Welcome />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (typeof window !== "undefined" && window.location.pathname === "/admin/mcq-review") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AdminMcqReview />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/admin/flashcards/ahmed-al-nadawi") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
            <AdminAhmedFlashcardsReview />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }


  // Keep student hooks inside their own component; public-route returns must
  // not change the hook order or start subscription checks on public pages.
  return <StudentApp />;
};

const StudentApp = () => {
  const nadiaMinisterialRouteMatch = getNadiaMinisterialRouteMatch();
  const isNadiaMinisterialRoute = nadiaMinisterialRouteMatch !== null;
  const nadiaMinisterialInitialChapter = nadiaMinisterialRouteMatch?.[1]
    ? Number(nadiaMinisterialRouteMatch[1])
    : null;

  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);
  const [authed, setAuthed] = useState(() => hasPersistedAuthSession());
  useFlightStudySync(authed);
  const [authLoading, setAuthLoading] = useState(() => !hasPersistedAuthSession());
  // Guests browsing Nadia's bank can open the sign-in / sign-up page from the banner.
  const [nadiaAuthOpen, setNadiaAuthOpen] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [authRole, setAuthRole] = useState<"student" | "admin" | "guest">(
    () => {
      if (typeof window === "undefined") return "student";
      // Hidden admin entry point: only reachable by typing the secret URL.
      if ([ADMIN_PANEL_PATH, ADMIN_MALAZAM_PATH, `${ADMIN_PANEL_PATH}/coupons`, `${ADMIN_PANEL_PATH}/french-flashcards`].includes(window.location.pathname.replace(/\/+$/, ""))) return "admin";
      if (window.location.pathname.startsWith("/who-is-best")) return "guest";
      // Lecture deep links remain public without making every visitor choose
      // a role before entering the app.
      if (
        window.location.pathname.startsWith("/teachers") &&
        !hasPersistedAuthSession()
      ) {
        return "guest";
      }
      return "student";
    }
  );
  useEffect(() => {
    // ---- OAuth callback diagnostics (runs once on mount) ----
    try {
      const url = new URL(window.location.href);
      const hash = window.location.hash || "";
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
      const searchKeys = Array.from(url.searchParams.keys());
      const hashKeys = Array.from(hashParams.keys());
      const oauthMarkers = {
        hasCode: url.searchParams.has("code"),
        hasState: url.searchParams.has("state") || hashParams.has("state"),
        hasAccessToken: hashParams.has("access_token"),
        hasRefreshToken: hashParams.has("refresh_token"),
        hasError: url.searchParams.has("error") || hashParams.has("error"),
        error: url.searchParams.get("error") ?? hashParams.get("error"),
        errorCode: url.searchParams.get("error_code") ?? hashParams.get("error_code"),
        errorDescription:
          url.searchParams.get("error_description") ?? hashParams.get("error_description"),
        provider: hashParams.get("provider_token") ? "present" : null,
      };
      const isOAuthLanding =
        oauthMarkers.hasCode ||
        oauthMarkers.hasAccessToken ||
        oauthMarkers.hasError ||
        url.pathname.includes("/~oauth");
      if (isOAuthLanding) {
        console.log("[OAuth] callback landing", {
          origin: window.location.origin,
          pathname: url.pathname,
          searchKeys,
          hashKeys,
          markers: oauthMarkers,
        });
        if (oauthMarkers.hasError) {
          console.error("[OAuth] provider returned error on callback", oauthMarkers);
        }
      }
    } catch (e) {
      console.error("[OAuth] failed to parse callback URL", e);
    }

    // The Lovable broker returns Google/Apple sessions in the URL fragment.
    // Recover them explicitly before getSession() so slow WebView storage or a
    // delayed Supabase initializer cannot leave the app on its loading screen.
    const oauthCallback = readOAuthCallback(window.location.href);
    if (oauthCallback.kind !== "none") {
      window.history.replaceState(window.history.state, "", oauthCallback.cleanPath);
    }
    let active = true;

    // A resumed Android WebView can navigate from / to /#access_token=...
    // without remounting React. Consume that callback on the existing page.
    const handleReturn = async () => {
      const callback = readOAuthCallback(window.location.href);
      if (callback.kind === "none") return;
      window.history.replaceState(window.history.state, "", callback.cleanPath);
      try {
        if (callback.kind === "error") throw new Error("OAuth callback failed");
        const { data, error } = await supabase.auth.setSession(callback.tokens);
        if (error || !data.session) throw new Error("Session recovery failed");
        if (active) setAuthed(true);
      } catch {
        if (active) toast.error("تعذر إكمال تسجيل الدخول. حاول مرة ثانية · Please sign in again.");
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    window.addEventListener("hashchange", handleReturn);

    // Detect a persisted Supabase session token in storage. On Android
    // WebViews / slow networks getSession() can stall or the refresh call can
    // fail; in that case we must NOT bounce a logged-in user to the sign-in
    // screen just because the network was slow.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      console.log("[OAuth] onAuthStateChange", {
        event: _e,
        hasSession: !!session,
        userId: session?.user?.id,
        provider: (session?.user as any)?.app_metadata?.provider,
        providers: (session?.user as any)?.app_metadata?.providers,
        expiresAt: session?.expires_at,
      });
      // Only an explicit sign-out (or user deletion) may log the user out.
      // Transient null sessions from failed token refreshes must not.
      if (session) {
        setAuthed(true);
        setAuthLoading(false);
      } else if (_e === "SIGNED_OUT") {
        setAuthed(false);
      }
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .in("role", ["admin", "moderator"])
          .limit(1)
          .maybeSingle()
          .then(({ data }) => setIsAdmin(!!data));
      } else {
        setIsAdmin(false);
      }
    });
    // Safety net: some in-app browsers (Telegram/Android WebView) can stall
    // storage/network so getSession() never settles — never trap the user on
    // an infinite spinner.
    const authTimeout = window.setTimeout(() => {
      // If a session token exists in storage, keep the user "logged in" and
      // let the client finish refreshing in the background instead of
      // dropping them back on the sign-in screen.
      if (hasPersistedAuthSession()) setAuthed(true);
      setAuthLoading(false);
    }, 4000);

    const initializeAuth = async () => {
      try {
        if (oauthCallback.kind === "error") {
          toast.error(oauthCallback.message || "تعذر تسجيل الدخول · Sign-in failed");
        } else if (oauthCallback.kind === "tokens") {
          const { error } = await supabase.auth.setSession(oauthCallback.tokens);
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getSession();
        if (!active) return;
        console.log("[OAuth] initial getSession", {
          hasSession: !!data.session,
          userId: data.session?.user?.id,
          provider: (data.session?.user as any)?.app_metadata?.provider,
          error: error ? { message: error.message, name: error.name } : null,
        });
        if (data.session) setAuthed(true);
        // A transient null result must not override a persisted signed-in user.
        // Only the SIGNED_OUT auth event above is allowed to clear that state.
        else if (hasPersistedAuthSession()) setAuthed(true);
        else setAuthed(false);
        if (data.session?.user) {
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.session.user.id)
            .in("role", ["admin", "moderator"])
            .limit(1)
            .maybeSingle()
            .then(({ data: r }) => setIsAdmin(!!r));
        }
        window.clearTimeout(authTimeout);
        setAuthLoading(false);
      } catch (e) {
        if (!active) return;
        console.error("[OAuth] session recovery failed", e);
        if (hasPersistedAuthSession()) setAuthed(true);
        else if (oauthCallback.kind === "tokens") {
          toast.error("تعذر إكمال تسجيل الدخول. حاول مرة ثانية · Sign-in failed. Please try again.");
        }
        window.clearTimeout(authTimeout);
        setAuthLoading(false);
      }
    };
    void initializeAuth();
    return () => {
      active = false;
      window.clearTimeout(authTimeout);
      window.removeEventListener("hashchange", handleReturn);
      sub.subscription.unsubscribe();
    };
  }, []);

  // Record sign-in analytics and referral activity.
  useEffect(() => {
    if (!authed) return;
    startAnalyticsSession();
    captureAttribution();
    void syncAttribution();
    void logSignupCompleted({ src: captureAttribution().src });
    void redeemPendingReferral(
      (typeof localStorage !== "undefined" && localStorage.getItem(LANGUAGE_STORAGE_KEY)) === "ar" ? "ar" : "en"
    );
  }, [authed]);

  useEffect(() => {
    if (!authed || typeof window === "undefined") return;
    const returnPath = sessionStorage.getItem("tamayzak_return_after_auth");
    if (!returnPath) return;
    sessionStorage.removeItem("tamayzak_return_after_auth");
    if (/^\/malazam(?:\/|$)/.test(returnPath)) window.location.assign(returnPath);
  }, [authed]);

  // Periodic "did the user leave the Tamayzak channel?" re-check is disabled
  // while the join gate is removed.
  const [language, setLanguage] = useState<AppLanguage | null>(() => {
    if (typeof window === "undefined") return null;
    // Deep links such as /teachers?lang=en or /enrichments?lang=ar.
    if (
      window.location.pathname.startsWith("/teachers") ||
      window.location.pathname.startsWith("/flashcards") ||
      window.location.pathname.startsWith("/enrichments") ||
      window.location.pathname.replace(/\/+$/, "") === "/physics-activities" ||
      getNadiaMinisterialRouteMatch()
    ) {
      const l = new URLSearchParams(window.location.search).get("lang");
      if (l === "ar" || l === "en") {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, l);
        return l as AppLanguage;
      }
    }
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === "ar" || saved === "en" ? saved : null;
  });
  const [changingLanguage, setChangingLanguage] = useState(false);
  useEffect(() => {
    if (!language) return;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  const [subject, setSubject] = useState<AppSubject | null>(() => {
    if (typeof window === "undefined") return null;
    if (window.location.pathname.replace(/\/+$/, "") === "/physics-activities") {
      localStorage.setItem(SUBJECT_STORAGE_KEY, "physics");
      return "physics";
    }
    if (getNadiaMinisterialRouteMatch()) {
      localStorage.setItem(SUBJECT_STORAGE_KEY, "biology");
      return "biology";
    }
    if (window.location.pathname.replace(/\/+$/, "") === "/flashcards/ahmed-al-nadawi") {
      localStorage.setItem(SUBJECT_STORAGE_KEY, "chemistry");
      sessionStorage.setItem(CHEMISTRY_FLASHCARD_TEACHER_STORAGE_KEY, "ahmed-al-nadawi");
      return "chemistry";
    }
    if (window.location.pathname.startsWith("/flashcards")) {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("subject") as AppSubject | null;
      if (s) {
        try {
          localStorage.setItem(SUBJECT_STORAGE_KEY, s);
          // The teacher's main English link should always open the English
          // flashcard sections menu, not a category remembered on this device.
          if (s === "english" && window.location.pathname.replace(/\/+$/, "") === "/flashcards") {
            localStorage.removeItem(ENGLISH_CATEGORY_STORAGE_KEY);
          }
          if (s === "physics") sessionStorage.setItem(PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY, "haydar-diwan");
          if (s === "biology") {
            const list = params.get("list");
            if (list === "nadia-al-nuaimi" || list === "mohammed-al-anzi") {
              sessionStorage.setItem(BIOLOGY_FLASHCARD_TEACHER_STORAGE_KEY, list);
            }
          }
          if (s === "chemistry") {
            const list = params.get("list");
            if (list === "wijdan" || list === "ahmed-al-nadawi") {
              sessionStorage.setItem(CHEMISTRY_FLASHCARD_TEACHER_STORAGE_KEY, list);
            }
          }
        } catch { /* ignore */ }
        return s;
      }
    }
    return localStorage.getItem(SUBJECT_STORAGE_KEY) as AppSubject | null;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const s = (e as CustomEvent).detail?.subject as AppSubject | null;
      if (s) setSubject(s);
    };
    window.addEventListener("app:set-subject", handler as EventListener);
    return () => window.removeEventListener("app:set-subject", handler as EventListener);
  }, []);
  const [englishCategory, setEnglishCategory] = useState<EnglishCategory | null>(() => {
    if (typeof window === "undefined") return null;
    const requestedCategory = new URLSearchParams(window.location.search).get("category");
    const validCategories: EnglishCategory[] = ["grammar", "literature", "paragraphs", "verbs", "readingPractice"];
    if (requestedCategory && validCategories.includes(requestedCategory as EnglishCategory)) {
      localStorage.setItem(ENGLISH_CATEGORY_STORAGE_KEY, requestedCategory);
      return requestedCategory as EnglishCategory;
    }
    return localStorage.getItem(ENGLISH_CATEGORY_STORAGE_KEY) as EnglishCategory | null;
  });
  type MenuChoice = MainMenuChoice;
  const [menuChoice, setMenuChoice] = useState<MenuChoice | null>(() => {
    if (pendingBattleChannelId()) return "liveBattle";
    if (typeof window === "undefined") return null;
    if (window.location.pathname.replace(/\/+$/, "") === "/physics-activities") {
      localStorage.setItem(MENU_STORAGE_KEY, "physicsActivities");
      return "physicsActivities";
    }
    if (getNadiaMinisterialRouteMatch()) {
      localStorage.setItem(MENU_STORAGE_KEY, "ministerialBank");
      return "ministerialBank";
    }
    if (window.location.pathname.startsWith("/flashcards")) {
      localStorage.setItem(MENU_STORAGE_KEY, "flashcards");
      return "flashcards";
    }
    // Public SEO deep links such as /malazam/physics-chapter-1 open Al-Malazam.
    if (window.location.pathname.startsWith("/malazam")) {
      localStorage.setItem(MENU_STORAGE_KEY, "malazam");
      return "malazam";
    }
    if (window.location.pathname.startsWith("/teachers")) {
      localStorage.setItem(MENU_STORAGE_KEY, "teachers");
      return "teachers";
    }
    if (window.location.pathname.startsWith("/enrichments")) {
      localStorage.setItem(MENU_STORAGE_KEY, "adminNotes");
      return "adminNotes";
    }
    if (window.location.pathname.replace(/\/+$/, "") === "/study-race") {
      return "studyRace";
    }
    if (window.location.pathname.startsWith("/who-is-best")) {
      localStorage.setItem(MENU_STORAGE_KEY, "whoIsBest");
      return "whoIsBest";
    }
    // Shared study-room invite link: /room?code=ABC123
    if (window.location.pathname.startsWith("/room")) {
      localStorage.setItem(MENU_STORAGE_KEY, "sessions");
      return "sessions";
    }
    return localStorage.getItem(MENU_STORAGE_KEY) as MenuChoice | null;
  });
  const [practiceReturnTarget, setPracticeReturnTarget] = useState<"physicsSchemes" | "biologySchemes" | "basics" | null>(null);
  // Points-unlock state (lifetime points gate the 4 advanced tools)
  const [unlockedKeys, setUnlockedKeys] = useState<FeatureKey[]>([]);
  const [unlockHighlight, setUnlockHighlight] = useState<FeatureKey | null>(null);
  useEffect(() => {
    if (!authed) return;
    const refresh = () => fetchUnlockedKeys().then(setUnlockedKeys).catch(() => {});
    refresh();
    ensureDailyLogin().catch(() => {});
    const onUpdate = () => refresh();
    window.addEventListener("app:progress-updated", onUpdate);
    window.addEventListener("app:feature-unlocked", onUpdate);
    return () => {
      window.removeEventListener("app:progress-updated", onUpdate);
      window.removeEventListener("app:feature-unlocked", onUpdate);
    };
  }, [authed]);

  // Admin "Play daily game" preview: when set, we render DailyGame directly
  // even for admins (which normally short-circuit to AdminDashboard).
  const [adminPreviewDay, setAdminPreviewDay] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("daily_game_preview_day");
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) ? n : null;
  });
  const exitAdminPreview = () => {
    try { sessionStorage.removeItem("daily_game_preview_day"); } catch {}
    setAdminPreviewDay(null);
  };

  const sectionHistory = useStudyBackHistory({ menu: menuChoice, subject, category: englishCategory }, (previous) => {
    setMenuChoice(previous.menu);
    setSubject(previous.subject);
    setEnglishCategory(previous.category);
    if (previous.menu) localStorage.setItem(MENU_STORAGE_KEY, previous.menu);
    else localStorage.removeItem(MENU_STORAGE_KEY);
    if (previous.subject) localStorage.setItem(SUBJECT_STORAGE_KEY, previous.subject);
    else localStorage.removeItem(SUBJECT_STORAGE_KEY);
    if (previous.category) localStorage.setItem(ENGLISH_CATEGORY_STORAGE_KEY, previous.category);
    else localStorage.removeItem(ENGLISH_CATEGORY_STORAGE_KEY);
  });
  useEffect(() => {
    if (!authed) return;
    const next = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (next === "ar" || next === "en") setLanguage(next);
  }, [authed]);
  const resetLanguage = () => {
    sectionHistory.clear();
    setSubject(null);
    setMenuChoice(null);
    localStorage.removeItem(MENU_STORAGE_KEY);
    setChangingLanguage(true);
    setLanguage(null);
  };
  const selectLanguage = (next: AppLanguage) => {
    markUsageIntroAnswered();
    setLanguage(next);
    setChangingLanguage(false);
  };
  const resetSubject = () => {
    setSubject(null);
    localStorage.removeItem(ENGLISH_CATEGORY_STORAGE_KEY);
    setEnglishCategory(null);
  };
  const resetMenu = () => {
    if (sectionHistory.goBack()) return;
    setSubject(null);
    setMenuChoice(null);
    localStorage.removeItem(ENGLISH_CATEGORY_STORAGE_KEY);
    setEnglishCategory(null);
    localStorage.removeItem(MENU_STORAGE_KEY);
  };
  const { isPremium, loading: subscriptionLoading, userId } = useSubscription();
  const chooseMenu = useCallback((choice: MenuChoice) => {
    if (choice !== "mcqBank") setPracticeReturnTarget(null);
    logFirstFeatureTouch(choice);
    recordToolUse(choice);
    // Points-gated tools: send the student to the progress page instead of the tool.
    const gated = isGatedMenu(choice);
    if (gated && !unlockedKeys.includes(gated) && (!isPremiumTool(choice) || isPremium)) {
      setUnlockHighlight(gated);
      localStorage.setItem(MENU_STORAGE_KEY, "unlocks");
      setMenuChoice("unlocks");
      return;
    }
    if (choice !== "unlocks") setUnlockHighlight(null);
    localStorage.setItem(MENU_STORAGE_KEY, choice);
    setMenuChoice(choice);
  }, [unlockedKeys, isPremium]);
  // Deep-link support: ?menu=courses (or any other MenuChoice) opens that section directly.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const m = params.get("menu");
    if (m) {
      chooseMenu(m as MenuChoice);
      params.delete("menu");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }
  }, []);
  // Sending a challenge from a student profile jumps into Live Battle as host.
  useEffect(() => {
    const open = () => chooseMenu("liveBattle" as MenuChoice);
    window.addEventListener("app:open-battle", open);
    return () => window.removeEventListener("app:open-battle", open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleBasicsSelect = (c: BasicsChoice) => {
    if (c === "biologyDrawings") {
      chooseMenu("biologyDrawings");
    } else if (c === "todo") {
      chooseMenu("todo");
    } else if (c === "news") {
      chooseMenu("news");
    } else if (c === "ministerialBank") {
      chooseMenu("ministerialBank");
    } else if (c === "subjectsHub") {
      chooseMenu("subjectsHub");
    } else if (c === "mindmap") {
      chooseMenu("mindmap");
    } else {
      chooseMenu(c as MenuChoice);
    }
  };
  useEffect(() => {
    const openPersonalized = (event: Event) => {
      const profile = readWeeklyLearningProfile();
      const detail = (event as CustomEvent<{ kind?: "flashcards" | "mcq"; subject?: string; chapterNumber?: number; origin?: "physicsSchemes" | "biologySchemes" }>).detail;
      const kind = detail?.kind;
      const nextSubject = (detail?.subject ?? profile?.subject) as AppSubject | undefined;
      const nextChapter = detail?.chapterNumber ?? profile?.chapterNumber;
      if (!nextSubject || !nextChapter) return;
      localStorage.setItem(SUBJECT_STORAGE_KEY, nextSubject);
      setSubject(nextSubject);
      if (kind === "flashcards") {
        window.history.replaceState({}, "", `/flashcards/${nextChapter}`);
        chooseMenu("flashcards");
      } else {
        setPracticeReturnTarget(detail?.origin ?? null);
        chooseMenu("mcqBank");
      }
    };
    window.addEventListener("app:open-personalized-practice", openPersonalized);
    return () => window.removeEventListener("app:open-personalized-practice", openPersonalized);
  }, []);
  const backToBasics = resetMenu;
  const backToCommunity = () => {
    if (!sectionHistory.goBack()) chooseMenu("community");
  };
  const leaveMinisterialBank = () => {
    if (sectionHistory.goBack()) return;
    if (!isNadiaMinisterialRoute) {
      backToBasics();
      return;
    }

    localStorage.setItem("app_subject_focus_v1", "biology");
    localStorage.setItem(SUBJECT_STORAGE_KEY, "biology");
    window.history.replaceState({}, "", "/");
    chooseMenu("subjectsHub");
  };
  const [mutamayizOpen, setMutamayizOpen] = useState(false);
  useEffect(() => {
    const openTool = (event: Event) => {
      const key = (event as CustomEvent<{ key?: string }>).detail?.key;
      if (key && isGuideToolKey(key)) { setMutamayizOpen(false); chooseMenu(key as MenuChoice); }
    };
    const open = () => setMutamayizOpen(true);
    window.addEventListener("app:mutamayiz-open-tool", openTool);
    window.addEventListener("app:open-mutamayiz", open);
    const schedule = () => { try { sessionStorage.setItem("companion:autoSchedule", "1"); } catch { /* optional shortcut */ } setMutamayizOpen(true); };
    window.addEventListener("app:companion-auto-schedule", schedule);
    return () => { window.removeEventListener("app:mutamayiz-open-tool", openTool); window.removeEventListener("app:open-mutamayiz", open); window.removeEventListener("app:companion-auto-schedule", schedule); };
  }, [chooseMenu]);

  const exitSpecialRoute = () => {
    window.history.replaceState({}, "", "/");
    setAuthRole("student");
  };
  const adminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setAuthed(false);
    exitSpecialRoute();
  };

  const canShowWelcomeBeforeAuth = !language && authRole === "student" &&
    !isNadiaMinisterialRoute && !window.location.pathname.startsWith("/flashcards");
  const showAuthLoader = authLoading && !canShowWelcomeBeforeAuth;
  const routeStage = canShowWelcomeBeforeAuth ? "welcome" : showAuthLoader ? "loading" : authed ? "in" : "out";
  const routeLanguage = !authed && language ? "authlang" : language ?? "nolang";

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ZombieGuard />
      <SpotifyAuthCallback />
      {menuChoice !== "studyRace" && <PaymentTestModeBanner />}
      <Suspense fallback={null}>
      {menuChoice !== "studyRace" && <>
        <PointsAwardOverlay language={language ?? "en"} />
        <FeatureUnlockCelebration
          language={language ?? "en"}
          onOpenFeature={(m) => chooseMenu(m as MenuChoice)}
        />
      {mutamayizOpen && language && (
        <div className="fixed inset-0 z-[92] overflow-y-auto bg-background">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>}>
            <MutamayizChat
              language={language}
              onBack={() => setMutamayizOpen(false)}
              onOpenTool={(key) => {
                if (!isGuideToolKey(key)) {
                  toast.error(language === "ar" ? "هذه الميزة غير متاحة حالياً." : "This feature is not available right now.");
                  return;
                }
                setMutamayizOpen(false);
                chooseMenu(key);
              }}
            />
          </Suspense>
        </div>
      )}
      {authed && language && (
        <StudyChallengeInviteWatcher language={language} />
      )}
      {authed && language && (
        <ChallengeInviteWatcher language={language} onAccept={() => chooseMenu("liveBattle" as MenuChoice)} />
      )}
      {authed && language && authRole !== "admin" && (
        <SearchFAB language={language} onSelect={(c) => chooseMenu(c as MenuChoice)} />
      )}
      {authed && language && authRole !== "admin" && (
        <WeaknessCheckInAgent language={language} />
      )}
      {authed && language && authRole !== "admin" && (
        <BottomGroupNav
          language={language}
          active={menuChoice}
          onSelect={chooseMenu}
          onGuide={() => setMutamayizOpen(true)}
        />
      )}
      </>}
      </Suspense>
      {authed && language && authRole === "student" && userId && (
        <Suspense fallback={null}>
          <StudentCharacter key={userId} userId={userId} language={language}
            visible={!mutamayizOpen && !["studyRace", "mutamayiz", "companion", "psych", "subjectTutor"].includes(menuChoice ?? "")}
            onNeedHelp={() => setMutamayizOpen(true)} />
        </Suspense>
      )}
      {authed && <a href="#tmz-current-screen" className="sr-only fixed start-4 top-4 z-[200] rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only">{language === "ar" ? "انتقل للمحتوى" : "Skip to content"}</a>}
      <PageTransition
        routeKey={`${authRole ?? "norole"}|${routeStage}|${routeLanguage}|${menuChoice ?? "basics"}|${subject ?? "nosub"}|${englishCategory ?? "noec"}`}
      >
      {authRole === "admin" && (window.location.pathname.replace(/\/+$/, "") === `${ADMIN_PANEL_PATH}/french-flashcards` || new URLSearchParams(window.location.search).get("section") === "french-flashcards") ? (
        <FrenchTeacherDashboard />
      ) : showAuthLoader ? (
        <main className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </main>
      ) : authRole === "admin" && !authed ? (
        <AdminLogin onAuthed={() => setAuthed(true)} onBack={exitSpecialRoute} />
      ) : authRole === "admin" && authed && isAdmin ? (
        window.location.pathname.replace(/\/+$/, "") === `${ADMIN_PANEL_PATH}/coupons` ? (
          <main className="min-h-screen bg-background px-4 py-8 text-foreground"><div className="mx-auto max-w-5xl"><a href={ADMIN_PANEL_PATH} className="mb-6 inline-block text-sm text-primary">← لوحة الإدارة</a><AdminCouponsTab /></div></main>
        ) : window.location.pathname.replace(/\/+$/, "") === ADMIN_MALAZAM_PATH ? (
          <AdminMalazamPortal onLogout={adminLogout} />
        ) : adminPreviewDay != null ? (
          <DailyGame
            language={language ?? "ar"}
            onBack={exitAdminPreview}
            previewDay={adminPreviewDay}
          />
        ) : (
          <AdminDashboard onLogout={adminLogout} />
        )
      ) : authRole === "guest" ? (
        menuChoice === "whoIsBest" ? (
          <WhoIsBest language={language ?? "ar"} onBack={exitSpecialRoute} isAdmin={false} />
        ) : (
          <Teachers
            language={language ?? "ar"}
            onBack={exitSpecialRoute}
            isAdmin={false}
          />
        )
      ) : !authed && subject && typeof window !== "undefined" && window.location.pathname.startsWith("/flashcards") ? (
        // Guests can study flashcards without an account.
        <BrowserRouter>
          <Routes>
            <Route path="/flashcards/ahmed-al-nadawi" element={<Chapters language={language ?? "ar"} subject={subject} onChangeLanguage={resetSubject} />} />
            <Route path="/flashcards" element={<Index language={language ?? "ar"} subject={subject} />} />
            <Route path="/flashcards/:chapter" element={<Index language={language ?? "ar"} subject={subject} />} />
            <Route path="*" element={<Auth onAuthed={() => setAuthed(true)} />} />
          </Routes>
        </BrowserRouter>
      ) : !authed && isNadiaMinisterialRoute ? (
        // Guests can use Nadia's ministerial bank without an account.
        <>
          {nadiaAuthOpen && (
            <Auth
              onAuthed={() => {
                // Keep the guest on the same questions page after signing up (no language screen detour).
                if (!language) {
                  localStorage.setItem(LANGUAGE_STORAGE_KEY, "ar");
                  setLanguage("ar");
                }
                setNadiaAuthOpen(false);
                setAuthed(true);
              }}
              onGuest={() => setNadiaAuthOpen(false)}
              initialMode="signup"
            />
          )}
          {/* Stay mounted while signing up so the guest returns to the same question. */}
          <div hidden={nadiaAuthOpen}>
            <MinisterialBank
              language={language ?? "ar"}
              onBack={leaveMinisterialBank}
              initialSubject="biology"
              initialChapter={nadiaMinisterialInitialChapter}
              questionSource="nadia"
              onCreateAccount={() => {
                setNadiaAuthOpen(true);
                window.scrollTo(0, 0);
              }}
            />
          </div>
        </>
      ) : !language ? (
        <LanguageGate onSelect={selectLanguage} showWelcome={!changingLanguage} />
      ) : !authed ? (
        <Auth onAuthed={() => setAuthed(true)} onLanguageChange={setLanguage} />
      ) : ["mutamayiz", "companion", "psych", "subjectTutor"].includes(menuChoice ?? "") ? (
        <div className="h-[calc(100dvh-var(--nav-safe,7rem))]"><MutamayizChat embedded language={language} onBack={resetMenu} onOpenTool={(key) => { if (isGuideToolKey(key)) chooseMenu(key as MenuChoice); }} /></div>
      ) : isPremiumTool(menuChoice) && (subscriptionLoading || !isPremium) ? (
        <PremiumToolLock language={language} loading={subscriptionLoading} userId={userId} onBack={resetMenu} />
      ) : !menuChoice || menuChoice === "basics" ? (
        <Basics
          language={language}
          onChangeLanguage={resetLanguage}
          onSelect={handleBasicsSelect}
          onNav={chooseMenu}
          onPracticeTopic={(target) => {
            sessionStorage.setItem(TOPIC_PRACTICE_TARGET_KEY, JSON.stringify(target));
            setPracticeReturnTarget("basics");
            chooseMenu("mcqBank");
          }}
        />
      ) : menuChoice === "missions" ? (
        <Missions language={language} onBack={resetMenu} />
      ) : menuChoice === "unlocks" ? (
        <FeatureUnlocks
          language={language}
          onBack={backToBasics}
          onNav={(m) => chooseMenu(m as MenuChoice)}
          highlight={unlockHighlight}
        />
      ) : menuChoice === "mcq" ? (
        <MCQ language={language} onBack={resetMenu} />
      ) : menuChoice === "summaries" ? (
        <Summaries language={language} onBack={resetMenu} />
      ) : menuChoice === "advices" ? (
        <Advices language={language} onBack={resetMenu} />
      ) : menuChoice === "sessions" ? (
        <Sessions language={language} onBack={resetMenu} />
      ) : menuChoice === "community" ? (
        <Community language={language} onOpenSessions={() => chooseMenu("sessions")} onOpenFriends={() => chooseMenu("friends")} onOpenChat={() => chooseMenu("communityChat")} />
      ) : menuChoice === "friends" ? (
        <Friends key={userId} language={language} userId={userId} onBack={backToCommunity} />
      ) : menuChoice === "communityChat" ? (
        <CommunityChat key={userId} language={language} userId={userId} canModerate={isAdmin} onBack={backToCommunity} />
      ) : menuChoice === "account" ? (
        <AccountCenter language={language} onBack={resetMenu} onNav={chooseMenu} onChangeLanguage={resetLanguage} />
      ) : menuChoice === "essay" ? (
        <Essay language={language} onBack={resetMenu} />
      ) : menuChoice === "videoNotes" ? (
        <VideoNotes language={language} onBack={resetMenu} />
      ) : menuChoice === "podcastTutor" ? (
        <PodcastTutor language={language} onBack={resetMenu} />
      ) : menuChoice === "biologySketchpad" ? (
        <BiologySketchpad language={language} onBack={backToBasics} />
      ) : menuChoice === "biologyDrawings" ? (
        <BiologyDrawings language={language} onBack={backToBasics} />
      ) : menuChoice === "biologySchemes" ? (
        <BiologySchemes language={language} onBack={backToBasics} />
      ) : menuChoice === "physicsSchemes" ? (
        <PhysicsSchemes language={language} onBack={resetMenu} />
      ) : menuChoice === "todo" ? (
        <TodoList language={language} onBack={backToBasics} />
      ) : menuChoice === "news" ? (
        <News language={language} onBack={backToBasics} />
      ) : menuChoice === "mcqBank" ? (
        <McqBank language={language} onBack={() => {
          const returnTarget = practiceReturnTarget;
          setPracticeReturnTarget(null);
          if (returnTarget === "basics") sessionStorage.setItem(RETURN_TO_PROGRESS_KEY, "1");
          if (returnTarget) chooseMenu(returnTarget);
          else resetMenu();
        }} />
      ) : menuChoice === "mistakes" ? (
        <MyMistakes language={language} onBack={backToBasics} />
      ) : menuChoice === "ministerialBank" ? (
        <MinisterialBank
          language={language}
          onBack={leaveMinisterialBank}
          initialSubject={isNadiaMinisterialRoute ? "biology" : undefined}
          initialChapter={isNadiaMinisterialRoute ? nadiaMinisterialInitialChapter : null}
          questionSource={isNadiaMinisterialRoute ? "nadia" : "default"}
        />
      ) : menuChoice === "mindmap" ? (
        <MindMap language={language} onBack={backToBasics} />
      ) : menuChoice === "islamicSurahs" ? (
        <IslamicSurahs language={language} onBack={backToBasics} />
      ) : menuChoice === "hadithChecker" ? (
        <HadithChecker language={language} onBack={backToBasics} />
      ) : menuChoice === "poemsChecker" ? (
        <PoemsChecker language={language} onBack={backToBasics} />
      ) : menuChoice === "englishEssays" ? (
        <EnglishEssays language={language} onBack={backToBasics} />
      ) : menuChoice === "englishIsqat" ? (
        <EnglishIsqat language={language} onBack={backToBasics} />
      ) : menuChoice === "englishVerbForms" ? (
        <EnglishVerbForms language={language} onBack={resetMenu} />
      ) : menuChoice === "englishReadingPractice" ? (
        <EnglishReadingPractice language={language} onBack={resetMenu} />
      ) : menuChoice === "report" ? (
        <DailyReport language={language} onBack={resetMenu} onNav={chooseMenu} />
      ) : menuChoice === "notes" ? (
        <Notes language={language} onBack={resetMenu} />
      ) : menuChoice === "canvas" ? (
        <Canvas language={language} onBack={resetMenu} onOpenNotes={() => chooseMenu("notes")} />
      ) : menuChoice === "youtube" ? (
        <YoutubePlayer language={language} onBack={resetMenu} isAdmin={isAdmin} />
      ) : menuChoice === "organicEquations" ? (
        <OrganicEquations language={language} onBack={resetMenu} />
      ) : menuChoice === "chemicalEquations" ? (
        <ChemicalEquations language={language} onBack={resetMenu} />
      ) : menuChoice === "atomAtlas" ? (
        <AtomAtlas language={language} onBack={resetMenu} />
      ) : menuChoice === "liveBattle" ? (
        <LiveBattle language={language} onBack={resetMenu} />
      ) : menuChoice === "subjectsHub" ? (
        <SubjectsHub language={language} onBack={backToBasics} onSelect={chooseMenu} />
      ) : menuChoice === "textToVideo" ? (
        <TextToVideo language={language} onBack={resetMenu} />
      ) : menuChoice === "physicsLaws" ? (
        <PhysicsLaws language={language} onBack={resetMenu} />
      ) : menuChoice === "physicsQuickMcq" ? (
        <PhysicsQuickMcq language={language} onBack={resetMenu} />
      ) : menuChoice === "physicsProblemSolver" ? (
        <PhysicsProblemSolver language={language} onBack={resetMenu} />
      ) : menuChoice === "problemGenerator" ? (
        <ProblemGenerator language={language} onBack={resetMenu} onNav={(c) => chooseMenu(c as MenuChoice)} />
      ) : menuChoice === "frenchSynonyms" ? (
        <FrenchSynonyms language={language} onBack={resetMenu} />
      ) : menuChoice === "frenchAntonyms" ? (
        <FrenchAntonyms language={language} onBack={resetMenu} />
      ) : menuChoice === "frenchConjugator" ? (
        <FrenchConjugator language={language} onBack={resetMenu} />
      ) : menuChoice === "toolPlaceholder" ? (
        <ToolPlaceholder language={language} onBack={resetMenu} />
      ) : menuChoice === "physicsActivities" ? (
        <PhysicsActivities
          language={language}
          onBack={() => {
            if (window.location.pathname.replace(/\/+$/, "") === "/physics-activities") {
              window.history.replaceState({}, "", "/");
            }
            resetMenu();
          }}
        />
      ) : menuChoice === "chemistryExperiments" ? (
        <ChemistryExperiments language={language} onBack={resetMenu} />
      ) : menuChoice === "ourCourses" ? (
        <OurCourses language={language} onBack={resetMenu} />
      ) : menuChoice === "pdfBuilder" ? (
        <PdfBuilder language={language} onBack={resetMenu} />
      ) : menuChoice === "examGenerator" ? (
        <ExamGenerator language={language} onBack={resetMenu} />
      ) : menuChoice === "teachers" ? (
        <Teachers language={language} onBack={resetMenu} isAdmin={isAdmin} />
      ) : menuChoice === "ourTeachers" ? (
        <TeacherDirectory language={language} onBack={backToBasics} onSelect={chooseMenu} />
      ) : menuChoice === "adminNotes" ? (
        <AdminNotes language={language} onBack={backToBasics} />
      ) : menuChoice === "studyRace" ? (
        <StudyRace language={language} onBack={() => {
          if (window.location.pathname.replace(/\/+$/, "") === "/study-race") {
            window.history.replaceState({}, "", "/");
          }
          resetMenu();
        }} />
      ) : menuChoice === "dailyGame" ? (
        <DailyGame language={language} onBack={backToBasics} />
      ) : menuChoice === "whoIsBest" ? (
        <WhoIsBest language={language} onBack={resetMenu} isAdmin={isAdmin} />
      ) : menuChoice === "challenge" ? (
        <ChallengePage language={language} onBack={resetMenu} isAdmin={isAdmin} />
      ) : menuChoice === "joinTamayzak" ? (
        <JoinTamayzak language={language} onBack={resetMenu} />
      ) : menuChoice === "premium" ? (
        <Premium language={language} onBack={resetMenu} />
      ) : menuChoice === "more" ? (
        <Basics
          language={language}
          onChangeLanguage={resetLanguage}
          onSelect={handleBasicsSelect}
          onNav={chooseMenu}
          initialShowAllTools
        />
      ) : menuChoice === "leaderboard" ? (
        <Leaderboard language={language} onBack={resetMenu} onNav={chooseMenu} />
      ) : menuChoice === "malazam" ? (
        <Subjects language={language} onChangeLanguage={resetMenu} onSelectSubject={() => {}} mode="malazam" />
      ) : !subject ? (
        <Subjects language={language} onChangeLanguage={resetMenu} onSelectSubject={setSubject} />
      ) : subject === "english" && !englishCategory ? (
        <EnglishCategoryPage
          language={language}
          onBack={resetSubject}
          onSelect={(c) => {
            localStorage.setItem(ENGLISH_CATEGORY_STORAGE_KEY, c);
            setEnglishCategory(c);
          }}
        />
      ) : subject === "english" && englishCategory === "verbs" ? (
        <EnglishVerbForms
          language={language}
          onBack={() => {
            localStorage.removeItem(ENGLISH_CATEGORY_STORAGE_KEY);
            setEnglishCategory(null);
          }}
        />
      ) : subject === "english" && englishCategory === "readingPractice" ? (
        <EnglishReadingPractice
          language={language}
          onBack={() => {
            localStorage.removeItem(ENGLISH_CATEGORY_STORAGE_KEY);
            setEnglishCategory(null);
          }}
        />
      ) : (
      <BrowserRouter>
        <Routes>
          <Route path="/flashcards/ahmed-al-nadawi" element={<Chapters language={language} subject={subject} onChangeLanguage={resetSubject} />} />
          <Route path="/" element={<Chapters language={language} subject={subject} onChangeLanguage={resetSubject} />} />
          <Route path="/flashcards" element={<Index language={language} subject={subject} />} />
          <Route path="/flashcards/:chapter" element={<Index language={language} subject={subject} />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      )}
      </PageTransition>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
