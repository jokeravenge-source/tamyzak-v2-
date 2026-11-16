import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import MutamayizChat from './MutamayizChat';
import {assistantSnapshot,newAssistantConversation,setAssistantOwner,updateAssistant} from '@/lib/mutamayizConversation';
import {getISOWeek,WEEKLY_LEARNING_KEY} from '@/lib/weeklyLearning';
const backend=vi.hoisted(()=>({invoke:vi.fn(),getUser:vi.fn(),onAuthStateChange:vi.fn(),unsubscribe:vi.fn(),pullTodos:vi.fn(),pushTodos:vi.fn(),readFile:vi.fn(),authListener:null as null|((e:string,s:unknown)=>void)}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{functions:{invoke:backend.invoke},auth:{getUser:backend.getUser,onAuthStateChange:backend.onAuthStateChange}}}));
vi.mock('@/lib/todosSync',()=>({getISOWeek:()=> '2026-W46',pullTodos:backend.pullTodos,pushTodos:backend.pushTodos}));
vi.mock('@/components/WeeklyWeaknessIntake',()=>({default:()=> <div>Weakness intake</div>}));
vi.mock('@/lib/mutamayizFile',()=>({readAssistantFile:backend.readFile}));
beforeEach(()=>{
 localStorage.clear();sessionStorage.clear();setAssistantOwner(null);backend.invoke.mockReset();backend.readFile.mockReset();backend.getUser.mockResolvedValue({data:{user:{id:'student'}}});backend.pushTodos.mockClear().mockResolvedValue(true);backend.pullTodos.mockReset().mockResolvedValue(null);
 backend.onAuthStateChange.mockImplementation((cb)=>{backend.authListener=cb;return{data:{subscription:{unsubscribe:backend.unsubscribe}}};});

});
afterEach(()=>vi.restoreAllMocks());
const send=async(text:string)=>{const input=await screen.findByRole('textbox');await waitFor(()=>expect(input).toBeEnabled());await act(async()=>{fireEvent.change(input,{target:{value:text}});fireEvent.click(screen.getByRole('button',{name:'إرسال'}));});};
describe('single Mutamayiz conversation',()=>{
 it('renders source status under the answer and preserves it across entry points',async()=>{
  backend.invoke.mockResolvedValue({data:{reply:'السعة C = Q/V.',scienceEvidence:{academicYear:'2026-2027',sources:[]}},error:null});
  const first=render(<MutamayizChat language="ar"/>);await send('عرّف السعة');
  expect(screen.getByRole('region',{name:'مصادر الجواب'})).toHaveTextContent('صفحة الكتاب: غير متحقق');
  first.unmount();const second=render(<MutamayizChat language="ar"/>);
  expect(await screen.findByRole('region',{name:'مصادر الجواب'})).toBeInTheDocument();second.unmount();
 });
 it('sends the current file name and text on every question and stops sending it after removal',async()=>{
  backend.readFile.mockResolvedValue('A plane intersects a sphere in a circle.');
  backend.invoke.mockResolvedValue({data:{reply:'I can read the attached lesson.'},error:null});
  const view=render(<MutamayizChat language="ar"/>);await waitFor(()=>expect(screen.getByRole('textbox')).toBeEnabled());
  await act(async()=>fireEvent.change(view.container.querySelector('input[type=file]')!,{target:{files:[new File(['lesson'],'الهندسة الفضائية.pdf')]}}));
  expect(await screen.findByText('الهندسة الفضائية.pdf')).toBeInTheDocument();
  await send('حصلت الملف؟');await send('اشرحلي المثال');
  for(const call of backend.invoke.mock.calls)expect(call[1].body).toMatchObject({attachmentName:'الهندسة الفضائية.pdf',clientContext:'A plane intersects a sphere in a circle.'});
  fireEvent.click(screen.getByRole('button',{name:'حذف الملف'}));await send('حصلت الملف؟');
  expect(backend.invoke.mock.calls[2][1].body).not.toHaveProperty('clientContext');expect(backend.invoke.mock.calls[2][1].body).not.toHaveProperty('attachmentName');view.unmount();
 });
 it('clears a previous attachment when the replacement has no readable text and shows an OCR hint',async()=>{
  backend.readFile.mockResolvedValue('');const view=render(<MutamayizChat language="ar"/>);await waitFor(()=>expect(screen.getByRole('textbox')).toBeEnabled());
  act(()=>updateAssistant('student',state=>({...state,file:{name:'old.pdf',text:'old text'}})));
  await act(async()=>fireEvent.change(view.container.querySelector('input[type=file]')!,{target:{files:[new File(['scan'],'scan.pdf')]}}));
  expect(assistantSnapshot().file).toBeNull();expect(screen.getByRole('alert')).toHaveTextContent('OCR');expect(screen.queryByText('scan.pdf')).not.toBeInTheDocument();view.unmount();
 });
 it('clears unsent personal text when another student signs in',async()=>{
  const view=render(<MutamayizChat language="ar"/>);
  const input=screen.getByRole('textbox');await waitFor(()=>expect(input).toBeEnabled());
  fireEvent.change(input,{target:{value:'private unsent text'}});
  act(()=>backend.authListener?.('SIGNED_IN',{user:{id:'second-student'}}));
  expect(input).toHaveValue('');expect(assistantSnapshot().owner).toBe('second-student');view.unmount();
 });
 it('offers a retry instead of confirming success when plan synchronization fails',async()=>{
  backend.pushTodos.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  backend.invoke.mockResolvedValue({data:{reply:'```plan\n{"tasks":[{"day":"السبت","text":"مراجعة الرنين"}]}\n```'},error:null});
  const view=render(<MutamayizChat language="ar"/>);await send('رتبلي جدول');
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'أوافق على الخطة وأضيفها لمهامي'})));
  expect(screen.queryByRole('button',{name:'الخطة انضافت لمهامك'})).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('مزامنة');
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'أوافق على الخطة وأضيفها لمهامي'})));
  expect(screen.getByRole('button',{name:'الخطة انضافت لمهامك'})).toBeDisabled();
  expect(JSON.parse(localStorage.getItem('app_todos_v1')!)).toHaveLength(1);view.unmount();
 });
 it('discards a file that finishes reading after another entry point starts a new conversation',async()=>{
  let finish!:(value:string)=>void;backend.readFile.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
  const view=render(<MutamayizChat language="ar"/>);await waitFor(()=>expect(screen.getByRole('textbox')).toBeEnabled());
  fireEvent.change(view.container.querySelector('input[type=file]')!,{target:{files:[new File(['lesson'],'lesson.txt')]}});
  act(()=>newAssistantConversation('student'));
  await act(async()=>finish('old conversation file'));
  expect(assistantSnapshot().file).toBeNull();view.unmount();
 });
 it('does not write a previous account profile after its plan sync completes late',async()=>{
  let finish!:(value:boolean)=>void;backend.pushTodos.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  backend.invoke.mockResolvedValue({data:{reply:'```plan\n{"tasks":[{"day":"السبت","text":"مراجعة الرنين"}]}\n```'},error:null});
  const view=render(<MutamayizChat language="ar"/>);await send('رتبلي جدول');
  act(()=>updateAssistant('student',state=>({...state,profile:{isoWeek:getISOWeek(),subject:'physics',chapterKey:'ch3',chapterNumber:3,topicKey:'resonance',topicEn:'Resonance',topicAr:'الرنين',weaknessText:'old profile',updatedAt:''}})));
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'أوافق على الخطة وأضيفها لمهامي'})));
  await waitFor(()=>expect(backend.pushTodos).toHaveBeenCalledOnce());
  act(()=>backend.authListener?.('SIGNED_IN',{user:{id:'second-student'}}));
  localStorage.setItem(WEEKLY_LEARNING_KEY,JSON.stringify({owner:'second-student'}));
  await act(async()=>finish(true));
  expect(JSON.parse(localStorage.getItem(WEEKLY_LEARNING_KEY)!)).toEqual({owner:'second-student'});view.unmount();
 });
 it('approves a shared plan only once when two entry points are open',async()=>{
  backend.invoke.mockResolvedValue({data:{reply:'```plan\n{"tasks":[{"day":"السبت","text":"مراجعة الرنين"}]}\n```'},error:null});
  const initial=render(<MutamayizChat language="ar"/>);await send('رتبلي جدول');initial.unmount();
  let finish!:(value:boolean)=>void;backend.pushTodos.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  const view=render(<><MutamayizChat language="ar"/><MutamayizChat language="ar"/></>);
  await waitFor(()=>screen.getAllByRole('textbox').forEach(input=>expect(input).toBeEnabled()));
  const buttons=screen.getAllByRole('button',{name:'أوافق على الخطة وأضيفها لمهامي'});
  await act(async()=>{fireEvent.click(buttons[0]);fireEvent.click(buttons[1]);});
  expect(backend.pushTodos).toHaveBeenCalledOnce();
  await act(async()=>finish(true));
  expect(screen.getAllByRole('button',{name:'الخطة انضافت لمهامك'})).toHaveLength(2);
  expect(JSON.parse(localStorage.getItem('app_todos_v1')!)).toHaveLength(1);view.unmount();
 });
 it('carries the personalized planning shortcut through an asynchronous auth check',async()=>{
  let authenticated!:(result:unknown)=>void;
  backend.getUser.mockImplementationOnce(()=>new Promise(resolve=>{authenticated=resolve;}));
  backend.invoke.mockResolvedValue({data:{reply:'خلينا نرتب وقت مراجعة الرنين.'},error:null});
  localStorage.setItem(WEEKLY_LEARNING_KEY,JSON.stringify({isoWeek:getISOWeek(),subject:'physics',chapterKey:'ch3',chapterNumber:3,topicKey:'resonance',topicEn:'Resonance',topicAr:'الرنين',weaknessText:'مفاعلات الدائرة',updatedAt:new Date().toISOString()}));
  sessionStorage.setItem('companion:autoSchedule','1');
  const view=render(<MutamayizChat language="ar"/>);
  await act(async()=>authenticated({data:{user:{id:'student'}}}));
  expect(screen.getByRole('textbox')).toHaveValue('رتبلي جدول دراسة');
  await send('رتبلي جدول دراسة');
  expect(backend.invoke.mock.calls[0][1].body.learningProfile.topicEn).toBe('Resonance');view.unmount();
 });
 it('uses one backend and carries history from a scientific question to support',async()=>{
  backend.invoke.mockResolvedValueOnce({data:{reply:'الرنين عند تساوي المفاعلتين.'},error:null}).mockResolvedValueOnce({data:{reply:'أسمعك، احچيلي شنو مضايقك.'},error:null});
  const view=render(<MutamayizChat language="ar"/>);
  expect(screen.getByRole('heading',{name:'متميز'})).toBeInTheDocument();
  await send('اشرح الرنين');await screen.findByText('الرنين عند تساوي المفاعلتين.');
  await send('عندي ضغط من الامتحان');await screen.findByText('أسمعك، احچيلي شنو مضايقك.');
  const [name,payload]=backend.invoke.mock.calls[1];expect(name).toBe('excellence-companion');expect(payload.body.mode).toBe('unified');expect(payload.body.messages.map((m:{content:string})=>m.content)).toContain('اشرح الرنين');
  view.unmount();const reopened=render(<MutamayizChat language="ar"/>);expect(await screen.findByText('أسمعك، احچيلي شنو مضايقك.')).toBeInTheDocument();reopened.unmount();
 });
 it('requires explicit approval before adding a plan and prevents repeated approval',async()=>{
  backend.invoke.mockResolvedValue({data:{reply:'خطة مقترحة.\n```plan\n{"tasks":[{"day":"السبت","text":"مراجعة الرنين"}]}\n```'},error:null});
  const view=render(<MutamayizChat language="ar"/>);await send('رتبلي جدول');const approve=await screen.findByRole('button',{name:'أوافق على الخطة وأضيفها لمهامي'});
  expect(screen.getByRole('region',{name:'مراجعة الخطة'})).toHaveTextContent('السبت: مراجعة الرنين');
  expect(backend.pushTodos).not.toHaveBeenCalled();expect(localStorage.getItem('app_todos_v1')).toBeNull();
  await act(async()=>fireEvent.click(approve));await screen.findByRole('button',{name:'الخطة انضافت لمهامك'});expect(backend.pushTodos).toHaveBeenCalledOnce();expect(JSON.parse(localStorage.getItem('app_todos_v1')!)).toHaveLength(1);
  expect(screen.getByRole('button',{name:'الخطة انضافت لمهامك'})).toBeDisabled();view.unmount();
 });
 it('preserves account and local tasks when approving a new plan on a fresh browser',async()=>{
  backend.pullTodos.mockResolvedValue([{id:'parent-task',text:'مهمة ولي الأمر',day:'Sunday',done:false,source:'parent'}]);
  localStorage.setItem('app_todos_v1',JSON.stringify([{id:'local-task',text:'مهمتي السابقة',done:false}]));
  backend.invoke.mockResolvedValue({data:{reply:'```plan\n{"tasks":[{"day":"السبت","text":"مراجعة الرنين"}]}\n```'},error:null});
  const view=render(<MutamayizChat language="ar"/>);await send('رتبلي جدول');
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'أوافق على الخطة وأضيفها لمهامي'})));
  expect(backend.pushTodos.mock.calls[0][0].map((task:{text:string})=>task.text)).toEqual(['مهمة ولي الأمر','مهمتي السابقة','مراجعة الرنين']);view.unmount();
 });
 it('opens only validated tool buttons and drops account A state on sign out',async()=>{
  backend.invoke.mockResolvedValue({data:{reply:'[[tool:malazam|الملازم]] [[tool:adminDashboard|الإدارة]]'},error:null});const open=vi.fn();
  const view=render(<MutamayizChat language="ar" onOpenTool={open}/>);await send('وين الملازم؟');fireEvent.click(await screen.findByRole('button',{name:'الملازم'}));expect(open).toHaveBeenCalledWith('malazam');expect(screen.queryByRole('button',{name:'الإدارة'})).not.toBeInTheDocument();
  act(()=>backend.authListener?.('SIGNED_OUT',null));expect(assistantSnapshot().messages).toEqual([]);expect(await screen.findByText('سجّل دخولك حتى تحچي ويا متميز.')).toBeInTheDocument();view.unmount();
 });
 it('does not duplicate a request when send is pressed twice',async()=>{
  let finish!:(result:unknown)=>void;backend.invoke.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));const view=render(<MutamayizChat language="ar"/>);
  await send('ساعدني');fireEvent.click(screen.getByRole('button',{name:'إرسال'}));expect(backend.invoke).toHaveBeenCalledOnce();await act(async()=>finish({data:{reply:'هلا بيك'},error:null}));view.unmount();
 });
});
