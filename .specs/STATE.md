# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | One Postgres database and no session. A later login is a separate feature. | The app is one local owner. Every caller who can open port 4317 is that owner until a feature adds accounts. | superseded by AD-005 | 2026-10-07 |
| AD-005 | One Postgres database holds many contas. A request that reads or writes impressoras or projetos carries a sessao for one conta. The `sessao` cookie is HttpOnly, SameSite=Lax, Path=/, and not Secure while the app is HTTP on 4317. | The owner asked on 2026-10-08, in `.design/login.md`, for separate accounts before any URL off this machine. `Secure` would drop the cookie on this HTTP port. | active | 2026-10-08 |
| AD-002 | Postgres has no published host port. Only the app publishes 4317. | The database credential is a dev default. Publishing 5432 would expose it on the LAN. | active | 2026-10-07 |
| AD-003 | Values the user types stay text until `parseDecimal` or `parseInteger`. They are not stored as SQL numbers. | Empty, zero and an invalid token are different field states. A numeric column collapses them. | active | 2026-10-07 |
| AD-004 | A project is either one print or a list of mesas, never both. Each mesa stores that plate's time and one filament on the mesa itself. | Without CFS or AMS, several plates are one product. A shared filament row is the backlog stock item. Storing colors and mesas together would make the next read ambiguous. | active | 2026-10-08 |
| AD-006 | The admin does not read or edit another conta's impressoras, projetos, or settings. The admin only lists the other emails to reset that password. | The owner said `admin não vê` on 2026-10-08. A later feature must not add an admin bypass over those rows. | active | 2026-10-08 |

## Handoff

**Feature**: login
**Where**: C1–C61 done. Verification PASS, round 2, profile light, range `190e32c..b1dc690`.
**In progress**: none
**Next step**: none
**Blockers**: none. Admin does not read other contas — Confirmed? y, AD-006
**Uncommitted**: none
**Branch**: main
