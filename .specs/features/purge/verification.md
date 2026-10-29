# Purge verification

**Verdict**: PASS
**Profile**: light
**Diff range**: c7972ce341ce085ba829dcc57fdfe10be8a725fe..1505a51514bfe7c127e203c3a6bbdef879dd2836
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

Binding sources, a recomputed Coverage join, Test policy verdicts, and fault injection do not run under `light`. `checks.md` has no Test policy section. No binding source was opened as a ui comparison.

## Proof run

One invocation at `HEAD` `1505a51`:

`node --experimental-strip-types --test --test-name-pattern "<53 names>" src/lib/custo.test.ts src/lib/vistas.test.ts src/lib/projetos-store.test.ts src/lib/banco.test.ts`

Exit 0. Output ends with `# tests 53`, `# pass 53`, `# fail 0`. Each named test printed its own `ok` line. `rg` found every name in the tree before the run. The four test files are in `c7972ce..HEAD`.

This VM has no Docker daemon. The suite's `docker run` / `docker exec pg_isready` / `docker port` calls were answered by a local PostgreSQL 16 so `banco.test.ts` could open a real server. The assertions below are from that run, not from a skipped filter.

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | purge `30`: preto 1.6, branco 4.8, vermelho 3.5, material 9.9, gramas 35 | same run, `ok 2 - purge 30 fecha material 9,90` | `src/lib/custo.test.ts:509` `perto(linha(result, "preto").material, 1.6)`; `:510` `perto(..., "branco").material, 4.8)`; `:511` `perto(..., "vermelho").material, 3.5)`; `:512` `perto(result.piece.material, 9.9)`; `:513` `assert.equal(result.piece.grams, 35)` | PASS |
| C2 | purge `''`: material 3.3, gramas 35 | same run, `ok 3` | `src/lib/custo.test.ts:519` `perto(result.piece.material, 3.3)`; `:520` `assert.equal(result.piece.grams, 35)` | PASS |
| C3 | purge `0`: material 3.3, gramas 35 | same run, `ok 4` | `src/lib/custo.test.ts:525` `perto(result.piece.material, 3.3)`; `:526` `assert.equal(result.piece.grams, 35)` | PASS |
| C4 | purge `   `: material 3.3, gramas 35 | same run, `ok 5` | `src/lib/custo.test.ts:531` `perto(result.piece.material, 3.3)`; `:532` `assert.equal(result.piece.grams, 35)` | PASS |
| C5 | uma cor, purge `30`: material 1.6, gramas 20 | same run, `ok 6` | `src/lib/custo.test.ts:540` `perto(result.piece.material, 1.6)`; `:541` `assert.equal(result.piece.grams, 20)` | PASS |
| C6 | ordem invertida, purge `30`: linhas 0.5, 4.8, 4, material 9.3 | same run, `ok 7` | `src/lib/custo.test.ts:552` `perto(linha(result, "vermelho").material, 0.5)`; `:553` `perto(..., "branco").material, 4.8)`; `:554` `perto(..., "preto").material, 4)`; `:555` `perto(result.piece.material, 9.3)` | PASS |
| C7 | mesmo nome `PLA preto`, purge `30`: linhas 1.6 e 4.8, material 6.4, gramas 30 | same run, `ok 8` | `src/lib/custo.test.ts:562` `perto(result.colors[0].material, 1.6)`; `:563` `perto(result.colors[1].material, 4.8)`; `:564` `perto(result.piece.material, 6.4)`; `:565` `assert.equal(result.piece.grams, 30)` | PASS |
| C8 | purge `30,5`: branco 4.86, vermelho 3.55, material 10.01 | same run, `ok 9` | `src/lib/custo.test.ts:570` `perto(linha(result, "branco").material, 4.86)`; `:571` `perto(..., "vermelho").material, 3.55)`; `:572` `perto(result.piece.material, 10.01)` | PASS |
| C9 | purge `abc`: material, mão de obra, total da peça e total do lote `null` | same run, `ok 10` | `src/lib/custo.test.ts:577` `assert.equal(result.piece.material, null)`; `:578` `assert.equal(result.piece.labor, null)`; `:579` `assert.equal(result.piece.total, null)`; `:580` `assert.equal(result.lot.total, null)` | PASS |
| C10 | purge `-1`: material `null` | same run, `ok 11` | `src/lib/custo.test.ts:585` `assert.equal(result.piece.material, null)` | PASS |
| C11 | gramas do preto `''`, purge `30`: material `null` | same run, `ok 12` | `src/lib/custo.test.ts:596` `assert.equal(result.piece.material, null)` | PASS |
| C12 | sem cores, purge `''`: material 0 | same run, `ok 13` | `src/lib/custo.test.ts:602` `assert.equal(result.piece.material, 0)` | PASS |
| C13 | sem cores, purge `30`: material 0 | same run, `ok 14` | `src/lib/custo.test.ts:607` `assert.equal(result.piece.material, 0)` | PASS |
| C14 | sem cores, purge `abc`: material `null` | same run, `ok 15` | `src/lib/custo.test.ts:612` `assert.equal(result.piece.material, null)` | PASS |
| C15 | `unica`, gramas `800`, preço `100`, purge `30`: material 80, gramas 800 | same run, `ok 16` | `src/lib/custo.test.ts:622` `perto(result.piece.material, 80)`; `:623` `assert.equal(result.piece.grams, 800)` | PASS |
| C16 | uma mesa, purge `30`: material 100, gramas 1000, total 100 | same run, `ok 17` | `src/lib/custo.test.ts:633` `perto(result.piece.material, 100)`; `:634` `assert.equal(result.piece.grams, 1000)`; `:635` `perto(result.piece.total, 100)` | PASS |
| C17 | purge `30`, mão de obra `10`: material 9.9, mão de obra 0.99, gramas 35, total 10.89 | same run, `ok 18` | `src/lib/custo.test.ts:640` `perto(result.piece.material, 9.9)`; `:641` `perto(result.piece.labor, 0.99)`; `:642` `assert.equal(result.piece.grams, 35)`; `:643` `perto(result.piece.total, 10.89)` | PASS |
| C18 | entrada de C17 com 60 min: energia 0.1, depreciação 1, mão de obra 1.1, material 9.9 | same run, `ok 19` | `src/lib/custo.test.ts:648` `perto(result.piece.energy, 0.1)`; `:649` `perto(result.piece.depreciation, 1)`; `:650` `perto(result.piece.labor, 1.1)`; `:651` `perto(result.piece.material, 9.9)` | PASS |
| C19 | coeficiente `20`: material 9.9, mão de obra 0, gramas 35, total 12.375 | same run, `ok 20` | `src/lib/custo.test.ts:656` `perto(result.piece.material, 9.9)`; `:657` `perto(result.piece.labor, 0)`; `:658` `assert.equal(result.piece.grams, 35)`; `:659` `perto(result.piece.total, 12.375)` | PASS |
| C20 | lote, cópias `2`: material do lote 9.9, da peça 4.95, gramas 35 e 17.5, linhas 1.6, 4.8, 3.5 | same run, `ok 21` | `src/lib/custo.test.ts:664` `perto(result.lot.material, 9.9)`; `:665` `perto(result.piece.material, 4.95)`; `:666` `assert.equal(result.lot.grams, 35)`; `:667` `assert.equal(result.piece.grams, 17.5)`; `:668-670` `perto` das linhas 1.6, 4.8 e 3.5 | PASS |
| C21 | lote, cópias `0`: total da peça `null`, material do lote 9.9, gramas do lote 35 | same run, `ok 22` | `src/lib/custo.test.ts:675` `assert.equal(result.piece.total, null)`; `:676` `perto(result.lot.material, 9.9)`; `:677` `assert.equal(result.lot.grams, 35)` | PASS |
| C22 | purge `abc`, 60 min: energia 0.1, depreciação 1, material `null`, mão de obra `null` | same run, `ok 23` | `src/lib/custo.test.ts:682` `perto(result.piece.energy, 0.1)`; `:683` `perto(result.piece.depreciation, 1)`; `:684` `assert.equal(result.piece.material, null)`; `:685` `assert.equal(result.piece.labor, null)` | PASS |
| C23 | várias cores, sem mesas: campo `Purge por troca (g)` | same run, `ok 25` | `src/lib/vistas.test.ts:885-887` `indexOf('colorMode === "multicolor" && mesas.length === 0')` then `indexOf("Purge por troca (g)")` with `assert.ok(rotulo > condicao)` | PASS |
| C24 | cor única: sem o campo `Purge por troca (g)` | same run, `ok 26` | `src/lib/vistas.test.ts:893-896` rótulo depois de `colorMode === "multicolor"` e `assert.equal(calculadora.split("Purge por troca (g)").length, 2)` | PASS |
| C25 | com mesa: sem o campo `Purge por troca (g)` | same run, `ok 27` | `src/lib/vistas.test.ts:902-904` `lastIndexOf("mesas.length === 0")` antes do rótulo e `assert.ok(rotulo - condicao < 200)` | PASS |
| C26 | campo visível, purge `''`: sem `Campo vazio.` | same run, `ok 28` | `src/lib/vistas.test.ts:909` `assert.equal(erroPurge(""), null)`; `:914` `assert.equal(trecho.includes("Campo vazio."), false)` | PASS |
| C27 | gravar purge `30` no lote `Suporte`: leitura `30` | same run, `ok 1 - grava purge 30` | `src/lib/banco.test.ts:1952` `assert.equal(lido.projects[0]?.name, "Suporte")`; `:1953` `assert.equal(lido.projects[0]?.purge, "30")` | PASS |
| C28 | gravar purge `''` num `Suporte` que fecha: leitura `''` | same run, `ok 2` | `src/lib/banco.test.ts:1959` `assert.equal(lido.projects[0]?.purge, "")` | PASS |
| C29 | gravar ` 30 `: leitura ` 30 ` | same run, `ok 3` | `src/lib/banco.test.ts:1965` `assert.equal(lido.projects[0]?.purge, " 30 ")` | PASS |
| C30 | gravar `   `: leitura `   ` | same run, `ok 4` | `src/lib/banco.test.ts:1971` `assert.equal(lido.projects[0]?.purge, "   ")` | PASS |
| C31 | linha antiga sem a coluna: leitura `''` | same run, `ok 5` | `src/lib/banco.test.ts:1983` `assert.equal(antigo?.purge, "")` | PASS |
| C32 | payload sem purge: leitura `''` | same run, `ok 24` | `src/lib/projetos-store.test.ts:134` `assert.equal(projects[0]?.purge, "")` | PASS |
| C33 | lote novo `Suporte` com `abc` não grava e marca `Use zero ou um número positivo.` | same run, `ok 29` | `src/lib/vistas.test.ts:918` `assert.equal(erroPurge("abc"), "Use zero ou um número positivo.")`; `:923-925` `assert.ok(retorno > recusa)` e `assert.ok(grava > retorno)` com `writeProject(` | PASS |
| C34 | purge `''` gravado, tentativa `abc`: leitura seguinte `''` | same run, `ok 30` | `src/lib/vistas.test.ts:929` `assert.equal(erroPurge("abc"), "Use zero ou um número positivo.")`; `:930` `assert.equal(erroPurge(""), null)`; `:935-936` retorno dos issues antes de `writeProject(` | PASS |
| C35 | gravar `30` e depois cor única: leitura `30` | same run, `ok 6` | `src/lib/banco.test.ts:1990` `assert.equal(lido.projects[0]?.colorMode, "unica")`; `:1991` `assert.equal(lido.projects[0]?.purge, "30")` | PASS |
| C36 | gravar `30` e depois uma mesa: leitura `30` | same run, `ok 7` | `src/lib/banco.test.ts:2009` `assert.equal(lido.projects[0]?.mesas?.length, 1)`; `:2010` `assert.equal(lido.projects[0]?.purge, "30")` | PASS |
| C37 | duplicar `Suporte` com purge `30`: cópia `30` e nome `Suporte (cópia)` | same run, `ok 8` | `src/lib/banco.test.ts:2017` `assert.equal(copia?.name, "Suporte (cópia)")`; `:2018` `assert.equal(copia?.purge, "30")` | PASS |
| C38 | duplicar mesas com purge `30`: cópia `30` | same run, `ok 9` | `src/lib/banco.test.ts:2036` `assert.equal(copia?.mesas?.length, 1)`; `:2037` `assert.equal(copia?.purge, "30")` | PASS |
| C39 | gravar `30` duas vezes no mesmo id: um projeto com `30` | same run, `ok 10` | `src/lib/banco.test.ts:2044` `assert.equal(lido.projects.length, 1)`; `:2046` `assert.equal(lido.projects[0]?.purge, "30")` | PASS |
| C40 | conta A grava `30`; conta B não lê esse `30` | same run, `ok 11` | `src/lib/banco.test.ts:2055` `assert.equal(minha.projects[0]?.purge, "30")`; `:2057-2060` `assert.equal(lido.projects.some((item) => item.purge === "30"), false)` | PASS |
| C41 | gravação de `30` que perde a corrida: leitura `''` | same run, `ok 12` | `src/lib/banco.test.ts:2067` `assert.equal(lido.projects[0]?.purge, "")` depois de `expectedUpdatedAt: 10` contra `updatedAt: 20` | PASS |
| C42 | tabela sem linha `Purge` | same run, `ok 31` | `src/lib/vistas.test.ts:942` `assert.equal(calculadora.includes('label="Purge"'), false)` | PASS |
| C43 | peso da prova com purge `30`: `formatGrams(35)` | same run, `ok 32` | `src/lib/vistas.test.ts:949` `assert.equal(formatGrams(result.piece.grams ?? 0), formatGrams(35))` | PASS |
| C44 | texto com `formatBRL(9.9)`, sem `Purge` nem `Material` | same run, `ok 33` | `src/lib/vistas.test.ts:958` `assert.equal(texto.includes(formatBRL(9.9)), true)`; `:962` `assert.equal(texto.includes("Purge"), false)`; `:963` `assert.equal(texto.includes("Material"), false)` | PASS |
| C45 | purge `abc` não mostra `Copiar orçamento` | same run, `ok 34` | `src/lib/vistas.test.ts:969` `assert.equal(podeCopiarOrcamento(result.lot.total), false)`; `:970` `assert.equal(ROTULO_COPIAR, "Copiar orçamento")` | PASS |
| C46 | lista da prova gravada: `formatBRL(9.9)` sem gravar de novo | same run, `ok 35` | `src/lib/vistas.test.ts:976` `assert.equal(formatBRL(total ?? 0), formatBRL(9.9))`; `:977` `assert.match(..., /draftToCalcInput/)` | PASS |
| C47 | coeficiente `''` para `20`: lista `formatBRL(12.375)`, purge gravado `30` | same run, `ok 36` | `src/lib/vistas.test.ts:983` `assert.equal(formatBRL(total ?? 0), formatBRL(12.375))`; `:984` `assert.equal(project.purge, "30")` | PASS |
| C48 | formulário da impressora sem `Purge por troca (g)` | same run, `ok 37` | `src/lib/vistas.test.ts:989` `assert.equal(fonte("src/components/configuracoes-form.tsx").includes("Purge por troca (g)"), false)` | PASS |
| C49 | purge `abc`, cores fechadas: sem o aviso de cor | same run, `ok 38` | `src/lib/vistas.test.ts:995` `assert.equal(notas.some((nota) => nota.includes("Há cor com preço ou peso vazio ou inválido.")), false)` | PASS |
| C50 | preço `''`, purge `30`: mostra o aviso de cor | same run, `ok 39` | `src/lib/vistas.test.ts:1009` `assert.equal(notas.some((nota) => nota.includes("Há cor com preço ou peso vazio ou inválido.")), true)` | PASS |
| C51 | sem cores, purge `''`: `Sem cores. Material R$ 0,00.` | same run, `ok 40` | `src/lib/vistas.test.ts:1015` `assert.equal(notasResultado(result, "peca").includes("Sem cores. Material R$ 0,00."), true)` | PASS |
| C52 | sem cores, purge `abc`: sem `Sem cores. Material R$ 0,00.` | same run, `ok 41` | `src/lib/vistas.test.ts:1021` `assert.equal(notasResultado(result, "peca").includes("Sem cores. Material R$ 0,00."), false)` | PASS |
| C53 | `projeto.purge text NOT NULL` default `''` | same run, `ok 13 - coluna purge no schema` | `src/lib/banco.test.ts:2077` `assert.equal(colunas.rows[0]?.column_name, "purge")`; `:2078` `assert.equal(..., "text")`; `:2079` `assert.equal(..., "NO")`; `:2080` `assert.match(..., /''/)` | PASS |

`perto` at `src/lib/custo.test.ts:496-498` requires the value not null and within `1e-9` of the number written at the call.

## Level and sampling

Money, grams, and nulls in C1–C22 are asserted on `calculate` / `draftToCalcInput`, which is the boundary those checks name. Reads and the column in C27–C32, C35–C41, and C53 hit Postgres through `banco.test.ts`. C32 is the payload parser, which is the boundary that check names.

C18 and C22 say 60 min. The tests set `hours: "1", minutes: "0"` (`src/lib/custo.test.ts:647` and `:681`). `combineTime` turns that into 60 minutes (`src/lib/custo.ts:407`). The asserted energy `0.1` and depreciation `1` are the one-hour figures the checks name.

Screen checks C23–C26, C33–C34, C42–C48 assert the strings and the source anchors the checks name (`erroPurge`, `notasResultado`, `textoOrcamento`, `formatBRL`, `draftToCalcInput`). They do not render a browser. Under `light` that is the named proof, not a ui screen pass.

C33 and C34 do not call `gravarProjeto` and then `ler`. They assert the refusal string and that `writeProject(` sits after `Object.keys(issues).length > 0`. That is the proof `checks.md` records for those two checks. A test that would still pass if that source order were unused is the gap `light` does not close.

No check names more concrete cases than the assertions in its own test. The default impressão de prova (`src/lib/custo.test.ts:482-487`) supplies purge `30` and the three colors when a test does not override them.

## Swept re-read

| Dimension | Cited constraint | Where it is | Holds |
| --- | --- | --- | --- |
| authorization | AD-005 and AD-006; C40 keeps purge on the conta | `.specs/STATE.md` AD-005 and AD-006 are active. `src/lib/banco.ts:655-656` `contaExigida` is the conta in scope. `src/lib/banco.ts:697` `ler` uses it. `src/lib/banco.ts:430` reads `projeto` with `WHERE conta_id = $1`. `src/lib/acesso.ts:42` sends a request without `sessao` to `/entrar`. C40 passed | yes |
| dependency failure | a database failure stays `Não deu para ler o banco.` | `src/lib/vistas.ts:5` `TITULO_ERRO`. `c7972ce..HEAD` does not touch `vistas.ts` or `acesso.ts` | yes |

validation, failure modes, idempotency, concurrency, data lifecycle, and state transitions are the passing checks named in Swept (C1–C4, C8–C10, C22, C26, C31–C36, C39, C41), not an existing constraint to re-read. observability is `n/a` in the approved checks.

## Gate

`node --experimental-strip-types --test --test-name-pattern "<53 names>" src/lib/custo.test.ts src/lib/vistas.test.ts src/lib/projetos-store.test.ts src/lib/banco.test.ts` — 53 passed, 0 failed
