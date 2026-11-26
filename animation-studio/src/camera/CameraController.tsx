import React, { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import { ease, mix, mixV3, type V3 } from "../animation/motion";

export type CameraShot = {
  from: number;
  to: number;
  position: V3;
  endPosition: V3;
  target: V3;
  endTarget?: V3;
  fov: number;
  endFov?: number;
};
export const cameraPose = (frame: number, shots: CameraShot[]) => {
  const shot = [...shots].reverse().find((s) => frame >= s.from) ?? shots[0];
  const t = ease(frame, shot.from, shot.to);
  return {
    position: mixV3(shot.position, shot.endPosition, t),
    target: mixV3(shot.target, shot.endTarget ?? shot.target, t),
    fov: mix(shot.fov, shot.endFov ?? shot.fov, t),
  };
};
export const CameraController: React.FC<{
  frame: number;
  shots: CameraShot[];
}> = ({ frame, shots }) => {
  const { camera } = useThree();
  const pose = cameraPose(frame, shots);
  const [px, py, pz] = pose.position;
  const [tx, ty, tz] = pose.target;
  const fov = pose.fov;
  useLayoutEffect(() => {
    camera.position.set(px, py, pz);
    camera.lookAt(tx, ty, tz);
    (camera as PerspectiveCamera).fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, px, py, pz, tx, ty, tz, fov]);
  return null;
};
