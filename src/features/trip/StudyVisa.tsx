import { BookOpenCheck, CalendarDays, MapPin, Plane } from "lucide-react";
import { TRIP_ORIGIN } from "./config";
import { flagEmoji, getCountry } from "./countries";
import { formatDuration, formatKm } from "./geo";
import type { Dict, Lang } from "./i18n";
import type { Journey } from "./journeys";

function VisaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-trip-ink/55">{label}</dt>
      <dd className="mt-0.5 break-words font-display text-sm font-bold text-trip-ink sm:text-base">{value}</dd>
    </div>
  );
}

export function StudyVisa({
  journey,
  studentName,
  lang,
  t,
}: {
  journey: Journey;
  studentName: string;
  lang: Lang;
  t: Dict;
}) {
  const country = getCountry(journey.destCountryCode);
  const countryName = country
    ? lang === "ar" ? country.nameAr : country.name
    : journey.destCountryName;
  const destinationCode = country?.alpha3 ?? journey.destCountryCode;
  const issueDate = new Date(journey.arrivalAt).toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const visaNumber = `TYZ-${journey.id.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase() || "STUDY"}`;

  return (
    <article aria-label={t.visaTitle} className="trip-shadow trip-rise relative w-full overflow-hidden rounded-[2rem] border-[3px] border-trip-ink bg-trip-cream text-start text-trip-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "repeating-radial-gradient(circle at 0 0, #27304f 0, #27304f 1px, transparent 1px, transparent 13px)",
      }} />
      <div aria-hidden className="absolute -end-14 -top-16 h-48 w-48 rounded-full border-[22px] border-trip-sky-deep/15" />

      <header className="relative flex items-center justify-between gap-3 border-b-[3px] border-trip-ink bg-trip-sky-deep px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <BookOpenCheck className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/75">Tamayzak Passport</p>
            <h2 className="font-display text-xl font-black tracking-wide">{t.visaTitle}</h2>
          </div>
        </div>
        <span className="font-display text-2xl font-black" dir="ltr">{destinationCode}</span>
      </header>

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-trip-ink/55">{t.visaIssuedTo}</p>
            <p className="mt-1 break-words font-display text-2xl font-black sm:text-3xl">{studentName}</p>
          </div>
          <span className="shrink-0 text-5xl" aria-hidden>{country?.flag ?? flagEmoji(journey.destCountryCode)}</span>
        </div>

        <div className="my-5 flex items-center gap-3" dir="ltr">
          <span className="font-display text-2xl font-black">BGW</span>
          <span className="relative h-[3px] flex-1 bg-trip-ink/20">
            <span className="absolute inset-y-0 left-0 w-2/3 bg-trip-sky-deep" />
            <Plane className="absolute left-2/3 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 fill-trip-sun text-trip-ink" aria-hidden />
          </span>
          <span className="font-display text-2xl font-black">{destinationCode}</span>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
          <VisaField label={t.visaFrom} value={lang === "ar" ? TRIP_ORIGIN.cityAr : TRIP_ORIGIN.city} />
          <VisaField label={t.visaDestination} value={`${journey.destCity}, ${countryName}`} />
          <VisaField label={t.visaIssued} value={issueDate} />
          <VisaField label={t.visaNumber} value={visaNumber} />
          <VisaField label={t.distance} value={`${formatKm(journey.distanceKm)} km`} />
          <VisaField label={t.total} value={formatDuration(journey.durationSec, lang)} />
        </dl>

        <div className="mt-6 flex items-end justify-between gap-4 border-t-2 border-dashed border-trip-ink/25 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-trip-ink/65">
            <MapPin className="h-4 w-4" aria-hidden />
            <span>{journey.destCity}</span>
            <CalendarDays className="ms-1 h-4 w-4" aria-hidden />
            <span>{issueDate}</span>
          </div>
          <div className="-rotate-6 whitespace-pre-line rounded-full border-[3px] border-trip-coral px-3 py-2 text-center text-[10px] font-black uppercase leading-tight tracking-wider text-trip-coral">
            {t.visaGranted}
          </div>
        </div>
      </div>
    </article>
  );
}
