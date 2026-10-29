# Purge

> Planeje a partir deste documento. Cada fatia abaixo carrega a própria forma — copie, não redesenhe.
> Status: rascunho aguardando confirmação do dono, 2026-10-28. A decisão 1 está fechada.

## Situation

- Project: em uso
- Decision: a decisão 1 foi fechada pelo dono em 2026-10-28, nesta conversa. O restante deste desenho é rascunho e espera confirmação.
- In flight: a tarifa e o coeficiente ficam na impressora e a lista recalcula o lote com a máquina atual. O orçamento é uma leitura da tela e não grava o total. Mesas, login e o cliente do projeto ficam como já estão. Refugo, mão de obra por hora, tarifa por projeto e estoque de filamentos ficam de fora.
- At stake: revertível numa tarde

## Problem

O dono precifica nesta máquina e passa o preço antes de imprimir. Numa impressão de várias cores o material é só as gramas de cada cor: a troca de filamento no meio da peça não entra no preço. Sem isto, o próximo orçamento de várias cores cobra a peça e esquece o filamento que a troca gasta. Quantas trocas por peça não foi medido; o dono disse em 2026-10-28 que essas gramas são digitadas na calculadora. Num projeto de mesas cada mesa é um filamento só e não troca no meio.

## Success

- Worked if: o próximo orçamento de várias cores, com um número em “Purge por troca (g)”, cobra esse purge em cada troca pelo preço da cor que entra, e um projeto de mesas continua o total de hoje
- Going wrong: o número mora na impressora, a mesa ganha purge, ou o material ignora o que foi digitado
- Review: esse primeiro orçamento de várias cores — o dono

## Boundary

In: um campo na calculadora, “Purge por troca (g)”, só na impressão de várias cores. O texto gravado no projeto. O material dessa impressão soma o purge de cada troca. Duplicar o projeto copia o campo. Vazio vale zero. Inválido deixa o material sem fechar.

Out: gramas na impressora — a decisão 1 recusou. Padrão da impressora com outro número no lote — recusado por agora. Um campo de gramas por troca — o dono quer um número só. Preço médio das cores, ou o purge inteiro na primeira cor. Torre de purge com tempo próprio, purge lido do fatiador, e baixa desse peso no estoque — ficam de fora até alguém pedir. Purge na mesa. Uma linha “Purge” no resultado, na lista ou no texto do cliente. Gravar o total no projeto.

Unchanged: `/`, `/projetos`, `/configuracoes`, `impressora`, `cor`, `mesa`, `impressora_ativa`, `mode`, `color_mode`, `client_name`, `client_phone`. A base da mão de obra continua material + energia + depreciação. O coeficiente continua só no total em reais já fechado (AD-010). O texto do cliente continua o de `.design/coeficiente.md`: nome do lote, cliente, telefone e preço. O projeto continua sem guardar o total. A lista continua ordenada por atualização e, no empate, pelo nome.

## Prior art

- Sem CFS ou AMS, a mesa é um filamento e não troca no meio — `.design/mesas.md` já deixou o purge de fora desse projeto. Este desenho não reabre isso.
- Com CFS ou AMS, uma impressão troca de filamento no meio e cada troca gasta purge da cor que entra. O preço dessa cor é o que o dono já digitou no R$/kg.
- Um número só para todas as trocas chega no orçamento. Um peso diferente por troca só se paga se cada troca gastar um tanto diferente, e não é o caso que o dono pediu.

## Shape

O purge é o texto das gramas por troca, no projeto, digitado na calculadora quando a impressão tem várias cores. Com N cores há max(0, N − 1) trocas, e esse número entra em todas. A porta é esse campo único: gravá-lo na impressora, ou abrir um campo por troca, só se paga se toda impressão da máquina gastar o mesmo purge ou se cada troca gastar um peso diferente — e o dono precifica com um número na calculadora. Uma mesa com purge reescreveria a mesa, que não troca de filamento.

## Key decisions

1. **As gramas por troca são digitadas na calculadora.** Fechado pelo dono em 2026-10-28. Não é um número da impressora. Um padrão da impressora com outro valor no lote fica de fora por agora. O texto fica no projeto da impressão única.

2. **Purge só existe na impressão de várias cores.** Projeto de mesas não leva purge: cada mesa é um filamento e não troca no meio. Com `color_mode` `unica`, ou com mesas, o campo não aparece e a conta não lê o texto. O texto pode continuar gravado.

3. **Um número vale para todas as trocas.** N é a quantidade de cores na ordem em que a calculadora já mostra, a de `cor.posicao`. Duas linhas com o mesmo nome são duas cores. O número de trocas é max(0, N − 1). A primeira cor já está na impressora e não paga purge. Cada cor seguinte é uma troca. O rótulo do campo é “Purge por troca (g)”, no mesmo feitio de “Peso (g)”.

4. **Quem entra paga o próprio purge.** Na troca i, que carrega a cor i+1, o material ganha `purge_g × (R$/kg da cor i+1 ÷ 1000)`. A linha de reais dessa cor leva a peça dela mais esse purge, e a soma das linhas continua igual ao material. O peso continua a soma das gramas digitadas nas cores: o purge não entra nessa linha. Cor única no modo várias cores (N = 1) tem zero trocas, então um número preenchido soma R$ 0. Preço médio de todas as cores, ou jogar todo o purge na primeira, ficam de fora.

5. **Vazio vale zero. Inválido anula o material.** Vazio é `''` e entra como zero, no mesmo sentido do coeficiente vazio — não como o peso vazio de uma cor, que anula o material. Zero digitado também soma R$ 0. Texto inválido deixa o material `null`, e com ele a mão de obra e os totais, do mesmo jeito que uma cor inválida (`invalid-color`). Energia e depreciação ficam quando fecham. Com N = 1 o inválido também anula o material: o campo está na tela. O aviso da cor continua o de hoje; o purge inválido aponta o próprio campo.

6. **Mão de obra, coeficiente e orçamento continuam no lugar em que já estão.** A mão de obra é o percentual já digitado sobre material + energia + depreciação, e o material da impressão de várias cores já inclui o purge. O coeficiente só divide o total em reais já fechado (AD-010); não escala as linhas. O texto do cliente não mostra material nem purge. O purge entra no valor digitado — peça no modo peça, mesa cheia no modo lote — e peça e lote escalam como o resto do material.

7. **O projeto guarda o texto, e duplicar copia.** A coluna é do `projeto`, não de `cor` nem de `impressora`. Vazio é permitido. Duplicar leva o campo com o restante da impressão única, inclusive quando o projeto é de mesas e o texto está sem uso.

## Work

| Slice | Delivers | Status |
|---|---|---|
| [Purge na conta](#purge-na-conta) | O material da impressão de várias cores inclui o purge | clear |
| [Purge na tela e no projeto](#purge-na-tela-e-no-projeto) | O campo na calculadora, gravado, reaberto e copiado | clear |

Order: Purge na conta → Purge na tela e no projeto.

Already handled by existing code: peça sem total quando as cópias bloqueiam, e o lote segue; impressora do projeto removida avisa na tela e o cálculo usa a marcada; o texto do cliente segue `.design/coeficiente.md` e não leva linhas de custo; projeto ausente em `/?projeto=` avisa e gravar cria um id novo; o total não fica no projeto; gravação que perde a corrida não escreve; projeto de mesas soma as chapas sem troca de filamento.

Derivable from the repository, left to the plan: dinheiro e gramas em pt-BR, `parseDecimal` (vazio, inválido, zero, negativo), o aviso no feitio de “Há cor com preço ou peso vazio ou inválido.”, recorte, a ordem que `posicao` já dá às cores, “ (cópia)” no nome do lote, placeholder do campo — tudo como o peso e o coeficiente já fazem.

### Purge na conta

**Delivers** o material, a mão de obra e os totais da impressão de várias cores com o purge dentro do material. **Status: clear.** Mesas e cor única não leem o campo — decisão 2.

O exemplo abaixo é o valor digitado, antes de peça e lote escalarem. Três cores, nesta ordem: preto 20 g a R$ 80/kg, branco 10 g a R$ 120/kg, vermelho 5 g a R$ 100/kg. Purge 30 g. Duas trocas. O branco soma 30 × 120/1000 = R$ 3,60. O vermelho soma 30 × 100/1000 = R$ 3,00. Material = 1,60 + 1,20 + 0,50 + 3,60 + 3,00 = R$ 9,90. Linhas: preto R$ 1,60, branco R$ 4,80, vermelho R$ 3,50. Peso = 35 g.

| State | What should happen | Caller sees |
|---|---|---|
| Várias cores, purge vazio ou zero, cores fechadas | Decisão 5. Material é só a soma das cores | Peso das cores. Totais fecham |
| Várias cores, N ≥ 2, purge preenchido e válido | Decisão 4 e decisão 6 | Material com o purge. Mão de obra sobre esse material. Coeficiente só no total. Peso sem o purge |
| Várias cores, N = 1, purge preenchido e válido | Decisão 4. Zero trocas | Material só da cor. R$ 0 de purge |
| Purge inválido, com ou sem troca | Decisão 5. Material `null` | Mão de obra e totais sem fechar. Energia e depreciação ficam se fecham. Nenhuma cópia de orçamento |
| Cor inválida | O que já vale hoje | Material `null`, antes do purge |
| Sem cores, purge vazio | Material zero, como hoje | Total pode fechar |
| Sem cores, purge inválido | Decisão 5. O inválido ganha do material zero | Material `null` |
| Cor única | Decisão 2. O texto não entra | Conta de hoje |
| Projeto de mesas | Decisão 2. `calculate` das mesas não lê o campo | Peça e lote das mesas, como hoje |
| Custo sem fechar por outro campo | O purge não cria total | Total sem fechar, como hoje |

Nenhuma coluna nova nesta fatia. O rascunho da conta recebe o texto; a regra acima diz quando ele vale.

Alternatives considered: somar o purge no peso — ganha se o peso da tela passar a ser o filamento gasto, e não as gramas da peça. Uma linha “Purge” ao lado do material — ganha se o dono quiser ver o tanto separado das cores.

### Purge na tela e no projeto

**Delivers** o campo na impressão de várias cores, o texto no projeto e a cópia desse texto. **Status: clear.** Esta fatia é a porta: um campo na calculadora, não na impressora — decisão 1.

| State | What should happen | Caller sees |
|---|---|---|
| Impressão de várias cores | Decisão 3. O campo aparece com as cores | “Purge por troca (g)” |
| Cor única | Decisão 2. O campo some. O texto gravado fica | A calculadora de uma cor, sem o campo |
| Projeto de mesas | Decisão 2. O campo não entra na mesa | As chapas, sem purge |
| Digitar e gravar, inclusive vazio | Decisão 1 e decisão 7. Fica como digitado | O campo ao reabrir |
| Vazio | Decisão 5. Grava. Não é o “Campo vazio.” do peso | Material com purge zero |
| Inválido | Decisão 5. A calculadora não grava, como um preço de cor inválido. Um payload que já chegou inválido anula o material | O campo marcado. Totais sem fechar |
| Duplicar | Decisão 7 | Lote novo com o mesmo texto. Nome com “ (cópia)” |
| Lista | O lote recalcula com a tarifa e o coeficiente atuais. O purge entra quando a decisão 2 manda | O total do lote, ou em branco se o material não fecha |
| Virar mesas, ou voltar à impressão única | O texto não é apagado. Continua sem uso enquanto houver mesas ou a cor for única | O campo só volta na impressão de várias cores |

Tabela `projeto`. `cor`, `mesa` e `impressora` não ganham coluna.

| Column | Type | Null | References | Note |
|---|---|---|---|---|
| `purge` | text | no | | Gramas por troca, como digitado. Vazio é `''` |

No payload da impressão o campo chama `purge`, texto, no mesmo projeto que já leva `grams` e `colorMode`.

Alternatives considered: coluna em `cor` — ganha se cada troca tiver o próprio peso. Coluna em `impressora` — a decisão 1 recusou. Apagar o texto ao passar para cor única ou para mesas — ganha se o número não puder sobreviver fora da impressão de várias cores.

## Migration

Projeto já gravado ganha `purge` vazio. Uma leitura sem o campo é `''`. Nenhuma linha de `cor` ou `mesa` é reescrita. `impressora` não muda. Na próxima abertura, o total da lista continua o de hoje até o dono digitar o número numa impressão de várias cores.

## Sources

- `.specs/BACKLOG.md` — purge: várias cores somam a troca; mesas ficam de fora; torre e fatiador ficam de fora
- `.design/mesas.md` — a mesa é um filamento e não troca no meio
- `.design/coeficiente.md` — AD-010: custo novo entra na soma antes do coeficiente; o coeficiente não escala as linhas; o texto do cliente não leva material
- `.design/orcamento.md` — o orçamento é leitura da tela e não grava o total
- `docs/custo.md` — material das cores, `invalid-color`, mão de obra sobre material + energia + depreciação
- Confirmação do dono, 2026-10-28 — as gramas por troca são digitadas na calculadora, não na impressora
