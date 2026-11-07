import React from "react";
import { Box, Orb, Rod } from "../components/Primitives";
import { blink, idle, type V3 } from "../animation/motion";
import { studentFaces, type Face } from "./expressions";

export type StudentProps = {
  frame: number;
  face?: Face;
  speech?: number;
  headRotation?: V3;
  gesture?: number;
  slouch?: number;
  position?: V3;
  scale?: number;
};
const SKIN = "#d98d61";
const HAIR = "#20192b";

const Mouth = ({ smile, open }: { smile: number; open: number }) => {
  const points: V3[] = Array.from({ length: 9 }, (_, i) => {
    const x = (i - 4) / 4;
    return [x * 0.12, smile * (x * x - 1), 0.449 - x * x * 0.016];
  });
  return (
    <group position={[0, -0.19, 0]}>
      {open > 0.045 ? (
        <>
          <Orb
            color="#542b38"
            position={[0, -open * 0.04, 0.45]}
            scale={[0.115, 0.025 + open * 0.09, 0.018]}
          />
          <Box
            size={[0.15, 0.023, 0.015]}
            color="#fff1db"
            radius={0.007}
            position={[0, 0.015, 0.466]}
          />
        </>
      ) : (
        points
          .slice(0, -1)
          .map((point, i) => (
            <Rod
              key={i}
              from={point}
              to={points[i + 1]}
              color="#70403f"
              radius={0.012}
            />
          ))
      )}
    </group>
  );
};

const Arm = ({
  side,
  gesture,
  slouch,
}: {
  side: number;
  gesture: number;
  slouch: number;
}) => {
  const shoulder: V3 = [side * 0.4, 1.88 - slouch * 0.08, -0.08];
  const elbow: V3 = [
    side * (0.6 + gesture * 0.07),
    1.42 + gesture * 0.22,
    0.15,
  ];
  const hand: V3 =
    side < 0
      ? [
          -0.54 + gesture * 0.13,
          1.45 + gesture * 0.65 + slouch * 0.47,
          0.5 - slouch * 0.33,
        ]
      : [0.35 + gesture * 0.2, 1.43 + gesture * 0.22, 0.58];
  return (
    <group>
      <Rod from={shoulder} to={elbow} radius={0.145} color="#555a99" />
      <Orb color="#555a99" position={elbow} scale={0.145} />
      <Rod from={elbow} to={hand} radius={0.09} color={SKIN} />
      <group position={hand} rotation={[gesture * -0.4, 0, side * 0.2]}>
        <Orb color={SKIN} scale={[0.12, 0.075, 0.16]} />
        {[0, 1, 2].map((i) => (
          <Orb
            key={i}
            color={SKIN}
            position={[(i - 1) * 0.047, 0, 0.1]}
            scale={[0.028, 0.043, 0.09]}
          />
        ))}
        <Orb
          color={SKIN}
          position={[-side * 0.105, 0.01, 0.02]}
          scale={[0.045, 0.05, 0.085]}
        />
      </group>
    </group>
  );
};

export const Student: React.FC<StudentProps> = ({
  frame,
  face = studentFaces.frustrated,
  speech = 0,
  headRotation = [0.12, 0.05, 0],
  gesture = 0,
  slouch = 1,
  position = [-0.62, 0, -0.58],
  scale = 1,
}) => {
  const motion = idle(frame);
  const eyelid = blink(frame, 17) * face.eye;
  return (
    <group position={position} scale={scale}>
      <Box
        size={[0.87, 0.22, 0.74]}
        color="#25263d"
        position={[0, 0.94, -0.08]}
        radius={0.1}
      />
      <Box
        size={[0.85, 1.03, 0.18]}
        color="#27283f"
        position={[0, 1.42, -0.44]}
        rotation={[-0.08, 0, 0]}
        radius={0.08}
      />
      <Rod
        from={[0, 0.87, -0.08]}
        to={[0, 0.25, -0.08]}
        radius={0.07}
        color="#121627"
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Rod
            from={[side * 0.21, 0.98, 0.03]}
            to={[side * 0.27, 0.58, 0.38]}
            radius={0.16}
            color="#242d4b"
          />
          <Rod
            from={[side * 0.27, 0.58, 0.38]}
            to={[side * 0.29, 0.18, 0.37]}
            radius={0.12}
            color="#242d4b"
          />
          <Box
            size={[0.28, 0.16, 0.48]}
            color="#e6dddc"
            position={[side * 0.29, 0.13, 0.47]}
          />
        </group>
      ))}
      <group
        position={[0, motion.breathe, slouch * 0.05]}
        rotation={[slouch * 0.08, 0, motion.sway]}
      >
        <Orb
          color="#555a99"
          position={[0, 1.64, -0.02]}
          scale={[0.47, 0.59, 0.29]}
        />
        <Box
          size={[0.22, 0.05, 0.02]}
          color="#8d94db"
          radius={0.015}
          position={[0.19, 1.78, 0.264]}
        />
        <Orb color={SKIN} position={[0, 2.07, 0]} scale={[0.15, 0.22, 0.14]} />
        <group
          position={[0, 2.61 - slouch * 0.09, 0.03 + slouch * 0.12]}
          rotation={[
            headRotation[0],
            headRotation[1],
            headRotation[2] + face.tilt + motion.sway * 0.5,
          ]}
        >
          <Orb color={SKIN} flat scale={[0.45, 0.52, 0.41]} />
          {[-1, 1].map((side) => (
            <group key={side}>
              <Orb
                color={SKIN}
                position={[side * 0.44, -0.02, 0]}
                scale={[0.083, 0.13, 0.08]}
              />
              <Orb
                color="#bd6e55"
                position={[side * 0.468, -0.015, 0.04]}
                scale={[0.037, 0.075, 0.025]}
              />
              <group
                position={[side * 0.175, 0.025, 0.363]}
                scale={[1, Math.max(0.04, eyelid), 1]}
              >
                <Orb color="#fff5e8" scale={[0.118, 0.13, 0.059]} />
                <Orb
                  color="#4d342a"
                  position={[0.012, -0.015, 0.049]}
                  scale={[0.06, 0.077, 0.018]}
                />
                <Orb
                  color="#1c1928"
                  position={[0.014, -0.018, 0.065]}
                  scale={[0.032, 0.052, 0.011]}
                />
                <Orb
                  color="#ffffff"
                  position={[-0.006, 0.013, 0.075]}
                  scale={0.016}
                />
              </group>
              <Box
                size={[0.205, 0.045, 0.035]}
                color={HAIR}
                radius={0.016}
                position={[
                  side * 0.178,
                  0.209 + Math.abs(face.brow) * 0.1,
                  0.365,
                ]}
                rotation={[0, 0, side * face.brow]}
              />
              <Orb
                color="#d37c5f"
                position={[side * 0.285, -0.12, 0.328]}
                scale={[0.08, 0.043, 0.025]}
              />
            </group>
          ))}
          <Orb
            color="#e5a071"
            flat
            position={[0, -0.075, 0.409]}
            scale={[0.075, 0.1, 0.095]}
          />
          <Mouth smile={face.smile} open={Math.max(speech * 0.7, face.jaw)} />
          <Orb
            color={HAIR}
            flat
            position={[0, 0.27, -0.07]}
            scale={[0.46, 0.34, 0.39]}
          />
          {Array.from({ length: 7 }, (_, i) => (
            <mesh
              key={i}
              position={[
                -0.31 + i * 0.095,
                0.35 + Math.sin(i * 0.52) * 0.1,
                0.19,
              ]}
              rotation={[0, 0, -0.3 + i * 0.09]}
              castShadow
            >
              <icosahedronGeometry args={[0.22, 1]} />
              <meshStandardMaterial
                color={i % 2 ? "#2d2336" : HAIR}
                roughness={0.85}
                flatShading
              />
            </mesh>
          ))}
          <Orb
            color={HAIR}
            position={[-0.365, 0.09, 0.07]}
            scale={[0.075, 0.22, 0.1]}
          />
        </group>
      </group>
      <Arm side={-1} gesture={gesture} slouch={slouch} />
      <Arm side={1} gesture={gesture * 0.7} slouch={0} />
    </group>
  );
};
