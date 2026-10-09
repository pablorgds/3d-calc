# URL pública verification

**Verdict**: PASS
**Profile**: light
**Diff range**: 241b8d2..9c8eaea
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

Profile `light` skips step 1 (binding sources), the Coverage recompute, Test policy verdicts, and fault injection. Those sections are omitted on purpose. `checks.md` has no `Test policy` section.

Proofs ran at `9c8eaeaa49a24d371fa3be1e1a69fd1e0e59da53` (`git rev-parse HEAD`). Base `241b8d2cc1090ef937a3a9c4b7c9b1ab38180ee6`.

One invocation:

`node --experimental-strip-types --test src/lib/entrar.test.ts src/lib/compose.test.ts src/lib/docs-banco.test.ts`

Exit 0. `tests 71`, `pass 71`, `fail 0`, `duration_ms 20116.6792`. Every named proof below printed `✔` in that output. `compose` `after()` ran `docker compose down`.

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | GET `/entrar` sem cookie, com conta, responde 200, título `Entrar`, mostra `E-mail`, `Senha` e `Entrar` | `✔ entrar 200 com email senha e entrar` | `src/lib/entrar.test.ts:230` `pedir("/entrar")` (no cookie); `:232` `assert.equal(resposta.status, 200)`; `:233` `assert.match(html, /<h1[^>]*>Entrar<\/h1>/)`; `:234` `assert.match(html, /E-mail/)`; `:235` `assert.match(html, /Senha/)`; `:236` `assert.match(html, /Entrar/)` | PASS |
| C2 | Enquanto `/entrar` está na tela, o texto `Criar conta` não aparece | `✔ entrar sem criar conta` | `src/lib/entrar.test.ts:241` `assert.equal(html.includes("Criar conta"), false)` | PASS |
| C3 | GET `/criar` sem cookie e com `sessao` válida respondem 307 com Location `/entrar` | `✔ get /criar 307 entrar` | Sem cookie: `src/lib/entrar.test.ts:596` `assert.equal(sem.status, 307)` and `:597` `assert.equal(sem.headers.get("location"), "/entrar")`. Com `sessao`: `:600` `assert.equal(com.status, 307)` and `:601` `assert.equal(com.headers.get("location"), "/entrar")` | PASS |
| C4 | POST `acao` `criar`, `outra@example.com`, `senha-oito`: 303 Location `/entrar`, sem cookie `sessao`, zero contas | `✔ criar nao grava conta` | `src/lib/entrar.test.ts:606` `assert.equal(resposta.status, 303)`; `:607` `assert.equal(resposta.headers.get("location"), "/entrar")`; `:608` `assert.equal(cookieDe(resposta).includes("sessao="), false)`; `:610` `assert.equal(Number(n.rows[0]?.n), 0)` | PASS |
| C5 | Dois POST `acao` `criar` de `race@example.com` / `senha-oito` juntos deixam zero contas | `✔ dois criar nao gravam` | `src/lib/entrar.test.ts:614` `Promise.all` of the two posts; `:619` `assert.equal(Number(n.rows[0]?.n), 0)` | PASS |
| C6 | POST `acao` `criar` com `sessao` de admin, `admincria@example.com`, `senha-oito`: 303 Location `/entrar` e zero contas | `✔ admin criar nao grava` | Cookie from admin login passed at `src/lib/entrar.test.ts:625`. `:626` `assert.equal(resposta.status, 303)`; `:627` `assert.equal(resposta.headers.get("location"), "/entrar")`; `:629` `assert.equal(Number(n.rows[0]?.n), 0)` | PASS |
| C7 | POST `acao` `incluir` com `sessao` de admin, `nova-publica@example.com`, `senha-oito`: grava o e-mail e 303 Location `/usuarios` | `✔ incluir nova-publica grava` | `src/lib/entrar.test.ts:636` `assert.equal(resposta.status, 303)`; `:637` `assert.equal(resposta.headers.get("location"), "/usuarios")`; `:639` `assert.equal(Number(n.rows[0]?.n), 1)` for `nova-publica@example.com` | PASS |
| C8 | Login com `ORIGEM_PUBLICA` `calculadora.exemplo.ts.net`, Host `127.0.0.1:4317` e `X-Forwarded-Proto` `https`: HttpOnly, SameSite `Lax`, Path `/`, Max-Age `604800`, sem `Secure` | `✔ cookie local sem secure` | Call `src/lib/entrar.test.ts:644` passes host `127.0.0.1:4317` and proto `https`. `:646` `assert.match(cookie, /HttpOnly/)`; `:647` `assert.match(cookie, /SameSite=Lax/)`; `:648` `assert.match(cookie, /Path=\//)`; `:649` `assert.match(cookie, /Max-Age=604800/)`; `:650` `assert.equal(cookie.includes("Secure"), false)` | PASS |
| C9 | Login com Host `calculadora.exemplo.ts.net`: `Secure`, HttpOnly, SameSite `Lax`, Path `/`, Max-Age `604800` | `✔ cookie publico com secure` | `src/lib/entrar.test.ts:656` `assert.match(cookie, /Secure/)`; `:657` `assert.match(cookie, /HttpOnly/)`; `:658` `assert.match(cookie, /SameSite=Lax/)`; `:659` `assert.match(cookie, /Path=\//)`; `:660` `assert.match(cookie, /Max-Age=604800/)` | PASS |
| C10 | Login com Host `calculadora.exemplo.ts.net:443` grava `sessao` com `Secure` | `✔ cookie host com porta secure` | Host at `src/lib/entrar.test.ts:665`. `:666` `assert.match(cookie, /Secure/)` | PASS |
| C11 | Login com Host `Calculadora.Exemplo.ts.net` grava `sessao` com `Secure` | `✔ cookie host maiusculo secure` | Host at `src/lib/entrar.test.ts:671`. `:672` `assert.match(cookie, /Secure/)` | PASS |
| C12 | `ORIGEM_PUBLICA` ausente e vazia: login que dá certo não inclui `Secure` | `✔ cookie sem origem publica` | `src/lib/entrar.test.ts:676` `for (const valor of [undefined, ""] as const)`; `:680` `assert.equal(cookie.includes("Secure"), false)` inside that loop | PASS |
| C13 | Sair com Host público apaga o cookie com `Secure` e Max-Age `0` | `✔ sair publico apaga secure` | `src/lib/entrar.test.ts:689` `assert.match(cookie, /Secure/)`; `:690` `assert.match(cookie, /Max-Age=0/)` | PASS |
| C14 | Sair com Host `127.0.0.1:4317` apaga o cookie sem `Secure` e com Max-Age `0` | `✔ sair local apaga sem secure` | `src/lib/entrar.test.ts:698` `assert.equal(cookie.includes("Secure"), false)`; `:699` `assert.match(cookie, /Max-Age=0/)` | PASS |
| C15 | O comando do serviço `app` no compose é `npm run serve` | `✔ compose app node 24` | `src/lib/compose.test.ts:138` `assert.equal(comando(config.services.app), "npm run serve")` | PASS |
| C16 | O script `serve` é `next build && next start --hostname 0.0.0.0 --port 4317` | `✔ script serve constroi e escuta` | `src/lib/compose.test.ts:145` `assert.equal(pacote.scripts.serve, "next build && next start --hostname 0.0.0.0 --port 4317")` | PASS |
| C17 | Com `docker compose up` no ar, GET `http://127.0.0.1:4317/` responde 200 | `✔ compose responde 200` | `src/lib/compose.test.ts:40` `docker compose up -d`; `:49` `fetch("http://127.0.0.1:4317/")`; `:50` `if (resposta.status === 200) return` | PASS |
| C18 | O serviço postgres do compose não publica porta no host | `✔ compose postgres sem porta` | `src/lib/compose.test.ts:83` `assert.equal(config.services.postgres.ports, undefined)` | PASS |
| C19 | A seção `Como rodar` do README inclui `docker compose up`, `http://127.0.0.1:4317` e `https://calculadora.<tailnet>.ts.net` | `✔ readme url publica` | Section slice `src/lib/docs-banco.test.ts:24`. `:25` `assert.match(comoRodar, /docker compose up/)`; `:26` `assert.match(comoRodar, /http:\/\/127\.0\.0\.1:4317/)`; `:27` `assert.match(comoRodar, /https:\/\/calculadora\.<tailnet>\.ts\.net/)` | PASS |
| C20 | `docs/arquitetura.md` diz que o app construído escuta em `0.0.0.0:4317` | `✔ arquitetura app construido` | `src/lib/docs-banco.test.ts:31` `assert.match(fonte("docs/arquitetura.md"), /O app construído escuta em `0\.0\.0\.0:4317`/)` | PASS |
| C21 | `docs/arquitetura.md` diz que GET `/criar` responde 307 para `/entrar` | `✔ arquitetura criar 307` | `src/lib/docs-banco.test.ts:35` `assert.match(fonte("docs/arquitetura.md"), /GET `\/criar` responde 307 para `\/entrar`/)` | PASS |
| C22 | `docs/arquitetura.md` não diz que o servidor de desenvolvimento escuta em `0.0.0.0:4317` | `✔ arquitetura sem dev na 4317` | `src/lib/docs-banco.test.ts:39` `assert.equal(fonte("docs/arquitetura.md").includes("servidor de desenvolvimento escuta em `0.0.0.0:4317`"), false)` | PASS |
| C23 | GET `/entrar` com `sessao` válida responde 307 com Location `/` | `✔ get /entrar com sessao 307` | `src/lib/entrar.test.ts:247` `assert.equal(resposta.status, 307)`; `:248` `assert.equal(resposta.headers.get("location"), "/")` | PASS |

## Level and sampling

Verified at `9c8eaea`. No `Test policy` rows in `checks.md`. The repo convention in `AGENTS.md` is a node test under `src/lib/*.test.ts`. Route and cookie checks assert status, Location, body text, or `Set-Cookie` on the HTTP response from that suite (`C1`–`C14`, `C23`). Compose and docs checks read `docker compose config`, `package.json`, the README section, and `docs/arquitetura.md` (`C15`–`C22`). Each named proof sits in a file this diff touches (`src/lib/entrar.test.ts`, `src/lib/compose.test.ts`, `src/lib/docs-banco.test.ts`).

Sampling:

- C3 names two GETs. Both status and Location are asserted for no cookie (`src/lib/entrar.test.ts:596`–`:597`) and for a valid `sessao` (`:600`–`:601`).
- C12 names missing and empty `ORIGEM_PUBLICA`. Both values are the loop `[undefined, ""]`, and the no-`Secure` assertion is inside the loop (`src/lib/entrar.test.ts:676`–`:680`).
- C8 names `X-Forwarded-Proto` `https` together with the local host. The call passes that proto (`src/lib/entrar.test.ts:644`); the header is set from that argument (`src/lib/entrar.test.ts:62`); the cookie assertion is the absence of `Secure` (`:650`).

## Swept existing

No Swept line resolves to `existing`. Rows that cite checks are validation C10, C11, C12; failure modes C4; idempotency C5; authorization C6, C7; concurrency C5; state transitions C3, C13, C14. Those claims are the Checks rows above. `n/a` rows are approved policy: data lifecycle, dependency failure, observability. Nothing in those three names a code constraint to re-read.

## Gate

`node --experimental-strip-types --test src/lib/entrar.test.ts src/lib/compose.test.ts src/lib/docs-banco.test.ts` — 71 passed, 0 failed, exit 0.

`docker run --rm -v "c:/Users/Pablo Roberto/Documents/projects/3d-calc:/work" -w /work python:3.12-alpine python .cursor/skills/tlc-spec-lean/scripts/validate_verification.py url-publica` — exit 0, 0 errors, 0 warnings. Profile matches `light`.
