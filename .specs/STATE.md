# Project state

## Decisions

### AD-001

- Status: superseded by AD-005
- Date: 2026-10-07
- Decision: One Postgres database and no session. A later login is a separate feature.
- Rationale: The app is one local owner. Every caller who can open port 4317 is that owner until a feature adds accounts.

### AD-002

- Status: active
- Date: 2026-10-07
- Decision: Postgres has no published host port. Only the app publishes 4317.
- Rationale: The database credential is a dev default. Publishing 5432 would expose it on the LAN.

### AD-003

- Status: active
- Date: 2026-10-07
- Decision: Values the user types stay text until `parseDecimal` or `parseInteger`. They are not stored as SQL numbers.
- Rationale: Empty, zero and an invalid token are different field states. A numeric column collapses them.

### AD-004

- Status: active
- Date: 2026-10-08
- Decision: A project is either one print or a list of mesas, never both. Each mesa stores that plate's time and one filament on the mesa itself.
- Rationale: Without CFS or AMS, several plates are one product. A shared filament row is the backlog stock item. Storing colors and mesas together would make the next read ambiguous.

### AD-005

- Status: active
- Date: 2026-10-08
- Decision: One Postgres database holds many contas. A request that reads or writes impressoras or projetos carries a sessao for one conta. The `sessao` cookie is HttpOnly, SameSite=Lax, Path=/. Whether it is Secure is AD-007.
- Rationale: The owner asked on 2026-10-08, in `.design/login.md`, for separate accounts before any URL off this machine. `Secure` on every response would drop the cookie on HTTP port 4317.

### AD-006

- Status: active
- Date: 2026-10-08
- Decision: The admin does not read or edit another conta's impressoras, projetos, or settings. The admin only lists the other emails to reset that password.
- Rationale: The owner said `admin não vê` on 2026-10-08. A later feature must not add an admin bypass over those rows.

### AD-007

- Status: active
- Date: 2026-10-08
- Decision: The `sessao` cookie is `Secure` only when the request host, port removed and lowercased, equals `ORIGEM_PUBLICA`. Any other host, and an empty `ORIGEM_PUBLICA`, omit `Secure`. Clearing the cookie uses the same bit.
- Rationale: Tailscale Funnel terminates TLS and proxies HTTP to 127.0.0.1:4317, preserving the public Host. The socket scheme is HTTP for the house and for the public name, so it cannot choose `Secure`. The owner confirmed `.design/url-publica.md` on 2026-10-08.

### AD-008

- Status: active
- Date: 2026-10-08
- Decision: The public name is Tailscale Funnel to 127.0.0.1:4317. The node name is `calculadora`. Postgres has no host port. The router does not forward 4317. The process on 4317 is the built app. A new conta is only admin `incluir` on `/usuarios`.
- Rationale: The owner confirmed `.design/url-publica.md` on 2026-10-08: no purchased domain, this PC when it is on, no public signup.

### AD-009

- Status: active
- Date: 2026-10-26
- Decision: The client is the name and phone stored on `projeto`, both empty text allowed. There is no `cliente` table. A later feature must not add a shared client row unless the owner asks for one phone that changes in one place across lotes. The orçamento is a reading of the calculator and `projeto` stores no total.
- Rationale: The owner confirmed `.design/orcamento.md` on 2026-10-26. A shared client, or a total column, would freeze or fan out data the list still recomputes from the printer tariff.

### AD-010

- Status: active
- Date: 2026-10-27
- Decision: The coeficiente is text on `impressora`, empty meaning zero. It scales only the money total of peça and lote: the closed sum divided by (1 − coefficient/100). Material, energy, depreciation, labor, minutes and grams stay unscaled. A later feature that adds cost adds it to that sum before the coefficient, and must not scale the displayed lines or store the total on `projeto`.
- Rationale: The owner confirmed `.design/coeficiente.md` on 2026-10-26. Scaling the lines would make material stop being grams times price. A coefficient on `projeto` would stop the list from following the printer.

### AD-011

- Status: active
- Date: 2026-10-29
- Decision: Purge grams per swap are text on `projeto`, empty meaning zero. On a multicolor print they are reais on each incoming color: max(0, N−1) swaps, and the weight line stays the typed color grams. Mesas and single color do not read the text. A later feature must not move this number onto `impressora`, add a per-swap field, put the grams on the weight line, or store the total on `projeto`.
- Rationale: The owner confirmed `.design/purge.md` on 2026-10-29, including decision 5: the field is optional because he will not always have a value. A printer default or a weight that includes purge would price a print he left empty, or stop the weight being the typed grams.

## Handoff

**Feature**: purge
**Where**: Plan only. `.design/purge.md` marked confirmed. No `checks.md`. No app code.
**In progress**: none
**Next step**: owner reviews the plan
**Blockers**: none
**Uncommitted**: none
**Branch**: cursor/purge-plan-e98a
