import type { AppLanguage } from "@/components/LanguageGate";
import { Whiteboard } from "@/components/whiteboard/Whiteboard";
import { Notebook } from "@/components/notebook/Notebook";
import { useState } from "react";
import { useFeatureUsed } from "@/hooks/useFeatureUsed";

const Canvas = ({
  onBack,
}: {
  language: AppLanguage;
  onBack: () => void;
  onOpenNotes?: () => void;
}) => {
  useFeatureUsed("canvas");
  const [legacy, setLegacy] = useState(false);
  return legacy ? (
    <Whiteboard onBack={() => setLegacy(false)} />
  ) : (
    <Notebook onBack={onBack} onOpenLegacy={() => setLegacy(true)} />
  );
};

export default Canvas;
