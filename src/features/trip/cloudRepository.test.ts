import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCloudRepository } from "./cloudRepository";
const backend=vi.hoisted(()=>({rpc:vi.fn()}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{rpc:backend.rpc}}));
beforeEach(()=>backend.rpc.mockReset());

describe("account flight repository",()=>{
  it("uses authenticated server state and accounts for clock differences",async()=>{
    backend.rpc.mockResolvedValue({data:{userId:"me",serverNow:Date.now()-10000,journeys:[{id:"flight"}]},error:null});
    const list=await createCloudRepository().list("me");
    expect(list[0].clockOffsetMs).toBeLessThanOrEqual(-10000);
    expect(backend.rpc).toHaveBeenCalledWith("study_flights_action",{_action:"state"});
    await expect(createCloudRepository().list("another-user")).rejects.toThrow("authentication_required");
  });
  it("never mints local tickets or points when the backend is missing or offline",async()=>{
    backend.rpc.mockResolvedValue({data:null,error:{code:"PGRST202",message:"missing function"}});
    await expect(createCloudRepository().create("me","FR")).rejects.toThrow("flight_setup_required");
    backend.rpc.mockResolvedValue({data:null,error:{message:"Network offline"}});
    await expect(createCloudRepository().sellVisa!("me","flight")).rejects.toThrow("Network offline");
  });
  it("asks the server to sell a specific visa, without supplying a points amount or another account id",async()=>{
    backend.rpc.mockResolvedValue({data:{points:100},error:null});
    expect(await createCloudRepository().sellVisa!("me","flight")).toEqual({points:100});
    expect(backend.rpc).toHaveBeenCalledWith("study_flights_action",{_action:"sell",_flight_id:"flight"});
  });
});
