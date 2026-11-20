# I’ll Try Anything Once

> *a sonic diary & visual sketchbook by zee*

Visual scraps, nocturnal thoughts, and small things keeping me sane.

---

## Overview

**I’ll Try Anything Once** is a minimalist personal editorial blog and sonic diary web application. Inspired by physical zines, analog field notes, and hand-stitched textures, it blends long-form reflective writing with an integrated Web Audio ambient soundtrack and live music scrobbling.

## Features

- **Botanical & Dreamy Aesthetic**: Calm sage (`#537E60`), soft celadon (`#E6EFE2`), and forest ink (`#1E2E24`) palette with serif typography (Newsreader & Plus Jakarta Sans).
- **Strict Zero-Emoji Design**: Pure typography paired with clean, minimal 1.5px stroke geometric line-art SVGs.
- **Quick Tags & Sequential Numbering**:
  - `might delete later` with dynamic chronological sequence numbering (`#01`, `#02`, `#03`...) without gaps.
  - Category filters: `nocturnal thoughts`, `rants`, `brain dump`, `tiny wins`, `field notes`, `slow afternoons`.
- **Sonic Diary / Ambient Audio**: Synthesizer audio engine (`Web Audio API`) providing customizable soundscapes (Tape Warmth, Analog Drift, Spring Reverb, Wind Chimes, Vinyl Rain, Midnight Air).
- **Live "Now Playing" Widget**: Real-time track detection via Last.fm API with graceful fallback to saved favorites.
- **Supabase Cloud Sync**:
  - Live entries synced to Cloud Postgres (`public.posts`).
  - Live status widget synced to `public.site_status`.
  - Offline-first resilience with local starter entries fallback.
- **Author Mode**:
  - Clean public view by default (all author controls hidden).
  - Unlocked by triple-clicking the masthead star icon (or pressing `Ctrl/Cmd + Shift + E`) with Supabase Author Authentication.
- **Location-Free Privacy**: Completely privacy-focused with zero location data.

## Project Structure

```
├── index.html        # Main application structure & semantic layout
├── style.css         # Botanical green design system & editorial typography
├── posts.js          # Default starter journal entries (offline/seed fallback)
├── js/
│   ├── app.js        # Core UI controller, filters, modals, and author state
│   ├── data.js       # Data layer & Supabase live synchronization
│   └── synth.js      # Web Audio API procedural ambient soundscapes
└── .gitignore        # Git ignore rules
```

## Getting Started

To run locally:

```bash
# Using Python
python -m http.server 8080

# Or using Node.js
npx serve
```

Visit `http://localhost:8080` in your browser.

## Author Controls

- **Accessing Author Mode**: Triple-click the 4-point star icon next to the masthead title, or press `Ctrl + Shift + E` (`Cmd + Shift + E` on macOS).
- **Sign In**: Enter your Supabase author credentials to reveal entry writing, editing, and database sync tools.
