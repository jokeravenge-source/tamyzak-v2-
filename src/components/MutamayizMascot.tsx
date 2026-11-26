import idleImage from "@/assets/mutamayiz/idle.webp";
import speakingImage from "@/assets/mutamayiz/speaking.webp";
import { cn } from "@/lib/utils";

export default function MutamayizMascot({
  alt = "",
  className,
  speaking = false,
}: {
  alt?: string;
  className?: string;
  speaking?: boolean;
}) {
  return (
    <picture className={cn("block shrink-0", className)}>
      {speaking && (
        <source media="(prefers-reduced-motion: no-preference)" type="image/webp" srcSet={speakingImage} />
      )}
      <img src={idleImage} alt={alt} width={192} height={192} className="block size-full object-contain" draggable={false} />
    </picture>
  );
}
