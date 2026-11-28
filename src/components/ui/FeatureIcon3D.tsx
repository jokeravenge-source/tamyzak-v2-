import type { LucideIcon } from "lucide-react";
import "../home/homeCards.css";

/** Canonical Apple-inspired Tamayzak feature artwork. Inherits the card's tone.
 * Decorative only: the surrounding control must provide its accessible name.
 */
export default function FeatureIcon3D({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span aria-hidden="true" className="home-card-art home-plan-art mx-auto grid aspect-square w-full max-w-[5.25rem] place-items-center rounded-[1.3rem] motion-safe:transition-transform motion-safe:group-hover:scale-105">
      <Icon className="h-auto w-3/5" />
    </span>
  );
}
