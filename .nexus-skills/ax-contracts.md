# NEXUS Agent Experience & State Contracts (AX)

## 1. Domain Model Contracts
- **Couple Identity**:
  - `Egor`: HSE master's student, Software Engineer, accounts: T-Bank, Alfa, WB Bank (Wildberries Wallet), Gazprombank, Joint Account.
  - `Anya`: RUDN Online student, Leader of «Я-Профессионал» (Federal Leader DFO: Far Eastern Federal District +7h timezone; Regional Leader CFO: Central Federal District), accounts: Sber (SberPrime / SberSpasibo), Joint Account.
- **Timezone Sync Contract**:
  - Dual clock: Moscow (MSK, UTC+3) and Vladivostok/Khabarovsk (DFO, UTC+10, MSK+7) for scheduling coordination.
- **Offline-First Persistence**:
  - Zustand with `persist` middleware in `localStorage` ensuring instant readiness without external services.
  - Optional Supabase sync with public anon RLS policies and ready-to-run SQL schema.
- **Audio Synthesis Contract**:
  - Built-in Cozy Lofi & rain sound generator via Web Audio API (`AudioContext`, pink/brown noise filters, soft sine wave harmonic chimes), 100% pure client-side code without external mp3 downloads.
