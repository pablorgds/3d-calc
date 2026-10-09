# URL pública checks

Profile: light
Plan: `.specs/features/url-publica/plan.md`

23 checks in 3 slices · 2 one-way doors · 1 open, of which 1 blocks go-live

## Checks

### S1 - Criar conta não grava · 6 files · 39 KB · ~10k

**C1** - GET `/entrar` sem cookie `sessao`, com ao menos uma conta, responde 200, o título é `Entrar` e a página mostra `E-mail`, `Senha` e `Entrar` (AC 1)

Status: done

**C2** - Enquanto `/entrar` está na tela, o texto `Criar conta` não aparece (AC 2)

Status: done

**C3** - GET `/criar` sem cookie e GET `/criar` com `sessao` válida respondem 307 com Location `/entrar` (AC 3)

Status: done

**C4** - POST `/sessao` com `acao` `criar`, e-mail `outra@example.com` e senha `senha-oito` responde 303 com Location `/entrar`, não grava cookie `sessao` e deixa zero contas desse e-mail (AC 4)

Status: done

**C5** - Dois POST `/sessao` com `acao` `criar`, e-mail `race@example.com` e senha `senha-oito` juntos deixam zero contas desse e-mail (AC 5)

Status: done

**C6** - POST `/sessao` com `acao` `criar`, `sessao` de admin, e-mail `admincria@example.com` e senha `senha-oito` responde 303 com Location `/entrar` e deixa zero contas desse e-mail (AC 6)

Status: done

**C7** - POST `/sessao` com `acao` `incluir`, `sessao` de admin, e-mail `nova-publica@example.com` e senha `senha-oito` grava esse e-mail e responde 303 com Location `/usuarios` (AC 7)

Status: done

### S2 - Cookie Secure só no nome público · 3 files · 25 KB · ~6k

**C8** - Login com `ORIGEM_PUBLICA` `calculadora.exemplo.ts.net`, Host `127.0.0.1:4317` e header `X-Forwarded-Proto` `https` grava `sessao` HttpOnly, SameSite `Lax`, Path `/`, Max-Age `604800`, sem `Secure` (AC 8, door 1)

Status: done

**C9** - Login com `ORIGEM_PUBLICA` `calculadora.exemplo.ts.net` e Host `calculadora.exemplo.ts.net` grava `sessao` com `Secure`, HttpOnly, SameSite `Lax`, Path `/` e Max-Age `604800` (AC 9, door 1)

Status: done

**C10** - Login com `ORIGEM_PUBLICA` `calculadora.exemplo.ts.net` e Host `calculadora.exemplo.ts.net:443` grava `sessao` com `Secure` (AC 10, door 1)

Status: done

**C11** - Login com `ORIGEM_PUBLICA` `calculadora.exemplo.ts.net` e Host `Calculadora.Exemplo.ts.net` grava `sessao` com `Secure` (AC 11, door 1)

Status: done

**C12** - Com `ORIGEM_PUBLICA` ausente e com `ORIGEM_PUBLICA` vazia, o login que dá certo não inclui `Secure` no cookie `sessao` (AC 12, door 1)

Status: done

**C13** - Sair com Host `calculadora.exemplo.ts.net` e `ORIGEM_PUBLICA` `calculadora.exemplo.ts.net` apaga o cookie com `Secure` e Max-Age `0` (AC 13, door 1)

Status: done

**C14** - Sair com Host `127.0.0.1:4317` e `ORIGEM_PUBLICA` `calculadora.exemplo.ts.net` apaga o cookie sem `Secure` e com Max-Age `0` (AC 14, door 1)

Status: done

### S3 - O processo da 4317 é o app construído · 7 files · 14 KB · ~4k

**C15** - O comando do serviço `app` no compose é `npm run serve` (AC 15, door 2)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose app node 24"`

**C16** - O script `serve` é `next build && next start --hostname 0.0.0.0 --port 4317` (AC 16, door 2)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "script serve constroi e escuta"`

**C17** - Com `docker compose up` no ar, GET `http://127.0.0.1:4317/` responde 200 (AC 17)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose responde 200"`

**C18** - O serviço postgres do compose não publica porta no host (AC 18)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose postgres sem porta"`

**C19** - A seção `Como rodar` do README inclui `docker compose up`, `http://127.0.0.1:4317` e `https://calculadora.<tailnet>.ts.net` (AC 19)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "readme url publica"`

**C20** - `docs/arquitetura.md` diz que o app construído escuta em `0.0.0.0:4317` (AC 20)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "arquitetura app construido"`

**C21** - `docs/arquitetura.md` diz que GET `/criar` responde 307 para `/entrar` (AC 21)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "arquitetura criar 307"`

**C22** - `docs/arquitetura.md` não diz que o servidor de desenvolvimento escuta em `0.0.0.0:4317` (AC 22)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "arquitetura sem dev na 4317"`

**C23** - GET `/entrar` com `sessao` válida responde 307 com Location `/` (Surface `GET /entrar` status 307)

Status: done

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `GET /entrar` statuses (2) | 200 C1 · 307 C23 | - |
| `GET /criar` statuses (1) | 307 C3 | - |
| `POST /sessao` statuses (1) | 303 C4 | - |
| cookie `Secure` (7) | host local C8 · host público C9 · host com porta C10 · host maiúsculo C11 · env vazia C12 · apagar público C13 · apagar local C14 | - |
| door 2 app construído (2) | comando compose C15 · script `serve` C16 | - |
| startup cookie (1) | `POST /sessao` C9 | - |

- Claims naming a status code, route or response shape: C1, C3, C4, C6, C7, C23 - each has a proof that crosses the boundary
- No other check claims more than the single case its proof exercises

## Swept

- validation: C10, C11, C12
- failure modes: C4
- idempotency: C5
- authorization: C6, C7
- concurrency: C5
- data lifecycle: n/a - nenhuma coluna nova e nenhuma conta é apagada por esta feature
- dependency failure: n/a - o Funnel fica fora do repositório; os critérios não chamam a Tailscale
- state transitions: C3, C13, C14
- observability: n/a - o plano não pede log novo

## Handoff

S1 = 10k, cadastro. S2 entra no cookie e soma 16k. S3 entra no compose e na documentação e soma 20k. Abaixo do orçamento de 150k — one builder, no ask.
