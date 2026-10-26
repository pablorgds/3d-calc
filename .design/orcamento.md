# Orçamento

> Planeje a partir deste documento. Cada fatia abaixo carrega a própria forma — copie, não redesenhe.
> Status: confirmado pelo dono, 2026-10-26

## Situation

- Project: em uso
- Decision: confirmado pelo dono, 2026-10-26, nesta conversa — o cliente e o orçamento são o mesmo ato
- In flight: um projeto já guarda o lote, a impressora, as cores ou as mesas, e a lista recalcula o lote com a tarifa atual. O login e as mesas já estão desenhados e ficam como estão. Estoque de filamentos, refugo, impressão falha, purge, mão de obra por hora e tarifa por projeto continuam no backlog.
- At stake: revertível numa tarde

## Problem

O dono precifica nesta máquina e passa o preço para quem pediu a peça. O projeto não diz quem pediu, e o total do lote só aparece na tela. No lugar disso ele copia os números à mão e escreve o nome em outro lugar. Sem isto, cada orçamento continua esses dois passos. Quantas vezes por semana não foi medido; o dono confirmou em 2026-10-26 que o cliente e o orçamento são o mesmo ato.

## Success

- Worked if: o próximo orçamento é um texto copiado que já traz o nome da pessoa e o total do lote, sem redigitar os números
- Going wrong: o dono ainda digita o nome ou os totais à mão
- Review: esse primeiro orçamento — o dono

## Boundary

In: nome e telefone do cliente no projeto, visíveis na calculadora e na lista. Duplicar o lote copia os dois. Um orçamento em texto, copiado da calculadora quando o total do lote fecha, com o cliente e o que o resultado já mostra.

Out: PDF — só se precisar de arquivo para anexar. Cadastro de clientes solto do projeto — só se a mesma pessoa estiver em vários lotes e o telefone tiver de mudar num lugar só. Envio por e-mail ou mensagem, e modelo com logo. Endereço, e-mail, documento e mais de um telefone. Gravar o total no projeto. Estoque de filamentos, login, mesas, refugo, impressão falha, purge, mão de obra por hora e tarifa diferente por projeto.

Unchanged: `/`, `/projetos`, `/configuracoes`, `impressora`, `mesa`, `cor`, a fórmula do custo, peça, lote, o modo, as cores, a ordenação da lista, números digitados em texto. O projeto continua sem guardar o total. A lista continua recalculando com a tarifa atual da impressora.

## Prior art

- Quem manda um preço congela o número na mensagem e deixa o cadastro acompanhar a tarifa — adotamos isso. A decisão 3 impede gravar esse número no projeto, o que congelaria a lista.
- Um cadastro de clientes só se paga quando um telefone vale para muitos lotes — não é este caso.

## Shape

O cliente é o nome e o telefone no projeto. Copiar o orçamento lê a calculadora como ela está, com a impressora que a tela está usando, e põe na área de transferência o cliente e o resultado que já aparece. A porta é o texto não gravado: escrever o total no projeto faria a lista deixar de acompanhar a tarifa da impressora. Um cadastro de clientes separado só se paga se a mesma pessoa estiver em vários lotes e o telefone tiver de mudar num lugar só, e não é o caso.

## Key decisions

1. **O cliente são dois textos no projeto, e os dois podem ficar vazios.** Nome e telefone ficam como foram digitados. Um lote sem cliente continua válido. Não há tabela de cliente.

2. **Duplicar o projeto copia o cliente como foi digitado.** O nome do lote continua ganhando “ (cópia)”. O nome do cliente não ganha.

3. **O orçamento não é um registro.** É uma leitura da calculadora na hora da cópia, com a impressora que essa tela usa. O projeto continua sem total. A lista continua recalculando com a tarifa atual. O texto já copiado fica como saiu.

4. **Não há orçamento quando o total do lote não fecha.** Lote em branco não é preço para passar. Se o lote fecha e a peça não, o texto leva o lote e o aviso que a tela já mostra para a peça.

5. **Projeto já gravado nasce com cliente vazio até o dono digitar.** Carga sem os dois campos é esse cliente vazio. Cores, mesas, tempo e impressora não são reescritos.

## Work

| Slice | Delivers | Status |
|---|---|---|
| [Cliente](#cliente) | Nome e telefone no projeto, na calculadora, na lista e na cópia do lote | clear |
| [Orçamento](#orcamento) | Texto copiado da calculadora quando o lote fecha | clear |

Order: Cliente → Orçamento.

Already handled by existing code: impressora do projeto removida usa a marcada e a tela avisa; projeto ausente em `/?projeto=` avisa e gravar cria um id novo; impressão única e projeto de mesas; lista ordena por atualização e, no empate, pelo nome; o total não fica no projeto; gravação que perde a corrida não escreve.

Derivable from the repository, left to the plan: dinheiro e datas em pt-BR, texto digitado, vazio contra inválido, nome do lote vazio mostrado como “Sem nome”, ordem das linhas e os avisos já escritos na calculadora, conflito ao gravar — tudo como o projeto e o resultado já fazem.

### Cliente

**Delivers** o nome e o telefone gravados no projeto e visíveis na calculadora e na lista. **Status: clear.**

| State | What should happen | Caller sees |
|---|---|---|
| Digitar nome e telefone e gravar | Os dois ficam no projeto, como foram digitados, inclusive vazios | Os campos na calculadora |
| Os dois vazios, ou só espaço | O lote continua válido. A lista não ganha linha de cliente | A lista como hoje |
| Nome ou telefone com texto depois do recorte | A lista mostra esse texto junto do lote | Nome e telefone ao lado do lote |
| Duplicar | Decisão 2 | Lote novo, mesmo cliente, nome do lote com “ (cópia)” |
| Apagar | O cliente sai com o projeto | A lista sem esse lote |

Tabela `projeto`. Nenhuma tabela nova.

| Column | Type | Null | References | Note |
|---|---|---|---|---|
| `client_name` | text | no | | Como digitado. Vazio é `''`, igual aos outros textos do projeto |
| `client_phone` | text | no | | Como digitado. Vazio é `''` |

Alternatives considered: máscara de telefone — ganha se o app for discar o número.

### Orçamento

**Delivers** o texto do orçamento a partir da calculadora aberta. **Status: clear.** Esta fatia é a porta: o texto não é gravado — decisão 3.

| State | What should happen | Caller sees |
|---|---|---|
| O total do lote fecha | Decisão 3. O texto leva o nome do lote, o cliente quando o recorte não é vazio, a linha da impressora que a tela já mostra, peça e lote, material, energia, depreciação, mão de obra e peso | O clipboard com esse texto. O botão diz “Copiar orçamento” |
| O total do lote não fecha | Decisão 4. Nada é copiado | O resultado como está, sem cópia |
| A peça não fecha e o lote fecha | Decisão 4 | O texto tem o lote e o aviso que a tela já mostra para a peça. O valor da peça fica de fora |
| Cliente vazio depois do recorte | As linhas do cliente ficam de fora | Os totais ainda copiam |
| A impressora do projeto foi removida | O texto usa a impressora marcada, como a tela | O aviso que a tela já mostra entra no texto |
| A cópia não chega ao clipboard | O texto é o mesmo | O texto fica na tela para selecionar |
| A tela difere da última gravação | O texto segue a tela | O projeto gravado só muda ao gravar |

Alternatives considered: cada cor com o próprio valor no texto — ganha se quem recebe o orçamento pedir o preço por filamento. Um arquivo `.txt` — ganha se o texto tiver de ir anexado.

## Migration

Projeto já gravado ganha `client_name` e `client_phone` vazios. Nenhuma outra coluna, cor ou mesa é reescrita. O dono é o único cliente do app; na próxima abertura, lote antigo aparece sem cliente e o total da lista continua o de hoje.

## Sources

- `.specs/BACKLOG.md` — cliente do projeto e orçamento em PDF ou texto; o que cada item deixava de fora e o que estava em aberto
- `.design/mesas.md` — o projeto não guarda o total; a lista recalcula com a tarifa da impressora
- Confirmação do dono, 2026-10-26 — o orçamento em texto leva nome e telefone gravados no próprio projeto
