# Google EGM (Elephant-Goldfish Model) Protocol for NEXUS

## 1. Overview
The Elephant-Goldfish Model (EGM) balances long-horizon context retention (Elephant) with rigorous, context-reset scrutiny (Goldfish):
- **Elephant Planner (Long Memory)**: Retains the entire architecture, domain logic, couple preferences, and technical stack across modules. Formulates explicit specifications in `docs/EGM_SPEC.md`.
- **Coding Engine**: Delivers 100% complete, rich, production-grade code with zero stubs, zero `// TODO`, and zero cut mocks.
- **Goldfish Independent Reviewer (Zero Bias)**: Evaluates completed code against specifications with fresh inspection: verifies type safety, responsiveness, UI polish, edge cases, and lack of dummy implementations.

## 2. Mandatory Workflow Cycles
1. **Spec Creation**: Maintain `docs/EGM_SPEC.md` as the single source of architectural truth.
2. **Implementation**: Build modules with total completion.
3. **Goldfish Review Pass**:
   - Check 1: Are there any empty stubs or unhandled branches? (Must be 0)
   - Check 2: Are all data fields from Egor & Anya's real life present? (Must be 100%)
   - Check 3: Does TypeScript compile with 0 warnings/errors? (Strict mode)
   - Check 4: Does the UI match the Starry Twilight + Cyber-Cat aesthetic?
