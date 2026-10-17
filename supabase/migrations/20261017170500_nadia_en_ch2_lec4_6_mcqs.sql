-- Nadia Al-Nuaimi · English curriculum · Chapter 2 · Topics 4–6

INSERT INTO public.teacher_topic_mcqs (teacher_id, topic_key, title, questions)
SELECT 'nadia-al-nuaimy','nadia-en-ch2-lec4-exam','Topic 4 — Sclerenchyma Tissue',$json$
[
 {"question":"Cells that are dead and have thickened walls containing lignin are characteristic of:","choices":["parenchyma tissue.","collenchyma tissue.","sclerenchyma tissue.","meristematic tissue."],"answer_index":2},
 {"question":"Sclerenchyma cell walls are thickened because they contain:","choices":["lignin.","chlorophyll pigment.","chloroplasts.","intercellular substances."],"answer_index":0},
 {"question":"The main function of sclerenchyma tissue is:","choices":["ventilation and food storage and transport.","secondary growth and plant thickening.","internode elongation.","support and strengthening."],"answer_index":3},
 {"question":"What are the types of sclerenchyma cells?","choices":["Vascular cambium and cork cambium.","Fibers and sclereids.","Secondary xylem and phloem.","Parenchyma and collenchyma cells."],"answer_index":1},
 {"question":"What characterizes fibers?","choices":["They are spherical or polygonal.","They are short cells found in some fruits.","They are long and have pointed ends.","They are living, elongated cells with irregularly thickened walls."],"answer_index":2},
 {"question":"Fibers occur singly or in bundles in:","choices":["plant parts requiring strengthening.","the tips of roots and stems.","the internodes of many monocotyledonous plants.","permanent plant tissues away from growing tips."],"answer_index":0},
 {"question":"What characterizes sclereids?","choices":["Living, thin-walled cells.","Long cells with pointed ends.","Living, elongated cells with irregularly thickened walls.","Short cells found in some fruits such as pears and guavas."],"answer_index":3},
 {"question":"Why are pears hard fruits?","choices":["Because of pressure from neighboring cells.","Because they contain sclereids, which are sclerenchyma cells.","Because large sap vacuoles store and transport food.","Because they contain chloroplasts."],"answer_index":1},
 {"question":"According to the comparison table, the sclerenchyma cells forming fibers and sclereids differentiate from:","choices":["apical meristematic tissue.","cork cambium.","ground tissue.","intercalary meristematic tissue."],"answer_index":2},
 {"question":"According to the comparison table, what characterizes sclerenchyma tissue regarding intercellular spaces and the sap vacuole?","choices":["Neither intercellular spaces nor a sap vacuole is present.","Both intercellular spaces and a sap vacuole are present.","Intercellular spaces are present, but no sap vacuole.","No intercellular spaces are present, but a sap vacuole is present."],"answer_index":0}
]$json$::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec4-exam');

INSERT INTO public.teacher_topic_mcqs (teacher_id, topic_key, title, questions)
SELECT 'nadia-al-nuaimy','nadia-en-ch2-lec5-exam','Topic 5 — Epidermal Tissue',$json$
[
 {"question":"Which tissue covers the plant?","choices":["Ground tissue.","Epidermal tissue.","Vascular tissue.","Meristematic tissue."],"answer_index":1},
 {"question":"What forms the epidermal layer?","choices":["Living, thin-walled cells.","Dead cells with thickened, lignified walls.","Living, elongated cells with irregularly thickened walls.","A single row of thickened cells covering the plant body."],"answer_index":3},
 {"question":"What characterizes epidermal cells in shape and arrangement?","choices":["Flattened and closely packed.","Spherical or polygonal.","Long with pointed ends.","Elongated with irregularly thickened walls."],"answer_index":0},
 {"question":"What is the state of intercellular spaces in epidermal tissue and then parenchyma tissue, respectively?","choices":["Present — present.","Present — absent.","Absent — present.","Absent — absent."],"answer_index":2},
 {"question":"What is the function of epidermal tissue?","choices":["Ventilation and food storage and transport.","Protection, regulation of gas exchange, and water absorption.","Transport of water and food within the plant, as well as support.","Production of new cells that increase plant length and thickness."],"answer_index":1},
 {"question":"Gas exchange in epidermal tissue is regulated through:","choices":["companion cells.","chlorenchyma cells.","sclereids.","pairs of guard cells."],"answer_index":3},
 {"question":"According to the summary table, epidermal tissue regulates gas exchange in the:","choices":["stem and leaves.","tips of roots and stems.","cortex, pith, and pith rays.","internodes of many monocotyledonous plants."],"answer_index":0},
 {"question":"According to the table, epidermal tissue in roots absorbs:","choices":["food produced in the leaf.","organic molecules.","water and dissolved salts.","carbohydrates."],"answer_index":2},
 {"question":"According to the table, where does epidermal tissue absorb water and dissolved salts?","choices":["Leaves.","Roots.","Stem.","Pith rays."],"answer_index":1},
 {"question":"Which option correctly matches the location of ground tissue and then epidermal tissue, respectively?","choices":["Outer layer of plant parts — internal tissue masses.","Internal tissue masses — internal tissue masses.","Outer layer of plant parts — outer layer of plant parts.","Internal tissue masses — outer layer of plant parts."],"answer_index":3}
]$json$::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec5-exam');

INSERT INTO public.teacher_topic_mcqs (teacher_id, topic_key, title, questions)
SELECT 'nadia-al-nuaimy','nadia-en-ch2-lec6-exam','Topic 6 — Vascular Tissue and Xylem',$json$
[
 {"question":"What is the function of vascular tissue?","choices":["Protection, regulation of gas exchange, and water absorption.","Ventilation and food storage and transport.","Transport of water and food within the plant, as well as support.","Production of new cells that increase plant length and thickness."],"answer_index":2},
 {"question":"Vascular tissue is divided into:","choices":["xylem and phloem.","vascular cambium and cork cambium.","fibers and sclereids.","parenchyma and collenchyma."],"answer_index":0},
 {"question":"What is the origin of xylem tissue?","choices":["Parenchyma cells.","Collenchyma cells.","Sclerenchyma cells.","Elongated meristematic cells."],"answer_index":3},
 {"question":"During xylem formation, meristematic cells undergo a large increase in:","choices":["irregular wall thickening.","size.","length and pointed ends.","flattening and close packing."],"answer_index":1},
 {"question":"Complete the description of xylem formation: When fully mature, the cells lose their living contents and become ______.","choices":["living, thin-walled cells","undifferentiated cells","dead cells","chlorenchyma cells"],"answer_index":2},
 {"question":"What does xylem tissue consist of?","choices":["Xylem vessels, tracheids, xylem fibers, and xylem parenchyma.","Sieve tubes, companion cells, phloem fibers, and phloem parenchyma.","Xylem vessels, companion cells, xylem fibers, and phloem parenchyma.","Sieve tubes, tracheids, phloem fibers, and xylem parenchyma."],"answer_index":0},
 {"question":"Why are xylem vessels distinguished into several types?","choices":["Because of pressure exerted by neighboring cells.","Because large sap vacuoles store and transport food.","Because their cell walls are irregularly thickened and because of their distribution.","Because they vary according to the pattern of wall thickening."],"answer_index":3},
 {"question":"How do tracheids differ from xylem vessels?","choices":["Their spherical or polygonal shape.","Their pointed ends.","Their flattened, closely packed cells.","Their large sap vacuole."],"answer_index":1},
 {"question":"What is the function of vessels and tracheids in xylem tissue?","choices":["Transport food produced in the leaf.","Protection and regulation of gas exchange.","Transport water and dissolved minerals.","Absorb water and dissolved salts in roots."],"answer_index":2},
 {"question":"According to the plant-tissue summary table, what are the functions of xylem?","choices":["Transport of water and minerals, storage, support, and strengthening.","Photosynthesis, storage and respiration, and support.","Protection, regulation of gas exchange, and absorption of water and dissolved salts.","Transport of organic molecules, transport of carbohydrates to and from sieve tubes, support, and storage."],"answer_index":0}
]$json$::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec6-exam');
