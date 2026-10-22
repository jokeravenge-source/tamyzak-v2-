import { TRIP_ORIGIN } from "./config";
import { getCountry, flagEmoji } from "./countries";
import { formatClock, formatDuration, formatKm } from "./geo";
import type { Dict, Lang } from "./i18n";
import { journeyState, type Journey } from "./journeys";

function Field({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-extrabold tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display font-bold leading-tight break-words ${big ? "text-2xl" : "text-base"}`}>{value}</div>
    </div>
  );
}

export function BoardingPass({ journey, now, t, lang }: { journey: Journey; now: number; t: Dict; lang: Lang }) {
  const s = journeyState(journey, now);
  const country = getCountry(journey.destCountryCode);
  const countryName = lang === "ar" && country ? country.nameAr : journey.destCountryName;
  const pct = Math.round(s.progress * 1000) / 10;
  const fmt = (ms: number) =>
    new Date(ms).toLocaleString(lang === "ar" ? "ar-IQ" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
  const destCode = country?.alpha3 ?? journey.destCountryCode;

  return (
    <article
      aria-label={t.journey}
      className="trip-rise trip-shadow relative flex w-full flex-col overflow-hidden rounded-3xl border-[3px] bg-trip-cream text-trip-ink sm:flex-row"
    >
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-trip-sky-deep px-3 py-0.5 font-display text-sm font-bold text-primary-foreground">✈ TRIP</span>
          <span className="text-xs font-extrabold tracking-wider">{t.journey}</span>
        </div>

        <div className="mt-4 flex items-center gap-3" dir="ltr">
          <div className="text-start">
            <div className="font-display text-4xl font-bold">BGW</div>
            <div className="text-xs font-bold">{TRIP_ORIGIN.city.toUpperCase()}, {TRIP_ORIGIN.country.toUpperCase()}</div>
          </div>
          <div className="relative mx-1 h-8 flex-1" aria-hidden>
            <div className="absolute inset-x-0 top-1/2 border-t-[3px] border-dotted border-trip-sky-deep" />
            <div className="absolute inset-y-0 left-0 top-1/2 h-[3px] -translate-y-1/2 bg-trip-sun" style={{ width: `${pct}%` }} />
            <svg viewBox="-16 -10 32 20" className={`absolute top-1/2 h-6 w-9 -translate-x-1/2 -translate-y-1/2 ${s.arrived ? "" : "trip-bob"}`} style={{ left: `${pct}%` }}>
              <path d="M-12 0c0-1.6 2-2.4 4-2.4h13c3 0 5 1.2 5 2.4s-2 2.4-5 2.4H-8c-2 0-4-.8-4-2.4z" className="fill-trip-plane stroke-trip-ink" strokeWidth="1.4" />
              <path d="M-4-2-7-8h3l6 6zM-4 2-7 8h3l6-6z" className="fill-trip-sun stroke-trip-ink" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="text-end">
            <div className="font-display text-4xl font-bold">{destCode}</div>
            <div className="text-xs font-bold">{flagEmoji(journey.destCountryCode)} {journey.destCity.toUpperCase()}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label={t.from} value={`${lang === "ar" ? TRIP_ORIGIN.cityAr : TRIP_ORIGIN.city}, ${lang === "ar" ? TRIP_ORIGIN.countryAr : TRIP_ORIGIN.country}`} />
          <Field label={t.to} value={`${journey.destCity}, ${countryName}`} />
          <Field label={t.distance} value={`${formatKm(journey.distanceKm)} km`} />
          <Field label={t.speed} value={`${formatKm(journey.speedKmh)} km/h`} />
          <Field label={t.departure} value={fmt(journey.startedAt)} />
          <Field label={t.arrival} value={fmt(journey.arrivalAt)} />
        </div>

        <div className="mt-4">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            aria-label={t.timeLeft}
            className="h-4 overflow-hidden rounded-full border-2 bg-trip-cloud"
          >
            <div className="h-full rounded-full bg-trip-sun transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-end text-xs font-bold" dir="ltr">{pct.toFixed(1)}%</div>
        </div>
      </div>

      <div aria-hidden className="trip-perforation h-4 w-full shrink-0 sm:h-auto sm:w-4" />

      <div className="flex flex-col justify-between gap-3 bg-trip-sun/40 p-5 sm:w-56">
        <Field label={t.timeLeft} value={formatClock(s.remainingSec)} big />
        <Field label={t.total} value={formatDuration(journey.durationSec, lang)} />
        <div>
          <div className="text-[11px] font-extrabold tracking-wider text-muted-foreground">{t.status}</div>
          <div className={`mt-1 inline-block rounded-full border-2 px-3 py-0.5 font-display font-bold ${s.arrived ? "bg-trip-land" : "bg-trip-sky-deep text-primary-foreground"}`}>
            {s.arrived ? t.arrived : s.paused ? t.onBreak : t.inFlight}
          </div>
        </div>
        <p className="rounded-xl border-2 border-dashed bg-trip-cream p-2 text-center text-sm font-bold">{t.reminder}</p>
        <span className="sr-only" aria-live="polite">{s.arrived ? t.arrived : ""}</span>
      </div>
    </article>
  );
}
