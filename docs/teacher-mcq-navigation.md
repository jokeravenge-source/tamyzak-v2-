# Teacher MCQ navigation

The shared `PracticeModal` in `Teachers.tsx` serves Mohammed Al-Anzi's Arabic
and English lecture banks, Nadia's banks, and the general teacher topic banks.
Previous/Next are always available during a quiz, with Previous disabled at the
first question and Finish on the final question. Students may skip a question
and return to it. Each question retains its selected choice, revealed answer
and explanation; the score is derived from revealed answers once per question.
Result review preserves that state. Admin deletion removes the matching answer
slot so later questions and the score remain aligned.

The quiz uses the existing portalled, focus-managed Dialog, outside the animated
teacher container. The dialog is bounded by the device viewport/safe areas;
only the question body scrolls, keeping navigation in a separate footer above
the bottom app navigation. Changing questions resets the body to the top and
focuses the question heading. No database or content migration is required.

Validation:

```sh
npm test -- src/pages/TeachersPractice.test.tsx
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

These checks passed. An attempted Chromium viewport check was blocked because
the environment could not create the browser's process socket; the mobile layout
has not been visually verified in a browser.
