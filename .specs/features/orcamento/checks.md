# Orçamento checks

Profile: light
Plan: `.specs/features/orcamento/plan.md`

28 checks in 2 slices · 1 one-way door · 0 open

## Checks

A impressora dos números, quando o check não disser outra, é 100 W, R$ 1/kWh, R$ 1000 e 1000 h, com nome `Prova`.

### S1 - Cliente no projeto · 9 files · 190 KB · ~49k

**C1** - Gravar client name `Ana` e client phone `11999990000` devolve as duas strings na leitura seguinte (AC 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava cliente ana"`

**C2** - Gravar client name `""` e client phone `""` devolve as duas como `""` e o projeto continua na lista (AC 2)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "cliente vazio continua na lista"`

**C3** - Gravar client name ` Ana ` devolve ` Ana ` na leitura seguinte (AC 3)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "nome de cliente com espaco"`

**C4** - Gravar client phone `11 99999-0000` devolve `11 99999-0000` na leitura seguinte (AC 4)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "telefone de cliente como digitado"`

**C5** - A lista de um projeto com client name `Ana` e client phone `11999990000` mostra `Ana` e `11999990000` junto do lote (AC 5)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista mostra cliente"`

**C6** - A lista de um projeto com client name `   ` e client phone `  ` mostra a mesma linha de lote de um projeto com os dois campos `""` (AC 6)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista sem cliente no recorte"`

**C7** - Duplicar um projeto com client name `Ana` e client phone `11999990000` grava o nome do lote com sufixo ` (cópia)` e a cópia com client name `Ana` e client phone `11999990000` (AC 7)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "duplicar copia cliente"`

**C8** - Uma linha de `projeto` que não tinha cliente, depois das colunas, lê client name `""` e client phone `""` (AC 8)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "projeto antigo le cliente vazio"`

**C9** - Um payload de projetos sem client name e sem client phone lê os dois como `""` (AC 9)
Proof: `node --experimental-strip-types --test src/lib/projetos-store.test.ts --test-name-pattern "payload sem cliente le vazio"`

**C10** - O payload de projetos serializa com version `1` (AC 10)
Proof: `node --experimental-strip-types --test src/lib/projetos-store.test.ts --test-name-pattern "payload de projetos versao 1"`

**C11** - Apagar o projeto com client name `Ana` faz a leitura seguinte não devolver esse id (AC 11)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "apagar projeto leva o cliente"`

**C12** - Com client name `""` e client phone `""`, a calculadora mostra um campo `Cliente` e um campo `Telefone` (AC 12)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "campos cliente e telefone"`

**C13** - Uma gravação que carrega `updated_at` diferente do atual e tenta client name `Bia` não commita, e a leitura seguinte devolve client name `Ana` (AC 13)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "gravacao atrasada mantem cliente"`

**C14** - Uma gravação que falha ao pôr client name `Bia` deixa a leitura seguinte em client name `Ana` (AC 14)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "falha ao gravar cliente volta ana"`

**C28** - `projeto` tem `client_name text NOT NULL` e `client_phone text NOT NULL`, default `''`, e não existe tabela `cliente` (door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "colunas de cliente no schema"`

### S2 - Texto do orçamento · 4 files · 73 KB · ~18k

**C15** - Mode `lote`, copies `2`, 60 minutos, labor `20`, uma cor de 10 g a R$ 100/kg e outra de 20 g a R$ 50/kg, com o total do lote fechado, mostra o controle `Copiar orçamento` (AC 15)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "botao copiar orcamento quando o lote fecha"`

**C16** - Usar `Copiar orçamento` no projeto de C15, lote `Suporte`, client name `Ana` e client phone `11999990000`, produz texto com `Suporte`, `Cliente: Ana`, `Telefone: 11999990000`, `Prova: 100 W, 1 R$/kWh, impressora 1000, 1000 h.`, `Por peça`, `Lote`, `Material`, `Energia`, `Depreciação`, `Mão de obra` e `Peso`, nessa ordem, e com as strings de `formatBRL`, `formatDuration` e `formatGrams` da peça e do lote que `calculate` devolve para essa entrada (AC 16)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto do orcamento do lote fechado"`

**C17** - O projeto de C15 com client name e client phone que recortam para vazio produz texto sem `Cliente:` e sem `Telefone:`, e com a string `formatBRL` do total do lote (AC 17)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto sem linhas de cliente"`

**C18** - Mode `lote`, copies `0`, 60 minutos, labor `20` e uma cor de 10 g a R$ 100/kg produz texto com `Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero.` e a string `formatBRL` do total do lote, e sem `Por peça` (AC 18)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto sem por peca com copias 0"`

**C19** - Duas mesas, cada uma com hours `0`, minutes `0`, grams `1000` e price `100`, labor `10` e copies `0`, com total da peça fechado e total do lote `null`, não mostram `Copiar orçamento` (AC 19)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "sem botao quando o lote nao fecha"`

**C20** - Com a impressora do projeto removida e a marcada `Prova`, o texto contém `A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora.` e `Prova: 100 W, 1 R$/kWh, impressora 1000, 1000 h.` (AC 20)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto com impressora removida"`

**C21** - A calculadora mostra client name `Bia` e a última gravação tem client name `Ana`: o texto contém `Bia` e a leitura seguinte devolve `Ana` (AC 21)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto segue bia da tela"`
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "leitura continua ana"`

**C22** - Se a escrita no clipboard falha, a calculadora mostra esse mesmo texto para selecionar (AC 22)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "copia falha mostra o texto"`

**C23** - Copiar o orçamento duas vezes deixa um projeto com esse id (AC 23)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "copiar duas vezes nao grava projeto"`

**C24** - O texto de C15, depois de a tarifa passar de `1` para `2` sem gravar o projeto, continua com a string `formatBRL` do total antigo, e a lista reprecifica o lote com a tarifa nova (AC 24)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto fica e a lista reprecifica"`

**C25** - Projeto sem cores, mode `peca`, 60 minutos e labor `0`, com o total do lote fechado, produz texto com `Nenhuma cor de filamento. O material entra como R$ 0,00.` (AC 25)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto com nenhuma cor"`

**C26** - As cores de C15 nomeadas `PLA preto` e `PLA branco` não aparecem no texto (AC 26)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto sem nome das cores"`

**C27** - A lista de projetos não mostra o controle `Copiar orçamento` (AC 27)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista sem copiar orcamento"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| colunas do cliente (2) | `client_name` C28 · `client_phone` C28 | - |
| cliente gravado (4) | `Ana` e telefone C1 · vazio C2 · nome com espaço C3 · telefone com hífen C4 | - |
| lista do cliente (2) | com cliente C5 · recorte vazio C6 | - |
| botão Copiar orçamento (2) | lote fecha C15 · lote null C19 | - |
| rótulos do texto (7) | `Por peça` C16 · `Lote` C16 · `Material` C16 · `Energia` C16 · `Depreciação` C16 · `Mão de obra` C16 · `Peso` C16 | - |
| linhas do cliente no texto (2) | presentes C16 · ausentes C17 | - |
| peça fora do texto (1) | copies `0` C18 | - |
| falha de clipboard (1) | texto na tela C22 | - |
| total não gravado (2) | texto antigo C24 · lista reprecifica C24 | - |
| nomes de cor fora do texto (2) | `PLA preto` C26 · `PLA branco` C26 | - |
| startup schema cliente (1) | garantirSchema C28 | - |

- C16 afirma cada rótulo e as strings de `formatBRL`, `formatDuration` e `formatGrams` da peça e do lote
- Leitura de linha gravada: C1, C2, C3, C4, C7, C8, C13, C14, C21, C28
- Surface não tem rota consumida fora do app; `/`, `/projetos` e `/configuracoes` continuam as mesmas

## Swept

- validation: C2, C3, C4
- failure modes: C14, C22
- idempotency: C23
- authorization: existing - AD-005, sem sessão a conta não lê o projeto; as colunas novas ficam nessa linha
- concurrency: C13
- data lifecycle: C8, C11
- dependency failure: C22
- state transitions: n/a - o cliente é texto no projeto e o orçamento não é registro, então não há estado novo
- observability: n/a - nenhum requisito de log nesta feature

## Handoff

- S1 = 48600, em `projetos-store.ts` (7760) + `projetos-store.test.ts` (3477) + `banco.ts` (44208) + `banco.test.ts` (70571) + `vistas.ts` (4677) + `vistas.test.ts` (15023) + `calculadora.tsx` (38484) + `lista-projetos.tsx` (6145) + `docs/dados.md` (4057) = 194402 bytes / 4
- S2 acrescenta `custo.ts` (15069) = 3767; `vistas`, `vistas.test.ts` e `calculadora.tsx` já entraram em S1
- Total 52367, abaixo do orçamento de 150k — one builder
- Mechanism: one builder
- Built: C1–C28
- **Boundary:** C1–C28 closed at 6a6cd783c3ab05e846dc24f3932e017ce6e8bd1a
- **Settled mid-build:** none
- **Abandoned:** none
