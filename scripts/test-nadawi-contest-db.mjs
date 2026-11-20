import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {PGlite}=await import(process.env.NADAWI_PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();
await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE TABLE public.profiles(user_id uuid PRIMARY KEY,display_name text);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
GRANT USAGE ON SCHEMA auth TO authenticated;GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;`);
await db.exec(await readFile(new URL('../supabase/migrations/20261120200000_timed_nadawi_contest.sql',import.meta.url),'utf8'));
const ids=Array.from({length:4},(_,i)=>`00000000-0000-4000-8000-00000000000${i+1}`);
for(let i=0;i<4;i++){await db.query('INSERT INTO auth.users VALUES($1)',[ids[i]]);await db.query('INSERT INTO profiles VALUES($1,$2)',[ids[i],['Ali','Sara','Omar','Zain'][i]]);}
const user=id=>db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[id]);
const rpc=async(sql,args=[])=> (await db.query(sql,args)).rows[0].result;
const start=()=>rpc('SELECT start_nadawi_contest() AS result');
const state=()=>rpc('SELECT get_nadawi_contest_state() AS result');
const answer=(s,v,index=s.question_index)=>rpc('SELECT submit_nadawi_contest_answer($1,$2,$3) AS result',[s.attempt_id,index,v]);
const key=async s=>{const q=(await db.query('SELECT items->($2::integer) AS item FROM nadawi_contest_attempts WHERE id=$1',[s.attempt_id,s.question_index])).rows[0].item;return q.kind==='mcq'?String(q.choices.indexOf(q.answer_key.correct)):(q.id==='Q3C.1'?'FREQ.':q.answer_key.answers[0].toUpperCase());};
await user(ids[0]);
const early=(await db.query("SELECT clock_timestamp()<timestamptz '2026-11-20 20:30:00+03' AS early")).rows[0].early;
if(early) await assert.rejects(start,/CONTEST_NOT_OPEN/);
const definition=(await db.query("SELECT pg_get_functiondef('public.start_nadawi_contest()'::regprocedure) AS def")).rows[0].def;
await db.exec(definition.replace('2026-11-20 20:30:00+03','2000-01-01 00:00:00+00'));
let a=await start();assert.equal(a.status,'active');assert.equal(a.score,undefined);assert.ok(!JSON.stringify(a).includes('answer_key'));
const orderA=(await db.query('SELECT items FROM nadawi_contest_attempts WHERE id=$1',[a.attempt_id])).rows[0].items;
assert.equal(new Set(orderA.map(q=>q.id)).size,41);assert.deepEqual((await start()).question,a.question);
assert.equal(Date.parse(a.deadline_at)-Date.parse(a.started_at),30000);
await assert.rejects(()=>answer(a,'x'.repeat(61)),/ANSWER_TOO_LONG/);
const first=a,value=await key(a);a=await answer(a,value);assert.equal(a.question_index,1);assert.equal((await answer(first,value)).question_index,1);
assert.equal((await db.query('SELECT score FROM nadawi_contest_attempts WHERE id=$1',[a.attempt_id])).rows[0].score,1);
await user(ids[1]);const b=await start();const orderB=(await db.query('SELECT items FROM nadawi_contest_attempts WHERE id=$1',[b.attempt_id])).rows[0].items;
assert.notDeepEqual(orderA.map(q=>q.id),orderB.map(q=>q.id));await assert.rejects(()=>answer(first,value),/ATTEMPT_NOT_FOUND/);
await user(ids[0]);let checkedShort=false;while(a.status==='active'){if(a.question.kind==='short'&&!checkedShort){await assert.rejects(()=>answer(a,'two words'),/ONE_WORD_REQUIRED/);checkedShort=true;}a=await answer(a,await key(a));}assert.equal(a.score,41);assert.equal(a.status,'completed');
assert.equal((await db.query('SELECT jsonb_array_length(answers) AS n FROM nadawi_contest_attempts WHERE id=$1',[a.attempt_id])).rows[0].n,41);
await user(ids[2]);let c=await start();await db.query("UPDATE nadawi_contest_attempts SET started_at=clock_timestamp()-interval '31 seconds',question_started_at=clock_timestamp()-interval '31 seconds' WHERE id=$1",[c.attempt_id]);
assert.equal((await answer(c,await key(c))).question_index,1);assert.equal((await db.query('SELECT score FROM nadawi_contest_attempts WHERE id=$1',[c.attempt_id])).rows[0].score,0);
await user(ids[3]);let d=await start();await db.query("UPDATE nadawi_contest_attempts SET started_at=clock_timestamp()-interval '1231 seconds',question_started_at=clock_timestamp()-interval '1231 seconds' WHERE id=$1",[d.attempt_id]);
await db.query('UPDATE nadawi_contest_attempts SET question_started_at=started_at WHERE id=$1',[d.attempt_id]);
await db.query('SELECT * FROM get_nadawi_contest_leaderboard()');
assert.ok((await db.query('SELECT completed_at FROM nadawi_contest_attempts WHERE id=$1',[d.attempt_id])).rows[0].completed_at);
d=await state();assert.equal(d.status,'completed');assert.equal(d.score,0);assert.equal(d.elapsed_ms,1230000);
for(const [id,score,time]of[[a.attempt_id,41,2000],[b.attempt_id,41,1000],[c.attempt_id,40,1],[d.attempt_id,41,1000]])await db.query('UPDATE nadawi_contest_attempts SET score=$2,elapsed_ms=$3,completed_at=clock_timestamp() WHERE id=$1',[id,score,time]);
await user(ids[0]);const ranks=(await db.query('SELECT * FROM get_nadawi_contest_leaderboard()')).rows;
assert.deepEqual(ranks.slice(0,2).map(r=>r.display_name).sort(),['Sara','Zain']);
assert.ok(ranks.slice(0,2).every(r=>Number(r.rank)===1&&r.score===41&&Number(r.elapsed_ms)===1000));
assert.deepEqual(ranks.slice(2).map(r=>[r.display_name,Number(r.rank),r.score,Number(r.elapsed_ms)]),[['Ali',2,41,2000],['Omar',3,40,1]]);
assert.equal(ranks.find(r=>r.display_name==='Ali').is_me,true);
await db.exec('SET ROLE authenticated;');await assert.rejects(()=>db.query('SELECT * FROM nadawi_contest_questions'),/permission denied/);await assert.rejects(()=>db.query('UPDATE nadawi_contest_attempts SET score=41'),/permission denied/);await assert.rejects(()=>db.query('SELECT _nadawi_contest_step($1)',[a.attempt_id]),/permission denied/);assert.equal((await state()).score,41);
await db.exec('RESET ROLE;');await user('');await assert.rejects(start,/AUTH_REQUIRED/);
console.log('PASS: SQL migration, authentication, random/resumable order, private keys, grading, replay protection, foreign-attempt rejection, timeouts, persisted duration and score/time ranking.');

// Apply and exercise the admin-only extension against the same official fixtures.
await db.exec(`CREATE FUNCTION public.has_role(_user_id uuid,_role text) RETURNS boolean LANGUAGE sql STABLE AS $$
 SELECT coalesce(_role='admin' AND _user_id=nullif(current_setting('test.nadawi_admin',true),'')::uuid,false) $$;`);
await db.query("SELECT set_config('test.nadawi_admin',$1,false)",[ids[0]]);
await db.exec(await readFile(new URL('../supabase/migrations/20261120210000_nadawi_admin_test.sql',import.meta.url),'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/20261120220000_nadawi_mistakes.sql',import.meta.url),'utf8'));
const mistakes=(test=false)=>rpc('SELECT get_nadawi_contest_mistakes($1) AS result',[test]);
await user(''); await assert.rejects(()=>mistakes(),/AUTH_REQUIRED/);
await user(ids[0]); assert.deepEqual(await mistakes(),[]);
await db.query('UPDATE nadawi_contest_attempts SET completed_at=NULL WHERE id=$1',[b.attempt_id]);
await user(ids[1]); await assert.rejects(()=>mistakes(),/REVIEW_NOT_READY/);
await db.query('UPDATE nadawi_contest_attempts SET completed_at=clock_timestamp() WHERE id=$1',[b.attempt_id]);
await assert.rejects(()=>mistakes(true),/ADMIN_REQUIRED/);
await db.query('UPDATE nadawi_contest_attempts SET completed_at=NULL,score=0,elapsed_ms=NULL,question_started_at=clock_timestamp() WHERE id=$1',[c.attempt_id]);
await user(ids[2]); await assert.rejects(()=>mistakes(),/REVIEW_NOT_READY/);
c=await state(); let wrongMcq=false,wrongShort=false;
while(c.status==='active'){
 let value=await key(c);
 if(c.question.kind==='mcq'&&!wrongMcq){value=String((Number(value)+1)%c.question.choices.length);wrongMcq=true;}
 else if(c.question.kind==='short'&&!wrongShort){value='wrong';wrongShort=true;}
 c=await answer(c,value);
}
const errors=await mistakes(); assert.equal(errors.length,3); assert.equal(errors[0].timed_out,true);assert.equal(errors[0].user_answer,null);
const snapshot=(await db.query('SELECT items FROM nadawi_contest_attempts WHERE id=$1',[c.attempt_id])).rows[0].items;
for(const error of errors){
 const item=snapshot[error.question_number-1]; assert.equal(error.prompt,item.prompt);
 assert.deepEqual(error.correct_answers,item.kind==='mcq'?[item.answer_key.correct]:item.answer_key.answers);
 if(!error.timed_out&&item.kind==='mcq')assert.ok(item.choices.includes(error.user_answer));
 if(!error.timed_out&&item.kind==='short')assert.equal(error.user_answer,'wrong');
}
await user(ids[3]); const expired=await mistakes();assert.equal(expired.length,41);assert.ok(expired.every(e=>e.timed_out&&e.user_answer===null));
await db.exec('SET ROLE authenticated;'); assert.equal((await mistakes()).length,41); await db.exec('RESET ROLE;');
await user(ids[0]); assert.deepEqual(await mistakes(),[]);
console.log('PASS: completed own-only mistake review, active/auth/admin denial, shuffled choice text, one-word corrections and expired questions.');
await user(ids[1]);
await assert.rejects(()=>rpc('SELECT start_nadawi_admin_test() AS result'),/ADMIN_REQUIRED/);
await assert.rejects(()=>rpc('SELECT get_nadawi_admin_test_state() AS result'),/ADMIN_REQUIRED/);
await user(ids[0]);
const officialBefore=(await db.query('SELECT to_jsonb(a) AS a FROM nadawi_contest_attempts a WHERE user_id=$1',[ids[0]])).rows[0].a;
const previewState=()=>rpc('SELECT get_nadawi_admin_test_state() AS result');
const previewStart=restart=>rpc('SELECT start_nadawi_admin_test($1) AS result',[restart]);
const previewAnswer=(s,v)=>rpc('SELECT submit_nadawi_admin_test_answer($1,$2,$3) AS result',[s.attempt_id,s.question_index,v]);
const previewKey=async s=>{const q=(await db.query('SELECT items->($2::integer) AS item FROM nadawi_contest_test_attempts WHERE id=$1',[s.attempt_id,s.question_index])).rows[0].item;return q.kind==='mcq'?String(q.choices.indexOf(q.answer_key.correct)):q.answer_key.answers[0];};
assert.equal((await previewState()).status,'not_started');
let preview=await previewStart(false); assert.equal(preview.status,'active');
await assert.rejects(()=>mistakes(true),/REVIEW_NOT_READY/);
assert.equal((await previewState()).attempt_id,preview.attempt_id);
await user(ids[1]);await assert.rejects(()=>previewAnswer(preview,'0'),/ADMIN_REQUIRED/);await user(ids[0]);
preview=await previewAnswer(preview,await previewKey(preview)); assert.equal(preview.question_index,1);
const oldPreview=preview.attempt_id; preview=await previewStart(true); assert.notEqual(preview.attempt_id,oldPreview); assert.equal(preview.question_index,0);
while(preview.status==='active')preview=await previewAnswer(preview,await previewKey(preview));
assert.equal(preview.score,41); assert.deepEqual(await mistakes(true),[]);
const officialAfter=(await db.query('SELECT to_jsonb(a) AS a FROM nadawi_contest_attempts a WHERE user_id=$1',[ids[0]])).rows[0].a;
assert.deepEqual(officialAfter,officialBefore);
assert.equal((await db.query('SELECT * FROM get_nadawi_contest_leaderboard()')).rows.length,4);
await db.query("SELECT set_config('test.nadawi_admin','',false)");
await assert.rejects(previewState,/ADMIN_REQUIRED/);
await assert.rejects(()=>mistakes(true),/ADMIN_REQUIRED/);
await db.exec('SET ROLE authenticated;');
await assert.rejects(()=>db.query('SELECT * FROM nadawi_contest_test_attempts'),/permission denied/);
await db.exec('RESET ROLE;');
console.log('PASS: admin previews, role enforcement/revocation, restart, identical 41-point grading and isolation from official attempts/rankings.');
// Correct the original key and all saved attempts without changing their timing.
await db.query("SELECT set_config('test.nadawi_admin',$1,false)",[ids[0]]);
const correctionFixtures=[];
const template=(await db.query('SELECT * FROM nadawi_contest_attempts WHERE user_id=$1',[ids[0]])).rows[0];
const speedingIndex=template.items.findIndex(item=>item.id==='Q3C.6');
for(const [index,submitted] of ['ticket','SPEEDING   TICKET.','fine',null].entries()){
 const uid=`00000000-0000-4000-8000-00000000001${index}`;
 await db.query('INSERT INTO auth.users VALUES($1)',[uid]);
 const answers=structuredClone(template.answers); const entry=answers.find(e=>e.index===speedingIndex);
 entry.answer=submitted; entry.correct=submitted==='fine';entry.timed_out=submitted===null;
 if(index===0){const called=answers.find(e=>template.items[e.index].id==='Q3C.4');called.answer='alerted';called.correct=false;}
 const score=answers.filter(e=>e.correct).length;
 await db.query(`INSERT INTO nadawi_contest_attempts(user_id,items,started_at,question_started_at,question_index,answers,score,completed_at,elapsed_ms)
 VALUES($1,$2,$3,$3,41,$4,$5,$6,$7)`,[uid,JSON.stringify(template.items),template.started_at,JSON.stringify(answers),score,template.completed_at,template.elapsed_ms]);
 correctionFixtures.push(uid);
}
const beforeCorrection=(await db.query("SELECT 'official' AS mode,to_jsonb(a) AS a FROM nadawi_contest_attempts a UNION ALL SELECT 'test',to_jsonb(a) FROM nadawi_contest_test_attempts a")).rows;
const correctionSql=await readFile(new URL('../supabase/migrations/20261120230000_nadawi_speeding_ticket.sql',import.meta.url),'utf8');
await db.exec(correctionSql);
const bank=(await db.query("SELECT item FROM nadawi_contest_questions WHERE id='Q3C.6'")).rows[0].item;
assert.deepEqual(bank.answer_key.answers,['ticket','speeding ticket']);assert.equal(bank.max_words,2);
for(const {mode,a:old} of beforeCorrection){
 const table=mode==='official'?'nadawi_contest_attempts':'nadawi_contest_test_attempts';
 const updated=(await db.query(`SELECT to_jsonb(a) AS a FROM ${table} a WHERE id=$1`,[old.id])).rows[0].a;
 for(const field of ['id','user_id','started_at','question_started_at','question_index','completed_at','elapsed_ms'])assert.deepEqual(updated[field],old[field]);
 assert.deepEqual(updated.items.map(q=>q.id),old.items.map(q=>q.id));
 let delta=0;
 for(let i=0;i<old.answers.length;i++){
  const prior=old.answers[i]; const item=old.items[prior.index];
  if(!['Q3C.4','Q3C.6'].includes(item.id)){assert.deepEqual(updated.answers[i],prior);continue;}
  const normalized=String(prior.answer??'').trim().toLowerCase().replace(/[.!?,;:]+$/,'').replace(/\s+/g,' ');
  const correct=!prior.timed_out&&(item.id==='Q3C.6'?['ticket','speeding ticket']:['named','alerted']).includes(normalized);
  delta+=Number(correct)-Number(prior.correct);
  assert.deepEqual(updated.answers[i],{...prior,correct});
 }
 assert.equal(updated.score,old.score+delta);
}
for(const [index,uid] of correctionFixtures.entries()){
 await user(uid);const errors=await mistakes();
 assert.equal(errors.some(e=>e.prompt===bank.prompt),index>=2);
 if(index===0)assert.equal(errors.some(e=>e.prompt.includes('called')),false);
 if(index>=2)assert.deepEqual(errors.find(e=>e.prompt===bank.prompt).correct_answers,['ticket','speeding ticket']);
}
// Exercise the updated official and preview graders with a two-word response.
for(const test of [false,true]){
 const uid=test?ids[0]:'00000000-0000-4000-8000-000000000020';
 if(!test)await db.query('INSERT INTO auth.users VALUES($1)',[uid]);
 await user(uid); let s=test?await previewStart(true):await start();
 const table=test?'nadawi_contest_test_attempts':'nadawi_contest_attempts';
 await db.query(`UPDATE ${table} SET items=(SELECT jsonb_agg(item ORDER BY (item->>'id'='Q3C.6') DESC,n) FROM jsonb_array_elements(items) WITH ORDINALITY q(item,n)) WHERE id=$1`,[s.attempt_id]);
 s=test?await previewState():await state();assert.equal(s.question.max_words,2);assert.equal(s.question.prompt,bank.prompt);
 s=test?await previewAnswer(s,'SPEEDING   TICKET.'):await answer(s,'SPEEDING   TICKET.');
 assert.equal((await db.query(`SELECT score FROM ${table} WHERE id=$1`,[s.attempt_id])).rows[0].score,1);
 while(s.status==='active'){
  if(s.question.kind==='short')break;
  s=test?await previewAnswer(s,await previewKey(s)):await answer(s,await key(s));
 }
 assert.equal(s.question.max_words,1);
 await assert.rejects(()=>test?previewAnswer(s,'two words'):answer(s,'two words'),/ONE_WORD_REQUIRED/);
}
// Re-running the correction is safe and never awards a second point.
const scoresBefore=(await db.query('SELECT id,score FROM nadawi_contest_attempts ORDER BY id')).rows;
await db.exec(correctionSql);
assert.deepEqual((await db.query('SELECT id,score FROM nadawi_contest_attempts ORDER BY id')).rows,scoresBefore);
console.log('PASS: ticket/full phrase correction, old fine removal, retroactive scoring, timing/order preservation, retry safety and both live graders.');
await db.close();
