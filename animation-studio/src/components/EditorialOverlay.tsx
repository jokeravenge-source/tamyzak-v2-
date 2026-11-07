import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, pulse } from "../animation/motion";
import type { ReelDefinition, SceneDefinition } from "../timeline/schema";

export const EditorialOverlay: React.FC<{
  scene: SceneDefinition;
  reel: ReelDefinition;
  frame: number;
  captions: boolean;
}> = ({ scene, reel, frame, captions }) => {
  const brand = scene.kind === "brand";
  const cue = scene.dialogue.find((c) => frame >= c.from && frame < c.to);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        fontFamily: "Arial, sans-serif",
        color: "#fff3e8",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 47%, transparent 32%, rgba(8,7,22,.6) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 165,
          left: 86,
          right: 100,
          opacity: ease(frame, 0, 16),
        }}
      >
        <div
          style={{
            fontSize: 25,
            letterSpacing: 6,
            color: "#c4b3ed",
            marginBottom: 28,
          }}
        >
          {scene.kicker}
        </div>
        {scene.kind !== "dialogue" && !brand && (
          <div
            style={{
              fontSize: scene.kind === "wake" ? 102 : 108,
              fontWeight: 800,
              letterSpacing: -5,
              lineHeight: 0.98,
              whiteSpace: "pre-line",
            }}
          >
            {scene.title}
          </div>
        )}
      </div>
      {brand ? (
        <div
          style={{
            position: "absolute",
            left: 70,
            right: 85,
            top: 1220,
            textAlign: "center",
            opacity: ease(frame, 17, 42),
            translate: `0 ${24 * (1 - ease(frame, 17, 42))}px`,
          }}
        >
          <div style={{ fontSize: 100, fontWeight: 700, letterSpacing: -5 }}>
            {reel.brand}
          </div>
          <div style={{ fontSize: 49, color: "#c4e9eb", marginTop: 20 }}>
            {reel.tagline}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#ae9dcc",
              marginTop: 88,
              letterSpacing: 2,
            }}
          >
            {scene.copy}
          </div>
        </div>
      ) : (
        <>
          {(!cue || !captions) && (
            <div
              style={{
                position: "absolute",
                bottom: 230,
                left: 90,
                right: 110,
                fontSize: 47,
                lineHeight: 1.35,
                fontWeight: 500,
                whiteSpace: "pre-line",
                opacity: ease(frame, 22, 42),
                textShadow: "0 3px 20px #0d0d24",
              }}
            >
              {scene.copy}
            </div>
          )}
          {captions && cue && (
            <div
              style={{
                position: "absolute",
                bottom: 220,
                left: 80,
                right: 110,
                padding: "28px 32px",
                background: "rgba(16,19,41,.85)",
                borderRadius: 24,
                borderLeft: `5px solid ${cue.speaker === "robot" ? "#82e5ee" : "#ecb28f"}`,
                opacity: pulse(frame, cue.from, cue.to, 4),
              }}
            >
              <div
                style={{
                  fontSize: 23,
                  color: cue.speaker === "robot" ? "#82e5ee" : "#ecb28f",
                  letterSpacing: 3,
                  marginBottom: 11,
                }}
              >
                {cue.speaker === "robot" ? "TAMAYZAK" : "STUDENT"}
              </div>
              <div style={{ fontSize: 48, lineHeight: 1.25 }}>{cue.text}</div>
            </div>
          )}
        </>
      )}
      {scene.kind !== "opening" && !brand && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 90,
            fontSize: 25,
            letterSpacing: 5,
            color: "#a69bcb",
          }}
        >
          TAMAYZAK
        </div>
      )}
    </AbsoluteFill>
  );
};
