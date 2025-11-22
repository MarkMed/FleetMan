# Mappers

Purpose
- This folder contains pure transformation functions (mappers/adapters) that convert UI form shapes or internal models into API contract shapes and vice versa.

When to add files here
- Add stateless mapping functions (e.g. `mapRegisterFormToRequest`) that translate between UI view-models and SSOT API contracts.
- Keep logic simple and deterministic — no side effects, network calls, or store mutations.

Recommended structure
- `authMapper.ts` — auth-related mappers (register, login adapters).
- `index.ts` — barrel export for easy imports.

Why centralize
- Centralizing mappings prevents duplicated transformation logic across hooks, viewmodels, and services, making it easier to maintain SSOT and satisfy TypeScript contracts.
