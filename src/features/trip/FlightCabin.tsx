import { useId } from "react";
import { BookOpen, Coffee, Plane } from "lucide-react";
import { CharacterAvatar, type CharacterTraits, type Gender } from "@/components/CharacterAvatar";
import { TRIP_ORIGIN } from "./config";
import { formatClock } from "./geo";
import { DICTS, type Lang } from "./i18n";
import { journeyState, type Journey } from "./journeys";
import "./flight-cabin.css";

function CabinReader({ id, x, y, gender, traits, primary = false }: {
  id: string;
  x: number;
  y: number;
  gender: Gender;
  traits?: Partial<CharacterTraits> | null;
  primary?: boolean;
}) {
  const skin = traits?.skin ?? "#ffe6d5";
  const coat = primary ? "#628cb7" : "#8fa4ac";
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`${id}-upper-body`}><rect x="-20" y="-35" width="230" height="186" /></clipPath>
      </defs>
      <ellipse cx="95" cy="244" rx="112" ry="12" fill="#172e47" opacity=".13" />
      <path d="M3 65Q3 13 42 13H150Q189 13 189 65V204H3Z" fill={primary ? "#285475" : "#526e84"} stroke="#213a53" strokeWidth="4" />
      <rect x="23" y="26" width="146" height="88" rx="25" fill={primary ? "#719bc1" : "#8ba5b6"} />
      <path d="M25 185H166L178 216Q93 244 13 216Z" fill="#365a76" stroke="#213a53" strokeWidth="4" />
      <path d="M64 142Q50 156 55 175L72 188L71 224H95L104 178L88 155Z" fill="#263349" stroke="#1d2c40" strokeWidth="3" />
      <path d="M105 146Q129 148 139 166L132 188L140 224H116L99 182L91 162Z" fill="#34445a" stroke="#1d2c40" strokeWidth="3" />
      <path d="M68 220H96L97 232H61Q56 226 68 220ZM115 220H141L154 229Q156 233 147 234H115Z" fill="#f4f1e8" stroke="#25384d" strokeWidth="3" />
      <g clipPath={`url(#${id}-upper-body)`}>
        <foreignObject x="-18" y="-26" width="226" height="226">
          <CharacterAvatar gender={gender} traits={traits} size={226} />
        </foreignObject>
      </g>
      <g className="flight-reader-arms">
        <path d="M58 103Q35 113 47 144L67 154" fill="none" stroke={coat} strokeWidth="18" strokeLinecap="round" />
        <path d="M133 103Q154 112 144 144L123 154" fill="none" stroke={coat} strokeWidth="18" strokeLinecap="round" />
        <g className="flight-reader-book">
          <path d="M34 128L93 141L156 128V170L95 185L34 171Z" fill={primary ? "#2d6b61" : "#9c6852"} stroke="#213a53" strokeWidth="3" strokeLinejoin="round" />
          <path d="M40 122Q69 121 94 135Q121 121 150 122V162Q120 162 94 177Q68 163 40 162Z" fill="#fffaf0" stroke="#d3c8ae" strokeWidth="2" />
          <path d="M94 135V177" stroke="#c9bfa9" strokeWidth="2" />
          {[0, 1, 2, 3].map((line) => (
            <g key={line} stroke="#b3c1c1" strokeWidth="2" strokeLinecap="round">
              <path d={`M49 ${134 + line * 6}L83 ${143 + line * 6}`} />
              <path d={`M105 ${143 + line * 6}L141 ${134 + line * 6}`} />
            </g>
          ))}
          <path className="flight-book-page" d="M96 136Q112 119 135 122L133 162Q112 163 96 175Z" fill="#fffdf6" opacity=".9" />
        </g>
        <ellipse cx="43" cy="151" rx="8" ry="11" fill={skin} transform="rotate(-18 43 151)" />
        <ellipse cx="148" cy="151" rx="8" ry="11" fill={skin} transform="rotate(18 148 151)" />
      </g>
      <path d="M2 156H23V206H2ZM167 156H188V206H167Z" fill="#a9b8bf" stroke="#213a53" strokeWidth="3" />
      <path d="M-3 154H30M160 154H194" stroke="#e8e8de" strokeWidth="12" strokeLinecap="round" />
    </g>
  );
}

export function FlightCabin({ journey, now, studentName, gender = "male", character, lang }: {
  journey: Journey;
  now: number;
  studentName: string;
  gender?: Gender | null;
  character?: Partial<CharacterTraits> | null;
  lang: Lang;
}) {
  const id = `cabin-${useId().replace(/:/g, "")}`;
  const t = DICTS[lang];
  const state = journeyState(journey, now);
  const city = lang === "ar" ? journey.destCityAr ?? journey.destCity : journey.destCity;
  const sceneDescription = `${studentName} — ${t.cabinDescription}`;
  return (
    <section className={`flight-cabin trip-shadow ${state.paused || state.arrived ? "flight-cabin-still" : ""}`} aria-label={t.cabin}>
      <div className="flight-cabin-heading">
        <div className="min-w-0">
          <p className="flight-cabin-eyebrow"><Plane size={13} aria-hidden /> TAMAYZAK AIR</p>
          <h2>{t.cabinTitle}</h2>
        </div>
        <span className="flight-seat-badge"><span>{t.yourSeat}</span><b dir="ltr">12B</b></span>
      </div>
      <svg className="flight-cabin-scene" viewBox="0 0 960 510" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{t.cabinTitle}</title>
        <desc id={`${id}-desc`}>{sceneDescription}</desc>
        <defs>
          <linearGradient id={`${id}-wall`} x2="0" y2="1"><stop stopColor="#f7f4e9" /><stop offset="1" stopColor="#dce8eb" /></linearGradient>
          <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#82c5e4" /><stop offset="1" stopColor="#e0f2f3" /></linearGradient>
          <linearGradient id={`${id}-floor`} x2="0" y2="1"><stop stopColor="#738fa5" /><stop offset="1" stopColor="#375773" /></linearGradient>
          <linearGradient id={`${id}-light`}><stop stopColor="#fff3c8" stopOpacity="0" /><stop offset=".5" stopColor="#fff3c8" /><stop offset="1" stopColor="#fff3c8" stopOpacity="0" /></linearGradient>
        </defs>
        <g aria-hidden="true">
          <path d="M0 0H960V510H0Z" fill={`url(#${id}-wall)`} />
          <path d="M-20 71Q480-83 980 71V96Q480-42-20 96Z" fill="#e2e6e0" stroke="#bdccd0" strokeWidth="3" />
          {[32, 330, 628].map((x) => <path key={x} d={`M${x} 28Q${x + 140} 0 ${x + 285} 28L${x + 277} 80Q${x + 144} 59 ${x + 7} 80Z`} fill="#f9f6ec" stroke="#c7d2d2" strokeWidth="3" />)}
          <path d="M8 106Q480 58 952 106" fill="none" stroke={`url(#${id}-light)`} strokeWidth="8" />
          {[100, 416, 732].map((x, index) => (
            <g key={x}>
              <rect x={x - 9} y="127" width="147" height="151" rx="51" fill="#c0cdd0" stroke="#9fbbc4" strokeWidth="3" />
              <rect x={x} y="136" width="129" height="133" rx="43" fill={`url(#${id}-sky)`} stroke="#f7faf5" strokeWidth="5" />
              <clipPath id={`${id}-window-${index}`}><rect x={x + 3} y="139" width="123" height="127" rx="41" /></clipPath>
              <g clipPath={`url(#${id}-window-${index})`}>
                <g className="flight-window-clouds" style={{ animationDelay: `${index * -7}s` }}>
                  <path d={`M${x - 100} 232q20-24 38-10q12-40 42-18q18-14 33 9q32-7 42 24H${x - 100}Z`} fill="#fff" opacity=".85" />
                  <path d={`M${x + 33} 191q16-25 36-11q9-30 31-14q24-12 38 24Z`} fill="#fff" opacity=".65" />
                </g>
                <path d={`M${x + 20} 249L${x + 130} 228L${x + 138} 247L${x + 54} 259Z`} fill="#f7fbfb" stroke="#afc8d2" strokeWidth="2" />
              </g>
            </g>
          ))}
          <path d="M0 321Q480 357 960 321V510H0Z" fill="#bfced2" />
          <path d="M0 406Q480 364 960 406V510H0Z" fill={`url(#${id}-floor)`} />
          <path d="M318 404L271 510M644 404L692 510" stroke="#bfd5da" strokeWidth="3" opacity=".5" />
          <path d="M0 323Q480 359 960 323" fill="none" stroke="#a6b9bf" strokeWidth="5" />
          <CabinReader id={`${id}-left`} x={100} y={238} gender="female" traits={{ variant: 2, skin: "#ffe6d5" }} />
          <CabinReader id={`${id}-student`} x={385} y={222} gender={gender ?? "male"} traits={character} primary />
          <CabinReader id={`${id}-right`} x={670} y={238} gender="male" traits={{ variant: 4, skin: "#f1cfc5" }} />
          <rect x="411" y="193" width="138" height="27" rx="13.5" fill="#fff8df" stroke="#c8aa60" strokeWidth="1.5" />
          <text x="480" y="211" textAnchor="middle" fill="#405064" fontSize="12" fontWeight="800">12B · {t.you}</text>
        </g>
      </svg>
      <div className="flight-cabin-footer">
        <div className="flight-cabin-student">
          <span className="flight-cabin-status-icon">{state.paused ? <Coffee size={18} aria-hidden /> : <BookOpen size={18} aria-hidden />}</span>
          <div className="min-w-0"><strong>{studentName}</strong><span>{state.paused ? t.onBreak : t.readingNow}</span></div>
        </div>
        <div className="flight-cabin-route"><span>{lang === "ar" ? TRIP_ORIGIN.cityAr : TRIP_ORIGIN.city} <span aria-hidden>→</span> {city}</span><b dir="ltr">{formatClock(state.remainingSec)}</b></div>
      </div>
      <p className="flight-cabin-caption">{t.cabinHint}</p>
    </section>
  );
}
