import { ARABIC_CHAPTER_TWO_QUESTIONS } from "@/lib/biologyChapter2ArabicMcqs";

// Built-in fallback for the supplied Biology Chapter 2 banks.
// The matching database migration remains the primary source after deployment.
export type BuiltInBiologyChapter2Row = {
  id: string;
  subject: "biology";
  chapter: 2;
  chapter_title: "Tissues" | "الأنسجة";
  question: string;
  choices: string[];
  answer_index: number;
  explanation: null;
  tags: string[];
};

type SourceQuestion = readonly [
  section: string,
  question: string,
  choices: readonly [string, string, string, string],
  answerIndex: number,
];

const ENGLISH_CHAPTER_TWO_QUESTIONS = [
  ["Introduction and Plant Tissues", "The science concerned with the study of tissues is called:", ["Cytology","Histology","Embryology","Taxonomy"], 1],
  ["Introduction and Plant Tissues", "Which meristematic tissue is found at the tips of roots and stems?", ["Lateral","Intercalary","Apical","Ground"], 2],
  ["Introduction and Plant Tissues", "Which meristematic tissue allows elongation at the nodes and rapid regrowth of mature leaves in grasses?", ["Apical","Intercalary","Lateral","Vascular"], 1],
  ["Introduction and Plant Tissues", "Lateral meristematic tissue consists of:", ["Xylem and phloem","Parenchyma and collenchyma","Vascular cambium and cork cambium","Epidermis and cortex"], 2],
  ["Introduction and Plant Tissues", "The periderm is produced by:", ["Vascular cambium","Cork cambium","Apical meristem","Intercalary meristem"], 1],
  ["Introduction and Plant Tissues", "The vascular cambium produces:", ["Secondary xylem and secondary phloem","Periderm","Guard cells","Sclereids"], 0],
  ["Introduction and Plant Tissues", "Which group contains only ground tissues?", ["Xylem, phloem, epidermis","Parenchyma, collenchyma, sclerenchyma","Apical, lateral, intercalary","Sieve tubes, tracheids, fibers"], 1],
  ["Introduction and Plant Tissues", "Parenchyma cells that contain chloroplasts are called:", ["Collenchyma","Sclereids","Chlorenchyma","Tracheids"], 2],
  ["Introduction and Plant Tissues", "Which feature is NOT true of parenchyma cells?", ["Living cells","Thin cell walls","Intercellular spaces present","Dead cells with lignified walls"], 3],
  ["Introduction and Plant Tissues", "The primary supporting tissue in young, growing stems and leaves is:", ["Collenchyma","Parenchyma","Epidermis","Phloem"], 0],
  ["Introduction and Plant Tissues", "Collenchyma cells are:", ["Dead with thick lignified walls","Living, elongated, with irregularly thickened walls","Thin-walled, spherical, with large intercellular spaces","Flat and tightly linked"], 1],
  ["Introduction and Plant Tissues", "Sclerenchyma cells are dead at maturity because their walls contain:", ["Cellulose only","Chlorophyll","Lignin","Starch"], 2],
  ["Introduction and Plant Tissues", "The sclerenchyma cells found in fruits such as pears and quinces are:", ["Fibers","Sclereids","Tracheids","Companion cells"], 1],
  ["Introduction and Plant Tissues", "Which tissue has no intercellular spaces and regulates gas exchange through pairs of guard cells?", ["Epidermis","Parenchyma","Xylem","Cortex"], 0],
  ["Introduction and Plant Tissues", "The vascular tissue of plants includes:", ["Epidermis and cortex","Xylem and phloem","Parenchyma and collenchyma","Apical and lateral tissue"], 1],
  ["Introduction and Plant Tissues", "Which xylem cells are characterized by pointed endings?", ["Xylem vessels","Xylem fibers","Tracheids","Sieve tubes"], 2],
  ["Introduction and Plant Tissues", "Which cells of the phloem transport carbohydrates from and to the sieve tubes?", ["Companion cells","Phloem fibers","Tracheids","Sclereids"], 0],
  ["Introduction and Plant Tissues", "Phloem fibers function in:", ["Transporting nutrients","Structural support","Photosynthesis","Gas exchange"], 1],
  ["Animal Tissues and Epithelial Tissue", "Which is NOT one of the four main types of animal tissue?", ["Epithelial","Connective","Vascular","Nervous"], 2],
  ["Animal Tissues and Epithelial Tissue", "All epithelial cells rest on a:", ["Plasmic junction","Basement membrane","Sarcolemma","Cell wall"], 1],
  ["Animal Tissues and Epithelial Tissue", "Epithelial tissue is classified into simple and stratified according to:", ["The number of layers of cells","The shape of the nucleus","The presence of cilia","The type of fibers"], 0],
  ["Animal Tissues and Epithelial Tissue", "The tissue lining the lung vesicles and Malpighian corpuscles, which serves diffusion and filtration, is:", ["Simple cuboidal","Simple columnar","Simple squamous","Transitional"], 2],
  ["Animal Tissues and Epithelial Tissue", "Simple cuboidal epithelium is found in:", ["Kidney tubules and salivary glands","Trachea","Urinary bladder","Mouth"], 0],
  ["Animal Tissues and Epithelial Tissue", "Which epithelium has nuclei at different levels and may bear cilia, lining the trachea?", ["Simple columnar","Stratified squamous","Pseudo-stratified columnar","Simple squamous"], 2],
  ["Animal Tissues and Epithelial Tissue", "Stratified squamous epithelium is found in:", ["Mouth, esophagus and the epidermis of skin","Kidney tubules","Lining of the intestine","Lymph nodes"], 0],
  ["Animal Tissues and Epithelial Tissue", "Which epithelium lines the urinary bladder and can change shape as organs contract and expand?", ["Simple squamous","Stratified cuboidal","Pseudo-stratified columnar","Transitional"], 3],
  ["Animal Tissues and Epithelial Tissue", "Stratified columnar epithelium is found in the lining of the:", ["Male urethra","Intestine","Trachea","Kidney tubules"], 0],
  ["Connective Tissue", "The connective tissue cell that stores fat and has a flattened peripheral nucleus is the:", ["Plasma cell","Mast cell","Adipose cell","Fibroblast"], 2],
  ["Connective Tissue", "The undifferentiated connective tissue cell able to differentiate into other cell types in adults is the:", ["Mesenchymal cell","Macrophage","Plasma cell","Mast cell"], 0],
  ["Connective Tissue", "Cells with a cartwheel (clock-face) arrangement of chromatin that secrete antibodies are:", ["Mast cells","Plasma cells","Fibroblasts","Adipose cells"], 1],
  ["Connective Tissue", "Mast cells contain histamine and also:", ["Chondromucin","Thromboplastin","Heparin","Keratin"], 2],
  ["Connective Tissue", "Which connective tissue fibers are found in bundles and resist tension strongly?", ["Reticular fibers","Yellow elastic fibers","White collagenous fibers","Fibers of nerve cells"], 2],
  ["Connective Tissue", "Reticular fibers form a fine network and provide support in:", ["Tendons","Lymph nodes","Ligaments","Cartilage of the ear"], 1],
  ["Connective Tissue", "Dense collagenous (white) connective tissue is found in:", ["Tendons and the dermis of the skin","Ligaments only","The umbilical cord","Blood vessels only"], 0],
  ["Connective Tissue", "Dense elastic connective tissue, dominated by yellow fibers, is found in:", ["Tendons","Ligaments, such as the cervical ligament","Bone marrow","Skin dermis"], 1],
  ["Connective Tissue", "Mucoid connective tissue, composed of star-like fibroblasts in a gelatinous substance, is found in the:", ["Umbilical cord","Liver","Trachea","Intervertebral discs"], 0],
  ["Connective Tissue", "The compound in cartilage that makes it resistant to pressure and tension is:", ["Heparin","Histamine","Chondromucin","Lignin"], 2],
  ["Connective Tissue", "Cartilage is classified into hyaline, white fibro-cartilage and elastic cartilage according to:", ["Its location only","The abundance of fibers in its intercellular substance","The number of nuclei","Its color only"], 1],
  ["Connective Tissue", "Which cartilage is found in the ear pinna, where elastic fibers dominate?", ["Hyaline cartilage","White fibro-cartilage","Elastic cartilage","Bone"], 2],
  ["Connective Tissue", "Bone is the hardest connective tissue because its intercellular substance contains:", ["Lignin","Calcium phosphates and calcium carbonates","Chondromucin","Heparin"], 1],
  ["Connective Tissue", "In compact bone, the canal through which blood vessels and nerves pass is the:", ["Haversian canal","Volkmann's canal","Trabecula","Sarcolemma"], 0],
  ["Connective Tissue", "Spongy bone differs from compact bone because its lamellae form:", ["Concentric rings around Haversian canals","Irregular trabeculae with spaces filled by bone marrow","Parallel layers around the surface only","Thin sheets of cells"], 1],
  ["Blood, Muscle and Nervous Tissue", "Blood platelets play an important role in:", ["Antibody secretion","Oxygen transport","Blood coagulation","Digestion"], 2],
  ["Blood, Muscle and Nervous Tissue", "Blood plasma is:", ["The cellular part of blood","The intercellular substance of blood tissue","A type of white blood cell","The same as lymph in protein content"], 1],
  ["Blood, Muscle and Nervous Tissue", "Compared with blood plasma, lymph has:", ["More protein and faster clotting","Less protein and slower clotting","No lymphocytes","The same protein content and a hard clot"], 1],
  ["Blood, Muscle and Nervous Tissue", "Which muscle is involuntary, with spindle-shaped fibers and no striations?", ["Skeletal muscle","Cardiac muscle","Smooth muscle","Striated muscle"], 2],
  ["Blood, Muscle and Nervous Tissue", "Muscle fibers that are long, cylindrical, striated and multinucleated with peripheral nuclei belong to:", ["Smooth muscle","Skeletal muscle","Cardiac muscle","Both smooth and cardiac muscle"], 1],
  ["Blood, Muscle and Nervous Tissue", "Intercalated discs, which connect fibers end to end, are found in:", ["Skeletal muscle","Smooth muscle","Cardiac muscle","Nervous tissue"], 2],
  ["Blood, Muscle and Nervous Tissue", "A neuron is composed of three parts, which are:", ["Cell body, dendrites and axon","Nucleus, sarcolemma and axon","Cell body, cilia and basement membrane","Dendrites, fibers and plasma"], 0],
  ["Blood, Muscle and Nervous Tissue", "Neuroglia cells function mainly to:", ["Contract and relax","Transport oxygen","Support the neurons and phagocytose bacteria","Secrete antibodies"], 2],
] as const satisfies readonly SourceQuestion[];

/** Return the supplied source bank that matches the selected interface language. */
export const getBuiltInBiologyChapter2 = (language: "ar" | "en"): BuiltInBiologyChapter2Row[] => {
  const questions = language === "ar" ? ARABIC_CHAPTER_TWO_QUESTIONS : ENGLISH_CHAPTER_TWO_QUESTIONS;
  const chapterTitle: BuiltInBiologyChapter2Row["chapter_title"] = language === "ar" ? "الأنسجة" : "Tissues";

  return questions.map(([section, question, choices, answerIndex], index): BuiltInBiologyChapter2Row => ({
    id: `builtin-biology-2-${language}-${String(index + 1).padStart(2, "0")}`,
    subject: "biology",
    chapter: 2,
    chapter_title: chapterTitle,
    question,
    choices: [...choices],
    answer_index: answerIndex,
    explanation: null,
    tags: [section],
  }));
};
