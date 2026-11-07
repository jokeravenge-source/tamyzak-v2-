import React from "react";
import { Composition, Folder } from "remotion";
import { SceneViewport } from "./scenes/SceneViewport";
import { OpeningScene } from "./scenes/OpeningScene";
import { RobotWakeScene } from "./scenes/RobotWakeScene";
import { DialogueScene } from "./scenes/DialogueScene";
import { LearningScene } from "./scenes/LearningScene";
import { ConfidenceScene } from "./scenes/ConfidenceScene";
import { LogoScene } from "./scenes/LogoScene";
import {
  loadMetadata,
  studioSchema,
  type StudioProps,
} from "./timeline/config";

const CinematicReel: React.FC<StudioProps> = (props) => (
  <SceneViewport {...props} />
);
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Tamayzak-Reel"
      component={CinematicReel}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      schema={studioSchema}
      calculateMetadata={loadMetadata()}
      defaultProps={{
        configFile: "reels/tamayzak.json",
        captions: true,
        soundtrack: true,
      }}
    />
    <Folder name="Scenes">
      <Composition
        id="Opening-5s"
        component={OpeningScene}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={studioSchema}
        calculateMetadata={loadMetadata("opening")}
        defaultProps={{
          configFile: "reels/tamayzak.json",
          captions: true,
          soundtrack: true,
        }}
      />
      <Composition
        id="Robot-Wakes"
        component={RobotWakeScene}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={studioSchema}
        calculateMetadata={loadMetadata("wake")}
        defaultProps={{
          configFile: "reels/tamayzak.json",
          captions: true,
          soundtrack: true,
        }}
      />
      <Composition
        id="Dialogue"
        component={DialogueScene}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        schema={studioSchema}
        calculateMetadata={loadMetadata("dialogue")}
        defaultProps={{
          configFile: "reels/tamayzak.json",
          captions: true,
          soundtrack: true,
        }}
      />
      <Composition
        id="Learning-Demo"
        component={LearningScene}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
        schema={studioSchema}
        calculateMetadata={loadMetadata("learning")}
        defaultProps={{
          configFile: "reels/tamayzak.json",
          captions: true,
          soundtrack: true,
        }}
      />
      <Composition
        id="Confidence"
        component={ConfidenceScene}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        schema={studioSchema}
        calculateMetadata={loadMetadata("confidence")}
        defaultProps={{
          configFile: "reels/tamayzak.json",
          captions: true,
          soundtrack: true,
        }}
      />
      <Composition
        id="Tamayzak-Logo"
        component={LogoScene}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        schema={studioSchema}
        calculateMetadata={loadMetadata("brand")}
        defaultProps={{
          configFile: "reels/tamayzak.json",
          captions: true,
          soundtrack: true,
        }}
      />
    </Folder>
  </>
);
