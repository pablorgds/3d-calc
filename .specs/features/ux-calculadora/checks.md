# UX calculadora checks

Profile: light
Plan: `.specs/features/ux-calculadora/plan.md`

16 checks in 5 slices · 0 one-way doors · 0 open

## Checks

### S1 - Coeficiente sem corrida · impressora / NumberField

**C1** - Depois de digitar `2` e `0` no Coeficiente de erro (%) da impressora ativa e o campo perder o foco, a leitura seguinte devolve coefficient `20` (AC 1)
Proof: `node --experimental-strip-types --test --test-name-pattern "coeficiente 20 apos digitar rapido" src/lib/impressora-store.test.ts`
Status: done

**C2** - Com dois updates em voo no mesmo id, patch `{ coefficient: "2" }` e depois `{ coefficient: "20" }`, a leitura seguinte devolve coefficient `20` (AC 2)
Proof: `node --experimental-strip-types --test --test-name-pattern "update impressora mais recente vence" src/lib/impressora-store.test.ts`
Status: done

**C3** - Após o blur com valor `20` no NumberField do coeficiente (`when=blur`), o valor final persistido nao é um dígito intermediário sozinho (AC 3)
Proof: `node --experimental-strip-types --test --test-name-pattern "coeficiente 20 apos digitar rapido" src/lib/impressora-store.test.ts`
Status: done

**C4** - Com coefficient `20` e custo das linhas fechado, o total da peça é a soma das linhas vezes `100/(100-20)` (AC 4)
Proof: `node --experimental-strip-types --test --test-name-pattern "coeficiente 20 leva o total a 110" src/lib/custo.test.ts`
Status: done

### S2 - Resultado sempre à vista · calculadora

**C5** - O card Resultado em `calculadora.tsx` mantém a classe `md:sticky` (AC 5)
Proof: `node --experimental-strip-types --test --test-name-pattern "resultado sticky no md" src/lib/vistas.test.ts`
Status: done

**C6** - Existe na calculadora um controle com `data-testid="barra-lote"` que, com lote fechado, mostra o total do lote; quando `podeCopiarOrcamento` é true, oferece a ação de copiar (AC 6)
Proof: `node --experimental-strip-types --test --test-name-pattern "barra lote com total fechado" src/lib/vistas.test.ts`
Status: done

**C7** - Com total do lote `null`, `barra-lote` nao oferece Copiar orçamento (AC 7)
Proof: `node --experimental-strip-types --test --test-name-pattern "barra lote sem copiar quando lote aberto" src/lib/vistas.test.ts`
Status: done

### S3 - Feedback ao Copiar · calculadora / vistas

**C8** - Constante ou helper de rótulo pós-cópia bem-sucedida é a string `Copiado` (AC 8)
Proof: `node --experimental-strip-types --test --test-name-pattern "rotulo copiado apos sucesso" src/lib/vistas.test.ts`
Status: done

**C9** - O rótulo de descanso do botão continua `Copiar orçamento` (`ROTULO_COPIAR`) (AC 9)
Proof: `node --experimental-strip-types --test --test-name-pattern "rotulo copiar orcamento" src/lib/vistas.test.ts`
Status: done

**C10** - Helper `textoAposCopia(true, texto)` devolve o texto para seleção quando a cópia falha (`falhou`) e nao marca cópia bem-sucedida (AC 10)
Proof: `node --experimental-strip-types --test --test-name-pattern "copia falha mostra o texto" src/lib/vistas.test.ts`
Status: done

### S4 - Avisos mais curtos · vistas

**C11** - Sem cores, `notasResultado` inclui exatamente `Sem cores. Material R$ 0,00.` e nao inclui a frase antiga `Nenhuma cor de filamento. O material entra como R$ 0,00.` (AC 11)
Proof: `node --experimental-strip-types --test --test-name-pattern "aviso curto sem cores" src/lib/vistas.test.ts`
Status: done

**C12** - Em mode `peca` sem mesas, a nota de peça única é exatamente `Peça única: o lote é esta peça.` e nao a frase antiga com `nao há cópias na mesa` (AC 12)
Proof: `node --experimental-strip-types --test --test-name-pattern "aviso curto peca unica" src/lib/vistas.test.ts`
Status: done

**C13** - `FRASE_MESAS` é exatamente `Cada mesa: um tempo e um filamento. A peça soma; as cópias multiplicam.` (AC 13)
Proof: `node --experimental-strip-types --test --test-name-pattern "frase mesas curta" src/lib/vistas.test.ts`
Status: done

**C14** - Com as frases novas, `calculate` e quando as notas aparecem nao mudam em relação ao comportamento pré-feature (AC 14)
Proof: `node --experimental-strip-types --test --test-name-pattern "aviso curto sem cores|aviso curto peca unica" src/lib/vistas.test.ts`
Status: done

### S5 - Identidade do lote no topo · calculadora

**C15** - Em `calculadora.tsx`, os `data-testid` `nome-projeto`, `cliente` e `telefone` aparecem no arquivo antes de `impressora-ativa` (AC 15–16 wiring)
Proof: `node --experimental-strip-types --test --test-name-pattern "campos identidade antes da impressora" src/lib/vistas.test.ts`
Status: done

**C16** - Os testids `nome-projeto`, `cliente` e `telefone` continuam presentes (AC 16)
Proof: `node --experimental-strip-types --test --test-name-pattern "campos cliente e telefone|campos identidade antes da impressora" src/lib/vistas.test.ts`
Status: done

## Coverage

| Set | Members | Checks |
| --- | --- | --- |
| Slices S1–S5 | coeficiente race, sticky/barra, feedback copiar, avisos curtos, topo identidade | C1–C16 |
| Frases curtas | Sem cores… / Peça única… / Cada mesa… | C11–C13 |

## Test policy

- Prefer `src/lib/*.test.ts` with `node --experimental-strip-types --test` as the rest of the repo.
- UI wiring may be proven by reading source strings in `vistas.test.ts` (same convention as coeficiente C13/C23).
- Do not weaken assertions. Pattern flag before the file path (Node 24).

## Swept

- Race on printer updates (C1–C3)
- Clipboard failure path unchanged (C10)
- Cost formula untouched (C4 + existing custo tests)

## Handoff

- S1–S5 = 96778 bytes (`calculadora.tsx` 37610 + `vistas.ts` 10505 + `vistas.test.ts` 29890 + `impressora-store.ts` 4774 + `impressora-store.test.ts` 3630 + `impressora.ts` 2036 + `number-field.tsx` 2200 + `configuracoes-form.tsx` 6133) / 4 = 24194
- Total 24194, abaixo do orçamento de 150k — one builder
- Mechanism: one builder
- **Boundary:** C1–C16 closed at d1cc981ffb52cf9736a55524d94df4ea011eedf9
- **Settled mid-build:** none
- **Abandoned:** none