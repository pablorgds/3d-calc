# Modelo suíço verification

**Verdict**: PASS
**Profile**: light
**Diff range**: 14f11ce..07ac117
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

Proofs ran once at `07ac117` (HEAD): `node --experimental-strip-types --test src/lib/casca.test.ts src/lib/controles.test.ts src/lib/movimento.test.ts src/lib/tema-escuro.test.ts --test-name-pattern` with the alternation of the 58 Proof names. Exit 0. `58` passed, `0` failed. Each name below is a `✔` line from that run. All four files are in `14f11ce..07ac117`.

checks.md has no Test policy section, so level uses the repo convention.

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | page `#FFFFFF`, body text `#1A1A1A`, no `dark` | ✔ `fundo e texto claros` | `src/lib/casca.test.ts:65` - `assert.equal(prop(raiz, "--background"), "#FFFFFF")`; `src/lib/casca.test.ts:68` - `assert.equal(prop(body, "background"), "var(--background)")` | PASS |
| C2 | each `h1` at `2.25rem` weight `700` | ✔ `h1 2.25rem peso 700` | `src/lib/casca.test.ts:74` - `assert.equal(prop(titulo, "font-size"), "2.25rem")`; `src/lib/casca.test.ts:75` - `assert.equal(prop(titulo, "font-weight"), "700")` | PASS |
| C3 | lede `1rem` / `400` / `1.6` / `72ch` | ✔ `lede 1rem 72ch` | `src/lib/casca.test.ts:90` - `assert.equal(prop(lede, "font-size"), "1rem")`; `src/lib/casca.test.ts:93` - `assert.equal(prop(lede, "max-width"), "72ch")` | PASS |
| C4 | card title `1.5rem` weight `700` | ✔ `titulo de card 1.5rem` | `src/lib/casca.test.ts:105` - `assert.equal(prop(titulo, "font-size"), "1.5rem")`; `src/lib/casca.test.ts:106` - `assert.equal(prop(titulo, "font-weight"), "700")` | PASS |
| C5 | caption `0.875rem` weight `500` | ✔ `legenda 0.875rem peso 500` | `src/lib/casca.test.ts:112` - `assert.equal(prop(legenda, "font-size"), "0.875rem")`; `src/lib/casca.test.ts:113` - `assert.equal(prop(legenda, "font-weight"), "500")` | PASS |
| C6 | column `1280px`, padding `1.5rem`, centered | ✔ `coluna 1280px padding 1.5rem` | `src/lib/casca.test.ts:129` - `assert.equal(prop(coluna, "max-width"), "1280px")`; `src/lib/casca.test.ts:131` - `assert.equal(prop(coluna, "margin-inline"), "auto")` | PASS |
| C7 | `body` `min-height: 100dvh` | ✔ `body min-height 100dvh` | `src/lib/casca.test.ts:143` - `assert.equal(prop(regra(css, "body"), "min-height"), "100dvh")` | PASS |
| C8 | `html` and `body` have no `height: 100vh` | ✔ `sem height 100vh` | `src/lib/casca.test.ts:151` - `assert.doesNotMatch(regra(css, "html"), /100vh/)`; `src/lib/casca.test.ts:152` - `assert.doesNotMatch(regra(css, "body"), /100vh/)` | PASS |
| C9 | header `#1A1A1A` / `#FFFFFF` / `1px` `#808080` | ✔ `cabecalho 1A1A1A borda 808080` | `src/lib/casca.test.ts:158` - `assert.equal(prop(barra, "background"), "#1A1A1A")`; `src/lib/casca.test.ts:160` - `assert.equal(prop(barra, "border-bottom"), "1px solid #808080")` | PASS |
| C10 | header z-index `100` | ✔ `z-index do cabecalho 100` | `src/lib/casca.test.ts:166` - `assert.equal(prop(regra(css, ".site-header"), "z-index"), "100")` | PASS |
| C11 | totals bar z-index `100` | ✔ `z-index da barra de totais 100` | `src/lib/casca.test.ts:171` - `assert.equal(prop(regra(css, ".barra-totais"), "z-index"), "100")` | PASS |
| C12 | gap `clamp(4rem, 8vw, 8rem)` | ✔ `vao clamp 4rem 8vw 8rem` | `src/lib/casca.test.ts:176` - `assert.equal(prop(regra(css, ".cabecalho-pagina"), "margin-bottom"), "clamp(4rem, 8vw, 8rem)")` | PASS |
| C13 | sibling cards `1.5rem` | ✔ `cards irmaos 1.5rem` | `src/lib/casca.test.ts:186` - `assert.equal(prop(regra(css, ".pilha"), "gap"), "1.5rem")` | PASS |
| C14 | calculator one column below `768px` | ✔ `calculadora em coluna abaixo de 768` | `src/lib/casca.test.ts:193` - `assert.equal(prop(regra(css, ".grade-calculadora"), "grid-template-columns"), "minmax(0, 1fr)")` | PASS |
| C15 | totals bar visible below `768px` | ✔ `barra de totais visivel abaixo de 768` | `src/lib/casca.test.ts:198` - `assert.equal(prop(regra(css, ".barra-totais"), "display"), "grid")` | PASS |
| C16 | calculator side by side from `768px` | ✔ `calculadora lado a lado a partir de 768` | `src/lib/casca.test.ts:205` - `assert.equal(prop(grade, "grid-template-columns"), "minmax(0, 1fr) minmax(18rem, 22rem)")` | PASS |
| C17 | totals bar hidden from `768px` | ✔ `barra de totais oculta a partir de 768` | `src/lib/casca.test.ts:210` - `assert.equal(prop(regra(larga, ".barra-totais"), "display"), "none")` | PASS |
| C18 | Projetos and Configurações one column at `320px` and `1280px` | ✔ `projetos e configuracoes em uma coluna` | `src/lib/casca.test.ts:215` - `assert.equal(prop(regra(css, ".coluna-unica"), "flex-direction"), "column")`; `src/lib/casca.test.ts:216` - `assert.doesNotMatch(regra(css, "@media (min-width: 768px)"), /\.coluna-unica/)` | PASS |
| C19 | at `320px`, scroll width equals viewport width | ✔ `scroll igual ao viewport em 320` | `src/lib/casca.test.ts:224` - `assert.equal(prop(regra(css, "html"), "overflow-x"), "clip")`; `src/lib/casca.test.ts:227` - `assert.equal(prop(regra(css, ".grade-calculadora"), "grid-template-columns"), "minmax(0, 1fr)")` | PASS |
| C20 | titles `Calculadora`, `Projetos`, `Configurações`, `Página não encontrada` | ✔ `titulos das quatro telas` | `src/lib/casca.test.ts:234` - `assert.match(calculadora, />Calculadora</)`; `src/lib/casca.test.ts:237` - `assert.match(ausente, /title="Página não encontrada"/)` | PASS |
| C21 | primary button `#1A1A1A` / `#FFFFFF` / `600` / `12px` / radius `0` / `44px` | ✔ `botao primario claro` | `src/lib/controles.test.ts:114` - `assert.equal(prop(regra(css, ":root"), "--primary"), "#1A1A1A")`; `src/lib/controles.test.ts:119` - `assert.equal(prop(botao, "min-height"), "44px")` | PASS |
| C22 | hover `#181818` and `0 4px 12px rgba(0,0,0,0.12)` in `200ms` ease-out | ✔ `hover do primario claro` | `src/lib/controles.test.ts:124` - `assert.equal(prop(hover, "background"), "#181818")`; `src/lib/controles.test.ts:127` - `assert.match(transicao, /background-color 200ms ease-out/)` | PASS |
| C23 | active primary moves `translateY(1px)` in light and dark | ✔ `ativo desce 1px` | `src/lib/controles.test.ts:133` - `assert.equal(prop(ativo, "transform"), "translateY(1px)")`; `src/lib/controles.test.ts:135` - `assert.doesNotMatch(css, /html\.dark \.btn-primario:active/)` | PASS |
| C24 | outline `1.5px` `#808080`, text `#1A1A1A`, radius `0`, hover `#F5F1E8` | ✔ `botao outline claro` | `src/lib/controles.test.ts:141` - `assert.equal(prop(botao, "border"), "1.5px solid #808080")`; `src/lib/controles.test.ts:145` - `assert.equal(prop(regra(css, "html:not(.dark) .btn-outline:hover"), "background"), "#F5F1E8")` | PASS |
| C25 | ghost border width `0`, text `#1A1A1A`, radius `0`, hover `#F5F1E8` | ✔ `botao ghost claro` | `src/lib/controles.test.ts:151` - `assert.equal(prop(botao, "border-width"), "0")`; `src/lib/controles.test.ts:155` - `assert.equal(prop(regra(css, "html:not(.dark) .btn-ghost:hover"), "background"), "#F5F1E8")` | PASS |
| C26 | card `#FFFFFF`, radius `0`, `1px` `#808080`, shadow `0 2px 12px rgba(0,0,0,0.06)` | ✔ `card claro` | `src/lib/controles.test.ts:161` - `assert.equal(prop(regra(css, ":root"), "--card"), "#FFFFFF")`; `src/lib/controles.test.ts:164` - `assert.equal(prop(card, "box-shadow"), "0 2px 12px rgba(0,0,0,0.06)")` | PASS |
| C27 | label above the input, `0.875rem`, weight `500`, tracking `0.04em` | ✔ `rotulo 0.875rem tracking 0.04em` | `src/lib/controles.test.ts:170` - `assert.equal(prop(rotulo, "font-size"), "0.875rem")`; `src/lib/controles.test.ts:187` - `assert.ok(rotuloEm < Math.min(...controles))` | PASS |
| C28 | label `0.5rem` from the input | ✔ `rotulo a 0.5rem do campo` | `src/lib/controles.test.ts:192` - `assert.equal(prop(regra(css, "html .campo"), "gap"), "0.5rem")` | PASS |
| C29 | input radius `0`, border `1px solid #808080` | ✔ `input raio 0 borda 808080` | `src/lib/controles.test.ts:198` - `assert.equal(prop(input, "border-radius"), "0")`; `src/lib/controles.test.ts:199` - `assert.equal(prop(input, "border"), "1px solid #808080")` | PASS |
| C30 | focus ring `2px` `#B38B6D` offset `2px` | ✔ `anel de foco B38B6D` | `src/lib/controles.test.ts:205` - `assert.equal(prop(foco, "outline"), "2px solid var(--ring)")`; `src/lib/controles.test.ts:207` - `assert.equal(prop(regra(css, ":root"), "--ring"), "#B38B6D")` | PASS |
| C31 | invalid number shows `Use zero ou um número positivo.` in `#9B1C1C` at `0.875rem` | ✔ `numero invalido 9B1C1C` | `src/lib/controles.test.ts:211` - `assert.match(numero, /<p className="erro-campo">Use zero ou um número positivo\.<\/p>/)`; `src/lib/controles.test.ts:214` - `assert.equal(prop(erro, "color"), "#9B1C1C")` | PASS |
| C32 | empty name on save shows `Dê um nome para gravar o lote.` in `#9B1C1C` at `0.875rem` | ✔ `nome vazio ao gravar` | `src/lib/controles.test.ts:219` - `assert.match(calculadora, /Dê um nome para gravar o lote\./)`; `src/lib/controles.test.ts:223` - `assert.equal(prop(erro, "color"), "#9B1C1C")` | PASS |
| C33 | empty number shows `Campo vazio.` in `#4A4A4A` | ✔ `campo vazio no claro` | `src/lib/controles.test.ts:228` - `assert.match(numero, /<p className="vazio-campo">Campo vazio\.<\/p>/)`; `src/lib/controles.test.ts:230` - `assert.equal(prop(regra(css, "html:not(.dark) .vazio-campo"), "color"), "#4A4A4A")` | PASS |
| C34 | current nav link weight `500` and `2px` `#B38B6D` | ✔ `nav ativo peso 500 traco B38B6D` | `src/lib/controles.test.ts:235` - `assert.equal(prop(ativo, "font-weight"), "500")`; `src/lib/controles.test.ts:236` - `assert.equal(prop(ativo, "box-shadow"), "inset 0 -2px 0 0 #B38B6D")` | PASS |
| C35 | wordmark `custo/chapa` sans, weight `700`, `#FFFFFF` | ✔ `wordmark custo/chapa` | `src/lib/controles.test.ts:245` - `assert.equal(prop(marca, "font-weight"), "700")`; `src/lib/controles.test.ts:247` - `assert.match(header, /className="wordmark">\s*custo\/chapa\s*<\/Link>/)` | PASS |
| C36 | selected mode border `2px` `#B38B6D` | ✔ `modo marcado borda B38B6D` | `src/lib/controles.test.ts:251` - `assert.equal(prop(regra(css, "html .modo-marcado"), "border"), "2px solid #B38B6D")` | PASS |
| C37 | money, grams, and duration use `var(--font-geist-mono)` | ✔ `figuras em geist mono` | `src/lib/controles.test.ts:256` - `assert.equal(prop(regra(css, "html .figura"), "font-family"), "var(--font-geist-mono)")`; `src/lib/controles.test.ts:265` - `assert.match(calculadora, /kind="grams"/)` | PASS |
| C38 | filament sample is a circle | ✔ `amostra de cor circular` | `src/lib/controles.test.ts:271` - `assert.equal(prop(regra(css, "html .amostra-cor"), "border-radius"), "50%")` | PASS |
| C39 | `#B38B6D` only on nav indicator, selected mode, and focus ring | ✔ `taupe so no traco no modo e no anel` | `src/lib/controles.test.ts:298` - `assert.deepEqual([...papeis].sort(), ["anel", "modo", "traco"])` | PASS |
| C40 | contrast at least `7:1` for the six named pairs | ✔ `contraste 7 para 1` | `src/lib/controles.test.ts:303` - `["#1A1A1A", "#FFFFFF"]`; `src/lib/controles.test.ts:311` - `assert.ok(contraste(frente, fundo) >= 7, \`${frente} sobre ${fundo}\`)` | PASS |
| C41 | muted wash `#F5F1E8` | ✔ `lavagem muted F5F1E8` | `src/lib/controles.test.ts:316` - `assert.equal(prop(regra(css, ":root"), "--muted"), "#F5F1E8")` | PASS |
| C42 | destructive button text `#9B1C1C` | ✔ `texto destructive 9B1C1C` | `src/lib/controles.test.ts:328` - `assert.equal(prop(regra(css, "html .btn-destructive"), "color"), "#9B1C1C")` | PASS |
| C43 | interface has no emoji | ✔ `interface sem emoji` | `src/lib/controles.test.ts:337` - `assert.equal(emoji.test(fs.readFileSync(arquivo, "utf8")), false, arquivo)` | PASS |
| C44 | main from opacity `0` / `translateY(16px)` to `1` / `0` in `420ms` ease-out | ✔ `main entra em 420ms` | `src/lib/movimento.test.ts:57` - `assert.equal(prop(entrar, "animation-duration"), "420ms")`; `src/lib/movimento.test.ts:61` - `assert.match(frames, /transform:\s*translateY\(16px\)/)` | PASS |
| C45 | list items wait `80ms` times the index | ✔ `atraso 80ms por indice` | `src/lib/movimento.test.ts:70` - `assert.equal(atrasoLista(1, 2), "80ms")`; `src/lib/movimento.test.ts:73` - `assert.match(lista, /atrasoLista\(index, projects\.length\)/)` | PASS |
| C46 | route change fades `main` over `200ms` | ✔ `troca de rota em 200ms` | `src/lib/movimento.test.ts:80` - `assert.equal(tipoMontagem(), "troca")`; `src/lib/movimento.test.ts:81` - `assert.equal(prop(regra(css, 'main[data-motion="troca"]'), "animation-duration"), "200ms")` | PASS |
| C47 | reduced motion sets mount, stagger, and route fade to `0ms` | ✔ `reduced motion 0ms` | `src/lib/movimento.test.ts:102` - `assert.equal(prop(regra(reduce, seletor), "animation-duration"), "0ms", seletor)`; `src/lib/movimento.test.ts:104` - `assert.equal(prop(regra(reduce, ".item-lista"), "animation-delay"), "0ms")` | PASS |
| C48 | mount and route fade animate only `opacity` and `transform` | ✔ `so opacity e transform` | `src/lib/movimento.test.ts:111` - `assert.ok(item === "opacity" or item === "transform")`; `src/lib/movimento.test.ts:118` - `assert.deepEqual(troca.filter((item) => item !== "opacity" && item !== "transform"), [])` | PASS |
| C49 | dark page `#1A1A1A`, body text `#FFFFFF` | ✔ `fundo e texto escuros` | `src/lib/tema-escuro.test.ts:51` - `assert.equal(prop(escuro, "--background"), "#1A1A1A")`; `src/lib/tema-escuro.test.ts:55` - `assert.equal(prop(body, "color"), "var(--foreground)")` | PASS |
| C50 | dark primary `#FFFFFF` / `#1A1A1A` / `600` / `12px` / radius `0` / `44px` | ✔ `botao primario escuro` | `src/lib/tema-escuro.test.ts:63` - `assert.equal(prop(escuro, "--primary"), "#FFFFFF")`; `src/lib/tema-escuro.test.ts:68` - `assert.equal(prop(botao, "min-height"), "44px")` | PASS |
| C51 | dark hover `#EBEBEB` and `0 4px 12px rgba(0,0,0,0.12)` in `200ms` ease-out | ✔ `hover do primario escuro` | `src/lib/tema-escuro.test.ts:73` - `assert.equal(prop(hover, "background"), "#EBEBEB")`; `src/lib/tema-escuro.test.ts:76` - `assert.match(transicao, /background-color 200ms ease-out/)` | PASS |
| C52 | dark outline `1.5px` `#808080`, text `#FFFFFF`, radius `0`, hover `#2E2E2E` | ✔ `botao outline escuro` | `src/lib/tema-escuro.test.ts:83` - `assert.equal(prop(botao, "border"), "1.5px solid #808080")`; `src/lib/tema-escuro.test.ts:87` - `assert.equal(prop(regra(css, "html.dark .btn-outline:hover"), "background"), "#2E2E2E")` | PASS |
| C53 | dark ghost border width `0`, text `#FFFFFF`, radius `0`, hover `#2E2E2E` | ✔ `botao ghost escuro` | `src/lib/tema-escuro.test.ts:93` - `assert.equal(prop(botao, "border-width"), "0")`; `src/lib/tema-escuro.test.ts:97` - `assert.equal(prop(regra(css, "html.dark .btn-ghost:hover"), "background"), "#2E2E2E")` | PASS |
| C54 | dark card `#242424`, radius `0`, `1px` `#808080`, same shadow | ✔ `card escuro` | `src/lib/tema-escuro.test.ts:103` - `assert.equal(prop(escuro, "--card"), "#242424")`; `src/lib/tema-escuro.test.ts:106` - `assert.equal(prop(card, "box-shadow"), "0 2px 12px rgba(0,0,0,0.06)")` | PASS |
| C55 | dark muted `#2E2E2E`, secondary text `#D6D6D6` | ✔ `muted escuro D6D6D6` | `src/lib/tema-escuro.test.ts:110` - `assert.equal(prop(escuro, "--muted"), "#2E2E2E")`; `src/lib/tema-escuro.test.ts:111` - `assert.equal(prop(escuro, "--muted-foreground"), "#D6D6D6")` | PASS |
| C56 | empty number in dark shows `Campo vazio.` in `#D6D6D6` | ✔ `campo vazio no escuro` | `src/lib/tema-escuro.test.ts:118` - `assert.match(numero, /<p className="vazio-campo">Campo vazio\.<\/p>/)`; `src/lib/tema-escuro.test.ts:119` - `assert.equal(prop(regra(css, "html.dark .vazio-campo"), "color"), "#D6D6D6")` | PASS |
| C57 | `:root` stores the eleven light tokens, and `layout.tsx` imports `globals.css` | ✔ `tokens claros no root` | `src/lib/casca.test.ts:242` - `assert.match(layout, /import\s+"\.\/globals\.css"/)`; `src/lib/casca.test.ts:258` - `assert.equal(prop(raiz, nome), valor, nome)` | PASS |
| C58 | `.dark` stores the seven dark tokens | ✔ `tokens escuros no dark` | `src/lib/tema-escuro.test.ts:133` - `assert.equal(prop(escuro, nome), valor, nome)` | PASS |

## Level and sampling

No level gap. checks.md has no Test policy section. The repo convention is `node --experimental-strip-types --test` on `src/lib/*.test.ts`. These 58 proofs are that, and each file is in the diff. No claim names a status code, route, or response shape. `Surface` lists none.

No precision gap. Each check names a concrete value, and the assertion cited above repeats that value.

No sampling gap. Set claims assert every named member in the same test:

- C2 and C3: the type rule is on `.titulo-pagina` / `.lede`; Calculadora matches the class; Projetos, Configurações, and Página não encontrada match `PageIntro`, whose single `h1` / `p` carries it (`src/lib/casca.test.ts:77`, `src/lib/casca.test.ts:98`).
- C6: header, Calculadora `main`, and `PageIntro` `main` use `.coluna` (`src/lib/casca.test.ts:132`).
- C18: `.coluna-unica` is `column` and the `768px` query does not restyle it, so both `320px` and `1280px` use that rule (`src/lib/casca.test.ts:216`).
- C19: one width. The base grid is `minmax(0, 1fr)` and `html` is `overflow-x: clip`; the `18rem` track is asserted only inside `min-width: 768px` (`src/lib/casca.test.ts:229`), so the `320px` case is the base rule.
- C20: the four title strings are each matched (`src/lib/casca.test.ts:234` through `src/lib/casca.test.ts:237`).
- C23: one `:active` rule, and no `html.dark .btn-primario:active` override (`src/lib/controles.test.ts:135`).
- C37: `.figura` is `var(--font-geist-mono)`; money and duration markup use `figura`; grams is `kind="grams"` on the row whose cells are `td.figura` (`src/lib/controles.test.ts:261`, `src/lib/controles.test.ts:265`).
- C39: the set of roles must equal `anel`, `modo`, `traco` (`src/lib/controles.test.ts:298`).
- C40: the loop asserts `>= 7` for all six pairs listed at `src/lib/controles.test.ts:302`.
- C45: both lists call `atrasoLista(index, length)` (`src/lib/movimento.test.ts:73`, `src/lib/movimento.test.ts:74`); indices `0`, `1`, and `2` return `0ms`, `80ms`, and `160ms`.
- C46: duration `200ms` on `main[data-motion="troca"]`; `/`, `/projetos`, and `/configuracoes` are the three files in the loop at `src/lib/movimento.test.ts:82`.
- C47: `entrar`, `troca`, and `.item-lista` durations are `0ms`, and the stagger delay is `0ms` (`src/lib/movimento.test.ts:101`).
- C48: keyframes `entrar` and `troca` may only be `opacity` or `transform` (`src/lib/movimento.test.ts:111`).
- C57: the object at `src/lib/casca.test.ts:244` has the eleven light tokens; the loop asserts each.
- C58: the object at `src/lib/tema-escuro.test.ts:123` has the seven dark tokens; the loop asserts each.

## Swept existing

Re-read only the Swept row that says `existing`. The other eight rows are check ids or `n/a`.

| Dimension | Cited constraint | Where it is | Reading |
| --- | --- | --- | --- |
| authorization | AD-001, não há conta nem sessão | `.specs/STATE.md:7` is active. No `middleware.ts`. `cookies(` is absent from `src/lib/banco.ts` and `src/lib/acoes.ts`. The existing lock is `src/lib/banco.test.ts:476` - `assert.equal(bancoSrc.includes("cookies("), false)`. | holds |

## Gate

`node --experimental-strip-types --test src/lib/casca.test.ts src/lib/controles.test.ts src/lib/movimento.test.ts src/lib/tema-escuro.test.ts --test-name-pattern <alternation of the 58 Proof names>` — 58 passed, 0 failed, exit 0
