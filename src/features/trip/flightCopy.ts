import type { Lang } from "./i18n";

export const FLIGHT_COPY = {
  ar: {
    friends: "سافر ويا زملائك", invite: "ادعُ زميل", search: "ابحث باسم الطالب", join: "انضم للرحلة", decline: "رفض", incoming: "دعوات السفر",
    invited: "دعاك إلى", pending: "بانتظار الموافقة", accepted: "منضم", declined: "اعتذر", limit: "لحد ١٠ أصدقاء بكل رحلة. تظهر مقاعدهم بعد قبول الدعوة.",
    sent: "انرسلت الدعوة", noStudents: "ماكو طالب مطابق", account: "سجّل دخولك حتى تدعو زملائك وتحفظ رحلاتك بحسابك.",
    sell: "بيع الفيزا مقابل ١٠٠ نقطة", sold: "تم بيع الفيزا · ١٠٠ نقطة", selling: "جارٍ بيع الفيزا…", sellConfirm: "تبيع هاي الفيزا مقابل ١٠٠ نقطة؟ سجل زيارة المدينة يبقى، وما تكدر تزورها مرة ثانية بهذا الحساب.",
    earned: "انضافت ١٠٠ نقطة لرصيدك", once: "كل مدينة تزورها مرة وحدة بهذا الحساب؛ بيع الفيزا ما يمسح الزيارة.",
    visited: "تمت زيارتها", unvisited: "بعدك ما زرتها", reserved: "رحلة محجوزة", all: "كل المدن", world: "خريطة رحلاتك حول العالم", choose: "سافر لهذه المدينة", home: "بغداد · نقطة الانطلاق",
    legacy: "هاي فيزا قديمة محفوظة للتذكار. بيع الفيزا متاح للرحلات الجديدة المسجلة بالحساب.",
    lounge: "استراحة المسافرين", loungeHint: "استريح، تمشّى شويّة وخذ نفس قبل ما تكمّل رحلتك.", hostControls: "صاحب الرحلة يتحكم بالاستراحة والمتابعة للكل.",
    simulation: "محاكاة دراسية: المدة تشمل الصعود والإقلاع والهبوط، وترانزيت استراحة للرحلات الطويلة. مو جدول شركة طيران.",
    itinerary: "مراحل الرحلة", boarding: "الصعود للطائرة", takeoff: "التحرّك والإقلاع", cruise: "الطيران", landing: "الاقتراب والهبوط", rest: "ترانزيت واستراحة", noVisas: "ما عندك فيزا قابلة للبيع بعد.",
    setup: "نظام الرحلات الجديد بعده يحتاج تفعيل بقاعدة البيانات. حاول بعد التحديث.", error: "تعذّر إكمال العملية. حاول مرّة ثانية.",
    visitedError: "زرت أو حجزت هاي المدينة من قبل. اختار مدينة جديدة.", activeError: "عندك رحلة فعّالة. كمّلها أولاً.", fullError: "وصلت للحد الأقصى: ١٠ دعوات بهالرحلة.", ended: "هاي الرحلة انتهت.", noMatch: "ماكو مدن مطابقة.",
  },
  en: {
    friends: "Fly with your friends", invite: "Invite a student", search: "Search by student name", join: "Join flight", decline: "Decline", incoming: "Flight invitations",
    invited: "invited you to", pending: "Waiting for acceptance", accepted: "Joined", declined: "Declined", limit: "Invite up to 10 friends per flight. Their seats appear after they accept.",
    sent: "Invitation sent", noStudents: "No matching students", account: "Sign in to invite friends and save your flights to your account.",
    sell: "Sell visa for 100 points", sold: "Visa sold · 100 points", selling: "Selling visa…", sellConfirm: "Sell this visa for 100 points? Your city visit stays recorded and cannot be repeated on this account.",
    earned: "100 points added to your balance", once: "Each city can be visited once per account. Selling its visa keeps the visit recorded.",
    visited: "Visited", unvisited: "Not visited", reserved: "Booked flight", all: "All cities", world: "Your world travel map", choose: "Fly to this city", home: "Baghdad · Departure city",
    legacy: "This older visa remains a souvenir. Visa sales are available for new account-verified flights.",
    lounge: "Travellers’ lounge", loungeHint: "Rest, stretch and take a breath before continuing your journey.", hostControls: "The host controls breaks and resuming the shared flight.",
    simulation: "Study simulation: time includes boarding, takeoff, landing and a lounge stop on long journeys. This is not an airline timetable.",
    itinerary: "Flight itinerary", boarding: "Boarding", takeoff: "Taxi and takeoff", cruise: "Cruising", landing: "Approach and landing", rest: "Stopover and lounge", noVisas: "No visas available to sell yet.",
    setup: "The new flight system needs its database update before account flights can open. Please try again after the update.", error: "Could not complete this action. Please try again.",
    visitedError: "You have already visited or booked this city. Choose a new city.", activeError: "Finish your current flight first.", fullError: "This flight has reached its limit of 10 invitations.", ended: "This flight has ended.", noMatch: "No matching cities.",
  },
} as const;

export function flightError(error: unknown, lang: Lang) {
  const message = error instanceof Error ? error.message : String(error);
  const t = FLIGHT_COPY[lang];
  if (message.includes("friend_city_already_visited")) return lang === "ar" ? "هذا الزميل زار أو حجز هاي المدينة من قبل. اختاروا وجهة جديدة للسفر سويّة." : "This student has already visited or booked this city. Choose a new destination together.";
  if (message.includes("flight_setup_required")) return t.setup;
  if (message.includes("city_already_visited")) return t.visitedError;
  if (message.includes("already_in_flight")) return t.activeError;
  if (message.includes("flight_full")) return t.fullError;
  if (message.includes("flight_not_active")) return t.ended;
  return t.error;
}
