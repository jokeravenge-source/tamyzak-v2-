import type { CharacterTraits } from "@/components/CharacterAvatar";
import { getPetDefinition, getSelectedPets } from "@/lib/pets";

export default function ProfilePets({
  traits,
  language,
}: {
  traits?: Partial<CharacterTraits> | null;
  language: "en" | "ar";
}) {
  const selected = getSelectedPets(traits);
  if (traits?.showPets === false || selected.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-3">
      <p className="mb-2 text-xs font-bold text-muted-foreground">
        {language === "ar" ? "الحيوانات الأليفة" : "Pets"}
      </p>
      <div className="flex items-end justify-center gap-3">
        {selected.map((key) => {
          const pet = getPetDefinition(key);
          if (!pet) return null;
          return (
            <div key={key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex h-20 w-full items-center justify-center rounded-xl bg-background/60 p-1">
                <img src={pet.image} alt={pet.name[language]} className="h-full w-full object-contain [image-rendering:pixelated]" draggable={false} />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{pet.name[language]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
