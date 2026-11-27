import { useId, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { CharacterAvatar, type CharacterTraits, type Gender } from "./CharacterAvatar";
import type { AppLanguage } from "./LanguageGate";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  ACCESSORY_ADJUSTMENTS, getAccessoryAdjustment, getCharacterFitKey, mergeAccessoryFitEdits,
  type AccessoryAdjustment, type AccessoryFitEdits, type AvatarAccessory,
} from "@/lib/characterAccessoryFit";

const copy = {
  en: {
    title: "Adjust accessories", description: "Fine-tune how each accessory sits on this character.",
    item: "Accessory", preview: "Character preview", reset: "Reset fit", cancel: "Cancel",
    save: "Save fit", saving: "Saving…", error: "Could not save the fit. Please try again.",
    x: "Horizontal", y: "Vertical", scale: "Size", rotation: "Rotation",
    straw: "Straw hat", "red-cap": "Red cap", "kitty-ears": "Kitty ears",
    crown: "Crown", glasses: "Glasses", "gold-chain": "Gold chain",
  },
  ar: {
    title: "ضبط الإكسسوارات", description: "اضبط مكان وحجم كل إكسسوار على هاي الشخصية.",
    item: "الإكسسوار", preview: "معاينة الشخصية", reset: "استعادة الضبط", cancel: "إلغاء",
    save: "حفظ الضبط", saving: "جارٍ الحفظ…", error: "تعذّر حفظ الضبط. جرّب مرة ثانية.",
    x: "أفقي", y: "عمودي", scale: "الحجم", rotation: "الدوران",
    straw: "قبعة القش", "red-cap": "القبعة الحمراء", "kitty-ears": "آذان القطة",
    crown: "التاج", glasses: "النظارات", "gold-chain": "السلسلة الذهبية",
  },
} as const;

const controls = ["x", "y", "scale", "rotation"] as const;

export default function AccessoryFitEditor({ gender, traits, accessories, language, onSave }: {
  gender: Gender;
  traits: CharacterTraits;
  accessories: readonly [AvatarAccessory, ...AvatarAccessory[]];
  language: AppLanguage;
  onSave: (character: string, edits: AccessoryFitEdits) => Promise<void>;
}) {
  const t = copy[language];
  const id = useId();
  const character = getCharacterFitKey(gender, traits.variant);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(accessories[0]);
  const [edits, setEdits] = useState<AccessoryFitEdits>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const fits = mergeAccessoryFitEdits(traits.accessoryFits, character, edits);
  const adjustment = getAccessoryAdjustment(fits[character]?.[item]);

  const changeOpen = (next: boolean) => {
    if (saving) return;
    if (next) {
      setItem(accessories[0]);
      setEdits({});
      setError(false);
    }
    setOpen(next);
  };

  const change = (control: keyof AccessoryAdjustment, value: number) => {
    setEdits(previous => ({ ...previous, [item]: { ...adjustment, [control]: value } }));
  };

  const save = async () => {
    setSaving(true);
    setError(false);
    try {
      await onSave(character, edits);
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 gap-2 rounded-xl hover:border-primary/40 hover:bg-primary/5">
          <SlidersHorizontal aria-hidden="true" className="size-4 text-primary" />{t.title}
        </Button>
      </DialogTrigger>
      <DialogContent dir={language === "ar" ? "rtl" : "ltr"} className="max-h-[calc(100dvh-2rem)] max-w-xl gap-4 overflow-y-auto rounded-3xl">
        <DialogHeader className="pe-6 text-start sm:text-start">
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid min-h-44 place-items-center overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-primary/10 to-muted/40" role="group" aria-label={t.preview}>
            <CharacterAvatar gender={gender} traits={{ ...traits, accessoryFits: fits }} size={152} />
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <div className="flex min-h-9 items-center justify-between gap-2">
                {accessories.length > 1 ? <label htmlFor={`${id}-item`} className="text-sm font-semibold">{t.item}</label>
                  : <p className="text-sm font-semibold">{t[item]}</p>}
                <Button type="button" variant="ghost" size="sm" className="shrink-0 gap-1.5 text-muted-foreground" disabled={saving}
                  onClick={() => setEdits(previous => ({ ...previous, [item]: null }))}>
                  <RotateCcw aria-hidden className="size-4" />{t.reset}
                </Button>
              </div>
              {accessories.length > 1 && (
                <select id={`${id}-item`} value={item} disabled={saving} onChange={event => setItem(event.target.value as AvatarAccessory)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {accessories.map(accessory => <option key={accessory} value={accessory}>{t[accessory]}</option>)}
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-1">
              {controls.map(control => (
                <div key={control} className="min-w-0">
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <label htmlFor={`${id}-${control}`} className="font-semibold">{t[control]}</label>
                    <output htmlFor={`${id}-${control}`} aria-hidden="true" dir="ltr" className="tabular-nums text-muted-foreground">
                      {adjustment[control]}{control === "rotation" ? "°" : "%"}
                    </output>
                  </div>
                  <input id={`${id}-${control}`} type="range" dir="ltr" disabled={saving}
                    {...ACCESSORY_ADJUSTMENTS[control]} value={adjustment[control]}
                    onChange={event => change(control, event.currentTarget.valueAsNumber)}
                    className="h-8 w-full cursor-pointer accent-primary disabled:opacity-50" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{t.error}</p>}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button type="button" variant="outline" onClick={() => changeOpen(false)} disabled={saving}>{t.cancel}</Button>
          <Button type="button" onClick={() => void save()} disabled={saving || !Object.keys(edits).length}>{saving ? t.saving : t.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
