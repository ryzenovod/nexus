# NEXUS Visual DNA & Design System

## 1. Aesthetic Core: Dark Glassmorphism + Linear / Raycast Precision
NEXUS combines the aesthetic of desktop widgets (Übersicht / macOS Sequoia glass) with high-density productivity tools like Linear and Raycast.

### Container & Surfaces
- **App Canvas:** `#0b0d11` deep void background with subtle radial gradient accents (`rgba(56, 189, 248, 0.03)` top-left, `rgba(245, 158, 11, 0.03)` top-right).
- **Glass Panes / Cards Background:** `rgba(15, 17, 21, 0.78)` with `backdrop-filter: blur(28px) saturate(180%)` and `-webkit-backdrop-filter: blur(28px) saturate(180%)`.
- **Card Border:** `1px solid rgba(255, 255, 255, 0.08)` default; hover state scales border to `rgba(255, 255, 255, 0.16)`.
- **Shadows:** Multi-layer soft elevation: `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05) inset`.

---

## 2. Signature Indicator Brackets (Exact Replica & Upgrade from Übersicht Widget)
Every card in NEXUS features an iconic left-edge indicator bracket (`border-left: 3.5px solid <color>`, `border-top-left-radius: 10px`, `border-bottom-left-radius: 10px`):

1. **`critical / group` (Red Bracket):**
   - Left border: `#ef4444` (bright crimson)
   - Background gradient: `linear-gradient(90deg, rgba(127, 29, 29, 0.28) 0%, rgba(15, 17, 21, 0.8) 100%)`
   - Glow / box-shadow: `0 0 12px rgba(239, 68, 68, 0.18)`
   - Used for: urgent bills, "Коммунальные", overdue tasks, high priority alerts.

2. **`active / home` (Neon Green Bracket):**
   - Left border: `#22c55e` (vibrant emerald neon)
   - Background gradient: `linear-gradient(90deg, rgba(34, 197, 94, 0.14) 0%, rgba(15, 17, 21, 0.8) 100%)`
   - Glow / box-shadow: `0 0 12px rgba(34, 197, 94, 0.15)`
   - Used for: home improvement (bathroom, balcony, kitchen, room), active domestic tasks.

3. **`finance / bill` (Amber / Gold Bracket):**
   - Left border: `#eab308` (amber gold)
   - Background gradient: `linear-gradient(90deg, rgba(234, 179, 8, 0.14) 0%, rgba(15, 17, 21, 0.8) 100%)`
   - Glow / box-shadow: `0 0 12px rgba(234, 179, 8, 0.15)`
   - Used for: ЕПД mos.ru, Mosenergosbyt, Domiland, cashback, budgeting, bank transfers.

4. **`neutral / Someday` (Steel Gray / Cyan Bracket):**
   - Left border: `#64748b` (cool slate) or `#06b6d4` (subtle cyan for study)
   - Background gradient: `linear-gradient(90deg, rgba(100, 116, 139, 0.1) 0%, rgba(15, 17, 21, 0.8) 100%)`
   - Used for: wishlist items with question marks ("Тарелки плоские?"), someday ideas, backlog notes.

---

## 3. Dynamic States & Highlights

### Day Column: «СЕГОДНЯ» (Today)
- **Active Border:** `1px solid rgba(245, 158, 11, 0.5)`
- **Atmospheric Glow:** `box-shadow: 0 0 24px rgba(245, 158, 11, 0.12), inset 0 0 12px rgba(245, 158, 11, 0.05)`
- **Header Badge:** Amber-orange pill `СЕГОДНЯ` with pulsing dot `bg-amber-400`.

### Status Badges:
- **`[ПРОСРОЧЕНО]` (Overdue):**
  - Background: `rgba(239, 68, 68, 0.2)`
  - Border: `1px solid rgba(239, 68, 68, 0.45)`
  - Text: `#fca5a5`, uppercase, `font-mono tracking-wider font-semibold text-[10px]`
- **User Assignee Badges:**
  - **Егор:** Indigo/Blue badge with monogram `E` (`bg-indigo-500/20 text-indigo-300 border-indigo-500/30`)
  - **Аня:** Rose/Pink badge with monogram `A` (`bg-rose-500/20 text-rose-300 border-rose-500/30`)
  - **Вместе (Together):** Violet gradient badge `E+A` (`bg-purple-500/20 text-purple-300 border-purple-500/30`)

### Spotlight Cursor Effect
- Every card tracks mouse coordinates `(x, y)` on `onMouseMove` to draw a subtle radial spotlight gradient:
  `background: radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 80%)`
