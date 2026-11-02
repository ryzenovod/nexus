# NEXUS Motion Physics & Cross-Platform Guidelines

## 1. Framer Motion Physics Engine
All interactive elements, drag-and-drop transitions, and layout transformations follow Apple / Linear spring curves:

```typescript
export const nexusSpring = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.9,
};

export const gentleSpring = {
  type: "spring",
  stiffness: 240,
  damping: 24,
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 4 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
};
```

### Drag-and-Drop & Layout Animation:
- Cards preserve continuous identity across views using `layoutId={`task-${task.id}`}`.
- Dragging from "Входящие и без срока" into day columns recalculates targets with `@dnd-kit/core` and updates state with immediate optimistic feedback.
- Completed task toggle triggers celebratory haptic motion and micro-confetti for high-priority items.

---

## 2. Multi-Device Responsive Architecture

### Devices Target Matrix:
1. **MacBook Air M4 (Егор):**
   - High DPI desktop screen (13" / 15"). Full multi-column view: 7 columns of days + 4-column compact glass grid for Inbox.
   - Hotkeys: `Cmd+K` (Command Palette), `1-5` (Module switching), `N` (Quick task), `/` (Instant search).
   - Übersicht Desktop Mode (`?mode=widget`): hides outer padding, sets root background to transparent, expands cards to fit desktop layout.

2. **iPhone 15 Pro Max (Егор):**
   - iOS Dynamic Island & Home Bar padding (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).
   - Touch gestures: horizontal swipe to complete/reschedule tasks, bottom floating glass dock for quick navigation.
   - PWA meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`.

3. **Windows Laptop (Аня):**
   - Full keyboard support with `Ctrl+K`.
   - Crisp scrollbars (`scrollbar-thin scrollbar-thumb-white/10`).
   - Browser compatibility: Edge & Chrome hardware acceleration.

4. **Samsung A80 (Аня):**
   - Full-bleed Android display with rounded corners and bottom system navigation bar avoidance.
   - Touch targets minimum 44x44px.
   - Fast tap response (`touch-action: manipulation`).

---

## 3. Offline-First & Supabase Zero-Config Strategy
- **Zustand with `persist` + `localStorage` / `IndexedDB`**: The system is 100% functional immediately upon opening the page, with zero API keys required.
- **Supabase Cloud Sync (Optional Toggle in UI)**:
  - Users can enter their Supabase URL & Anon Key in the Settings modal.
  - Generates ready-to-paste PostgreSQL schema migrations (`tables: tasks, finances, wishlist, study`).
  - Automatically merges offline mutations when internet reconnects.
