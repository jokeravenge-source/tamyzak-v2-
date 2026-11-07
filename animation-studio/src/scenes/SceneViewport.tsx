import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { ACESFilmicToneMapping, VSMShadowMap } from "three";
import { Student } from "../characters/Student";
import { Robot } from "../characters/Robot";
import {
  expressionAt,
  robotFaces,
  studentFaces,
} from "../characters/expressions";
import { StudyRoom } from "../environment/StudyRoom";
import { CinematicLighting } from "../lighting/CinematicLighting";
import { CameraController } from "../camera/CameraController";
import { LearningDemonstration } from "../components/LearningDemonstration";
import { EditorialOverlay } from "../components/EditorialOverlay";
import { BrandReveal } from "./BrandReveal";
import {
  armGesture,
  ease,
  entrance,
  headTurn,
  mouthMovement,
  pulse,
} from "../animation/motion";
import { defaultReel, type StudioProps } from "../timeline/config";
import { durationOf, sceneAt } from "../timeline/schema";

export const SceneViewport: React.FC<StudioProps & { sceneId?: string }> = ({
  reel = defaultReel,
  captions = true,
  soundtrack = true,
  sceneId,
}) => {
  const currentFrame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const selected = sceneId
    ? reel.scenes.find((s) => s.id === sceneId)
    : undefined;
  const state = selected
    ? { scene: selected, frame: currentFrame, start: 0, index: 0 }
    : sceneAt(reel, currentFrame);
  const { scene, frame } = state;
  const kind = scene.kind;
  const isBrand = kind === "brand";
  const canonical = {
    opening: 150,
    wake: 150,
    dialogue: 180,
    learning: 210,
    confidence: 120,
    brand: 90,
  }[kind];
  const actionFrame = (frame * canonical) / scene.duration;
  const globalFrame = selected
    ? reel.scenes
        .slice(0, reel.scenes.indexOf(selected))
        .reduce((sum, s) => sum + s.duration, 0) + frame
    : currentFrame;
  const studentFace = expressionAt(
    frame,
    scene.studentExpressions,
    studentFaces,
  );
  const robotFace = expressionAt(frame, scene.robotExpressions, robotFaces);
  const robotAwake =
    kind === "opening" ? 0 : kind === "wake" ? ease(actionFrame, 12, 45) : 1;
  const headRotation =
    kind === "opening"
      ? ([
          0.12 + pulse(actionFrame, 35, 105, 20) * 0.04,
          0.05 +
            Math.sin(actionFrame / 9) * pulse(actionFrame, 45, 88, 10) * 0.06,
          0,
        ] as [number, number, number])
      : kind === "wake"
        ? headTurn(actionFrame, 38, 98, [0.12, 0.05, 0], [-0.03, 0.52, 0])
        : kind === "confidence"
          ? ([-0.05 + Math.sin(actionFrame / 12) * 0.035, 0.28, -0.025] as [
              number,
              number,
              number,
            ])
          : ([-0.02, kind === "learning" ? 0.2 : 0.4, 0] as [
              number,
              number,
              number,
            ]);
  const studentGesture =
    kind === "opening"
      ? armGesture(actionFrame, 35, 115, 0.15)
      : kind === "confidence"
        ? armGesture(actionFrame, 10, 110, 0.65)
        : kind === "dialogue"
          ? armGesture(actionFrame, 14, 73, 0.25)
          : 0;
  const slouch =
    kind === "opening"
      ? 0.95
      : kind === "wake"
        ? 1 - ease(actionFrame, 40, 105) * 0.72
        : 0.12;
  const soundtrackOffset = selected ? globalFrame - currentFrame : 0;
  return (
    <AbsoluteFill style={{ background: "#14152e" }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        shadows={{ type: VSMShadowMap }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.04,
        }}
        camera={{ position: [4.1, 3.4, 7.5], fov: 37, near: 0.1, far: 35 }}
      >
        <CameraController frame={frame} shots={scene.shots} />
        <CinematicLighting energy={robotAwake} />
        {isBrand ? (
          <BrandReveal frame={actionFrame} />
        ) : (
          <>
            <StudyRoom />
            <Student
              frame={globalFrame}
              face={studentFace}
              speech={mouthMovement(frame, scene.dialogue, "student")}
              headRotation={headRotation}
              gesture={studentGesture}
              slouch={slouch}
            />
            <Robot
              frame={globalFrame}
              awake={robotAwake}
              face={robotFace}
              speech={mouthMovement(frame, scene.dialogue, "robot")}
              visibility={
                kind === "wake"
                  ? entrance(actionFrame, 0, 26)
                  : kind === "opening"
                    ? 0.6
                    : 1
              }
              position={kind === "opening" ? [1.05, 1.57, 0] : [1.05, 1.8, 0]}
              gesture={
                kind === "wake"
                  ? armGesture(actionFrame, 52, 139, 0.8)
                  : kind === "learning"
                    ? 0.6
                    : kind === "confidence"
                      ? 0.8
                      : 0.2
              }
              headRotation={
                kind === "wake"
                  ? headTurn(
                      actionFrame,
                      36,
                      85,
                      [0.1, 0, 0],
                      [-0.04, -0.54, 0],
                    )
                  : [0, -0.43, 0]
              }
            />
            {kind === "learning" && (
              <LearningDemonstration frame={actionFrame} data={reel.learning} />
            )}
          </>
        )}
      </ThreeCanvas>
      <EditorialOverlay
        scene={scene}
        reel={reel}
        frame={frame}
        captions={captions}
      />
      {soundtrack && reel.soundtrack && (
        <Audio
          name="Original ambient score"
          src={staticFile(reel.soundtrack)}
          trimBefore={soundtrackOffset}
          durationInFrames={selected?.duration ?? durationOf(reel)}
          premountFor={fps}
          volume={0.65}
        />
      )}
      {sceneId
        ? selected?.dialogue
            .filter((c) => c.audio)
            .map((cue, i) => (
              <Audio
                key={i}
                name={`${cue.speaker}: ${cue.text}`}
                src={staticFile(cue.audio!)}
                from={cue.from}
                durationInFrames={cue.to - cue.from}
                premountFor={fps}
              />
            ))
        : reel.scenes.flatMap((s, i) => {
            const start = reel.scenes
              .slice(0, i)
              .reduce((sum, item) => sum + item.duration, 0);
            return s.dialogue
              .filter((c) => c.audio)
              .map((cue, j) => (
                <Audio
                  key={`${s.id}-${j}`}
                  name={`${cue.speaker}: ${cue.text}`}
                  src={staticFile(cue.audio!)}
                  from={start + cue.from}
                  durationInFrames={cue.to - cue.from}
                  premountFor={fps}
                />
              ));
          })}
      {!sceneId &&
        reel.scenes.map((s, i) => (
          <Sequence
            key={s.id}
            name={`${i + 1}. ${s.kind}`}
            from={reel.scenes
              .slice(0, i)
              .reduce((sum, item) => sum + item.duration, 0)}
            durationInFrames={s.duration}
            premountFor={fps}
          >
            <></>
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
