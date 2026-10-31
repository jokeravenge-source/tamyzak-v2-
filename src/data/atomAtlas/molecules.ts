import type { Bi } from "./types";

export type MoleculeKind = "covalent-molecule" | "element-molecule" | "ionic-lattice";

export interface Atom3D { el: string; x: number; y: number; z: number; charge?: "+" | "-" }

export interface Molecule {
  id: string;
  formula: string;
  /** Formula with unicode subscripts for display. */
  display: string;
  name: Bi;
  kind: MoleculeKind;
  geometry: Bi;
  bondType: Bi;
  angle?: string;
  about: Bi;
  composition: Record<string, number>;
  atoms: Atom3D[];
  bonds: [number, number, 1 | 2 | 3][];
  pubchemCid: number;
}

const t = 0.63; // tetrahedral offset for CH4 (approx. 1.09 Å C–H)

function nacl(): { atoms: Atom3D[]; bonds: [number, number, 1][] } {
  const atoms: Atom3D[] = [];
  const s = 1.3;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) {
        const na = (i + j + k + 3) % 2 === 0;
        atoms.push({ el: na ? "Na" : "Cl", x: i * s, y: j * s, z: k * s, charge: na ? "+" : "-" });
      }
  // Lines here show neighbour contacts in the lattice, NOT covalent bonds.
  const bonds: [number, number, 1][] = [];
  atoms.forEach((a, i) => atoms.forEach((b, j) => {
    if (j > i && Math.abs(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) - s) < 0.01) bonds.push([i, j, 1]);
  }));
  return { atoms, bonds };
}

const lattice = nacl();

export const MOLECULES: Molecule[] = [
  {
    id: "water", formula: "H2O", display: "H₂O", name: { en: "Water", ar: "الماء" }, kind: "covalent-molecule",
    geometry: { en: "Bent", ar: "منحنٍ (زاوي)" }, bondType: { en: "Polar covalent (O–H)", ar: "تساهمية قطبية (O–H)" }, angle: "≈104.5°",
    about: { en: "Two lone pairs on oxygen push the hydrogen atoms together, giving a bent, polar molecule. This polarity explains hydrogen bonding and water's high boiling point.", ar: "يدفع زوجا الإلكترونات غير الرابطة على الأكسجين ذرتي الهيدروجين، فيصبح الجزيء منحنيًا وقطبيًا. تفسّر هذه القطبية الروابط الهيدروجينية وارتفاع درجة غليان الماء." },
    composition: { H: 2, O: 1 }, pubchemCid: 962,
    atoms: [{ el: "O", x: 0, y: -0.2, z: 0 }, { el: "H", x: -0.76, y: 0.39, z: 0 }, { el: "H", x: 0.76, y: 0.39, z: 0 }],
    bonds: [[0, 1, 1], [0, 2, 1]],
  },
  {
    id: "carbon-dioxide", formula: "CO2", display: "CO₂", name: { en: "Carbon dioxide", ar: "ثاني أكسيد الكربون" }, kind: "covalent-molecule",
    geometry: { en: "Linear", ar: "خطي" }, bondType: { en: "Polar covalent double bonds (C=O)", ar: "روابط تساهمية ثنائية قطبية (C=O)" }, angle: "180°",
    about: { en: "Carbon forms two double bonds with no lone pairs, so the molecule is linear. The two bond dipoles cancel, so CO₂ is non-polar overall.", ar: "يكوّن الكربون رابطتين ثنائيتين دون أزواج حرة، فيكون الجزيء خطيًا. تلغي القطبيتان بعضهما، فيصبح CO₂ غير قطبي إجمالًا." },
    composition: { C: 1, O: 2 }, pubchemCid: 280,
    atoms: [{ el: "C", x: 0, y: 0, z: 0 }, { el: "O", x: -1.16, y: 0, z: 0 }, { el: "O", x: 1.16, y: 0, z: 0 }],
    bonds: [[0, 1, 2], [0, 2, 2]],
  },
  {
    id: "oxygen", formula: "O2", display: "O₂", name: { en: "Oxygen (dioxygen)", ar: "الأكسجين (ثنائي الأكسجين)" }, kind: "element-molecule",
    geometry: { en: "Linear (diatomic)", ar: "خطي (ثنائي الذرة)" }, bondType: { en: "Non-polar covalent double bond", ar: "رابطة تساهمية ثنائية غير قطبية" },
    about: { en: "Two oxygen atoms share two pairs of electrons. O₂ is a molecule of an element, not a compound.", ar: "تتشارك ذرتا أكسجين في زوجين من الإلكترونات. ‏O₂ جزيء عنصر وليس مركّبًا." },
    composition: { O: 2 }, pubchemCid: 977,
    atoms: [{ el: "O", x: -0.6, y: 0, z: 0 }, { el: "O", x: 0.6, y: 0, z: 0 }], bonds: [[0, 1, 2]],
  },
  {
    id: "nitrogen", formula: "N2", display: "N₂", name: { en: "Nitrogen (dinitrogen)", ar: "النيتروجين (ثنائي النيتروجين)" }, kind: "element-molecule",
    geometry: { en: "Linear (diatomic)", ar: "خطي (ثنائي الذرة)" }, bondType: { en: "Non-polar covalent triple bond", ar: "رابطة تساهمية ثلاثية غير قطبية" },
    about: { en: "The N≡N triple bond is one of the strongest chemical bonds, which is why atmospheric nitrogen is so unreactive.", ar: "الرابطة الثلاثية N≡N من أقوى الروابط الكيميائية، ولهذا يكون نيتروجين الجو قليل النشاط." },
    composition: { N: 2 }, pubchemCid: 947,
    atoms: [{ el: "N", x: -0.55, y: 0, z: 0 }, { el: "N", x: 0.55, y: 0, z: 0 }], bonds: [[0, 1, 3]],
  },
  {
    id: "hydrogen", formula: "H2", display: "H₂", name: { en: "Hydrogen (dihydrogen)", ar: "الهيدروجين (ثنائي الهيدروجين)" }, kind: "element-molecule",
    geometry: { en: "Linear (diatomic)", ar: "خطي (ثنائي الذرة)" }, bondType: { en: "Non-polar covalent single bond", ar: "رابطة تساهمية أحادية غير قطبية" },
    about: { en: "The simplest molecule: two hydrogen atoms sharing one pair of electrons.", ar: "أبسط جزيء: ذرتا هيدروجين تتشاركان في زوج واحد من الإلكترونات." },
    composition: { H: 2 }, pubchemCid: 783,
    atoms: [{ el: "H", x: -0.37, y: 0, z: 0 }, { el: "H", x: 0.37, y: 0, z: 0 }], bonds: [[0, 1, 1]],
  },
  {
    id: "methane", formula: "CH4", display: "CH₄", name: { en: "Methane", ar: "الميثان" }, kind: "covalent-molecule",
    geometry: { en: "Tetrahedral", ar: "رباعي الأوجه" }, bondType: { en: "Covalent (C–H)", ar: "تساهمية (C–H)" }, angle: "≈109.5°",
    about: { en: "Four bonding pairs around carbon spread out as far as possible, forming a tetrahedron. Methane is the main component of natural gas.", ar: "تتباعد أزواج الروابط الأربعة حول الكربون أقصى ما يمكن مكوّنة شكلًا رباعي الأوجه. الميثان المكوّن الرئيس للغاز الطبيعي." },
    composition: { C: 1, H: 4 }, pubchemCid: 297,
    atoms: [{ el: "C", x: 0, y: 0, z: 0 }, { el: "H", x: t, y: t, z: t }, { el: "H", x: -t, y: -t, z: t }, { el: "H", x: -t, y: t, z: -t }, { el: "H", x: t, y: -t, z: -t }],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
  },
  {
    id: "ammonia", formula: "NH3", display: "NH₃", name: { en: "Ammonia", ar: "الأمونيا" }, kind: "covalent-molecule",
    geometry: { en: "Trigonal pyramidal", ar: "هرمي ثلاثي" }, bondType: { en: "Polar covalent (N–H)", ar: "تساهمية قطبية (N–H)" }, angle: "≈107°",
    about: { en: "Three bonding pairs and one lone pair on nitrogen give a pyramid shape. Ammonia is produced industrially for fertilisers.", ar: "ثلاثة أزواج رابطة وزوج حر على النيتروجين تعطي شكلًا هرميًا. تُنتج الأمونيا صناعيًا لصناعة الأسمدة." },
    composition: { N: 1, H: 3 }, pubchemCid: 222,
    atoms: [{ el: "N", x: 0, y: -0.3, z: 0 }, { el: "H", x: 0.94, y: 0.08, z: 0 }, { el: "H", x: -0.47, y: 0.08, z: 0.81 }, { el: "H", x: -0.47, y: 0.08, z: -0.81 }],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
  },
  {
    id: "hydrogen-chloride", formula: "HCl", display: "HCl", name: { en: "Hydrogen chloride", ar: "كلوريد الهيدروجين" }, kind: "covalent-molecule",
    geometry: { en: "Linear (diatomic)", ar: "خطي (ثنائي الذرة)" }, bondType: { en: "Polar covalent", ar: "تساهمية قطبية" },
    about: { en: "Chlorine is more electronegative than hydrogen, so the shared electrons are pulled toward Cl, making the molecule polar.", ar: "الكلور أعلى سالبية كهربائية من الهيدروجين، فتنجذب الإلكترونات المشتركة نحوه ويصبح الجزيء قطبيًا." },
    composition: { H: 1, Cl: 1 }, pubchemCid: 313,
    atoms: [{ el: "H", x: -0.64, y: 0, z: 0 }, { el: "Cl", x: 0.64, y: 0, z: 0 }], bonds: [[0, 1, 1]],
  },
  {
    id: "ethene", formula: "C2H4", display: "C₂H₄", name: { en: "Ethene (ethylene)", ar: "الإيثين (الإيثيلين)" }, kind: "covalent-molecule",
    geometry: { en: "Trigonal planar at each carbon (planar molecule)", ar: "مثلث مستوٍ حول كل كربون (جزيء مستوٍ)" }, bondType: { en: "Covalent, including a C=C double bond", ar: "تساهمية، وتشمل رابطة ثنائية C=C" }, angle: "≈120°",
    about: { en: "Each carbon has three electron domains, so all six atoms lie in one plane. Ethene is the building block of polyethylene.", ar: "لكل كربون ثلاث مناطق إلكترونية، فتقع الذرات الست في مستوى واحد. الإيثين وحدة بناء البولي إيثيلين." },
    composition: { C: 2, H: 4 }, pubchemCid: 6325,
    atoms: [{ el: "C", x: -0.67, y: 0, z: 0 }, { el: "C", x: 0.67, y: 0, z: 0 }, { el: "H", x: -1.23, y: 0.92, z: 0 }, { el: "H", x: -1.23, y: -0.92, z: 0 }, { el: "H", x: 1.23, y: 0.92, z: 0 }, { el: "H", x: 1.23, y: -0.92, z: 0 }],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
  },
  {
    id: "sodium-chloride", formula: "NaCl", display: "NaCl", name: { en: "Sodium chloride", ar: "كلوريد الصوديوم" }, kind: "ionic-lattice",
    geometry: { en: "Face-centred cubic (rock-salt) lattice", ar: "شبكة مكعبة متمركزة الأوجه (بنية الملح الصخري)" }, bondType: { en: "Ionic (Na⁺ and Cl⁻)", ar: "أيونية (Na⁺ و Cl⁻)" },
    about: { en: "NaCl is not made of separate molecules. It is a giant lattice of Na⁺ and Cl⁻ ions; each ion is surrounded by six of the opposite charge. The formula gives the 1 : 1 ratio. Lines in the model show neighbouring ions, not shared-electron bonds.", ar: "لا يتكوّن NaCl من جزيئات منفصلة، بل من شبكة ضخمة من أيونات Na⁺ و Cl⁻؛ يحيط بكل أيون ستة أيونات مخالفة الشحنة. تعبّر الصيغة عن النسبة 1 : 1. الخطوط في النموذج تُظهر الأيونات المتجاورة لا روابط مشتركة الإلكترونات." },
    composition: { Na: 1, Cl: 1 }, pubchemCid: 5234,
    atoms: lattice.atoms, bonds: lattice.bonds,
  },
  {
    id: "magnesium-oxide", formula: "MgO", display: "MgO", name: { en: "Magnesium oxide", ar: "أكسيد المغنيسيوم" }, kind: "ionic-lattice",
    geometry: { en: "Rock-salt lattice (same arrangement as NaCl)", ar: "شبكة الملح الصخري (نفس ترتيب NaCl)" }, bondType: { en: "Ionic (Mg²⁺ and O²⁻)", ar: "أيونية (Mg²⁺ و O²⁻)" },
    about: { en: "Mg²⁺ and O²⁻ ions carry double charges, so the attraction is stronger than in NaCl, giving MgO a very high melting point.", ar: "تحمل أيونات Mg²⁺ و O²⁻ شحنات مضاعفة، فيكون التجاذب أقوى منه في NaCl، ولذا فدرجة انصهار MgO عالية جدًا." },
    composition: { Mg: 1, O: 1 }, pubchemCid: 14792,
    atoms: lattice.atoms.map((a) => ({ ...a, el: a.el === "Na" ? "Mg" : "O" })), bonds: lattice.bonds,
  },
];

export const KIND_LABEL: Record<MoleculeKind, Bi> = {
  "covalent-molecule": { en: "Covalent compound (molecule)", ar: "مركّب تساهمي (جزيء)" },
  "element-molecule": { en: "Molecule of an element", ar: "جزيء عنصر" },
  "ionic-lattice": { en: "Ionic compound (crystal lattice)", ar: "مركّب أيوني (شبكة بلورية)" },
};

export const getMolecule = (id: string) => MOLECULES.find((m) => m.id === id);

