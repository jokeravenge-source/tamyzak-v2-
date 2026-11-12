import { COUNTRIES, getCountry, normalize, type Country } from "./countries";

export interface Destination {
  /** Country codes still identify the original capital routes. */
  id: string;
  country: Country;
  city: string;
  cityAr?: string;
  airportCode?: string;
  lat: number;
  lng: number;
  aliases: string[];
}

type CityRow = [country: string, slug: string, city: string, cityAr: string, airport: string, lat: number, lng: number, aliases?: string];

// City reference points, rather than flight schedules or airline routes.
const CITY_ROWS: CityRow[] = [
  ["IQ", "erbil", "Erbil", "أربيل", "EBL", 36.1911, 44.0092, "hawler|هولير"],
  ["IQ", "basra", "Basra", "البصرة", "BSR", 30.5085, 47.7804],
  ["IQ", "najaf", "Najaf", "النجف", "NJF", 32.0259, 44.3463],
  ["IQ", "sulaymaniyah", "Sulaymaniyah", "السليمانية", "ISU", 35.5558, 45.4351, "sulaimani|slemani"],
  ["IQ", "mosul", "Mosul", "الموصل", "OSM", 36.3489, 43.1577],
  ["AE", "dubai", "Dubai", "دبي", "DXB", 25.2048, 55.2708],
  ["AE", "sharjah", "Sharjah", "الشارقة", "SHJ", 25.3463, 55.4209],
  ["SA", "jeddah", "Jeddah", "جدة", "JED", 21.4858, 39.1925, "jiddah"],
  ["SA", "medina", "Medina", "المدينة المنورة", "MED", 24.5247, 39.5692, "madinah"],
  ["SA", "dammam", "Dammam", "الدمام", "DMM", 26.4207, 50.0888],
  ["TR", "istanbul", "Istanbul", "إسطنبول", "IST", 41.0082, 28.9784, "اسطنبول|استانبول"],
  ["TR", "antalya", "Antalya", "أنطاليا", "AYT", 36.8969, 30.7133],
  ["TR", "izmir", "Izmir", "إزمير", "ADB", 38.4237, 27.1428],
  ["TR", "trabzon", "Trabzon", "طرابزون", "TZX", 41.0027, 39.7168],
  ["EG", "alexandria", "Alexandria", "الإسكندرية", "HBE", 31.2001, 29.9187],
  ["EG", "sharm-el-sheikh", "Sharm El Sheikh", "شرم الشيخ", "SSH", 27.9158, 34.33],
  ["MA", "casablanca", "Casablanca", "الدار البيضاء", "CMN", 33.5731, -7.5898],
  ["MA", "marrakesh", "Marrakesh", "مراكش", "RAK", 31.6295, -7.9811, "marrakech"],
  ["JO", "aqaba", "Aqaba", "العقبة", "AQJ", 29.5321, 35.0063],
  ["OM", "salalah", "Salalah", "صلالة", "SLL", 17.0194, 54.11],
  ["FR", "nice", "Nice", "نيس", "NCE", 43.7102, 7.262],
  ["FR", "lyon", "Lyon", "ليون", "LYS", 45.764, 4.8357],
  ["IT", "milan", "Milan", "ميلانو", "MXP", 45.4642, 9.19, "milano"],
  ["IT", "venice", "Venice", "البندقية", "VCE", 45.4408, 12.3155, "venezia"],
  ["ES", "barcelona", "Barcelona", "برشلونة", "BCN", 41.3851, 2.1734],
  ["DE", "munich", "Munich", "ميونخ", "MUC", 48.1351, 11.582, "munchen|muenchen"],
  ["DE", "frankfurt", "Frankfurt", "فرانكفورت", "FRA", 50.1109, 8.6821],
  ["CH", "zurich", "Zurich", "زيورخ", "ZRH", 47.3769, 8.5417],
  ["CH", "geneva", "Geneva", "جنيف", "GVA", 46.2044, 6.1432],
  ["GB", "manchester", "Manchester", "مانشستر", "MAN", 53.4808, -2.2426],
  ["GB", "edinburgh", "Edinburgh", "إدنبرة", "EDI", 55.9533, -3.1883],
  ["US", "new-york", "New York", "نيويورك", "JFK", 40.7128, -74.006, "nyc"],
  ["US", "los-angeles", "Los Angeles", "لوس أنجلوس", "LAX", 34.0522, -118.2437, "la"],
  ["US", "chicago", "Chicago", "شيكاغو", "ORD", 41.8781, -87.6298],
  ["US", "san-francisco", "San Francisco", "سان فرانسيسكو", "SFO", 37.7749, -122.4194],
  ["CA", "toronto", "Toronto", "تورونتو", "YYZ", 43.6532, -79.3832],
  ["CA", "vancouver", "Vancouver", "فانكوفر", "YVR", 49.2827, -123.1207],
  ["AU", "sydney", "Sydney", "سيدني", "SYD", -33.8688, 151.2093],
  ["AU", "melbourne", "Melbourne", "ملبورن", "MEL", -37.8136, 144.9631],
  ["JP", "osaka", "Osaka", "أوساكا", "KIX", 34.6937, 135.5023],
  ["JP", "kyoto", "Kyoto", "كيوتو", "KIX", 35.0116, 135.7681],
  ["KR", "busan", "Busan", "بوسان", "PUS", 35.1796, 129.0756],
  ["TH", "phuket", "Phuket", "بوكيت", "HKT", 7.8804, 98.3923],
  ["ID", "bali", "Bali (Denpasar)", "بالي (دينباسار)", "DPS", -8.65, 115.2167],
  ["MY", "penang", "Penang (George Town)", "بينانغ (جورج تاون)", "PEN", 5.4141, 100.3288],
  ["CN", "shanghai", "Shanghai", "شنغهاي", "PVG", 31.2304, 121.4737],
  ["IN", "mumbai", "Mumbai", "مومباي", "BOM", 19.076, 72.8777, "bombay"],
  ["BR", "rio-de-janeiro", "Rio de Janeiro", "ريو دي جانيرو", "GIG", -22.9068, -43.1729],
  ["ZA", "cape-town", "Cape Town", "كيب تاون", "CPT", -33.9249, 18.4241],
  ["NZ", "auckland", "Auckland", "أوكلاند", "AKL", -36.8509, 174.7645],
];

export const DESTINATIONS: Destination[] = [
  ...CITY_ROWS.map(([countryCode, slug, city, cityAr, airportCode, lat, lng, aliases]) => {
    const country = getCountry(countryCode);
    if (!country) throw new Error(`Unknown destination country: ${countryCode}`);
    return { id: `${countryCode}:${slug}`, country, city, cityAr, airportCode, lat, lng, aliases: aliases?.split("|") ?? [] };
  }),
  ...COUNTRIES.map((country) => ({ id: country.alpha2, country, city: country.capital, lat: country.lat, lng: country.lng, aliases: [] })),
];

export const getDestination = (id: string) => DESTINATIONS.find((destination) => destination.id === id);

export function searchDestinations(query: string): Destination[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return DESTINATIONS;
  return DESTINATIONS.filter((destination) => {
    const country = destination.country;
    const haystack = normalize([destination.city, destination.cityAr ?? "", destination.airportCode ?? "", country.name,
      country.nameAr, country.alpha2, country.alpha3, ...country.aliases, ...destination.aliases].join(" "));
    return terms.every((term) => haystack.includes(term));
  });
}

export const destinationCity = (destination: Destination, lang: "en" | "ar") =>
  lang === "ar" ? destination.cityAr ?? destination.city : destination.city;
