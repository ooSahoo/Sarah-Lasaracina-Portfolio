# FlexID Tracker — Design System

> A dark-first, information-dense design language for **FlexID Work Tracker**, a personal cockpit for a Senior PM at Transmit Security.

The Tracker is a small macOS Electron app that aggregates Jira (assigned-to-me, mentions) and Slack @mentions into a single window. It is opened first thing in the morning, glanced at all day, and parked in the corner of a screen. **Speed of scanning is the only thing that matters.**

---

## Sources

- **Codebase** — `flexid-tracker/` (mounted via local file system access). React 19 + Vite + Tailwind 4 + Electron 42. The current implementation is light-mode and includes extra tabs (Confluence, Calendar, Focus) beyond the brief. This system **redesigns** the surface dark-first per the brief and consolidates to the three core tabs.
- **Parent brand** — Transmit Security (logo in `uploads/Screenshot 2026-05-10 at 18.59.06.png`). The Tracker is an internal employee tool, not customer-facing, so brand fidelity is loose: it borrows the wordmark for the about-screen and a dark navy as a tertiary accent, but otherwise establishes its own visual identity inspired by Linear, Raycast, and Arc.

## Index

- `README.md` — this file (context, content, visual foundations, iconography)
- `colors_and_type.css` — every token, ready to import
- `fonts/` — webfonts (Geist Sans, Geist Mono, Inter Tight)
- `assets/` — logos, app icon, lucide sprite, Slack/Jira marks
- `preview/` — design-system cards (registered)
- `ui_kits/tracker/` — interactive recreation of the Tracker (3 tabs, header, detail pane, states)
- `SKILL.md` — Agent Skills entrypoint

---

## CONTENT FUNDAMENTALS

The Tracker is a **tool, not a product**. Copy is mechanical and lowercase-ish; it never sells, explains, or onboards.

**Voice.** Terse, present-tense, lowercase metadata, sentence-case headings. No exclamation marks. No emoji in product chrome (emoji from Slack messages render as authored — they are content, not UI). The app addresses the user as **you** only when an action is needed (e.g. "add a Jira account to start"); the rest of the time it just states facts.

**Casing.**
- Tab labels: `Assigned`, `Mentioned`, `Slack` — sentence case, single words where possible.
- Stat labels: lowercase — `open`, `blockers`, `mentions`.
- Buttons: sentence case — `Open in Jira`, `Refresh`, `Mark read`.
- Status pills: as authored by the source system — `In Progress`, `In Review`, `Done`.
- Time strings: lowercase, abbreviated — `2m ago`, `3h ago`, `4d ago`, `just now`, `updated 12s ago`.
- Numbers: tabular-nums everywhere they appear in lists or stats.

**I vs you.** Defaults are about *me* (the user). The header reads `Yours, today` not `Your dashboard`. Empty states use first person: `nothing assigned to you`, `you're all caught up`. Avoid "we" — the app is not a person.

**Examples (do).**
- `12 open · 2 blockers · 3 mentions` — header summary
- `PCR-832 · just now · In Review` — issue row meta
- `you're all caught up — last sync 14s ago` — empty Slack state
- `couldn't reach Jira — retry` — error state, no period

**Examples (don't).**
- `Welcome back! 👋 Here's what's on your plate today.` — chatty, salesy
- `0 New Mentions` — title-cased, redundant capitalization
- `Click here to refresh your data.` — directive, over-explained

**Vibe.** Cockpit. The user is a pilot scanning instruments. Numbers should read like gauges; rows like radar contacts. If a sentence could be trimmed to a fragment without losing meaning, trim it.

---

## VISUAL FOUNDATIONS

### Color
Dark-first. There is one **canvas** color, three **surface** elevations, and a **single accent** (violet-indigo) reserved for selection and links. Status and priority each have their own scale. Light mode exists but is secondary — see `colors_and_type.css`.

- Canvas `#0B0B0F` — true near-black with a faint cool cast (oklch-tuned, not pure #000)
- Surface `#131319` — cards, the detail pane, modal sheets
- Surface raised `#1B1B23` — hovered rows, popovers
- Hairline `#23232C` — 1px borders between rows
- Foreground primary `#E7E7EE`
- Foreground muted `#9A9AA7`
- Foreground subtle `#5C5C68` — timestamps, key counts
- Accent `#8B7BFF` (selection, links, focus rings) — used sparingly
- Accent halo `oklch(70% 0.18 285 / 0.16)` — selection background

**Priority palette** (the one place color SHOUTS):
- Blocker — `#FF4D5A` with a 4px inset glow. Always pulses on first paint.
- Critical — `#FF8A3D`. Solid dot, no glow.
- Major — `#F5C24A`. Slightly muted to keep the tier below Critical legible.
- Minor — `#5DA9FF`.
- Trivial — `#5C5C68`.

**Status palette** is desaturated on dark: greens, blues, violets at ~25% sat, never neon.

### Type
- **Geist Sans** for UI (400/500/600). Negative -0.005em tracking on body, -0.015em on numerics.
- **Geist Mono** for keys, IDs, timestamps, counts. Mono is a *signal* — it means "machine data."
- **Inter Tight** — fallback display for the rare large stat (the cockpit number on empty/loading screens).

Scale (px / line-height):
- 11/14 — meta, time, key counts
- 12/16 — body row text, button labels (this is the workhorse)
- 13/18 — detail pane body
- 14/20 — header title, modal headings
- 18/22 — large stats in summary bar
- 28/32 — empty-state cockpit number

Never below 11px. Numerics use `font-feature-settings: "tnum", "ss01"`.

### Spacing
4-based. The design rarely uses anything bigger than 16px because density matters.
`space-1: 4px · space-2: 8px · space-3: 12px · space-4: 16px · space-5: 20px · space-6: 24px`

Row vertical padding: 10px. Tab vertical padding: 8px. Content gutter: 16px. Detail pane gutter: 16px.

### Backgrounds
**Flat.** No gradients, no images, no textures. The canvas is one dark color, full-bleed. The closest the system gets to ornament is the priority halo on a Blocker row (a 1px inset red ring) and the focus ring on the selected row (1px violet inset).

### Animation
Snappy, minimal, **120–180ms** ease-out for almost everything. The exceptions:
- Tab change: cross-fade 80ms (no slide, no parallax — content swap)
- Refresh spinner: 600ms linear loop
- Blocker pulse: 1.6s ease-in-out infinite alternate, opacity 1 → 0.55 on the dot only
- Hover on row: instant background color change, no transition

Easing variable: `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)` (Linear-style snappy).

### States
- **Hover**: row background goes from `transparent` to `--surface-raised` (#1B1B23). No translate, no shadow. Cursor is `default` for rows, `pointer` for keys/links.
- **Active/press**: 60ms dip — background `#15151B`, no scale.
- **Focus** (keyboard): 1px inset accent ring, 2px offset shadow `0 0 0 2px color-mix(in oklab, var(--accent) 30%, transparent)`.
- **Selected** (keyboard nav): full-width accent halo (`--accent-halo`) with a 2px-wide accent bar on the left edge.
- **Disabled**: 40% opacity, `cursor: not-allowed`, no hover change.

### Borders & radii
- Hairlines `1px solid #23232C` between rows. Never solid block borders inside content.
- Card radius `8px`. Pill radius `999px`. Input radius `6px`. Button radius `6px`. Modal radius `12px`.
- No drop shadows on flat dark surfaces. The detail pane uses a `1px` left border, not a shadow.
- Modals use a single soft shadow: `0 16px 48px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)` over a 60% backdrop blur.

### Transparency & blur
- Modal backdrop: `rgba(11, 11, 15, 0.6)` + 12px backdrop-blur.
- Title bar: 60% canvas + 20px backdrop-blur (macOS vibrancy approximation, falls back to opaque on non-Mac).
- Selection halo: 14% accent over surface — never fully opaque.
- Otherwise the design is opaque. Blur is reserved for "overlay" surfaces, never for chrome inside a flat surface.

### Layout
- Title bar is 28px tall, drag region everywhere except the right cluster of controls. Traffic lights live in the top-left native chrome.
- Stats bar is 56px tall, 5 fixed-width cells separated by hairlines.
- Tabs bar is 36px tall.
- Row min-height 36px. Slack mention card min-height 56px (two lines).
- Detail pane is 320px wide on the right when open; the list flexes.
- App resizes down to 540×420 gracefully — stats bar drops labels, tabs become icons, detail pane stacks below the list.

### Shadows
**Inner** shadows are forbidden in chrome (they read as bevels). The only shadow used:
- `--shadow-modal: 0 16px 48px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)`
- `--shadow-popover: 0 8px 24px rgba(0,0,0,0.5)`

### Imagery
There is none. This app shows no photos, no illustrations, no avatars beyond Slack-colored 2-letter initials. The Transmit logo appears once in the About panel and never anywhere else.

---

## ICONOGRAPHY

The app prefers **typographic glyphs** over icons. A row's priority is a colored 8px dot, not an icon. A status is a pill of text. This keeps the surface calm.

Where icons are needed (header refresh, tab marks, detail-pane close, "open external"), the system uses **Lucide** (1.5px stroke, 16×16 in chrome, 14×14 in dense rows). Lucide is loaded from CDN as an SVG sprite (`assets/lucide.sprite.svg` — a curated subset to avoid network calls):

- `refresh-cw` — header sync
- `arrow-up-right` — open external
- `x` — close
- `chevron-right` — disclosure
- `search` — command bar
- `filter` — filter pill
- `circle-dot` — focus indicator
- `bell` — mention indicator
- `at-sign` — Slack mention card

**Brand marks** (Jira, Slack, Confluence) are used at small sizes inside tab labels and in the detail pane header. They live in `assets/marks/` as monochrome SVGs that inherit `currentColor` so they tint with the foreground.

**Emoji** appear only when authored in user content (a Slack message, a Jira summary). They never appear in app chrome.

**Unicode glyphs**: the existing codebase used `◆ ◉ ◈ ◷` as cheap tab icons. The redesign drops these in favor of monochrome Lucide marks — they read as decorative noise on a dark, dense surface. The `↗` arrow for "external link" stays, because it pairs naturally with mono link text.

---

## NOTES & SUBSTITUTIONS

- **Geist Sans / Geist Mono** are loaded from `fonts/`. If the host environment can't load them, the system falls back to `-apple-system, "SF Pro Text"` and `"SF Mono", ui-monospace`. Geist is open-source (Vercel) so it's the right Linear-feel match without copying Inter.
- **Inter Tight** is used only for the empty-state cockpit number; not strictly required.
- The original codebase ships **no design tokens** — Tailwind utility classes are used directly. This system extracts the implicit tokens into named variables and inverts the color space for dark-mode-first.
