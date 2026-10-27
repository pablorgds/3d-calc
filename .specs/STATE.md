# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | One Postgres database and no session. A later login is a separate feature. | The app is one local owner. Every caller who can open port 4317 is that owner until a feature adds accounts. | superseded by AD-005 | 2026-10-07 |
| AD-005 | One Postgres database holds many contas. A request that reads or writes impressoras or projetos carries a sessao for one conta. The `sessao` cookie is HttpOnly, SameSite=Lax, Path=/. Whether it is Secure is AD-007. | The owner asked on 2026-10-08, in `.design/login.md`, for separate accounts before any URL off this machine. `Secure` on every response would drop the cookie on HTTP port 4317. | active | 2026-10-08 |
| AD-002 | Postgres has no published host port. Only the app publishes 4317. | The database credential is a dev default. Publishing 5432 would expose it on the LAN. | active | 2026-10-07 |
| AD-003 | Values the user types stay text until `parseDecimal` or `parseInteger`. They are not stored as SQL numbers. | Empty, zero and an invalid token are different field states. A numeric column collapses them. | active | 2026-10-07 |
| AD-004 | A project is either one print or a list of mesas, never both. Each mesa stores that plate's time and one filament on the mesa itself. | Without CFS or AMS, several plates are one product. A shared filament row is the backlog stock item. Storing colors and mesas together would make the next read ambiguous. | active | 2026-10-08 |
| AD-006 | The admin does not read or edit another conta's impressoras, projetos, or settings. The admin only lists the other emails to reset that password. | The owner said `admin não vê` on 2026-10-08. A later feature must not add an admin bypass over those rows. | active | 2026-10-08 |
| AD-007 | The `sessao` cookie is `Secure` only when the request host, port removed and lowercased, equals `ORIGEM_PUBLICA`. Any other host, and an empty `ORIGEM_PUBLICA`, omit `Secure`. Clearing the cookie uses the same bit. | Tailscale Funnel terminates TLS and proxies HTTP to 127.0.0.1:4317, preserving the public Host. The socket scheme is HTTP for the house and for the public name, so it cannot choose `Secure`. The owner confirmed `.design/url-publica.md` on 2026-10-08. | active | 2026-10-08 |
| AD-008 | The public name is Tailscale Funnel to 127.0.0.1:4317. The node name is `calculadora`. Postgres has no host port. The router does not forward 4317. The process on 4317 is the built app. A new conta is only admin `incluir` on `/usuarios`. | The owner confirmed `.design/url-publica.md` on 2026-10-08: no purchased domain, this PC when it is on, no public signup. | active | 2026-10-08 |
| AD-009 | The client is the name and phone stored on `projeto`, both empty text allowed. There is no `cliente` table. A later feature must not add a shared client row unless the owner asks for one phone that changes in one place across lotes. The orçamento is a reading of the calculator and `projeto` stores no total. | The owner confirmed `.design/orcamento.md` on 2026-10-26. A shared client, or a total column, would freeze or fan out data the list still recomputes from the printer tariff. | active | 2026-10-26 |
| AD-010 | The coeficiente is text on `impressora`, empty meaning zero. It scales only the money total of peça and lote: the closed sum divided by (1 − coefficient/100). Material, energy, depreciation, labor, minutes and grams stay unscaled. A later feature that adds cost adds it to that sum before the coefficient, and must not scale the displayed lines or store the total on `projeto`. | The owner confirmed `.design/coeficiente.md` on 2026-10-26. Scaling the lines would make material stop being grams times price. A coefficient on `projeto` would stop the list from following the printer. | active | 2026-10-27 |

## Handoff

**Feature**: coeficiente
**Where**: C1–C47 closed at `9ea2f96ab972c74a4f2020e27ddf6fef3ea8ea49`. Verifier PASS. `validate_verification.py coeficiente` exited 0.
**In progress**: none
**Next step**: the owner reviews the first quote with coefficient `20` after the app on port 4317 is rebuilt. The process there is still the previous image.
**Blockers**: none
**Uncommitted**: `compose.yaml` `ORIGEM_PUBLICA` stays out of the feature.
**Branch**: main
