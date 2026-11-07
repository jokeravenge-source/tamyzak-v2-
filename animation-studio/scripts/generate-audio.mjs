import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// Original, deterministic sound design; no downloads, credentials, or services.
const config = JSON.parse(
  readFileSync(process.argv[2] ?? "public/reels/tamayzak.json", "utf8"),
);
if (!config.soundtrack) process.exit(0);
const destination = path.resolve("public", config.soundtrack);
if (!destination.startsWith(path.resolve("public/audio") + path.sep))
  throw new Error("Generated audio must be inside public/audio.");
const seconds =
  config.scenes.reduce((n, scene) => n + scene.duration, 0) / config.fps;
const rate = 44100;
const samples = Math.ceil(seconds * rate);
const data = new Float32Array(samples * 2);
const tau = Math.PI * 2;
const clamp = (n) => Math.max(0, Math.min(1, n));
const smooth = (n) => {
  const x = clamp(n);
  return x * x * (3 - 2 * x);
};
const notes = [146.832, 174.614, 220, 261.626];
const transitions = [];
let start = 0;
for (const scene of config.scenes) {
  transitions.push(start / config.fps);
  start += scene.duration;
}
for (let i = 0; i < samples; i++) {
  const t = i / rate;
  const envelope = smooth(t / 2) * smooth((seconds - t) / 1.5);
  const energy = 0.065 + smooth((t - 4) / 4) * 0.035;
  for (let channel = 0; channel < 2; channel++) {
    const phase = channel * 0.16;
    let value = 0;
    for (let n = 0; n < notes.length; n++) {
      const vibrato = Math.sin(t * 0.3 + n + phase) * 0.09;
      value +=
        (Math.sin(tau * notes[n] * t + vibrato + phase) *
          (0.52 + Math.sin(t * 0.4 + n) * 0.16)) /
        notes.length;
      value += Math.sin(tau * notes[n] * 2.002 * t + phase) * 0.055;
    }
    for (const cut of transitions.slice(1)) {
      const dt = t - cut;
      if (dt >= 0 && dt < 1.6)
        value +=
          Math.sin(tau * (cut > seconds - 4 ? 880 : 659.255) * dt) *
          Math.exp(-dt * 4.7) *
          0.25;
    }
    if (t > 16) {
      const arpeggio = [440, 523.251, 659.255, 523.251];
      const local = (t - 16) % 0.75;
      value +=
        Math.sin(tau * arpeggio[Math.floor((t - 16) / 0.75) % 4] * local) *
        Math.exp(-local * 9) *
        0.13;
    }
    data[i * 2 + channel] = value * energy * envelope;
  }
}
const wav = Buffer.alloc(44 + samples * 4);
wav.write("RIFF");
wav.writeUInt32LE(wav.length - 8, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(rate, 24);
wav.writeUInt32LE(rate * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(samples * 4, 40);
for (let i = 0; i < data.length; i++)
  wav.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, data[i])) * 32767),
    44 + i * 2,
  );
mkdirSync(path.dirname(destination), { recursive: true });
writeFileSync(destination, wav);
console.log(
  `Generated ${seconds.toFixed(2)}s original stereo score: ${path.relative(process.cwd(), destination)}`,
);
