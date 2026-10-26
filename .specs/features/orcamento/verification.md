# Orçamento verification

**Verdict**: PASS
**Profile**: light
**Diff range**: 07d9f35..bc73dcd
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

Profile `light` skips step 1 (binding sources), the Coverage recompute, Test policy verdicts, and fault injection. Those sections are omitted on purpose. `checks.md` has no `Test policy` section.

Proofs ran at `bc73dcd0eb48f0567530c652f01497eaaf0d8c03`. One invocation:

`node --experimental-strip-types --test src/lib/banco.test.ts src/lib/vistas.test.ts src/lib/projetos-store.test.ts --test-name-pattern "<the 29 Proof names joined by |>"`

The name pattern did not isolate. The three files ran whole. Exit 0. `tests 152`, `pass 152`, `fail 0`, `duration_ms 38224.3144`. Every named proof below printed `✔` in that output. `compose.yaml` is dirty outside `07d9f35..HEAD` and is not imported by these proofs.

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | Save client name `Ana` and phone `11999990000`; the next read returns both | `✔ grava cliente ana` | `src/lib/banco.test.ts:1725` `assert.equal(lido.projects[0]?.clientName, "Ana")`; `:1726` `assert.equal(lido.projects[0]?.clientPhone, "11999990000")` | PASS |
| C2 | Save `""` and `""`; the next read returns both as `""` and the project stays in the list | `✔ cliente vazio continua na lista` | `src/lib/banco.test.ts:1732` `assert.equal(lido.projects.length, 1)`; `:1733` `assert.equal(lido.projects[0]?.id, "p1")`; `:1734` `assert.equal(lido.projects[0]?.clientName, "")`; `:1735` `assert.equal(lido.projects[0]?.clientPhone, "")` | PASS |
| C3 | Save client name ` Ana `; the next read returns ` Ana ` | `✔ nome de cliente com espaco` | `src/lib/banco.test.ts:1741` `assert.equal(lido.projects[0]?.clientName, " Ana ")` | PASS |
| C4 | Save phone `11 99999-0000`; the next read returns `11 99999-0000` | `✔ telefone de cliente como digitado` | `src/lib/banco.test.ts:1747` `assert.equal(lido.projects[0]?.clientPhone, "11 99999-0000")` | PASS |
| C5 | The list of a project with `Ana` and `11999990000` shows both with the lote | `✔ lista mostra cliente` | `src/lib/vistas.test.ts:433` `assert.equal(linha?.includes("Ana"), true)`; `:434` `assert.equal(linha?.includes("11999990000"), true)`; `:435` `assert.match(fonte("src/components/lista-projetos.tsx"), /linhaCliente/)` | PASS |
| C6 | Client name `   ` and phone `  ` show the same lote line as both fields `""` | `✔ lista sem cliente no recorte` | `src/lib/vistas.test.ts:441` `assert.equal(linhaCliente(vazio), null)`; `:442` `assert.equal(linhaCliente(espaco), null)`; `:443` `assert.equal(descricaoProjeto(espaco).linha, descricaoProjeto(vazio).linha)` | PASS |
| C7 | Duplicate keeps client `Ana` / `11999990000` and names the copy with ` (cópia)` | `✔ duplicar copia cliente` | `src/lib/banco.test.ts:1754` `assert.equal(copia?.name, "Suporte (cópia)")`; `:1755` `assert.equal(copia?.clientName, "Ana")`; `:1756` `assert.equal(copia?.clientPhone, "11999990000")` | PASS |
| C8 | A projeto row that had no client, after the columns, reads both as `""` | `✔ projeto antigo le cliente vazio` | `src/lib/banco.test.ts:1769` `assert.equal(antigo?.clientName, "")`; `:1770` `assert.equal(antigo?.clientPhone, "")` | PASS |
| C9 | A projects payload without client name and phone reads both as `""` | `✔ payload sem cliente le vazio` | `src/lib/projetos-store.test.ts:122` `assert.equal(projects[0]?.clientName, "")`; `:123` `assert.equal(projects[0]?.clientPhone, "")` | PASS |
| C10 | The projects payload serializes with version `1` | `✔ payload de projetos versao 1` | `src/lib/projetos-store.test.ts:130` `assert.equal(salvo.version, 1)` | PASS |
| C11 | Deleting the project with client name `Ana` makes the next read omit that id | `✔ apagar projeto leva o cliente` | `src/lib/banco.test.ts:1777` `assert.equal(lido.projects.some((item) => item.id === "p1"), false)` | PASS |
| C12 | With client name `""` and phone `""`, the calculator shows a field `Cliente` and a field `Telefone` | `✔ campos cliente e telefone` | `src/lib/vistas.test.ts:447` `assert.equal(ROTULO_CLIENTE, "Cliente")`; `:448` `assert.equal(ROTULO_TELEFONE, "Telefone")`; `:450` `assert.match(calculadora, /ROTULO_CLIENTE/)`; `:451` `assert.match(calculadora, /ROTULO_TELEFONE/)` | PASS |
| C13 | A save whose `updated_at` is not current and that sets client name `Bia` commits nothing; the next read returns `Ana` | `✔ gravacao atrasada mantem cliente` | `src/lib/banco.test.ts:1785` `expectedUpdatedAt: 10` against a row saved at `updatedAt: 20`; `:1787` `assert.equal(lido.projects[0]?.clientName, "Ana")`; `:1788` `assert.equal(lido.projects[0]?.updatedAt, 20)` | PASS |
| C14 | A save that fails while setting client name `Bia` leaves the next read at `Ana` | `✔ falha ao gravar cliente volta ana` | `src/lib/banco.test.ts:1799` `assert.rejects(bancoProva().gravarProjeto(projeto({ clientName: "Bia", updatedAt: 30 })))`; `:1801` `assert.equal(lido.projects[0]?.clientName, "Ana")` | PASS |
| C15 | The closed lot (mode `lote`, copies `2`, 60 minutes, labor `20`, 10 g at R$ 100/kg and 20 g at R$ 50/kg) shows `Copiar orçamento` | `✔ botao copiar orcamento quando o lote fecha` | Inputs at `src/lib/vistas.test.ts:397`–`:410` (`mode: "lote"`, `copies: "2"`, `hours: "1"`, `minutes: "0"`, `labor: "20"`, grams `10`/`20`, prices `100`/`50`). `:457` `assert.equal(result.lot.total !== null, true)`; `:458` `assert.equal(podeCopiarOrcamento(result.lot.total), true)`; `:460` `assert.match(calculadora, /podeCopiarOrcamento/)`; `:462` `assert.equal(ROTULO_COPIAR, "Copiar orçamento")` | PASS |
| C16 | That copy text contains the lote name, client lines, printer line, the seven labels in that order, and the piece and lot strings from `formatBRL`, `formatDuration`, and `formatGrams` | `✔ texto do orcamento do lote fechado` | `src/lib/vistas.test.ts:468`–`:480` the label list; `:484` `assert.ok(em > anterior, marca)` so each mark is after the previous; `:487` `assert.equal(linhaImpressora(prova), "Prova: 100 W, 1 R$/kWh, impressora 1000, 1000 h.")`; `:488`–`:496` for `result.piece` and `result.lot`, `texto.includes(formatBRL(...))`, `formatDuration`, and `formatGrams` | PASS |
| C17 | Client name and phone that trim to empty: no `Cliente:`, no `Telefone:`, and the lot total's `formatBRL` | `✔ texto sem linhas de cliente` | `src/lib/vistas.test.ts:500` `loteFechado({ clientName: "   ", clientPhone: "  " })`; `:501` `assert.equal(texto.includes("Cliente:"), false)`; `:502` `assert.equal(texto.includes("Telefone:"), false)`; `:503` `assert.equal(texto.includes(formatBRL(result.lot.total ?? 0)), true)` | PASS |
| C18 | copies `0`: the blocked-piece sentence, the lot `formatBRL`, and no `Por peça` | `✔ texto sem por peca com copias 0` | Inputs at `src/lib/vistas.test.ts:508`–`:515` (`mode: "lote"`, `copies: "0"`, `hours: "1"`, `minutes: "0"`, `labor: "20"`, 10 g at `100`). `:520` `assert.equal(texto.includes("Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero."), true)`; `:521` `assert.equal(texto.includes(formatBRL(result.lot.total ?? 0)), true)`; `:522` `assert.equal(texto.includes("Por peça"), false)` | PASS |
| C19 | Two mesas, piece total closed, lot total `null`: no `Copiar orçamento` | `✔ sem botao quando o lote nao fecha` | Inputs at `src/lib/vistas.test.ts:527`–`:532` (copies `0`, labor `10`, two mesas hours `0` minutes `0` grams `1000` price `100`). `:535` `assert.equal(result.piece.total !== null, true)`; `:536` `assert.equal(result.lot.total, null)`; `:537` `assert.equal(podeCopiarOrcamento(result.lot.total), false)` | PASS |
| C20 | Removed printer, marked printer `Prova`: the removal sentence and the `Prova` line | `✔ texto com impressora removida` | `src/lib/vistas.test.ts:541` `textoDo(loteFechado(), prova, true)`; `:542` `assert.equal(texto.includes(AVISO_IMPRESSORA_REMOVIDA), true)`; `:543`–`:546` `assert.equal(AVISO_IMPRESSORA_REMOVIDA, "A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora.")`; `:547` `assert.equal(texto.includes("Prova: 100 W, 1 R$/kWh, impressora 1000, 1000 h."), true)` | PASS |
| C21 | The calculator text contains `Bia` while the next read still returns saved `Ana` | `✔ texto segue bia da tela` and `✔ leitura continua ana` | `src/lib/vistas.test.ts:551` `textoDo(loteFechado({ clientName: "Bia" }))`; `:552` `assert.equal(texto.includes("Bia"), true)`; `:553` `assert.equal(texto.includes("Cliente: Ana"), false)`; `src/lib/banco.test.ts:1826` save `clientName: "Ana"`; `:1828` `assert.equal(lido.projects[0]?.clientName, "Ana")` | PASS |
| C22 | If the clipboard write fails, the calculator shows that same text for selection | `✔ copia falha mostra o texto` | `src/lib/vistas.test.ts:558` `assert.equal(textoAposCopia(true, texto), texto)`; `:559` `assert.equal(textoAposCopia(false, texto), null)`; `:560` `assert.match(fonte("src/components/calculadora.tsx"), /textoAposCopia/)` | PASS |
| C23 | Copying the orçamento twice leaves one project with that id | `✔ copiar duas vezes nao grava projeto` | `src/lib/vistas` call twice at `src/lib/banco.test.ts:1849` and `:1850` `textoOrcamento(entrada)`; `:1852` `assert.deepEqual(lido.projects.map((item) => item.id), ["p1"])`; `:1856` `assert.equal(lido.projects[0]?.updatedAt, 20)` | PASS |
| C24 | After the text is produced, tariff `1` to `2` without saving leaves that text on the old total, and the list reprices from the new tariff | `✔ texto fica e a lista reprecifica` | `src/lib/vistas.test.ts:566` `energyPrice: "2"`; `:567` `assert.notEqual(novo.lot.total, antigo.result.lot.total)`; `:568` `assert.equal(antigo.texto.includes(formatBRL(antigo.result.lot.total ?? 0)), true)`; `:569` `assert.equal(antigo.texto.includes(formatBRL(novo.lot.total ?? 0)), false)`; `:570` `assert.match(fonte("src/components/lista-projetos.tsx"), /draftToCalcInput/)` | PASS |
| C25 | No colors, mode `peca`, 60 minutes, labor `0`, lot total closed: the no-color sentence | `✔ texto com nenhuma cor` | `src/lib/vistas.test.ts:574` `mode: "peca"`, `hours: "1"`, `minutes: "0"`, `labor: "0"`, `colors: []`; `:576` `assert.equal(result.lot.total !== null, true)`; `:577` `assert.equal(texto.includes("Nenhuma cor de filamento. O material entra como R$ 0,00."), true)` | PASS |
| C26 | Colors named `PLA preto` and `PLA branco` do not appear in the text | `✔ texto sem nome das cores` | Names on the same input at `src/lib/vistas.test.ts:406` `name: "PLA preto"` and `:407` `name: "PLA branco"`. `:582` `assert.equal(texto.includes("PLA preto"), false)`; `:583` `assert.equal(texto.includes("PLA branco"), false)` | PASS |
| C27 | The projetos list does not show `Copiar orçamento` | `✔ lista sem copiar orcamento` | `src/lib/vistas.test.ts:588` `assert.equal(lista.includes("Copiar orçamento"), false)`; `:589` `assert.equal(lista.includes("ROTULO_COPIAR"), false)` | PASS |
| C28 | `projeto` has `client_name` and `client_phone` as `text NOT NULL` default `''`, and there is no table `cliente` | `✔ colunas de cliente no schema` | `src/lib/banco.test.ts:1812` `assert.deepEqual(..., ["client_name", "client_phone"])`; `:1817` `assert.equal(row.data_type, "text", row.column_name)`; `:1818` `assert.equal(row.is_nullable, "NO", row.column_name)`; `:1819` `assert.match(row.column_default ?? "", /''/)`; `:1822` `assert.equal(cliente.rows[0]?.nome, null)` | PASS |

## Level and sampling

No level gap. `checks.md` has no `Test policy` section. The repo convention in `AGENTS.md` is a node test under `src/lib/*.test.ts`. These 29 proofs are that. `Surface` names no route consumed outside the app. No claim names a status code, route, or response shape. Screen claims assert a helper result plus a source binding in the component (`linhaCliente`, `podeCopiarOrcamento`, `ROTULO_COPIAR`, `textoAposCopia`, `draftToCalcInput`). C22 asserts `textoAposCopia(true, texto)`, not an OS clipboard write. C23's two copies are two `textoOrcamento` calls, then one remaining id.

No precision gap. The strings the checks name are literals at the assertions cited above. Where the claim names the input, that input is a literal in the same test: `loteFechado` at `src/lib/vistas.test.ts:395`–`:412`, the copies-`0` project at `:507`–`:515`, the two mesas at `:526`–`:532`, and the no-color project at `:574`.

No sampling gap. Set claims assert every named member in the same test:

- C6: both `""` and whitespace (`src/lib/vistas.test.ts:441`–`:443`).
- C16: all eleven marks in order (`:482`–`:484`) and `formatBRL`, `formatDuration`, and `formatGrams` for both `result.piece` and `result.lot` (`:488`–`:496`).
- C21: `Bia` in the text (`src/lib/vistas.test.ts:552`) and saved `Ana` on the next read (`src/lib/banco.test.ts:1828`).
- C23: `textoOrcamento` twice (`src/lib/banco.test.ts:1849`–`:1850`).
- C28: both columns share the `text`, `NOT NULL`, and `''` assertions (`src/lib/banco.test.ts:1816`–`:1819`).

## Swept existing

Re-read only the Swept row that says `existing`. The other rows cite check ids (validation C2, C3, C4; failure modes C14, C22; idempotency C23; concurrency C13; data lifecycle C8, C11; dependency failure C22) or `n/a` (state transitions, observability).

| Dimension | Cited constraint | Where it is | Reading |
| --- | --- | --- | --- |
| authorization | AD-005, sem sessão a conta não lê o projeto; as colunas novas ficam nessa linha | `.specs/STATE.md` AD-005 is active. `src/lib/acesso.ts:42` redirects to `/entrar` when there is no `sessao`, before `banco.ler()`. `src/lib/banco.ts:667`–`:671` `ler` takes `contaExigida()` and returns `{ status: "erro" }` when that id is missing. `client_name` and `client_phone` are columns of that same read: `src/lib/banco.ts:414` `SELECT ... client_name, client_phone ... FROM projeto WHERE conta_id = $1`. | holds |

## Deviation outside C1–C28

Frozen `.specs/features/mesas/checks.md` C44 says the columns of `projeto` continue exactly `id`, `name`, `printer_id`, `mode`, `copies`, `hours`, `minutes`, `labor`, `color_mode`, `grams`, `updated_at`. At HEAD, `tabela mesa no schema` asserts a different list. `src/lib/banco.test.ts:1192`–`:1195` expects those names plus `conta_id`, `client_name`, and `client_phone`. Mesas `checks.md` was not edited. `07d9f35..HEAD` is what added `client_name` and `client_phone` to that assertion. `conta_id` was already in the list at `07d9f35`. This is a deviation of the frozen mesas check. It is not an orçamento check, and it does not change the verdict above. `✔ tabela mesa no schema` printed in the same run.

## Gate

`node --experimental-strip-types --test src/lib/banco.test.ts src/lib/vistas.test.ts src/lib/projetos-store.test.ts --test-name-pattern "<29 names>"` — the pattern did not isolate; 152 passed, 0 failed, exit 0. Each C1–C28 proof name printed `✔`.
