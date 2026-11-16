import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OurCourses from "./OurCourses";
vi.mock("./LiteratureCourse",()=>({default:()=> <h1>New internal literature course</h1>}));
vi.mock("@/components/ExamPlanPanel",()=>({default:()=>null}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{auth:{getUser:async()=>({data:{user:null}})},from:()=>{const b:any={select:()=>b,order:async()=>({data:[],error:null})};return b;}}}));
beforeEach(()=>vi.stubGlobal("scrollTo",vi.fn()));
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe("Arabic course entry",()=>{
 it("replaces the literature Telegram bot with the internal course while preserving grammar",async()=>{
  render(<OurCourses language="ar" onBack={()=>{}}/>);
  const title=await screen.findByText("اللغة العربية");fireEvent.click(title.closest("article")!.querySelector("button")!);
  const literature=await screen.findByRole("button",{name:/أدب.*امتحانات وMCQ/});
  expect(screen.queryByRole("link",{name:/heh212_bot/})).not.toBeInTheDocument();
  expect(screen.getByRole("button",{name:/قواعد/})).toBeInTheDocument();
  fireEvent.click(literature);expect(await screen.findByRole("heading",{name:"New internal literature course"})).toBeInTheDocument();
 });
});
