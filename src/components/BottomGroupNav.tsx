import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { BookOpen, GraduationCap, Home, UserRound, UsersRound, Zap } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import type { AppLanguage } from "@/components/LanguageGate";
import { useNavVisibility } from "@/hooks/useNavVisibility";
import type { MainMenuChoice } from "@/pages/MainMenu";

type PrimaryNavItem = {
  key: MainMenuChoice | "tesla";
  labelAr: string;
  labelEn: string;
  Icon: ComponentType<{ className?: string }>;
  href?: string;
};

const TESLA_INSTAGRAM_URL = "https://www.instagram.com/tesl_astore/?utm_source=ig_web_button_share_sheet";

// Keep the persistent study destinations small. Tesla is a clearly labeled
// external destination so it does not compete with the active app section.
const PRIMARY_NAV_ITEMS: PrimaryNavItem[] = [
  { key: "basics", labelAr: "الرئيسية", labelEn: "Home", Icon: Home },
  { key: "subjectsHub", labelAr: "المواد", labelEn: "Subjects", Icon: BookOpen },
  { key: "more", labelAr: "الدراسة", labelEn: "Study", Icon: GraduationCap },
  { key: "sessions", labelAr: "الجلسات", labelEn: "Sessions", Icon: UsersRound },
  { key: "account", labelAr: "حسابي", labelEn: "Account", Icon: UserRound },
  { key: "tesla", labelAr: "تيسلا", labelEn: "Tesla", Icon: Zap, href: TESLA_INSTAGRAM_URL },
];

const BottomGroupNav = ({
  language,
  active,
  onSelect,
  onGuide: _onGuide,
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
    document.documentElement.classList.add("has-study-nav");
    return () => document.documentElement.classList.remove("has-study-nav");
  }, []);

  const isItemActive = (key: PrimaryNavItem["key"]) => {
    if (key === "tesla") return false;
    if (key === "basics") return active === null || active === "basics";
    if (key === "more") {
      return active === "more" || Boolean(active && !["basics", "subjectsHub", "sessions", "account"].includes(active));
    }
    return active === key;
  };

  const selectItem = (key: PrimaryNavItem["key"]) => {
    if (key === "tesla") return;
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
        className="pointer-events-auto w-full max-w-2xl rounded-[1.35rem] border border-border/90 bg-card p-1.5 shadow-[0_18px_55px_-24px_hsl(var(--foreground)/0.32)]"
        aria-label={isRtl ? "التنقل الرئيسي" : "Primary navigation"}
      >
        <LayoutGroup id="primary-bottom-navigation">
          <div className="grid grid-cols-[repeat(5,minmax(0,1fr))_46px] gap-1">
            {PRIMARY_NAV_ITEMS.map(({ key, labelAr, labelEn, Icon, href }) => {
              const selected = isItemActive(key);
              const label = isRtl ? labelAr : labelEn;
              const itemClassName = `relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-[11px] ${
                selected
                  ? "text-primary-foreground"
                  : key === "tesla"
                    ? "border-s border-border text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`;
              const itemContent = (
                <>
                  {selected && (
                    <motion.span
                      layoutId="primary-bottom-navigation-active"
                      className="absolute inset-0 rounded-2xl bg-primary shadow-[0_8px_20px_-12px_hsl(var(--primary))]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className="relative z-10 h-[18px] w-[18px]" />
                  <span className={`relative z-10 max-w-full truncate ${key === "tesla" ? "sr-only" : ""}`}>{label}</span>
                </>
              );

              if (href) {
                return (
                  <motion.a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.94 }}
                    aria-label={`${label} · Instagram`}
                    className={itemClassName}
                  >
                    {itemContent}
                  </motion.a>
                );
              }

              return (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => selectItem(key)}
                  aria-current={selected ? "page" : undefined}
                  aria-label={label}
                  className={itemClassName}
                >
                  {itemContent}
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
