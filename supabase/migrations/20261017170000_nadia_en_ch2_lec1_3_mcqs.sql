-- Nadia Al-Nuaimi · English curriculum · Chapter 2 · Topics 1–3

INSERT INTO public.teacher_topic_mcqs (teacher_id, topic_key, title, questions)
SELECT 'nadia-al-nuaimy', 'nadia-en-ch2-lec1-exam', 'Topic 1 — Introduction to Tissues', $json$
[
  {"question":"A tissue is a group of ______, together with certain cellular products, specialized to perform a specific function.","choices":["specialized cells","similar cells","tissue cells","unicellular organisms"],"answer_index":1},
  {"question":"A tissue is a group of similar cells together with ______ that are specialized to perform a specific function.","choices":["different organs","functional tissues","intercellular substances","certain cellular products"],"answer_index":3},
  {"question":"Complex organisms are composed of cells arranged as ______ within different organs.","choices":["functional tissues","certain cellular products","intercellular substances","unicellular organisms"],"answer_index":0},
  {"question":"These tissues work together ______ to build the organism.","choices":["occasionally","within different organs","in complete coordination","as functional tissues"],"answer_index":2},
  {"question":"Sometimes, the ______ may vary.","choices":["types of tissues","intercellular substances","certain cellular products","tissue cells"],"answer_index":3},
  {"question":"Large quantities of ______ may also be formed in tissues.","choices":["specialized cells","intercellular substances","similar cells","different organs"],"answer_index":1},
  {"question":"Some tissues contain large quantities of intercellular substances, which also vary in their ______.","choices":["composition","formation","types","characteristics"],"answer_index":0},
  {"question":"Organisms composed of a single cell are called:","choices":["similar cells","specialized cells","unicellular organisms","complex organisms"],"answer_index":2},
  {"question":"Histology is the science concerned with studying tissue structure and its differentiation among the ______ of living organisms.","choices":["organs","specialized cells","tissues","unicellular organisms"],"answer_index":0},
  {"question":"Some living organisms have bodies composed of many ______ that work together as functional tissues within organs.","choices":["similar cells","specialized cells","tissue cells","certain cellular products"],"answer_index":1}
]$json$::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec1-exam');

INSERT INTO public.teacher_topic_mcqs (teacher_id, topic_key, title, questions)
SELECT 'nadia-al-nuaimy', 'nadia-en-ch2-lec2-exam', 'Topic 2 — Meristematic Tissue', $json$
[
  {"question":"Meristematic tissue is characterized by the ability of its cells to ______ and is found in plant parts showing divisional activity.","choices":["undergo secondary growth","elongate the internodes","divide continuously","regrow rapidly"],"answer_index":2},
  {"question":"Where is apical meristematic tissue located?","choices":["At the tips of roots and stems.","Among permanent plant tissues, away from growing tips.","In plant parts away from the growing tips.","In the internodes of many monocotyledonous plants."],"answer_index":0},
  {"question":"Plant parts away from the growing tips, on the side and parallel to the plant's outer surface, are the location of:","choices":["apical meristematic tissue.","intercalary meristematic tissue.","secondary xylem tissue.","lateral meristematic tissue."],"answer_index":3},
  {"question":"What is the function of lateral meristematic tissue?","choices":["Growth at the tips of roots and stems.","Secondary growth and thickening in plants.","Elongation of plant internodes.","Rapid regrowth of mature leaves."],"answer_index":1},
  {"question":"The location among permanent plant tissues, away from growing tips, as in the internodes of many monocotyledonous plants, belongs to:","choices":["lateral meristematic tissue.","apical meristematic tissue.","intercalary meristematic tissue.","cork cambium."],"answer_index":2},
  {"question":"Identify the tissue responsible for internode elongation:","choices":["Intercalary meristematic tissue.","Apical meristematic tissue.","Vascular cambium.","Cork cambium."],"answer_index":0},
  {"question":"Identify the tissue responsible for rapid regrowth of mature leaves:","choices":["Cork cambium.","Apical meristematic tissue.","Vascular cambium.","Intercalary meristematic tissue."],"answer_index":3},
  {"question":"What is the origin of secondary xylem and secondary phloem?","choices":["Cork cambium.","Vascular cambium.","Apical meristematic tissue.","Intercalary meristematic tissue."],"answer_index":1},
  {"question":"What is the origin of the periderm?","choices":["Apical meristematic tissue.","Intercalary meristematic tissue.","Cork cambium.","Vascular cambium."],"answer_index":2},
  {"question":"What type of tissue is cork cambium?","choices":["Lateral meristematic tissue.","Intercalary meristematic tissue.","Apical meristematic tissue.","Secondary xylem tissue."],"answer_index":0}
]$json$::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec2-exam');

INSERT INTO public.teacher_topic_mcqs (teacher_id, topic_key, title, questions)
SELECT 'nadia-al-nuaimy', 'nadia-en-ch2-lec3-exam', 'Topic 3 — Ground, Parenchyma, and Collenchyma Tissues', $json$
[
  {"question":"The tissue whose cells differentiate to form the permanent tissues of the plant body and which forms internal tissue masses in roots, stems, and leaves is:","choices":["apical meristematic tissue.","ground tissue.","intercalary meristematic tissue.","lateral meristematic tissue."],"answer_index":1},
  {"question":"Ground tissue forms internal tissue masses in roots, stems, and leaves, represented by:","choices":["secondary xylem and phloem.","vascular cambium and cork cambium.","fibers and sclereids.","cortex, pith, and pith rays."],"answer_index":3},
  {"question":"What is the origin of pith rays?","choices":["Ground meristem.","Vascular cambium.","Cork cambium.","Intercalary meristematic tissue."],"answer_index":0},
  {"question":"What are the characteristics of parenchyma cells?","choices":["Living, elongated cells with irregularly thickened walls.","Dead cells with thickened walls containing lignin.","Living, thin-walled cells that are spherical or polygonal.","Long cells with pointed ends, found singly or in bundles."],"answer_index":2},
  {"question":"Why are parenchyma cells spherical or polygonal?","choices":["Because large sap vacuoles store and transport food.","Because of pressure exerted by neighboring cells.","Because their walls are thickened.","Because they contain chloroplasts."],"answer_index":1},
  {"question":"Why is ventilation one of the functions of parenchyma tissue?","choices":["Because it contains chloroplasts.","Because large sap vacuoles store and transport food.","Because its walls are thickened.","Because many intercellular spaces occur between its cells."],"answer_index":3},
  {"question":"Why is food storage one of the functions of parenchyma tissue?","choices":["Because large sap vacuoles store and transport food.","Because of pressure exerted by neighboring cells.","Because its walls are thickened.","Because it contains chloroplasts."],"answer_index":0},
  {"question":"Parenchyma cells containing chloroplasts, named for their chlorophyll and functioning in photosynthesis, are:","choices":["sclereids.","fibers.","chlorenchyma cells.","collenchyma cells."],"answer_index":2},
  {"question":"Why do chlorenchyma cells contribute to photosynthesis?","choices":["Because many intercellular spaces occur between the cells.","Because they contain chloroplasts.","Because large sap vacuoles store and transport food.","Because their walls are thickened."],"answer_index":1},
  {"question":"What characterizes collenchyma cells?","choices":["Living, thin-walled cells that are spherical or polygonal.","Dead cells with thickened walls containing lignin.","Long cells with pointed ends, found singly or in bundles.","Living, elongated cells with irregularly thickened walls."],"answer_index":3},
  {"question":"What is the main function of collenchyma tissue?","choices":["Support and strengthening.","Ventilation and the storage and transport of food.","Secondary growth and thickening in plants.","Elongation of plant internodes."],"answer_index":0},
  {"question":"Why does collenchyma tissue provide support and strengthening?","choices":["Because large sap vacuoles store and transport food.","Because of pressure exerted by neighboring cells.","Because its cell walls are irregularly thickened and because of its distribution in the plant.","Because many intercellular spaces occur between its cells."],"answer_index":2},
  {"question":"According to the study guide, where is collenchyma tissue found?","choices":["Among permanent plant tissues, away from growing tips.","In woody organs and plants, and in mature organs of herbaceous plants.","At the tips of roots and stems.","In the internodes of many monocotyledonous plants."],"answer_index":1},
  {"question":"Why are collenchyma cells rarely found in the roots and leaves of monocotyledonous plants?","choices":["Because of large sap vacuoles.","Because they contain chloroplasts.","Because of pressure exerted by neighboring cells.","Because their walls are thickened."],"answer_index":3},
  {"question":"What is the state of intercellular spaces in parenchyma tissue and then collenchyma tissue, respectively?","choices":["Present — absent.","Absent — present.","Present — present.","Absent — absent."],"answer_index":0}
]$json$::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec3-exam');
