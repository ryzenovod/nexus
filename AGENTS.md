# NEXUS Agent & Design System Contract (AGENTS.md)

This contract defines the architecture, design guidelines, and code standards for **NEXUS** (Couple Life OS for Egor & Anya). All coding agents working on this project must strictly comply with these rules.

---

## 1. Anti-AI-Slop Visual Standards (from `ui-redesign` & `design-system`)

### A. Color Palette & Surfaces (Obsidian / Linear / Raycast Style)
- **Base Background**: Strict `#09090b` (`zinc-950`).
- **Canvas / Ambient Stars**: Delicate, silver-monochrome (`opacity: 0.25`), subtle depth only. **BANNED**: Purple/pink neon fog, magenta horizons, and chromatic glowing nebulae.
- **Surfaces**: `rgba(18, 18, 21, 0.78)` with `backdrop-filter: blur(24px)` and borders `1px solid rgba(255, 255, 255, 0.07)`.
- **Card Aesthetics**:
  - Left indicator: strictly thin `3px` colored bracket (`border-left: 3px solid`):
    - Critical / overdue: `#ef4444` (red)
    - Active / home repairs: `#22c55e` (emerald)
    - Finance / bills: `#eab308` (amber)
    - Neutral / someday: `#71717a` (zinc)
  - Card background: flat translucent obsidian `rgba(24, 24, 27, 0.6)`. **BANNED**: Colored gradient fills and colored glowing outer shadows.
- **Buttons**:
  - Primary Action (`+ Задача`): High-contrast `bg-zinc-100 text-zinc-950 hover:bg-white font-medium shadow-sm`.
  - Secondary: `bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] border border-white/[0.08]`.
  - Active Tab: Neutral matte pill `bg-white/[0.08] text-zinc-100 border border-white/[0.08]`. **BANNED**: Gradient underline sticks and colored lines under tabs.

### B. Typography & Micro-Badges
- **Font Stack**: Clean system sans (Inter/Geist feel) with `tabular-nums` for currency, counters, and dates.
- **Headings & Buttons**: Sentence case only. No all-caps shouty text.
- **Micro-Badges**: Calm monochrome (`bg-white/[0.04] text-zinc-400 text-[11px] font-normal border border-white/[0.06]`).
- **Assignee Indicators**: Subtle neutral tags (`Егор` / `Аня` / `Вместе`) without loud colored blocks.

### C. Information Architecture & Density
- **Top Navigation**: Exactly 4 clean top-level tabs:
  1. `Центр управления` (`command-center`) — Week Planner + 4-Column Flat Inbox
  2. `Финансы и ЖКХ` (`finances`) — Moscow Utilities, Domiland, Mosenergosbyt, Cashback Matrix
  3. `Вишлист и Дом` (`wishlist`) — Couple Wishlist voting + Interactive Apartment Blueprint
  4. `Учеба и Проекты` (`study-work`) — HSE / RUDN / Ya-Profi Kanban + RF Radar ЦФО⇄ДФО + Academic .ics Tracker + Compact Focus Timer
- **High-Density Inbox**:
  - Default mode: **«Плоская сетка (4 колонки)»** (`isSmartGrouped: false`).
  - Compact padding (`py-2 px-3`) allowing 30–40 tasks on screen at once.
- **Header**:
  - Consolidated typographic status line (`МСК 12:43 · ДФО 19:43`, sync status, couple level, joint balance) with clean vertical dividers `border-white/[0.08]`.
  - Minimalist monochrome vector mascot (Raycast / Arc style, no radioactive purple halos).

---

## 2. Engineering Guidelines
- **Zero TODO / Zero Mock Stubs**: Write complete, working code for every component.
- **Offline-First Persistence**: Zustand with `localStorage` fallback ensures instant startup with zero configuration.
- **Direct Telegram Client Bridge**: Direct browser fetch to `https://api.telegram.org` without intermediate servers.
- **Procedural Sound Engine**: Pure Web Audio API synthesizers (`soundEffects.ts`) with zero external audio assets.
