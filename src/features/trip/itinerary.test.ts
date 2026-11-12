import { afterEach, describe, expect, it, vi } from "vitest";
import { getDestination } from "./destinations";
import { createLocalRepository, journeyState, planTrip } from "./journeys";
import { currentFlightStage, flightItinerary, journeyDestinationKey } from "./itinerary";

afterEach(() => vi.restoreAllMocks());
describe("flight phases and city ledger", () => {
  it("gives short routes boarding, takeoff, cruise and landing without an invented stop", () => {
    const route = flightItinerary(getDestination("AE:dubai")!);
    expect(route.itinerary.map((stage) => stage.kind)).toEqual(["boarding", "takeoff", "cruise", "landing"]);
    expect(route.stopover).toBeUndefined();
    expect(currentFlightStage(route.itinerary, 0)?.kind).toBe("boarding");
    expect(currentFlightStage(route.itinerary, 120)?.kind).toBe("takeoff");
    expect(currentFlightStage(route.itinerary, route.durationSec)).toBeNull();
  });
  it("includes a lounge stop on a long route and holds the map position during the stop", async () => {
    const route = planTrip("JP");
    if (!route.ok) throw Error("Expected Tokyo route");
    expect(route.stopover?.city).toBeTruthy();
    const restIndex = route.itinerary.findIndex((stage) => stage.kind === "rest");
    const restStart = route.itinerary.slice(0,restIndex).reduce((sum,stage) => sum + stage.durationSec, 0);
    const store = new Map<string,string>();
    const repo = createLocalRepository({ getItem: k => store.get(k)??null, setItem:(k,v)=>{store.set(k,v);} });
    const { journey } = await repo.create("student","JP",Date.now());
    const first = journeyState(journey, journey.startedAt+(restStart+1)*1000);
    const later = journeyState(journey, journey.startedAt+(restStart+500)*1000);
    expect(first.stage?.kind).toBe("rest");
    expect(first.routeProgress).toBe(later.routeProgress);
    expect(later.remainingSec).toBeLessThan(first.remainingSec);
  });
  it("does not allow a completed city to be rebooked, even after reload or a visa sale marker", async () => {
    let clock=Date.now(); vi.spyOn(Date,"now").mockImplementation(()=>clock);
    const store=new Map<string,string>();
    const storage={getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>{store.set(k,v);}};
    const repo=createLocalRepository(storage); const {journey}=await repo.create("student","AE:dubai",clock);
    clock=journey.arrivalAt+1;
    const rows=await repo.list("student");
    rows[0].visaSoldAt=clock;
    storage.setItem("tamayzak.trip.journeys.v1",JSON.stringify(rows));
    await expect(createLocalRepository(storage).create("student","AE:dubai",clock)).rejects.toThrow("city_already_visited");
    expect((await repo.create("another-account","AE:dubai",clock)).created).toBe(true);
    expect(journeyDestinationKey({destCountryCode:"AE",destCity:"Dubai"})).toBe("AE:dubai");
  });
});
