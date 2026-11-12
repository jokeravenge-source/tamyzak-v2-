import { useMemo, useState } from "react";
import { CheckCircle2, Globe2, MapPin, Plane } from "lucide-react";
import { DESTINATIONS, destinationCity, searchDestinations } from "./destinations";
import { journeyState, type Journey } from "./journeys";
import { journeyDestinationKey } from "./itinerary";
import { TRIP_ORIGIN } from "./config";
import { FLIGHT_COPY } from "./flightCopy";
import type { Lang } from "./i18n";

export function WorldPassport({ journeys, now, lang, onChoose }: {
  journeys: Journey[]; now: number; lang: Lang; onChoose: (id: string) => void;
}) {
  const t = FLIGHT_COPY[lang];
  const [filter, setFilter] = useState<"all" | "visited" | "unvisited">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const booked = useMemo(() => new Set(journeys.map(journeyDestinationKey)), [journeys]);
  const visited = new Set(journeys.filter((journey) => journeyState(journey, now).arrived).map(journeyDestinationKey));
  const cities = searchDestinations(query).filter((city) => city.id !== TRIP_ORIGIN.countryCode
    && (filter === "all" || (filter === "visited" ? visited.has(city.id) : !visited.has(city.id))));
  const selected = DESTINATIONS.find((city) => city.id === selectedId);
  const status = (id: string) => visited.has(id) ? t.visited : booked.has(id) ? t.reserved : t.unvisited;
  return <section aria-label={t.world} className="space-y-4">
    <header className="rounded-3xl border-2 border-trip-ink/20 bg-trip-cream p-5">
      <Globe2 className="h-8 w-8" /><h1 className="mt-3 font-display text-3xl font-black">{t.world}</h1>
      <p className="mt-2 text-sm font-bold"><span dir="ltr" className="inline-block">{visited.size} / {DESTINATIONS.length - 1}</span> · {t.visited}</p>
      <p className="mt-2 text-xs leading-6 text-trip-ink/70">{t.once}</p>
    </header>
    <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold">{lang === "ar" ? "كبّر الخريطة أو ابحث باسم المدينة حتى تشوف تفاصيلها." : "Zoom or search for a city to see its details."}</p><div className="flex gap-2" dir="ltr"><button aria-label={lang === "ar" ? "تصغير الخريطة" : "Zoom out"} disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .5))} className="h-10 w-10 rounded-xl border-2 bg-trip-cream font-black disabled:opacity-40">−</button><button aria-label={lang === "ar" ? "تكبير الخريطة" : "Zoom in"} disabled={zoom >= 4} onClick={() => setZoom(value => Math.min(4, value + .5))} className="h-10 w-10 rounded-xl border-2 bg-trip-cream font-black disabled:opacity-40">+</button></div></div>
    <div className="max-h-[28rem] overflow-auto rounded-3xl border-[3px] border-trip-ink bg-[#e3f1f3] trip-shadow">
      <svg viewBox="0 0 720 360" style={{ width: `${zoom * 100}%`, maxWidth: "none" }} className="block min-w-full" role="group" aria-label={t.world}>
        <image href="/images/trip-world-land.svg" width="720" height="360" />
        <g stroke="#a7cbd0" strokeWidth=".4" opacity=".6" aria-hidden="true">
          {[-60,-30,0,30,60].map((lat) => <path key={lat} d={`M0 ${(90-lat)*2}H720`} />)}
          {[-120,-60,0,60,120].map((lng) => <path key={lng} d={`M${(lng+180)*2} 0V360`} />)}
        </g>
        {cities.map((city) => <g key={city.id} transform={`translate(${(city.lng + 180)*2} ${(90-city.lat)*2})`} role="button" tabIndex={selectedId === city.id ? 0 : -1}
          aria-label={`${destinationCity(city,lang)} — ${status(city.id)}`} onClick={() => setSelectedId(city.id)}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(city.id); } }} className="cursor-pointer outline-none focus:stroke-trip-ink">
          <title>{destinationCity(city,lang)} · {status(city.id)}</title>
          <circle r={selectedId===city.id ? 8 : 5} fill={visited.has(city.id) ? "#19826e" : booked.has(city.id) ? "#287eb5" : "#fffaf0"} stroke={selectedId===city.id ? "#d88b26" : "#2c5060"} strokeWidth={selectedId===city.id ? 3 : 1} />
          {visited.has(city.id) && <path d="M-2.5 0L-.5 2L3-2" fill="none" stroke="white" strokeWidth="1.3" aria-hidden="true" />}
        </g>)}
        <g transform={`translate(${(TRIP_ORIGIN.lng+180)*2} ${(90-TRIP_ORIGIN.lat)*2})`}><title>{t.home}</title><circle r="5" fill="#f2ba45" stroke="#6a4f1a" /></g>
      </svg>
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold">
      <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#19826e]" />{t.visited}</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#287eb5]" />{t.reserved}</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-trip-ink bg-[#fffaf0]" />{t.unvisited}</span>
    </div>
    {selected && <article className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-trip-ink/20 bg-trip-cream p-4" aria-live="polite">
      <span className="text-3xl">{selected.country.flag}</span><div className="flex-1"><h2 className="font-black">{destinationCity(selected,lang)}</h2><p className="text-xs font-bold">{status(selected.id)}</p></div>
      <button disabled={booked.has(selected.id)} onClick={() => onChoose(selected.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-trip-ink px-4 text-sm font-bold text-white disabled:opacity-50"><Plane className="h-4 w-4" />{booked.has(selected.id) ? status(selected.id) : t.choose}</button>
    </article>}
    <input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedId(null); }} placeholder={lang==="ar"?"ابحث عن مدينة…":"Search a city…"} aria-label={lang==="ar"?"ابحث عن مدينة":"Search cities"} className="min-h-12 w-full rounded-xl border-2 bg-white px-4" />
    <div role="group" aria-label={lang==="ar"?"فلتر المدن":"City filter"} className="flex gap-2">{(["all","visited","unvisited"] as const).map((value) => <button key={value} aria-pressed={filter===value} onClick={() => { setFilter(value); setSelectedId(null); }} className={`min-h-10 rounded-xl border-2 px-3 text-xs font-black ${filter===value?"bg-trip-ink text-white":"bg-trip-cream"}`}>{t[value]}</button>)}</div>
    <ul className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto p-1" aria-label={lang==="ar"?"سجل المدن":"City visit list"}>{cities.map((city) => <li key={city.id}><button onClick={() => setSelectedId(city.id)} className="flex min-h-14 w-full items-center gap-2 rounded-xl border-2 border-trip-ink/15 bg-trip-cream p-3 text-start"><span className="text-xl">{city.country.flag}</span><span className="min-w-0 flex-1 text-xs font-bold">{destinationCity(city,lang)}<span className="mt-1 block text-[10px] text-trip-ink/65">{status(city.id)}</span></span>{visited.has(city.id)?<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700"/>:<MapPin className="h-4 w-4 shrink-0"/>}</button></li>)}</ul>
    {!cities.length && <p className="py-6 text-center text-sm font-bold">{t.noMatch}</p>}
  </section>;
}
