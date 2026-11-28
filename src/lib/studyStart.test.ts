import { describe, expect, it } from "vitest";
import { chooseStarterQuestions, describeStudyStartTopics, normalizeStudyFocus, parseStudyStart } from "./studyStart";

const question = (id: string, subject = "physics", tags: string[] = [], title = `Question ${id}`) =>
  ({ id, subject, chapter: 1, chapter_title: "Electric Capacitance", question: title, tags, choices: ["Yes", "No"], answer_index: 0 });

describe("starter practice", () => {
  it("validates subject and topic identifiers without unlocking Arabic", () => {
    expect(parseStudyStart('{"subject":"arabic","topicKeys":[]}')).toBeNull();
    expect(parseStudyStart('{"subject":"physics","topicKeys":["unrecognized"]}')).toBeNull();
    const [topic] = describeStudyStartTopics("physics");
    expect(normalizeStudyFocus("physics", [topic.key, topic.key, "foreign"])).toEqual([topic.key]);
    expect(parseStudyStart(JSON.stringify({ subject: "physics", topicKeys: [topic.key] })))
      .toEqual({ subject: "physics", topicKeys: [topic.key] });
  });

  it("selects five distinct existing questions from the selected subject", () => {
    const rows = [question("foreign", "biology"), ...Array.from({ length: 8 }, (_, i) => question(String(i))),
      question("duplicate", "physics", [], "Question 0")];
    expect(chooseStarterQuestions(rows, { subject: "physics", topicKeys: [] }, "en").map(row => row.id))
      .toEqual(["0", "1", "2", "3", "4"]);
  });

  it("never silently broadens selected topics to reach five", () => {
    const [topic] = describeStudyStartTopics("physics", "en");
    const rows = [question("target", "physics", [topic.key]), question("unscoped"), question("foreign", "biology", [topic.key])];
    const intent = { subject: "physics" as const, topicKeys: [topic.key] };
    expect(chooseStarterQuestions(rows, intent, "en").map(row => row.id)).toEqual(["target"]);
    expect(chooseStarterQuestions(rows.slice(1), intent, "en")).toEqual([]);
  });
});
