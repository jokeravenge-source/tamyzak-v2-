import { act, fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LiteratureCourse from "./LiteratureCourse";
const m=vi.hoisted(()=>({rpc:vi.fn(),invoke:vi.fn(),from:vi.fn(),getUser:vi.fn(),listener:null as null|((event:string,session:any)=>void),extract:vi.fn(),upload:vi.fn(),remove:vi.fn(),signed:vi.fn(),builder:null as any}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{rpc:m.rpc,from:m.from,functions:{invoke:m.invoke},storage:{from:()=>({upload:m.upload,remove:m.remove,createSignedUrl:m.signed})},auth:{getUser:m.getUser,onAuthStateChange:(cb:any)=>{m.listener=cb;return{data:{subscription:{unsubscribe:vi.fn()}}};}}}}));
vi.mock("@/lib/fileText",()=>({extractStudyMaterial:m.extract}));
const q={question:"من شاعر القصيدة؟",choices:["أ","ب","ج","د"],answer_index:1,explanation:"النص ينسب القصيدة إلى ب."};
beforeEach(()=>{
 vi.clearAllMocks();m.upload.mockResolvedValue({error:null});m.remove.mockResolvedValue({error:null});m.getUser.mockResolvedValue({data:{user:{id:"student"}}});
 m.rpc.mockImplementation(async(name:string)=>({data:name==="literature_course_access"?{supervisor:false,unlocked:false}:[],error:null}));
 const b:any={select:vi.fn(()=>b),order:vi.fn(()=>b),limit:vi.fn(()=>b),insert:vi.fn(async()=>({error:null})),update:vi.fn(()=>b),eq:vi.fn(()=>b),then:(resolve:any)=>Promise.resolve({data:[],error:null}).then(resolve)};m.builder=b;m.from.mockReturnValue(b);m.extract.mockResolvedValue({text:"Literature source",fileName:"source.pdf"});
});
afterEach(cleanup);
describe("literature course",()=>{
 it("keeps students behind the code gate without querying files or question sets",async()=>{
  render(<LiteratureCourse isAr onClose={()=>{}}/>);expect(await screen.findByText("الدورة مقفولة بكود")).toBeInTheDocument();expect(m.from).not.toHaveBeenCalled();expect(screen.queryByText("إنشاء أكواد للدورة")).not.toBeInTheDocument();
 });
 it("opens the course after successful code redemption",async()=>{
  let unlocked=false;m.rpc.mockImplementation(async(name:string)=>{if(name==="redeem_literature_code"){unlocked=true;return{data:{ok:true},error:null};}return{data:name==="literature_course_access"?{supervisor:false,unlocked}:[],error:null};});
  render(<LiteratureCourse isAr onClose={()=>{}}/>);fireEvent.change(await screen.findByLabelText("كود الدخول"),{target:{value:"ADAB-VALID"}});fireEvent.click(screen.getByRole("button",{name:"تفعيل الكود"}));
  expect(await screen.findByRole("button",{name:"الامتحانات"})).toBeInTheDocument();expect(screen.queryByText("الدورة مقفولة بكود")).not.toBeInTheDocument();expect(screen.queryByRole("button",{name:"أكواد الدخول"})).not.toBeInTheDocument();
 });
 it("uploads supervisor exam files privately and saves an unpublished draft",async()=>{
  m.rpc.mockResolvedValue({data:{supervisor:true,unlocked:true},error:null});const view=render(<LiteratureCourse isAr onClose={()=>{}}/>);
  fireEvent.change(await screen.findByLabelText("عنوان الامتحان"),{target:{value:"امتحان الأدب الأول"}});
  fireEvent.change(view.container.querySelector('input[accept=".pdf,.jpg,.jpeg,.png"]')!,{target:{files:[new File(["paper"],"exam.pdf")]}});fireEvent.click(screen.getByRole("button",{name:"رفع كمسودة"}));
  await waitFor(()=>expect(m.builder.insert).toHaveBeenCalledWith(expect.objectContaining({title:"امتحان الأدب الأول",file_path:expect.stringMatching(/^exams\/.+\.pdf$/)})));
  expect(m.upload).toHaveBeenCalledWith(expect.stringMatching(/^exams\//),expect.any(File),expect.objectContaining({upsert:false,contentType:"application/pdf"}));
  expect(m.builder.insert.mock.calls[0][0].is_published).not.toBe(true);
 });
 it("shows invalid code errors and does not unlock the course",async()=>{
  m.rpc.mockImplementation(async(name:string)=>({data:name==="redeem_literature_code"?{ok:false,error:"invalid_code"}:{supervisor:false,unlocked:false},error:null}));
  render(<LiteratureCourse isAr onClose={()=>{}}/>);fireEvent.change(await screen.findByLabelText("كود الدخول"),{target:{value:"bad"}});fireEvent.click(screen.getByRole("button",{name:"تفعيل الكود"}));
  expect(await screen.findByRole("alert")).toHaveTextContent("الكود غير صالح");expect(screen.getByText("الدورة مقفولة بكود")).toBeInTheDocument();
 });
 it("supervisors generate the selected count, review it, then save without automatic publication",async()=>{
  m.rpc.mockResolvedValue({data:{supervisor:true,unlocked:true},error:null});m.invoke.mockResolvedValue({data:{questions:[q]},error:null});
  const view=render(<LiteratureCourse isAr onClose={()=>{}}/>);fireEvent.click(await screen.findByRole("button",{name:"MCQ"}));
  fireEvent.change(screen.getByLabelText("عنوان مجموعة الأسئلة"),{target:{value:"الجواهري"}});fireEvent.change(screen.getByLabelText("عدد الأسئلة (١–١٠٠)"),{target:{value:"1"}});
  fireEvent.change(view.container.querySelector('input[accept=".pdf,.docx,.txt"]')!,{target:{files:[new File(["source"],"source.pdf")]}});
  fireEvent.click(screen.getByRole("button",{name:"توليد للمراجعة"}));
  await screen.findByRole("heading",{name:/مراجعة الأسئلة/});expect(m.invoke).toHaveBeenCalledWith("generate-mcq",expect.objectContaining({body:expect.objectContaining({count:1,literatureGeneration:true,language:"ar"})}));expect(m.builder.insert).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button",{name:"حفظ المجموعة كمسودة"}));
  await waitFor(()=>expect(m.builder.insert).toHaveBeenCalledWith(expect.objectContaining({requested_count:1,is_published:false,source_name:"source.pdf"})));
 });
 it("does not let a short generation result silently replace the requested count",async()=>{
  m.rpc.mockResolvedValue({data:{supervisor:true,unlocked:true},error:null});m.invoke.mockResolvedValue({data:{questions:[q]},error:null});
  const view=render(<LiteratureCourse isAr onClose={()=>{}}/>);fireEvent.click(await screen.findByRole("button",{name:"MCQ"}));fireEvent.change(screen.getByLabelText("عنوان مجموعة الأسئلة"),{target:{value:"الأدب"}});fireEvent.change(screen.getByLabelText("عدد الأسئلة (١–١٠٠)"),{target:{value:"2"}});
  fireEvent.change(view.container.querySelector('input[accept=".pdf,.docx,.txt"]')!,{target:{files:[new File(["source"],"source.pdf")]}});fireEvent.click(screen.getByRole("button",{name:"توليد للمراجعة"}));
  expect(await screen.findByRole("button",{name:"حفظ المجموعة كمسودة"})).toBeDisabled();expect(screen.getByRole("button",{name:"إكمال العدد المتبقي"})).toBeEnabled();expect(m.builder.insert).not.toHaveBeenCalled();
 });
 it("clears generated access codes when the account changes",async()=>{
  m.rpc.mockImplementation(async(name:string)=>({data:name==="create_literature_codes"?[{id:"code1",code:"ADAB-SECRET"}]:{supervisor:true,unlocked:true},error:null}));
  render(<LiteratureCourse isAr onClose={()=>{}}/>);fireEvent.click(await screen.findByRole("button",{name:"أكواد الدخول"}));fireEvent.click(screen.getByRole("button",{name:"إنشاء الأكواد"}));expect(await screen.findByLabelText("الأكواد الجديدة")).toHaveValue("ADAB-SECRET");
  act(()=>m.listener?.("SIGNED_OUT",null));expect(screen.queryByDisplayValue("ADAB-SECRET")).not.toBeInTheDocument();expect(await screen.findByText("سجّل دخولك حتى تدخل للدورة.")).toBeInTheDocument();
 });
 it("discards question generation that finishes after sign-out",async()=>{
  m.rpc.mockResolvedValue({data:{supervisor:true,unlocked:true},error:null});let finish!:(value:any)=>void;m.invoke.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
  const view=render(<LiteratureCourse isAr onClose={()=>{}}/>);fireEvent.click(await screen.findByRole("button",{name:"MCQ"}));fireEvent.change(screen.getByLabelText("عنوان مجموعة الأسئلة"),{target:{value:"الأدب"}});
  fireEvent.change(view.container.querySelector('input[accept=".pdf,.docx,.txt"]')!,{target:{files:[new File(["source"],"source.pdf")]}});fireEvent.click(screen.getByRole("button",{name:"توليد للمراجعة"}));await waitFor(()=>expect(m.invoke).toHaveBeenCalledOnce());
  act(()=>m.listener?.("SIGNED_OUT",null));await act(async()=>finish({data:{questions:[q]},error:null}));expect(screen.queryByDisplayValue(q.question)).not.toBeInTheDocument();expect(screen.queryByText("مراجعة الأسئلة")).not.toBeInTheDocument();
 });
 it("scores through the server only after all choices are selected",async()=>{
  m.rpc.mockImplementation(async(name:string)=>({data:name==="literature_course_access"?{supervisor:false,unlocked:true}:name==="list_literature_mcq_sets"?[{id:"set1",title:"اختبار",count:1}]:name==="get_literature_mcq_set"?{id:"set1",title:"اختبار",questions:[{question:q.question,choices:q.choices}]}:name==="submit_literature_mcq"?{score:1,total:1,review:[{answer_index:1,explanation:q.explanation}]}:[],error:null}));
  render(<LiteratureCourse isAr onClose={()=>{}}/>);fireEvent.click(await screen.findByRole("button",{name:"MCQ"}));fireEvent.click(await screen.findByRole("button",{name:"ابدأ الأسئلة"}));
  expect(await screen.findByRole("button",{name:"تسليم ومعرفة النتيجة"})).toBeDisabled();expect(screen.queryByText(q.explanation)).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("radio")[1]);fireEvent.click(screen.getByRole("button",{name:"تسليم ومعرفة النتيجة"}));expect(await screen.findByText(q.explanation,{exact:false})).toBeInTheDocument();expect(m.rpc).toHaveBeenCalledWith("submit_literature_mcq",{set_id:"set1",selections:[1]});
 });
});
