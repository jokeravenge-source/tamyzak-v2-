import { useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Bot, Ellipsis, GraduationCap, Home, UserRound, UsersRound, Zap } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { AppLanguage } from "@/components/LanguageGate";
import { useNavVisibility } from "@/hooks/useNavVisibility";
import type { MainMenuChoice } from "@/pages/MainMenu";

type NavItem = {
  key: MainMenuChoice;
  labelAr: string;
  labelEn: string;
  Icon: ComponentType<{ className?: string }>;
};

type OverflowItem =
  | NavItem
  | {
      key: "tesla";
      labelAr: string;
      labelEn: string;
      Icon: ComponentType<{ className?: string }>;
      href: string;
    };

const TESLA_INSTAGRAM_URL = "https://www.instagram.com/tesl_astore/?utm_source=ig_web_button_share_sheet";

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { key: "basics", labelAr: "الرئيسية", labelEn: "Home", Icon: Home },
  { key: "subjectsHub", labelAr: "المواد", labelEn: "Subjects", Icon: BookOpen },
  { key: "more", labelAr: "الدراسة", labelEn: "Study", Icon: GraduationCap },
];

const OVERFLOW_ITEMS: OverflowItem[] = [
  { key: "sessions", labelAr: "الجلسات", labelEn: "Sessions", Icon: UsersRound },
  { key: "account", labelAr: "حسابي", labelEn: "Account", Icon: UserRound },
  {
    key: "tesla",
    labelAr: "تيسلا",
    labelEn: "Tesla",
    Icon: Zap,
    href: TESLA_INSTAGRAM_URL,
  },
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
  const [moreOpen, setMoreOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const navVisible = useNavVisibility();
  const isRtl = language === "ar";
  const overflowIsActive = active === "sessions" || active === "account";

  useEffect(() => {
    setPortalRoot(document.body);
    document.documentElement.classList.add("has-study-nav");
    return () => document.documentElement.classList.remove("has-study-nav");
  }, []);

  useEffect(() => {
    if (!moreOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };

    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreOpen]);

  const isItemActive = (key: NavItem["key"]) => {
    if (key === "basics") return active === null || active === "basics";
    if (key === "more") {
      return active === "more" || Boolean(active && !["basics", "subjectsHub", "sessions", "account"].includes(active));
    }
    return active === key;
  };

  const selectItem = (key: MainMenuChoice) => {
    setMoreOpen(false);
    onSelect(key);
  };

  const navigation = (
    <div
      className="pointer-events-none fixed inset-x-0 z-[35] flex justify-center px-3 transition-transform duration-300 ease-out"
      style={{
        bottom: 0,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
        transform: navVisible ? "translate3d(0,0,0)" : "translate3d(0,150%,0)",
        WebkitTransform: navVisible ? "translate3d(0,0,0)" : "translate3d(0,150%,0)",
        willChange: "transform",
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div ref={shellRef} className="pointer-events-auto relative w-full max-w-[34rem]">
        <AnimatePresence>
          {moreOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 430, damping: 34 }}
              className="absolute inset-x-0 bottom-[calc(100%+0.7rem)] overflow-hidden rounded-[1.35rem] border border-border/80 bg-card/95 p-2 shadow-[0_20px_60px_-24px_hsl(var(--foreground)/0.38)] backdrop-blur-xl"
              role="menu"
              aria-label={isRtl ? "روابط إضافية" : "More destinations"}
            >
              <div className="grid grid-cols-3 gap-1.5">
                {OVERFLOW_ITEMS.map((item) => {
                  const label = isRtl ? item.labelAr : item.labelEn;
                  const selected = item.key !== "tesla" && active === item.key;
                  const content = (
                    <>
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-xl ${
                          selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <item.Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="mt-2 text-xs font-bold text-foreground">{label}</span>
                    </>
                  );

                  if (item.key === "tesla") {
                    return (
                      <motion.a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setMoreOpen(false)}
                        role="menuitem"
                        aria-label={`${label} · Instagram`}
                        className="flex min-h-[5.4rem] flex-col items-center justify-center rounded-2xl px-2 text-center transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {content}
                      </motion.a>
                    );
                  }

                  return (
                    <motion.button
                      key={item.key}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => selectItem(item.key)}
                      role="menuitem"
                      aria-current={selected ? "page" : undefined}
                      className="flex min-h-[5.4rem] flex-col items-center justify-center rounded-2xl px-2 text-center transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {content}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav
          className="relative rounded-[1.55rem] border border-border/80 bg-card/95 px-2 pb-1.5 pt-2 shadow-[0_18px_55px_-24px_hsl(var(--foreground)/0.34)] backdrop-blur-xl"
          aria-label={isRtl ? "التنقل الرئيسي" : "Primary navigation"}
        >
          <LayoutGroup id="primary-bottom-navigation">
            <div className="grid grid-cols-5 items-end gap-1">
              {PRIMARY_NAV_ITEMS.slice(0, 2).map(({ key, labelAr, labelEn, Icon }) => {
                const selected = isItemActive(key);
                const label = isRtl ? labelAr : labelEn;
                return (
                  <NavButton
                    key={key}
                    label={label}
                    selected={selected}
                    Icon={Icon}
                    onClick={() => selectItem(key)}
                  />
                );
              })}

              <motion.button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onGuide();
                }}
                whileTap={{ scale: 0.93 }}
                aria-label={isRtl ? "افتح المرشد" : "Open guide"}
                className="group relative -mt-7 flex min-h-[4.25rem] flex-col items-center justify-end gap-1 rounded-2xl pb-1 text-[10px] font-extrabold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="absolute top-0 grid h-12 w-12 place-items-center rounded-[1.1rem] border-4 border-card bg-primary text-primary-foreground shadow-[0_12px_30px_-12px_hsl(var(--primary)/0.9)] transition-transform duration-200 group-hover:-translate-y-0.5">
                  <Bot className="h-[21px] w-[21px]" aria-hidden="true" />
                </span>
                <span>{isRtl ? "المرشد" : "Guide"}</span>
              </motion.button>

              {PRIMARY_NAV_ITEMS.slice(2).map(({ key, labelAr, labelEn, Icon }) => {
                const selected = isItemActive(key);
                const label = isRtl ? labelAr : labelEn;
                return (
                  <NavButton
                    key={key}
                    label={label}
                    selected={selected}
                    Icon={Icon}
                    onClick={() => selectItem(key)}
                  />
                );
              })}

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                aria-label={isRtl ? "المزيد" : "More"}
                className={`relative flex min-h-[3.55rem] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-[11px] ${
                  moreOpen || overflowIsActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <Ellipsis className="h-[19px] w-[19px]" aria-hidden="true" />
                <span>{isRtl ? "المزيد" : "More"}</span>
                {overflowIsActive && !moreOpen && (
                  <span className="absolute top-1.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                )}
              </motion.button>
            </div>
          </LayoutGroup>
        </nav>
      </div>
    </div>
  );

  return portalRoot ? createPortal(navigation, portalRoot) : null;
};

const NavButton = ({
  label,
  selected,
  Icon,
  onClick,
}: {
  label: string;
  selected: boolean;
  Icon: ComponentType<{ className?: string }>;
  onClick: () => void;
}) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.94 }}
    onClick={onClick}
    aria-current={selected ? "page" : undefined}
    aria-label={label}
    className={`relative flex min-h-[3.55rem] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-[11px] ${
      selected ? "text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
    }`}
  >
    {selected && (
      <motion.span
        layoutId="primary-bottom-navigation-active"
        className="absolute inset-0 rounded-2xl bg-primary/10"
        transition={{ type: "spring", stiffness: 430, damping: 35 }}
      />
    )}
    <Icon className="relative z-10 h-[19px] w-[19px]" aria-hidden="true" />
    <span className="relative z-10 max-w-full truncate">{label}</span>
  </motion.button>
);

export default BottomGroupNav;
