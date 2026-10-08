# Mesas checks

Profile: light
Plan: `.specs/features/mesas/plan.md`

47 checks in 2 slices · 3 one-way doors · 0 open

## Checks

A impressora dos números, quando o check não disser outra, é 1000 W, R$ 1/kWh, R$ 1000 e 1000 h. A outra é 100 W, R$ 1/kWh, R$ 1000 e 1000 h. Token inválido dos campos numéricos: `-1`.

### S1 - Peça e lote · 6 files · 53 KB · ~13k

**C1** - Duas mesas, cada uma com hours `1`, minutes `0`, grams `0` e price `0`, labor `0` e copies `1`, precificam a peça em material `0`, energy `2`, depreciation `2`, labor `0` e total `4` (AC 1)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "duas mesas peca total 4"`

**C2** - O projeto de C1 com copies `2` precifica o lote em material `0`, energy `4`, depreciation `4`, labor `0`, total `8` e minutes `240` (AC 2)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "duas mesas lote total 8"`

**C3** - Duas mesas de hours `0` e minutes `0`, cada uma com grams `1000` e price `100`, labor `10` e copies `1`, precificam a peça em material `200`, energy `0`, depreciation `0`, labor `20` e total `220` (AC 3)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "duas mesas material 220"`

**C4** - Com a outra mesa em hours `1`, minutes `0`, grams `0` e price `0`, labor `0` e copies `1`, trocar exatamente um campo da primeira mesa para `""` ou `-1` entre hours, minutes, grams e price deixa o total da peça `null` e o total do lote `null` (AC 4)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mesa aberta anula os totais"`

**C5** - Com as duas mesas de C1 fechadas, copies `""`, `0` ou `2,5` mantém o total da peça em `4` e deixa o total do lote `null` (AC 5)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "copias invalidas mantem a peca"`

**C6** - Com mesas e copies `""`, `0` ou `2,5`, a tela mostra `Custo do lote bloqueado. Cópias do produto precisa ser um inteiro maior que zero.` (AC 6)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "copias invalidas bloqueiam o lote"`

**C7** - Vida útil `0`, com as mesas de C1 e copies `1`, precifica depreciation `0` e o total da peça `2` (AC 7)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "vida util zero deprecia zero"`

**C8** - Uma mesa com price `1,5`, grams `1000`, hours `0`, minutes `0` e labor `0` precifica o material desse filamento em `1.5` (AC 8)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "preco 1,5 material 1.5"`

**C9** - Duas mesas com os números de C1 e name `""` fecham o total da peça em `4` (AC 9)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "nome vazio fecha a peca"`

**C10** - As mesas de C1 com labor `""` e copies `1` deixam o total da peça `null` e o total do lote `null` (AC 10)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mao de obra vazia anula os totais"`

**C11** - Projeto sem mesas, mode `lote`, copies `2`, hours `0`, minutes `60`, labor `20`, uma cor de 10 g a R$ 100/kg e outra de 20 g a R$ 50/kg, na impressora de 100 W, precifica o total da peça em `1.86` e o total do lote em `3.72` (AC 11)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "impressao sem mesas 1.86 e 3.72"`

**C12** - Uma mesa com hours `0`, minutes `0`, grams `0`, price `0`, labor `0` e copies `1` fecha o total da peça em `0` e o total do lote em `0` (AC 12)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mesa zerada fecha em 0"`

### S2 - Projeto de mesas · 10 files · 91 KB · ~23k

**C13** - Um projeto gravado com a mesa de posicao menor `PLA preto` (hours `1`, minutes `0`, hex `#111111`, price `100`, grams `10`) e a seguinte `PETG` (hours `2`, minutes `15`, hex `#222222`, price `80`, grams `20`) abre mostrando `PLA preto` antes de `PETG`, com hours, minutes, name, hex, price e grams de cada uma (AC 13)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "abre mesas por posicao"`
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "calculadora mostra os campos da mesa"`

**C14** - Adicionar mesa a uma impressão com duas cores precificadas mostra `Esta impressão tem várias cores num tempo só. A mesa leva uma cor.` e a leitura seguinte mantém hours `1`, `2` linhas em `cor` e `0` linhas em `mesa` (AC 14)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "recusa mesa em varias cores"`
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "varias cores nao grava mesa"`

**C15** - Adicionar mesa a uma impressão de uma cor com hours `1`, minutes `0`, grams `10`, name `PLA preto`, hex `#111111` e price `100` grava essa chapa como a primeira mesa, acrescenta uma mesa com hours `""`, minutes `""`, name `""`, price `""`, grams `""` e hex `#57534e`, zera as cores e o tempo do projeto, e mostra `—` no total da peça e no total do lote (AC 15)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "primeira mesa e a mesa vazia"`
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "totais em traco com mesa aberta"`

**C16** - Uma impressão mode `peca` de 60 minutos, 10 g a R$ 100/kg, labor `20` e copies `1`, na impressora de 100 W, com total da peça `2.52` e total do lote `2.52`, depois de ganhar uma mesa e perder cada mesa que não fechou, grava mode `peca`, hours `1`, minutes `0`, grams `10`, uma cor, `0` mesas, total da peça `2.52` e total do lote `2.52` (AC 16)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "volta a peca 2.52"`

**C17** - Um projeto com duas mesas fechadas de C1, copies `1`, total da peça `4` e total do lote `4`, mais uma mesa com price `""`, ao remover a mesa de price `""` mantém as duas fechadas, o total da peça `4` e o total do lote `4` (AC 17)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "remove mesa aberta e mantem as fechadas"`

**C18** - Uma impressão mode `lote`, copies `4`, 60 minutos, 10 g a R$ 100/kg e labor `20`, na impressora de 100 W, depois de ganhar uma mesa e perder a mesa que não fechou, mantém `1` mesa, copies `4`, total da peça `2.52` e total do lote `10.08` (AC 18)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "lote vira mesa com copias 4"`

**C19** - Duas mesas fechadas de C1 e copies `1`, ao remover uma, reprecificam a peça em total `2` e o lote em total `2` (AC 19)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "remove mesa fechada e recalcula"`

**C20** - Resta uma mesa fechada de hours `1`, minutes `30`, grams `10`, name `PLA preto`, hex `#111111`, price `100` e copies `1`: o projeto gravado fica mode `peca`, color_mode `unica`, hours `1`, minutes `30`, grams `10`, uma cor com esse name, hex e price, e `0` linhas em `mesa` (AC 20)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "uma mesa com copias 1 vira impressao"`

**C21** - Gravar um projeto de duas mesas deixa hours `""`, minutes `""`, grams `""`, mode `peca`, color_mode `unica`, `0` linhas em `cor` e `2` linhas em `mesa` na mesma leitura (AC 21, door 2)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "gravar mesas limpa cor"`

**C22** - Se a gravação das mesas falha, a leitura seguinte é o projeto de antes: hours `1`, minutes `0`, `1` linha em `cor` e `0` linhas em `mesa` (AC 22)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "falha ao gravar mesas volta o projeto"`

**C23** - Uma gravação que carrega updated_at `10` quando a linha já está em `20` não commita. Se quem commitou foram duas mesas, a leitura seguinte tem `2` linhas em `mesa`, `0` em `cor` e updated_at `20`. Se quem commitou foram duas cores, a leitura seguinte tem `2` linhas em `cor`, `0` em `mesa` e updated_at `20` (AC 23, door 3)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "gravacao atrasada nao commita"`

**C24** - Duplicar um projeto de mesas chamado `Suporte`, com as duas mesas de C1 e copies `2`, grava o nome `Suporte (cópia)`, outro id, total da peça `4` e total do lote `8` (AC 24)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "duplicar projeto de mesas"`

**C25** - Apagar o projeto `a`, que tem `2` mesas, remove essas mesas; a mesa do projeto `b` continua (AC 25)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "apagar projeto apaga mesas"`

**C26** - A lista de um projeto de `2` mesas, copies `4` e labor `30` mostra `2 mesas · 4 cópias do produto · mão de obra 30%` (AC 26)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista duas mesas"`

**C27** - A lista de um projeto com uma mesa mostra `1 mesa` e não mostra `1 mesas` (AC 27)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista uma mesa"`

**C28** - A lista de um projeto de mesas mantém a legenda `lote, tarifa atual` e não mostra `sem cores` nem `tempo incompleto` (AC 28)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista de mesas sem sem cores"`

**C29** - A lista do projeto `Suporte` sem mesas, mode `lote` e copies `4`, não contém `mesa` na linha de cópias e mão de obra (AC 29)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista sem mesas nao conta mesa"`

**C30** - Depois que a tabela `mesa` passa a existir, um `projeto` já gravado com hours `2`, minutes `15` e uma cor continua com esses valores e essa cor, e `mesa` tem `0` linhas (AC 30)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "tabela mesa nasce vazia"`

**C31** - Adicionar mesa para `?projeto=ausente`, id que não está gravado, mostra `Esse projeto não está no banco. Salvar cria um novo.` e não insere projeto nem mesa (AC 31)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "frase de projeto ausente"`
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "projeto ausente nao ganha mesa"`

**C32** - Salvar um `?projeto=ausente` que ainda é impressão única cria um id de projeto diferente de `ausente`, com `0` linhas em `mesa` (AC 32)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "salvar impressao ausente cria id"`

**C33** - Enquanto há mesas, a tela mostra um campo `Mão de obra (%)` e um campo `Cópias do produto` (AC 33)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "rotulos de mao de obra e copias"`

**C34** - Enquanto há mesas, a tela não mostra `Uma peça`, `O lote inteiro`, `Uma cor` nem `Várias cores` (AC 34)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "sem modos da impressao unica"`

**C35** - Sem mesas, a tela mostra `Uma peça`, `O lote inteiro`, `Uma cor` e `Várias cores` (AC 35)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "modos da impressao unica"`

**C36** - Enquanto há mesas, a tela mostra `Cada mesa é uma chapa: um tempo e um filamento. A peça soma as mesas. As cópias multiplicam o produto.` (AC 36)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "frase de cada mesa"`

**C37** - Duas mesas com id `placa` no mesmo projeto, a primeira com hours `1` e a segunda com hours `2`, gravam uma mesa, com hours `1` (AC 37, door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "id de mesa unico no projeto"`

**C38** - O id `placa` no projeto `a` com hours `1` e no projeto `b` com hours `2` grava duas chapas (AC 38, door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "mesmo id de mesa em dois projetos"`

**C39** - Gravar uma mesa com name vazio guarda name `""` (AC 39)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "nome de mesa vazio gravado"`

**C40** - Duas mesas de C1, copies `1` e labor `0` listam o lote em `4` com a tarifa R$ 1/kWh. Trocar a tarifa para R$ 2/kWh, sem gravar o projeto de novo, lista o lote em `6` e deixa o `updated_at` do projeto igual (AC 40)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "tarifa nova nao regrava o projeto"`
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista recalcula com a tarifa"`

**C41** - Gravar um projeto de mesas com um campo `""` entre hours, minutes, price, grams, copies e labor mostra `Campo vazio.` nesse campo (AC 41)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "gravar mesa campo vazio"`

**C42** - Gravar um projeto de mesas com um campo `-1` entre hours, minutes, price, grams, copies e labor mostra `Use zero ou um número positivo.` nesse campo (AC 42)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "gravar mesa numero invalido"`

**C43** - Remover uma mesa de um projeto que tem duas tira essa mesa no mesmo clique, sem um passo `confirmar-apagar` (AC 43)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "remover mesa sem confirmar"`

**C44** - `mesa` nasce com `projeto_id text NOT NULL`, `id text NOT NULL`, `hours text NOT NULL`, `minutes text NOT NULL`, `name text NOT NULL`, `hex text NOT NULL`, `price text NOT NULL`, `grams text NOT NULL`, `posicao integer NOT NULL`, chave primária `(projeto_id, id)` e `projeto_id` referenciando `projeto (id)` com `ON DELETE CASCADE`. As colunas de `projeto` continuam exatamente `id`, `name`, `printer_id`, `mode`, `copies`, `hours`, `minutes`, `labor`, `color_mode`, `grams`, `updated_at` (door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "tabela mesa no schema"`

**C45** - Gravar o projeto `a` sem mesas, estando ele com `2` linhas em `mesa`, deixa `a` com `0` linhas em `mesa`; a mesa do projeto `b` continua (door 2)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "payload sem mesas apaga mesa"`

**C46** - Sem mesas, mode `lote` mostra `Cópias na mesa` e `Peso da mesa`; mode `peca` mostra `Peso da peça` (Impact)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "frases da impressao unica"`

**C47** - Com mesas, a tela não mostra `Cópias na mesa` nem `Peso da mesa` (Impact)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "mesas sem frases da chapa"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| campo de mesa vazio ou inválido (8) | hours `""` C4 · minutes `""` C4 · grams `""` C4 · price `""` C4 · hours `-1` C4 · minutes `-1` C4 · grams `-1` C4 · price `-1` C4 | - |
| cópias que não fecham o lote (3) | `""` C5 · `0` C5 · `2,5` C5 | - |
| aviso dessas cópias (3) | `""` C6 · `0` C6 · `2,5` C6 | - |
| campos da mesa aberta (6) | hours C13 · minutes C13 · name C13 · hex C13 · price C13 · grams C13 | - |
| famílias no projeto (3) | só mesas C21 · só impressão C45 · corrida C23 | - |
| corrida de updated_at (2) | vencedor mesas C23 · vencedor cores C23 | - |
| contagem na lista (3) | `0` C29 · `1` C27 · `2` C26 | - |
| modos ausentes com mesas (4) | `Uma peça` C34 · `O lote inteiro` C34 · `Uma cor` C34 · `Várias cores` C34 | - |
| modos presentes sem mesas (4) | `Uma peça` C35 · `O lote inteiro` C35 · `Uma cor` C35 · `Várias cores` C35 | - |
| erro na Calculadora (6) | totais nulos C4 · cópias C6 · várias cores C14 · projeto ausente C31 · campo vazio C41 · número inválido C42 | - |
| campo numérico vazio ao gravar (6) | hours C41 · minutes C41 · price C41 · grams C41 · copies C41 · labor C41 | - |
| campo numérico inválido ao gravar (6) | hours C42 · minutes C42 · price C42 · grams C42 · copies C42 · labor C42 | - |
| frases da chapa na impressão única (3) | `Cópias na mesa` C46 · `Peso da mesa` C46 · `Peso da peça` C46 | - |
| frases da chapa ausentes com mesas (2) | `Cópias na mesa` C47 · `Peso da mesa` C47 | - |
| colunas de mesa (9) | projeto_id C44 · id C44 · hours C44 · minutes C44 · name C44 · hex C44 · price C44 · grams C44 · posicao C44 | - |
| colunas de projeto (11) | id C44 · name C44 · printer_id C44 · mode C44 · copies C44 · hours C44 · minutes C44 · labor C44 · color_mode C44 · grams C44 · updated_at C44 | - |
| startup schema mesa (1) | garantirSchema C44 | - |
| id da mesa (2) | único no projeto C37 · repetido em outro projeto C38 | - |

- C4, C5, C6, C23, C41 e C42 nomeiam cada membro do conjunto; a prova é um teste que afirma cada membro
- Leitura de linha gravada: C13, C15, C21, C22, C23, C30, C44, C45 — cada prova lê a linha de volta
- Surface não tem rota consumida fora do app; `/`, `/projetos` e `/configuracoes` continuam as mesmas

## Swept

- validation: C4, C5, C6, C10, C41, C42
- failure modes: C14, C22, C31
- idempotency: C23, C37
- authorization: existing - AD-001, não há conta nem sessão
- concurrency: C23
- data lifecycle: C25, C30, C45
- dependency failure: n/a - a feature não acrescenta dependência; falha de banco continua `Não deu para ler o banco.`
- state transitions: C15, C16, C17, C18, C19, C20
- observability: n/a - nenhum requisito de log nesta feature

## Handoff

- S1 = 13318, em `custo.ts` (10104) + `custo.test.ts` (5397) + `vistas.ts` (1983) + `vistas.test.ts` (4456) + `calculadora.tsx` (28868) + `docs/custo.md` (2465) = 53273 bytes / 4
- S2 acrescenta `banco.ts` (18995) + `banco.test.ts` (19745) + `projetos-store.ts` (3926) + `projetos-store.test.ts` (3384) + `lista-projetos.tsx` (6737) + `number-field.tsx` (2273) + `docs/dados.md` (2995) = 58055 bytes / 4 = 14514; `calculadora.tsx` e `vistas` já entraram em S1
- Total 27832, abaixo do orçamento de 150k — one builder
- Mechanism: one builder
- Built: C1–C47
