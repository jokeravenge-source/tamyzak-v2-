import {beforeEach,describe,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,within} from '@testing-library/react';
import PhysicsSchemes from './PhysicsSchemes';
beforeEach(()=>{window.history.replaceState({},'', '/');localStorage.clear();vi.spyOn(window,'scrollTo').mockImplementation(()=>{});});
describe('physics scheme videos',()=>{
 it('places source text below the silent video and resets recall between parts',async()=>{
  const view=render(<PhysicsSchemes language="ar" onBack={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:/الرنين الكهربائي وعامل النوعية/}));
  const video=await screen.findByLabelText('ليش الراديو يختار محطة وحدة؟');
  expect(video.tagName).toBe('VIDEO');expect(video.hasAttribute('autoplay')).toBe(false);
  expect(video).toHaveAttribute('controls');expect(video).toHaveAttribute('playsinline');
  const source=screen.getByRole('region',{name:'نص الملزمة'});expect(within(source).getByText(/How can resonance be achieved/)).toBeInTheDocument();
  expect(video.compareDocumentPosition(source)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'إظهار الجواب'}));expect(screen.getByText('تردد الإشارة وتردد الرنين للدائرة.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'التالي'}));
  expect(await screen.findByLabelText('شرط الرنين: تعادل المفاعلتين')).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'إظهار الجواب'})).toHaveAttribute('aria-expanded','false');view.unmount();
 });
 it('opens a shared lesson link and recovers from invalid saved progress',async()=>{
  window.history.replaceState({},'', '/?scheme=electrical-resonance');
  localStorage.setItem('physics-scheme-progress:electrical-resonance','invalid');
  const view=render(<PhysicsSchemes language="en" onBack={()=>{}}/>);
  expect(await screen.findByLabelText('Tuning a radio station')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Next'}));
  expect(localStorage.getItem('physics-scheme-progress:electrical-resonance')).toBe('1');view.unmount();
  const resumed=render(<PhysicsSchemes language="en" onBack={()=>{}}/>);
  expect(await screen.findByLabelText('Equal reactances')).toBeInTheDocument();resumed.unmount();
 });
 it('keeps the diagram and source usable if the video cannot load',async()=>{
  const view=render(<PhysicsSchemes language="en" onBack={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:/Electrical Resonance/}));
  fireEvent.error(await screen.findByLabelText('Tuning a radio station'));
  expect(screen.getByRole('status')).toHaveTextContent('Video could not load');expect(screen.getByAltText('Tuning a radio station')).toBeInTheDocument();
  expect(screen.getByRole('region',{name:'Booklet text'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));expect(screen.getByLabelText('Tuning a radio station')).toBeInTheDocument();view.unmount();
 });
});
