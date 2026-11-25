import {beforeEach,describe,expect,it} from 'vitest';
import {extractAssistantPlan,renderAssistantParts,stripAssistantPlan,mutamayizSystem} from '../../supabase/functions/_shared/mutamayiz';
import {assistantSnapshot,newAssistantConversation,setAssistantOwner,updateAssistant} from './mutamayizConversation';
beforeEach(()=>{setAssistantOwner(null);});
describe('Mutamayiz contracts',()=>{
 it('shares the five capabilities under one identity',()=>{
  const prompt=mutamayizSystem('ar');for(const text of ['متميز','المشاكل','نفسياً','جدول','العلمية','أدوات','لا تشخّص','لا تختلق أرقام','موافقته'])expect(prompt).toContain(text);
 });
 it('only renders allowlisted student destinations and limits link buttons',()=>{
  const parts=renderAssistantParts('[[tool:adminDashboard|admin]] [[tool:malazam|notes]] [[tool:mcqBank|questions]] [[tool:todo|tasks]] [[tool:sessions|sessions]]');
  expect(parts.filter(p=>p.t==='link').map(p=>p.t==='link'&&p.key)).toEqual(['malazam','mcqBank','todo']);
  expect(parts.some(p=>p.t==='link'&&p.key==='adminDashboard')).toBe(false);
 });
 it('accepts bounded real day/task plans and rejects malformed or excessive plans',()=>{
  expect(extractAssistantPlan('```plan\n{"tasks":[{"day":"السبت","text":"راجع الفيزياء"}]}\n```')).toEqual([{day:'السبت',text:'راجع الفيزياء'}]);
  expect(extractAssistantPlan('```json\n{"tasks":[{"day":"Neverday","text":"x"}]}\n```')).toBeNull();
  expect(extractAssistantPlan('```json\n{"tasks":[{"day":"Friday","text":""}]}\n```')).toBeNull();
  expect(stripAssistantPlan('Here is the plan.\n```plan\n{"tasks":[{"day":"Friday","text":"Review"}]}\n```')).toBe('Here is the plan.');
 });
 it('keeps a conversation across entry points but clears it on account changes',()=>{
  setAssistantOwner('A');updateAssistant('A',s=>({...s,messages:[{id:'1',role:'user',content:'personal text'}],file:{id:'test-file',name:'file',text:'lesson'}}));
  setAssistantOwner('A');expect(assistantSnapshot().messages).toHaveLength(1);
  setAssistantOwner('B');expect(assistantSnapshot().messages).toEqual([]);expect(assistantSnapshot().file).toBeNull();
  updateAssistant('A',s=>({...s,messages:[{id:'stale',role:'assistant',content:'late response'}]}));expect(assistantSnapshot().messages).toEqual([]);
 });
 it('finds a study plan after an unrelated JSON example in the same explanation',()=>{
  const reply='Example:\n```json\n{"energy":"J"}\n```\nPlan:\n```plan\n{"tasks":[{"day":"Friday","text":"Review energy units"}]}\n```';
  expect(extractAssistantPlan(reply)).toEqual([{day:'Friday',text:'Review energy units'}]);
  expect(stripAssistantPlan(reply)).toContain('"energy":"J"');
 });
 it('increments the epoch when a new conversation is requested',()=>{
  setAssistantOwner('A');const epoch=assistantSnapshot().epoch;newAssistantConversation('A');expect(assistantSnapshot().epoch).toBeGreaterThan(epoch);
 });
});
