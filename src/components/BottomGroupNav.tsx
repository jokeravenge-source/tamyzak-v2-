import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { Bot, Home, LayoutGrid, UserRound, UsersRound } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import type { AppLanguage } from "@/components/LanguageGate";
import { useNavVisibility } from "@/hooks/useNavVisibility";
import type { MainMenuChoice } from "@/pages/MainMenu";

type PrimaryNavItem = {
  key: MainMenuChoice | "guide";
  labelAr: string;
  labelEn: string;
  Icon: ComponentType<{ className?: string }>;
};

// Keep the persistent navigation intentionally small. Everything beyond these
// five destinations lives in "All tools", so students always know where to go.
const PRIMARY_NAV_ITEMS: PrimaryNavItem[] = [
  { key: "basics", labelAr: "الرئيسية", labelEn: "Home", Icon: Home },
  { key: "guide", labelAr: "المرشد", labelEn: "Guide", Icon: Bot },
  { key: "sessions", labelAr: "الجلسات", labelEn: "Sessions", Icon: UsersRound },
  { key: "more", labelAr: "كل الأدوات", labelEn: "All tools", Icon: LayoutGrid },
  { key: "account", labelAr: "حسابي", labelEn: "Account", Icon: UserRound },
];

const BottomGroupNav = ({
  language,
  active,
  onSelect,
  onGuide,
}: {
  language: AppLanguage;
  active: MainMenuChoice | null;
  onSelect: (key: MainMenuChoice) => void;
  onGuide: () => void;
}) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const navVisible = useNavVisibility();
  const isRtl = language === "ar";

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  const isItemActive = (key: PrimaryNavItem["key"]) => {
    if (key === "guide") return false;
    if (key === "basics") return active === null || active === "basics";
    if (key === "more") {
      return Boolean(active && !["basics", "subjectsHub", "sessions", "account"].includes(active));
    }
    return active === key;
  };

  const selectItem = (key: PrimaryNavItem["key"]) => {
    if (key === "guide") {
      onGuide();
      return;
    }
    onSelect(key);
  };

  const navigation = (
    <div
      className="pointer-events-none fixed inset-x-0 z-[35] flex justify-center px-3 transition-transform duration-300 ease-out"
      style={{
        bottom: 0,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
        transform: navVisible ? "translate3d(0,0,0)" : "translate3d(0,140%,0)",
        WebkitTransform: navVisible ? "translate3d(0,0,0)" : "translate3d(0,140%,0)",
        willChange: "transform",
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <motion.nav
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto w-full max-w-xl rounded-2xl border border-border/80 bg-background/90 p-1.5 shadow-[0_18px_50px_-12px_hsl(var(--primary)/0.25)] backdrop-blur-xl"
        aria-label={isRtl ? "التنقل الرئيسي" : "Primary navigation"}
      >
        <LayoutGroup id="primary-bottom-navigation">
          <div className="grid grid-cols-5 gap-1">
            {PRIMARY_NAV_ITEMS.map(({ key, labelAr, labelEn, Icon }) => {
              const selected = isItemActive(key);
              return (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => selectItem(key)}
                  aria-current={selected ? "page" : undefined}
                  aria-label={isRtl ? labelAr : labelEn}
                  className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold transition-colors ${
                    selected
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="primary-bottom-navigation-active"
                      className="absolute inset-0 rounded-xl bg-primary shadow-[0_8px_22px_hsl(var(--primary)/0.3)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className="relative z-10 h-[18px] w-[18px]" />
                  <span className="relative z-10 max-w-full truncate">
                    {isRtl ? labelAr : labelEn}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </LayoutGroup>
      </motion.nav>
    </div>
  );

  return portalRoot ? createPortal(navigation, portalRoot) : null;
};

export default BottomGroupNav;
