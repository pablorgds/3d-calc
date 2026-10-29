# UX calculadora verification

**Verdict**: FAIL
**Profile**: light
**Diff range**: origin/main..HEAD
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | after `2` then `0` and blur, next read is coefficient `20` | batched `node --experimental-strip-types --test --test-name-pattern "<14-name alternation>" src/lib/impressora-store.test.ts src/lib/vistas.test.ts src/lib/custo.test.ts` exit 0; `coeficiente 20 apos digitar rapido` ok 2 | `src/lib/impressora-store.test.ts:130` - `assert.equal(store.printers[0].coefficient, "20")` | PASS |
| C2 | two in-flight updates, later `{ coefficient: "20" }` wins | same invocation; `update impressora mais recente vence` ok 3 | `src/lib/impressora-store.test.ts:142` - `assert.equal(store.printers[0].coefficient, "20")` | PASS |
| C3 | after blur `20`, final stored coefficient is not a lone intermediate digit | same invocation and test as C1; `assert.notEqual` on `"2"` | `src/lib/impressora-store.test.ts:131` - `assert.notEqual(store.printers[0].coefficient, "2")` | PASS |
| C4 | coefficient `20`, closed lines: piece total is unscaled sum × `100/(100-20)` | same invocation; `coeficiente 20 leva o total a 110` ok 1. File `src/lib/custo.test.ts` is **not** in `origin/main..HEAD`; the claim is the existing AD-010 scale (88 × 1.25 = 110), which that assertion still targets at HEAD | `src/lib/custo.test.ts:318` - `assert.equal(dinheiro(result.piece.total), formatBRL(110))` | PASS |
| C5 | Resultado card keeps `md:sticky` | same invocation; `resultado sticky no md` ok 6 | `src/lib/vistas.test.ts:779` - `assert.match(fonte("src/components/calculadora.tsx"), /md:sticky md:top-28/)` | PASS |
| C6 | `data-testid="barra-lote"` shows closed lot total and, when `podeCopiarOrcamento` is true, the copy action | same invocation; `barra lote com total fechado` ok 7 | `src/lib/vistas.test.ts:789-791` - `assert.ok(calculadora.indexOf("showMoney(result.lot.total)", barra) > barra)` / `assert.ok(calculadora.indexOf("podeCopiarOrcamento(result.lot.total)", barra) > barra)` / `assert.ok(calculadora.indexOf("ROTULO_COPIAR", barra) > barra)` | PASS |
| C7 | lot total `null`: `barra-lote` does not offer Copiar orçamento | same invocation; `barra lote sem copiar quando lote aberto` ok 8 | `src/lib/vistas.test.ts:804-805` - `assert.equal(result.lot.total, null)` / `assert.equal(podeCopiarOrcamento(result.lot.total), false)` | PASS |
| C8 | post-success copy label helper/constant is `Copiado` | same invocation; `rotulo copiado apos sucesso` ok 9 | `src/lib/vistas.test.ts:813-814` - `assert.equal(ROTULO_COPIADO, "Copiado")` / `assert.equal(rotuloCopiar(true), "Copiado")` | PASS |
| C9 | rest label remains `Copiar orçamento` (`ROTULO_COPIAR`) | same invocation; `rotulo copiar orcamento` ok 10 | `src/lib/vistas.test.ts:820-821` - `assert.equal(ROTULO_COPIAR, "Copiar orçamento")` / `assert.equal(rotuloCopiar(false), ROTULO_COPIAR)` | PASS |
| C10 | `textoAposCopia(false, texto)` still returns the selectable text and does not mark a successful copy | same invocation; `copia falha mostra o texto` ok 5. Named test exists and ran. Settling line is `assert.equal(textoAposCopia(false, texto), null)` — that is the opposite of the check-defined return. The sibling line `textoAposCopia(true, texto) === texto` targets the other boolean. No assertion in this test says the control is not `Copiado` | `src/lib/vistas.test.ts:591` - `assert.equal(textoAposCopia(false, texto), null)` | FAIL |
| C11 | no colors: `notasResultado` includes exactly `Sem cores. Material R$ 0,00.` and not the old phrase | same invocation; `aviso curto sem cores` ok 11 | `src/lib/vistas.test.ts:830-831` - `assert.equal(notes.includes("Sem cores. Material R$ 0,00."), true)` / `assert.equal(notes.includes("Nenhuma cor de filamento. O material entra como R$ 0,00."), false)` | PASS |
| C12 | mode `peca` without mesas: note is `Peça única: o lote é esta peça.` and not the old “cópias na mesa” line | same invocation; `aviso curto peca unica` ok 12 | `src/lib/vistas.test.ts:839-840` - `assert.equal(notes.includes("Peça única: o lote é esta peça."), true)` then `notes.some` rejects both `não há cópias na mesa` and `nao há cópias na mesa` | PASS |
| C13 | `FRASE_MESAS` is `Cada mesa: um tempo e um filamento. A peça soma; as cópias multiplicam.` | same invocation; `frase mesas curta` ok 13 | `src/lib/vistas.test.ts:844` - `assert.equal(FRASE_MESAS, "Cada mesa: um tempo e um filamento. A peça soma; as cópias multiplicam.")` | PASS |
| C14 | with the new phrases, `calculate` and when the notes appear stay the same | same invocation; `aviso curto sem cores` ok 11 and `aviso curto peca unica` ok 12 | `src/lib/vistas.test.ts:828` - `assert.equal(result.materialIssue, "no-colors")`; `src/lib/vistas.test.ts:836` - `assert.equal(project.mode, "peca")` then notes include the new linha | PASS |
| C15 | in `calculadora.tsx`, `nome-projeto`, `cliente`, `telefone` appear before `impressora-ativa` | same invocation; `campos identidade antes da impressora` ok 14 | `src/lib/vistas.test.ts:857` - `assert.ok(impressora > telefone)` (with `nome`/`cliente`/`telefone` ordered above) | PASS |
| C16 | testids `nome-projeto`, `cliente`, `telefone` remain | same invocation; `campos identidade antes da impressora` ok 14 (also ran `campos cliente e telefone` ok 4, which asserts rótulos, not the testids) | `src/lib/vistas.test.ts:854-856` - `assert.ok(nome >= 0)` / `assert.ok(cliente > nome)` / `assert.ok(telefone > cliente)` | PASS |

Named tests located with `rg -n` in `src/lib/impressora-store.test.ts`, `src/lib/vistas.test.ts`, `src/lib/custo.test.ts` before the run. The batch listed each of the 14 distinct names individually (`# tests 14`, `# pass 14`, `# fail 0`). C1 and C3 share one name, so they share one TAP line.

## Level and sampling

- C1–C3 sit at `impressora-store` (`criarOrdemDeAtualizacao` / `persistirNumeroNoEvento` / `updatePrinter`), not a `/configuracoes` blur or a server re-read. That matches the repo’s `src/lib/*.test.ts` policy and the check wording (“next read” of the store). C1’s “types `2` then `0`” is simulated as tickets plus patches `{ coefficient: "20" }` then `{ coefficient: "2" }`, not keystrokes.
- C4 is `calculate()` money, which is the level AD-010 and the check name. `custo.ts` / `custo.test.ts` are outside the feature diff; the proof is a regression of the existing scale, not of the new race fix.
- C5–C7, C15–C16 are source-string wiring in `calculadora.tsx` (allowed by Test policy). C7 asserts `podeCopiarOrcamento(null) === false` and that the helper is referenced after `barra-lote`; it does not assert the Copiar control is absent in a rendered tree.
- C8–C9 prove the label strings and `rotuloCopiar`. They do not assert AC 8’s “within one second” or AC 9’s three-second return (those bounds are not in the check text). `MS_ROTULO_COPIADO` is only `assert.match`’d in the C8 test, not compared to `1000` or `3000`.
- C10 is the failure: the check-defined call is `textoAposCopia(false, texto)` returning the fallback text; the proof asserts `null`. “Does not mark Copiado” has no located assertion.
- C11–C13 are exact phrase / `includes` / `FRASE_MESAS` equality at `vistas.ts`. C14’s “when notes appear” is sampled on `materialIssue === "no-colors"` and mode `peca` without mesas; it does not assert `calculate()` outputs. `custo.ts` is untouched in the diff, which is consistent with “calculate does not change” but is not a C14 assertion.
- Sampling: each of C1–C16 has a named test that exists and ran. No check names a larger case table than its proof walks.

## Swept re-read

- **Race on printer updates (C1–C3)**: present. `src/lib/impressora-store.ts:160-184` — `persistirNumeroNoEvento("blur", …)` only persists on blur; `criarOrdemDeAtualizacao().aceitar` drops a stale ticket. `src/components/number-field.tsx` gates `onChange` with that helper; `src/components/configuracoes-form.tsx` coeficiente uses `when="blur"`.
- **Clipboard failure path unchanged (C10)**: the helper is still `textoAposCopia(falhou, texto)` → `falhou ? texto : null` (`src/lib/vistas.ts:137-138`). `calculadora.tsx:472` uses `false` on the success path and `:475` uses `true` on failure. That matches the *test* and AC 10, and contradicts C10’s written `(false, texto)` → text. Constraint cited by the Swept row is in the code; the check text is the mismatch.
- **Cost formula untouched (C4 + existing custo tests)**: confirmed. `src/lib/custo.ts` is not in `origin/main..HEAD`. `totalComCoeficiente` at `src/lib/custo.ts:429-433` is still `total * (100 / (100 - coefficient.value))` and still skips line items. C4’s `formatBRL(110)` is the closed 88 scaled by `100/80`.

## Gate

`node --experimental-strip-types --test --test-name-pattern "coeficiente 20 apos digitar rapido|update impressora mais recente vence|coeficiente 20 leva o total a 110|resultado sticky no md|barra lote com total fechado|barra lote sem copiar quando lote aberto|rotulo copiado apos sucesso|rotulo copiar orcamento|copia falha mostra o texto|aviso curto sem cores|aviso curto peca unica|frase mesas curta|campos identidade antes da impressora|campos cliente e telefone" src/lib/impressora-store.test.ts src/lib/vistas.test.ts src/lib/custo.test.ts` - 14 passed, 0 failed

## Ranked gaps

1. C10 - check-defined `textoAposCopia(false, texto)` shall return the selectable text; proof asserts `null` at `src/lib/vistas.test.ts:591`. Align the check boolean with `falhou` (`true` → text) or change the assertion to the check-defined call. Also add an assertion that the control is not `Copiado` on failure.
2. C8/C9 (precision, not a row fail) - AC 8 “within one second” and AC 9 “within three seconds” are not in the check text and are not asserted; `MS_ROTULO_COPIADO` is `3000`.
3. C7 (level) - “does not offer Copiar” is proven only via `podeCopiarOrcamento(null) === false` plus a source index, not a missing rótulo in the compact control.
