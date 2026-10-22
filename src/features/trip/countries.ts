/**
 * 194 destinations: UN members + Holy See + State of Palestine (Israel excluded by product decision).
 * Coordinates are the capital city, or a documented government seat where
 * the capital is disputed/undefined:
 *  - Nauru: no official capital; Yaren district hosts the government.
 *  - Palestine: Ramallah, seat of the Palestinian government.
 *  - Switzerland: Bern, the "federal city".
 *  - Bolivia: La Paz, seat of government (Sucre is constitutional capital).
 *  - Kiribati / Sri Lanka / Palau: South Tarawa, Sri Jayawardenepura Kotte, Ngerulmud.
 */
export interface Country {
  alpha2: string;
  alpha3: string;
  name: string;
  nameAr: string;
  capital: string;
  lat: number;
  lng: number;
  flag: string;
  aliases: string[];
}

type Row = [string, string, string, string, string, number, number, string?];

const ROWS: Row[] = [
  ["AF", "AFG", "Afghanistan", "أفغانستان", "Kabul", 34.5553, 69.2075],
  ["AL", "ALB", "Albania", "ألبانيا", "Tirana", 41.3275, 19.8187],
  ["DZ", "DZA", "Algeria", "الجزائر", "Algiers", 36.7538, 3.0588],
  ["AD", "AND", "Andorra", "أندورا", "Andorra la Vella", 42.5063, 1.5218],
  ["AO", "AGO", "Angola", "أنغولا", "Luanda", -8.839, 13.2894],
  ["AG", "ATG", "Antigua and Barbuda", "أنتيغوا وباربودا", "Saint John's", 17.1274, -61.8468],
  ["AR", "ARG", "Argentina", "الأرجنتين", "Buenos Aires", -34.6037, -58.3816],
  ["AM", "ARM", "Armenia", "أرمينيا", "Yerevan", 40.1792, 44.4991],
  ["AU", "AUS", "Australia", "أستراليا", "Canberra", -35.2809, 149.13],
  ["AT", "AUT", "Austria", "النمسا", "Vienna", 48.2082, 16.3738],
  ["AZ", "AZE", "Azerbaijan", "أذربيجان", "Baku", 40.4093, 49.8671],
  ["BS", "BHS", "Bahamas", "جزر البهاما", "Nassau", 25.0443, -77.3504],
  ["BH", "BHR", "Bahrain", "البحرين", "Manama", 26.2285, 50.586],
  ["BD", "BGD", "Bangladesh", "بنغلاديش", "Dhaka", 23.8103, 90.4125],
  ["BB", "BRB", "Barbados", "باربادوس", "Bridgetown", 13.0975, -59.6167],
  ["BY", "BLR", "Belarus", "بيلاروس", "Minsk", 53.9006, 27.559],
  ["BE", "BEL", "Belgium", "بلجيكا", "Brussels", 50.8503, 4.3517],
  ["BZ", "BLZ", "Belize", "بليز", "Belmopan", 17.251, -88.759],
  ["BJ", "BEN", "Benin", "بنين", "Porto-Novo", 6.4969, 2.6289],
  ["BT", "BTN", "Bhutan", "بوتان", "Thimphu", 27.4728, 89.639],
  ["BO", "BOL", "Bolivia", "بوليفيا", "La Paz", -16.4897, -68.1193],
  ["BA", "BIH", "Bosnia and Herzegovina", "البوسنة والهرسك", "Sarajevo", 43.8563, 18.4131, "bosnia"],
  ["BW", "BWA", "Botswana", "بوتسوانا", "Gaborone", -24.6282, 25.9231],
  ["BR", "BRA", "Brazil", "البرازيل", "Brasília", -15.7939, -47.8828],
  ["BN", "BRN", "Brunei", "بروناي", "Bandar Seri Begawan", 4.9031, 114.9398],
  ["BG", "BGR", "Bulgaria", "بلغاريا", "Sofia", 42.6977, 23.3219],
  ["BF", "BFA", "Burkina Faso", "بوركينا فاسو", "Ouagadougou", 12.3714, -1.5197],
  ["BI", "BDI", "Burundi", "بوروندي", "Gitega", -3.4271, 29.9246],
  ["CV", "CPV", "Cabo Verde", "الرأس الأخضر", "Praia", 14.933, -23.5133, "cape verde"],
  ["KH", "KHM", "Cambodia", "كمبوديا", "Phnom Penh", 11.5564, 104.9282],
  ["CM", "CMR", "Cameroon", "الكاميرون", "Yaoundé", 3.848, 11.5021],
  ["CA", "CAN", "Canada", "كندا", "Ottawa", 45.4215, -75.6972],
  ["CF", "CAF", "Central African Republic", "جمهورية أفريقيا الوسطى", "Bangui", 4.3947, 18.5582, "car"],
  ["TD", "TCD", "Chad", "تشاد", "N'Djamena", 12.1348, 15.0557],
  ["CL", "CHL", "Chile", "تشيلي", "Santiago", -33.4489, -70.6693],
  ["CN", "CHN", "China", "الصين", "Beijing", 39.9042, 116.4074],
  ["CO", "COL", "Colombia", "كولومبيا", "Bogotá", 4.711, -74.0721],
  ["KM", "COM", "Comoros", "جزر القمر", "Moroni", -11.7172, 43.2473],
  ["CG", "COG", "Congo", "جمهورية الكونغو", "Brazzaville", -4.2634, 15.2429, "republic of the congo"],
  ["CR", "CRI", "Costa Rica", "كوستاريكا", "San José", 9.9281, -84.0907],
  ["CI", "CIV", "Côte d'Ivoire", "ساحل العاج", "Yamoussoukro", 6.8276, -5.2893, "ivory coast|cote d'ivoire"],
  ["HR", "HRV", "Croatia", "كرواتيا", "Zagreb", 45.815, 15.9819],
  ["CU", "CUB", "Cuba", "كوبا", "Havana", 23.1136, -82.3666],
  ["CY", "CYP", "Cyprus", "قبرص", "Nicosia", 35.1856, 33.3823],
  ["CZ", "CZE", "Czechia", "التشيك", "Prague", 50.0755, 14.4378, "czech republic"],
  ["CD", "COD", "DR Congo", "جمهورية الكونغو الديمقراطية", "Kinshasa", -4.4419, 15.2663, "democratic republic of the congo|drc|zaire"],
  ["DK", "DNK", "Denmark", "الدنمارك", "Copenhagen", 55.6761, 12.5683],
  ["DJ", "DJI", "Djibouti", "جيبوتي", "Djibouti", 11.5721, 43.1456],
  ["DM", "DMA", "Dominica", "دومينيكا", "Roseau", 15.301, -61.387],
  ["DO", "DOM", "Dominican Republic", "جمهورية الدومينيكان", "Santo Domingo", 18.4861, -69.9312],
  ["EC", "ECU", "Ecuador", "الإكوادور", "Quito", -0.1807, -78.4678],
  ["EG", "EGY", "Egypt", "مصر", "Cairo", 30.0444, 31.2357],
  ["SV", "SLV", "El Salvador", "السلفادور", "San Salvador", 13.6929, -89.2182],
  ["GQ", "GNQ", "Equatorial Guinea", "غينيا الاستوائية", "Malabo", 3.7504, 8.7371],
  ["ER", "ERI", "Eritrea", "إريتريا", "Asmara", 15.3229, 38.9251],
  ["EE", "EST", "Estonia", "إستونيا", "Tallinn", 59.437, 24.7536],
  ["SZ", "SWZ", "Eswatini", "إسواتيني", "Mbabane", -26.3054, 31.1367, "swaziland"],
  ["ET", "ETH", "Ethiopia", "إثيوبيا", "Addis Ababa", 9.03, 38.74],
  ["FJ", "FJI", "Fiji", "فيجي", "Suva", -18.1248, 178.4501],
  ["FI", "FIN", "Finland", "فنلندا", "Helsinki", 60.1699, 24.9384],
  ["FR", "FRA", "France", "فرنسا", "Paris", 48.8566, 2.3522],
  ["GA", "GAB", "Gabon", "الغابون", "Libreville", 0.4162, 9.4673],
  ["GM", "GMB", "Gambia", "غامبيا", "Banjul", 13.4549, -16.579],
  ["GE", "GEO", "Georgia", "جورجيا", "Tbilisi", 41.7151, 44.8271],
  ["DE", "DEU", "Germany", "ألمانيا", "Berlin", 52.52, 13.405],
  ["GH", "GHA", "Ghana", "غانا", "Accra", 5.6037, -0.187],
  ["GR", "GRC", "Greece", "اليونان", "Athens", 37.9838, 23.7275],
  ["GD", "GRD", "Grenada", "غرينادا", "Saint George's", 12.0561, -61.7488],
  ["GT", "GTM", "Guatemala", "غواتيمالا", "Guatemala City", 14.6349, -90.5069],
  ["GN", "GIN", "Guinea", "غينيا", "Conakry", 9.6412, -13.5784],
  ["GW", "GNB", "Guinea-Bissau", "غينيا بيساو", "Bissau", 11.8817, -15.6178],
  ["GY", "GUY", "Guyana", "غيانا", "Georgetown", 6.8013, -58.1551],
  ["HT", "HTI", "Haiti", "هايتي", "Port-au-Prince", 18.5944, -72.3074],
  ["HN", "HND", "Honduras", "هندوراس", "Tegucigalpa", 14.0723, -87.1921],
  ["HU", "HUN", "Hungary", "المجر", "Budapest", 47.4979, 19.0402],
  ["IS", "ISL", "Iceland", "آيسلندا", "Reykjavík", 64.1466, -21.9426],
  ["IN", "IND", "India", "الهند", "New Delhi", 28.6139, 77.209],
  ["ID", "IDN", "Indonesia", "إندونيسيا", "Jakarta", -6.2088, 106.8456],
  ["IR", "IRN", "Iran", "إيران", "Tehran", 35.6892, 51.389],
  ["IQ", "IRQ", "Iraq", "العراق", "Baghdad", 33.3152, 44.3661],
  ["IE", "IRL", "Ireland", "أيرلندا", "Dublin", 53.3498, -6.2603],
  ["IT", "ITA", "Italy", "إيطاليا", "Rome", 41.9028, 12.4964],
  ["JM", "JAM", "Jamaica", "جامايكا", "Kingston", 17.9714, -76.792],
  ["JP", "JPN", "Japan", "اليابان", "Tokyo", 35.6762, 139.6503],
  ["JO", "JOR", "Jordan", "الأردن", "Amman", 31.9454, 35.9284],
  ["KZ", "KAZ", "Kazakhstan", "كازاخستان", "Astana", 51.1694, 71.4491],
  ["KE", "KEN", "Kenya", "كينيا", "Nairobi", -1.2921, 36.8219],
  ["KI", "KIR", "Kiribati", "كيريباتي", "South Tarawa", 1.329, 172.979],
  ["KW", "KWT", "Kuwait", "الكويت", "Kuwait City", 29.3759, 47.9774],
  ["KG", "KGZ", "Kyrgyzstan", "قيرغيزستان", "Bishkek", 42.8746, 74.5698],
  ["LA", "LAO", "Laos", "لاوس", "Vientiane", 17.9757, 102.6331],
  ["LV", "LVA", "Latvia", "لاتفيا", "Riga", 56.9496, 24.1052],
  ["LB", "LBN", "Lebanon", "لبنان", "Beirut", 33.8938, 35.5018],
  ["LS", "LSO", "Lesotho", "ليسوتو", "Maseru", -29.3151, 27.4869],
  ["LR", "LBR", "Liberia", "ليبيريا", "Monrovia", 6.3156, -10.8074],
  ["LY", "LBY", "Libya", "ليبيا", "Tripoli", 32.8872, 13.1913],
  ["LI", "LIE", "Liechtenstein", "ليختنشتاين", "Vaduz", 47.141, 9.5209],
  ["LT", "LTU", "Lithuania", "ليتوانيا", "Vilnius", 54.6872, 25.2797],
  ["LU", "LUX", "Luxembourg", "لوكسمبورغ", "Luxembourg", 49.6116, 6.1319],
  ["MG", "MDG", "Madagascar", "مدغشقر", "Antananarivo", -18.8792, 47.5079],
  ["MW", "MWI", "Malawi", "مالاوي", "Lilongwe", -13.9626, 33.7741],
  ["MY", "MYS", "Malaysia", "ماليزيا", "Kuala Lumpur", 3.139, 101.6869],
  ["MV", "MDV", "Maldives", "جزر المالديف", "Malé", 4.1755, 73.5093],
  ["ML", "MLI", "Mali", "مالي", "Bamako", 12.6392, -8.0029],
  ["MT", "MLT", "Malta", "مالطا", "Valletta", 35.8989, 14.5146],
  ["MH", "MHL", "Marshall Islands", "جزر مارشال", "Majuro", 7.1164, 171.1858],
  ["MR", "MRT", "Mauritania", "موريتانيا", "Nouakchott", 18.0735, -15.9582],
  ["MU", "MUS", "Mauritius", "موريشيوس", "Port Louis", -20.1609, 57.5012],
  ["MX", "MEX", "Mexico", "المكسيك", "Mexico City", 19.4326, -99.1332],
  ["FM", "FSM", "Micronesia", "ميكرونيزيا", "Palikir", 6.9248, 158.161],
  ["MD", "MDA", "Moldova", "مولدوفا", "Chișinău", 47.0105, 28.8638],
  ["MC", "MCO", "Monaco", "موناكو", "Monaco", 43.7384, 7.4246],
  ["MN", "MNG", "Mongolia", "منغوليا", "Ulaanbaatar", 47.8864, 106.9057],
  ["ME", "MNE", "Montenegro", "الجبل الأسود", "Podgorica", 42.4304, 19.2594],
  ["MA", "MAR", "Morocco", "المغرب", "Rabat", 34.0209, -6.8416],
  ["MZ", "MOZ", "Mozambique", "موزمبيق", "Maputo", -25.9692, 32.5732],
  ["MM", "MMR", "Myanmar", "ميانمار", "Naypyidaw", 19.7633, 96.0785, "burma"],
  ["NA", "NAM", "Namibia", "ناميبيا", "Windhoek", -22.5609, 17.0658],
  ["NR", "NRU", "Nauru", "ناورو", "Yaren", -0.5477, 166.9209],
  ["NP", "NPL", "Nepal", "نيبال", "Kathmandu", 27.7172, 85.324],
  ["NL", "NLD", "Netherlands", "هولندا", "Amsterdam", 52.3676, 4.9041, "holland"],
  ["NZ", "NZL", "New Zealand", "نيوزيلندا", "Wellington", -41.2865, 174.7762],
  ["NI", "NIC", "Nicaragua", "نيكاراغوا", "Managua", 12.114, -86.2362],
  ["NE", "NER", "Niger", "النيجر", "Niamey", 13.5116, 2.1254],
  ["NG", "NGA", "Nigeria", "نيجيريا", "Abuja", 9.0765, 7.3986],
  ["KP", "PRK", "North Korea", "كوريا الشمالية", "Pyongyang", 39.0392, 125.7625, "dprk"],
  ["MK", "MKD", "North Macedonia", "مقدونيا الشمالية", "Skopje", 41.9981, 21.4254, "macedonia"],
  ["NO", "NOR", "Norway", "النرويج", "Oslo", 59.9139, 10.7522],
  ["OM", "OMN", "Oman", "عُمان", "Muscat", 23.588, 58.3829],
  ["PK", "PAK", "Pakistan", "باكستان", "Islamabad", 33.6844, 73.0479],
  ["PW", "PLW", "Palau", "بالاو", "Ngerulmud", 7.5006, 134.6242],
  ["PA", "PAN", "Panama", "بنما", "Panama City", 8.9824, -79.5199],
  ["PG", "PNG", "Papua New Guinea", "بابوا غينيا الجديدة", "Port Moresby", -9.4438, 147.1803],
  ["PY", "PRY", "Paraguay", "باراغواي", "Asunción", -25.2637, -57.5759],
  ["PE", "PER", "Peru", "بيرو", "Lima", -12.0464, -77.0428],
  ["PH", "PHL", "Philippines", "الفلبين", "Manila", 14.5995, 120.9842],
  ["PL", "POL", "Poland", "بولندا", "Warsaw", 52.2297, 21.0122],
  ["PT", "PRT", "Portugal", "البرتغال", "Lisbon", 38.7223, -9.1393],
  ["QA", "QAT", "Qatar", "قطر", "Doha", 25.2854, 51.531],
  ["RO", "ROU", "Romania", "رومانيا", "Bucharest", 44.4268, 26.1025],
  ["RU", "RUS", "Russia", "روسيا", "Moscow", 55.7558, 37.6173, "russian federation"],
  ["RW", "RWA", "Rwanda", "رواندا", "Kigali", -1.9441, 30.0619],
  ["KN", "KNA", "Saint Kitts and Nevis", "سانت كيتس ونيفيس", "Basseterre", 17.3026, -62.7177],
  ["LC", "LCA", "Saint Lucia", "سانت لوسيا", "Castries", 14.0101, -60.9875],
  ["VC", "VCT", "Saint Vincent and the Grenadines", "سانت فنسنت والغرينادين", "Kingstown", 13.16, -61.2248],
  ["WS", "WSM", "Samoa", "ساموا", "Apia", -13.8507, -171.7514],
  ["SM", "SMR", "San Marino", "سان مارينو", "San Marino", 43.9424, 12.4578],
  ["ST", "STP", "Sao Tome and Principe", "ساو تومي وبرينسيب", "São Tomé", 0.3302, 6.7333],
  ["SA", "SAU", "Saudi Arabia", "السعودية", "Riyadh", 24.7136, 46.6753, "ksa"],
  ["SN", "SEN", "Senegal", "السنغال", "Dakar", 14.7167, -17.4677],
  ["RS", "SRB", "Serbia", "صربيا", "Belgrade", 44.7866, 20.4489],
  ["SC", "SYC", "Seychelles", "سيشل", "Victoria", -4.6191, 55.4513],
  ["SL", "SLE", "Sierra Leone", "سيراليون", "Freetown", 8.4657, -13.2317],
  ["SG", "SGP", "Singapore", "سنغافورة", "Singapore", 1.3521, 103.8198],
  ["SK", "SVK", "Slovakia", "سلوفاكيا", "Bratislava", 48.1486, 17.1077],
  ["SI", "SVN", "Slovenia", "سلوفينيا", "Ljubljana", 46.0569, 14.5058],
  ["SB", "SLB", "Solomon Islands", "جزر سليمان", "Honiara", -9.4456, 159.9729],
  ["SO", "SOM", "Somalia", "الصومال", "Mogadishu", 2.0469, 45.3182],
  ["ZA", "ZAF", "South Africa", "جنوب أفريقيا", "Pretoria", -25.7479, 28.2293],
  ["KR", "KOR", "South Korea", "كوريا الجنوبية", "Seoul", 37.5665, 126.978, "korea"],
  ["SS", "SSD", "South Sudan", "جنوب السودان", "Juba", 4.8594, 31.5713],
  ["ES", "ESP", "Spain", "إسبانيا", "Madrid", 40.4168, -3.7038],
  ["LK", "LKA", "Sri Lanka", "سريلانكا", "Sri Jayawardenepura Kotte", 6.8868, 79.9187, "ceylon"],
  ["SD", "SDN", "Sudan", "السودان", "Khartoum", 15.5007, 32.5599],
  ["SR", "SUR", "Suriname", "سورينام", "Paramaribo", 5.852, -55.2038],
  ["SE", "SWE", "Sweden", "السويد", "Stockholm", 59.3293, 18.0686],
  ["CH", "CHE", "Switzerland", "سويسرا", "Bern", 46.948, 7.4474],
  ["SY", "SYR", "Syria", "سوريا", "Damascus", 33.5138, 36.2765],
  ["TJ", "TJK", "Tajikistan", "طاجيكستان", "Dushanbe", 38.5598, 68.787],
  ["TZ", "TZA", "Tanzania", "تنزانيا", "Dodoma", -6.163, 35.7516],
  ["TH", "THA", "Thailand", "تايلاند", "Bangkok", 13.7563, 100.5018],
  ["TL", "TLS", "Timor-Leste", "تيمور الشرقية", "Dili", -8.5569, 125.5603, "east timor"],
  ["TG", "TGO", "Togo", "توغو", "Lomé", 6.1725, 1.2314],
  ["TO", "TON", "Tonga", "تونغا", "Nukuʻalofa", -21.1394, -175.2018],
  ["TT", "TTO", "Trinidad and Tobago", "ترينيداد وتوباغو", "Port of Spain", 10.6549, -61.5019],
  ["TN", "TUN", "Tunisia", "تونس", "Tunis", 36.8065, 10.1815],
  ["TR", "TUR", "Türkiye", "تركيا", "Ankara", 39.9334, 32.8597, "turkey"],
  ["TM", "TKM", "Turkmenistan", "تركمانستان", "Ashgabat", 37.9601, 58.3261],
  ["TV", "TUV", "Tuvalu", "توفالو", "Funafuti", -8.5211, 179.1983],
  ["UG", "UGA", "Uganda", "أوغندا", "Kampala", 0.3476, 32.5825],
  ["UA", "UKR", "Ukraine", "أوكرانيا", "Kyiv", 50.4501, 30.5234],
  ["AE", "ARE", "United Arab Emirates", "الإمارات", "Abu Dhabi", 24.4539, 54.3773, "uae|emirates"],
  ["GB", "GBR", "United Kingdom", "المملكة المتحدة", "London", 51.5074, -0.1278, "uk|britain|england"],
  ["US", "USA", "United States", "الولايات المتحدة", "Washington, D.C.", 38.9072, -77.0369, "usa|america"],
  ["UY", "URY", "Uruguay", "الأوروغواي", "Montevideo", -34.9011, -56.1645],
  ["UZ", "UZB", "Uzbekistan", "أوزبكستان", "Tashkent", 41.2995, 69.2401],
  ["VU", "VUT", "Vanuatu", "فانواتو", "Port Vila", -17.7334, 168.3273],
  ["VE", "VEN", "Venezuela", "فنزويلا", "Caracas", 10.4806, -66.9036],
  ["VN", "VNM", "Vietnam", "فيتنام", "Hanoi", 21.0278, 105.8342],
  ["YE", "YEM", "Yemen", "اليمن", "Sanaa", 15.3694, 44.191],
  ["ZM", "ZMB", "Zambia", "زامبيا", "Lusaka", -15.3875, 28.3228],
  ["ZW", "ZWE", "Zimbabwe", "زيمبابوي", "Harare", -17.8252, 31.0335],
  ["VA", "VAT", "Holy See", "الفاتيكان", "Vatican City", 41.9029, 12.4534, "vatican"],
  ["PS", "PSE", "Palestine", "فلسطين", "Ramallah", 31.9038, 35.2034, "state of palestine"],
];

export function flagEmoji(alpha2: string): string {
  return String.fromCodePoint(...[...alpha2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export const COUNTRIES: Country[] = ROWS.map(([alpha2, alpha3, name, nameAr, capital, lat, lng, aliases]) => ({
  alpha2,
  alpha3,
  name,
  nameAr,
  capital,
  lat,
  lng,
  flag: flagEmoji(alpha2),
  aliases: aliases ? aliases.split("|") : [],
}));

export function getCountry(alpha2: string): Country | undefined {
  return COUNTRIES.find((c) => c.alpha2 === alpha2);
}

/** Strip accents/diacritics (Latin + Arabic tashkeel) for forgiving search. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

export function searchCountries(query: string, list: Country[] = COUNTRIES): Country[] {
  const q = normalize(query);
  if (!q) return list;
  return list.filter((c) =>
    [c.name, c.nameAr, c.capital, c.alpha2, c.alpha3, ...c.aliases].some((v) => normalize(v).includes(q)),
  );
}
