-- English Literature — Section 2 (Pride and Prejudice)
-- The English questions are available in both interface languages.
WITH questions (sort_order, question, choices, answer_index) AS (
  VALUES
    (1, 'Why doesn’t Mr Darcy want to dance?', '["He does not like the women in the room","He knows his partner too well","He is engaged to Mr Bingley’s sister","He does not know how to dance"]'::jsonb, 0),
    (2, 'Who does Mr Darcy think is the only beautiful girl in the room?', '["Elizabeth","Lydia","Jane","Charlotte"]'::jsonb, 2),
    (3, 'How does Elizabeth react to Mr Darcy’s comment?', '["She feels ridiculous","She finds it funny","She finds it very friendly","She becomes angry"]'::jsonb, 1),
    (4, 'What did Mrs Bennet think of Mr Bingley?', '["She was curious","She was delighted","She was disappointed","She was frightened"]'::jsonb, 1),
    (5, 'What did Mrs Bennet think of Mr Darcy?', '["She thought he was not handsome","She thought he was great","She thought he was too proud","She thought he was lively"]'::jsonb, 2),
    (6, 'Which statement about Mr Bingley’s sisters is correct?', '["Both of them have husbands","Neither of them has a husband","Only Louisa Hurst is presented as married","Caroline Bingley is married to Mr Darcy"]'::jsonb, 2),
    (7, 'What does Mr Bingley think about Mr Darcy?', '["He is too difficult to please","He is lively and playful","He is very easy to please","He enjoys every ball"]'::jsonb, 0),
    (8, 'What does Mr Bingley think about Elizabeth?', '["She is proud","She is pretty","She is rude","She is difficult to please"]'::jsonb, 1),
    (9, 'Which statement about Mr Darcy’s opinion is false?', '["He thinks Jane is beautiful","He thinks Jane is the only beautiful girl in the room","He thinks Elizabeth is the only beautiful girl in the room","He does not admire the other women in the room"]'::jsonb, 2),
    (10, 'Which description of Mr Darcy did Elizabeth not agree with?', '["Lively and playful","Proud","Difficult to please","Cold"]'::jsonb, 0),
    (11, 'Which statement about Mr Bingley’s dancing is correct?', '["He danced with all the girls twice","He danced with Jane twice","He refused to dance with Jane","He did not attend the ball"]'::jsonb, 1),
    (12, 'Which statement about Mrs Bennet’s opinion of Mr Darcy is false?', '["She thought he was too proud","She did not think he was great","She thought he was so great","She disliked his proud behaviour"]'::jsonb, 2),
    (13, 'What does “a good number of” mean?', '["One","Several","None","A couple"]'::jsonb, 1),
    (14, 'Which word means “to help two people meet”?', '["Admire","Introduce","Refuse","Attend"]'::jsonb, 1),
    (15, 'Which word means “in a rude and not very warm way”?', '["Lively","Coldly","Elegantly","Regularly"]'::jsonb, 1),
    (16, 'Which word means “full of energy”?', '["Lively","Muddy","Proud","Jealous"]'::jsonb, 0),
    (17, 'Which word means “wanted or liked”?', '["Introduced","Admired","Refused","Discussed"]'::jsonb, 1),
    (18, 'What does “fancy” mean in the extract?', '["Difficult","Elegant","Muddy","Playful"]'::jsonb, 1),
    (19, 'Which word means “dress”?', '["Gown","Estate","Ball","Storm"]'::jsonb, 0),
    (20, 'Who danced with Jane twice?', '["Mr Darcy","Mr Bennet","Mr Bingley","Sir Lucas"]'::jsonb, 2),
    (21, 'Who did not attend the ball?', '["Mr Bennet","Mr Bingley","Mr Darcy","Sir Lucas"]'::jsonb, 0),
    (22, 'Who thought the ball was a waste of time?', '["Elizabeth","Mrs Bennet","Mr Darcy","Mr Bingley"]'::jsonb, 2),
    (23, 'Who was interested in the women’s dresses?', '["Elizabeth","Jane","Charlotte","Mrs Bennet"]'::jsonb, 3),
    (24, 'Who laughed with her friends about Mr Darcy?', '["Caroline Bingley","Elizabeth","Louisa Hurst","Jane"]'::jsonb, 1),
    (25, 'What is the relationship between the Lucas family and the Bennet family?', '["They are relatives","They are neighbours","They are enemies","They are business partners"]'::jsonb, 1),
    (26, 'Who is the eldest daughter of the Lucas family?', '["Jane","Elizabeth","Caroline","Charlotte"]'::jsonb, 3),
    (27, 'Who is Elizabeth’s best friend?', '["Louisa Hurst","Caroline Bingley","Charlotte Lucas","Mrs Bennet"]'::jsonb, 2),
    (28, 'Who are Mr Bingley’s sisters?', '["Jane and Elizabeth","Caroline Bingley and Louisa Hurst","Charlotte and Lydia","Elizabeth and Caroline"]'::jsonb, 1),
    (29, 'Who is Louisa Hurst’s husband?', '["Mr Darcy","Mr Bennet","Mr Hurst","Sir Lucas"]'::jsonb, 2),
    (30, 'Why is Louisa called Mrs Louisa Hurst?', '["Hurst is her father’s surname","Hurst is her husband’s surname","Hurst is the name of her estate","Hurst is her brother’s name"]'::jsonb, 1),
    (31, 'When do the Bennets discuss the events of the ball with the Lucases?', '["During the ball","The evening before the ball","The morning after the ball","One week after the ball"]'::jsonb, 2),
    (32, 'With whom do the Bennets discuss the events of the ball?', '["The Hursts","The Lucases","The Darcys","The Bingleys"]'::jsonb, 1),
    (33, 'Who points out that Mr Bingley thought Jane was the prettiest girl at the ball?', '["Mrs Bennet","Caroline Bingley","Charlotte Lucas","Elizabeth"]'::jsonb, 2),
    (34, 'With whom did Charlotte dance before Mr Bingley danced with Jane?', '["Mr Darcy","Sir Lucas","Mr Hurst","Mr Bingley"]'::jsonb, 3),
    (35, 'Who did Mr Bingley think was the prettiest girl at the ball?', '["Elizabeth","Charlotte","Jane","Caroline"]'::jsonb, 2),
    (36, 'Between whom does a romance begin to develop?', '["Mr Darcy and Caroline","Mr Bingley and Jane","Mr Hurst and Elizabeth","Sir Lucas and Mrs Bennet"]'::jsonb, 1),
    (37, 'Who begins to see the Bennets regularly?', '["Mr Bingley, his sisters and Mr Darcy","Mr Hurst alone","Sir Lucas and Charlotte only","Caroline Bingley alone"]'::jsonb, 0),
    (38, 'Toward whom does Mr Darcy begin to form an interest?', '["Jane","Charlotte","Caroline","Elizabeth"]'::jsonb, 3),
    (39, 'What does Mr Darcy begin to do as his interest in Elizabeth develops?', '["Avoid her completely","Pay more and more attention to her","Ask her to leave the estate","Speak only to Jane"]'::jsonb, 1),
    (40, 'Where does Sir Lucas suggest that Elizabeth and Mr Darcy dance together?', '["At the Bennets’ house","At Netherfield","At a ball in the Lucases’ house","At Mr Hurst’s house"]'::jsonb, 2),
    (41, 'Who suggests that Elizabeth and Mr Darcy dance together?', '["Mr Bingley","Sir Lucas","Mr Bennet","Mr Hurst"]'::jsonb, 1),
    (42, 'How does Elizabeth respond to the suggestion that she dance with Mr Darcy?', '["She accepts immediately","She asks Jane to dance instead","She refuses","She leaves the ball"]'::jsonb, 2),
    (43, 'What does Elizabeth’s refusal surprisingly lead Mr Darcy to do?', '["Leave the Lucas house","Tell Caroline that he is falling for Elizabeth","Stop visiting the Bennets","Become interested in Jane"]'::jsonb, 1),
    (44, 'To whom does Mr Darcy say that he is falling for Elizabeth?', '["Jane","Charlotte","Caroline","Mrs Bennet"]'::jsonb, 2),
    (45, 'How does Caroline react to Mr Darcy’s growing feelings for Elizabeth?', '["She becomes delighted","She becomes jealous","She becomes ill","She becomes playful"]'::jsonb, 1),
    (46, 'Where does Jane get caught in a storm?', '["During a visit to Netherfield","At the Lucases’ house","At the Bennets’ house","At the first ball"]'::jsonb, 0),
    (47, 'What happens to Jane after she is caught in the storm?', '["She gets lost","She falls ill","She returns home immediately","She refuses to see Mr Bingley"]'::jsonb, 1),
    (48, 'Where does Jane have to stay while recovering?', '["In the Lucas household","In the Bennet household","In the Bingley household","In the Hurst household"]'::jsonb, 2),
    (49, 'What does Elizabeth do when she hears that Jane is ill?', '["She sends Mr Darcy to visit her","She walks the whole way to the estate","She waits for Jane to return","She attends another ball"]'::jsonb, 1),
    (50, 'In what condition does Elizabeth arrive at the estate?', '["In an elegant gown","In a muddy dress","In a wet coat","In a new dress"]'::jsonb, 1),
    (51, 'Who is surprised by Elizabeth’s arrival in a muddy dress?', '["Only Jane","Only Mr Bingley","The Bingleys, Mr and Mrs Hurst, and Mr Darcy","The Bennets and the Lucases"]'::jsonb, 2)
),
interface_languages (language) AS (
  VALUES ('ar'), ('en')
)
INSERT INTO public.mcq_banks (
  subject, chapter, chapter_title, section, language,
  question, choices, answer_index, explanation, source, sort_order
)
SELECT
  'english_literature', 2, 'Section 2', 'Section 2', interface_languages.language,
  questions.question, questions.choices, questions.answer_index, NULL,
  'English Literature Section 2', questions.sort_order
FROM questions
CROSS JOIN interface_languages
WHERE NOT EXISTS (
  SELECT 1
  FROM public.mcq_banks AS existing
  WHERE existing.subject = 'english_literature'
    AND existing.chapter = 2
    AND existing.language = interface_languages.language
    AND existing.question = questions.question
);
