import { describe, expect, it, vi, afterEach } from "vitest";
import { literatureCount, literatureExamExtension, validateLiteratureQuestions } from "./literatureCourse";
import { canGenerateLiterature, isLiteratureQuestionRelevant, literatureMcqPrompt } from "../../supabase/functions/_shared/literatureGeneration";
const q={question:"Who wrote the poem?",choices:["A","B","C","D"],answer_index:1,explanation:"The poem is credited to B."};
afterEach(()=>vi.unstubAllGlobals());
describe("literature course generation",()=>{
 it("validates the supervisor's count without silently clamping it",()=>{expect(literatureCount("37")).toBe(37);for(const n of [0,101,2.5,NaN,""])expect(()=>literatureCount(n)).toThrow("invalid_count");});
 it("rejects malformed choices, wrong answer indices, missing explanations and duplicate questions",()=>{
  expect(validateLiteratureQuestions([q])).toEqual([q]);
  for(const bad of [{...q,choices:["A","A","B","C"]},{...q,answer_index:4},{...q,explanation:""}])expect(()=>validateLiteratureQuestions([bad])).toThrow("invalid_questions");
  expect(()=>validateLiteratureQuestions([q,q])).toThrow("duplicate_questions");
 });
 it("bounds uploaded exam files and never accepts active HTML as an exam",()=>{
  expect(literatureExamExtension({name:"exam.PDF",size:100*1024*1024})).toBe("pdf");
  expect(()=>literatureExamExtension({name:"exam.pdf",size:100*1024*1024+1})).toThrow();expect(()=>literatureExamExtension({name:"exam.html",size:50})).toThrow();
 });
 it("preserves literature authorship questions while excluding document metadata",()=>{
  expect(isLiteratureQuestionRelevant("من هو الكاتب الذي كتب هذه الرواية؟")).toBe(true);
  expect(isLiteratureQuestionRelevant("Who is the author of the poem?" )).toBe(true);
  expect(isLiteratureQuestionRelevant("ما رقم الصفحة؟")).toBe(false);expect(isLiteratureQuestionRelevant("What is the file name?" )).toBe(false);
  expect(literatureMcqPrompt("Arabic")).toContain("poet");
 });
 it("uses the caller's authenticated RPC and rejects false, non-boolean or unavailable permission results",async()=>{
  const req=new Request("https://example.test",{headers:{Authorization:"Bearer student"}});
  const fetch=vi.fn().mockResolvedValueOnce(new Response("true")).mockResolvedValueOnce(new Response("false")).mockResolvedValueOnce(new Response('"true"')).mockRejectedValueOnce(new Error("offline"));vi.stubGlobal("fetch",fetch);
  expect(await canGenerateLiterature(req,"https://db.test","public-key")).toBe(true);
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer student");
  expect(await canGenerateLiterature(req,"https://db.test","public-key")).toBe(false);expect(await canGenerateLiterature(req,"https://db.test","public-key")).toBe(false);expect(await canGenerateLiterature(req,"https://db.test","public-key")).toBe(false);
 });
});
