import React from "react";

export const CinematicLighting: React.FC<{ energy?: number }> = ({
  energy = 0,
}) => (
  <>
    <color attach="background" args={["#14152e"]} />
    <fog attach="fog" args={["#1a1936", 10, 23]} />
    <ambientLight intensity={0.44} color="#a7a6e8" />
    <hemisphereLight args={["#969edc", "#6c435c", 0.7]} />
    <directionalLight
      position={[-3, 5, 4]}
      intensity={2.2}
      color="#ffcb9e"
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-4}
      shadow-camera-right={4}
      shadow-camera-top={5}
      shadow-camera-bottom={-2}
      shadow-normalBias={0.035}
      shadow-bias={-0.0001}
      shadow-radius={4}
      shadow-blurSamples={6}
    />
    <directionalLight
      position={[3, 4, -1]}
      intensity={2.3 + energy}
      color="#9b78ff"
    />
    <pointLight
      position={[-2.5, 2, -0.5]}
      color="#7542ff"
      intensity={13}
      distance={7}
    />
    <pointLight
      position={[1.4, 3, -1.5]}
      color="#4d8fff"
      intensity={12}
      distance={7}
    />
    <pointLight
      position={[1, 2.1, 0.4]}
      color="#80eaff"
      intensity={energy * 3}
      distance={3}
    />
  </>
);
