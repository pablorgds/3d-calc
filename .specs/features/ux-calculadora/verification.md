# UX calculadora verification

**Verdict**: PASS
**Profile**: light
**Diff range**: origin/main..cef6d2242ee95c6124b7cbd61f9e4d304cac3574
**Round**: 2 - full
**Verifier**: independent sub-agent (author != verifier)

Proofs re-run at `cef6d22`. Profile `light`: no binding-source comparison, no Coverage recompute, no Test policy verdicts, no fault injection. Swept rows and one assertion per check were read at this HEAD.

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | After typing `2` then `0` and blur, the next read returns coefficient `20` | `node --experimental-strip-types --test --test-name-pattern "coeficiente 20 apos digitar rapido" src/lib/impressora-store.test.ts` exit 0 | `src/lib/impressora-store.test.ts:130` - `assert.equal(store.printers[0].coefficient, "20")` | PASS |
| C2 | Two in-flight updates, `{ coefficient: "2" }` then `{ coefficient: "20" }`, next read is `20` | `node --experimental-strip-types --test --test-name-pattern "update impressora mais recente vence" src/lib/impressora-store.test.ts` exit 0 | `src/lib/impressora-store.test.ts:142` - `assert.equal(store.printers[0].coefficient, "20")` | PASS |
| C3 | After blur of `20` with `when=blur`, the stored coefficient is not the intermediate digit `2` | `node --experimental-strip-types --test --test-name-pattern "coeficiente 20 apos digitar rapido" src/lib/impressora-store.test.ts` exit 0 | `src/lib/impressora-store.test.ts:124` - `assert.equal(persistirNumeroNoEvento("blur", "change"), false)`; `src/lib/impressora-store.test.ts:131` - `assert.notEqual(store.printers[0].coefficient, "2")` | PASS |
| C4 | Closed lines with coefficient `20` scale the piece total by `100/(100-20)` | `node --experimental-strip-types --test --test-name-pattern "coeficiente 20 leva o total a 110" src/lib/custo.test.ts` exit 0 | `src/lib/custo.test.ts:318` - `assert.equal(dinheiro(result.piece.total), formatBRL(110))`; `src/lib/custo.test.ts:320` - `assert.equal(dinheiro(result.piece.material), formatBRL(80))`; `src/lib/custo.test.ts:322` - `assert.equal(dinheiro(result.piece.labor), formatBRL(8))` | PASS |
| C5 | Resultado card keeps `md:sticky` | `node --experimental-strip-types --test --test-name-pattern "resultado sticky no md" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:779` - `assert.match(fonte("src/components/calculadora.tsx"), /md:sticky md:top-28/)` | PASS |
| C6 | `barra-lote` shows the closed lot total and the copy action when `podeCopiarOrcamento` is true | `node --experimental-strip-types --test --test-name-pattern "barra lote com total fechado" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:785` - `assert.equal(podeCopiarOrcamento(result.lot.total), true)`; `src/lib/vistas.test.ts:789` - `assert.ok(calculadora.indexOf("showMoney(result.lot.total)", barra) > barra)`; `src/lib/vistas.test.ts:791` - `assert.ok(calculadora.indexOf("ROTULO_COPIAR", barra) > barra)` | PASS |
| C7 | With lot total `null`, `barra-lote` does not offer Copiar orçamento | `node --experimental-strip-types --test --test-name-pattern "barra lote sem copiar quando lote aberto" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:804` - `assert.equal(result.lot.total, null)`; `src/lib/vistas.test.ts:805` - `assert.equal(podeCopiarOrcamento(result.lot.total), false)` | PASS |
| C8 | Success label helper is the string `Copiado` | `node --experimental-strip-types --test --test-name-pattern "rotulo copiado apos sucesso" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:813` - `assert.equal(ROTULO_COPIADO, "Copiado")`; `src/lib/vistas.test.ts:814` - `assert.equal(rotuloCopiar(true), "Copiado")` | PASS |
| C9 | Rest label stays `Copiar orçamento` (`ROTULO_COPIAR`) | `node --experimental-strip-types --test --test-name-pattern "rotulo copiar orcamento" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:820` - `assert.equal(ROTULO_COPIAR, "Copiar orçamento")`; `src/lib/vistas.test.ts:821` - `assert.equal(rotuloCopiar(false), ROTULO_COPIAR)` | PASS |
| C10 | `textoAposCopia(true, texto)` returns the selectable text when copy fails (`falhou`) | `node --experimental-strip-types --test --test-name-pattern "copia falha mostra o texto" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:590` - `assert.equal(textoAposCopia(true, texto), texto)` | PASS |
| C11 | No colors: note is exactly `Sem cores. Material R$ 0,00.` and the old sentence is absent | `node --experimental-strip-types --test --test-name-pattern "aviso curto sem cores" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:830` - `assert.equal(notes.includes("Sem cores. Material R$ 0,00."), true)`; `src/lib/vistas.test.ts:831` - `assert.equal(notes.includes("Nenhuma cor de filamento. O material entra como R$ 0,00."), false)` | PASS |
| C12 | Mode `peca` without mesas: note is exactly `Peça única: o lote é esta peça.` and the old mesa sentence is absent | `node --experimental-strip-types --test --test-name-pattern "aviso curto peca unica" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:839` - `assert.equal(notes.includes("Peça única: o lote é esta peça."), true)`; `src/lib/vistas.test.ts:840` - `assert.equal(notes.some((note) => note.includes("não há cópias na mesa") &#124;&#124; note.includes("nao há cópias na mesa")), false)` | PASS |
| C13 | `FRASE_MESAS` is the short plate sentence | `node --experimental-strip-types --test --test-name-pattern "frase mesas curta" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:844` - `assert.equal(FRASE_MESAS, "Cada mesa: um tempo e um filamento. A peça soma; as cópias multiplicam.")` | PASS |
| C14 | With the new phrases, `calculate` still flags the same cases and the notes still appear there | `node --experimental-strip-types --test --test-name-pattern "aviso curto sem cores" and "aviso curto peca unica" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:828` - `assert.equal(result.materialIssue, "no-colors")`; `src/lib/vistas.test.ts:829` - `assert.equal(result.lot.total !== null, true)`; `src/lib/vistas.test.ts:836` - `assert.equal(project.mode, "peca")`; `src/lib/vistas.test.ts:839` - `assert.equal(notes.includes("Peça única: o lote é esta peça."), true)` | PASS |
| C15 | `nome-projeto`, `cliente`, and `telefone` appear before `impressora-ativa` | `node --experimental-strip-types --test --test-name-pattern "campos identidade antes da impressora" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:855` - `assert.ok(cliente > nome)`; `src/lib/vistas.test.ts:856` - `assert.ok(telefone > cliente)`; `src/lib/vistas.test.ts:857` - `assert.ok(impressora > telefone)` | PASS |
| C16 | Testids `nome-projeto`, `cliente`, and `telefone` are still present | `node --experimental-strip-types --test --test-name-pattern "campos cliente e telefone" and "campos identidade antes da impressora" src/lib/vistas.test.ts` exit 0 | `src/lib/vistas.test.ts:854` - `assert.ok(nome >= 0)`; `src/lib/vistas.test.ts:855` - `assert.ok(cliente > nome)`; `src/lib/vistas.test.ts:856` - `assert.ok(telefone > cliente)` | PASS |

## Level and sampling

Named proofs sit in `src/lib/*.test.ts`, the layer each check names. C1 and C3 share `coeficiente 20 apos digitar rapido` and settle on different assertions (`:130` vs `:131`). C14 reuses the C11 and C12 tests; those assertions still show `materialIssue === "no-colors"`, a closed lot total, mode `peca`, and the short notes present. `custo.test.ts` is outside the feature diff; C4 was re-run at this HEAD and the piece total assertion is `formatBRL(110)` beside unscaled material `80` and labor `8`.

## Swept

- Printer update race: `src/lib/impressora-store.ts:178` `aceitar` returns false when `ticket <= s.aplicada`.
- Clipboard failure path: `src/lib/vistas.ts:137` `textoAposCopia` returns `texto` when `falhou` is true and `null` otherwise. `src/components/calculadora.tsx:475` calls `textoAposCopia(true, texto)` in the clipboard `catch`, and `:476` sets `setCopiou(false)`.
- Cost formula: `src/lib/custo.ts:433` `return total * (100 / (100 - coefficient.value))`. `custo.ts` is not in `origin/main..HEAD`.

## Gate

`node --experimental-strip-types --test --test-name-pattern "coeficiente 20 apos digitar rapido|update impressora mais recente vence|coeficiente 20 leva o total a 110|resultado sticky no md|barra lote com total fechado|barra lote sem copiar quando lote aberto|rotulo copiado apos sucesso|rotulo copiar orcamento|copia falha mostra o texto|aviso curto sem cores|aviso curto peca unica|frase mesas curta|campos identidade antes da impressora|campos cliente e telefone" src/lib/impressora-store.test.ts src/lib/vistas.test.ts src/lib/custo.test.ts` - 14 passed, 0 failed
