# Coeficiente checks

Profile: light
Plan: `.specs/features/coeficiente/plan.md`

47 checks in 2 slices · 2 one-way doors · 0 open

## Checks

A impressora dos números, quando o check não disser outra, é 100 W, R$ 1/kWh, R$ 1000 e 1000 h, com nome `Prova`. O lote de prova, quando o check não disser outro, é modo `peca`, 0 h, 0 min, mão de obra `10`, uma cor de 800 g a R$ 100/kg.

### S1 - Coeficiente no total · 11 files · 213 KB · ~53k

**C1** - Gravar coefficient `20` em `Prova` devolve `20` na leitura seguinte (AC 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava coeficiente 20"`
Status: done

**C2** - Gravar coefficient `""` devolve `""` na leitura seguinte (AC 2)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava coeficiente vazio"`
Status: done

**C3** - Gravar coefficient ` 20 ` devolve ` 20 ` na leitura seguinte (AC 3)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "coeficiente com espaco"`
Status: done

**C4** - Gravar coefficient `100` devolve `100` na leitura seguinte (AC 4)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava coeficiente 100"`
Status: done

**C5** - Gravar coefficient `abc` devolve `abc` na leitura seguinte (AC 5)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava coeficiente abc"`
Status: done

**C6** - Um payload de impressora sem coefficient lê `""` (AC 6)
Proof: `node --experimental-strip-types --test src/lib/impressora-store.test.ts --test-name-pattern "payload sem coeficiente le vazio"`
Status: done

**C7** - Uma linha de `impressora` que não tinha coefficient, depois da coluna, lê `""` (AC 7)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "impressora antiga le coeficiente vazio"`
Status: done

**C8** - O payload de impressoras serializa com version `3` (AC 8)
Proof: `node --experimental-strip-types --test src/lib/impressora-store.test.ts --test-name-pattern "payload de impressoras versao 3"`
Status: done

**C9** - Acrescentar impressora grava o nome `Nova impressora` e coefficient `""` (AC 9)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "impressora nova nasce sem coeficiente"`
Status: done

**C10** - A impressora semente `k2-pro` lê coefficient `""` (AC 10)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "semente k2 sem coeficiente"`
Status: done

**C11** - Conta A grava coefficient `20` em `k2-pro` e a `k2-pro` da conta B continua `""` (AC 11)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "coeficiente nao vaza para outra conta"`
Status: done

**C12** - Uma gravação que falha ao pôr coefficient `20` deixa a leitura seguinte em `""` (AC 12)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "falha ao gravar coeficiente volta vazio"`
Status: done

**C13** - Com o formulário da impressora aberto, a tela mostra o campo `Coeficiente de erro (%)` (AC 13)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "campo coeficiente de erro"`
Status: done

**C14** - Coefficient `""` no lote de prova: totais `formatBRL(88)`, material `formatBRL(80)`, mão de obra `formatBRL(8)`, tempo `0 min` (AC 14)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente vazio mantem a soma"`
Status: done

**C15** - Coefficient `20` no lote de prova: totais `formatBRL(110)`, material `formatBRL(80)`, mão de obra `formatBRL(8)`, peso `formatGrams(800)`, tempo `0 min` (AC 15, door 2)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente 20 leva o total a 110"`
Status: done

**C16** - Coefficient `0` no lote de prova: totais `formatBRL(88)` (AC 16)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente zero igual ao vazio"`
Status: done

**C17** - Coefficient `99` no lote de prova: totais `formatBRL(8800)` (AC 17)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente 99 leva o total a 8800"`
Status: done

**C18** - Coefficient `99,9` no lote de prova: totais `formatBRL(88000)` (AC 18)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente 99,9 leva o total a 88000"`
Status: done

**C19** - Coefficient `100` no lote de prova: totais `—` e material `formatBRL(80)` (AC 19)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente 100 deixa o total sem fechar"`
Status: done

**C20** - Coefficient `101` no lote de prova: totais `—` (AC 20)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente 101 deixa o total sem fechar"`
Status: done

**C21** - Coefficient `abc` no lote de prova: totais `—` (AC 21)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente abc deixa o total sem fechar"`
Status: done

**C22** - Coefficient `   ` no lote de prova: totais `formatBRL(88)` (AC 22)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente so espaco vale zero"`
Status: done

**C23** - A tabela de custos não tem linha `Coeficiente de erro (%)` nem `Peças perdidas` (AC 23)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "tabela sem linha de coeficiente"`
Status: done

**C24** - A lista do lote de prova com coefficient `20`, sem gravar o projeto de novo, mostra `formatBRL(110)` (AC 24)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista acompanha coeficiente 20"`
Status: done

**C25** - Coefficient de `20` para `""`, sem gravar o projeto de novo, faz a lista mostrar `formatBRL(88)` (AC 25)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista volta ao total sem coeficiente"`
Status: done

**C26** - Mode `lote`, copies `4`, coefficient `20`, 0 min, labor `10`, 800 g a R$ 100/kg: peça `formatBRL(27.5)` e material `formatBRL(20)`, lote `formatBRL(110)` e material `formatBRL(80)`, mão de obra da peça `formatBRL(2)` e do lote `formatBRL(8)` (AC 26)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "lote de 4 copia as linhas e o coeficiente so no total"`
Status: done

**C27** - Duas mesas de 0 h, 0 min, 400 g a R$ 100/kg, labor `10`, copies `2`, coefficient `20`: material da peça `formatBRL(80)` e do lote `formatBRL(160)`, mão de obra da peça `formatBRL(8)` e do lote `formatBRL(16)`, totais `formatBRL(110)` e `formatBRL(220)` (AC 27)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mesas com coeficiente 20"`
Status: done

**C28** - As mesas de C27 com copies `0` e coefficient `20`: total da peça `formatBRL(110)`, total do lote `—`, sem `Copiar orçamento` (AC 28)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mesas sem copias fecham a peca"`
Status: done
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "sem botao quando o lote nao fecha"`
Status: done

**C29** - Labor `""` e coefficient `20`: totais `—` (AC 29)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mao de obra vazia nao fecha com coeficiente"`
Status: done

**C47** - `impressora` tem `coefficient text NOT NULL` com default `''` (door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "coluna coefficient no schema"`
Status: done

### S2 - Texto do cliente · 2 files · 37 KB · ~9k

**C30** - Coefficient `20`, lote de prova, lote `Suporte`, client name `Ana` e client phone `11999990000` mostram `Copiar orçamento` e o texto contém `Suporte`, `Cliente: Ana`, `Telefone: 11999990000`, `Total:`, `formatBRL(110)` e `0 min` (AC 30)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto do cliente com preco 110"`
Status: done

**C31** - O texto de C30 não contém `Material`, `Energia`, `Depreciação`, `Mão de obra`, `Peso`, `Prova:`, `Coeficiente` nem `Peças perdidas` (AC 31)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto do cliente sem o custo"`
Status: done

**C32** - Client name e client phone que recortam para vazio: o texto não contém `Cliente:` nem `Telefone:` e contém `formatBRL(110)` (AC 32)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto sem linhas de cliente"`
Status: done

**C33** - Mode `lote`, copies `4`, coefficient `20`, 0 min, labor `10`, 800 g a R$ 100/kg: o texto contém `Por peça`, `Lote`, `formatBRL(27.5)` e `formatBRL(110)`, e não contém `Total:` (AC 33)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto por peca e lote"`
Status: done

**C34** - Coefficient `100` no lote de prova não mostra `Copiar orçamento` (AC 34)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "sem botao com coeficiente 100"`
Status: done

**C35** - Mode `lote`, copies `0`, coefficient `20`, 0 min, labor `10`, 800 g a R$ 100/kg: o texto contém `formatBRL(110)` e não contém `Por peça` nem `Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero.` (AC 35)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto do lote sem por peca"`
Status: done

**C36** - A entrada de C35 na calculadora mostra `Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero.` (AC 36)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "aviso de copias fica na tela"`
Status: done

**C37** - As mesas de C28 na calculadora mostram `Custo do lote bloqueado. Cópias do produto precisa ser um inteiro maior que zero.` e o texto não contém essa frase (AC 37)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "aviso de copias do produto fica na tela"`
Status: done

**C38** - Impressora do projeto removida, marcada `Prova`, coefficient `20`: o texto contém `formatBRL(110)` e não contém `A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora.` nem `Prova:` (AC 38)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto sem impressora removida"`
Status: done

**C39** - A entrada de C38 na calculadora mostra `A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora.` (AC 39)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "aviso de impressora removida fica na tela"`
Status: done

**C40** - Se a escrita no clipboard falha, a calculadora mostra o texto de C30 para selecionar (AC 40)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "copia falha mostra o texto"`
Status: done

**C41** - Copiar o orçamento duas vezes deixa um projeto com esse id (AC 41)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "copiar duas vezes nao grava projeto"`
Status: done

**C42** - O texto de C30, depois de o coefficient passar de `20` para `""` sem gravar o projeto, continua com `formatBRL(110)`, e a lista mostra `formatBRL(88)` (AC 42)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto fica e a lista tira o coeficiente"`
Status: done

**C43** - Sem cores, mode `peca`, 0 min, labor `0`, coefficient `20`, com o total do lote fechado: o texto não contém `Nenhuma cor de filamento. O material entra como R$ 0,00.` (AC 43)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto sem aviso de nenhuma cor"`
Status: done

**C44** - A entrada de C43 na calculadora mostra `Nenhuma cor de filamento. O material entra como R$ 0,00.` (AC 44)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "aviso de nenhuma cor fica na tela"`
Status: done

**C45** - A cor de C30 nomeada `PLA preto` não aparece no texto (AC 45)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto sem nome das cores"`
Status: done

**C46** - A lista de projetos não mostra o controle `Copiar orçamento` (AC 46)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista sem copiar orcamento"`
Status: done

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| coeficiente gravado (5) | `20` C1 · `""` C2 · ` 20 ` C3 · `100` C4 · `abc` C5 | - |
| leitura sem o campo (2) | payload omite C6 · linha antiga C7 | - |
| impressora nova e semente (2) | `Nova impressora` C9 · `k2-pro` C10 | - |
| contas (2) | conta A grava `20` C11 · conta B lê `""` C11 | - |
| totais do lote de prova (9) | vazio C14 · `20` C15 · `0` C16 · `99` C17 · `99,9` C18 · `100` C19 · `101` C20 · `abc` C21 · espaços C22 | - |
| linhas fora do fator (4) | material C15 · mão de obra C15 · peso C15 · tempo C15 | - |
| lista acompanha (2) | `110` C24 · volta a `88` C25 | - |
| cópias nas linhas (2) | lote de 4 C26 · mesas C27 | - |
| botão Copiar orçamento (3) | lote fecha C30 · coefficient `100` C34 · cópias de mesa `0` C28 | - |
| texto do cliente (4) | preço C30 · sem o custo C31 · sem cliente C32 · por peça e lote C33 | - |
| avisos na tela (4) | cópias do lote C36 · cópias do produto C37 · impressora removida C39 · nenhuma cor C44 | - |
| avisos fora do texto (4) | cópias do lote C35 · cópias do produto C37 · impressora removida C38 · nenhuma cor C43 | - |
| texto já copiado (2) | texto com `110` C42 · lista em `88` C42 | - |
| door 1 coluna (1) | `coefficient` C47 | - |
| door 2 total (1) | soma / (1 − 20/100) = 110 C15 | - |
| startup schema coeficiente (1) | garantirSchema C47 | - |

- C15 afirma o total `formatBRL(110)` e as linhas que ficam no custo real
- Surface não tem rota consumida fora do app; `/`, `/projetos` e `/configuracoes` continuam as mesmas
- Nenhum outro check afirma mais do que o caso que a prova exercita

## Swept

- validation: C14, C15, C16, C17, C18, C19, C20, C21, C22
- failure modes: C12, C40
- idempotency: C41
- authorization: existing - AD-005, sem sessão a conta não lê a impressora; C11 separa o coeficiente por conta
- concurrency: existing - a gravação da impressora continua o replace de `substituirImpressoras`, sem `updated_at`; o coeficiente entra nessa mesma escrita
- data lifecycle: C7, C10
- dependency failure: existing - a falha de banco continua `Não deu para ler o banco.`
- state transitions: n/a - o coeficiente é um número na impressora, não um estado; 100 deixa o total sem fechar e continua gravado
- observability: n/a - nenhum requisito de log nesta feature

## Handoff

- S1 = 53290, em `custo.ts` (15069) + `custo.test.ts` (9798) + `impressora-store.ts` (4811) + `impressora-store.test.ts` (2947) + `banco.ts` (44942) + `banco.test.ts` (76774) + `configuracoes-form.tsx` (5964) + `calculadora.tsx` (38717) + `lista-projetos.tsx` (6397) + `docs/custo.md` (3237) + `docs/dados.md` (4504) = 213160 bytes / 4
- S2 acrescenta `vistas.ts` (11637) + `vistas.test.ts` (25188) = 36825 bytes / 4 = 9206; `calculadora.tsx` já entrou em S1
- Total 62496, abaixo do orçamento de 150k — one builder
- Mechanism: one builder
- **Boundary:** C1–C47 closed at 9ea2f96ab972c74a4f2020e27ddf6fef3ea8ea49
- **Settled mid-build:** none
- **Abandoned:** none
