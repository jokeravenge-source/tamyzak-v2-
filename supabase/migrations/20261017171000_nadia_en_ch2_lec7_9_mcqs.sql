-- Nadia Al-Nuaimi · English curriculum · Chapter 2 · Topics 7–9

INSERT INTO public.teacher_topic_mcqs (teacher_id,topic_key,title,questions)
SELECT 'nadia-al-nuaimy','nadia-en-ch2-lec7-exam','Topic 7 — Phloem Tissue',$json$
[
 {"question":"Phloem tissue is a division of:","choices":["ground tissue.","vascular tissue.","epidermal tissue.","meristematic tissue."],"answer_index":1},
 {"question":"Which cells form phloem tissue?","choices":["Xylem vessels, tracheids, xylem fibers, and xylem parenchyma.","Sieve tubes, tracheids, phloem fibers, and xylem parenchyma.","Xylem vessels, companion cells, xylem fibers, and phloem parenchyma.","Sieve tubes, companion cells, phloem fibers, and phloem parenchyma."],"answer_index":3},
 {"question":"What is the function of phloem cells other than fibers?","choices":["Transport food produced in the leaf.","Transport water and dissolved minerals.","Protection and regulation of gas exchange.","Produce new cells that increase plant length and thickness."],"answer_index":0},
 {"question":"Phloem cells specialize in transporting food produced in the leaf, except for:","choices":["sieve tubes.","companion cells.","phloem fibers.","phloem parenchyma."],"answer_index":2},
 {"question":"What is the function of phloem fibers?","choices":["Support and strengthening.","Transport food produced in the leaf.","Transport water and dissolved substances.","Protection and regulation of gas exchange."],"answer_index":0},
 {"question":"Phloem cells specialize in transporting food produced in the ______, except for fibers.","choices":["roots","stem","pith rays","leaf"],"answer_index":3},
 {"question":"Which pair is part of phloem tissue?","choices":["Xylem vessels and tracheids.","Sieve tubes and companion cells.","Xylem fibers and xylem parenchyma.","Vascular cambium and cork cambium."],"answer_index":1},
 {"question":"Phloem transports carbohydrates to and from:","choices":["xylem vessels.","tracheids.","sieve tubes.","xylem fibers."],"answer_index":2},
 {"question":"Which group represents the functions of phloem tissue?","choices":["Transport of water and minerals, storage, support, and strengthening.","Photosynthesis, storage and respiration, and support.","Protection, regulation of gas exchange, and absorption of water and dissolved salts.","Transport of organic molecules, transport of carbohydrates to and from sieve tubes, support, and storage."],"answer_index":3},
 {"question":"What do xylem vessels and tracheids transport, and what do phloem cells other than fibers transport, respectively?","choices":["Water and dissolved substances — food produced in the leaf.","Food produced in the leaf — water and dissolved substances.","Water and dissolved substances — water and dissolved substances.","Food produced in the leaf — food produced in the leaf."],"answer_index":0}
]$json$::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec7-exam');

INSERT INTO public.teacher_topic_mcqs (teacher_id,topic_key,title,questions)
SELECT 'nadia-al-nuaimy','nadia-en-ch2-lec8-exam','Topic 8 — Animal and Epithelial Tissues',$json$
[
 {"question":"Animal tissues consist of groups of ______ specialized to perform a particular function.","choices":["undifferentiated cells","guard cells","similar cells","elongated meristematic cells"],"answer_index":2},
 {"question":"How do animal tissues differ from one another?","choices":["In the amount of intercellular substance and its chemical composition.","In shape, origin, structure, and method of formation.","In their pattern of thickening.","In location and function."],"answer_index":0},
 {"question":"Connective tissue is also called ______ tissue.","choices":["epithelial","muscular","nervous","binding"],"answer_index":3},
 {"question":"Which tissue is also called covering tissue?","choices":["Connective tissue.","Epithelial tissue.","Muscular tissue.","Nervous tissue."],"answer_index":1},
 {"question":"Which option lists the functions of epithelial tissue?","choices":["Ventilation and food storage and transport.","Transport of water and food in plants, as well as support.","Protection, regulation of gas exchange, and water absorption.","Covers the body surface, lines body cavities, and forms glands."],"answer_index":3},
 {"question":"Epithelial tissue is represented by:","choices":["continuous sheets of cells formed from one or several layers.","a single row of thickened cells covering the plant body.","internal tissue masses in roots, stems, and leaves.","long, pointed cells found singly or in bundles."],"answer_index":0},
 {"question":"Epithelial cells rest on a:","choices":["intercellular substance.","plasma junction.","basement membrane.","neighboring cell margin."],"answer_index":2},
 {"question":"Complete the statement: The intercellular substance of epithelial tissue is ______.","choices":["present in large quantities","almost absent","variable in composition","variable in chemical content"],"answer_index":1},
 {"question":"The margins of epithelial cells are joined to one another by:","choices":["cell junctions (plasma junctions).","a basement membrane.","intercellular substance.","certain cellular products."],"answer_index":0},
 {"question":"What is the function of plasma junctions?","choices":["Cover the body surface, line body cavities, and form glands.","Protect and regulate gas exchange.","Transport food produced in the leaf.","Join the margins of epithelial cells to one another."],"answer_index":3}
]$json$::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec8-exam');

INSERT INTO public.teacher_topic_mcqs (teacher_id,topic_key,title,questions)
SELECT 'nadia-al-nuaimy','nadia-en-ch2-lec9-exam','Topic 9 — Simple Squamous Epithelium',$json$
[
 {"question":"Which description applies to the structure of simple squamous epithelium?","choices":["A single layer of flat cells that appear polygonal.","Several layers of flat cells that appear polygonal.","A single layer of cuboidal cells with central nuclei.","A single layer of columnar cells with flattened nuclei."],"answer_index":0},
 {"question":"Which pairing correctly describes simple squamous cells and their nuclei?","choices":["Flat cells — central cuboidal nuclei.","Cuboidal cells — central flattened nuclei.","Flat cells — central flattened nuclei.","Columnar cells — central flattened nuclei."],"answer_index":2},
 {"question":"The cell layer forming simple squamous epithelium rests on the:","choices":["intercellular substance.","basement membrane.","plasma junctions.","margins of neighboring cells."],"answer_index":1},
 {"question":"Which group lists locations of simple squamous epithelium?","choices":["Blood vessels, body cavities, and glands.","Body cavities, glands, and pulmonary alveoli.","Glands, pulmonary alveoli, and Malpighian corpuscles.","Blood vessels, pulmonary alveoli, and Malpighian corpuscles."],"answer_index":3},
 {"question":"Which two functions are associated with simple squamous epithelium?","choices":["Diffusion and filtration.","Diffusion and gland formation.","Filtration and gland formation.","Covering the body surface and gland formation."],"answer_index":0},
 {"question":"A tissue lining blood vessels and consisting of one layer of flat cells with central nuclei is:","choices":["simple cuboidal epithelium.","simple columnar epithelium.","simple squamous epithelium.","pseudostratified columnar epithelium."],"answer_index":2},
 {"question":"Which statement about simple squamous epithelium is incorrect?","choices":["Its cells appear polygonal.","It consists of several layers of flat cells.","Its nuclei are flat and central.","It occurs in pulmonary alveoli."],"answer_index":1},
 {"question":"Which location–function pairing is correct for simple squamous epithelium?","choices":["Pulmonary alveoli — gland formation.","Malpighian corpuscles — gland formation.","Blood vessels — support and strengthening.","Malpighian corpuscles — diffusion and filtration."],"answer_index":3},
 {"question":"Which feature makes squamous epithelium a simple epithelium?","choices":["Its cells are arranged in a single layer.","Its nuclei are centrally located.","Its cells appear polygonal.","Its nuclei are flattened."],"answer_index":0},
 {"question":"Which complete set of features applies to simple squamous epithelium?","choices":["One layer, cuboidal cells, central nuclei, lines blood vessels.","Several layers, flat cells, central nuclei, occurs in pulmonary alveoli.","One layer, flat cells, central flattened nuclei, performs diffusion and filtration.","One layer, columnar cells, flattened nuclei, occurs in Malpighian corpuscles."],"answer_index":2}
]$json$::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.teacher_topic_mcqs WHERE teacher_id='nadia-al-nuaimy' AND topic_key='nadia-en-ch2-lec9-exam');
