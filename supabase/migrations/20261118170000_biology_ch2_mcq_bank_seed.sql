-- Biology Chapter 2: Tissues (50 supplied English MCQs).
WITH questions AS (
  SELECT *
  FROM jsonb_to_recordset($questions$
  [
    {
      "sort_order": 1,
      "section": "Introduction and Plant Tissues",
      "question": "The science concerned with the study of tissues is called:",
      "choices": [
        "Cytology",
        "Histology",
        "Embryology",
        "Taxonomy"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 2,
      "section": "Introduction and Plant Tissues",
      "question": "Which meristematic tissue is found at the tips of roots and stems?",
      "choices": [
        "Lateral",
        "Intercalary",
        "Apical",
        "Ground"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 3,
      "section": "Introduction and Plant Tissues",
      "question": "Which meristematic tissue allows elongation at the nodes and rapid regrowth of mature leaves in grasses?",
      "choices": [
        "Apical",
        "Intercalary",
        "Lateral",
        "Vascular"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 4,
      "section": "Introduction and Plant Tissues",
      "question": "Lateral meristematic tissue consists of:",
      "choices": [
        "Xylem and phloem",
        "Parenchyma and collenchyma",
        "Vascular cambium and cork cambium",
        "Epidermis and cortex"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 5,
      "section": "Introduction and Plant Tissues",
      "question": "The periderm is produced by:",
      "choices": [
        "Vascular cambium",
        "Cork cambium",
        "Apical meristem",
        "Intercalary meristem"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 6,
      "section": "Introduction and Plant Tissues",
      "question": "The vascular cambium produces:",
      "choices": [
        "Secondary xylem and secondary phloem",
        "Periderm",
        "Guard cells",
        "Sclereids"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 7,
      "section": "Introduction and Plant Tissues",
      "question": "Which group contains only ground tissues?",
      "choices": [
        "Xylem, phloem, epidermis",
        "Parenchyma, collenchyma, sclerenchyma",
        "Apical, lateral, intercalary",
        "Sieve tubes, tracheids, fibers"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 8,
      "section": "Introduction and Plant Tissues",
      "question": "Parenchyma cells that contain chloroplasts are called:",
      "choices": [
        "Collenchyma",
        "Sclereids",
        "Chlorenchyma",
        "Tracheids"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 9,
      "section": "Introduction and Plant Tissues",
      "question": "Which feature is NOT true of parenchyma cells?",
      "choices": [
        "Living cells",
        "Thin cell walls",
        "Intercellular spaces present",
        "Dead cells with lignified walls"
      ],
      "answer_index": 3
    },
    {
      "sort_order": 10,
      "section": "Introduction and Plant Tissues",
      "question": "The primary supporting tissue in young, growing stems and leaves is:",
      "choices": [
        "Collenchyma",
        "Parenchyma",
        "Epidermis",
        "Phloem"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 11,
      "section": "Introduction and Plant Tissues",
      "question": "Collenchyma cells are:",
      "choices": [
        "Dead with thick lignified walls",
        "Living, elongated, with irregularly thickened walls",
        "Thin-walled, spherical, with large intercellular spaces",
        "Flat and tightly linked"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 12,
      "section": "Introduction and Plant Tissues",
      "question": "Sclerenchyma cells are dead at maturity because their walls contain:",
      "choices": [
        "Cellulose only",
        "Chlorophyll",
        "Lignin",
        "Starch"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 13,
      "section": "Introduction and Plant Tissues",
      "question": "The sclerenchyma cells found in fruits such as pears and quinces are:",
      "choices": [
        "Fibers",
        "Sclereids",
        "Tracheids",
        "Companion cells"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 14,
      "section": "Introduction and Plant Tissues",
      "question": "Which tissue has no intercellular spaces and regulates gas exchange through pairs of guard cells?",
      "choices": [
        "Epidermis",
        "Parenchyma",
        "Xylem",
        "Cortex"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 15,
      "section": "Introduction and Plant Tissues",
      "question": "The vascular tissue of plants includes:",
      "choices": [
        "Epidermis and cortex",
        "Xylem and phloem",
        "Parenchyma and collenchyma",
        "Apical and lateral tissue"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 16,
      "section": "Introduction and Plant Tissues",
      "question": "Which xylem cells are characterized by pointed endings?",
      "choices": [
        "Xylem vessels",
        "Xylem fibers",
        "Tracheids",
        "Sieve tubes"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 17,
      "section": "Introduction and Plant Tissues",
      "question": "Which cells of the phloem transport carbohydrates from and to the sieve tubes?",
      "choices": [
        "Companion cells",
        "Phloem fibers",
        "Tracheids",
        "Sclereids"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 18,
      "section": "Introduction and Plant Tissues",
      "question": "Phloem fibers function in:",
      "choices": [
        "Transporting nutrients",
        "Structural support",
        "Photosynthesis",
        "Gas exchange"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 19,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "Which is NOT one of the four main types of animal tissue?",
      "choices": [
        "Epithelial",
        "Connective",
        "Vascular",
        "Nervous"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 20,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "All epithelial cells rest on a:",
      "choices": [
        "Plasmic junction",
        "Basement membrane",
        "Sarcolemma",
        "Cell wall"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 21,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "Epithelial tissue is classified into simple and stratified according to:",
      "choices": [
        "The number of layers of cells",
        "The shape of the nucleus",
        "The presence of cilia",
        "The type of fibers"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 22,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "The tissue lining the lung vesicles and Malpighian corpuscles, which serves diffusion and filtration, is:",
      "choices": [
        "Simple cuboidal",
        "Simple columnar",
        "Simple squamous",
        "Transitional"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 23,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "Simple cuboidal epithelium is found in:",
      "choices": [
        "Kidney tubules and salivary glands",
        "Trachea",
        "Urinary bladder",
        "Mouth"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 24,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "Which epithelium has nuclei at different levels and may bear cilia, lining the trachea?",
      "choices": [
        "Simple columnar",
        "Stratified squamous",
        "Pseudo-stratified columnar",
        "Simple squamous"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 25,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "Stratified squamous epithelium is found in:",
      "choices": [
        "Mouth, esophagus and the epidermis of skin",
        "Kidney tubules",
        "Lining of the intestine",
        "Lymph nodes"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 26,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "Which epithelium lines the urinary bladder and can change shape as organs contract and expand?",
      "choices": [
        "Simple squamous",
        "Stratified cuboidal",
        "Pseudo-stratified columnar",
        "Transitional"
      ],
      "answer_index": 3
    },
    {
      "sort_order": 27,
      "section": "Animal Tissues and Epithelial Tissue",
      "question": "Stratified columnar epithelium is found in the lining of the:",
      "choices": [
        "Male urethra",
        "Intestine",
        "Trachea",
        "Kidney tubules"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 28,
      "section": "Connective Tissue",
      "question": "The connective tissue cell that stores fat and has a flattened peripheral nucleus is the:",
      "choices": [
        "Plasma cell",
        "Mast cell",
        "Adipose cell",
        "Fibroblast"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 29,
      "section": "Connective Tissue",
      "question": "The undifferentiated connective tissue cell able to differentiate into other cell types in adults is the:",
      "choices": [
        "Mesenchymal cell",
        "Macrophage",
        "Plasma cell",
        "Mast cell"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 30,
      "section": "Connective Tissue",
      "question": "Cells with a cartwheel (clock-face) arrangement of chromatin that secrete antibodies are:",
      "choices": [
        "Mast cells",
        "Plasma cells",
        "Fibroblasts",
        "Adipose cells"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 31,
      "section": "Connective Tissue",
      "question": "Mast cells contain histamine and also:",
      "choices": [
        "Chondromucin",
        "Thromboplastin",
        "Heparin",
        "Keratin"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 32,
      "section": "Connective Tissue",
      "question": "Which connective tissue fibers are found in bundles and resist tension strongly?",
      "choices": [
        "Reticular fibers",
        "Yellow elastic fibers",
        "White collagenous fibers",
        "Fibers of nerve cells"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 33,
      "section": "Connective Tissue",
      "question": "Reticular fibers form a fine network and provide support in:",
      "choices": [
        "Tendons",
        "Lymph nodes",
        "Ligaments",
        "Cartilage of the ear"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 34,
      "section": "Connective Tissue",
      "question": "Dense collagenous (white) connective tissue is found in:",
      "choices": [
        "Tendons and the dermis of the skin",
        "Ligaments only",
        "The umbilical cord",
        "Blood vessels only"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 35,
      "section": "Connective Tissue",
      "question": "Dense elastic connective tissue, dominated by yellow fibers, is found in:",
      "choices": [
        "Tendons",
        "Ligaments, such as the cervical ligament",
        "Bone marrow",
        "Skin dermis"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 36,
      "section": "Connective Tissue",
      "question": "Mucoid connective tissue, composed of star-like fibroblasts in a gelatinous substance, is found in the:",
      "choices": [
        "Umbilical cord",
        "Liver",
        "Trachea",
        "Intervertebral discs"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 37,
      "section": "Connective Tissue",
      "question": "The compound in cartilage that makes it resistant to pressure and tension is:",
      "choices": [
        "Heparin",
        "Histamine",
        "Chondromucin",
        "Lignin"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 38,
      "section": "Connective Tissue",
      "question": "Cartilage is classified into hyaline, white fibro-cartilage and elastic cartilage according to:",
      "choices": [
        "Its location only",
        "The abundance of fibers in its intercellular substance",
        "The number of nuclei",
        "Its color only"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 39,
      "section": "Connective Tissue",
      "question": "Which cartilage is found in the ear pinna, where elastic fibers dominate?",
      "choices": [
        "Hyaline cartilage",
        "White fibro-cartilage",
        "Elastic cartilage",
        "Bone"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 40,
      "section": "Connective Tissue",
      "question": "Bone is the hardest connective tissue because its intercellular substance contains:",
      "choices": [
        "Lignin",
        "Calcium phosphates and calcium carbonates",
        "Chondromucin",
        "Heparin"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 41,
      "section": "Connective Tissue",
      "question": "In compact bone, the canal through which blood vessels and nerves pass is the:",
      "choices": [
        "Haversian canal",
        "Volkmann's canal",
        "Trabecula",
        "Sarcolemma"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 42,
      "section": "Connective Tissue",
      "question": "Spongy bone differs from compact bone because its lamellae form:",
      "choices": [
        "Concentric rings around Haversian canals",
        "Irregular trabeculae with spaces filled by bone marrow",
        "Parallel layers around the surface only",
        "Thin sheets of cells"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 43,
      "section": "Blood, Muscle and Nervous Tissue",
      "question": "Blood platelets play an important role in:",
      "choices": [
        "Antibody secretion",
        "Oxygen transport",
        "Blood coagulation",
        "Digestion"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 44,
      "section": "Blood, Muscle and Nervous Tissue",
      "question": "Blood plasma is:",
      "choices": [
        "The cellular part of blood",
        "The intercellular substance of blood tissue",
        "A type of white blood cell",
        "The same as lymph in protein content"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 45,
      "section": "Blood, Muscle and Nervous Tissue",
      "question": "Compared with blood plasma, lymph has:",
      "choices": [
        "More protein and faster clotting",
        "Less protein and slower clotting",
        "No lymphocytes",
        "The same protein content and a hard clot"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 46,
      "section": "Blood, Muscle and Nervous Tissue",
      "question": "Which muscle is involuntary, with spindle-shaped fibers and no striations?",
      "choices": [
        "Skeletal muscle",
        "Cardiac muscle",
        "Smooth muscle",
        "Striated muscle"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 47,
      "section": "Blood, Muscle and Nervous Tissue",
      "question": "Muscle fibers that are long, cylindrical, striated and multinucleated with peripheral nuclei belong to:",
      "choices": [
        "Smooth muscle",
        "Skeletal muscle",
        "Cardiac muscle",
        "Both smooth and cardiac muscle"
      ],
      "answer_index": 1
    },
    {
      "sort_order": 48,
      "section": "Blood, Muscle and Nervous Tissue",
      "question": "Intercalated discs, which connect fibers end to end, are found in:",
      "choices": [
        "Skeletal muscle",
        "Smooth muscle",
        "Cardiac muscle",
        "Nervous tissue"
      ],
      "answer_index": 2
    },
    {
      "sort_order": 49,
      "section": "Blood, Muscle and Nervous Tissue",
      "question": "A neuron is composed of three parts, which are:",
      "choices": [
        "Cell body, dendrites and axon",
        "Nucleus, sarcolemma and axon",
        "Cell body, cilia and basement membrane",
        "Dendrites, fibers and plasma"
      ],
      "answer_index": 0
    },
    {
      "sort_order": 50,
      "section": "Blood, Muscle and Nervous Tissue",
      "question": "Neuroglia cells function mainly to:",
      "choices": [
        "Contract and relax",
        "Transport oxygen",
        "Support the neurons and phagocytose bacteria",
        "Secrete antibodies"
      ],
      "answer_index": 2
    }
  ]
  $questions$::jsonb) AS q(
    sort_order integer,
    section text,
    question text,
    choices jsonb,
    answer_index integer
  )
)
INSERT INTO public.mcq_banks (
  subject, chapter, chapter_title, section, language,
  question, choices, answer_index, explanation, source, tags, sort_order
)
SELECT
  'biology', 2, 'Tissues', questions.section, 'en',
  questions.question, questions.choices, questions.answer_index, NULL,
  'Uploaded Chapter 2 Tissues MCQ Practice', ARRAY[questions.section], 200 + questions.sort_order
FROM questions
WHERE NOT EXISTS (
  SELECT 1
  FROM public.mcq_banks AS existing
  WHERE existing.subject = 'biology'
    AND existing.chapter = 2
    AND existing.language = 'en'
    AND existing.question = questions.question
);
