-- Nadia Al-Nuaimi · English curriculum · Chapter 5 · Topics 1–7
-- Faithful English counterparts of the Arabic-curriculum MCQs, using the
-- terminology of the supplied English genetics notes.
WITH translated(topic_key, title, questions) AS (
  VALUES
  (
    'nadia-en-ch5-lec1-exam',
    'Genetics and Gregor Mendel',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of Genetics according to the biology textbook?', 'choices', jsonb_build_array('The science that studies hermaphroditic reproduction and the formation of unfertilized eggs.', 'A branch of biology that studies hereditary variations and explains how hereditary traits are transmitted from one generation to another.', 'The science that studies structural changes in germ layers during gastrulation.', 'A branch concerned with respiratory enzymes in mitochondria and energy production.'), 'answer_index', 1),
      jsonb_build_object('question', 'What are the three main fields on which modern genetics focuses?', 'choices', jsonb_build_array('Cellulose synthesis, parthenocarpy, and plasmolysis.', 'The transmission of hereditary traits between generations; the molecular structure of hereditary material and its changes; and how hereditary material expresses itself at cellular and phenotypic levels.', 'Binary fission, budding, and amitosis.', 'Diagnosis of abnormalities, animal cloning, and somatic nuclear transplantation.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which ancient peoples first recognized the role of heredity in life by applying breeding methods to plants and animals?', 'choices', jsonb_build_array('The peoples of South America during the Middle Ages.', 'The inhabitants of Mesopotamia and the Nile Valley, who improved varieties of plants such as date palms and animals such as horses.', 'The peoples of northern Europe during the late Ice Age.', 'Ancient African tribes through collecting spores of conjugating fungi.'), 'answer_index', 1),
      jsonb_build_object('question', 'Who was the Austrian monk who laid the foundation of the science of genetics through his experiments on pea plants?', 'choices', jsonb_build_array('Robert Brown', 'Gregor Johann Mendel', 'Thomas Morgan', 'Camillo Golgi'), 'answer_index', 1),
      jsonb_build_object('question', 'In what year did Gregor Mendel present his research on plant hybrids, and how long did it remain unnoticed before its rediscovery?', 'choices', jsonb_build_array('He presented it in 1831, and it remained unnoticed for only one year.', 'He presented it in 1865, and it remained unnoticed for 34 years until three scientists rediscovered his hypotheses in 1900.', 'He presented it in 1953 with the discovery of the molecular structure of DNA.', 'He presented it at the time of the cloning of Dolly the sheep.'), 'answer_index', 1),
      jsonb_build_object('question', 'Why was the research of Mendel overlooked for many years?', 'choices', jsonb_build_array('Because Mendel did not secrete mucous material to demonstrate pollen germination pores.', 'Because scientists at that time were occupied with Darwinian biological evolution.', 'Because housefly chromosomes were too difficult to examine.', 'Because his experiments were restricted to viviparous parasitic animals.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec2-exam',
    'Pea Plants and Mendel''s Success',
    jsonb_build_array(
      jsonb_build_object('question', 'Which model plant did Gregor Mendel choose for his famous genetic experiments?', 'choices', jsonb_build_array('Tomato plant', 'Garden pea plant', 'Dicotyledonous broad bean plant', 'The green alga Chlamydomonas'), 'answer_index', 1),
      jsonb_build_object('question', 'Why was the garden pea an ideal and successful model for the genetic experiments of Mendel?', 'choices', jsonb_build_array('Its seeds are very large, permanently white, and easily dispersed by wind.', 'It has a short life cycle, is easy to cultivate and cross-pollinate artificially, produces many offspring, and has several clear pairs of contrasting traits.', 'It contains abundant endosperm and very large cell sap.', 'It reproduces by longitudinal binary fission in shallow water.'), 'answer_index', 1),
      jsonb_build_object('question', 'How many clear pairs of contrasting hereditary traits did Mendel follow in the pea plant?', 'choices', jsonb_build_array('One trait only', 'Seven pairs of contrasting traits', 'Twelve different traits', 'Forty-six hereditary traits'), 'answer_index', 1),
      jsonb_build_object('question', 'Which option includes examples of the seven contrasting traits studied by Mendel in pea plants?', 'choices', jsonb_build_array('False-fruit size and stigma viscosity.', 'Stem length, whether tall or short; pod shape, whether inflated or constricted; and seed color, whether yellow or green.', 'Number of cotyledons and type of leaf venation.', 'Presence of fat bodies during winter hibernation.'), 'answer_index', 1),
      jsonb_build_object('question', 'Why did Mendel succeed in formulating the laws of heredity while earlier scientists failed?', 'choices', jsonb_build_array('He studied all complex plant traits together in the same generation.', 'He focused on one pair or a small number of traits in each experiment, kept accurate continuous records, and analyzed the results statistically.', 'He used an advanced electron microscope to examine chromosomes and genes.', 'He relied entirely on natural parthenogenesis without cross-pollination.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec3-exam',
    'Monohybrid Cross and Complete Dominance',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of a monohybrid cross?', 'choices', jsonb_build_array('A genetic cross that studies two different pairs of contrasting traits at the same time.', 'A genetic cross between two individuals that involves one pair of contrasting traits, such as tall and short stems.', 'The fusion of a plasmid fertility factor with the chromosome of a donor cell.', 'A parthenogenetic process that produces haploid males without sperm.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which symbols represent the parental generation, the gametes, and the first filial generation, respectively?', 'choices', jsonb_build_array('M, N, and O', 'P₁, G₁, and F₁', 'A, B, and C', 'X, Y, and Z'), 'answer_index', 1),
      jsonb_build_object('question', 'What is produced in the first filial generation when a pure tall pea plant is crossed with a short pea plant?', 'choices', jsonb_build_array('50% tall plants and 50% short plants.', '100% hybrid tall plants.', '100% pure short plants.', 'Intermediate-height plants due to incomplete dominance.'), 'answer_index', 1),
      jsonb_build_object('question', 'What phenotypic ratio appears in the second filial generation when hybrid tall F₁ plants self-pollinate?', 'choices', jsonb_build_array('1 tall : 1 short', '3 tall : 1 short', '9 tall : 3 short : 4 intermediate', '100% hybrid tall'), 'answer_index', 1),
      jsonb_build_object('question', 'What is meant by a dominant trait in a monohybrid cross?', 'choices', jsonb_build_array('A trait that disappears completely in F₁ and appears only in F₂.', 'A trait that appears in 100% of F₁ individuals when two pure parents with contrasting traits are crossed.', 'A trait that contains no hereditary factors or chromosomes.', 'A trait that appears only in male honeybees through parthenogenesis.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is a recessive trait, and what is its genetic purity?', 'choices', jsonb_build_array('A trait that appears in 100% of offspring and is always hybrid.', 'A trait that disappears in F₁ when pure contrasting parents are crossed and reappears in F₂; it is always homozygous.', 'A trait produced by fusion of a male nucleus with the two polar nuclei.', 'A trait that changes from season to season according to cellular metabolism.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec4-exam',
    'Testcross and Backcross',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of a testcross?', 'choices', jsonb_build_array('A cross between two hybrids for different traits in the second generation.', 'A cross used to determine the genotype of an individual with a dominant phenotype of unknown purity by crossing it with an individual showing the recessive form of the same trait.', 'The fusion of two male nuclei with a polar nucleus inside the embryo sac.', 'The introduction of a fertility-factor plasmid into a recipient bacterial cell.'), 'answer_index', 1),
      jsonb_build_object('question', 'In a testcross, if 100% of the offspring show the dominant trait, what is the genotype of the unknown dominant parent?', 'choices', jsonb_build_array('The parent is always heterozygous.', 'The parent is homozygous for the trait.', 'The parent is recessive and sterile.', 'The organism is tetraploid.'), 'answer_index', 1),
      jsonb_build_object('question', 'In a testcross, if 50% of the offspring show the dominant trait and 50% show the recessive trait, what is the genotype of the unknown parent?', 'choices', jsonb_build_array('The parent is always homozygous.', 'The parent is heterozygous for the trait.', 'Its cell wall decomposes and the hereditary factors disappear.', 'It must be a monocotyledonous plant.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the standard definition of a backcross?', 'choices', jsonb_build_array('A cross between two recessive individuals that always produces a pure generation.', 'A cross between hybrid individuals of F₁ and either parent, or an individual genetically identical to either parent.', 'The transfer of pollen from an anther to the stigma of a completely different genus.', 'The direct injection of one sperm into the cytoplasm of an egg.'), 'answer_index', 1),
      jsonb_build_object('question', 'In a backcross involving an F₁ hybrid tall pea plant (Tt), with which individuals may it be crossed?', 'choices', jsonb_build_array('Only with a short-stemmed plant.', 'With either the pure tall parent (TT) or the recessive short parent (tt).', 'Only with sterile F₂ plants.', 'With Chlamydomonas.'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec5-exam',
    'Dihybrid Cross and Independent Assortment',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of a dihybrid cross?', 'choices', jsonb_build_array('A cross that studies one pair of contrasting traits.', 'A genetic cross that studies two independent pairs of contrasting traits at the same time, such as seed color and seed shape.', 'The fusion of two male nuclei with two polar nuclei inside the embryo sac.', 'The transfer of a plasmid fertility factor across a bacterial conjugation bridge.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the scientific name of the second law of Mendel?', 'choices', jsonb_build_array('Law of Segregation', 'Law of Independent Assortment', 'Law of Genetic Penetrance', 'Law of Incomplete Dominance'), 'answer_index', 1),
      jsonb_build_object('question', 'What does the second law of Mendel, the Law of Independent Assortment, state?', 'choices', jsonb_build_array('Paired hereditary factors separate during gamete formation and later unite at random.', 'Pairs of separated hereditary factors assort independently of one another during gamete formation.', 'Contrasting traits blend to produce an intermediate phenotype in every case.', 'Recessive traits disappear completely from the second generation.'), 'answer_index', 1),
      jsonb_build_object('question', 'When a pure yellow, round-seeded pea plant (GGWW) is crossed with a green, wrinkled-seeded plant (ggww), what is the phenotype of every F₁ individual?', 'choices', jsonb_build_array('Green and wrinkled.', 'Yellow and round, heterozygous for both traits (GgWw).', '50% yellow and round and 50% green and wrinkled.', 'Seedless false fruits formed by parthenocarpy.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the characteristic F₂ phenotypic ratio when dihybrid plants (GgWw) self-pollinate under independent assortment?', 'choices', jsonb_build_array('3 : 1', '9 : 3 : 3 : 1', '1 : 2 : 1', '1 : 1 : 1 : 1'), 'answer_index', 1),
      jsonb_build_object('question', 'Which grid is used to show possible genotypes and phenotypes in complex crosses such as a dihybrid cross?', 'choices', jsonb_build_array('Cell plate', 'Punnett square', 'Prothallus', 'Protoplasmic conjugation bridge'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec6-exam',
    'Probability in Genetics',
    jsonb_build_array(
      jsonb_build_object('question', 'How is probability defined, and how is it used in genetics?', 'choices', jsonb_build_array('A fixed hereditary ratio that is always 3:1 in every cross.', 'The estimated chance that a particular event will occur; in genetics it predicts the proportions of genotypes and phenotypes among offspring.', 'A measure of oxides secreted by mitochondria during respiration.', 'A mathematical method for calculating the time at which nerve cells divide at puberty.'), 'answer_index', 1),
      jsonb_build_object('question', 'What is the basic mathematical equation for the probability of an event?', 'choices', jsonb_build_array('Probability = number of dominant genes ÷ number of recessive genes', 'Probability = number of ways the event can occur ÷ total number of possible outcomes.', 'Probability = number of F₁ offspring × 100 ÷ 46', 'Probability = hydrostatic pressure + osmotic pressure'), 'answer_index', 1),
      jsonb_build_object('question', 'How can probabilities be expressed in Mendelian crosses?', 'choices', jsonb_build_array('Only by the osmotic pull of a concentrated solution.', 'As common fractions such as 1/4 or 3/4, percentages such as 25% or 75%, or decimal values.', 'Only as odd whole numbers from 1 to 7.', 'By counting germination pores in the pollen wall.'), 'answer_index', 1),
      jsonb_build_object('question', 'What does the multiplication rule determine when two independent traits are studied together?', 'choices', jsonb_build_array('The probability of two independent events occurring together equals the product of their separate probabilities.', 'The probability of two independent events equals the sum of their probabilities divided by two.', 'The probability of the recessive trait disappears completely in F₂.', 'Probability always quadruples in the presence of ATP.'), 'answer_index', 0),
      jsonb_build_object('question', 'When two individuals heterozygous for stem length (Tt) are crossed, what is the probability of a short plant (tt)?', 'choices', jsonb_build_array('100%', '1/4 or 25%', '3/4 or 75%', '1/2 or 50%'), 'answer_index', 1)
    )
  ),
  (
    'nadia-en-ch5-lec7-exam',
    'Incomplete Dominance',
    jsonb_build_array(
      jsonb_build_object('question', 'What is the precise scientific definition of incomplete dominance?', 'choices', jsonb_build_array('A phenomenon in which the phenotype is identical to that of one pure dominant parent.', 'A phenomenon in which the phenotype of the hybrid differs from both parents and is intermediate between them because both alleles are expressed.', 'The fusion of bacterial genetic material to form a new recombinant strain.', 'The complete disappearance and digestion of recessive traits in the cytoplasm.'), 'answer_index', 1),
      jsonb_build_object('question', 'Which model plant is used in the textbook as the clearest example of incomplete dominance?', 'choices', jsonb_build_array('Mendelian pea plant', 'Snapdragon', 'Dicotyledonous broad bean', 'White potato tubers'), 'answer_index', 1),
      jsonb_build_object('question', 'When a red-flowered snapdragon (CᴿCᴿ) is crossed with a white-flowered snapdragon (CᵂCᵂ), what are the phenotype and genotype of all F₁ plants?', 'choices', jsonb_build_array('100% red flowers', '100% pink flowers with genotype CᴿCᵂ.', '50% red and 50% white flowers', '100% transparent white flowers'), 'answer_index', 1),
      jsonb_build_object('question', 'What phenotypic and genotypic ratio appears in F₂ when pink snapdragons self-pollinate?', 'choices', jsonb_build_array('3 red : 1 white', '1 red (CᴿCᴿ) : 2 pink (CᴿCᵂ) : 1 white (CᵂCᵂ), or 1:2:1.', '9 red : 3 pink : 4 white', '100% hybrid pink'), 'answer_index', 1),
      jsonb_build_object('question', 'How does incomplete dominance differ from complete Mendelian dominance in the F₂ phenotypic ratio?', 'choices', jsonb_build_array('Complete dominance gives 9:3:3:1, while incomplete dominance gives 3:1.', 'Complete dominance gives a 3:1 phenotypic ratio, whereas in incomplete dominance the phenotypic ratio equals the genotypic ratio, 1:2:1.', 'There is no difference; both produce homozygous offspring only.', 'Incomplete dominance always produces haploid offspring.'), 'answer_index', 1)
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
