-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 4
-- Keep Chapter 4 capped at nine lectures without losing the IVF questions.

UPDATE public.teacher_topic_mcqs AS lecture_9
SET
  title = 'المحاضرة 9 — الاستنساخ الحيواني وتقنيات الإخصاب المساعد',
  questions = lecture_9.questions || COALESCE(
    (
      SELECT lecture_10.questions
      FROM public.teacher_topic_mcqs AS lecture_10
      WHERE lecture_10.teacher_id = 'nadia-al-nuaimy'
        AND lecture_10.topic_key = 'nadia-ar-ch4-lec10-exam'
      LIMIT 1
    ),
    '[]'::jsonb
  )
WHERE lecture_9.teacher_id = 'nadia-al-nuaimy'
  AND lecture_9.topic_key = 'nadia-ar-ch4-lec9-exam'
  AND lecture_9.title <> 'المحاضرة 9 — الاستنساخ الحيواني وتقنيات الإخصاب المساعد';

DELETE FROM public.teacher_topic_mcqs
WHERE teacher_id = 'nadia-al-nuaimy'
  AND topic_key = 'nadia-ar-ch4-lec10-exam';
