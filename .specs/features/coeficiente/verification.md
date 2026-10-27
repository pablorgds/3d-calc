# Coeficiente verification

**Verdict**: PASS
**Profile**: light
**Diff range**: c223332..HEAD
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | grava `20`, lê `20` | `node --experimental-strip-types --test --test-name-pattern "grava coeficiente 20" src/lib/banco.test.ts` exit 0, 1 passed | `src/lib/banco.test.ts:1863` - `assert.equal(lido.printers.printers.find((item) => item.name === "Prova")?.coefficient, "20")` | PASS |
| C2 | grava `""`, lê `""` | same invocation, 1 passed | `src/lib/banco.test.ts:1870` - `assert.equal(lido.printers.printers[0]?.coefficient, "")` | PASS |
| C3 | grava ` 20 `, lê ` 20 ` | same invocation, 1 passed | `src/lib/banco.test.ts:1876` - `assert.equal(lido.printers.printers[0]?.coefficient, " 20 ")` | PASS |
| C4 | grava `100`, lê `100` | same invocation, 1 passed | `src/lib/banco.test.ts:1882` - `assert.equal(lido.printers.printers[0]?.coefficient, "100")` | PASS |
| C5 | grava `abc`, lê `abc` | same invocation, 1 passed | `src/lib/banco.test.ts:1888` - `assert.equal(lido.printers.printers[0]?.coefficient, "abc")` | PASS |
| C6 | payload sem coefficient lê `""` | `node --experimental-strip-types --test --test-name-pattern "payload sem coeficiente le vazio" src/lib/impressora-store.test.ts` exit 0, 1 passed | `src/lib/impressora-store.test.ts:105` - `assert.equal(store.printers[0].coefficient, "")` | PASS |
| C7 | linha antiga sem a coluna lê `""` | banco.test.ts run, 1 passed | `src/lib/banco.test.ts:1895` - `assert.equal(lido.printers.printers.find((item) => item.id === "k2-pro")?.coefficient, "")` | PASS |
| C8 | payload serializa versão `3` | impressora-store.test.ts run, 1 passed | `src/lib/impressora-store.test.ts:114` - `assert.equal(json.version, 3)` | PASS |
| C9 | nova impressora: `Nova impressora` + coefficient `""` | banco.test.ts run, 1 passed | `src/lib/banco.test.ts:1902-1903` - `assert.equal(nova?.name, "Nova impressora")` / `assert.equal(nova?.coefficient, "")` | PASS |
| C10 | semente `k2-pro` lê `""` | banco.test.ts run, 1 passed | `src/lib/banco.test.ts:1908` - `assert.equal(lido.printers.printers.find((item) => item.id === "k2-pro")?.coefficient, "")` | PASS |
| C11 | isolamento entre contas | banco.test.ts run, 1 passed | `src/lib/banco.test.ts:1917-1918` - `assert.equal(minha.printers.printers.find((item) => item.id === "k2-pro")?.coefficient, "20")` then `assert.equal(lido.printers.printers.find((item) => item.id === "k2-pro")?.coefficient, "")` | PASS |
| C12 | gravação que falha deixa a leitura em `""` | banco.test.ts run, 1 passed | `src/lib/banco.test.ts:1932` - `assert.equal(lido.printers.printers.find((item) => item.id === "k2-pro")?.coefficient, "")` | PASS |
| C13 | campo `Coeficiente de erro (%)` no formulário | `node --experimental-strip-types --test --test-name-pattern "campo coeficiente de erro" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:642,645` - `assert.equal(ROTULO_COEFICIENTE, "Coeficiente de erro (%)")` / `assert.match(ficha, /id="coeficiente"/)` | PASS |
| C14 | coefficient `""`: totais `88`, material `80`, mão de obra `8`, tempo `0 min` | `node --experimental-strip-types --test --test-name-pattern "coeficiente vazio mantem a soma" src/lib/custo.test.ts` exit 0, 1 passed | `src/lib/custo.test.ts:309-312` - `assert.equal(dinheiro(result.piece.total), formatBRL(88))` ... `assert.equal(dinheiro(result.piece.labor), formatBRL(8))` | PASS |
| C15 | coefficient `20`: totais `110`, material `80`, mão de obra `8`, peso `800g`, tempo `0 min` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:318-322` - `assert.equal(dinheiro(result.piece.total), formatBRL(110))` / `assert.equal(dinheiro(result.lot.total), formatBRL(110))` | PASS |
| C16 | coefficient `0`: totais `88` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:330-331` - `assert.equal(dinheiro(result.piece.total), formatBRL(88))` | PASS |
| C17 | coefficient `99`: totais `8800` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:336-337` - `assert.equal(dinheiro(result.piece.total), formatBRL(8800))` | PASS |
| C18 | coefficient `99,9`: totais `88000` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:342-343` - `assert.equal(dinheiro(result.piece.total), formatBRL(88000))` | PASS |
| C19 | coefficient `100`: totais `—`, material `80` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:348-350` - `assert.equal(dinheiro(result.piece.total), "—")` / `assert.equal(dinheiro(result.piece.material), formatBRL(80))` | PASS |
| C20 | coefficient `101`: totais `—` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:355-356` - `assert.equal(dinheiro(result.piece.total), "—")` | PASS |
| C21 | coefficient `abc`: totais `—` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:361-362` - `assert.equal(dinheiro(result.piece.total), "—")` | PASS |
| C22 | coefficient `"   "`: totais `88` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:367-368` - `assert.equal(dinheiro(result.piece.total), formatBRL(88))` | PASS |
| C23 | tabela sem `Coeficiente de erro (%)` nem `Peças perdidas` | `node --experimental-strip-types --test --test-name-pattern "tabela sem linha de coeficiente" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:650-651` - `assert.equal(calculadora.includes("Coeficiente de erro (%)"), false)` / `assert.equal(calculadora.includes("Peças perdidas"), false)` | PASS |
| C24 | lista mostra `110` sem regravar | vistas.test.ts run, 1 passed | `src/lib/vistas.test.ts:656` - `assert.equal(formatBRL(total ?? 0), formatBRL(110))` | PASS |
| C25 | `20`→`""` sem regravar faz a lista mostrar `88` | vistas.test.ts run, 1 passed | `src/lib/vistas.test.ts:662` - `assert.equal(formatBRL(total ?? 0), formatBRL(88))` | PASS |
| C26 | lote `4`: peça `27.5`/material `20`/mão de obra `2`; lote `110`/material `80`/mão de obra `8` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:380-385` - `assert.equal(dinheiro(lote.piece.total), formatBRL(27.5))` ... `assert.equal(dinheiro(lote.lot.labor), formatBRL(8))` | PASS |
| C27 | duas mesas, copies `2`: material `80`/`160`, mão de obra `8`/`16`, totais `110`/`220` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:415-420` - `assert.equal(dinheiro(result.piece.material), formatBRL(80))` ... `assert.equal(dinheiro(result.lot.total), formatBRL(220))` | PASS |
| C28 | copies `0`: peça `110`, lote `—`, sem `Copiar orçamento` | **proof 1**: `node --experimental-strip-types --test --test-name-pattern "mesas sem copias fecham a peca" src/lib/custo.test.ts` exit 0, 1 passed. **proof 2**: `node --experimental-strip-types --test --test-name-pattern "sem botao quando o lote nao fecha" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/custo.test.ts:449-450` - `assert.equal(dinheiro(result.piece.total), formatBRL(110))` / `assert.equal(dinheiro(result.lot.total), "—")`; `src/lib/vistas.test.ts:570-571` - `assert.equal(result.lot.total, null)` / `assert.equal(podeCopiarOrcamento(result.lot.total), false)` | PASS |
| C29 | labor `""` + coefficient `20`: totais `—` | custo.test.ts run, 1 passed | `src/lib/custo.test.ts:456-458` - `assert.equal(dinheiro(sem.piece.total), "—")` / `assert.equal(dinheiro(sem.lot.total), "—")` | PASS |
| C30 | texto com lote, cliente, telefone, `Total:`, `110`, `0 min` | `node --experimental-strip-types --test --test-name-pattern "texto do cliente com preco 110" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:670-674` - `assert.equal(texto.includes("Suporte"), true)` ... `assert.equal(texto.includes("0 min"), true)` | PASS |
| C31 | texto sem linhas de custo/coeficiente | vistas.test.ts run, 1 passed | `src/lib/vistas.test.ts:680-682` - loop `assert.equal(texto.includes(marca), false, marca)` over `["Material", ..., "Coeficiente", "Peças perdidas"]` | PASS |
| C32 | cliente/telefone vazios após recorte ficam fora, preço continua | `node --experimental-strip-types --test --test-name-pattern "texto sem linhas de cliente" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:535-537` - `assert.equal(texto.includes("Cliente:"), false)` / `assert.equal(texto.includes("Telefone:"), false)` / `assert.equal(texto.includes(formatBRL(110)), true)` | PASS |
| C33 | lote `4`: texto com `Por peça`, `Lote`, `27.5`, `110`, sem `Total:` | vistas.test.ts run, 1 passed | `src/lib/vistas.test.ts:690-694` - `assert.equal(texto.includes("Por peça"), true)` ... `assert.equal(texto.includes("Total:"), false)` | PASS |
| C34 | coefficient `100` não mostra `Copiar orçamento` | `node --experimental-strip-types --test --test-name-pattern "sem botao com coeficiente 100" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:699-700` - `assert.equal(result.lot.total, null)` / `assert.equal(podeCopiarOrcamento(result.lot.total), false)` | PASS |
| C35 | lote copies `0`: texto tem `110`, sem `Por peça` nem o aviso de cópias | vistas.test.ts run, 1 passed | `src/lib/vistas.test.ts:709-711` - `assert.equal(texto.includes(formatBRL(110)), true)` / `assert.equal(texto.includes("Por peça"), false)` / `assert.equal(texto.includes("Custo por peça bloqueado..."), false)` | PASS |
| C36 | tela mostra o aviso de cópias do lote | `node --experimental-strip-types --test --test-name-pattern "aviso de copias fica na tela" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:716-719` - `assert.equal(notasResultado(result, "lote").includes("Custo por peça bloqueado..."), true)` | PASS |
| C37 | tela mostra o aviso de cópias do produto; texto não leva a frase | `node --experimental-strip-types --test --test-name-pattern "aviso de copias do produto fica na tela" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:731-733` - `assert.equal(avisoCopiasProduto("0"), AVISO_COPIAS_PRODUTO)` / `assert.equal(texto.includes(AVISO_COPIAS_PRODUTO), false)` | PASS |
| C38 | impressora removida: texto tem `110`, sem o aviso nem `Prova:` | `node --experimental-strip-types --test --test-name-pattern "texto sem impressora removida" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:740-742` - `assert.equal(texto.includes(formatBRL(110)), true)` / `assert.equal(texto.includes(AVISO_IMPRESSORA_REMOVIDA), false)` / `assert.equal(texto.includes("Prova:"), false)` | PASS |
| C39 | tela mostra o aviso de impressora removida | `node --experimental-strip-types --test --test-name-pattern "aviso de impressora removida fica na tela" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:746-749` - `assert.equal(AVISO_IMPRESSORA_REMOVIDA, "A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora.")` | PASS |
| C40 | falha no clipboard mostra o texto para seleção | `node --experimental-strip-types --test --test-name-pattern "copia falha mostra o texto" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:588-589` - `assert.equal(textoAposCopia(true, texto), texto)` / `assert.equal(textoAposCopia(false, texto), null)` | PASS |
| C41 | copiar duas vezes deixa um projeto com o id | `node --experimental-strip-types --test --test-name-pattern "copiar duas vezes nao grava projeto" src/lib/banco.test.ts` exit 0, 1 passed | `src/lib/banco.test.ts:1854-1856` - `assert.deepEqual(lido.projects.map((item) => item.id), ["p1"])` | PASS |
| C42 | `20`→`""` sem gravar: texto antigo fica com `110`, lista mostra `88` | `node --experimental-strip-types --test --test-name-pattern "texto fica e a lista tira o coeficiente" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:757-759` - `assert.equal(copiado.texto.includes(formatBRL(110)), true)` / `assert.equal(formatBRL(lista ?? 0), formatBRL(88))` | PASS |
| C43 | sem cores: texto não leva o aviso de "nenhuma cor" | `node --experimental-strip-types --test --test-name-pattern "texto sem aviso de nenhuma cor" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:766` - `assert.equal(texto.includes("Nenhuma cor de filamento. O material entra como R$ 0,00."), false)` | PASS |
| C44 | tela mostra o aviso de "nenhuma cor" | `node --experimental-strip-types --test --test-name-pattern "aviso de nenhuma cor fica na tela" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:772` - `assert.equal(notasResultado(result, "peca").includes("Nenhuma cor de filamento. O material entra como R$ 0,00."), true)` | PASS |
| C45 | nome da cor `PLA preto` não aparece no texto | `node --experimental-strip-types --test --test-name-pattern "texto sem nome das cores" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:612-613` - `assert.equal(texto.includes("PLA preto"), false)` / `assert.equal(texto.includes("PLA branco"), false)` | PASS |
| C46 | lista de projetos não mostra `Copiar orçamento` | `node --experimental-strip-types --test --test-name-pattern "lista sem copiar orcamento" src/lib/vistas.test.ts` exit 0, 1 passed | `src/lib/vistas.test.ts:618-619` - `assert.equal(lista.includes("Copiar orçamento"), false)` / `assert.equal(lista.includes("ROTULO_COPIAR"), false)` | PASS |
| C47 | `impressora.coefficient text NOT NULL DEFAULT ''` | `node --experimental-strip-types --test --test-name-pattern "coluna coefficient no schema" src/lib/banco.test.ts` exit 0, 1 passed | `src/lib/banco.test.ts:1942-1945` - `assert.equal(colunas.rows[0]?.data_type, "text")` / `assert.equal(colunas.rows[0]?.is_nullable, "NO")` / `assert.match(colunas.rows[0]?.column_default ?? "", /''/)` | PASS |

All 48 named tests (one per check, two for C28) were located with `rg -n` before being run, so none were absent proofs. Both batched runs (non-banco files together, banco.test.ts separately) report `fail 0` with the exact count of tests requested, confirming no filter silently matched zero.

## Level and sampling

- DB-level claims (C1–C12, C47) are proven against a real Postgres instance via `banco.test.ts` (not a mock), matching the claim's level.
- Pure-parsing claims (C6, C8) are proven at the `impressora-store.ts` function level, which is the correct level — no DB round-trip is implied by those checks.
- Money/line-item claims (C14–C29) are proven at the `custo.ts` `calculate()` level with exact `formatBRL`/`formatGrams`/`formatDuration` string comparisons, matching the check's literal wording.
- Text/UI claims (C13, C23, C30–C46) are proven at the `vistas.ts` level (`textoOrcamento`, `notasResultado`, source-grep for JSX wiring) — consistent with this repo's existing convention of grepping component source for wiring alongside pure-function assertions (see pre-existing tests such as `"frase gravar o lote"` in `vistas.test.ts:106-110`).
- Sampling: the 9-member "totais do lote de prova" set (`checks.md` Coverage table) has one check per member (C14–C22) with no gaps. The two-proof check (C28) exercises both the calculation boundary (`custo.ts`) and the UI-gating boundary (`vistas.ts`/`podeCopiarOrcamento`) rather than the same proof twice.
- No check in this profile's scope names more cases than its proof exercises; no precision gap found in the 47 checks' literal values (all money/weight/text values are concrete, not ranges).

## Swept re-read

- **validation** (C14–C22): confirmed — each coefficient boundary (empty, 0, 20, 99, "99,9", 100, 101, "abc", "   ") has its own passing test in `custo.test.ts`.
- **failure modes** (C12, C40): confirmed — C12's trigger-based rollback (`banco.test.ts:1922-1933`) and C40's `textoAposCopia` fallback (`vistas.test.ts:586-591`) both exist and pass.
- **idempotency** (C41): confirmed — `banco.test.ts:1833-1859` calls `textoOrcamento` twice and asserts the project list still has exactly one row with id `p1`.
- **authorization** (existing, AD-005 + C11): confirmed — `comConta`/`contaExigida` gate every `Banco` method (`src/lib/banco.ts:36-38,645-647`), and C11 (`banco.test.ts:1911-1919`) shows the coefficient does not cross accounts.
- **concurrency** (existing, "mesma escrita que `substituirImpressoras`, sem `updated_at`"): confirmed by reading `src/lib/banco.ts:501-533` — `substituirImpressoras` upserts `coefficient` in the same statement as `name`/`watts`/etc., and the `impressora` table (`src/lib/banco.ts:274-287`) has no `updated_at` column, matching the claim.
- **data lifecycle** (C7, C10): confirmed — both pass (seeded printer and post-migration row both read `coefficient` as `""`).
- **dependency failure** (existing): not specific to this feature; `bancoIndisponivel`/`avisarIndisponivel` paths are unchanged by this diff.
- **state transitions**: n/a confirmed — the design and `custo.ts:429-434` (`totalComCoeficiente`) show `100`/`invalid` only block the *total*, the coefficient value itself is still persisted unchanged (consistent with C4/C5 writing `100`/`abc` and reading them back).
- **observability**: n/a, no log requirement in this feature; nothing in the diff adds or removes log statements.

## Gate

`node --experimental-strip-types --test --test-name-pattern <36-name alternation> src/lib/custo.test.ts src/lib/vistas.test.ts src/lib/impressora-store.test.ts` - 36 passed, 0 failed
`node --experimental-strip-types --test --test-name-pattern <12-name alternation> src/lib/banco.test.ts` - 12 passed, 0 failed

(48 named tests total across the two invocations, one per check C1–C47 plus the second C28 proof; all exist and passed.)

## Note on the proof command shape

The command shape documented in `checks.md` and in this task (`node --experimental-strip-types --test <file> --test-name-pattern "<name>"`, flag *after* the file path) does not filter on this Node version (v24.11.1): with `--test-name-pattern` placed after the file argument, Node runs every test in the file regardless of the pattern (verified directly: a nonsense pattern `"zzz-no-such-test"` placed after the file still ran all 34 tests in `custo.test.ts`). Placing `--test-name-pattern` *before* the file argument filters correctly, which is the form used for every proof run in this report. This is a tooling/documentation observation, not a check failure — every named test above was independently located with `rg -n` and shown running and passing with a correctly filtering invocation, so no check rests on the unfiltered form.
