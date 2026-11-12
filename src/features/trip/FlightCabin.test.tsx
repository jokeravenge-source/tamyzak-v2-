import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FlightCabin } from "./FlightCabin";
import { createLocalRepository, type FlightPassenger } from "./journeys";

vi.mock("@/components/CharacterAvatar", () => ({CharacterAvatar:({traits}:{traits?:{variant?:number}})=><span data-testid="reader" data-variant={traits?.variant}/> }));
const friend=(id:number,status:FlightPassenger["status"]="accepted"):FlightPassenger=>({userId:`friend-${id}`,displayName:`Friend ${id}`,gender:"female",character:{variant:2},seatNumber:id,status});
describe("real invited cabin seats",()=>{
  it("has a single student initially, excludes pending invitations, then adds accepted friends",async()=>{
    const data=new Map<string,string>();const repo=createLocalRepository({getItem:k=>data.get(k)??null,setItem:(k,v)=>{data.set(k,v);}});
    const{journey}=await repo.create("me","AE:dubai");
    const props={journey,now:Date.now(),studentName:"Ali",gender:"male" as const,character:{variant:7 as const},lang:"en" as const};
    const view=render(<FlightCabin {...props} friends={[friend(1,"pending")]}/>);
    expect(screen.getAllByTestId("reader")).toHaveLength(1);
    expect(screen.getByTestId("reader")).toHaveAttribute("data-variant","7");
    view.rerender(<FlightCabin {...props} friends={[friend(1),friend(2,"pending")]}/>);
    expect(screen.getAllByTestId("reader")).toHaveLength(2);
    view.rerender(<FlightCabin {...props} friends={Array.from({length:10},(_,i)=>friend(i+1))}/>);
    expect(screen.getAllByTestId("reader")).toHaveLength(11);
    expect(view.container.querySelectorAll("[data-seat]")).toHaveLength(11);
    expect(new Set(Array.from(view.container.querySelectorAll("[data-seat]")).map(node=>node.getAttribute("data-seat"))).size).toBe(11);
  });
});
