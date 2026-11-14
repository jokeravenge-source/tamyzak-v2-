# Resonance visual lesson

The Physics Schemes catalog includes `electrical-resonance`, Chapter 3, alongside the existing eddy-current lesson. It contains 13 independent, silent 12-second H.264 clips and SVG posters. The UI starts paused, keeps native playback/fullscreen controls, supports 0.5–1.5× playback and replay, and preserves one-part-at-a-time progress. A failed video keeps its poster, the booklet text and a retry action. Each part has a source excerpt, formulas, a short explanation, a memory cue and a revealable recall answer. The booklet text appears directly under the video. The optional `scheme=electrical-resonance` query parameter opens the lesson directly; the app's existing `menu=physicsSchemes` parameter opens the tool.

## Source

User-supplied PDF: عصام الشمري، فيزياء المتميزين، الفصل الثالث, 93 PDF pages. Resonance and quality-factor material: printed/PDF pages 41–46, with power context on page 37. The source is English. Equations were transcribed visually from the original pages because plain PDF extraction omits the equation graphics. Text excerpts use normalized mathematical symbols and lightly normalized layout; Arabic explanations and recall cues are authored separately. The original PDF has not been changed or republished.

## Coverage

1. Matching the receiver's resonant frequency to the radio signal.
2. Equal inductive and capacitive reactances.
3. Minimum impedance and maximum current.
4. Opposite reactive-voltage phasors and possible voltage magnification.
5. Current/source-voltage phase and maximum average power.
6. Derivation of angular and ordinary resonant frequency.
7. Tuning L or C and the fourfold-capacitance example.
8. Capacitive, resonant and inductive regimes.
9. Lamp brightness compared with the same R and source.
10. Resistance versus current-peak height and width.
11. Half-power bandwidth and its distinction from half current.
12. Quality-factor definition, equation and unitless ratio.
13. Small/large resistance, bandwidth and quality-factor recall chain.

## Scientific rendering

The clips model an ideal **series** RLC circuit. Source voltage is held fixed in comparisons. Frequency plots use x = ω/ωr and r = R/√(L/C); current and power curves are calculated from the impedance rather than hand-drawn approximate peaks. Half-power points are x1 = (√(r²+4)−r)/2 and x2 = (√(r²+4)+r)/2, so x2−x1=r. The curves are not falsely forced to be arithmetically symmetric about resonance. When C changes at fixed L and R, r changes accordingly, keeping the absolute bandwidth R/L fixed and the normalized current peak unchanged. Forced receiver current retains the signal frequency even off resonance; tuning changes its amplitude. Normalized phase curves share a zero phase angle at resonance.

## Rebuild and validation

The separate video toolchain is in `tools/resonance-video`; it does not add Remotion dependencies to the student app. With Node 20+:

```sh
cd tools/resonance-video
npm ci
npm run studio
npm run render
```

Run these from the site root:

```sh
npm test -- src/data/physicsResonance.test.ts src/pages/PhysicsSchemes.test.tsx
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

The rendering helper writes the public MP4 files, SVG posters and intermediate PNG frames. Do not commit intermediate PNG files. A constrained Linux runtime may need `NODE_OPTIONS=--require=./loopback.cjs` when running Studio or `render.mjs`; ordinary installations do not. The Chromium package is for deterministic local export only, not website playback. Videos have no audio track, load metadata only, and never autoplay. No database migration or external video service is required.
