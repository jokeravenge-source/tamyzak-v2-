import { useEffect, useState } from "react";
import { TRIP_ORIGIN } from "./config";
import { Globe } from "./Globe";
import type { LatLng } from "./geo";

const SPIN_MS = 3200;
const START_CENTER: LatLng = { lat: 22, lng: TRIP_ORIGIN.lng };

/** Rotate the globe itself, easing to a stop with the chosen city at its center. */
export function RandomDestinationGlobe({ destination, label, onComplete }: {
  destination: LatLng;
  label: string;
  onComplete: () => void;
}) {
  const [center, setCenter] = useState(START_CENTER);
  const [settled, setSettled] = useState(false);
  const { lat, lng } = destination;

  useEffect(() => {
    let frame: number;
    let cancelled = false;
    setSettled(false);
    setCenter(START_CENTER);

    const finish = () => {
      if (cancelled) return;
      setCenter({ lat, lng });
      setSettled(true);
      onComplete();
    };

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return () => { cancelled = true; };
    }

    // Three full turns, then the remaining angle to the chosen destination.
    const turns = 1080 + ((lng - START_CENTER.lng) % 360 + 360) % 360;
    let started: number | null = null;
    const animate = (time: number) => {
      if (cancelled) return;
      started ??= time;
      const progress = Math.min(1, Math.max(0, (time - started) / SPIN_MS));
      if (progress === 1) { finish(); return; }
      const eased = 1 - (1 - progress) ** 3;
      const longitude = START_CENTER.lng + turns * eased;
      setCenter({
        lat: START_CENTER.lat + (lat - START_CENTER.lat) * eased,
        lng: ((longitude + 180) % 360 + 360) % 360 - 180,
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [lat, lng, onComplete]);

  return <Globe destination={destination} viewCenter={center} mode={settled ? "selected" : "selecting"} label={label} />;
}
