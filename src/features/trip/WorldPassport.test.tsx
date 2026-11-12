import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorldPassport } from "./WorldPassport";
import { createLocalRepository } from "./journeys";

describe("account city passport", () => {
  it("keeps a sold visa's city visited and prevents booking it from the world map", async () => {
    const values = new Map<string,string>();
    const repo = createLocalRepository({getItem:key=>values.get(key)??null,setItem:(key,value)=>{values.set(key,value);}});
    const {journey}=await repo.create("me","AE:dubai",Date.now()-30_000_000);
    journey.visaSoldAt=Date.now();
    let booked:string|null=null;
    render(<WorldPassport journeys={[journey]} now={Date.now()} lang="en" onChoose={id=>{booked=id;}}/>);
    fireEvent.change(screen.getByLabelText("Search cities"),{target:{value:"Dubai"}});
    fireEvent.click(screen.getByRole("button",{name:"Dubai — Visited"}));
    const city=screen.getByRole("article");
    expect(within(city).getByRole("button",{name:"Visited"})).toBeDisabled();
    expect(booked).toBeNull();
    fireEvent.change(screen.getByLabelText("Search cities"),{target:{value:"Paris"}});
    fireEvent.click(screen.getByRole("button",{name:"Paris — Not visited"}));
    fireEvent.click(within(screen.getByRole("article")).getByRole("button",{name:"Fly to this city"}));
    expect(booked).toBe("FR");
    fireEvent.change(screen.getByLabelText("Search cities"),{target:{value:"Dubai"}});
    fireEvent.click(screen.getByRole("button",{name:"Not visited"}));
    expect(screen.queryByRole("button",{name:"Dubai — Visited"})).not.toBeInTheDocument();
  });
});
