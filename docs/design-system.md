# Tamayzak visual design system

**Status: required for all current and future student-facing UI.** This is a visual language, not a new selectable theme. The approved reference is the Home Points lightning and Continue Studying book: Apple-inspired, dimensional, vivid, restrained and clean.

## Non-negotiable rules
- Preserve the user's selected theme and existing ThemePicker storage, typography, layout direction and behavior. Use `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary` and other semantic tokens for ordinary surfaces. Never force a dark or light mode.
- Major feature cards and subject entry points use distinct, recognizable color families, rounded geometry, a three-stop analogous gradient, subtle inset highlights and soft directional shadows. Keep colors lively but readable; avoid gray washed-out cards, arbitrary neon colors, heavy glass effects and identical blue cards everywhere.
- Main feature illustrations use the shared `FeatureIcon3D` component, matching the lightning/book perspective, bevel, shadow and white glyph. Use meaningful Lucide icons, not unrelated flat icons, emoji, stock art or mixed illustration styles. Preserve existing bespoke artwork where it serves a distinct feature or was expressly requested.
- Normal navigation, tiny utility icons, text controls and dense data tables may remain flat for clarity. Do not put 3D effects on every button or change established navigation just to match the style.
- Keep the hierarchy intentional: rounded cards (typically 20–28px), clear bold title, short secondary text, consistent spacing, one dominant action. Use 3D art as a focal point, not decoration on every row.
- Subject identity stays distinct across the study entry card and its own tools: physics blue, chemistry purple, biology green, math amber, English pink, French indigo, Arabic teal, Islamic olive/gold. Follow the existing SubjectsHub palettes; do not alter subject identity arbitrarily.
- Use CSS gradients and lightweight SVG icons rather than WebGL or large raster assets for ordinary feature artwork. Honor reduced motion; avoid continuous decorative animation.
- Support Arabic RTL and English LTR, mobile and desktop, light and dark themes. Use logical spacing (start/end), visible keyboard focus, accessible names and minimum 44px touch targets. Aim for WCAG AA text contrast (4.5:1 normal, 3:1 large) and check icon visibility on each tone.
- Never change feature logic, premium gates, data, or navigation in a visual-only task.

## Implementation
Canonical sources:
- `src/components/ui/FeatureIcon3D.tsx`: reusable dimensional feature icon.
- `src/components/home/homeCards.css`: existing tone palette, gradient surfaces, icon lighting and shadows. Reuse `home-illustrated-card`, `home-surface-card`, `home-card-muted`, and `data-home-tone` rather than duplicating them. A new feature tone must define the same palette variables (light, swatch, base, shadow, gradient start/end); validate white text contrast across the whole surface.
- `src/components/ThemePicker.tsx`: global semantic theme tokens.
- `src/pages/SubjectsHub.tsx`: subject-specific visual identity.
- `src/components/home/HomeHighlights.tsx` and `src/pages/Basics.tsx`: approved reference usage.

Example:
```tsx
import { BookOpen } from "lucide-react";
import FeatureIcon3D from "@/components/ui/FeatureIcon3D";

<button type="button" data-home-tone="continue"
  className="home-illustrated-card group flex w-full items-center justify-between gap-3 rounded-[1.4rem] border p-4 text-start">
  <span className="min-w-0 font-black">Continue studying</span>
  <FeatureIcon3D icon={BookOpen} />
</button>
```

## Required review before shipping UI changes
1. Compare the new UI to the approved Home references; reuse shared primitives and existing theme variables.
2. Check Arabic and English, a narrow mobile viewport and desktop, and at least one light and dark theme (all supported themes when changing shared tokens).
3. Check contrast, keyboard focus, touch targets, reduced motion, overflow and loading/empty/error/locked states as applicable.
4. Run relevant tests and a production build; disclose any unavailable visual or deployment verification.
5. When touching older screens, migrate their presentation toward this standard without changing unrelated behavior. Do not claim an untouched screen has been migrated.
