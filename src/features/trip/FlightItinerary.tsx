import { Check, Coffee, Plane } from "lucide-react";
import { CharacterAvatar, type CharacterTraits, type Gender } from "@/components/CharacterAvatar";
import { formatDuration } from "./geo";
import { currentFlightStage, type FlightStage } from "./itinerary";
import { FLIGHT_COPY } from "./flightCopy";
import type { FlightPassenger } from "./journeys";
import type { Lang } from "./i18n";

export function FlightItinerary({ stages, elapsedSec=0, lang, preview=false }: { stages?: FlightStage[]; elapsedSec?: number; lang: Lang; preview?: boolean }) {
  const t = FLIGHT_COPY[lang];
  const current = currentFlightStage(stages,elapsedSec);
  if (!stages?.length) return null;
  return <section className="rounded-2xl border-2 border-trip-ink/20 bg-trip-cream p-4" aria-label={t.itinerary}>
    <h3 className="font-black">{t.itinerary}</h3>
    <ol className="mt-3 grid gap-2">{stages.map((stage,index) => <li key={index} aria-current={!preview && current?.index===index ? "step" : undefined} className={`flex items-center gap-3 rounded-xl p-2 text-xs ${!preview && current?.index===index ? "bg-trip-sun/60 ring-1 ring-trip-ink/20" : ""}`}>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-trip-ink/10">{!preview && current && index<current.index?<Check className="h-4 w-4"/>:stage.kind==="rest"?<Coffee className="h-4 w-4"/>:<Plane className="h-4 w-4"/>}</span>
      <span className="flex-1 font-bold">{t[stage.kind]}<span className="ms-2 font-normal text-trip-ink/60">{lang==="ar"?stage.cityAr??stage.city:stage.city}</span></span><span className="font-bold">{formatDuration(stage.durationSec,lang)}</span>
    </li>)}</ol>
    <p className="mt-3 text-[11px] leading-6 text-trip-ink/65">{t.simulation}</p>
  </section>;
}

export function RestLounge({ lang, city, studentName, gender, character, friends=[] }: {
  lang: Lang; city: string; studentName: string; gender?: Gender | null; character?: Partial<CharacterTraits> | null; friends?: FlightPassenger[];
}) {
  const t=FLIGHT_COPY[lang];
  const people=[{userId:"self",displayName:studentName,gender:gender??"male",character},...friends.filter(p=>p.status==="accepted")];
  return <section aria-label={t.lounge} className="trip-shadow relative overflow-hidden rounded-3xl border-[3px] border-trip-ink bg-[#f0e5cc] p-5">
    <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-200 to-sky-50"><div className="absolute inset-x-0 bottom-0 h-3 bg-[#a6b6a8]"/><div className="absolute inset-y-0 left-1/3 w-3 bg-[#a6b6a8]"/><div className="absolute inset-y-0 right-1/3 w-3 bg-[#a6b6a8]"/></div>
    <header className="relative"><span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black"><Coffee className="h-4 w-4"/>TAMAYZAK LOUNGE</span><h2 className="mt-5 text-2xl font-black">{t.lounge}</h2><p className="mt-1 text-sm font-bold">{city}</p></header>
    <div className="relative mt-12 flex flex-wrap justify-center gap-3">{people.map(person=><div key={person.userId} className="w-36 rounded-[2rem] border-b-[12px] border-[#a97552] bg-[#d4ba93] px-3 pb-3 text-center shadow-lg"><CharacterAvatar gender={person.gender??"male"} traits={person.character} size={112}/><p className="mt-2 break-words text-xs font-black">{person.displayName}</p></div>)}</div>
    <p className="relative mt-5 text-center text-sm font-semibold leading-7">{t.loungeHint}</p>
  </section>;
}
