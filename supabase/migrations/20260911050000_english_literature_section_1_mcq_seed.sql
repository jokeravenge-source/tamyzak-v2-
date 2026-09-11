-- English Literature — Section 1 (Pride and Prejudice)
-- The English questions are available in both interface languages.
WITH questions (sort_order, question, choices, answer_index) AS (
  VALUES
    (1, 'What does “nonsense” mean?', '["Something important","Something silly or crazy","Something expensive","Something acceptable"]'::jsonb, 1),
    (2, 'What does the verb “flatter” mean?', '["To visit someone","To disagree with someone","To compliment something or someone","To understand someone''s feelings"]'::jsonb, 2),
    (3, 'What does “share” mean?', '["A large amount of money","The amount of something acceptable for one person","Something likely to happen","A group of newcomers"]'::jsonb, 1),
    (4, 'Who are “newcomers”?', '["People who are new to a place","People who live in an estate","People who are well educated","People who visit their neighbours"]'::jsonb, 0),
    (5, 'What does “ignorant” mean?', '["Friendly and good-humoured","Rich and successful","Not educated or does not know much","Unfairly treated"]'::jsonb, 2),
    (6, 'What does “sympathy” mean?', '["Understanding someone''s feelings","Thinking about someone''s beauty","Complimenting someone","Giving someone preference"]'::jsonb, 0),
    (7, 'According to the exercise, “Mr Bingley is looking to live in the Bennets’ estate” is:', '["True","False","Not mentioned","Partly true"]'::jsonb, 1),
    (8, 'According to the exercise, “Mr Bennet is jealous of Mrs Bennet and Mr Bingley” is:', '["True","False","Not mentioned","Partly true"]'::jsonb, 1),
    (9, 'According to the exercise, “Mr Bennet wants to visit Mr Bingley” is:', '["True","False","Not mentioned","Partly true"]'::jsonb, 1),
    (10, 'Mrs Bennet thinks that Mr Bennet prefers whom over their other daughters?', '["Jane","Lydia","Lizzy","Mrs Lucas"]'::jsonb, 2),
    (11, 'According to the exercise, Mrs Bennet often loses her patience with Mr Bennet. This statement is:', '["True","False","Not mentioned","Partly true"]'::jsonb, 0),
    (12, 'According to the exercise, “Mr Bennet is visiting twenty men in the neighbourhood” is:', '["True","False","Not mentioned","Partly true"]'::jsonb, 1),
    (13, 'How much money does Mr Bingley earn yearly?', '["Two or three thousand pounds","Three or four thousand pounds","Four or five thousand pounds","Five or six thousand pounds"]'::jsonb, 2),
    (14, 'Why is Mr Bingley''s arrival a good thing for the Bennet girls?', '["Because he might employ one of them","Because he might marry one of them","Because he might educate one of them","Because he might visit their estate"]'::jsonb, 1),
    (15, 'Why does Mr Bennet think Mr Bingley might like Mrs Bennet best of all?', '["Because she is good-humoured","Because she has a large fortune","Because she is as beautiful as any of their daughters","Because she often visits newcomers"]'::jsonb, 2),
    (16, 'What does Mr Bennet think of women who give up thinking about their own beauty?', '["They are often extraordinarily beautiful","They often do not have much beauty to think of","They are usually young and beautiful","They do not understand other people''s feelings"]'::jsonb, 1),
    (17, 'Why is it strange that Sir William and Lady Lucas want to visit Mr Bingley?', '["Because they do not know him","Because they do not usually visit newcomers","Because Mr Bingley does not receive visitors","Because they live outside the neighbourhood"]'::jsonb, 1),
    (18, 'Why does Mrs Bennet want Mr Bennet to visit Mr Bingley?', '["So she can visit him with her daughters","So Mr Bennet can ask him for money","So Lizzy can visit him alone","So Sir William can meet him"]'::jsonb, 0),
    (19, 'Why does Mr Bennet think Lizzy is different from her sisters?', '["Lizzy is more beautiful than her sisters","Lizzy is richer than her sisters","Lizzy is quicker than her sisters","Lizzy is younger than her sisters"]'::jsonb, 2),
    (20, 'According to Mr Bennet, how are Lizzy''s sisters described?', '["Friendly and good-humoured","Silly and ignorant like other girls","Quick and well educated","Extraordinary and beautiful"]'::jsonb, 1),
    (21, 'Which word means “a large amount of money”?', '["Share","Preference","Fortune","Sympathy"]'::jsonb, 2),
    (22, 'Which word means “something that has a good chance of happening”?', '["Extraordinary","Likely","Ignorant","Grown-up"]'::jsonb, 1),
    (23, 'Which word or phrase means “adult”?', '["Newcomer","Good-humoured","Grown-up","Likely"]'::jsonb, 2),
    (24, 'Which word means “unusual”?', '["Extraordinary","Likely","Ignorant","Friendly"]'::jsonb, 0),
    (25, 'Which word means “think about”?', '["Mention","Consider","Flatter","Prefer"]'::jsonb, 1),
    (26, 'What is the word for unfairly treating one person better than others?', '["Sympathy","Fortune","Preference","Nonsense"]'::jsonb, 2),
    (27, 'Which word means “friendly”?', '["Grown-up","Good-humoured","Extraordinary","Likely"]'::jsonb, 1),
    (28, 'Which word means “refer”?', '["Mention","Consider","Prefer","Flatter"]'::jsonb, 0),
    (29, 'Mrs Bennet wants her daughters to marry into _____.', '["sympathy","fortune","nonsense","preference"]'::jsonb, 1),
    (30, 'Mr Bennet is not _____ to visit Mr Bingley.', '["grown-up","extraordinary","likely","good-humoured"]'::jsonb, 2),
    (31, 'Mrs Bennet thinks Mr Bennet gives Lizzy the _____.', '["fortune","sympathy","share","preference"]'::jsonb, 3),
    (32, 'Mr Bennet wants to _____ Lizzy to Mr Bingley.', '["consider","mention","flatter","visit"]'::jsonb, 1),
    (33, 'The five Bennet daughters are all _____.', '["newcomers","grown-ups","good-humoured","extraordinary"]'::jsonb, 1),
    (34, 'Sir William and Lady Lucas''s visiting a new neighbour is _____.', '["likely","ordinary","extraordinary","ignorant"]'::jsonb, 2),
    (35, 'Mr Bennet is _____.', '["good-humoured","ignorant","jealous","extraordinary"]'::jsonb, 0),
    (36, 'Mrs Bennet wants Mr Bingley to _____ Jane and Lydia as well.', '["mention","flatter","consider","visit"]'::jsonb, 2)
),
interface_languages (language) AS (
  VALUES ('ar'), ('en')
)
INSERT INTO public.mcq_banks (
  subject, chapter, chapter_title, section, language,
  question, choices, answer_index, explanation, source, sort_order
)
SELECT
  'english_literature', 1, 'Section 1', 'Section 1', interface_languages.language,
  questions.question, questions.choices, questions.answer_index, NULL,
  'English Literature Section 1', questions.sort_order
FROM questions
CROSS JOIN interface_languages
WHERE NOT EXISTS (
  SELECT 1
  FROM public.mcq_banks AS existing
  WHERE existing.subject = 'english_literature'
    AND existing.chapter = 1
    AND existing.language = interface_languages.language
    AND existing.question = questions.question
);
