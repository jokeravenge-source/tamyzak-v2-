import type { NadiaBuiltInMcqSet } from "./nadiaEnglishTopicMcqs";
import { getNadiaTopicTitle } from "./nadiaTeacherContent";

type SuppliedQuestion = {
  sourceSection: string;
  sourceNumber: number;
  question: string;
  choices: string[];
  answer_index: number;
};

// Supplied questions for Nadia Al-Nuaimy, organized by the current English topic IDs.
// Source numbering is retained because it restarts in each supplied section.
const q = (sourceSection: string, sourceNumber: number, question: string, choices: string[], answer_index = 1): SuppliedQuestion =>
  ({ sourceSection, sourceNumber, question, choices, answer_index });

export const nadiaEnglishChapter1SuppliedQuestions: Record<number, SuppliedQuestion[]> = {
  1: [
    q("cells", 1, "What are cells in terms of the structural composition of all living organisms?", [
      "They are non-cellular structures representing a link between living and non-living matter.",
      "Cells are considered the basic units of all living organisms.",
      "They are vascular parts specialized for absorbing water from the environment.",
      "They are protoplasmic masses that move randomly and lack a nucleus.",
    ]),
    q("cells", 2, "What are the two main types of cells based on structure?", [
      "Plant cells and animal cells.", "Prokaryotic cells and eukaryotic cells.",
      "Embryonic cells and adult cells.", "Autotrophic cells and parasitic cells.",
    ]),
    q("cells", 3, "What distinguishes a prokaryotic cell regarding its nucleus and organelles?", [
      "It has a distinct nucleus surrounded by a nuclear membrane and contains mitochondria.",
      "It lacks a nuclear membrane and nucleolus; its DNA occupies a nucleoid or nuclear region, and it lacks membrane-bound organelles such as Golgi bodies and mitochondria.",
      "It contains cup-shaped chloroplasts and a kinetosome.",
      "It contains 40 hydrolytic enzymes in the cytoplasm.",
    ]),
    q("cells", 4, "What distinguishes a typical eukaryotic cell?", [
      "It has a distinct nucleus surrounded by a nuclear membrane and possesses cell organelles.",
      "It completely lacks a plasma membrane and consists only of a cell wall.",
      "It contains a floating nuclear region without ribosomes.",
      "It is limited only to prokaryotic organisms such as bacteria.",
    ], 0),
    q("cells", 5, "Who was the first person to use the word 'cell'?", [
      "Antonie van Leeuwenhoek", "Robert Hooke", "Robert Brown", "Matthias Schleiden",
    ]),
    q("cells", 6, "How did Robert Hooke describe the small compartments he observed in cork?", [
      "As a mass of cytoplasm containing a circular nucleus in the center.",
      "As small, empty chambers resembling the compartments of a honeycomb.",
      "As a basal body that moves via cilia.",
      "As a free-floating protoplasmic sac that divides by binary fission.",
    ]),
    q("cells", 7, "Which scientist discovered and described the cell nucleus in 1831?", [
      "Robert Hooke", "Robert Brown", "Theodor Schwann", "Matthias Schleiden",
    ]),
    q("cells", 8, "What scientific achievement did Matthias Schleiden present in 1838?", [
      "He announced that all animals are composed of cells.",
      "He concluded that all plants are composed of cells.",
      "He built the first simple microscope to examine microorganisms.",
      "He discovered the phenomenon of recombination in colon bacteria.",
    ]),
    q("cells", 9, "What scientific achievement did Theodor Schwann announce in 1839?", [
      "He announced that all animals are composed of cells.",
      "He concluded that all plants are composed of cells.",
      "He described the nuclear membrane surrounding the nuclear region.",
      "He demonstrated that viruses are non-cellular, free-floating structures.",
    ], 0),
    q("cells", 10, "Which two scientists' work formed the basis of the Cell Theory?", [
      "Robert Hooke and Robert Brown", "Matthias Schleiden and Theodor Schwann",
      "Camillo Golgi and van Leeuwenhoek", "Rudolf Virchow and Antonie van Leeuwenhoek",
    ]),
    q("cells", 11, "What are the three fundamental principles of the Cell Theory?", [
      "Organisms reproduce sexually; cells die via autolysis; the nucleus contains chromosomes.",
      "All living organisms are composed of cells; cells are the basic structural and functional units of living organisms; new cells arise from pre-existing cells by cell division.",
      "Cells contain vacuoles; the cell wall is composed of cellulose; plasmids transfer genes.",
      "All cells are visible to the naked eye; cells divide amitotically; the plasma membrane is rigid.",
    ]),
  ],
  2: [
    q("prokaryotes", 1, "What makes the organization of prokaryotic cells simpler than that of typical eukaryotic cells?", [
      "They decompose rapidly outside the organism's body.",
      "They lack a membrane-bound nucleus and membrane-bound organelles.",
      "They completely lack genetic material (DNA).",
      "They cannot move in liquid media.",
    ]),
    q("prokaryotes", 2, "What is the DNA-containing region of a prokaryotic cell called?", [
      "A free nucleolus.", "The nuclear region or nucleoid, which is not enclosed by a nuclear membrane.",
      "An integrated reproductive plasmid.", "An internal kinetosome.",
    ]),
    q("prokaryotes", 3, "What does the cytoplasm of a prokaryotic cell contain, and what is the function of its ribosomes?", [
      "Mitochondria for ATP energy production.",
      "A nuclear region and ribosomes, which appear as numerous small granules and synthesize proteins.",
      "The Golgi apparatus for secreting complex sugars.",
      "Large contractile vacuoles for water regulation.",
    ]),
    q("prokaryotes", 4, "In the traditional five-kingdom classification used by the curriculum, which group contains prokaryotes?", [
      "Kingdom Fungi, such as black bread mold.",
      "Kingdom Monera, including bacteria, cyanobacteria (blue-green algae), and mycoplasmas.",
      "Kingdom Protista, such as Paramecium and Euglena.", "Viruses or bacteriophages.",
    ]),
    q("prokaryotes", 5, "What is the principal structural component of the rigid cell wall in most bacteria?", [
      "Cellulose and lignin.", "Peptidoglycan, consisting of polysaccharide chains cross-linked by short peptides.",
      "Pure amino acids and phospholipids only.", "Chitin and animal glycogen.",
    ]),
    q("prokaryotes", 6, "What structure lies internal to the bacterial cell wall, and what is its function?", [
      "The thick outer capsule.",
      "The plasma membrane, a selectively permeable membrane surrounding the cytoplasm.",
      "The nuclear envelope that secretes ribosomes.", "The hardened fibrous middle layer.",
    ]),
    q("prokaryotes", 7, "Which bacterial appendages may be used for movement or conjugation?", [
      "Cilia, hooks, and a reproductive pad.",
      "Flagella for movement and sex pili for conjugation.",
      "Sensory receptors and thick cellulose spines.", "Delicate, mucus-secreting vascular wings.",
    ]),
    q("bacteria", 1, "What does each bacterial cell represent?", [
      "A multicellular primitive organism possessing a nuclear membrane.",
      "A prokaryotic organism consisting of a single cell.",
      "A non-cellular structure that reproduces only inside a host.",
      "An organism completely lacking genetic material.",
    ]),
    q("bacteria", 2, "In a typical bacterium with a cell wall, what surrounds and protects its internal components?", [
      "An external protein coat that secretes lytic enzymes.",
      "A rigid cell wall with a plasma membrane immediately inside it.",
      "A thin protective membrane lacking complex chemical compounds.",
      "A viscous layer of cellulose and hardened lignin.",
    ]),
    q("bacteria", 3, "How is the plasma membrane located inside the bacterial cell wall described?", [
      "A rigid, impermeable membrane that prevents the passage of water molecules.",
      "A selectively permeable membrane surrounding the cytoplasm.",
      "A double envelope containing minute germination pores.",
      "A fibrous connective tissue rich in collagen molecules.",
    ]),
    q("bacteria", 4, "Which structures form the basic cell envelope of a typical bacterium with a cell wall?", [
      "The nuclear envelope and chromatin network.", "The cell wall and the plasma membrane.",
      "The rigid capsule and sex pili only.", "The outer membrane that secretes albumin.",
    ]),
    q("bacteria", 5, "Which of the following represents the cytoplasmic contents of a bacterial cell?", [
      "Mitochondria and endoplasmic reticulum.", "A nuclear region and ribosomes.",
      "Golgi apparatus and contractile vacuoles.", "A distinct nucleolus and nuclear envelope.",
    ]),
    q("bacteria", 6, "Which appendages may a bacterial cell possess to aid movement or conjugation?", [
      "Sensors, spines, and a genital pad.", "Flagella for movement and sex pili for conjugation.",
      "Microfilaments and fibrous microtubules.", "Vascular wings and a muscular closing valve.",
    ]),
  ],
  3: [
    q("eukaryotes", 1, "What are typical eukaryotic cells?", [
      "Cells that lack a nuclear membrane and are found in bacteria and mycoplasma.",
      "Cells with a true, membrane-bound nucleus, found in protists, fungi, plants, and animals.",
      "Non-cellular structures representing a link between living and non-living matter.",
      "Cells lacking membrane-bound organelles.",
    ]),
    q("eukaryotes", 2, "What are the general shapes of eukaryotic cells?", [
      "Spherical and constant across all living organisms.",
      "Variable: some have fixed shapes such as spherical, pyramidal, tubular, cuboidal, columnar, oval, flat, stellate, or spindle-shaped; others change shape over time.",
      "Branched, filamentous shapes that always contain cellulose and lignin molecules.",
      "Permanently circular shapes containing cup-shaped plastids.",
    ]),
    q("eukaryotes", 3, "Which is an example of a eukaryotic cell with a non-fixed shape that changes over time?", [
      "Mature red blood cells.", "Amoeba.", "Paramecium.", "Bacteria.",
    ]),
    q("eukaryotes", 4, "Why can some eukaryotic cells, such as Amoeba, change their shape?", [
      "Their outer cell wall breaks down due to harsh environmental conditions.",
      "Changes in shape support functions such as movement and feeding.",
      "They lack photosynthetic pigments and enzymatic systems in the cytoplasm.",
      "The embryo consumes the endosperm tissue during reproductive development.",
    ]),
    q("eukaryotes", 5, "What is the general size of eukaryotic cells, and do they require a microscope to be seen?", [
      "They are very large and can always be seen with the naked eye.",
      "Most are microscopic and generally larger than prokaryotic cells.",
      "They are much smaller in size than viruses and mycoplasma.",
      "They have a fixed size of 100 millimeters in all living tissues.",
    ]),
    q("eukaryotes", 6, "Why do eukaryotic cells require an adequate plasma-membrane surface area?", [
      "To enable direct division without chromosomal changes.",
      "To exchange materials with the surrounding environment appropriately.",
      "To prevent excess sperm from entering the embryo sac.",
      "To store carbohydrates in the form of solid animal starch.",
    ]),
    q("eukaryotes", 7, "What are the main components of typical plant and animal eukaryotic cells?", [
      "A nuclear region, ribosomes, and sex pili.",
      "A cell wall and plasma membrane in plant cells, a plasma membrane without a cell wall in animal cells, cytoplasm, and a nucleus.",
      "Chloroplasts, mitochondria, and contractile vacuoles only.",
      "A protein coat, hybrid nucleic acids, and rigid mid-sections.",
    ]),
  ],
  5: [
    q("cytoplasm-er", 1, "Where is the cytoplasm located in a typical eukaryotic cell?", [
      "Outside the rigid cell wall, surrounding the cell.",
      "Between the plasma membrane and the nucleus.",
      "Exclusively inside the nucleolus for storing RNA molecules.",
      "Inside the contractile vacuole to regulate water.",
    ]),
    q("cytoplasm-er", 2, "What approximate percentage of the cytoplasm is water in the textbook's simplified composition?", [
      "50%", "80%", "15%", "5%",
    ]),
    q("cytoplasm-er", 3, "What is the textbook's simplified chemical composition of the cytoplasm?", [
      "80% proteins, 15% water, and 5% lipids and sugars.",
      "80% water, 15% proteins, and 5% fats, sugars, and salts.",
      "90% cellulose, 5% lignin, and 5% amino acids.",
      "60% phospholipids and 40% complex carbohydrates.",
    ]),
    q("cytoplasm-er", 4, "What does the cytoplasm contain within its internal structure?", [
      "Only free genetic material without a nuclear membrane.",
      "Cell organelles and non-living inclusions, including materials formed or accumulated through cellular activity.",
      "Only numerous granular ribosomes, without other structures.",
      "Only rigid actin and myosin filaments.",
    ]),
    q("cytoplasm-er", 5, "What is the endoplasmic reticulum?", [
      "A double membrane surrounding the nucleus and containing minute pores.",
      "An interconnected membrane network of tubules and flattened sacs, named for its branching and interlacing nature.",
      "An agranular secretory organelle discovered by Camillo Golgi.",
      "Spherical particles containing more than 40 hydrolytic enzymes.",
    ]),
    q("cytoplasm-er", 6, "How is the endoplasmic reticulum related to the nuclear envelope and plasma membrane?", [
      "It is continuous with the cell wall and contains no membranes.",
      "It is continuous with the outer nuclear membrane and exchanges material with the plasma membrane through vesicular transport pathways.",
      "It connects directly to the chloroplasts and the micropyle.",
      "It connects to the midpiece of the sperm and its kinetosome.",
    ]),
    q("cytoplasm-er", 7, "What is a major general function of the endoplasmic reticulum?", [
      "Generating most cellular ATP by oxidative phosphorylation.",
      "Synthesizing and processing proteins and lipids, with additional roles in carbohydrate metabolism.",
      "Carrying out autolysis of the cell after death.",
      "Secreting viscous fluid onto the stigma.",
    ]),
    q("cytoplasm-er", 8, "How is the endoplasmic reticulum classified?", [
      "Plant endoplasmic reticulum and animal endoplasmic reticulum.",
      "Rough endoplasmic reticulum and smooth endoplasmic reticulum.",
      "Haploid network and diploid network.",
      "Sperm-transporting network and common urogenital network.",
    ]),
  ],
  6: [
    q("cytoplasm-er", 9, "Why does rough endoplasmic reticulum have a rough or granular appearance?", [
      "Germination pores and spines are present on its outer wall.",
      "Ribosomes are attached to the cytosolic surfaces of its membranes.",
      "Lignin is deposited on its convoluted surfaces.",
      "Small vesicular cells fuse with its membrane.",
    ]),
    q("cytoplasm-er", 10, "Which combination describes functions of the rough endoplasmic reticulum?", [
      "Cellulose synthesis, starch storage, and auxin production.",
      "Protein synthesis and processing, contributing to the internal membrane framework, and transporting newly synthesized proteins toward the Golgi apparatus.",
      "Steroid hormone secretion, detoxification, and ATP energy generation.",
      "Autolysis, phagocytosis, and binary fission.",
    ]),
    q("cytoplasm-er", 11, "How does smooth endoplasmic reticulum differ structurally from rough endoplasmic reticulum?", [
      "It has extremely thick walls and contains chromoplasts.",
      "It lacks attached ribosomes, giving its membranes a smooth appearance.",
      "It lacks tubules and consists only of circular lobes.",
      "It contains 40 hydrolytic enzymes floating in the cytoplasm.",
    ]),
    q("cytoplasm-er", 12, "What are the functions of smooth endoplasmic reticulum?", [
      "Synthesizing proteins on attached ribosomes and directing them toward the nucleolus.",
      "Lipid synthesis, steroid hormone synthesis in specialized cells, detoxification of certain drugs and poisons, and roles in intracellular transport and calcium storage.",
      "Performing photosynthesis and converting glucose into solid starch.",
      "Producing most cellular ATP through oxidative phosphorylation.",
    ]),
  ],
  7: [
    q("golgi", 1, "Which scientist first described the Golgi apparatus in nerve cells in 1898?", [
      "Robert Brown", "Camillo Golgi", "Matthias Schleiden", "Theodor Schwann",
    ]),
    q("golgi", 2, "What is the structural description of the Golgi apparatus?", [
      "Tubules and rough vesicles containing abundant attached ribosomes.",
      "A cellular processing and secretory system composed of stacked flattened membrane sacs and associated vesicles, often located near the nucleus.",
      "A spherical, double-membrane structure containing cristae and respiratory enzymes.",
      "A network of fine filaments composed of actin and myosin proteins.",
    ]),
    q("golgi", 3, "Which description correctly names the three Golgi components listed in the textbook?", [
      "Vesicular sacs surrounded by a thick cellulose wall impregnated with lignin.",
      "Larvae, bubbles, and large vacuoles.",
      "Flattened sacs called dragonflies, vesicles, and large vacuoles.",
      "Flattened sacs called cisternae, vesicles, and large vacuoles, all bounded by smooth membranes.",
    ], 3),
    q("golgi", 4, "How many flattened sacs (cisternae) are listed for a Golgi stack in the textbook?", [
      "1–2", "3–10", "20–30", "Always hundreds",
    ]),
    q("golgi", 6, "What is a stack of Golgi cisternae in plant cells commonly called, and what is one of its functions?", [
      "A plastid; it converts glucose into starch.",
      "A dictyosome; it processes and supplies non-cellulosic cell-wall polysaccharides such as pectins and hemicelluloses.",
      "A kinetosome; it controls the movement of cilia.",
      "A dictyosome; it synthesizes reproductive proteins on attached ribosomes.",
    ]),
    q("golgi", 7, "Which combination describes secretory functions of the Golgi apparatus in animal cells?", [
      "Protein synthesis on ribosomes, ATP energy production, and autolysis.",
      "Synthesis of certain complex carbohydrates; processing, sorting, and packaging proteins received from the ER; and packaging substances such as hormones and enzymes for secretion.",
      "Water absorption, storage of steroid lipids, and anaerobic cellular respiration.",
      "Drug detoxification, formation of the egg sac, and binary fission.",
    ]),
    q("golgi", 8, "Why does the Golgi apparatus not synthesize proteins even though it processes proteins for secretion?", [
      "It receives ready-made proteins from developing mitochondria.",
      "It lacks attached ribosomes and receives proteins synthesized on rough ER-bound ribosomes.",
      "Protein secretion is limited to plant cells only.",
      "Its 40 hydrolytic enzymes inhibit the synthesis of proteins.",
    ]),
  ],
  8: [
    q("mitochondria", 1, "What are the shapes and approximate dimensions of mitochondria listed in the textbook?", [
      "Spherical structures always 100 micrometers in length.",
      "Spherical or filamentous structures approximately 0.5–1 micrometer wide and sometimes up to 10 micrometers long.",
      "Smooth tubules and vesicles completely lacking internal membranes.",
      "Flattened sacs arranged in a vertical row, numbering between 3 and 10.",
    ]),
    q("mitochondria", 2, "Where are mitochondria generally found, and how are they distributed?", [
      "In prokaryotic cells, concentrated around the nuclear region.",
      "In most eukaryotic cells, with their number, size, and distribution varying among cells.",
      "Only in plant cells and never in animal cells.",
      "Only within the cavity of the contractile vacuole.",
    ]),
    q("mitochondria", 3, "What membranes surround a mitochondrion?", [
      "A single thin membrane containing minute pores.",
      "Two membranes: an outer membrane and an inner membrane.",
      "A rigid chemical wall composed of proteins, lipids, and polysaccharides.",
      "No membranes; it connects directly to the cytoplasm.",
    ]),
    q("mitochondria", 4, "How is the inner mitochondrial membrane described?", [
      "It is completely smooth and free of folds.",
      "It has numerous folds of different shapes and orientations called cristae.",
      "It is composed of cellulose molecules and hardened lignin.",
      "Its cytosolic surface is covered by ribosomes for protein synthesis.",
    ]),
    q("mitochondria", 5, "What are cristae, and what is their structural significance?", [
      "Folds in the outer membrane that increase its surface area.",
      "Folds of the inner mitochondrial membrane that increase its surface area.",
      "Protein fibers made of actin and myosin that facilitate cell contraction.",
      "Secretory channels that secrete complex steroid hormones.",
    ]),
    q("mitochondria", 6, "Why are mitochondria known as the powerhouses of the cell?", [
      "Their membranes lack ribosomes and can synthesize lipids.",
      "They produce most of the ATP in many aerobic eukaryotic cells.",
      "They contain chlorophyll pigments and store starch.",
      "They neutralize the toxic effects of anesthetic drugs.",
    ]),
    q("mitochondria", 7, "What is the primary function of mitochondria?", [
      "Photosynthesis and sugar synthesis.",
      "Aerobic cellular respiration and ATP production, using respiratory enzymes.",
      "Cellular secretion of hormones and complex enzymes.",
      "Autolysis of cytoplasmic components after death.",
    ]),
  ],
  9: [
    q("plastids", 1, "What are plastids, and where are they found?", [
      "Structures found only in animal-cell cytoplasm that secrete hormones.",
      "Organelles in plant and algal cells that vary in shape, size, and color, including oval, cup-shaped, spiral, and star-shaped forms.",
      "Interconnected networks of rough tubules found in prokaryotes.",
      "Structures inside the nucleus composed of RNA and proteins.",
    ]),
    q("plastids", 2, "What are the three main types of plastids in plants?", [
      "Primitive, true, and vascular plastids.", "Chromoplasts, leucoplasts, and chloroplasts.",
      "Spherical, filamentous, and membranous plastids.", "Male, female, and hermaphroditic plastids.",
    ]),
    q("plastids", 3, "What is the function of chromoplasts?", [
      "Producing most ATP through respiratory enzymes.",
      "Containing pigments that give color to many flowers and fruits.",
      "Converting carbon dioxide directly into complex carbohydrates without light.",
      "Converting glucose into starch for the purpose of storing fats.",
    ]),
    q("plastids", 4, "What is a primary function of leucoplasts?", [
      "Secreting steroid hormones such as auxins and gibberellins.",
      "Synthesizing or storing reserve substances such as starch, lipids, and proteins, depending on plastid type.",
      "Absorbing solar energy and releasing oxygen through photosynthesis.",
      "Protecting the flower bud before it opens and repairing damaged cells.",
    ]),
    q("plastids", 5, "Which plant tissue contains abundant colorless plastids filled with starch?", [
      "Banana and navel orange fruit peel.", "Potato tuber tissue.",
      "Green leaves and flowers of fava bean plants.", "The lower surface of fern leaves.",
    ]),
    q("plastids", 6, "How many membranes form the chloroplast envelope?", [
      "One thin membrane completely lacking pores.", "Two membranes.",
      "A rigid wall composed of polysaccharides and lipids.",
      "None; the chloroplast connects directly to cytoskeletal filaments.",
    ]),
    q("plastids", 7, "Which two important structures are found within the chloroplast envelope?", [
      "Cristae and respiratory enzymes.", "Grana (stacks of thylakoids) and the stroma.",
      "The nucleoid region and sex pili.", "The cell plate and the sphincter muscle.",
    ]),
    q("plastids", 8, "What is the stroma?", [
      "The smooth outer membrane of the chloroplast envelope.",
      "The fluid matrix inside the chloroplast envelope, surrounding the thylakoids and grana.",
      "A disc-like structure resembling a secondary spermatocyte.",
      "The connective tissue linking the lobes of the floral anther.",
    ]),
    q("plastids", 9, "What do grana contain that is important for photosynthesis?", [
      "Enzymes that break down the bacterial cell wall.",
      "Thylakoid membranes containing chlorophyll, photosystems, and electron-transport components used in photosynthesis.",
      "Steroid hormones and nocturnal fat stores.",
      "Only chromosomes carrying hereditary traits.",
    ]),
    q("plastids", 10, "What is a thylakoid, and what is the function of its membrane?", [
      "A fold in the inner mitochondrial membrane that increases surface area.",
      "A flattened membrane sac within a chloroplast; its membrane contains chlorophyll and components of the light-dependent reactions of photosynthesis.",
      "A selectively permeable membrane surrounding prokaryotic cytoplasm.",
      "A gelatinous covering secreted around mature eggs.",
    ]),
  ],
  10: [
    q("lysosomes", 1, "What are lysosomes in terms of their structure and membrane?", [
      "Double-membrane organelles containing cristae and respiratory enzymes.",
      "Vesicles bounded by a single membrane and containing many hydrolytic enzymes, traditionally described as more than 40 types.",
      "Rough tubular structures connected to the plasma membrane that lack enzymes.",
      "Spherical bodies containing pigments that color flowers and fruits.",
    ]),
    q("lysosomes", 2, "What is the primary function of lysosomal enzymes?", [
      "Producing high-energy ATP molecules.", "Intracellular digestion.",
      "Synthesizing and assembling lipids for storage in the liver.",
      "Synthesizing cellulose and other cell-wall components.",
    ]),
    q("lysosomes", 3, "In which cells are lysosomes particularly prominent?", [
      "Prokaryotic cells, particularly Mycoplasma.",
      "Many animal cells, especially phagocytic cells such as neutrophils.",
      "Only the cells of advanced dicotyledonous plants.",
      "Only within the nucleolus cavity.",
    ]),
    q("lysosomes", 4, "Which is a function of lysosomes?", [
      "Synthesizing proteins and detoxifying anesthetic drugs.",
      "Digesting engulfed food particles, microorganisms, and worn-out cellular components such as mitochondria.",
      "Absorbing solar energy and converting glucose into starch.",
      "Secreting steroid hormones and stimulating centrosome division.",
    ]),
    q("lysosomes", 5, "What role do lysosomes play during frog metamorphosis?", [
      "They increase embryonic cell size and prevent tissue remodeling.",
      "They help break down tail tissues as a tadpole develops into an adult frog.",
      "They secrete mucus that releases the nymph from the egg.",
      "They stimulate longitudinal binary fission.",
    ]),
    q("lysosomes", 6, "What is digestion of a cell's components by its own enzymes, particularly after death, called?", [
      "Phagocytosis.", "Autolysis.", "Active transport.", "Amitosis.",
    ]),
    q("lysosomes", 7, "How can autolysis contribute to the environment after organisms die?", [
      "By stimulating blue-green algae to grow in ponds.",
      "By helping break down cellular material, contributing to the recycling of elements in nature.",
      "By preventing water loss in swamps and shallow lakes.",
      "By helping plants adapt to life on dry land.",
    ]),
  ],
  11: [
    q("cytoskeleton", 1, "What does the cytoskeleton provide to eukaryotic cells?", [
      "The ability to secrete complex steroid hormones.",
      "Structural support, maintenance of cell shape, and pathways for movement and intracellular organelle transport.",
      "The ability to convert glucose into storage starch.",
      "A selectively permeable membrane surrounding a nuclear region.",
    ]),
    q("cytoskeleton", 2, "Which two cytoskeletal components are emphasized in this section of the curriculum?", [
      "Flattened sacs called cisternae and smooth vesicles.", "Microfilaments and microtubules.",
      "A single membrane containing hydrolytic enzymes.", "Cellulose and lignin molecules.",
    ]),
    q("cytoskeleton", 3, "What are microfilaments, and how do they relate to myosin?", [
      "Hollow tubular structures composed of tubulin.",
      "Thin filaments composed of actin; they can interact with the motor protein myosin, which forms thick filaments in muscle.",
      "Folds within the inner mitochondrial membrane.",
      "Small granules responsible for synthesizing proteins.",
    ]),
    q("cytoskeleton", 4, "What do actin and myosin do together in muscle cells?", [
      "Neutralize poisons and anesthetic drugs.", "Produce contraction by sliding relative to one another.",
      "Increase the surface area available for respiratory enzymes.", "Form a gelatinous egg sac.",
    ]),
    q("cytoskeleton", 5, "What are microtubules, and which protein forms them?", [
      "Thin filaments composed of actin.", "Hollow tubular structures composed of tubulin.",
      "Single-membrane sacs containing digestive enzymes.", "Vascular cavities filled with cellular fluid.",
    ]),
    q("cytoskeleton", 6, "What important role do microtubules play during cell division?", [
      "They stimulate autolysis of cytoplasmic components.",
      "They form the mitotic spindle and participate in chromosome movement.",
      "They secrete viscous fluid onto the stigma.",
      "They enlarge lipid bodies during hibernation.",
    ]),
    q("cytoskeleton", 7, "Which is another function of microtubules?", [
      "Synthesizing and secreting complex sugars in the Golgi apparatus.",
      "Supporting cell organization and intracellular transport, and forming part of cilia and flagella.",
      "Secreting steroid hormones in the adrenal glands.",
      "Digesting food particles and aged mitochondria.",
    ]),
    q("cytoskeleton", 8, "Where are microtubules found, and which structures contain them near the nucleus of many animal cells?", [
      "Only in prokaryotic cytoplasm.",
      "In eukaryotic cells; they form the centrioles within centrosomes of many animal cells.",
      "Only in the endosperm tissue of mature seeds.",
      "Only in the outer ovary wall of a hermaphroditic flower.",
    ]),
  ],
  12: [
    q("centrosome", 1, "What does a typical animal-cell centrosome contain?", [
      "Two elongated lobes joined by connective tissue and a vascular bundle.",
      "A pair of centrioles surrounded by pericentriolar material; each centriole usually contains nine microtubule triplets.",
      "A single membrane enclosing hydrolytic enzymes.",
      "Actin and myosin filaments arranged linearly in muscle cells.",
    ]),
    q("centrosome", 2, "What happens to centrosomes as an animal cell prepares for and enters division?", [
      "They are broken down and replaced by a nuclear region.",
      "Centrosome duplication occurs before mitosis; the two centrosomes separate toward opposite poles and organize spindle microtubules.",
      "They cross the plasma membrane to become an external flagellum.",
      "They fuse with the nucleolus to form chromosomes.",
    ]),
    q("centrosome", 3, "How do higher plant cells form spindle microtubules without typical centriole-containing centrosomes?", [
      "Starch-filled plastids produce the spindle fibers.",
      "Other microtubule-organizing sites nucleate and organize spindle microtubules.",
      "Lysosomes secrete mucus to form the spindle.",
      "Dictyosomes synthesize cellulose spindle fibers.",
    ]),
    q("centrosome", 4, "What is a kinetosome (basal body), and where is it located?", [
      "A green, heart-shaped structure on the underside of a leaf.",
      "A centriole-like structure at the base of a cilium or eukaryotic flagellum.",
      "A double membrane around a mitochondrion containing cristae.",
      "A small projection connecting the ovary to the body wall.",
    ]),
    q("centrosome", 5, "What is the principal role of the kinetosome (basal body)?", [
      "Neutralizing poisons and anesthetic drugs.",
      "Anchoring and organizing the microtubules of a cilium or flagellum, supporting its formation and function.",
      "Generating ATP required for contraction and relaxation.",
      "Controlling sperm maturation in the seminal vesicle.",
    ]),
  ],
};

export function getNadiaEnglishChapter1SuppliedMcqSet(lecture: number): NadiaBuiltInMcqSet | null {
  const questions = nadiaEnglishChapter1SuppliedQuestions[lecture];
  if (!questions) return null;
  const topicKey = `nadia-en-ch1-lec${lecture}-exam`;
  return {
    id: `built-in:supplied:${topicKey}`,
    teacher_id: "nadia-al-nuaimy",
    topic_key: topicKey,
    title: getNadiaTopicTitle("en", 1, lecture, "en") ?? `Chapter 1 — Topic ${lecture}`,
    questions: questions.map(({ question, choices, answer_index }) => ({
      question, choices: [...choices], answer_index, explanation: choices[answer_index],
    })),
    created_at: "2026-11-13T00:00:00+03:00",
  };
}

/** Append the supplied bank even when a saved bank exists; never replace it. */
export function appendNadiaEnglishChapter1SuppliedMcqs<T extends { questions: { question: string }[] }>(
  chapter: number,
  lecture: number,
  existing: T[],
): Array<T | NadiaBuiltInMcqSet> {
  const supplied = chapter === 1 ? getNadiaEnglishChapter1SuppliedMcqSet(lecture) : null;
  if (!supplied) return existing;
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const seen = new Set(existing.flatMap((set) => set.questions.map((item) => normalize(item.question))));
  const questions = supplied.questions.filter((item) => {
    const key = normalize(item.question);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return questions.length ? [...existing, { ...supplied, questions }] : existing;
}
