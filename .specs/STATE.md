# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | One Postgres database and no session. A later login is a separate feature. | The app is one local owner. Every caller who can open port 4317 is that owner until a feature adds accounts. | active | 2026-10-07 |
| AD-002 | Postgres has no published host port. Only the app publishes 4317. | The database credential is a dev default. Publishing 5432 would expose it on the LAN. | active | 2026-10-07 |
| AD-003 | Values the user types stay text until `parseDecimal` or `parseInteger`. They are not stored as SQL numbers. | Empty, zero and an invalid token are different field states. A numeric column collapses them. | active | 2026-10-07 |

## Handoff

**Feature**: modelo-suico
**Where**: C1–C58 closed at `7c40d7d`
**In progress**: none
**Next step**: independent verification of `.specs/features/modelo-suico` over `14f11ce..HEAD`
**Blockers**: none
**Uncommitted**: none of this feature
**Branch**: main
