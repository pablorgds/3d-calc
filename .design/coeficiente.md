# Coeficiente

> Planeje a partir deste documento. Cada fatia abaixo carrega a própria forma — copie, não redesenhe.
> Status: confirmado pelo dono, 2026-10-26

## Situation

- Project: em uso
- Decision: confirmado pelo dono, 2026-10-26, nesta conversa
- In flight: a tarifa fica na impressora e a lista recalcula o lote com a máquina atual; o orçamento é uma leitura da tela e não grava o total. Mesas, login e o cliente do projeto ficam como já estão desenhados. Purga, refugo, histórico de falhas, mão de obra por hora, tarifa por projeto e estoque de filamentos ficam de fora.
- At stake: revertível numa tarde

## Problem

O dono precifica nesta máquina e passa o preço antes de imprimir. Nas últimas impressões, 1 peça em 5 se perdeu por erro da impressora, e esse custo não entrou no preço. Sem isto, o próximo orçamento cobra 4 por um trabalho de 5. A conta não registra essa perda: o dono disse o 1 em 5 em 2026-10-26. O texto que sai hoje lista o custo, e o dono não quer que quem recebe veja esse detalhe.

## Success

- Worked if: o próximo orçamento, com coeficiente 20 na impressora, cobra o trabalho de 5 para entregar 4, e o cliente recebe o nome do lote, o cliente, o telefone e esse total
- Going wrong: o total igual à soma de material, energia, depreciação e mão de obra com o coeficiente em 20, ou o texto ainda com essas linhas
- Review: esse primeiro orçamento — o dono

## Boundary

In: o coeficiente na impressora. O total da peça e o total do lote depois do coeficiente, na tela e na lista. Material, energia, depreciação e mão de obra no custo real. O texto do cliente com o nome do lote, o cliente, o telefone e o preço.

Out: purga — o dono deixou para a conversa seguinte. Uma linha com o nome da perda no resultado, na lista ou no texto — o dono não quer mostrar o coeficiente. Coeficiente no projeto — só se um lote for mais arriscado que a impressora. Histórico de falhas e coeficiente calculado sozinho — ficam de fora até alguém pedir. Refugo — filamento que sobra fora da peça. PDF, e-mail e logo — já fora do orçamento. Gravar 20 na K2 Pro de fábrica — reprecificaria lote já salvo.

Unchanged: `/`, `/projetos`, `/configuracoes`, `projeto`, `mesa`, `cor`, `impressora_ativa`, `mode`, `color_mode`, `client_name`, `client_phone`. A base da mão de obra continua material + energia + depreciação. O projeto continua sem guardar o total. A lista continua ordenada por atualização e, no empate, pelo nome.

## Shape

O coeficiente é o número gravado na impressora. A conta aplica esse número só no total já fechado da peça e do lote. A porta é o vão entre as quatro linhas e o total: fechá-lo por dentro das linhas faria o material deixar de ser gramas vezes o preço. Um coeficiente gravado no projeto, ou o tempo e as gramas de uma impressão que já falhou somados naquele lote, só se paga se o lote tiver de guardar o preço quando o coeficiente da impressora muda, ou se a perda deixar de ser um coeficiente da impressora — e não é o caso.

## Key decisions

1. **O coeficiente fica na impressora, e a lista acompanha.** O valor digitado é o coeficiente: 20 é uma em cinco. Vazio vale zero. Um coeficiente no projeto congelaria o preço quando a máquina mudasse; a lista acompanha a impressora, como a tarifa. Texto já copiado fica como saiu.

2. **O coeficiente incide só no total em reais.** Material, energia, depreciação e mão de obra continuam o custo real, e a mão de obra continua o percentual já digitado sobre material + energia + depreciação. Minutos e gramas continuam o que foi digitado. O total da peça e o total do lote são, cada um, a soma em reais desse lado dividida por (1 − coeficiente/100). Com 20, os dois totais ficam 5/4 dessa soma. Pôr o coeficiente dentro das linhas faria o material deixar de ser gramas × preço.

3. **Coeficiente 100 ou mais, ou inválido, deixa o total sem fechar.** As linhas ficam, quando o custo fecha. Nenhum orçamento é copiado. Abaixo de 100, e no vazio ou no zero, o total fecha quando o custo fecha. O número fica gravado como foi digitado; 100 não é recusado na gravação.

4. **O coeficiente não é uma linha.** Não aparece no resultado, na lista nem no texto. O número aparece só no campo da impressora.

5. **O texto do cliente é o nome do lote, o cliente, o telefone e o preço que a tela já mostra, dinheiro e tempo.** Não leva material, energia, depreciação, mão de obra, peso, a impressora nem os avisos da calculadora. Isto revê o texto de `.design/orcamento.md`, inclusive o aviso da peça e o aviso de impressora removida, que ficam na tela. Nome e telefone do cliente no projeto continuam como lá.

6. **Impressora já gravada e impressora nova nascem com o coeficiente vazio.** O total continua o de hoje até o dono digitar o número. Gravar 20 na K2 Pro de fábrica reprecificaria os lotes já salvos.

## Work

| Slice | Delivers | Status |
|---|---|---|
| [Coeficiente](#coeficiente) | O número na impressora e o total da peça e do lote depois dele | clear |
| [Orçamento](#orcamento) | O texto do cliente com o nome, o cliente, o telefone e o preço | clear |

Order: Coeficiente → Orçamento.

Already handled by existing code: peça sem total quando as cópias bloqueiam, e o lote segue; impressora do projeto removida avisa na tela e o cálculo usa a marcada; falha ao copiar mostra o texto na tela; o texto segue a tela e o projeto gravado só muda ao gravar; projeto ausente em `/?projeto=` avisa e gravar cria um id novo; o total não fica no projeto; gravação que perde a corrida não escreve.

Derivable from the repository, left to the plan: dinheiro e tempo em pt-BR, vazio contra inválido, recorte, nome do lote vazio mostrado como “Sem nome”, rótulos “Por peça”, “Lote” e “Total”, o botão “Copiar orçamento”, avisos já escritos na calculadora — tudo como o resultado já faz. O rótulo do campo segue “Mão de obra (%)”: “Coeficiente de erro (%)”.

### Coeficiente

**Delivers** o coeficiente gravado na impressora e o total em reais da peça e do lote depois dele. **Status: clear.** Esta fatia é a porta: o coeficiente fica fora das linhas — decisão 2.

| State | What should happen | Caller sees |
|---|---|---|
| Digitar o coeficiente e gravar | Decisão 1. Fica como digitado, inclusive vazio | O campo na impressora, em Configurações |
| Vazio ou zero, com o custo fechado | Decisão 1. O total em reais é a soma das quatro linhas | Linhas, tempo e peso como hoje. Total igual à soma, na peça e no lote |
| Maior que zero e menor que 100 | Decisão 2 | Linhas, tempo e peso no valor real. Total em reais maior, sem linha de coeficiente. A lista mostra o total do lote |
| 100 ou mais, ou inválido | Decisão 3 | Linhas no custo real quando o custo fecha. Total sem fechar |
| Impressora nova, ou já gravada sem o campo | Decisão 6 | Campo vazio. Total de hoje |
| Mudar o coeficiente | Decisão 1 | A lista dos projetos dessa impressora acompanha. Texto já copiado fica como saiu |
| Mesas | Decisão 2, no total do produto e no lote | Linhas no custo real. Os dois totais em reais depois do coeficiente |
| Custo sem fechar | O coeficiente não cria total | Total sem fechar, como hoje |
| Peça sem total e lote fechado | O coeficiente vale no lote | Peça sem total. Lote com o total em reais depois do coeficiente |

Tabela `impressora`. `projeto` não ganha coluna.

| Column | Type | Null | References | Note |
|---|---|---|---|---|
| `coefficient` | text | no | | O coeficiente, como digitado. Vazio é `''`, igual aos outros números da impressora |

Alternatives considered: recusar gravar 100 ou mais — ganha se o campo não puder guardar um número que deixa o total sem fechar.

### Orçamento

**Delivers** o texto que o cliente recebe, a partir da calculadora aberta. **Status: clear.** O texto continua sem ser gravado, como em `.design/orcamento.md`.

| State | What should happen | Caller sees |
|---|---|---|
| O total do lote fecha | Decisão 5. Nome do lote, cliente e telefone quando o recorte não é vazio, e a linha de preço que a tela já mostra | O clipboard com esse texto |
| Peça e lote com o mesmo preço e o mesmo tempo | Uma linha de total | Dinheiro e tempo |
| Peça e lote diferentes | As duas linhas de preço | Por peça e lote, cada um com dinheiro e tempo |
| O total do lote não fecha | Nada é copiado | O resultado como está, sem cópia |
| A peça não fecha e o lote fecha | Decisão 5. O texto leva o lote | O valor da peça e o aviso ficam na tela |
| Cliente vazio depois do recorte | As linhas do cliente ficam de fora | O preço ainda copia |
| Impressora do projeto removida | O cálculo usa a marcada, como a tela | O aviso fica na tela. O texto não leva a impressora |

Alternatives considered: levar material, energia, depreciação e mão de obra no texto — ganha se quem recebe pedir o custo.

## Migration

Impressora já gravada ganha `coefficient` vazio. A K2 Pro de fábrica também nasce vazia. Nenhuma coluna de `projeto`, `cor` ou `mesa` é reescrita. Uma leitura sem o coeficiente é coeficiente vazio. Na próxima abertura, o total da lista continua o de hoje até o dono digitar o número.

## Sources

- `.specs/BACKLOG.md` — impressão falha: o que estava em aberto e o que ficava de fora
- `.design/orcamento.md` — o texto que esta decisão revê; nome e telefone do cliente continuam lá
- `docs/custo.md` — a soma que o coeficiente encontra já fechada
- Confirmação do dono, 2026-10-26 — coeficiente na conta, escondido, e o texto do cliente só com o preço
