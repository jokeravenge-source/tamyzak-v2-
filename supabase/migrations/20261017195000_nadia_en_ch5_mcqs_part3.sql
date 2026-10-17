-- Nadia Al-Nuaimi · English curriculum · Chapter 5 · Topics 15–21
WITH translated(topic_key, title, questions) AS (
  VALUES
  (
    'nadia-en-ch5-lec15-exam',
    'Mutations and Their Types',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of a mutation?', 'choices', jsonb_build_array('Rapid cytoplasmic division that enlarges and ruptures a living cell.', 'A sudden change in hereditary material (DNA) that alters the phenotype of an organism and may be inherited by later generations.', 'The movement of water across a selectively permeable membrane because of a concentration difference.', 'The fusion of two male nuclei with the synergid cells of an egg.'), 'answer_index', 1),
      jsonb_build_object('question', 'What are the two main types of mutations according to their structural and hereditary effects?', 'choices', jsonb_build_array('Plant mutations and animal mutations.', 'Chromosome mutations and gene mutations.', 'Haploid and diploid mutations.', 'Intestinal and reproductive mutations.'), 'answer_index', 1),
      jsonb_build_object('question', 'What occurs in structural chromosome mutations?', 'choices', jsonb_build_array('Only the sequence of DNA nitrogenous bases changes while chromosome structure remains unchanged.', 'The structure of a chromosome changes through deletion, duplication, inversion, or translocation of a segment to a non-homologous chromosome.', 'The number of abdominal fat bodies doubles during winter hibernation.', 'The nuclear envelope and nucleolus disappear during interphase.'), 'answer_index', 1),
      jsonb_build_object('question', 'What are numerical chromosome mutations, and what is a well-known human example?', 'choices', jsonb_build_array('A change in chromosome shape from rod-like to spherical.', 'An increase or decrease in chromosome number, such as Down syndrome caused by an extra chromosome 21, giving 47 chromosomes.', 'An increase in scattered vascular bundles in a monocot stem.', 'Reduction of chromosome number to one quarter by lethal alleles.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the precise definition of a gene or point mutation?', 'choices', jsonb_build_array('A change in the number of complete chromosomes in a somatic cell.', 'A chemical change in the structure of a gene caused by a change in the sequence of DNA nitrogenous bases, such as substitution, deletion, or addition of a base.', 'Fusion of a male gamete with two polar nuclei to form triploid endosperm.', 'Invagination of the plasma membrane to enclose liquid during pinocytosis.'), 'answer_index', 1),
      jsonb_build_object('question', 'How are mutations classified according to their effect on survival and persistence in the environment?', 'choices', jsonb_build_array('Green, colored, and colorless mutations.', 'Harmful or lethal mutations, beneficial mutations that aid adaptation, and silent mutations that do not affect the phenotype.', 'Fibrous, wedge-shaped, and transverse mutations.', 'Male and female dioecious mutations.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec16-exam',
    'Human Genetics and Sex-Linked Traits',
    jsonb_build_array(
      jsonb_build_object('question', 'Why is the study of human genetics more difficult than the study of genetics in animals and plants?', 'choices', jsonb_build_array('Human cells lack ribonucleic acids.', 'Controlled experimental crosses cannot be performed in humans, the human generation is long, few offspring are produced, and hereditary and environmental factors interact strongly.', 'Humans depend entirely on natural parthenogenesis.', 'Human cells have fixed shapes and sizes with no phenotypic variation.'), 'answer_index', 1),
      jsonb_build_object('question', 'What are sex-linked traits in human genetics?', 'choices', jsonb_build_array('Traits whose genes occur on autosomes but are influenced by sex hormones.', 'Traits whose genes are located on sex chromosomes, especially the X chromosome, and are transmitted with those chromosomes.', 'Traits produced by fusion of two male nuclei with a polar nucleus.', 'Traits restricted to secretory gland cells.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which human hereditary disorder is controlled by a recessive X-linked allele and impairs the perception of certain colors?', 'choices', jsonb_build_array('Severe sickle-cell anemia', 'Color blindness', 'Cystic fibrosis', 'Down syndrome'), 'answer_index', 1),
      jsonb_build_object('question', 'What is hemophilia from genetic and clinical perspectives?', 'choices', jsonb_build_array('A disease caused by increased vascularity of lymphatic vessels.', 'An X-linked recessive hereditary disease in which blood cannot clot normally because a clotting factor is deficient.', 'A disease caused by exposing a pregnant mother to ionizing X-rays.', 'A disorder that converts living cells into prokaryotic cells.'), 'answer_index', 1),
      jsonb_build_object('question', 'Why are X-linked disorders such as color blindness and hemophilia much more common in males than in females?', 'choices', jsonb_build_array('Males secrete auxins and gibberellins that inhibit gene expression.', 'A male has only one X chromosome (XY), so one recessive allele can cause the disorder; a female has two X chromosomes (XX) and usually requires two recessive alleles.', 'The Y chromosome is completely digested in the cytoplasm after fertilization.', 'Male somatic cells are always haploid.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the genotype of a woman who carries the color-blindness allele but has normal color vision?', 'choices', jsonb_build_array('X^C X^C', 'X^C X^c', 'X^c X^c', 'X^c Y'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec17-exam',
    'DNA Structure and the Double Helix',
    jsonb_build_array(
      jsonb_build_object('question', 'What are the basic structural units of deoxyribonucleic acid (DNA)?', 'choices', jsonb_build_array('Free amino acids', 'Nucleotides', 'Phospholipid bilayers', 'Complex polysaccharides'), 'answer_index', 1),
      jsonb_build_object('question', 'What are the three structural and chemical components of each DNA nucleotide?', 'choices', jsonb_build_array('Actin fibers, myosin fibers, and solid starch.', 'A five-carbon deoxyribose sugar, a phosphate group, and a nitrogenous base.', 'Chlorophyll pigments, grana, and thylakoid membranes.', 'A transparent gel containing forty hydrolytic enzymes.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which four nitrogenous bases occur in DNA nucleotides?', 'choices', jsonb_build_array('Uracil, thymine, cytosine, and guanine.', 'Adenine (A), thymine (T), cytosine (C), and guanine (G).', 'Adenine, uracil, ribose, and phosphate.', 'Collagen, tubulin, actin, and myosin.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which two scientists presented the accepted double-helix model of DNA in 1953?', 'choices', jsonb_build_array('Matthias Schleiden and Theodor Schwann', 'James Watson and Francis Crick', 'Camillo Golgi and Robert Brown', 'Gregor Mendel and Thomas Morgan'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the precise structural description of DNA in the Watson and Crick model?', 'choices', jsonb_build_array('A single branched strand attached externally to the plant cell wall.', 'Two nucleotide strands twisted around each other as a double helix and joined by hydrogen bonds between nitrogenous bases.', 'A thick protein capsule surrounding the nuclear region in prokaryotes.', 'A network of lymphatic vessels that transports the fertility factor.'), 'answer_index', 1),
      jsonb_build_object('question', 'How do nitrogenous bases pair between the two DNA strands?', 'choices', jsonb_build_array('Adenine always pairs with cytosine, and thymine pairs with guanine.', 'Adenine pairs with thymine through two hydrogen bonds, while guanine pairs with cytosine through three hydrogen bonds.', 'Bases pair randomly and are digested by cytoplasmic autolysis.', 'Uracil pairs with thymine through a phosphate group.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec18-exam',
    'RNA Structure, Types, and Functions',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the basic structural unit of a ribonucleic acid (RNA) strand?', 'choices', jsonb_build_array('Complex amino acids', 'Ribonucleotides', 'Phospholipid fatty acids', 'Rigid cellulose molecules'), 'answer_index', 1),
      jsonb_build_object('question', 'How does the five-carbon sugar in RNA differ from the sugar in DNA?', 'choices', jsonb_build_array('RNA contains high-energy glucose.', 'RNA contains ribose, whereas DNA contains deoxyribose.', 'RNA contains a complex sugar that undergoes autolysis.', 'RNA completely lacks a phosphate group.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which nitrogenous base occurs in RNA instead of thymine (T) in DNA?', 'choices', jsonb_build_array('Adenine (A)', 'Uracil (U)', 'Cytosine (C)', 'Guanine (G)'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the general structural form of RNA compared with DNA?', 'choices', jsonb_build_array('It is always a double helix.', 'It is usually a single strand rather than two strands twisted into a double helix.', 'It is attached directly to a kinetosome for movement.', 'It forms flattened sacs called secretory cisternae.'), 'answer_index', 1),
      jsonb_build_object('question', 'What are the three main types of RNA involved in protein synthesis?', 'choices', jsonb_build_array('Primitive, true, and vascular RNA.', 'Messenger RNA (mRNA), transfer RNA (tRNA), and ribosomal RNA (rRNA).', 'Haploid, diploid, and triploid RNA.', 'Hormonal, enzymatic, and steroid RNA.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the main biological function of transfer RNA (tRNA)?', 'choices', jsonb_build_array('Storing high-energy ATP in mitochondria.', 'Carrying amino acids from the cytoplasm to ribosomes during protein synthesis.', 'Transferring the fertility factor through a bacterial conjugation bridge.', 'Forming the semipermeable membrane around the nuclear region.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec19-exam',
    'Genetic Code and Transcription',
    jsonb_build_array(
      jsonb_build_object('question', 'What is meant by the genetic code?', 'choices', jsonb_build_array('A rigid cellulose and lignin matrix that protects the interphase nucleus.', 'A sequence of nitrogenous bases in DNA or mRNA in which each codon consists of three successive bases that specify a particular amino acid.', 'Hydrolytic enzymes secreted by lysosomes to digest old mitochondrial fragments.', 'Steroid hormones that stimulate cell differentiation during gastrulation.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is transcription in a eukaryotic cell?', 'choices', jsonb_build_array('Duplication of the entire DNA molecule to form two identical copies.', 'The synthesis of an mRNA strand from one DNA template strand to carry genetic information from the nucleus to the cytoplasm.', 'Conversion of glucose to pyruvic acid during glycolysis.', 'Removal of solid waste through exocytosis.'), 'answer_index', 1),
      jsonb_build_object('question', 'Where does transcription occur in a eukaryotic cell, and which enzyme performs it?', 'choices', jsonb_build_array('In the cytoplasm through lysosomal enzymes.', 'Inside the nucleus with the aid of RNA polymerase.', 'In mitochondria because they contain respiratory enzymes.', 'In chloroplast thylakoid membranes using light.'), 'answer_index', 1),
      jsonb_build_object('question', 'What does mRNA represent after transcription and movement into the cytoplasm?', 'choices', jsonb_build_array('A mature male gametophyte carrying pollen grains.', 'A copy of the genetic code from nuclear DNA that is delivered to cytoplasmic ribosomes for protein synthesis.', 'A food-storage tissue on which the embryo depends.', 'A carrier substance that moves against a concentration gradient using ATP.'), 'answer_index', 1),
      jsonb_build_object('question', 'How many nitrogenous bases, or nucleotides, form one codon on mRNA?', 'choices', jsonb_build_array('One base', 'Three successive bases', 'Four scattered bases', 'Forty-six chromosomal bases'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec20-exam',
    'Translation and Protein Synthesis',
    jsonb_build_array(
      jsonb_build_object('question', 'What is translation inside the cell?', 'choices', jsonb_build_array('Conversion of pyruvic acid into ethyl alcohol and carbon dioxide.', 'Conversion of the nucleotide sequence, or genetic code, on mRNA into an amino-acid sequence that forms a polypeptide and a specific protein.', 'Repair and thickening of the uterine lining under estrogen.', 'Gradual inward constriction of the plasma membrane during animal-cell division.'), 'answer_index', 1),
      jsonb_build_object('question', 'Where does translation, or protein synthesis, occur, and which organelles perform it?', 'choices', jsonb_build_array('Inside Golgi cisternae.', 'In the cytoplasm on ribosomes.', 'Inside temporary food vacuoles through free enzymes.', 'Attached to the rigid wall of a young plant cell.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the three-nucleotide sequence on tRNA that matches a codon on mRNA?', 'choices', jsonb_build_array('General codon', 'Anticodon', 'Germination pore', 'Terminal body'), 'answer_index', 1),
      jsonb_build_object('question', 'How does tRNA function during translation?', 'choices', jsonb_build_array('It secretes hydrolytic enzymes that break hydrogen bonds in the DNA template.', 'Its anticodon recognizes an mRNA codon, and it brings the specified amino acid to be added to the growing polypeptide chain at the ribosome.', 'It moves toward the nucleus to replicate DNA by phosphorylation.', 'It attaches to opposite cell poles to guide daughter chromosomes.'), 'answer_index', 1),
      jsonb_build_object('question', 'What signals the end of translation and stops construction of the protein chain?', 'choices', jsonb_build_array('Depletion of water and salts from cell sap.', 'A ribosome reaches one of the stop codons on mRNA.', 'Complete breakdown of the nucleus and nucleolus.', 'A fall in progesterone after degeneration of the corpus luteum.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec21-exam',
    'Genetic Engineering and Its Applications',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of genetic engineering?', 'choices', jsonb_build_array('The study of division times in terminally differentiated nerve cells.', 'A technique that transfers genes or DNA segments from one organism to another to modify hereditary traits or produce medically or economically valuable substances.', 'Measurement of plasma-membrane permeability in a plasmolyzed plant cell.', 'Natural parthenogenesis that produces diploid male honeybees.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which small biological vectors are commonly used to transfer genes from one cell to another in genetic engineering?', 'choices', jsonb_build_array('Fat bodies and the cell plate.', 'Plasmids or bacteriophages.', 'Golgi cisternae and disc-shaped thylakoid membranes.', 'The umbilical cord and placenta.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is a plasmid in structural and genetic terms?', 'choices', jsonb_build_array('A thick protein envelope surrounding a true nucleus.', 'A small additional circular DNA molecule in the cytoplasm of some bacterial cells that replicates independently of the main bacterial chromosome.', 'A double-membrane organelle containing respiratory enzymes and cristae.', 'A green heart-shaped gametophyte of ferns.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which specialized enzymes cut and join DNA molecules in genetic engineering?', 'choices', jsonb_build_array('Digestive lysosomal enzymes.', 'Restriction enzymes and DNA ligase.', 'RNA polymerase and autolytic enzymes.', 'Anaerobic-respiration enzymes of lactic fermentation.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which major medical product is made commercially by inserting a human gene into Escherichia coli?', 'choices', jsonb_build_array('Plant auxins and gibberellins.', 'Human insulin for treating diabetes.', 'Estrogen and progesterone for embryo maintenance.', 'Gelatinous albumin fluid for protecting Paramecium cells.'), 'answer_index', 1)
    )
  )
)
INSERT INTO public.teacher_topic_mcqs (teacher_id, topic_key, title, questions)
SELECT 'nadia-al-nuaimy', topic_key, title, questions
FROM translated
WHERE NOT EXISTS (
  SELECT 1 FROM public.teacher_topic_mcqs existing
  WHERE existing.teacher_id = 'nadia-al-nuaimy'
    AND existing.topic_key = translated.topic_key
);
