import {describe,it,expect} from 'vitest';
import {PHYSICS_SCHEMES} from './physicsSchemes';
import {current,relativePower,halfPower,resonance,tunedCurrent} from '../../tools/resonance-video/src/physics';

describe('resonance curriculum and scientific visuals',()=>{
 it('keeps the existing eddy-current lesson and adds 13 short source-grounded parts',()=>{
  expect(PHYSICS_SCHEMES.some(l=>l.id==='eddy-currents')).toBe(true);
  const lesson=PHYSICS_SCHEMES.find(l=>l.id==='electrical-resonance')!;
  expect(lesson.chapter).toBe(3);expect(lesson.parts).toHaveLength(13);
  expect(new Set(lesson.parts.map(p=>p.id)).size).toBe(13);
  for(const p of lesson.parts){expect(p.video?.durationSeconds).toBe(12);expect(p.video?.src).toMatch(/\.mp4$/);expect(p.source?.language).toBe('en');expect(p.source?.pages.length).toBeGreaterThan(0);expect(p.text.ar.length).toBeGreaterThan(60);expect(p.memory?.ar).toBeTruthy();expect(p.recall?.answer.ar).toBeTruthy();}
 });
 it('uses equal reactances at resonance and a lower current for greater resistance',()=>{
  expect(current(1,.2)).toBeCloseTo(1);expect(current(1,1)).toBeCloseTo(.2);
  expect(current(.7,.2)).toBeLessThan(current(1,.2));expect(current(1.4,.2)).toBeLessThan(current(1,.2));
 });
 it('locates bandwidth at half power rather than half current',()=>{
  for(const r of [.2,.5,1]){const [a,b]=halfPower(r);expect(relativePower(a,r)).toBeCloseTo(.5);expect(relativePower(b,r)).toBeCloseTo(.5);expect(b-a).toBeCloseTo(r);expect(a*b).toBeCloseTo(1);}
 });
 it('keeps the fixed-R current peak and absolute bandwidth when C is tuned',()=>{
  for(const fr of [.5,.75,1]){expect(tunedCurrent(fr,fr)).toBeCloseTo(1);const [a,b]=halfPower(.2/fr);expect(fr*(b-a)).toBeCloseTo(.2);}
 });
 it('halves resonant frequency when capacitance is multiplied by four',()=>{
  expect(resonance(.2,4e-6)/resonance(.2,1e-6)).toBeCloseTo(.5);
 });
});
