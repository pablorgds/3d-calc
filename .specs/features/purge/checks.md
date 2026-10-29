# Purge checks

Profile: light
Plan: `.specs/features/purge/plan.md`

53 checks in 2 slices · 2 one-way doors · 0 open

## Checks

A impressora dos números, quando o check não disser outra, é 100 W, R$ 1/kWh, R$ 1000 e 1000 h, coeficiente `''`, nome `Prova`. A impressão de prova, quando o check não disser outra, é modo `peca`, 0 h, 0 min, mão de obra `0`, `color_mode` várias cores, sem mesas, e três cores nesta ordem: preto 20 g a R$ 80/kg, branco 10 g a R$ 120/kg, vermelho 5 g a R$ 100/kg.

### S1 - Purge na conta · 3 files · 33 KB · ~9k

**C1** - Purge `30` na impressão de prova: preto 1.6, branco 4.8, vermelho 3.5, material 9.9, gramas 35 (AC 1, door 2)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "purge 30 fecha material 9,90"`

**C2** - Purge `''` na impressão de prova: material 3.3, gramas 35 (AC 2)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "purge vazio fecha material 3,30"`

**C3** - Purge `0` na impressão de prova: material 3.3, gramas 35 (AC 3)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "purge zero fecha material 3,30"`

**C4** - Purge `   ` na impressão de prova: material 3.3, gramas 35 (AC 4)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "purge so espacos fecha material 3,30"`

**C5** - Várias cores, só preto 20 g a R$ 80/kg e purge `30`: material 1.6, gramas 20 (AC 5)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "uma cor nao paga o purge"`

**C6** - Ordem vermelho 5 g a R$ 100/kg, branco 10 g a R$ 120/kg, preto 20 g a R$ 80/kg, purge `30`: linhas 0.5, 4.8 e 4, material 9.3 (AC 6)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "ordem invertida muda quem paga o purge"`

**C7** - Duas cores nomeadas `PLA preto`, 20 g a R$ 80/kg e 10 g a R$ 120/kg, purge `30`: linhas 1.6 e 4.8, material 6.4, gramas 30 (AC 7)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mesmo nome sao duas cores no purge"`

**C8** - Purge `30,5` na impressão de prova: branco 4.86, vermelho 3.55, material 10.01 (AC 8)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "purge 30,5 nas linhas"`

**C9** - Purge `abc` na impressão de prova: material, mão de obra, total da peça e total do lote são `null` (AC 9)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "purge abc anula material mao e totais"`

**C10** - Purge `-1` na impressão de prova: material `null` (AC 10)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "purge negativo anula o material"`

**C11** - Gramas do preto `''` e purge `30`: material `null` (AC 11)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "peso vazio anula antes do purge"`

**C12** - Sem cores e purge `''`: material 0 (AC 12)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "sem cores e purge vazio da material 0"`

**C13** - Sem cores e purge `30`: material 0 (AC 13)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "sem cores e purge 30 da material 0"`

**C14** - Sem cores e purge `abc`: material `null` (AC 14)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "sem cores e purge abc anula o material"`

**C15** - `color_mode` `unica`, gramas `800`, preço `100`, purge `30`: material 80, gramas 800 (AC 15)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "cor unica ignora purge 30"`

**C16** - Uma mesa de 0 h, 0 min, 1000 g a preço `100`, mão de obra `0`, cópias `1`, purge `30`: material da peça 100, gramas 1000, total 100 (AC 16)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mesa ignora purge 30"`

**C17** - Impressão de prova com purge `30` e mão de obra `10`: material 9.9, mão de obra 0.99, gramas 35, total 10.89 (AC 17)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "mao de obra 10 inclui o purge"`

**C18** - A entrada de C17 com 60 min: energia 0.1, depreciação 1, mão de obra 1.1, material 9.9 (AC 18)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "sessenta min com purge 30"`

**C19** - Impressão de prova com purge `30`, mão de obra `0` e coeficiente `20`: material 9.9, mão de obra 0, gramas 35, total 12.375 (AC 19)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "coeficiente 20 nao escala as linhas do purge"`

**C20** - Modo `lote`, cópias `2`, mão de obra `0`, purge `30`: material do lote 9.9, da peça 4.95, gramas 35 e 17.5, linhas 1.6, 4.8 e 3.5 (AC 20)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "lote de 2 copias escala o purge"`

**C21** - Modo `lote`, cópias `0`, mão de obra `0`, purge `30`: total da peça `null`, material do lote 9.9, gramas do lote 35 (AC 21)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "lote de 0 copias mantem o purge"`

**C22** - Purge `abc`, 60 min e as três cores fechadas: energia 0.1, depreciação 1, material `null`, mão de obra `null` (AC 22)
Proof: `node --experimental-strip-types --test src/lib/custo.test.ts --test-name-pattern "purge abc mantem energia e depreciacao"`

### S2 - Campo, gravação e cópia · 8 files · 217 KB · ~55k

**C23** - Várias cores e sem mesas: a tela mostra o campo `Purge por troca (g)` (AC 23)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "rotulo purge nas varias cores"`

**C24** - Cor única: a tela não mostra o campo `Purge por troca (g)` (AC 24)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "rotulo purge ausente na cor unica"`

**C25** - Com ao menos uma mesa: a tela não mostra o campo `Purge por troca (g)` (AC 25)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "rotulo purge ausente nas mesas"`

**C26** - Campo visível e purge `''`: a tela não mostra `Campo vazio.` (AC 26)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "purge vazio sem a frase campo vazio"`

**C27** - Gravar purge `30` no lote `Suporte` devolve `30` na leitura seguinte (AC 27)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava purge 30"`

**C28** - Gravar purge `''` num lote `Suporte` que fecha devolve `''` na leitura seguinte (AC 28)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava purge vazio"`

**C29** - Gravar purge ` 30 ` devolve ` 30 ` na leitura seguinte (AC 29)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava purge com espacos em volta"`

**C30** - Gravar purge `   ` devolve `   ` na leitura seguinte (AC 30)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "grava purge so com espacos"`

**C31** - Uma linha de `projeto` que não tinha purge, depois da coluna, lê `''` (AC 31)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "projeto antigo le purge vazio"`

**C32** - Um payload de projeto sem purge lê `''` (AC 32)
Proof: `node --experimental-strip-types --test src/lib/projetos-store.test.ts --test-name-pattern "payload sem purge le vazio"`

**C33** - Gravar um lote novo `Suporte` com purge `abc` não cria o projeto e marca o campo com `Use zero ou um número positivo.` (AC 33)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "purge abc nao cria o lote"`

**C34** - Purge gravado `''` e a tentativa de gravar `abc` deixa a leitura seguinte em `''` (AC 34)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "purge abc nao substitui o vazio"`

**C35** - Gravar purge `30` e depois salvar o mesmo projeto como cor única devolve purge `30` (AC 35)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "purge sobrevive na cor unica"`

**C36** - Gravar purge `30` e depois salvar o mesmo projeto com uma mesa devolve purge `30` (AC 36)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "purge sobrevive nas mesas"`

**C37** - Duplicar `Suporte` com purge `30` grava a cópia com purge `30` e nome `Suporte (cópia)` (AC 37)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "duplicar copia o purge 30"`

**C38** - Duplicar um projeto de mesas com purge `30` sem uso grava a cópia com purge `30` (AC 38)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "duplicar mesas copia o purge"`

**C39** - Gravar purge `30` duas vezes no mesmo id deixa um projeto com purge `30` (AC 39)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "gravar purge duas vezes deixa um projeto"`

**C40** - A conta A grava purge `30` e a leitura da conta B não devolve esse `30` (AC 40)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "purge nao vaza para outra conta"`

**C41** - Uma gravação de purge `30` que perde a corrida deixa a leitura seguinte em `''` (AC 41)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "purge atrasado fica vazio"`

**C42** - A tabela de custos não tem linha `Purge` (AC 42)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "tabela sem linha purge"`

**C43** - A impressão de prova com purge `30` e mão de obra `0` mostra o peso `formatGrams(35)` (AC 43)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "peso da prova sem as gramas de purge"`

**C44** - Impressão de prova com purge `30`, mão de obra `0`, lote `Suporte`, cliente `Ana` e telefone `11999990000`: o texto contém `formatBRL(9.9)` e não contém `Purge` nem `Material` (AC 44)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "texto do cliente leva o total com purge"`

**C45** - Purge `abc` não mostra `Copiar orçamento` (AC 45)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "purge abc esconde copiar orcamento"`

**C46** - A lista da impressão de prova gravada com purge `30` e mão de obra `0`, sem gravar de novo, mostra `formatBRL(9.9)` (AC 46)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista mostra o total com purge"`

**C47** - Coeficiente de `''` para `20`, sem gravar o projeto de novo: a lista mostra `formatBRL(12.375)` e o purge gravado continua `30` (AC 47)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lista acompanha coeficiente com purge gravado"`

**C48** - O formulário da impressora não mostra `Purge por troca (g)` (AC 48)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "impressora sem rotulo de purge"`

**C49** - Purge `abc` com as três cores fechadas: a tela não mostra `Há cor com preço ou peso vazio ou inválido.` (AC 49)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "purge abc nao usa o aviso de cor"`

**C50** - Preço de uma cor `''` e purge `30`: a tela mostra `Há cor com preço ou peso vazio ou inválido.` (AC 50)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "cor vazia mantem o aviso de cor"`

**C51** - Sem cores e purge `''`: a tela mostra `Sem cores. Material R$ 0,00.` (AC 51)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "sem cores e purge vazio mostra material zero"`

**C52** - Sem cores e purge `abc`: a tela não mostra `Sem cores. Material R$ 0,00.` (AC 52)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "sem cores e purge abc esconde material zero"`

**C53** - `projeto` tem `purge text NOT NULL` com default `''` (door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "coluna purge no schema"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| purge da impressão de prova (7) | `30` C1 · `''` C2 · `0` C3 · espaços C4 · `30,5` C8 · `abc` C9 · `-1` C10 | - |
| quem paga (4) | ordem da prova C1 · ordem invertida C6 · mesmo nome C7 · N=1 C5 | - |
| quem não lê o texto (2) | cor única C15 · mesas C16 | - |
| sem cores (3) | vazio C12 · `30` C13 · `abc` C14 | - |
| peça, lote e coeficiente (5) | mão de obra 10 C17 · 60 min C18 · coeficiente 20 C19 · lote 2 C20 · lote 0 C21 | - |
| campo na tela (4) | várias cores C23 · cor única C24 · mesas C25 · impressora C48 | - |
| vazio permitido (3) | sem `Campo vazio.` C26 · grava `''` C28 · grava espaços C30 | - |
| texto gravado (4) | `30` C27 · ` 30 ` C29 · linha antiga C31 · payload omite C32 | - |
| inválido não grava (2) | lote novo C33 · vazio permanece C34 | - |
| texto que sobrevive (4) | cor única C35 · mesas C36 · duplicar C37 · duplicar mesas C38 | - |
| um projeto (2) | duas gravações C39 · corrida C41 | - |
| contas (2) | conta A grava `30` C40 · conta B não lê `30` C40 | - |
| peso sem o purge (2) | linhas 1.6, 4.8 e 3.5 C1 · gramas 35 C1 | - |
| door 1 coluna (1) | `purge` C53 | - |
| door 2 reais na cor que entra (1) | branco 4.8 e vermelho 3.5 C1 | - |
| avisos (4) | sem aviso de cor C49 · aviso de cor C50 · sem cores C51 · sem cores `abc` C52 | - |
| orçamento e lista (4) | sem linha Purge C42 · texto com `formatBRL(9.9)` C44 · sem `Copiar orçamento` C45 · lista C46 | - |
| lista depois do coeficiente (1) | `formatBRL(12.375)` e purge `30` C47 | - |
| startup schema purge (1) | garantirSchema C53 | - |

- C1 afirma as três linhas, o material 9.9 e as gramas 35. C20 afirma que as linhas não escalam no lote.
- C33 e C34 afirmam a recusa na calculadora, no mesmo feitio de `errosAoGravar` para a mesa: a função que a tela chama e o retorno antes de gravar.
- C46 afirma `formatBRL(9.9)` e que a lista chama `draftToCalcInput`.
- Surface não tem rota nova. `/`, `/projetos` e `/configuracoes` continuam as mesmas, e `?projeto=` continua o mesmo.
- Nenhum outro check afirma mais do que o caso que a prova exercita.

## Swept

- validation: C1, C2, C3, C4, C8, C9, C10, C26
- failure modes: C9, C22, C33, C34
- idempotency: C39
- authorization: existing - AD-005 e AD-006; C40 separa o purge por conta
- concurrency: C41
- data lifecycle: C31, C32
- dependency failure: existing - a falha de banco continua `Não deu para ler o banco.`
- state transitions: C35, C36
- observability: n/a - nenhum requisito de log nesta feature

## Handoff

- S1 = 34163/4 = 8541, em `custo.ts` (15294) + `custo.test.ts` (15405) + `docs/custo.md` (3464)
- S2 acrescenta `calculadora.tsx` (38205) + `banco.ts` (44239) + `banco.test.ts` (79262) + `projetos-store.ts` (7656) + `projetos-store.test.ts` (3925) + `vistas.ts` (10591) + `vistas.test.ts` (33423) + `docs/dados.md` (4745) = 222046/4 = 55512
- `lista-projetos.tsx` e `configuracoes-form.tsx` não entram na soma: as provas leem os dois e não os alteram
- Total 256209/4 = 64052, abaixo do orçamento de 150k — one builder
- Mechanism: one builder
