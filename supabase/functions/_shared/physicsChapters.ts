export const physicsChapters = [
  { n: 1, title: "Capacitors", arTitle: "المتسعات", subtitle: "", locked: false },
  { n: 2, title: "Electromagnetic Induction", arTitle: "الحث الكهرومغناطيسي", subtitle: "", locked: false },
  { n: 3, title: "Alternating Current", arTitle: "التيار المتناوب", subtitle: "", locked: false },
  { n: 4, title: "Electromagnetic Waves", arTitle: "الموجات الكهرومغناطيسية", subtitle: "", locked: false },
  { n: 5, title: "Physical Optics", arTitle: "البصريات الفيزيائية", subtitle: "", locked: false },
  { n: 6, title: "Modern Physics", arTitle: "الفيزياء الحديثة", subtitle: "", locked: false },
  { n: 7, title: "Solid State Electronics", arTitle: "إلكترونيات الحالة الصلبة", subtitle: "", locked: false },
  { n: 8, title: "Atomic Spectra and Laser", arTitle: "الأطياف الذرية والليزر", subtitle: "", locked: false },
];

export const physicsChapter = (value: unknown) => physicsChapters.find(chapter => chapter.n === value);
