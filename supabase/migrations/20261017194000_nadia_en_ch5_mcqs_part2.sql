-- Nadia Al-Nuaimi · English curriculum · Chapter 5 · Topics 8–14
WITH translated(topic_key, title, questions) AS (
  VALUES
  (
    'nadia-en-ch5-lec8-exam',
    'Codominance',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of codominance?', 'choices', jsonb_build_array('A phenomenon that produces an intermediate phenotype by blending the expression of the two parental alleles.', 'A phenomenon in which both alleles are expressed together in the phenotype of a hybrid without blending, and neither allele is dominant or recessive.', 'The complete breakdown of hereditary material by lysosomal enzymes.', 'A phenomenon restricted to prokaryotic cells during bacterial conjugation.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which examples are used in the biology textbook to illustrate codominance?', 'choices', jsonb_build_array('Flower color in snapdragons and stem length in peas.', 'The human MN blood-group system, the AB blood group, and coat color in shorthorn cattle.', 'Rabbit coat color and wing shape in fruit flies.', 'Nucellus size in the ovule and leaf venation in broad beans.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which alleles are responsible for the AB blood group and the MN blood-group system in humans?', 'choices', jsonb_build_array('Iᴬ and Iᴮ are expressed together in blood group AB, while Lᴹ and Lᴺ determine the MN system.', 'The Mendelian alleles T and t that control stem height.', 'Hybrid tetraploid alleles.', 'Alleles induced by X-ray mutation.'), 'answer_index', 0),
      jsonb_build_object('question', 'When red-haired shorthorn cattle (CᴿCᴿ) are crossed with white-haired cattle (CᵂCᵂ), what is the phenotype of all F₁ offspring?', 'choices', jsonb_build_array('100% hybrid red-haired cattle.', '100% roan cattle with genotype CᴿCᵂ; roan hair contains both red and white hairs.', '50% red and 50% white cattle.', '100% pink-haired cattle because the pigments blend completely.'), 'answer_index', 1),
      jsonb_build_object('question', 'What phenotypic and genotypic ratio appears in F₂ when roan cattle (CᴿCᵂ) are crossed?', 'choices', jsonb_build_array('3 red : 1 white', '1 red (CᴿCᴿ) : 2 roan (CᴿCᵂ) : 1 white (CᵂCᵂ), or 1:2:1.', '9 roan : 3 red : 4 white', '100% roan'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec9-exam',
    'Lethal Alleles',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of lethal alleles?', 'choices', jsonb_build_array('Alleles that increase mitochondrial efficiency and ATP production.', 'Alleles whose expression causes the death of an individual that inherits them in the homozygous condition, whether the allele is dominant or recessive.', 'Alleles that transfer the plasmid fertility factor across a bacterial conjugation bridge.', 'Genes that secrete hydrolytic enzymes and cause autolysis of an interphase nucleus.'), 'answer_index', 1),
      jsonb_build_object('question', 'What are the genotype and biological fate of the yellow mice that die during early embryonic development?', 'choices', jsonb_build_array('Yy, and they live normally.', 'YY; homozygous yellow mice die in the uterus.', 'yy, and they die because of malnutrition.', 'YᴿYᴿ, and they become gray mice.'), 'answer_index', 1),
      jsonb_build_object('question', 'When hybrid yellow mice (Yy) are crossed, what is the phenotypic ratio among the living offspring?', 'choices', jsonb_build_array('3 yellow : 1 gray', '2 hybrid yellow (Yy) : 1 normal gray (yy), a 2:1 ratio because YY dies.', '1 pure yellow : 2 hybrid yellow : 1 gray', '100% pure gray mice'), 'answer_index', 1),
      jsonb_build_object('question', 'Which human hereditary disease is the clearest example of recessive lethal alleles?', 'choices', jsonb_build_array('Color blindness and congenital heart defects', 'Sickle-cell anemia', 'Chronic diabetes', 'Down syndrome'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the genotype of a person who usually dies at a young age from severe homozygous sickle-cell anemia?', 'choices', jsonb_build_array('HbᴬHbᴬ', 'HbˢHbˢ; the individual has severe sickle-cell anemia and dies at an early age.', 'HbᴬHbˢ', 'ss'), 'answer_index', 1),
      jsonb_build_object('question', 'How is a person with genotype HbᴬHbˢ described medically and phenotypically?', 'choices', jsonb_build_array('Completely healthy and carries no hereditary factor for the disease.', 'Phenotypically healthy but carries the sickle-cell allele; red cells become sickle-shaped when oxygen concentration falls.', 'Dies during early embryonic stages in the uterus.', 'Develops blindness and deafness because of congenital hereditary defects.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which other textbook example represents a dominant lethal allele that kills homozygous offspring?', 'choices', jsonb_build_array('The short-limb allele in ornamental chickens.', 'The hairless allele (H) in Mexican hairless dogs, where homozygous dominant HH animals die.', 'The constricted-pod allele in pea plants.', 'An allele in a Spanish butterfly with 380 chromosomes.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec10-exam',
    'Penetrance and Expressivity',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of genetic penetrance?', 'choices', jsonb_build_array('The ability of cells to differentiate and undergo morphogenesis after gastrulation.', 'The probability that a person who inherits a particular allele will show its associated phenotype; it is the proportion of individuals with a genotype who express the corresponding phenotype.', 'The transfer of NADPH across the thylakoid membrane in light.', 'The movement of ions against a concentration gradient using ATP.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which example represents a dominant allele with incomplete penetrance in humans?', 'choices', jsonb_build_array('The allele for severe sickle-cell anemia.', 'The allele for cystic fibrosis.', 'The allele for extra fingers or toes: some individuals inherit the dominant allele but have a normal number of digits.', 'The hairless allele in Mexican dogs.'), 'answer_index', 2),
      jsonb_build_object('question', 'Which human hereditary disease is controlled by a recessive allele with 100% complete penetrance?', 'choices', jsonb_build_array('Partial color blindness', 'Cystic fibrosis', 'Heterozygous sickle-cell condition', 'Radiation-induced microcephaly'), 'answer_index', 1),
      jsonb_build_object('question', 'What is meant by expressivity in modern genetics?', 'choices', jsonb_build_array('The ability of a gene to move from one chromosome to another during crossing over.', 'The degree to which an allele can produce a range of different phenotypes among individuals who carry it.', 'The sum of enzyme-assisted chemical reactions in the cytoplasm.', 'The proportion of living offspring from a cross involving dominant lethal alleles.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which textbook example illustrates variable expressivity in the appearance of limbs or digits?', 'choices', jsonb_build_array('The rabbit coat-color gene.', 'The recessive eyeless gene in insects.', 'The gene for extra digits, which may produce one complete extra finger on one hand, small skin tags, or extra digits on all hands and feet.', 'The gene for the human AB blood group.'), 'answer_index', 2)
    )
  ),
  (
    'nadia-en-ch5-lec11-exam',
    'Gene Interaction and Epistasis',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific description of gene interaction?', 'choices', jsonb_build_array('The integration of viral DNA with bacterial DNA without destroying it.', 'The production of new phenotypes for a particular trait through interaction between alleles of different genes.', 'The ATP-dependent transport of materials across the plasma membrane.', 'Parthenogenetic embryonic growth from an unfertilized egg after heat shock.'), 'answer_index', 1),
      jsonb_build_object('question', 'What are the two main types of gene interaction summarized in the curriculum?', 'choices', jsonb_build_array('Monogenic interaction and Mendelian digenic interaction.', 'Gene interaction that changes the expected phenotypic ratios and gene interaction that does not change them.', 'Interaction in monocotyledonous and dicotyledonous plants.', 'Interaction of lethal alleles and incomplete penetrance.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which textbook example shows gene interaction that does not alter the expected 9:3:3:1 phenotypic ratio?', 'choices', jsonb_build_array('Flower color in snapdragons.', 'Comb shape in chickens, where two genes produce four phenotypes: rose, pea, walnut, and single combs.', 'Fruit color in summer squash.', 'Sickle-cell anemia in humans.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which curriculum example shows gene interaction that alters the expected phenotypic ratio, namely epistasis?', 'choices', jsonb_build_array('Hair color in shorthorn cattle.', 'Fruit color in squash, where two genes produce white, yellow, and green fruits in a 12:3:1 ratio.', 'The human MN blood-group system.', 'Stem length in Mendelian peas.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is meant by epistasis in gene interaction?', 'choices', jsonb_build_array('An increase in the division rate of mature nerve cells.', 'A gene interaction in which one gene cancels, suppresses, or masks the expression of another gene located at a different chromosomal locus.', 'Chromosome duplication to a tetraploid state during interphase.', 'The ability of cells to differentiate and undergo morphogenesis after gastrulation.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec12-exam',
    'Multiple Alleles and the ABO System',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of multiple alleles?', 'choices', jsonb_build_array('The presence of one fixed allele in every member of a species.', 'The presence of several alternative alleles of the same gene, produced by different mutations in DNA and occupying the same locus; an individual can carry only two of them.', 'The exchange of segments between non-sister chromatids at chiasmata.', 'An increase in the number of autosomes following the first meiotic division.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which human genetic system is the clearest and best-known example of multiple alleles?', 'choices', jsonb_build_array('The MN blood-group system', 'The ABO blood-group system, controlled by three different alleles of gene I.', 'Severe sickle-cell anemia', 'Down syndrome'), 'answer_index', 1),
      jsonb_build_object('question', 'Which three alleles determine the human A, B, AB, and O blood groups?', 'choices', jsonb_build_array('Lᴹ, Lᴺ, and Lᴹᴺ', 'The dominant alleles Iᴬ and Iᴮ and the recessive allele i.', 'Cᴿ, Cᵂ, and Cᴳ', 'T, t, and Tᵗ'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the genetic relationship between Iᴬ and Iᴮ when they occur together in a person with blood group AB?', 'choices', jsonb_build_array('Complete Mendelian dominance', 'Codominance: both alleles are expressed without blending, producing blood group AB.', 'Incomplete dominance producing an intermediate trait', 'Lethal alleles that kill the embryo'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the genotype of a person with the always-homozygous recessive blood group O?', 'choices', jsonb_build_array('IᴬIᴬ', 'ii', 'IᴬIᴮ', 'Iᴮi'), 'answer_index', 1),
      jsonb_build_object('question', 'How many possible genotypes are there for blood group A and for blood group B?', 'choices', jsonb_build_array('One homozygous genotype for each group.', 'Two for each group: a homozygous genotype (IᴬIᴬ or IᴮIᴮ) and a heterozygous genotype (Iᴬi or Iᴮi).', 'Three epistatic genotypes for each group.', 'Heterozygous genotypes disappear because of genetic penetrance.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec13-exam',
    'Rh Factor and Incompatibility',
    jsonb_build_array(
      jsonb_build_object('question', 'Where are Rh-factor antigens found in human blood, and where were they first discovered?', 'choices', jsonb_build_array('Floating in the nucleoplasm of the interphase nucleus.', 'On the surface of red blood cells; these special antigens were first discovered in the blood of rhesus monkeys.', 'Inside smooth secretory vesicles of the Golgi apparatus.', 'Attached to vascular bundles in dicotyledonous plants.'), 'answer_index', 1),
      jsonb_build_object('question', 'Approximately what percentages of humans are Rh-positive and Rh-negative?', 'choices', jsonb_build_array('50% Rh-positive and 50% Rh-negative.', 'About 85% are Rh-positive and 15% are Rh-negative.', '99% are Rh-positive and 1% are Rh-negative.', 'The percentages vary randomly with surrounding osmotic solutions.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the inheritance relationship between the Rh-positive and Rh-negative traits?', 'choices', jsonb_build_array('Rh-positive is always controlled by a recessive allele.', 'Rh-positive is dominant over the recessive Rh-negative trait.', 'The trait shows incomplete dominance and produces an intermediate phenotype.', 'It is controlled by lethal alleles that kill homozygous dominant embryos.'), 'answer_index', 1),
      jsonb_build_object('question', 'Under which parental and fetal Rh combination does Rh incompatibility create a serious medical risk?', 'choices', jsonb_build_array('An Rh-negative father, an Rh-positive mother, and an Rh-negative fetus.', 'An Rh-negative mother, an Rh-positive father, and an Rh-positive fetus that inherited the dominant trait from the father.', 'Two homozygous Rh-positive parents.', 'A pregnancy involving conjoined twins during the secretory phase.'), 'answer_index', 1),
      jsonb_build_object('question', 'What happens when Rh-positive fetal antigens enter the circulation of an Rh-negative mother during the first delivery?', 'choices', jsonb_build_array('Her cytoplasm is completely digested by autolysis.', 'Her immune system is stimulated to produce antibodies against Rh-positive antigens; the first fetus is usually unaffected because birth occurs before enough antibodies accumulate.', 'Hydrostatic pressure rises and all her cells undergo plasmolysis.', 'Her somatic cells divide rapidly by longitudinal binary fission.'), 'answer_index', 1),
      jsonb_build_object('question', 'How can a later Rh-positive fetus be affected if an Rh-negative mother receives no preventive treatment?', 'choices', jsonb_build_array('It is born completely healthy and its blood group changes to O.', 'Maternal antibodies cross the placenta and destroy fetal red blood cells, causing jaundice and severe anemia that may lead to death.', 'Its muscular and cardiac systems become more efficient because of gene interaction.', 'It becomes a clone carrying exactly the same genetic material as the father.'), 'answer_index', 1),
      jsonb_build_object('question', 'What preventive medical procedure protects later fetuses of an Rh-negative mother with an Rh-positive partner?', 'choices', jsonb_build_array('Spraying the uterus with plant auxins and gibberellins.', 'Giving the mother an anti-Rh injection within 72 hours after the first delivery to destroy Rh-positive cells that entered her blood and prevent antibody formation.', 'Placing the fetus in a hypotonic solution.', 'Immediately performing somatic nuclear transplantation.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec14-exam',
    'Multiple Alleles and Rabbit Coat Color',
    jsonb_build_array(
      jsonb_build_object('question', 'Which genetic phenomenon is illustrated by coat color in rabbits?', 'choices', jsonb_build_array('Incomplete dominance', 'Multiple alleles', 'Epistatic gene interaction', 'Incomplete penetrance'), 'answer_index', 1),
      jsonb_build_object('question', 'How many alleles control rabbit coat color, and what is their descending order of dominance?', 'choices', jsonb_build_array('Only two alleles, one dominant and one recessive.', 'Four alleles: full color or gray, which is completely dominant, followed by chinchilla, Himalayan, and albino, which is completely recessive.', 'Three equally dominant codominant alleles.', 'Eight alleles with phenotypes scattered through the cytoplasm.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which symbols represent the four alleles controlling rabbit coat color, in order?', 'choices', jsonb_build_array('T, t, Tᶜ, and tʰ', 'Gray (C), chinchilla (cᶜʰ), Himalayan (cʰ), and albino (c).', 'Iᴬ, Iᴮ, Iᴬᴮ, and i', 'Lᴹ, Lᴺ, Lᴹᴺ, and L'), 'answer_index', 1),
      jsonb_build_object('question', 'How many genotypes can produce a gray rabbit because C is completely dominant over the other alleles?', 'choices', jsonb_build_array('One genotype, always pure.', 'Four genotypes: one homozygous genotype (CC) and three heterozygous genotypes (Ccᶜʰ), (Ccʰ), and (Cc).', 'Only two genotypes.', 'The homozygous genotype disappears because of lethal alleles.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the genotype of an albino rabbit, and what is its genetic status?', 'choices', jsonb_build_array('CC, homozygous dominant.', 'cc, always homozygous recessive and the least dominant allele.', 'cʰcʰ', 'cᶜʰc'), 'answer_index', 1),
      jsonb_build_object('question', 'How many genotypes produce the chinchilla phenotype, and with which alleles can chinchilla be heterozygous?', 'choices', jsonb_build_array('One genotype only.', 'Three genotypes: homozygous cᶜʰcᶜʰ and heterozygous cᶜʰcʰ or cᶜʰc.', 'Four randomly dispersed vascular genotypes.', 'One heterozygous genotype only with the completely dominant gray allele.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the genotype of a Himalayan rabbit heterozygous with albino?', 'choices', jsonb_build_array('cʰcʰ', 'cʰc', 'cᶜʰcʰ', 'Ccʰ'), 'answer_index', 1)
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
