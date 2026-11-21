import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { closeChannelBattle, getBattleChannelConfig, getChannelBattle, joinChannelBattle, publishChannelBattle, syncChannelBattle, type BattleChannelConfig, type ChannelBattle, type ChannelBattleSettings } from "@/lib/battleChannel";

export function useBattleChannel(onConnect: (room: ChannelBattle) => void, onUnavailable: () => void) {
  const [config, setConfig] = useState<BattleChannelConfig>({ enabled: false, invite_url: "" });
  const [room, setRoom] = useState<ChannelBattle | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [remaining, setRemaining] = useState(180);
  const current = useRef<ChannelBattle | null>(null);
  const callbacks = useRef({ onConnect, onUnavailable }); callbacks.current = { onConnect, onUnavailable };
  const generation = useRef(0);
  const request = useRef<{ id: string; host: boolean } | null>(null);
  const connected = useRef(false);
  const starting = useRef(false);
  const busy = useRef(false);
  const offset = useRef(0);
  const invalidate = useCallback(() => { generation.current++; busy.current = false; }, []);
  const cancel = useCallback(() => {
    generation.current++; busy.current = false; connected.current = false; starting.current = false;
    const old = request.current; request.current = null; current.current = null;
    setRoom(null); setPending(false); setError(null);
    if (old?.host) void closeChannelBattle(old.id).catch(() => {});
  }, []);
  useEffect(() => {
    let active = true;
    void getBattleChannelConfig().then((value) => { if (active) setConfig(value); }).catch(() => {});
    return () => {
      active = false; invalidate();
      const old = request.current; request.current = null;
      if (old?.host) void closeChannelBattle(old.id).catch(() => {});
    };
  }, [invalidate]);
  const accept = useCallback((value: ChannelBattle) => {
    current.current = value; offset.current = Date.parse(value.server_now) - Date.now(); setRoom(value);
    if (["expired", "cancelled"].includes(value.status)) {
      request.current = null; current.current = null; setRoom(null);
      setError(new Error("ROOM_EXPIRED")); callbacks.current.onUnavailable();
      void syncChannelBattle(value.id).catch(() => {});
    } else if (value.status === "claimed" && !connected.current) {
      connected.current = true; callbacks.current.onConnect(value);
    }
  }, []);
  const perform = useCallback(async (id: string, host: boolean, action: () => Promise<ChannelBattle>) => {
    if (busy.current) return;
    busy.current = true; const token = ++generation.current;
    request.current = { id, host }; connected.current = false; starting.current = false; setPending(true); setError(null);
    try {
      const result = await action();
      if (token !== generation.current) { if (host) void closeChannelBattle(id).catch(() => {}); return; }
      request.current = { id, host: result.is_host }; accept(result);
    } catch (cause) {
      if (token === generation.current) { request.current = null; setError(cause); }
      if (host) void closeChannelBattle(id).catch(() => {});
    } finally { if (token === generation.current) { busy.current = false; setPending(false); } }
  }, [accept]);
  const publish = useCallback((settings: ChannelBattleSettings) => {
    const id = crypto.randomUUID();
    return perform(id, true, () => publishChannelBattle(id, settings));
  }, [perform]);
  const join = useCallback((id: string) => perform(id, false, () => joinChannelBattle(id)), [perform]);
  const roomId = room?.id; const roomStatus = room?.status; const roomHost = room?.is_host; const roomExpiry = room?.expires_at;
  useEffect(() => {
    if (!roomId || !roomStatus || !roomExpiry || !["waiting", "claimed"].includes(roomStatus)) return;
    let active = true; let reading = false; let lastHeartbeat = 0;
    const token = generation.current;
    const read = async (heartbeat = false) => {
      if (!active || reading || token !== generation.current) return;
      reading = true;
      try { const touch = roomHost && (heartbeat || Date.now() - lastHeartbeat >= 10000); const next = await getChannelBattle(roomId, touch); if (touch) lastHeartbeat = Date.now(); if (active && token === generation.current) { setError(null); accept(next); } }
      catch (cause) { if (active && token === generation.current) setError(cause); }
      finally { reading = false; }
    };
    void read(roomHost);
    const poll = setInterval(() => void read(false), 5000);
    const clock = setInterval(() => setRemaining(Math.max(0, Math.ceil((Date.parse(roomExpiry) - Date.now() - offset.current) / 1000))), 1000);
    const visibility = () => { if (document.visibilityState === "visible") void read(roomHost); };
    document.addEventListener("visibilitychange", visibility);
    const channel = supabase.channel(`channel-battle:${roomId}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "channel_battles", filter: `id=eq.${roomId}` }, () => void read(false)).subscribe();
    return () => { active = false; clearInterval(poll); clearInterval(clock); document.removeEventListener("visibilitychange", visibility); void supabase.removeChannel(channel); };
  }, [roomId, roomStatus, roomHost, roomExpiry, accept]);
  const markStarted = useCallback(() => {
    const value = current.current;
    if (!value?.is_host || value.status !== "claimed" || starting.current) return;
    starting.current = true;
    const token = generation.current;
    void closeChannelBattle(value.id, true).then((next) => { if (token === generation.current) accept(next); }).catch(() => { starting.current = false; });
  }, [accept]);
  return { config, room, pending, error, remaining, publish, join, cancel, markStarted };
}
