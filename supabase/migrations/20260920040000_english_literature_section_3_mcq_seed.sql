-- English Literature — Section 3 (Pride and Prejudice)
-- The English questions are available in both interface languages.
WITH questions AS (
  SELECT *
  FROM jsonb_to_recordset($questions$
  [
    {"sort_order":1,"question":"From which novel is the extract taken?","choices":["Jane Eyre","Pride and Prejudice","Great Expectations","Oliver Twist"],"answer_index":1},
    {"sort_order":2,"question":"On which page of the Student’s Book can the extract be found?","choices":["Page 105","Page 172","Page 173","Page 115"],"answer_index":0},
    {"sort_order":3,"question":"What happens first in the extract?","choices":["Mr Darcy compliments Elizabeth’s eyes.","Louisa discusses the Bennets’ social class.","Elizabeth goes to see her sick sister.","Caroline mentions Mr Darcy’s sister."],"answer_index":2},
    {"sort_order":4,"question":"Why does Elizabeth go to the estate?","choices":["To meet Mr Darcy","To visit her sick sister, Jane","To attend a party","To speak to Louisa"],"answer_index":1},
    {"sort_order":5,"question":"What happens immediately after Elizabeth goes to see Jane?","choices":["Mr Darcy compliments Elizabeth.","The Bingley sisters discuss Elizabeth’s clothes.","Caroline talks about Jane’s marriage.","Louisa discusses the Bennet family."],"answer_index":1},
    {"sort_order":6,"question":"What is the third event in the extract?","choices":["Caroline mentions Mr Darcy’s sister.","Elizabeth returns home.","Mr Bingley criticizes Elizabeth.","Louisa compliments Elizabeth’s clothes."],"answer_index":0},
    {"sort_order":7,"question":"What does Mr Darcy compliment?","choices":["Elizabeth’s dress","Elizabeth’s intelligence","Elizabeth’s eyes","Elizabeth’s family"],"answer_index":2},
    {"sort_order":8,"question":"Which event happens last?","choices":["Elizabeth visits Jane.","Louisa talks about the Bennets’ social class.","Mr Darcy compliments Elizabeth’s eyes.","Caroline mentions Mr Darcy’s sister."],"answer_index":1},
    {"sort_order":9,"question":"Which is the correct order of events?","choices":["Elizabeth visits Jane → the sisters discuss her clothes → Caroline mentions Darcy’s sister → Darcy compliments Elizabeth’s eyes → Louisa discusses social class","Darcy compliments Elizabeth → Elizabeth visits Jane → Louisa discusses social class → Caroline mentions Darcy’s sister → the sisters discuss her clothes","The sisters discuss Elizabeth’s clothes → Elizabeth visits Jane → Darcy compliments her eyes → Louisa discusses social class → Caroline mentions Darcy’s sister","Elizabeth visits Jane → Darcy compliments her eyes → Caroline mentions Darcy’s sister → the sisters discuss her clothes → Louisa discusses social class"],"answer_index":0},
    {"sort_order":10,"question":"Who defends Elizabeth’s appearance?","choices":["Caroline","Mr Darcy","Mr Bingley","Mrs Louisa Hurst"],"answer_index":2},
    {"sort_order":11,"question":"Who compliments Elizabeth’s eyes?","choices":["Mr Darcy","Mr Bingley","Caroline","Jane"],"answer_index":0},
    {"sort_order":12,"question":"Who comments on Elizabeth’s dirty clothes?","choices":["Caroline","Mrs Louisa Hurst","Mr Bingley","Mr Darcy"],"answer_index":1},
    {"sort_order":13,"question":"Who thinks that Jane will not marry well?","choices":["Elizabeth","Louisa","Mr Darcy","Caroline"],"answer_index":3},
    {"sort_order":14,"question":"Which character is supportive of Elizabeth rather than critical of her appearance?","choices":["Mr Bingley","Caroline","Mrs Louisa Hurst","Louisa and Caroline"],"answer_index":0},
    {"sort_order":15,"question":"Why does Elizabeth only like Mr Bingley?","choices":["Because he is wealthy","Because he compliments her eyes","Because he cares about her and Jane","Because he invites her to the estate"],"answer_index":2},
    {"sort_order":16,"question":"Why does Louisa call Elizabeth “an excellent walker”?","choices":["To honestly praise her athletic ability","To make fun of her for walking a long distance to the estate","To encourage her to walk home","To explain why her clothes are expensive"],"answer_index":1},
    {"sort_order":17,"question":"Louisa’s description of Elizabeth as “an excellent walker” is mainly:","choices":["A sincere compliment","An apology","A sarcastic comment","A warning"],"answer_index":2},
    {"sort_order":18,"question":"Why are Bingley’s sisters worried about Elizabeth’s appearance?","choices":["They believe appearance is a sign of social status.","They are worried that she is sick.","They want to give her new clothes.","They believe Mr Bingley dislikes her."],"answer_index":0},
    {"sort_order":19,"question":"What do Bingley’s sisters associate appearance with?","choices":["Intelligence","Social status","Health","Age"],"answer_index":1},
    {"sort_order":20,"question":"Why is Caroline worried about Mr Darcy’s opinion of Elizabeth?","choices":["She wants Darcy to marry Jane.","She considers Elizabeth her best friend.","She wants to marry Darcy herself.","She wants Elizabeth to leave the estate."],"answer_index":2},
    {"sort_order":21,"question":"What does Louisa mean by “such a father and mother” and “such low connections”?","choices":["The Bennet parents are unfriendly.","The Bennets live far away.","The Bennet family is too poor to join the upper social class.","Elizabeth does not care about her family."],"answer_index":2},
    {"sort_order":22,"question":"What social issue is emphasized by Louisa’s comments?","choices":["Education","Social class","Health","Travel"],"answer_index":1},
    {"sort_order":23,"question":"Which statement reflects Louisa’s opinion of the Bennet family?","choices":["They are wealthy members of the upper class.","They are too poor to join the higher social class.","They have no interest in marriage.","They own the estate."],"answer_index":1},
    {"sort_order":24,"question":"Which word from the extract means “fear”?","choices":["Anxiety","Lack","Excessive","Indifference"],"answer_index":0},
    {"sort_order":25,"question":"Which word means “missing” or not having enough of something?","choices":["Untidy","Anxiety","Lack","Excessive"],"answer_index":2},
    {"sort_order":26,"question":"Which word means “messy”?","choices":["Indifference","Untidy","Excessive","Anxiety"],"answer_index":1},
    {"sort_order":27,"question":"Which word means “not caring very much”?","choices":["Indifference","Lack","Anxiety","Untidy"],"answer_index":0},
    {"sort_order":28,"question":"Which word means “a lot” or “too much”?","choices":["Untidy","Indifference","Excessive","Lack"],"answer_index":2},
    {"sort_order":29,"question":"If someone shows “indifference,” they:","choices":["Feel very frightened","Do not care very much","Look untidy","Have too much of something"],"answer_index":1},
    {"sort_order":30,"question":"Which sentence uses “excessive” correctly?","choices":["Her excessive worry made it difficult for her to relax.","He excessive his missing book.","They were excessive because they did not care.","The room was excessive because it was messy."],"answer_index":0}
  ]
  $questions$::jsonb) AS q(sort_order integer, question text, choices jsonb, answer_index integer)
),
interface_languages (language) AS (
  VALUES ('ar'), ('en')
)
INSERT INTO public.mcq_banks (
  subject, chapter, chapter_title, section, language,
  question, choices, answer_index, explanation, source, sort_order
)
SELECT
  'english_literature', 3, 'Section 3', 'Section 3', interface_languages.language,
  questions.question, questions.choices, questions.answer_index, NULL,
  'English Literature Section 3', questions.sort_order
FROM questions
CROSS JOIN interface_languages
WHERE NOT EXISTS (
  SELECT 1
  FROM public.mcq_banks AS existing
  WHERE existing.subject = 'english_literature'
    AND existing.chapter = 3
    AND existing.language = interface_languages.language
    AND existing.question = questions.question
);
