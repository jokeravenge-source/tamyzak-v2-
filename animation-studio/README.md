# Tamayzak cinematic 3D studio

A self-contained TypeScript / React / Three.js / React Three Fiber / drei / Remotion project. The default short, **Make it click**, is a 30-second portrait reel: 1080 × 1920, 30 FPS, 900 frames. Characters, sets, learning props, and the arch-and-stair brand mark are actual procedural 3D geometry. No external model, image, font, or API account is required to render.

## Start Studio

Use Node 22.13+ or Node 24 and npm. This project has its own dependencies and does not change the parent web application's build.

```bash
cd animation-studio
npm ci
npm run dev
```

Studio opens at **http://localhost:3100**. Select **Tamayzak-Reel** for the complete reel. The **Scenes** folder contains six independently previewable compositions. The JSON source deliberately controls the scene order and timeline; the full composition keeps one WebGL canvas mounted across cuts.

## Export

```bash
# Recommended first render: 150 frames / five seconds / full resolution
npm run render:opening

# Complete 1080 × 1920 H.264 / AAC MP4
npm run render:reel

# Faster, half-resolution review; keeps the full 30-second duration
npm run render:preview

# Nine full-resolution QA frames and a repeated-frame determinism check
npm run storyboard
```

Outputs go to `out/`. The render scripts generate the original stereo ambient score automatically. The default renderer uses Chromium's software WebGL backend so it works on machines without a GPU. `RENDER_CONCURRENCY=1` reduces memory pressure; `REMOTION_GL=angle` selects a different backend when your machine supports it. GPU performance varies. First launch may download Remotion's Chrome Headless Shell.

The equivalent direct CLI export, after `npm run audio`, is:

```bash
npx remotion render src/index.ts Tamayzak-Reel out/tamayzak-reel.mp4 \
  --codec=h264 --pixel-format=yuv420p --crf=18 --gl=swangle --concurrency=2
```

## Default story

| Frames  | Time   | Scene       | Animation                                                      |
| ------- | ------ | ----------- | -------------------------------------------------------------- |
| 0–149   | 0–5s   | Opening     | Frustrated student, notebook, laptop, lamp, restrained push-in |
| 150–299 | 5–10s  | Robot wakes | Eyes illuminate, body lifts, head turns, greeting gesture      |
| 300–479 | 10–16s | Dialogue    | Student and robot close-ups, timed captions and mouth movement |
| 480–689 | 16–23s | Learning    | Thick 3D card flips, quiz answer highlights, H₂O model rotates |
| 690–809 | 23–27s | Confidence  | Student straightens, gestures, and smiles; robot celebrates    |
| 810–899 | 27–30s | Brand       | Extruded arch, T, stairs and stars, camera move, wordmark      |

The default dialogue is captioned and drives the characters' mouths. It does **not** include spoken voice recordings. The included audio is an original generated ambient score and transition tones. Add your own voice recordings as described below to produce a voiced edition.

## Produce another reel with JSON

1. Copy `public/reels/tamayzak.json` to a new JSON file in the same folder.
2. Change the brand, titles, copy, dialogue, expressions, camera shots, educational copy, or scene order. Repeat any of the six scene kinds to build a new story.
3. Keep each scene's first expression at frame `0`. Expression keys and camera shots use **local scene frames**. Camera shot ranges must cover the scene without gaps or overlaps. The total length is derived from the scene durations.
4. In Studio, set the `configFile` prop to `reels/my-reel.json`. Or create a props file with `{"configFile":"reels/my-reel.json","captions":true,"soundtrack":true}` and pass it to the CLI.

```bash
node scripts/generate-audio.mjs public/reels/my-reel.json
npx remotion render src/index.ts Tamayzak-Reel out/my-reel.mp4 \
  --props=props/my-reel.json --gl=swangle --concurrency=2
```

For the scripted exporter:

```bash
# Generate the score for this configuration first.
node scripts/generate-audio.mjs public/reels/my-reel.json
REEL_CONFIG=reels/my-reel.json node scripts/render.mjs reel
```

Use the full composition for new scene IDs. Standalone scene compositions select the original IDs (`opening`, `wake`, `dialogue`, `learning`, `confidence`, `brand`). Metadata loading validates JSON before rendering and reports invalid expressions, timing, camera gaps, duplicate IDs, or quiz indices.

### Dialogue and voices

Each cue has `from`, `to`, `speaker` (`student` or `robot`), and `text`. Optionally add `audio` pointing to a local file under `public/`:

```json
{
  "from": 8,
  "to": 70,
  "speaker": "student",
  "text": "I keep reading. Nothing sticks.",
  "audio": "voices/student-01.wav"
}
```

Place that recording in `public/voices/student-01.wav`. Fit the recording into the cue's time window; longer audio is trimmed. Mouth movement is a deterministic, syllable-like envelope within each cue, not phoneme-level lip sync. Optional voice files are not included. Keep recorded voices in your asset management workflow and commit licensed files when appropriate. Turn `captions` or `soundtrack` off in Studio props for clean versions.

### Expressions and camera direction

Student expressions: `frustrated`, `confused`, `curious`, `excited`, `happy`.
Robot expressions: `happy`, `thinking`, `surprised`, `talking`, `blinking`.

```json
"studentExpressions": [
  {"frame": 0, "value": "confused"},
  {"frame": 60, "value": "happy", "transition": 24}
]
```

A camera shot contains `from`, `to`, `position`, `endPosition`, `target`, `fov`, and optional `endTarget` / `endFov`. Multiple shots produce exact cuts; position, target, and focal changes within a shot use smooth easing. Axes are Y-up, with the characters facing positive Z.

Scene templates retime their physical actions to their scene duration. JSON expression cues, dialogue and camera ranges remain explicit frame values, so update them when changing durations or FPS. The learning template allocates its first 37% to flashcards, next 30% to the quiz, and final 33% to the molecular model. The default diagram is specifically H₂O; change `ScientificDiagram` when switching scientific subjects rather than relabeling the geometry.

## Architecture

| Path                                       | Responsibility                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| `public/reels/tamayzak.json`               | Story, dialogue, learning content, shot list and expression timeline             |
| `src/timeline/`                            | Zod validation, scene lookup, dynamic composition metadata                       |
| `src/characters/Student.tsx`               | Procedural student, head, arms, hands, eyes, brows and mouth                     |
| `src/characters/Robot.tsx`                 | Rounded robot, face display, antenna, arms and floating body                     |
| `src/characters/expressions.ts`            | Reusable expression presets and transitions                                      |
| `src/animation/motion.ts`                  | Blinking, speech, gestures, head turns, idle motion, entrance and exit           |
| `src/camera/`                              | Seekable dolly, zoom, target movement and shot cuts                              |
| `src/environment/`                         | Furnished room, bookshelf, laptop, notebook, plant, mug and lamp                 |
| `src/lighting/`                            | Amber key light, blue and purple rim / ambient lights, soft shadow settings      |
| `src/components/LearningDemonstration.tsx` | Flashcard, quiz, and 3D molecular demonstrations                                 |
| `src/scenes/`                              | Independent scene entry points and shared WebGL viewport                         |
| `scripts/`                                 | Original score generation, MP4 rendering, storyboard verification                |
| `tests/`                                   | Animation determinism, expression continuity, cue bounds and timeline validation |

Screens and labels use locally drawn canvas textures on 3D meshes. Character bodies, faces, books, architecture, molecular geometry, cards, and the logo are modeled geometry. The logo is a procedural interpretation of the repository's existing Tamayzak arch-and-stair icon.

All animation is a pure function of Remotion's current frame and JSON data. There are no `useFrame`, timers, animation CSS, live physics, unseeded randomness, or network-dependent visual assets. The shared room is memoized and rounded meshes use a restrained subdivision count. New full-body animation or a different scientific model belongs in a reusable template rather than in the renderer.

## Verification

```bash
npm run check
npm run storyboard
```

`check` runs TypeScript, ESLint, and seven meaningful tests. `storyboard` renders the opening, awakening, both dialogue angles, all learning demonstrations, confidence, and the brand reveal. It then renders frame 65 again after seeking and compares PNG hashes. `out/` and generated audio are ignored by Git. The GitHub Actions workflow validates changes and supports manual five-second or complete-reel renders with downloadable MP4 artifacts.

Remotion's licensing terms apply to use of its renderer; see [Remotion licensing](https://www.remotion.dev/license). Source project dependencies are pinned and include their own licenses.
