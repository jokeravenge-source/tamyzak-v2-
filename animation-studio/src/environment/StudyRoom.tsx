import React from "react";
import { Box, Orb, Rod, Label } from "../components/Primitives";
import { seeded } from "../animation/motion";

const Bookshelf = () => (
  <group position={[-2.2, 0, -1.9]}>
    <Box size={[1.35, 3.6, 0.12]} color="#1d2439" position={[0, 1.8, -0.18]} />
    {[-0.7, 0.7].map((x) => (
      <Box
        key={x}
        size={[0.08, 3.6, 0.53]}
        color="#353348"
        position={[x, 1.8, 0]}
      />
    ))}
    {[0.25, 1.2, 2.15, 3.1, 3.6].map((y, j) => (
      <group key={y}>
        <Box size={[1.48, 0.07, 0.58]} color="#4a4053" position={[0, y, 0]} />
        {j < 4 &&
          Array.from({ length: 7 }, (_, i) => {
            const h = 0.42 + seeded(i + j * 8) * 0.3;
            const colors = [
              "#e28f67",
              "#6474a3",
              "#b3a0bd",
              "#607e82",
              "#c6ab83",
            ];
            return (
              <group
                key={i}
                position={[-0.56 + i * 0.18, y + h / 2 + 0.04, 0]}
                rotation={[0, 0, i === 6 ? -0.1 : 0]}
              >
                <Box
                  size={[0.135, h, 0.35]}
                  color={colors[(i + j) % colors.length]}
                  radius={0.012}
                />
                <Box
                  size={[0.095, 0.015, 0.008]}
                  color="#dacbbb"
                  position={[0, h * 0.29, 0.179]}
                  radius={0.002}
                />
                <Box
                  size={[0.095, 0.015, 0.008]}
                  color="#dacbbb"
                  position={[0, -h * 0.28, 0.179]}
                  radius={0.002}
                />
              </group>
            );
          })}
      </group>
    ))}
  </group>
);

const Plant = () => (
  <group position={[2.42, 0.18, -1.45]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.25, 0.18, 0.38, 10]} />
      <meshStandardMaterial color="#bd7c72" flatShading />
    </mesh>
    {Array.from({ length: 7 }, (_, i) => {
      const angle = i * 2.4;
      const x = Math.sin(angle) * 0.24,
        z = Math.cos(angle) * 0.24,
        y = 0.7 + seeded(i) * 0.6;
      return (
        <group key={i}>
          <Rod
            from={[0, 0.12, 0]}
            to={[x, y, z]}
            color="#4d7975"
            radius={0.015}
          />
          <Orb
            color={i % 2 ? "#57988e" : "#396f72"}
            flat
            position={[x, y, z]}
            scale={[0.17, 0.33, 0.07]}
            rotation={[0.3, angle, -0.3]}
          />
        </group>
      );
    })}
  </group>
);

export const DeskLamp = () => (
  <group position={[-1.47, 1.48, -0.18]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.22, 0.24, 0.055, 24]} />
      <meshStandardMaterial color="#df9c67" metalness={0.6} roughness={0.3} />
    </mesh>
    <Rod
      from={[0, 0, 0]}
      to={[-0.12, 0.55, 0]}
      color="#d6a077"
      radius={0.035}
    />
    <Orb color="#e5ae80" position={[-0.12, 0.55, 0]} scale={0.07} />
    <Rod
      from={[-0.12, 0.55, 0]}
      to={[0.14, 0.88, 0.02]}
      color="#d6a077"
      radius={0.033}
    />
    <group position={[0.17, 0.84, 0.07]} rotation={[0.25, 0, -0.3]}>
      <mesh castShadow>
        <coneGeometry args={[0.25, 0.28, 24, 1, true]} />
        <meshStandardMaterial color="#d79362" side={2} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.23, 24]} />
        <meshBasicMaterial color="#ffe6bb" toneMapped={false} />
      </mesh>
    </group>
    <pointLight
      position={[0.18, 0.69, 0.1]}
      color="#ffae5d"
      intensity={5}
      distance={3}
      decay={2}
    />
  </group>
);

const Laptop = () => (
  <group position={[0.08, 1.48, 0.61]} rotation={[0, -0.16, 0]}>
    <Box
      size={[1, 0.055, 0.65]}
      color="#606279"
      radius={0.035}
      metalness={0.6}
      roughness={0.32}
    />
    <Box
      size={[0.77, 0.008, 0.33]}
      color="#23293d"
      position={[0, 0.032, -0.05]}
      radius={0.018}
    />
    {Array.from({ length: 4 }, (_, i) => (
      <group key={i}>
        {Array.from({ length: 10 }, (_, k) => (
          <Box
            key={k}
            size={[0.053, 0.008, 0.047]}
            color="#757991"
            radius={0.006}
            position={[-0.33 + k * 0.073, 0.039, -0.18 + i * 0.077]}
          />
        ))}
      </group>
    ))}
    <Box
      size={[0.29, 0.005, 0.12]}
      color="#8b8fa5"
      radius={0.01}
      position={[0, 0.031, 0.22]}
    />
    <group position={[0, 0.35, 0.28]} rotation={[0.16, 0, 0]}>
      <Box
        size={[1, 0.65, 0.045]}
        color="#656981"
        radius={0.035}
        metalness={0.4}
      />
      <Box
        size={[0.92, 0.55, 0.008]}
        color="#161e3a"
        radius={0.015}
        emissive="#1e3672"
        position={[0, 0, -0.027]}
      />
      <Label
        text="T"
        width={0.21}
        height={0.24}
        fontSize={850}
        position={[0, 0, 0.025]}
        color="#c4c8f2"
      />
    </group>
    <pointLight
      position={[0, 0.4, -0.1]}
      color="#879cff"
      intensity={0.7}
      distance={2}
    />
  </group>
);

const Notebook = () => (
  <group position={[-1.05, 1.455, 0.57]} rotation={[-Math.PI / 2, 0, -0.12]}>
    <Box size={[0.65, 0.52, 0.04]} color="#bda9cb" radius={0.01} />
    <Box
      size={[0.6, 0.48, 0.018]}
      color="#eee0d1"
      position={[0, 0, 0.03]}
      radius={0.003}
    />
    {Array.from({ length: 7 }, (_, i) => (
      <Box
        key={i}
        size={[0.4 - seeded(i) * 0.09, 0.008, 0.002]}
        color="#9d97a9"
        radius={0.001}
        position={[0.025, 0.16 - i * 0.055, 0.041]}
      />
    ))}
    <Rod
      from={[-0.22, -0.2, 0.05]}
      to={[-0.22, 0.2, 0.05]}
      radius={0.006}
      color="#d3a5a2"
    />
    <Rod
      from={[0.11, -0.25, 0.07]}
      to={[0.29, 0.13, 0.07]}
      radius={0.014}
      color="#e3ad6a"
    />
  </group>
);

export const StudyRoom: React.FC = React.memo(function StudyRoom() {
  return (
    <group>
      <Box
        size={[8.5, 0.15, 7]}
        color="#2e2943"
        position={[0, -0.08, 0]}
        radius={0.01}
      />
      <Box
        size={[8.5, 6, 0.18]}
        color="#292a4e"
        position={[0, 3, -2.4]}
        radius={0.01}
      />
      <Box
        size={[0.15, 6, 7]}
        color="#272945"
        position={[-4.2, 3, 0]}
        radius={0.01}
      />
      <Box
        size={[8.3, 0.08, 0.08]}
        color="#7773aa"
        emissive="#5547a8"
        position={[0, 0.13, -2.28]}
        radius={0.015}
      />
      {Array.from({ length: 13 }, (_, i) => (
        <Box
          key={i}
          size={[0.025, 0.005, 6.8]}
          color="#393148"
          position={[-4 + i * 0.64, 0.005, 0]}
          radius={0.001}
        />
      ))}
      <Bookshelf />
      <group position={[1.15, 3.05, -2.27]}>
        <Box size={[1.65, 1.9, 0.08]} color="#444574" radius={0.04} />
        <Box
          size={[1.47, 1.72, 0.03]}
          color="#101e46"
          position={[0, 0, 0.06]}
          radius={0.025}
          emissive="#152951"
        />
        <mesh position={[0.37, 0.48, 0.09]}>
          <circleGeometry args={[0.24, 32]} />
          <meshBasicMaterial color="#d4dcff" />
        </mesh>
        <Box
          size={[0.045, 1.75, 0.06]}
          color="#4d5279"
          position={[0, 0, 0.1]}
          radius={0.01}
        />
        <Box
          size={[1.48, 0.045, 0.06]}
          color="#4d5279"
          position={[0, 0, 0.1]}
          radius={0.01}
        />
        {Array.from({ length: 12 }, (_, i) => (
          <Box
            key={i}
            size={[0.035, 0.025 + seeded(i) * 0.03, 0.01]}
            color="#545d9a"
            emissive="#434c87"
            position={[-0.67 + i * 0.12, -0.68 + seeded(i) * 0.17, 0.09]}
            radius={0.002}
          />
        ))}
      </group>
      <group position={[2.55, 3.8, -2.23]}>
        <Box size={[0.6, 0.77, 0.06]} color="#c19a8b" radius={0.025} />
        <Box
          size={[0.5, 0.67, 0.015]}
          color="#524a7b"
          position={[0, 0, 0.04]}
        />
        <Label
          text="STAY"
          width={0.42}
          height={0.18}
          position={[0, 0.07, 0.052]}
          fontSize={330}
        />
        <Label
          text="CURIOUS"
          width={0.44}
          height={0.15}
          position={[0, -0.1, 0.052]}
          fontSize={180}
          color="#ffc692"
        />
      </group>
      <Plant />
      <Box
        size={[3.85, 0.14, 1.5]}
        color="#aa776b"
        position={[0, 1.37, 0.2]}
        radius={0.045}
      />
      <Box
        size={[3.68, 0.025, 1.37]}
        color="#ba8d7d"
        position={[0, 1.45, 0.2]}
        radius={0.03}
      />
      {[-1.6, 1.6].map((x) => (
        <group key={x}>
          <Box
            size={[0.12, 1.28, 0.12]}
            color="#27263b"
            position={[x, 0.66, 0.68]}
          />
          <Box
            size={[0.12, 1.28, 0.12]}
            color="#27263b"
            position={[x, 0.66, -0.35]}
          />
        </group>
      ))}
      <Box
        size={[1.95, 0.007, 0.85]}
        color="#4b435c"
        radius={0.04}
        position={[0.3, 1.469, 0.33]}
      />
      <DeskLamp />
      <Laptop />
      <Notebook />
      <group position={[1.45, 1.53, -0.13]}>
        <Box
          size={[0.5, 0.09, 0.37]}
          color="#7484a2"
          radius={0.01}
          rotation={[0, 0.08, 0]}
        />
        <Box
          size={[0.47, 0.08, 0.34]}
          color="#d29171"
          radius={0.01}
          position={[0.01, 0.085, 0]}
          rotation={[0, -0.1, 0]}
        />
      </group>
      <group position={[1.55, 1.62, 0.65]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.105, 0.085, 0.25, 18]} />
          <meshStandardMaterial color="#cfb2a1" />
        </mesh>
        <mesh position={[0.1, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.065, 0.018, 8, 20]} />
          <meshStandardMaterial color="#cfb2a1" />
        </mesh>
        <mesh position={[0, 0.126, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 18]} />
          <meshStandardMaterial color="#492c2d" />
        </mesh>
      </group>
    </group>
  );
});
