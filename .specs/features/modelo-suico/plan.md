# Modelo suíço

## Problem

A calculadora, Projetos e Configurações ainda vestem o tema padrão do shadcn: primário laranja, canto de `0.625rem`, coluna de `1024px` e cabeçalho claro. Quem precifica uma impressão lê um formulário genérico, com a cor de destaque competindo com o preço.

O modelo entregue não traz número de conversão nem data. Traz um conflito interno: o YAML pede preto `#000000`, texto de botão `#808080` e cantos de `2px`/`4px`/`8px`; os Do's proíbem preto puro e exigem contraste WCAG AAA; a seção Components pede canto `0`. `#808080` sobre `#FFFFFF` mede `3.81:1`. `#808080` sobre `#000000` mede `4.40:1`. `#B38B6D` sobre `#000000` mede `4.92:1`, abaixo de `7:1` para texto.

Quando isto chega, as quatro telas passam a ler como um instrumento só: barra escura, página branca, traço taupe só onde não é texto, e os mesmos números de antes.

## Flow

Reaproveita as variáveis já consumidas em `globals.css` e os primitivos `button`, `card`, `input` e `label`. Não cria um segundo arquivo de tema.

1. O modelo entra em `globals.css` (exists) — grava `:root` e `.dark` (door 1) e entrega `--background`, `--foreground`, `--primary`, `--muted`, `--ring` e `--radius` a quem já usa essas variáveis.
2. `layout.tsx` (exists) — `body` com `min-height: 100dvh` e sem `height: 100vh`, e mantém Geist Sans e Geist Mono (door 2).
3. `site-header.tsx` (exists) — barra `#1A1A1A`, rótulos `#FFFFFF`, borda inferior `1px` `#808080`, z-index `100`, wordmark em sans peso `700` na cor `#FFFFFF`, item ativo com peso `500` e traço `2px` `#B38B6D`. `#B38B6D` não entra em texto.
4. `page-intro.tsx` (exists) e os `main` de `calculadora.tsx` (exists) — coluna `1280px`, padding horizontal `1.5rem`, `h1` a `2.25rem` peso `700`, lede a `1rem` / `1.6` / `72ch`, título de card a `1.5rem` peso `700`, legenda a `0.875rem` peso `500`, vão depois do título `clamp(4rem, 8vw, 8rem)`, cards irmãos a `1.5rem`, scroll horizontal ausente a `320px`.
5. `button.tsx` (exists), `card.tsx` (exists), `input.tsx` (exists), `label.tsx` (exists) e `number-field.tsx` (exists) — canto `0`; no claro, primário `#1A1A1A` / `#FFFFFF`, outline com borda `1.5px` `#808080`, ghost sem borda, card `#FFFFFF` com sombra `0 2px 12px rgba(0,0,0,0.06)`; no `.dark`, primário `#FFFFFF` / `#1A1A1A` e card `#242424`. Hover do primário em `200ms` ease-out (`#181818` no claro, `#EBEBEB` no escuro) e `:active` com `translateY(1px)`. Rótulo acima do campo, a `0.5rem`, `0.875rem`, peso `500`, tracking `0.04em`. Input com borda `1px` `#808080` e anel de foco `2px` `#B38B6D` offset `2px`. Erro `#9B1C1C` a `0.875rem`, inclusive o texto do botão destructive. Lavagem muted `#F5F1E8` no claro e `#2E2E2E` no escuro.
6. `calculadora.tsx` (exists), `lista-projetos.tsx` (exists) e `configuracoes-form.tsx` (exists) — abaixo de `768px` a calculadora fica numa coluna e mostra a barra de totais em z-index `100`; a partir de `768px` o formulário e o resultado ficam lado a lado e a barra some. Projetos e Configurações continuam numa coluna a `320px` e a `1280px`. Valores de dinheiro, gramas e duração usam `--font-geist-mono`. A opção de modo marcada leva borda `2px` `#B38B6D`. A amostra de cor do filamento continua um círculo. Campo vazio mostra `Campo vazio.` em `#4A4A4A` no claro e `#D6D6D6` no escuro. Nome vazio ao gravar mostra `Dê um nome para gravar o lote.`
7. `calculadora.tsx` (exists) e `lista-projetos.tsx` (exists) — o `main` entra só com `opacity` e `transform`, em `420ms` ease-out, de `translateY(16px)` e `opacity: 0` até `0` e `1`; cada item da lista de projetos e da lista de filamentos espera `80ms` vezes o índice; a troca entre `/`, `/projetos` e `/configuracoes` esmaece o `main` em `200ms`; com `prefers-reduced-motion: reduce` essas durações vão a `0ms`.
8. out: `/`, `/projetos`, `/configuracoes` e a página não encontrada mostram os títulos `Calculadora`, `Projetos`, `Configurações` e `Página não encontrada`, a mesma conta, e nenhum emoji.

## Impact

| Front | What changes |
| --- | --- |
| domain | existing term: `--primary` meant the orange accent `oklch(0.64 0.19 42)`, now means off-black `#1A1A1A` on the light theme and `#FFFFFF` on `.dark` — the default `button`, and today the wordmark slash, branch on it. The slash stops using it and becomes `#FFFFFF` |
| domain | existing term: `--radius` meant `0.625rem`, now means `0px` — `button`, `card`, and `input` take their corners from it |
| domain | existing term: `--ring` meant a neutral focus gray, now means taupe `#B38B6D` — `button` and `input` focus rings branch on it today; the nav indicator and the selected mode border join them |
| domain | existing term: `--muted` meant a gray wash, now means beige `#F5F1E8` in light and `#2E2E2E` in `.dark` — notes, empty hints, and total blocks use `bg-muted` today |
| stored data | nothing to migrate |

## Relations

None - no stored-data shape change

## Surface

None - nothing consumed outside

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Palette and radius live in the existing `:root` and `.dark` | light: `--background #FFFFFF`, `--foreground #1A1A1A`, `--primary #1A1A1A`, `--primary-foreground #FFFFFF`, `--muted #F5F1E8`, `--muted-foreground #4A4A4A`, `--border #808080`, `--ring #B38B6D`, `--card #FFFFFF`, `--destructive #9B1C1C`, `--radius 0px`. `.dark`: `--background #1A1A1A`, `--foreground #FFFFFF`, `--primary #FFFFFF`, `--primary-foreground #1A1A1A`, `--card #242424`, `--muted #2E2E2E`, `--muted-foreground #D6D6D6` | a second token file beside the shadcn variables — the next screen would have two palettes to copy |
| Technical figures stay on the mono already loaded | `font-family: var(--font-geist-mono)` on money, grams, and duration | JetBrains Mono through `next/font/google` — a new font download when a monospace is already on the page |

- Nothing else in this change is hard to reverse

## Criteria

O Typography do modelo pede rótulo a `0.875rem`; o token `label-caps` pede `0.75rem`. Vale `0.875rem`. O bloco Shapes pede canto `0`; o YAML lista `2px`, `4px` e `8px`. Botão, card e input ficam em `0`. O YAML pinta o texto do botão de `#808080` (`3.81:1` sobre branco). O texto do botão escuro é `#FFFFFF`. O Don't proíbe `#000000`. A tinta é `#1A1A1A`. `#B38B6D` sobre essa tinta mede `4.18:1`, então não colore texto: fica no traço do item ativo, na borda do modo marcado e no anel de foco. O escurecimento de 8% de `#1A1A1A` é `#181818`. No botão branco do tema escuro, 8% abaixo de `#FFFFFF` é `#EBEBEB`. O modelo escreve o press como "-1px" e como "tactile press"; o ativo desce `1px`.

### S1: Casca das quatro telas (P1)

Uma coluna, uma escala de tipo e uma barra escura em Calculadora, Projetos, Configurações e na página não encontrada.

**Acceptance Criteria**

1. WHILE `html` has no class `dark` the system SHALL paint the page background `#FFFFFF` and the body text `#1A1A1A`
2. The system SHALL render each page `h1` at `2.25rem` with font-weight `700`
3. The system SHALL render each page lede at `1rem`, font-weight `400`, line-height `1.6`, and max-width `72ch`
4. The system SHALL render each card title at `1.5rem` with font-weight `700`
5. The system SHALL render captions at `0.875rem` with font-weight `500`
6. The system SHALL center the header and each `main` in a column of max-width `1280px` with horizontal padding `1.5rem`
7. The system SHALL set `body` to `min-height: 100dvh`
8. The system SHALL NOT set `html` or `body` to `height: 100vh`
9. The system SHALL paint the header background `#1A1A1A`, the header labels `#FFFFFF`, and a `1px` bottom border `#808080`
10. The system SHALL set the header z-index to `100`
11. The system SHALL set the fixed totals bar z-index to `100`
12. The system SHALL separate the page heading from the content under it by `clamp(4rem, 8vw, 8rem)`
13. The system SHALL separate sibling cards by `1.5rem`
14. WHEN the viewport width is below `768px` THEN the system SHALL stack the calculator form and the result in one column
15. WHEN the viewport width is below `768px` THEN the system SHALL show the fixed totals bar
16. WHEN the viewport width is at least `768px` THEN the system SHALL place the calculator form and the result side by side
17. WHEN the viewport width is at least `768px` THEN the system SHALL hide the fixed totals bar
18. The system SHALL keep Projetos and Configurações in one column at `320px` and at `1280px`
19. WHEN the viewport width is `320px` THEN the system SHALL keep the document scroll width equal to the viewport width
20. The system SHALL keep the page titles `Calculadora`, `Projetos`, `Configurações`, and `Página não encontrada`

**Independent test:** abrir `/` a `1280px` e a `320px` e conferir barra, título, coluna e a barra de totais; repetir o título em `/projetos`, `/configuracoes` e num endereço inexistente.

### S2: Controles (P1)

Botão, card, campo e navegação. Apagar usa ghost e Duplicar usa outline: os dois recebem o mesmo hover, e só o outline leva a borda de `1.5px`.

**Acceptance Criteria**

21. WHILE `html` has no class `dark` the system SHALL render the primary button with background `#1A1A1A`, text `#FFFFFF`, font-weight `600`, padding `12px`, border-radius `0`, and min-height `44px`
22. WHEN a pointer hovers a primary button and `html` has no class `dark` THEN the system SHALL set its background to `#181818` and its shadow to `0 4px 12px rgba(0,0,0,0.12)` over `200ms` ease-out
23. WHEN a primary button is active THEN the system SHALL move it down with `translateY(1px)`
24. WHILE `html` has no class `dark` the system SHALL render the outline button with a `1.5px` border `#808080`, text `#1A1A1A`, border-radius `0`, and a hover background `#F5F1E8`
25. WHILE `html` has no class `dark` the system SHALL render the ghost button with no border, text `#1A1A1A`, border-radius `0`, and a hover background `#F5F1E8`
26. WHILE `html` has no class `dark` the system SHALL render each card with background `#FFFFFF`, border-radius `0`, a `1px` border `#808080`, and shadow `0 2px 12px rgba(0,0,0,0.06)`
27. The system SHALL render each field label above its input at `0.875rem`, font-weight `500`, and letter-spacing `0.04em`
28. The system SHALL separate each field label from its input by `0.5rem`
29. The system SHALL render each text input with border-radius `0` and a `1px` solid border `#808080`
30. WHEN an input is focused THEN the system SHALL draw a `2px` ring `#B38B6D` offset by `2px`
31. IF a number field value is invalid THEN the system SHALL show `Use zero ou um número positivo.` below the field in `#9B1C1C` at `0.875rem`
32. IF the project name is empty when saving THEN the system SHALL show `Dê um nome para gravar o lote.` below the field in `#9B1C1C` at `0.875rem`
33. IF a number field is empty and `html` has no class `dark` THEN the system SHALL show `Campo vazio.` below the field in `#4A4A4A`
34. WHILE a nav link is the current page the system SHALL set its font-weight to `500` and show a `2px` indicator `#B38B6D`
35. The system SHALL render the wordmark `custo/chapa` in the sans font at weight `700` and in `#FFFFFF`
36. WHILE a mode option is selected the system SHALL draw a `2px` border `#B38B6D` on it
37. The system SHALL render money, grams, and duration with the font family from `--font-geist-mono`
38. The system SHALL render each filament color sample as a circle
39. The system SHALL use `#B38B6D` only on the nav indicator, the selected mode border, and the focus ring
40. The system SHALL keep contrast at or above `7:1` for `#1A1A1A` on `#FFFFFF`, `#4A4A4A` on `#FFFFFF`, `#4A4A4A` on `#F5F1E8`, `#FFFFFF` on `#1A1A1A`, `#D6D6D6` on `#1A1A1A`, and `#9B1C1C` on `#FFFFFF`
41. WHILE `html` has no class `dark` the system SHALL paint muted washes `#F5F1E8`
42. The system SHALL render destructive button text in `#9B1C1C`
43. The system SHALL render the interface with no emoji character

**Independent test:** na calculadora, focar um campo, apagar o valor, digitar `-1`, gravar sem nome, passar o ponteiro no botão primário e marcar `O lote inteiro`.

### S3: Movimento (P2)

Entrada, lista e troca de rota. Só `opacity` e `transform` nessas três.

**Acceptance Criteria**

44. WHEN a page `main` mounts THEN the system SHALL animate it from `opacity: 0` and `translateY(16px)` to `opacity: 1` and `translateY(0)` over `420ms` ease-out
45. WHEN the project list or the filament list renders more than one item THEN the system SHALL delay each item by `80ms` times its index
46. WHEN the route changes among `/`, `/projetos`, and `/configuracoes` THEN the system SHALL fade the `main` region over `200ms`
47. IF `prefers-reduced-motion: reduce` is set THEN the system SHALL set the mount, stagger, and route-fade durations to `0ms`
48. The system SHALL animate the mount and the route fade with only `opacity` and `transform`

**Independent test:** abrir `/`, ir a `/projetos` com dois projetos salvos, e repetir com `prefers-reduced-motion: reduce`.

### S4: Tokens escuros (P2)

A classe `dark` em `html` inverte a tinta. Nada na interface liga essa classe.

**Acceptance Criteria**

49. WHILE `html` has the class `dark` the system SHALL paint the page background `#1A1A1A` and the body text `#FFFFFF`
50. WHILE `html` has the class `dark` the system SHALL render the primary button with background `#FFFFFF`, text `#1A1A1A`, font-weight `600`, padding `12px`, border-radius `0`, and min-height `44px`
51. WHEN a pointer hovers a primary button and `html` has the class `dark` THEN the system SHALL set its background to `#EBEBEB` and its shadow to `0 4px 12px rgba(0,0,0,0.12)` over `200ms` ease-out
52. WHILE `html` has the class `dark` the system SHALL render the outline button with a `1.5px` border `#808080`, text `#FFFFFF`, border-radius `0`, and a hover background `#2E2E2E`
53. WHILE `html` has the class `dark` the system SHALL render the ghost button with no border, text `#FFFFFF`, border-radius `0`, and a hover background `#2E2E2E`
54. WHILE `html` has the class `dark` the system SHALL render each card with background `#242424`, border-radius `0`, a `1px` border `#808080`, and shadow `0 2px 12px rgba(0,0,0,0.06)`
55. WHILE `html` has the class `dark` the system SHALL paint muted washes `#2E2E2E` and secondary text `#D6D6D6`
56. IF a number field is empty and `html` has the class `dark` THEN the system SHALL show `Campo vazio.` below the field in `#D6D6D6`

**Independent test:** pôr a classe `dark` em `html` e conferir fundo, card e botão primário.

## Out of scope

| Excluded | Why |
| --- | --- |
| Hero dividido e faixas em zig-zag | o app é Calculadora, Projetos e Configurações; essas faixas são de página de marketing |
| Grade de 12 a 16 colunas | o miolo é formulário; a única segunda coluna é o resultado, a partir de `768px` |
| Skeleton com shimmer e empty state com ícone | o vazio e o carregamento já têm frase; o ícone seria decoração a mais |
| Interruptor de tema e `prefers-color-scheme` | hoje nada põe a classe `dark`; o tema escuro fica nos tokens |
| Reescrever os textos da interface | o pedido é o modelo visual; as frases continuam as de hoje |
| Trocar os hex padrão do filamento | são dados da cor, não cromo da interface |
| Fórmula, JSON gravado, login, PDF e refugo | fora desta versão |
| Toast, modal e overlay novos | a interface não tem esses layers; o contrato de z-index não ganha componente para eles |

## Assumptions

Nenhum default fora dos critérios.

**Open questions:** none - all resolved or logged above.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Calculadora, Projetos, Configurações | empty state | existing - frase no card (`cores-vazio`, `Nenhum projeto salvo`, impressora única); o texto fica, o chrome segue o card |
| screen Calculadora, Projetos, Configurações | loading | existing - frase de `vistaCarregamento` no estado `lendo` |
| screen Calculadora, Projetos, Configurações | error | AC 31, AC 32, AC 33, AC 56 |
| screen Calculadora, Projetos, Configurações | unauthorised | n/a - AD-001, não há conta nem sessão |
| screen Calculadora | density and ordering | AC 14, AC 15, AC 16, AC 17 |
| screen Projetos, Configurações | density and ordering | AC 18 |
| screen Calculadora | destructive remove color | existing - remover cor apaga sem diálogo |
| screen Projetos | destructive delete | existing - segundo clique em `confirmar-apagar` antes de apagar |
| screen Configurações | destructive remove printer | existing - a única impressora não pode ser removida |
| screen página não encontrada | error state | AC 20 |
| screen página não encontrada | empty, loading | n/a - um endereço ausente não tem dados para carregar |
| screen header | active item | AC 34, AC 35 |
| document textos da interface | tone and next step | existing - `PageIntro` e as frases em português continuam |
| collection projetos | ordering | n/a - esta mudança não reordena projetos |

## Sources

- Minimalism & Swiss Style, version alpha, colado no pedido — binding para cor, tipo, cromo e movimento. Onde o arquivo se contradiz, os critérios acima são a leitura.
