import React, { useMemo } from "react";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import fontData from "three/examples/fonts/helvetiker_bold.typeface.json";
import { ExtrudeGeometry, Path, Shape } from "three";
import { Box, Rod } from "../components/Primitives";
import { ease, mix, seeded } from "../animation/motion";

export const BrandReveal: React.FC<{ frame: number }> = ({ frame }) => {
  const arches = useMemo(() => {
    const arch = (radius: number, bottom: number) => {
      const shape = new Shape();
      shape.moveTo(-radius, bottom);
      shape.lineTo(-radius, 0);
      shape.absarc(0, 0, radius, Math.PI, 0, true);
      shape.lineTo(radius, bottom);
      shape.closePath();
      return shape;
    };
    const outer = arch(0.85, -0.85);
    const hole = new Path();
    hole.moveTo(0.69, -0.87);
    hole.lineTo(0.69, 0);
    hole.absarc(0, 0, 0.69, 0, Math.PI, false);
    hole.lineTo(-0.69, -0.87);
    hole.closePath();
    outer.holes.push(hole);
    return [
      new ExtrudeGeometry(outer, {
        depth: 0.22,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.018,
        bevelThickness: 0.018,
        steps: 1,
        curveSegments: 24,
      }),
      new ExtrudeGeometry(arch(0.63, -0.84), {
        depth: 0.075,
        bevelEnabled: false,
        curveSegments: 24,
      }),
    ];
  }, []);
  const geometry = useMemo(() => {
    const text = new TextGeometry("T", {
      font: new FontLoader().parse(fontData),
      size: 0.88,
      depth: 0.18,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: 0.028,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    text.center();
    return text;
  }, []);
  React.useEffect(
    () => () => {
      geometry.dispose();
      arches.forEach((g) => g.dispose());
    },
    [geometry, arches],
  );
  const reveal = ease(frame, 0, 30);
  return (
    <group position={[0, 2.75, 0]} scale={0.82}>
      <group
        rotation={[mix(0.2, 0, reveal), mix(-0.8, -0.12, reveal), 0]}
        scale={mix(0.72, 1, reveal)}
      >
        <mesh geometry={arches[0]} castShadow>
          <meshStandardMaterial
            color="#242d63"
            metalness={0.45}
            roughness={0.28}
          />
        </mesh>
        <mesh geometry={arches[1]} position={[0, 0, -0.06]}>
          <meshStandardMaterial
            color="#5279b5"
            metalness={0.32}
            roughness={0.32}
          />
        </mesh>
        <mesh position={[0, 0, 0.245]}>
          <torusGeometry args={[0.705, 0.019, 8, 64, Math.PI]} />
          <meshStandardMaterial color="#fff1d2" />
        </mesh>
        {[-1, 1].map((side) => (
          <Rod
            key={side}
            from={[side * 0.705, 0, 0.245]}
            to={[side * 0.705, -0.85, 0.245]}
            radius={0.019}
            color="#fff1d2"
          />
        ))}
        <mesh geometry={geometry} position={[-0.035, -0.02, 0.17]} castShadow>
          <meshStandardMaterial
            color="#fff2d8"
            metalness={0.3}
            roughness={0.25}
          />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <Box
            key={i}
            size={[0.38 - i * 0.015, 0.07, 0.2]}
            color="#ebe9de"
            radius={0.008}
            position={[
              0.02 + Math.sin(i / 5) * 0.12,
              -0.8 + i * 0.075,
              0.3 - i * 0.018,
            ]}
            metalness={0.15}
          />
        ))}
        <Box
          size={[1.8, 0.065, 0.4]}
          color="#2d3569"
          radius={0.022}
          position={[0, -0.89, 0.12]}
        />
        {[
          [-0.42, -0.24, 0.27],
          [0.37, 0.14, 0.27],
          [0, 0.51, 0.27],
        ].map((position, i) => (
          <mesh
            key={i}
            position={position as [number, number, number]}
            scale={[0.6, 1, 0.4]}
          >
            <octahedronGeometry args={[i === 2 ? 0.065 : 0.045, 0]} />
            <meshStandardMaterial
              color="#fff3dc"
              emissive="#c8b4e5"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
      {Array.from({ length: 22 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (seeded(i) - 0.5) * 4,
            (seeded(i + 50) - 0.5) * 4 + Math.sin(frame / 30 + i) * 0.045,
            -0.4 - seeded(i + 30) * 2,
          ]}
          scale={0.009 + seeded(i + 10) * 0.015}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={i % 3 ? "#9888d7" : "#ffd2a0"}
            transparent
            opacity={reveal * 0.7}
          />
        </mesh>
      ))}
      <pointLight
        color="#b699ff"
        position={[0, 0, 2]}
        intensity={8}
        distance={5}
      />
    </group>
  );
};
