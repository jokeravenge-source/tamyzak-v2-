import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SourceFlashcard } from "./SourceFlashcard";
const media={question:[{page:21,box:[20,70,630,130],src:'/question.webp',width:652,height:850}],answer:[{page:21,box:[20,70,630,818],src:'/answer.webp',width:652,height:850},{page:22,box:[20,70,630,300],src:'/continued.webp',width:652,height:850}]};
describe('source flashcards',()=>{
 it('conceals answers until revealed, rates recall, and resets for the next card',()=>{
  const onRate=vi.fn();const {rerender}=render(<SourceFlashcard question="Original question" answer="Complete answer" sourceMedia={media} index={0} total={2} onRate={onRate}/>);
  expect(screen.queryByRole('button',{name:'Good'})).toBeNull();expect(screen.queryByRole('img',{name:/Complete answer/})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Reveal answer'}));expect(screen.getAllByRole('img',{name:/Complete answer/})).toHaveLength(2);
  fireEvent.click(screen.getByRole('button',{name:'Good'}));expect(onRate).toHaveBeenCalledWith('good');
  rerender(<SourceFlashcard question="Next question" answer="Next answer" sourceMedia={media} index={1} total={2} onRate={onRate}/>);
  expect(screen.getByRole('button',{name:'Reveal answer'})).toBeTruthy();expect(screen.queryByRole('img',{name:/Next answer/})).toBeNull();
 });
});
