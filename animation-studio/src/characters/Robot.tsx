import React from "react";
import { Box, Orb, Rod } from "../components/Primitives";
import { blink, idle, type V3 } from "../animation/motion";
import { robotFaces, type Face } from "./expressions";

export type RobotProps = {
  frame: number;
  awake?: number;
  face?: Face;
  speech?: number;
  gesture?: number;
  headRotation?: V3;
  position?: V3;
  visibility?: number;
  scale?: number;
};

export const Robot: React.FC<RobotProps> = ({
  frame,
  awake = 1,
  face = robotFaces.happy,
  speech = 0,
  gesture = 0,
  headRotation = [0, -0.32, 0],
  position = [1.05, 1.75, 0],
  visibility = 1,
  scale = 1,
}) => {
  const motion = idle(frame, 2);
  const eye = Math.max(0.045, blink(frame, 63) * face.eye * awake);
  const smile: V3[] = Array.from({ length: 7 }, (_, i) => {
    const x = (i - 3) / 3;
    return [x * 0.11, face.smile * (x * x - 1), 0.208];
  });
  const cyan = awake > 0.1 ? "#79eeff" : "#344769";
  return (
    <group
      position={[
        position[0],
        position[1] + motion.float * awake + (1 - visibility) * -0.65,
        position[2],
      ]}
      scale={Math.max(0.001, visibility * scale)}
    >
      <mesh position={[0, -0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.018, 8, 32]} />
        <meshStandardMaterial
          color="#75ddf3"
          emissive="#58c9ed"
          emissiveIntensity={awake * 2}
        />
      </mesh>
      <Box
        size={[0.38, 0.42, 0.3]}
        color="#b9bccf"
        radius={0.12}
        roughness={0.3}
        metalness={0.28}
      />
      <Box
        size={[0.17, 0.04, 0.015]}
        color="#79eeff"
        emissive={cyan}
        radius={0.015}
        position={[0, 0.015, 0.157]}
      />
      <Rod from={[0, 0.13, 0]} to={[0, 0.4, 0]} radius={0.05} color="#4b5175" />
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.24, 0.09, 0]}
          rotation={[0, 0, side * (0.2 + gesture * 0.7)]}
        >
          <Orb color="#878dab" scale={0.08} />
          <Rod
            from={[0, 0, 0]}
            to={[side * 0.12, -0.19, 0.09]}
            radius={0.04}
            color="#878dab"
          />
          <Box
            size={[0.12, 0.15, 0.09]}
            color="#c8cadd"
            radius={0.045}
            position={[side * 0.13, -0.23, 0.09]}
          />
        </group>
      ))}
      <group
        position={[0, 0.48, 0]}
        rotation={[
          headRotation[0],
          headRotation[1],
          headRotation[2] + face.tilt,
        ]}
      >
        <Box
          size={[0.7, 0.55, 0.43]}
          color="#d2d2e4"
          radius={0.15}
          metalness={0.22}
          roughness={0.28}
        />
        <Box
          size={[0.6, 0.43, 0.04]}
          color="#111a35"
          radius={0.105}
          roughness={0.24}
          position={[0, 0, 0.212]}
        />
        <Box
          size={[0.025, 0.18, 0.16]}
          color="#8f8ab6"
          radius={0.012}
          position={[-0.35, 0, -0.02]}
        />
        <Box
          size={[0.025, 0.18, 0.16]}
          color="#8f8ab6"
          radius={0.012}
          position={[0.35, 0, -0.02]}
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Box
              size={[0.09, 0.12 * eye, 0.018]}
              color={cyan}
              emissive={cyan}
              radius={0.035}
              position={[side * 0.145, 0.03, 0.242]}
            />
            <Box
              size={[0.12, 0.019, 0.014]}
              color={cyan}
              emissive={cyan}
              radius={0.007}
              position={[side * 0.15, 0.135, 0.242]}
              rotation={[0, 0, side * face.brow]}
            />
            <Box
              size={[0.045, 0.014, 0.012]}
              color="#656bd4"
              emissive="#656bd4"
              radius={0.006}
              position={[side * 0.24, -0.07, 0.244]}
            />
          </group>
        ))}
        <group position={[0, -0.08, 0.038]}>
          {speech > 0.05 || face.jaw > 0.09 ? (
            <Box
              size={[
                0.13,
                0.018 + Math.max(speech * 0.07, face.jaw * 0.3),
                0.012,
              ]}
              color={cyan}
              emissive={cyan}
              radius={0.015}
              position={[0, -0.025, 0.208]}
            />
          ) : (
            smile
              .slice(0, -1)
              .map((p, i) => (
                <Rod
                  key={i}
                  from={p}
                  to={smile[i + 1]}
                  color={cyan}
                  emissive={cyan}
                  radius={0.008}
                />
              ))
          )}
        </group>
        <Rod
          from={[0.16, 0.23, -0.07]}
          to={[0.21, 0.42, -0.07]}
          radius={0.017}
          color="#72759d"
        />
        <mesh position={[0.21, 0.43, -0.07]}>
          <sphereGeometry args={[0.038, 12, 8]} />
          <meshStandardMaterial
            color={cyan}
            emissive={cyan}
            emissiveIntensity={awake * 2}
          />
        </mesh>
      </group>
    </group>
  );
};
