# Modelo suíço checks

Profile: light
Plan: `.specs/features/modelo-suico/plan.md`

58 checks in 4 slices · 2 one-way doors · 0 open

## Checks

### S1 - Casca · 11 files · 44 KB · ~11k

**C1** - Sem a classe `dark` em `html`, o fundo da página é `#FFFFFF` e o texto do `body` é `#1A1A1A` (AC 1)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "fundo e texto claros"`
Status: done

**C2** - O `h1` de Calculadora, Projetos, Configurações e Página não encontrada fica a `2.25rem` com font-weight `700` (AC 2)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "h1 2.25rem peso 700"`
Status: done

**C3** - O lede de cada uma dessas quatro telas fica a `1rem`, font-weight `400`, line-height `1.6` e max-width `72ch` (AC 3)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "lede 1rem 72ch"`
Status: done

**C4** - Cada título de card fica a `1.5rem` com font-weight `700` (AC 4)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "titulo de card 1.5rem"`
Status: done

**C5** - Cada legenda fica a `0.875rem` com font-weight `500` (AC 5)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "legenda 0.875rem peso 500"`
Status: done

**C6** - O cabeçalho e cada `main` ficam centrados numa coluna de max-width `1280px` com padding horizontal `1.5rem` (AC 6)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "coluna 1280px padding 1.5rem"`
Status: done

**C7** - O `body` tem `min-height: 100dvh` (AC 7)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "body min-height 100dvh"`
Status: done

**C8** - `html` e `body` não têm `height: 100vh` (AC 8)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "sem height 100vh"`
Status: done

**C9** - O fundo do cabeçalho é `#1A1A1A`, os rótulos são `#FFFFFF` e a borda inferior é `1px` `#808080` (AC 9)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "cabecalho 1A1A1A borda 808080"`
Status: done

**C10** - O z-index do cabeçalho é `100` (AC 10)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "z-index do cabecalho 100"`
Status: done

**C11** - O z-index da barra fixa de totais é `100` (AC 11)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "z-index da barra de totais 100"`
Status: done

**C12** - O vão entre o título da página e o conteúdo abaixo é `clamp(4rem, 8vw, 8rem)` (AC 12)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "vao clamp 4rem 8vw 8rem"`
Status: done

**C13** - Cards irmãos se separam por `1.5rem` (AC 13)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "cards irmaos 1.5rem"`
Status: done

**C14** - Abaixo de `768px`, o formulário da calculadora e o resultado ficam numa coluna (AC 14)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "calculadora em coluna abaixo de 768"`
Status: done

**C15** - Abaixo de `768px`, a barra fixa de totais está visível (AC 15)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "barra de totais visivel abaixo de 768"`
Status: done

**C16** - A partir de `768px`, o formulário da calculadora e o resultado ficam lado a lado (AC 16)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "calculadora lado a lado a partir de 768"`
Status: done

**C17** - A partir de `768px`, a barra fixa de totais fica oculta (AC 17)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "barra de totais oculta a partir de 768"`
Status: done

**C18** - Projetos e Configurações ficam numa coluna a `320px` e a `1280px` (AC 18)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "projetos e configuracoes em uma coluna"`
Status: done

**C19** - A `320px`, a largura de scroll do documento é igual à largura do viewport (AC 19)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "scroll igual ao viewport em 320"`
Status: done

**C20** - Os títulos das páginas são `Calculadora`, `Projetos`, `Configurações` e `Página não encontrada` (AC 20)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "titulos das quatro telas"`
Status: done

**C57** - `layout.tsx` importa `globals.css`, e `:root` grava `--background #FFFFFF`, `--foreground #1A1A1A`, `--primary #1A1A1A`, `--primary-foreground #FFFFFF`, `--muted #F5F1E8`, `--muted-foreground #4A4A4A`, `--border #808080`, `--ring #B38B6D`, `--card #FFFFFF`, `--destructive #9B1C1C` e `--radius 0px` (door 1)
Proof: `node --experimental-strip-types --test src/lib/casca.test.ts --test-name-pattern "tokens claros no root"`
Status: done

### S2 - Controles · 9 files · 45 KB · ~11k

**C21** - Sem a classe `dark`, o botão primário tem fundo `#1A1A1A`, texto `#FFFFFF`, font-weight `600`, padding `12px`, border-radius `0` e min-height `44px` (AC 21)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "botao primario claro"`
Status: done

**C22** - No hover do botão primário, sem a classe `dark`, o fundo vai a `#181818` e a sombra a `0 4px 12px rgba(0,0,0,0.12)` em `200ms` ease-out (AC 22)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "hover do primario claro"`
Status: done

**C23** - Com o botão primário ativo, no claro e no escuro, ele desce com `translateY(1px)` (AC 23)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "ativo desce 1px"`
Status: done

**C24** - Sem a classe `dark`, o botão outline tem borda `1.5px` `#808080`, texto `#1A1A1A`, border-radius `0` e hover com fundo `#F5F1E8` (AC 24)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "botao outline claro"`
Status: done

**C25** - Sem a classe `dark`, o botão ghost tem borda de largura `0`, texto `#1A1A1A`, border-radius `0` e hover com fundo `#F5F1E8` (AC 25)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "botao ghost claro"`
Status: done

**C26** - Sem a classe `dark`, cada card tem fundo `#FFFFFF`, border-radius `0`, borda `1px` `#808080` e sombra `0 2px 12px rgba(0,0,0,0.06)` (AC 26)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "card claro"`
Status: done

**C27** - O rótulo de cada campo fica acima do input, a `0.875rem`, font-weight `500` e letter-spacing `0.04em` (AC 27)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "rotulo 0.875rem tracking 0.04em"`
Status: done

**C28** - O rótulo de cada campo fica a `0.5rem` do input (AC 28)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "rotulo a 0.5rem do campo"`
Status: done

**C29** - Cada input de texto tem border-radius `0` e borda `1px` solid `#808080` (AC 29)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "input raio 0 borda 808080"`
Status: done

**C30** - Com o input em foco, o anel é `2px` `#B38B6D` com offset `2px` (AC 30)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "anel de foco B38B6D"`
Status: done

**C31** - Valor inválido num campo numérico mostra `Use zero ou um número positivo.` abaixo do campo, em `#9B1C1C`, a `0.875rem` (AC 31)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "numero invalido 9B1C1C"`
Status: done

**C32** - Nome vazio ao gravar mostra `Dê um nome para gravar o lote.` abaixo do campo, em `#9B1C1C`, a `0.875rem` (AC 32)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "nome vazio ao gravar"`
Status: done

**C33** - Campo numérico vazio, sem a classe `dark`, mostra `Campo vazio.` abaixo do campo, em `#4A4A4A` (AC 33)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "campo vazio no claro"`
Status: done

**C34** - O link da página atual tem font-weight `500` e um indicador de `2px` `#B38B6D` (AC 34)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "nav ativo peso 500 traco B38B6D"`
Status: done

**C35** - O wordmark `custo/chapa`, inclusive a barra, está na fonte sans, peso `700` e cor `#FFFFFF` (AC 35)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "wordmark custo/chapa"`
Status: done

**C36** - A opção de modo marcada tem borda `2px` `#B38B6D` (AC 36)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "modo marcado borda B38B6D"`
Status: done

**C37** - Dinheiro, gramas e duração usam `font-family: var(--font-geist-mono)`, e `layout.tsx` define `--font-geist-sans` e `--font-geist-mono` (AC 37, door 2)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "figuras em geist mono"`
Status: done

**C38** - Cada amostra de cor do filamento é um círculo (AC 38)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "amostra de cor circular"`
Status: done

**C39** - `#B38B6D` aparece no indicador da nav, na borda do modo marcado e no anel de foco, e em nenhum outro uso (AC 39)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "taupe so no traco no modo e no anel"`
Status: done

**C40** - O contraste fica em pelo menos `7:1` para `#1A1A1A` sobre `#FFFFFF`, `#4A4A4A` sobre `#FFFFFF`, `#4A4A4A` sobre `#F5F1E8`, `#FFFFFF` sobre `#1A1A1A`, `#D6D6D6` sobre `#1A1A1A` e `#9B1C1C` sobre `#FFFFFF` (AC 40)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "contraste 7 para 1"`
Status: done

**C41** - Sem a classe `dark`, a lavagem muted é `#F5F1E8` (AC 41)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "lavagem muted F5F1E8"`
Status: done

**C42** - O texto do botão destructive é `#9B1C1C` (AC 42)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "texto destructive 9B1C1C"`
Status: done

**C43** - A interface não contém caractere emoji (AC 43)
Proof: `node --experimental-strip-types --test src/lib/controles.test.ts --test-name-pattern "interface sem emoji"`
Status: done

### S3 - Movimento · 4 files · 34 KB · ~9k

**C44** - Ao montar, o `main` vai de `opacity: 0` e `translateY(16px)` a `opacity: 1` e `translateY(0)` em `420ms` ease-out (AC 44)
Proof: `node --experimental-strip-types --test src/lib/movimento.test.ts --test-name-pattern "main entra em 420ms"`
Status: done

**C45** - Com mais de um item, cada item da lista de projetos e da lista de filamentos espera `80ms` vezes o índice (AC 45)
Proof: `node --experimental-strip-types --test src/lib/movimento.test.ts --test-name-pattern "atraso 80ms por indice"`
Status: done

**C46** - A troca entre `/`, `/projetos` e `/configuracoes` esmaece o `main` em `200ms` (AC 46)
Proof: `node --experimental-strip-types --test src/lib/movimento.test.ts --test-name-pattern "troca de rota em 200ms"`
Status: done

**C47** - Com `prefers-reduced-motion: reduce`, as durações da entrada, do atraso da lista e do esmaecimento de rota são `0ms` (AC 47)
Proof: `node --experimental-strip-types --test src/lib/movimento.test.ts --test-name-pattern "reduced motion 0ms"`
Status: done

**C48** - A entrada e o esmaecimento de rota animam só `opacity` e `transform` (AC 48)
Proof: `node --experimental-strip-types --test src/lib/movimento.test.ts --test-name-pattern "so opacity e transform"`
Status: done

### S4 - Tokens escuros · 6 files · 13 KB · ~3k

**C49** - Com a classe `dark` em `html`, o fundo da página é `#1A1A1A` e o texto do `body` é `#FFFFFF` (AC 49)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "fundo e texto escuros"`

**C50** - Com a classe `dark`, o botão primário tem fundo `#FFFFFF`, texto `#1A1A1A`, font-weight `600`, padding `12px`, border-radius `0` e min-height `44px` (AC 50)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "botao primario escuro"`

**C51** - No hover do botão primário, com a classe `dark`, o fundo vai a `#EBEBEB` e a sombra a `0 4px 12px rgba(0,0,0,0.12)` em `200ms` ease-out (AC 51)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "hover do primario escuro"`

**C52** - Com a classe `dark`, o botão outline tem borda `1.5px` `#808080`, texto `#FFFFFF`, border-radius `0` e hover com fundo `#2E2E2E` (AC 52)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "botao outline escuro"`

**C53** - Com a classe `dark`, o botão ghost tem borda de largura `0`, texto `#FFFFFF`, border-radius `0` e hover com fundo `#2E2E2E` (AC 53)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "botao ghost escuro"`

**C54** - Com a classe `dark`, cada card tem fundo `#242424`, border-radius `0`, borda `1px` `#808080` e sombra `0 2px 12px rgba(0,0,0,0.06)` (AC 54)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "card escuro"`

**C55** - Com a classe `dark`, a lavagem muted é `#2E2E2E` e o texto secundário é `#D6D6D6` (AC 55)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "muted escuro D6D6D6"`

**C56** - Campo numérico vazio, com a classe `dark`, mostra `Campo vazio.` abaixo do campo, em `#D6D6D6` (AC 56)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "campo vazio no escuro"`

**C58** - `.dark` grava `--background #1A1A1A`, `--foreground #FFFFFF`, `--primary #FFFFFF`, `--primary-foreground #1A1A1A`, `--card #242424`, `--muted #2E2E2E` e `--muted-foreground #D6D6D6` (door 1)
Proof: `node --experimental-strip-types --test src/lib/tema-escuro.test.ts --test-name-pattern "tokens escuros no dark"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| portas (2) | paleta C57, C58 · mono C37 | - |
| tokens claros (11) | C57, table-driven over all 11 | - |
| tokens escuros (7) | C58, table-driven over all 7 | - |
| startup tema (1) | layout.tsx C57 | - |
| títulos (4) | Calculadora C20 · Projetos C20 · Configurações C20 · Página não encontrada C20 | - |
| h1 (4) | C2, table-driven over all 4 | - |
| ledes (4) | C3, table-driven over all 4 | - |
| coluna 1280px (5) | cabeçalho C6 · Calculadora C6 · Projetos C6 · Configurações C6 · não encontrada C6 | - |
| faixa da calculadora (2) | abaixo de 768 C14 · a partir de 768 C16 | - |
| barra de totais (2) | visível abaixo de 768 C15 · oculta a partir de 768 C17 | - |
| coluna Projetos e Configurações (2) | 320px C18 · 1280px C18 | - |
| botões no claro (3) | primário C21 · outline C24 · ghost C25 | - |
| botões no escuro (3) | primário C50 · outline C52 · ghost C53 | - |
| ativo do primário (2) | claro C23 · escuro C23 | - |
| figuras mono (3) | dinheiro C37 · gramas C37 · duração C37 | - |
| usos de #B38B6D (3) | C39, table-driven over all 3 | - |
| pares de contraste (6) | `#1A1A1A`/`#FFFFFF` C40 · `#4A4A4A`/`#FFFFFF` C40 · `#4A4A4A`/`#F5F1E8` C40 · `#FFFFFF`/`#1A1A1A` C40 · `#D6D6D6`/`#1A1A1A` C40 · `#9B1C1C`/`#FFFFFF` C40 | - |
| movimentos (3) | entrada C44 · lista C45 · troca de rota C46 | - |
| listas com atraso (2) | projetos C45 · filamentos C45 | - |
| durações com reduce (3) | C47, table-driven over all 3 | - |
| propriedades do movimento (2) | opacity C48 · transform C48 | - |
| troca de rota (3) | `/` C46 · `/projetos` C46 · `/configuracoes` C46 | - |

- Claims naming a status code, route or response shape: none — Surface não lista rota
- Checks whose claim is a set: C2, C3, C6, C18, C20, C23, C37, C39, C40, C45, C46, C47, C48, C57, C58 — each member in Coverage is asserted by that proof
- No other check claims more than the single case its proof exercises

## Swept

- validation: C31, C32, C33, C56
- failure modes: C20, C31, C32
- idempotency: n/a - esta mudança não repete gravação nem pedido
- authorization: existing - AD-001, não há conta nem sessão
- concurrency: n/a - não há escrita compartilhada nesta mudança
- data lifecycle: n/a - o plano não migra dado gravado
- dependency failure: n/a - não entra serviço externo; Geist já está na página
- state transitions: C34, C36, C46
- observability: n/a - o plano não pede log nem métrica

## Handoff

- S1 = 11.3k (45142 bytes / 4). S2 soma 8851 bytes novos e o único acumulado vai a 53993 bytes, ~13.5k. S3 e S4 não acrescentam arquivo. 13.5k fica abaixo do orçamento de 150k — one builder
- Mechanism: one builder
