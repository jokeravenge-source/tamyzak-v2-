import idleImage from "@/assets/mutamayiz/idle.webp";
import speakingImage from "@/assets/mutamayiz/speaking.webp";
import { cn } from "@/lib/utils";
import "./MutamayizMascot.css";

export type MutamayizMascotState = "idle" | "thinking" | "listening" | "speaking";

export default function MutamayizMascot({
  alt = "",
  className,
  speaking = false,
  state,
}: {
  alt?: string;
  className?: string;
  /** Backward-compatible with existing whiteboard narration. */
  speaking?: boolean;
  state?: MutamayizMascotState;
}) {
  const activity = state ?? (speaking ? "speaking" : "idle");
  return (
    <picture data-mascot-state={activity} className={cn("mutamayiz-mascot relative block shrink-0", className)}>
      {activity === "speaking" && (
        <source media="(prefers-reduced-motion: no-preference)" type="image/webp" srcSet={speakingImage} />
      )}
      <img src={idleImage} alt={alt} width={192} height={192} className="block size-full object-contain" draggable={false} />
    </picture>
  );
}
