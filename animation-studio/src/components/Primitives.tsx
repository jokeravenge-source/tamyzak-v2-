import React, { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { CanvasTexture, Quaternion, SRGBColorSpace, Vector3 } from "three";
import type { ThreeElements } from "@react-three/fiber";
import type { V3 } from "../animation/motion";

export const Box = ({
  size,
  color,
  radius = 0.05,
  metalness = 0,
  roughness = 0.65,
  emissive,
  ...props
}: {
  size: V3;
  color: string;
  radius?: number;
  metalness?: number;
  roughness?: number;
  emissive?: string;
} & Omit<ThreeElements["mesh"], "args" | "ref">) => (
  <RoundedBox
    args={size}
    radius={Math.min(radius, ...size.map((v) => v / 2 - 0.0001))}
    smoothness={2}
    bevelSegments={1}
    castShadow
    receiveShadow
    {...props}
  >
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive ?? "#000000"}
      emissiveIntensity={emissive ? 1.4 : 0}
    />
  </RoundedBox>
);

export const Orb = ({
  color,
  flat = false,
  ...props
}: { color: string; flat?: boolean } & ThreeElements["mesh"]) => (
  <mesh castShadow receiveShadow {...props}>
    <sphereGeometry args={[1, flat ? 16 : 24, flat ? 12 : 16]} />
    <meshStandardMaterial color={color} roughness={0.64} flatShading={flat} />
  </mesh>
);

export const Rod = ({
  from,
  to,
  radius = 0.035,
  color = "#222238",
  emissive,
}: {
  from: V3;
  to: V3;
  radius?: number;
  color?: string;
  emissive?: string;
}) => {
  const a = new Vector3(...from),
    b = new Vector3(...to);
  const direction = b.clone().sub(a);
  const midpoint = a.clone().add(b).multiplyScalar(0.5);
  const quaternion = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.clone().normalize(),
  );
  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, direction.length(), 10]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissive ? 2 : 0}
        roughness={0.5}
      />
    </mesh>
  );
};

export const Label = ({
  text,
  width = 1,
  height = 0.3,
  color = "#f4efff",
  fontSize = 80,
  background = "transparent",
  ...props
}: {
  text: string;
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  background?: string;
} & ThreeElements["mesh"]) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.round((1024 * height) / width);
    const ctx = canvas.getContext("2d")!;
    if (background !== "transparent") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = color;
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2, 960);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return map;
  }, [text, width, height, color, fontSize, background]);
  React.useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh {...props}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
};
