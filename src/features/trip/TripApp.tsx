import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plane } from "lucide-react";
import { BoardingPass } from "./BoardingPass";
import { TRIP_INTRO_MS, TRIP_ORIGIN, TRIP_VIRTUAL_SPEED_KMH } from "./config";
import { COUNTRIES, getCountry, searchCountries, type Country } from "./countries";
import { formatDuration, formatKm } from "./geo";
import { Globe } from "./Globe";
import { DICTS, type Lang } from "./i18n";
import { createLocalRepository, journeyState, planTrip, type Journey, type JourneyRepository } from "./journeys";

type Phase = "home" | "select" | "preview" | "launching" | "ticket" | "arrived";

export interface TripAppProps {
  /** The authenticated student's id from the host app. */
  studentId?: string;
  /** Swap in a backend-backed repository for cross-device persistence. */
  repository?: JourneyRepository;
  /** Where "BACK TO STUDYING" goes. */
  onBackToStudying?: () => void;
  /** Return to the Sessions entry chooser. */
  onExit?: () => void;
  /** Follow the host application\'s active language. */
  language?: Lang;
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    const onVis = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [active]);
  return now;
}

const btn = "trip-shadow inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-[3px] px-6 font-display text-lg font-bold transition active:translate-y-[3px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:opacity-60";
const btnPrimary = `${btn} bg-trip-sun text-trip-ink hover:brightness-105`;
const btnSecondary = `${btn} bg-trip-cloud text-trip-ink`;

export function TripApp({ studentId = "local-student", repository, onBackToStudying, onExit, language }: TripAppProps) {
  const [lang, setLang] = useState<Lang>(language ?? "en");
  const t = DICTS[lang];
  const repoRef = useRef<JourneyRepository | null>(repository ?? null);
  const [journeys, setJourneys] = useState<Journey[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [phase, setPhase] = useState<Phase>("home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(false);
  const creatingRef = useRef(false);
  const now = useNow(phase === "ticket" || phase === "home");

  const repo = () => (repoRef.current ??= createLocalRepository());

  const reload = useCallback(async () => {
    const list = await repo().list(studentId);
    setJourneys(list);
    return list;
  }, [studentId]);

  // Initial load: resume an in-flight journey or show a pending arrival once.
  useEffect(() => {
    if (!language) {
      try {
        const saved = localStorage.getItem("tamayzak.trip.lang");
        if (saved === "ar" || saved === "en") setLang(saved);
      } catch { /* ignore */ }
    }
    reload()
      .then((list) => {
        const unseen = list.find((j) => j.status === "arrived" && !j.arrivalSeenAt);
        const active = list.find((j) => j.status === "in_flight");
        if (unseen) { setViewingId(unseen.id); setPhase("arrived"); }
        else if (active) { setViewingId(active.id); setPhase("ticket"); }
      })
      .catch(() => setLoadError(true));
  }, [reload, language]);

  useEffect(() => {
    if (language) setLang(language);
  }, [language]);

  const viewing = journeys?.find((j) => j.id === viewingId) ?? null;
  const activeJourney = journeys?.find((j) => j.status === "in_flight" && (j.pausedAt != null || now < j.arrivalAt)) ?? null;

  // Arrival: the moment timestamps say so, resolve once.
  useEffect(() => {
    if (phase !== "ticket" || !viewing || viewing.arrivalSeenAt) return;
    if (journeyState(viewing, now).arrived) {
      setPhase("arrived");
    }
  }, [phase, viewing, now]);

  useEffect(() => {
    if (phase === "arrived" && viewing && !viewing.arrivalSeenAt) {
      repo().markArrivalSeen(studentId, viewing.id).then(reload);
    }
  }, [phase, viewing, reload, studentId]);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
    try { localStorage.setItem("tamayzak.trip.lang", lang); } catch { /* ignore */ }
  }, [lang]);

  const results = useMemo(() => searchCountries(query), [query]);
  const plan = selected ? planTrip(selected) : null;
  const selCountry = selected ? getCountry(selected) : undefined;
  const cname = (c: Country) => (lang === "ar" ? c.nameAr : c.name);

  async function getTicket() {
    if (creatingRef.current || !plan?.ok) return;
    creatingRef.current = true;
    setCreating(true);
    setCreateError(false);
    try {
      const { journey } = await repo().create(studentId, plan.country.alpha2);
      await reload();
      setViewingId(journey.id);
      setPhase("launching");
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      setTimeout(() => setPhase("ticket"), reduce ? 600 : TRIP_INTRO_MS);
    } catch {
      setCreateError(true);
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  }

  const openJourney = (j: Journey) => { setViewingId(j.id); setPhase("ticket"); };
  const goHome = () => { setPhase("home"); setSelected(null); setQuery(""); };

  const header = (
    <header className="flex items-center justify-between gap-3">
      {phase !== "home" && phase !== "launching" ? (
        <button onClick={goHome} className="rounded-xl border-2 bg-trip-cloud px-3 py-1.5 font-bold trip-shadow-sm focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none">
          <ArrowLeft aria-hidden className={`inline h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} /> {t.back}
        </button>
      ) : onExit ? (
        <button onClick={onExit} className="inline-flex items-center gap-2 rounded-xl border-2 bg-trip-cloud px-3 py-1.5 font-bold trip-shadow-sm focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none">
          <ArrowLeft aria-hidden className={`h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} /> {t.back}
        </button>
      ) : (
        <span className="inline-flex items-center gap-2 font-display text-xl font-bold"><Plane aria-hidden className="h-5 w-5" /> TRIP</span>
      )}
      <div role="group" aria-label="Language" className="flex overflow-hidden rounded-xl border-2 bg-trip-cloud font-bold">
        {(["en", "ar"] as const).map((l) => (
          <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}
            className={`px-3 py-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring ${lang === l ? "bg-trip-sun" : ""}`}>
            {l === "en" ? "EN" : "عربي"}
          </button>
        ))}
      </div>
    </header>
  );

  let body: React.ReactNode;

  if (journeys === null && !loadError) {
    body = <p className="py-20 text-center font-bold" role="status">{t.loading}</p>;
  } else if (loadError) {
    body = <p className="py-20 text-center font-bold" role="alert">{t.error}</p>;
  } else if (phase === "launching" && viewing) {
    body = (
      <div className="flex flex-col items-center py-6" role="status" aria-live="polite">
        <div className="aspect-square w-full max-w-sm"><Globe mode="orbit" destination={{ lat: viewing.destLat, lng: viewing.destLng }} label={t.boarding} /></div>
        <p className="mt-4 font-display text-3xl font-bold">{t.boarding}</p>
        <button onClick={() => setPhase("ticket")} className="mt-4 text-sm font-bold underline">{t.skip}</button>
      </div>
    );
  } else if (phase === "ticket" && viewing) {
    const s = journeyState(viewing, now);
    body = (
      <div className="flex flex-col gap-4">
        <div className="mx-auto aspect-square w-full max-w-[18rem]">
          <Globe mode={s.arrived ? "landed" : "flight"} progress={s.progress}
            destination={{ lat: viewing.destLat, lng: viewing.destLng }}
            label={`${TRIP_ORIGIN.city} → ${viewing.destCity}`} />
        </div>
        <BoardingPass journey={viewing} now={now} t={t} lang={lang} />
        {!s.arrived && (
          s.paused ? (
            <div className="trip-shadow rounded-2xl border-[3px] bg-trip-sun/40 p-4 text-center" role="status">
              <p className="font-display text-xl font-bold">☕ {t.atStation}</p>
              <p className="text-sm font-semibold">{t.atStationMsg}</p>
              <button className={`${btnPrimary} mt-3 w-full`} onClick={() => repo().resume(studentId, viewing.id).then(reload)}>{t.continueTrip}</button>
            </div>
          ) : (
            <button className={btnSecondary} onClick={() => repo().pause(studentId, viewing.id).then(reload)}>☕ {t.takeBreak}</button>
          )
        )}
        <p className="text-center text-xs font-semibold text-muted-foreground">{t.distanceNote}</p>
      </div>
    );
  } else if (phase === "arrived" && viewing) {
    const c = getCountry(viewing.destCountryCode);
    body = (
      <div className="relative flex flex-col items-center text-center">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} className={`trip-confetti absolute block h-3 w-2 rounded-sm ${["bg-trip-sun", "bg-trip-coral", "bg-trip-land", "bg-trip-sky-deep"][i % 4]}`}
              style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.15}s` }} />
          ))}
        </div>
        <div className="mx-auto aspect-square w-full max-w-[16rem]">
          <Globe mode="landed" destination={{ lat: viewing.destLat, lng: viewing.destLng }} label={t.arrived} />
        </div>
        <h2 className="trip-rise font-display text-4xl font-bold">{t.arrivedTitle}</h2>
        <p className="mt-2 font-display text-2xl font-bold">{t.welcome} {c ? `${c.flag} ${cname(c)}` : viewing.destCountryName}!</p>
        <p className="font-bold">{viewing.destCity}</p>
        <p className="mt-2">{t.arrivedMsg}</p>
        <dl className="trip-shadow mt-4 grid w-full max-w-sm grid-cols-2 gap-2 rounded-2xl border-[3px] bg-trip-cream p-4 text-start">
          <div><dt className="text-xs font-extrabold text-muted-foreground">{t.distance}</dt><dd className="font-display text-lg font-bold">{formatKm(viewing.distanceKm)} km</dd></div>
          <div><dt className="text-xs font-extrabold text-muted-foreground">{t.total}</dt><dd className="font-display text-lg font-bold">{formatDuration(viewing.durationSec, lang)}</dd></div>
        </dl>
        <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
          <button className={btnPrimary} onClick={() => { setSelected(null); setQuery(""); setPhase("select"); }}>{t.another}</button>
          <button className={btnSecondary} onClick={() => (onBackToStudying ? onBackToStudying() : goHome())}>{t.backStudy}</button>
        </div>
      </div>
    );
  } else if (phase === "preview" && selCountry) {
    body = (
      <div className="flex flex-col gap-4">
        <div className="mx-auto aspect-square w-full max-w-[17rem]">
          <Globe mode="flight" progress={0} destination={selCountry} label={`${TRIP_ORIGIN.city} → ${selCountry.capital}`} />
        </div>
        <section className="trip-shadow trip-rise rounded-3xl border-[3px] bg-trip-cream p-5">
          <div className="flex items-center gap-3">
            <span className="text-5xl" aria-hidden>{selCountry.flag}</span>
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">{cname(selCountry)}</h2>
              <p className="font-bold text-muted-foreground">{selCountry.capital}</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div><dt className="text-xs font-extrabold text-muted-foreground">{t.from}</dt><dd className="font-bold">{lang === "ar" ? `${TRIP_ORIGIN.cityAr}، ${TRIP_ORIGIN.countryAr}` : "Baghdad, Iraq"} (BGW)</dd></div>
            <div><dt className="text-xs font-extrabold text-muted-foreground">{t.to}</dt><dd className="font-bold">{selCountry.capital}, {cname(selCountry)}</dd></div>
            {plan?.ok && <>
              <div><dt className="text-xs font-extrabold text-muted-foreground">{t.distance}</dt><dd className="font-display text-xl font-bold">{formatKm(plan.distanceKm)} km</dd></div>
              <div><dt className="text-xs font-extrabold text-muted-foreground">{t.speed}</dt><dd className="font-display text-xl font-bold">{formatKm(TRIP_VIRTUAL_SPEED_KMH)} km/h</dd></div>
              <div className="col-span-2"><dt className="text-xs font-extrabold text-muted-foreground">{t.duration}</dt><dd className="font-display text-xl font-bold">{formatDuration(plan.durationSec, lang)}</dd></div>
            </>}
          </dl>
          <p className="mt-3 text-xs font-semibold text-muted-foreground">{t.distanceNote} {t.speedNote}</p>
          <p className="mt-2 font-bold">🎟️ {t.free0}</p>
          {plan && !plan.ok && <p role="alert" className="mt-3 rounded-xl bg-trip-coral/30 p-2 font-bold">{plan.error === "same_place" ? t.sameplace : t.error}</p>}
          {createError && <p role="alert" className="mt-3 rounded-xl bg-trip-coral/30 p-2 font-bold">{t.error}</p>}
          {activeJourney && <p className="mt-3 rounded-xl bg-trip-sun/40 p-2 text-sm font-bold">{t.activeTrip} — {activeJourney.destCity}</p>}
          <button className={`${btnPrimary} mt-4 w-full`} disabled={!plan?.ok || creating} aria-busy={creating}
            onClick={activeJourney ? () => openJourney(activeJourney) : getTicket}>
            {activeJourney ? t.resume : creating ? t.creating : t.getTicket}
          </button>
          <button className="mt-3 w-full text-sm font-bold underline" onClick={() => setPhase("select")}>{t.change}</button>
        </section>
      </div>
    );
  } else if (phase === "select") {
    body = (
      <section className="flex flex-col gap-3" aria-labelledby="trip-dest">
        <h2 id="trip-dest" className="font-display text-3xl font-bold">{t.destinations}</h2>
        <label className="sr-only" htmlFor="trip-search">{t.searchLabel}</label>
        <input id="trip-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} autoComplete="off"
          className="trip-shadow-sm min-h-12 rounded-2xl border-[3px] bg-trip-cloud px-4 text-lg font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
        <p className="text-sm font-bold" aria-live="polite">{results.length} / {COUNTRIES.length}</p>
        {results.length === 0 ? (
          <div className="rounded-2xl border-[3px] border-dashed bg-trip-cream p-6 text-center">
            <p className="font-display text-xl font-bold">🧭 {t.noResults} “{query}”</p>
            <p className="mt-1 text-sm">{t.tryAgain}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={t.destinations}>
            {results.map((c) => (
              <li key={c.alpha2}>
                <button onClick={() => { setSelected(c.alpha2); setPhase("preview"); }}
                  className="trip-shadow-sm flex h-full w-full flex-col items-start gap-1 rounded-2xl border-[3px] bg-trip-cream p-3 text-start transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
                  <span className="text-3xl" aria-hidden>{c.flag}</span>
                  <span className="font-display text-base font-bold leading-tight">{cname(c)}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{c.capital}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  } else {
    body = (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col items-center text-center">
          <div className="aspect-square w-full max-w-[20rem]"><Globe mode="idle" label="TRIP globe" /></div>
          <h1 className="font-display text-6xl font-bold tracking-tight">TRIP</h1>
          <p className="mt-2 max-w-xs text-lg font-semibold">{t.subtitle}</p>
          <span className="mt-3 rounded-full border-2 bg-trip-cream px-3 py-1 text-sm font-extrabold">🎟️ {t.free}</span>
          {activeJourney ? (
            <button className={`${btnPrimary} mt-5 w-full max-w-xs`} onClick={() => openJourney(activeJourney)}>
              {t.resume}: {activeJourney.destCity}
            </button>
          ) : (
            <button className={`${btnPrimary} mt-5 w-full max-w-xs`} onClick={() => setPhase("select")}>{t.start}</button>
          )}
          <div className="mt-4 w-full max-w-xs">
            <label className="sr-only" htmlFor="trip-home-search">{t.searchLabel}</label>
            <input id="trip-home-search" type="search" placeholder={t.search} value={query}
              onChange={(e) => { setQuery(e.target.value); setPhase("select"); }}
              className="trip-shadow-sm min-h-12 w-full rounded-2xl border-[3px] bg-trip-cloud px-4 font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
          </div>
        </section>

        <section aria-labelledby="trip-history">
          <h2 id="trip-history" className="font-display text-2xl font-bold">{t.history}</h2>
          {journeys && journeys.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {journeys.map((j) => {
                const c = getCountry(j.destCountryCode);
                const arrived = journeyState(j, now).arrived;
                return (
                  <li key={j.id}>
                    <button onClick={() => openJourney(j)}
                      className="trip-shadow-sm flex w-full items-center gap-3 rounded-2xl border-[3px] bg-trip-cream p-3 text-start focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
                      <span className="text-3xl" aria-hidden>{c?.flag}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display font-bold">{j.destCity}, {c ? cname(c) : j.destCountryName}</span>
                        <span className="block text-xs font-semibold text-muted-foreground">
                          {formatKm(j.distanceKm)} km · {formatDuration(j.durationSec, lang)} · {t.started} {new Date(j.startedAt).toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-GB")}
                        </span>
                      </span>
                      <span className={`shrink-0 rounded-full border-2 px-2 py-0.5 text-xs font-extrabold ${arrived ? "bg-trip-land" : "bg-trip-sky-deep text-primary-foreground"}`}>
                        {arrived ? t.arrived : j.pausedAt != null ? t.onBreak : t.inFlight}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 font-semibold">{t.noHistory}</p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="trip-world min-h-screen bg-trip-sky text-trip-ink">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-12 pt-4">
        {header}
        {body}
      </main>
    </div>
  );
}
