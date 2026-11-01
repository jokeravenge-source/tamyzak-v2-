import React from "react";
import { SceneViewport } from "./SceneViewport";
import type { StudioProps } from "../timeline/config";
export const DialogueScene: React.FC<StudioProps> = (props) => (
  <SceneViewport {...props} sceneId="dialogue" />
);
