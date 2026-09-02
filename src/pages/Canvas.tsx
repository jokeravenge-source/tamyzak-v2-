import type { AppLanguage } from "@/components/LanguageGate";
import { Whiteboard } from "@/components/whiteboard/Whiteboard";
import { useFeatureUsed } from "@/hooks/useFeatureUsed";

const Canvas = ({
  onBack,
}: {
  language: AppLanguage;
  onBack: () => void;
  onOpenNotes?: () => void;
}) => {
  useFeatureUsed("canvas");
  return <Whiteboard onBack={onBack} />;
};

export default Canvas;
