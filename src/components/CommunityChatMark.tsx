import { MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export const chatBannerClass = "border border-teal-700/70 bg-[#103844] bg-[radial-gradient(ellipse_at_72%_0%,#1d7269_0%,transparent_72%),linear-gradient(145deg,#134951,#102d3c)] text-white shadow-sm";

export default function CommunityChatMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-14 shrink-0 place-items-center rounded-[1.15rem] border border-teal-100/40 bg-gradient-to-br from-teal-200/30 to-teal-300/5 text-teal-50 shadow-[inset_0_1px_0_#ccfbf140,0_8px_20px_#062d3660]",
        className,
      )}
    >
      <MessagesSquare className="size-[56%]" strokeWidth={1.85} />
    </span>
  );
}
