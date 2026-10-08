# Ambiente e banco checks

Profile: light
Plan: `.specs/features/ambiente-banco/plan.md`

50 checks in 2 slices · 8 one-way doors · 0 open

## Checks

### S1 - Compose local · 3 files · 11 KB · ~3k

**C1** - `docker compose up` responde HTTP 200 em `http://127.0.0.1:4317/` (AC 1)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose responde 200"`

**C2** - O serviço app define `DATABASE_URL` como `postgresql://custo:custo@postgres:5432/custo_chapa` (AC 2)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose define database url"`

**C3** - O serviço postgres usa a imagem `postgres:18` com `POSTGRES_USER` `custo`, `POSTGRES_PASSWORD` `custo` e `POSTGRES_DB` `custo_chapa` (AC 3)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose postgres 18 custo"`

**C4** - O volume nomeado `custo-chapa-pg` está montado em `/var/lib/postgresql` (AC 4)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose volume custo-chapa-pg"`

**C5** - O serviço postgres não publica porta no host (AC 5)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose postgres sem porta"`

**C6** - Depois de `docker compose down` e `docker compose up`, o volume nomeado `custo-chapa-pg` ainda existe (AC 6)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "volume sobrevive ao down"`

**C7** - Se `pg_isready -U custo -d custo_chapa` falha, o serviço postgres não fica healthy (AC 7)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "healthcheck pg_isready falho"`

**C8** - O serviço app usa a imagem `node:24` e o comando `npm run dev` (AC 8)
Proof: `node --experimental-strip-types --test src/lib/compose.test.ts --test-name-pattern "compose app node 24"`

### S2 - Volume Postgres · 20 files · 470 KB · ~118k

**C9** - Banco sem impressora grava id `k2-pro`, nome `K2 Pro`, watts `150`, energyPrice `1.18`, printerPrice `7979`, lifeHours `3000`, e esse id é o ativo (AC 9)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "semente k2 pro"`

**C10** - Um projeto gravado é relido com o mesmo id, nome, printerId, mode, copies, hours, minutes, labor e cores (AC 10)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "rele o projeto gravado"`

**C11** - O id de projeto gravado por um pool é devolvido por outro pool na mesma database (AC 11)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "projeto sobrevive a outro pool"`

**C12** - Com as chaves do navegador ausentes, o projeto já gravado continua na leitura (AC 12)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "navegador limpo mantem o projeto"`

**C13** - watts, energyPrice, printerPrice, lifeHours, copies, hours, minutes, labor, preço da cor e gramas voltam no texto digitado, inclusive `""` (AC 13)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "texto digitado inclusive vazio"`

**C14** - Gravar de novo o mesmo id de projeto deixa um projeto com os campos da segunda gravação (AC 14)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "segunda gravacao do mesmo id"`

**C15** - Duplicar cria outro id, o nome de origem acrescido de ` (cópia)`, os mesmos ids de cor e outro `updatedAt` (AC 15)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "duplicar projeto"`

**C16** - Apagar um projeto tira esse id e zera as cores dele (AC 16)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "apagar projeto zera as cores"`

**C17** - Remover a impressora ativa, havendo outra, tira o id removido e marca a impressora restante gravada primeiro (AC 17)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "remover ativa marca a primeira restante"`

**C18** - Uma remoção que deixaria zero impressoras mantém um id que já estava gravado (AC 18)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "recusa apagar a ultima impressora"`

**C19** - Impressora adicionada fica ativa, com nome `Nova impressora` e watts, energyPrice, printerPrice e lifeHours vazios (AC 19)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "nova impressora nasce zerada"`

**C20** - Projeto sem id, ou com mode diferente de `peca` e de `lote`, não acrescenta linha (AC 20)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "rejeita projeto sem id ou mode"`

**C21** - Um projeto com printerId `nao-existe` é gravado (AC 21)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "projeto com impressora ausente"`

**C22** - `marcarImpressoraDoProjeto` chamado pela página `/?projeto=<id>` marca o printerId quando ele existe (AC 22)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "url projeto marca a impressora"`

**C23** - Enquanto a leitura não voltou, Calculadora, Projetos e Configurações mostram `Lendo impressoras e projetos.` (AC 23)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "tres telas lendo"`

**C24** - Sem conexão, as três telas mostram o título `Não deu para ler o banco.` e não mostram `Nenhum projeto salvo` nem o formulário da impressora (AC 24)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "tres telas sem banco"`

**C25** - Na semente, a primeira leitura com `custo-chapa-projetos` grava a lista que o parse devolve (AC 25)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "copia projetos da semente"`

**C26** - Na semente, a primeira leitura com `custo-chapa-impressora` grava a loja que o parse devolve (AC 26)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "copia impressoras da semente"`

**C27** - Na semente, a primeira leitura com as duas chaves grava impressoras e projetos (AC 27)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "copia as duas chaves"`

**C28** - Se o commit dessa cópia falha, ficam uma impressora `k2-pro` com watts `150`, energyPrice `1.18`, printerPrice `7979`, lifeHours `3000` e zero projetos (AC 28)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "falha da copia mantem a semente"`

**C29** - Fora da semente, a leitura não substitui impressoras nem projetos pelo localStorage (AC 29)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "nao copia fora da semente"`

**C30** - Dois objetos com o mesmo id no JSON de projetos gravam esse id uma vez, com os campos do primeiro (AC 30)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "id duplicado fica o primeiro"`

**C31** - Existe exatamente um id de impressora ativa, e ele é o id de uma impressora gravada (AC 31)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "exatamente uma impressora ativa"`

**C32** - A leitura devolve as impressoras na ordem de inserção (AC 32)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "impressoras na ordem de insercao"`

**C33** - A lista de projetos ordena por `updatedAt` decrescente e, no empate, pelo nome em pt-BR (AC 33)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "projetos por data e nome"`

**C34** - Duas gravações com ids de projeto diferentes, em paralelo, deixam os dois ids presentes (AC 34)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "duas gravacoes em paralelo"`

**C35** - Com o banco inalcançável, o stdout inclui `banco indisponível` (AC 35)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "stdout banco indisponivel"`

**C36** - Ler e gravar um projeto não usa cookie de sessão (AC 36)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "leitura e escrita sem cookie"`

**C37** - O lede de Projetos é `Lotes gravados no banco: modo, cópias, tempo, mão de obra e cores. A tarifa fica na impressora, então o total acompanha a máquina. Abrir marca a impressora do projeto.` (AC 37)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lede de projetos"`

**C38** - O lede de Configurações é `A K2 Pro já vem preenchida: 150 W, R$ 1,18 por kWh, R$ 7.979 e 3.000 horas. Dá para ter mais de uma máquina; a calculadora usa a marcada. A tarifa fica na impressora, no banco deste computador.` (AC 38)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "lede de configuracoes"`

**C39** - A Calculadora mostra `Gravar o lote deixa o projeto no banco.` (AC 39)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "frase gravar o lote"`

**C40** - Projeto ausente mostra `Esse projeto não está no banco. Salvar cria um novo.` (AC 40)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "projeto ausente no banco"`

**C41** - Projeto já gravado mostra `Gravado no banco. Salvar de novo atualiza este projeto.` (AC 41)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "projeto gravado no banco"`

**C42** - Enquanto a leitura não voltou, Configurações mostra `As impressoras ficam no banco deste computador, sem conta.` (AC 42)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "configuracoes lendo o banco"`

**C43** - Enquanto a leitura não voltou, Projetos mostra `Os projetos ficam no banco deste computador, sem conta.` (AC 43)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "projetos lendo o banco"`

**C44** - A seção Como rodar do README inclui `docker compose up` e `http://127.0.0.1:4317` (AC 44)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "readme compose up"`

**C45** - `docs/dados.md` diz que impressoras e projetos ficam no Postgres do volume `custo-chapa-pg` (AC 45)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "dados no volume"`

**C46** - `AGENTS.md` e `docs/arquitetura.md` dizem que `impressora.ts` e `projetos.ts` leem e gravam pelo servidor, e que `custo.ts`, `impressora-store.ts` e `projetos-store.ts` continuam sem o driver do banco (AC 46)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "adapters pelo servidor"`

**C47** - `pg` é importado por `src/lib/banco.ts` e não por `impressora.ts`, `projetos.ts`, `custo.ts`, `impressora-store.ts` nem `projetos-store.ts` (door 2)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "so banco importa pg"`

**C48** - Duas remoções simultâneas das duas últimas impressoras deixam ao menos um id que já estava gravado (door 5)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "duas remocoes simultaneas"`

**C49** - O mesmo id de cor existe em dois projetos, e dentro de um projeto esse id fica uma vez, com os campos da primeira cor (door 7)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "id de cor no projeto"`

**C50** - `abrirBancoDoAmbiente` lê e grava na database de `DATABASE_URL` (startup)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "abre pela database url"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| Landing doors (8) | compose C1 · quem abre o banco C47 · texto digitado C13 · impressora ativa C31 · última impressora C18 · projeto sem impressora C21 · id de cor C49 · cópia do navegador C27 | - |
| startup DATABASE_URL (2) | compose C2 · processo C50 | - |
| telas em leitura (3) | Calculadora C23 · Projetos C23 · Configurações C23 | - |
| telas sem banco (3) | Calculadora C24 · Projetos C24 · Configurações C24 | - |
| campos em texto (10) | C13, table-driven over all 10 | - |
| rejeição de projeto (2) | sem id C20 · mode fora de peca e lote C20 | - |
| cópia da semente (4) | projetos C25 · impressoras C26 · as duas chaves C27 · commit falho C28 | - |
| ordenação (2) | impressoras C32 · projetos C33 | - |
| documentos (4) | README C44 · dados.md C45 · AGENTS.md C46 · arquitetura.md C46 | - |
| entidades (3) | Printer C9 · Project C10 · Color C16 | - |
| remoção da última (2) | uma impressora C18 · duas simultâneas C48 | - |

- Claims naming a status code, route or response shape: C1, C22 - each has a proof that crosses the boundary
- No other check claims more than the single case its proof exercises

## Swept

- validation: C13, C20
- failure modes: C18, C24, C28
- idempotency: C14, C30
- authorization: C36
- concurrency: C34, C48
- data lifecycle: C6, C11, C12, C25
- dependency failure: C24, C35
- state transitions: C17, C19, C31
- observability: C35

## Handoff

- S1 = 3k, compose; S2 entra no banco, nas telas e no `package-lock.json` (345 KB) e fecha em ~121k, abaixo do orçamento de 150k — one builder
- Mechanism: one builder
