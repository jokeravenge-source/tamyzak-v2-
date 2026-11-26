import React from "react";
import { Box, Label, Orb, Rod } from "./Primitives";
import { ease, mix, type V3 } from "../animation/motion";
import type { ReelDefinition } from "../timeline/schema";

const Panel = ({ children }: { children: React.ReactNode }) => (
  <group>
    <Box
      size={[2.26, 1.5, 0.09]}
      color="#273353"
      radius={0.13}
      metalness={0.3}
      roughness={0.3}
    />
    <Box
      size={[2.17, 1.41, 0.014]}
      color="#172541"
      radius={0.1}
      position={[0, 0, 0.052]}
    />
    <Box
      size={[0.45, 0.018, 0.01]}
      color="#99e9fc"
      emissive="#65b9ff"
      radius={0.007}
      position={[-0.68, 0.64, 0.068]}
    />
    {children}
  </group>
);

export const Flashcard: React.FC<{
  frame: number;
  data: ReelDefinition["learning"]["flashcard"];
}> = ({ frame, data }) => {
  const flip = ease(frame, 26, 51) * Math.PI;
  return (
    <group rotation={[0, flip, 0]}>
      <Panel>
        <Label
          text="01 / ACTIVE RECALL"
          width={1.9}
          height={0.18}
          fontSize={59}
          position={[0, 0.43, 0.07]}
          color="#9faed7"
        />
        <Label
          text={data.question}
          width={1.94}
          height={0.33}
          fontSize={105}
          position={[0, 0.08, 0.075]}
        />
        <Label
          text="THINK. THEN TURN."
          width={1.8}
          height={0.22}
          fontSize={59}
          position={[0, -0.42, 0.07]}
          color="#70dbf1"
        />
      </Panel>
      <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.065]}>
        <Box size={[2.19, 1.44, 0.014]} color="#253d57" radius={0.1} />
        <Label
          text="YOU KNOW THIS."
          width={1.85}
          height={0.22}
          fontSize={66}
          position={[0, 0.41, 0.014]}
          color="#91e6ce"
        />
        <Label
          text={data.answer}
          width={1.8}
          height={0.5}
          fontSize={200}
          position={[0, -0.02, 0.015]}
        />
        <Label
          text="ONE CONNECTION AT A TIME"
          width={1.85}
          height={0.2}
          fontSize={49}
          position={[0, -0.46, 0.014]}
          color="#adbfe4"
        />
      </group>
    </group>
  );
};

export const MultipleChoice: React.FC<{
  frame: number;
  data: ReelDefinition["learning"]["quiz"];
}> = ({ frame, data }) => {
  const selected = frame >= 30;
  const y = 0.08 - data.correctIndex * 0.31;
  return (
    <Panel>
      <Label
        text="02 / PUT IT TO THE TEST"
        width={1.9}
        height={0.18}
        fontSize={55}
        position={[0, 0.45, 0.071]}
        color="#9faed7"
      />
      <Label
        text={data.question}
        width={1.94}
        height={0.23}
        fontSize={72}
        position={[0, 0.25, 0.074]}
      />
      {data.options.map((option, i) => (
        <group key={option} position={[0, 0.015 - i * 0.275, 0.077]}>
          <Box
            size={[1.84, 0.225, 0.026]}
            color={selected && i === data.correctIndex ? "#246d69" : "#31405f"}
            radius={0.045}
            emissive={
              selected && i === data.correctIndex ? "#17534d" : undefined
            }
          />
          <Label
            text={`${String.fromCharCode(65 + i)}   ${option}`}
            width={1.64}
            height={0.2}
            fontSize={68}
            position={[0, 0, 0.019]}
            color={selected && i === data.correctIndex ? "#a8ffe4" : "#e5e8f7"}
          />
        </group>
      ))}
      <mesh
        position={[
          mix(0.91, 0.8, ease(frame, 10, 30)),
          mix(0.25, y - 0.065, ease(frame, 10, 30)),
          0.13,
        ]}
      >
        <torusGeometry
          args={[
            0.043 + (selected ? Math.sin(frame / 6) * 0.006 : 0),
            0.011,
            8,
            24,
          ]}
        />
        <meshBasicMaterial color="#b6fff2" />
      </mesh>
    </Panel>
  );
};

export const ScientificDiagram: React.FC<{ frame: number; title: string }> = ({
  frame,
  title,
}) => {
  // The H–O–H angle is 104.5 degrees. This is a ball-and-stick model.
  const halfAngle = (104.5 * Math.PI) / 360;
  const hydrogen = (side: number): V3 => [
    side * Math.sin(halfAngle) * 0.79,
    -Math.cos(halfAngle) * 0.79,
    0,
  ];
  const turn = mix(-0.35, 0.36, ease(frame, 0, 62));
  const selection = ease(frame, 15, 32);
  return (
    <Panel>
      <Label
        text="03 / SEE THE SCIENCE"
        width={1.9}
        height={0.18}
        fontSize={57}
        position={[0, 0.45, 0.071]}
        color="#9faed7"
      />
      <Label
        text={title}
        width={1.95}
        height={0.2}
        fontSize={67}
        position={[0, 0.24, 0.071]}
      />
      <group
        position={[0, -0.015, 0.41]}
        rotation={[0.12, turn, -0.04]}
        scale={0.64 + selection * 0.02}
      >
        <Orb color="#e895a2" position={[0, 0, 0]} scale={0.22} />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Rod
              from={[0, 0, 0]}
              to={hydrogen(side)}
              color="#8baec5"
              radius={0.052}
            />
            <Orb color="#d9ecf4" position={hydrogen(side)} scale={0.15} />
          </group>
        ))}
        <Label
          text="O"
          width={0.21}
          height={0.2}
          fontSize={700}
          position={[0, 0, 0.23]}
        />
        {[-1, 1].map((side) => (
          <Label
            key={side}
            text="H"
            width={0.14}
            height={0.14}
            fontSize={700}
            position={[hydrogen(side)[0], hydrogen(side)[1], 0.16]}
            color="#1a3150"
          />
        ))}
        <mesh rotation={[0, 0, -Math.PI * 0.79]} position={[0, 0, 0.035]}>
          <torusGeometry args={[0.38, 0.006, 6, 36, (104.5 * Math.PI) / 180]} />
          <meshBasicMaterial color="#7ff3ed" transparent opacity={selection} />
        </mesh>
      </group>
      <Label
        text={
          frame > 22
            ? "104.5°  /  BENT GEOMETRY"
            : "SELECT. ROTATE. UNDERSTAND."
        }
        width={1.9}
        height={0.19}
        fontSize={58}
        position={[0, -0.62, 0.08]}
        color="#90eedc"
      />
    </Panel>
  );
};

export const LearningDemonstration: React.FC<{
  frame: number;
  data: ReelDefinition["learning"];
}> = ({ frame, data }) => {
  const enter = ease(frame, 0, 14);
  return (
    <group
      position={[0.05, 2.36 + (1 - enter) * -0.35, 1.03]}
      rotation={[0.01, 0.04, 0]}
      scale={Math.max(0.001, enter)}
    >
      {frame < 77 ? (
        <Flashcard frame={frame} data={data.flashcard} />
      ) : frame < 140 ? (
        <MultipleChoice frame={frame - 77} data={data.quiz} />
      ) : (
        <ScientificDiagram frame={frame - 140} title={data.diagramTitle} />
      )}
      <pointLight
        position={[0, 0, 0.3]}
        color="#64d4ff"
        intensity={1.4}
        distance={3}
      />
    </group>
  );
};
