# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | One Postgres database and no session. A later login is a separate feature. | The app is one local owner. Every caller who can open port 4317 is that owner until a feature adds accounts. | active | 2026-10-07 |
| AD-002 | Postgres has no published host port. Only the app publishes 4317. | The database credential is a dev default. Publishing 5432 would expose it on the LAN. | active | 2026-10-07 |
| AD-003 | Values the user types stay text until `parseDecimal` or `parseInteger`. They are not stored as SQL numbers. | Empty, zero and an invalid token are different field states. A numeric column collapses them. | active | 2026-10-07 |
| AD-004 | A project is either one print or a list of mesas, never both. Each mesa stores that plate's time and one filament on the mesa itself. | Without CFS or AMS, several plates are one product. A shared filament row is the backlog stock item. Storing colors and mesas together would make the next read ambiguous. | active | 2026-10-08 |

## Handoff

**Feature**: mesas
**Where**: C1–C47 built. Proofs green. Awaiting the Verifier.
**In progress**: none
**Next step**: Verifier over the feature range, profile light
**Blockers**: none
**Uncommitted**: the mesa build, until the feature commit lands
**Branch**: main
