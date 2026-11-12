import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TripApp } from "./TripApp";
import { createLocalRepository } from "./journeys";
import type { Journey } from "./journeys";

vi.mock("./Globe", () => ({ Globe: () => <div>Flight map preview</div> }));
vi.mock("@/components/CharacterAvatar", () => ({
  CharacterAvatar: ({ gender, traits }: { gender: string; traits?: { variant?: number } }) => (
    <span data-testid="character" data-gender={gender} data-variant={traits?.variant} />
  ),
}));

describe("study flight cabin", () => {
  it("does not replace newer shared-room membership with a late polling response", async () => {
    const store=new Map<string,string>();const local=createLocalRepository({getItem:k=>store.get(k)??null,setItem:(k,v)=>{store.set(k,v);}});
    const {journey}=await local.create("student-1","AE:dubai");
    const list=vi.fn(async()=>[journey]);
    const repository={...local,accountBacked:true,list};
    const view=render(<TripApp studentId="student-1" repository={repository} language="en"/>);
    await screen.findByRole("region",{name:"Cabin"});
    const pending:Array<(rows:Journey[])=>void>=[];
    list.mockImplementation(()=>new Promise<Journey[]>(resolve=>{pending.push(resolve);}));
    fireEvent(window,new Event("focus"));fireEvent(window,new Event("focus"));
    expect(pending).toHaveLength(2);
    await act(async()=>pending[1]([{...journey,passengers:[{userId:"friend",displayName:"Friend",gender:"female",character:{variant:2},seatNumber:1,status:"accepted"}]}]));
    await waitFor(()=>expect(screen.getAllByTestId("character")).toHaveLength(2));
    await act(async()=>pending[0]([journey]));
    expect(screen.getAllByTestId("character")).toHaveLength(2);
    view.unmount();
  });
  it("resumes with the saved character and keeps break and map controls working", async () => {
    const values = new Map<string, string>();
    const repository = createLocalRepository({ getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
    await repository.create("student-1", "AE:dubai");
    const view = render(<TripApp studentId="student-1" studentName="Zahraa" studentGender="female" studentCharacter={{ variant: 7 }} repository={repository} language="en" />);
    const cabin = await screen.findByRole("region", { name: "Cabin" });
    expect(cabin.textContent).toContain("Zahraa");
    expect(cabin.textContent).toContain("Dubai");
    expect(screen.getAllByTestId("character")).toHaveLength(1);
    expect(screen.getAllByTestId("character")[0]).toHaveAttribute("data-gender", "female");
    expect(screen.getAllByTestId("character")[0]).toHaveAttribute("data-variant", "7");
    fireEvent.click(screen.getByRole("button", { name: /TAKE A BREAK AT A STATION/ }));
    await screen.findByRole("region", { name: "Travellers’ lounge" });
    expect(screen.queryByRole("region", { name: "Cabin" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CONTINUE THE TRIP" }));
    await screen.findByRole("region", { name: "Cabin" });
    fireEvent.click(screen.getByRole("button", { name: "Flight map" }));
    expect(screen.queryByRole("region", { name: "Cabin" })).toBeNull();
    expect(screen.getByText("Flight map preview")).toBeTruthy();
    view.unmount();
  });

  it("sells an arrived account visa once and leaves its city in the passport", async () => {
    const values=new Map<string,string>();
    const local=createLocalRepository({getItem:key=>values.get(key)??null,setItem:(key,value)=>{values.set(key,value);}});
    const {journey}=await local.create("student-1","AE:dubai",Date.now()-30_000_000);
    const saved={...journey,status:"arrived" as const,arrivalSeenAt:1,canSell:true};
    const sellVisa=vi.fn(async()=>{saved.visaSoldAt=Date.now();return{points:100};});
    const repository={...local,accountBacked:true,list:async()=>[{...saved}],sellVisa};
    const confirm=vi.spyOn(window,"confirm").mockReturnValue(true);
    const view=render(<TripApp studentId="student-1" repository={repository} language="en"/>);
    fireEvent.click(await screen.findByRole("button",{name:/VISA COLLECTION/}));
    fireEvent.click(screen.getByRole("button",{name:"Sell visa for 100 points"}));
    expect(await screen.findByText("✓ Visa sold · 100 points")).toBeInTheDocument();
    expect(sellVisa).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button",{name:"Sell visa for 100 points"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Back"}));
    fireEvent.click(screen.getByRole("button",{name:"Your world travel map"}));
    fireEvent.change(await screen.findByLabelText("Search cities"),{target:{value:"Dubai"}});
    expect(await screen.findByRole("button",{name:"Dubai — Visited"})).toBeInTheDocument();
    view.unmount();confirm.mockRestore();
  });
});
