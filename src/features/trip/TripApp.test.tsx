import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TripApp } from "./TripApp";
import { createLocalRepository, planTrip } from "./journeys";
import type { Journey } from "./journeys";
import { DESTINATIONS } from "./destinations";
import { DICTS } from "./i18n";

vi.mock("./Globe", () => ({ Globe: () => <div>Flight map preview</div> }));
vi.mock("./RandomDestinationGlobe", () => ({
  RandomDestinationGlobe: ({ onComplete }: { onComplete: () => void }) => <button onClick={onComplete}>Finish globe spin</button>,
}));
vi.mock("@/components/CharacterAvatar", () => ({
  CharacterAvatar: ({ gender, traits }: { gender: string; traits?: { variant?: number } }) => (
    <span data-testid="character" data-gender={gender} data-variant={traits?.variant} />
  ),
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("random flight country", () => {
  it.each(["en", "ar"] as const)("reveals a random country after the spin in %s without a pick-again button or early booking", async (language) => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const store = new Map<string, string>();
    const local = createLocalRepository({ getItem: key => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); } });
    const create = vi.fn(local.create);
    const repository = { ...local, create };
    const t = DICTS[language];
    render(<TripApp studentId="student-1" repository={repository} language={language} />);
    fireEvent.click(await screen.findByRole("button", { name: t.start }));
    fireEvent.change(screen.getByLabelText(t.searchLabel), { target: { value: "not-a-place-123" } });
    fireEvent.click(screen.getByRole("button", { name: t.randomCountry }));
    expect(screen.getByRole("status")).toHaveTextContent(t.randomChoosing);
    expect(screen.queryByRole("button", { name: t.getTicket })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: t.randomCountry })).not.toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Finish globe spin" }));
    // Baghdad is the origin; random choice must pick a valid city instead.
    expect(await screen.findByRole("heading", { name: language === "ar" ? "أربيل" : "Erbil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t.getTicket })).toBeEnabled();
    expect(create).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: t.randomCountry })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: t.getTicket }));
    await waitFor(() => expect(create).toHaveBeenCalledWith("student-1", "IQ:erbil"));
    fireEvent.click(await screen.findByRole("button", { name: t.skip }));
    expect(await screen.findByRole("region", { name: t.cabin })).toBeInTheDocument();
  });

  it("skips booked destinations and disables random selection after all valid routes have been booked", async () => {
    const store = new Map<string, string>();
    const local = createLocalRepository({ getItem: key => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); } });
    const { journey } = await local.create("student-1", "AE:dubai", Date.now() - 30_000_000);
    const booked = DESTINATIONS.filter(destination => destination.id !== "FR").map(destination => ({
      ...journey, id: destination.id, destinationId: destination.id, destCountryCode: destination.country.alpha2,
      destCountryName: destination.country.name, destCity: destination.city, destCityAr: destination.cityAr,
      destLat: destination.lat, destLng: destination.lng, status: "arrived" as const, arrivalSeenAt: 1,
    }));
    let onlyFranceRemaining = true;
    const repository = { ...local, list: async () => onlyFranceRemaining ? booked : [...booked, { ...journey, id: "FR", destinationId: "FR", status: "arrived" as const, arrivalSeenAt: 1 }] };
    const view = render(<TripApp studentId="student-1" repository={repository} language="en" />);
    fireEvent.click(await screen.findByText(DICTS.en.start, { selector: "button" }));
    fireEvent.click(screen.getByText(DICTS.en.randomCountry, { selector: "button" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish globe spin" }));
    expect(await screen.findByRole("heading", { name: "Paris" })).toBeInTheDocument();
    expect(planTrip("FR").ok).toBe(true);
    expect(screen.getByRole("button", { name: DICTS.en.getTicket })).toBeEnabled();
    view.unmount();
    onlyFranceRemaining = false;
    render(<TripApp studentId="student-1" repository={repository} language="en" />);
    fireEvent.click(await screen.findByText(DICTS.en.start, { selector: "button" }));
    expect(screen.getByText(DICTS.en.randomCountry, { selector: "button" })).toBeDisabled();
    expect(screen.getByText(DICTS.en.noRandomCountries)).toBeInTheDocument();
  });

  it("lets the student leave the spin and still choose a destination manually", async () => {
    const store = new Map<string, string>();
    const repository = createLocalRepository({ getItem: key => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); } });
    render(<TripApp studentId="student-1" repository={repository} language="en" />);
    fireEvent.click(await screen.findByRole("button", { name: DICTS.en.start }));
    fireEvent.click(screen.getByRole("button", { name: DICTS.en.randomCountry }));
    fireEvent.click(screen.getByRole("button", { name: DICTS.en.back }));
    expect(screen.queryByRole("button", { name: "Finish globe spin" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: DICTS.en.start }));
    fireEvent.change(screen.getByLabelText(DICTS.en.searchLabel), { target: { value: "Dubai" } });
    fireEvent.click(screen.getByRole("button", { name: /Dubai United Arab Emirates/ }));
    expect(await screen.findByRole("heading", { name: "Dubai" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: DICTS.en.getTicket })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Finish globe spin" })).not.toBeInTheDocument();
  });
});

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

  it("shows automatic visa points while keeping the visa in the passport", async () => {
    const values=new Map<string,string>();
    const local=createLocalRepository({getItem:key=>values.get(key)??null,setItem:(key,value)=>{values.set(key,value);}});
    const {journey}=await local.create("student-1","AE:dubai",Date.now()-30_000_000);
    const saved={...journey,status:"arrived" as const,arrivalSeenAt:1,canSell:false,visaAwardedAt:Date.now()};
    const sellVisa=vi.fn(async()=>{saved.visaSoldAt=Date.now();return{points:100};});
    const repository={...local,accountBacked:true,list:async()=>[{...saved}],sellVisa};
    const view=render(<TripApp studentId="student-1" repository={repository} language="en"/>);
    fireEvent.click(await screen.findByRole("button",{name:/VISA COLLECTION/}));
    expect(await screen.findByText("✓ 100 points credited for this visa — you keep it")).toBeInTheDocument();
    expect(sellVisa).not.toHaveBeenCalled();
    expect(screen.getByRole("article",{name:"STUDY VISA"})).toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"Sell visa for 100 points"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Back"}));
    fireEvent.click(screen.getByRole("button",{name:"Your world travel map"}));
    fireEvent.change(await screen.findByLabelText("Search cities"),{target:{value:"Dubai"}});
    expect(await screen.findByRole("button",{name:"Dubai — Visited"})).toBeInTheDocument();
    view.unmount();
  });
});
