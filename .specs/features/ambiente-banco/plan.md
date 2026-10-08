# Ambiente e banco

## Problem

A impressora ajustada e o lote gravado existem só neste navegador. Quem limpa os dados do site, troca de máquina ou abre outro navegador perde a K2 Pro e os projetos. O README diz que projetos e impressoras ficam neste navegador. Não há figura de suporte nem data marcada por outra pessoa.

Quando isto estiver pronto, a calculadora, a lista e as configurações continuam as mesmas ações, e um lote gravado continua lá depois de limpar o site e de recriar o container do app.

## Flow

Isto reusa o parse e as mutações que já existem em `impressora-store.ts` e `projetos-store.ts`, e a conta em `custo.ts` (exists). As telas continuam chamando só `impressora.ts` e `projetos.ts` (exists).

1. `docker compose up` -> compose (door 1) sobe `postgres:18` e `node:24`, entrega `DATABASE_URL` ao app e publica só a porta 4317.
2. O app (door 1) roda `npm run dev` e responde `/` em `127.0.0.1:4317`.
3. Gravar, marcar, duplicar ou apagar entra por `impressora.ts` ou `projetos.ts` (exists), que entregam o estado ao processo do app (door 2). Esse processo aplica a mutação pura (exists) e persiste no Postgres (door 1).
4. `README.md`, `docs/dados.md`, `docs/arquitetura.md` e `AGENTS.md` (exists) passam a descrever o volume e esses adaptadores.
5. out: a tela seguinte lê o que o volume guardou.

A leitura bifurca:

```mermaid
flowchart TD
    IN[abre Calculadora, Projetos ou Configuracoes] --> ADAPT["impressora.ts e projetos.ts (exists)"]
    ADAPT --> READ["Postgres (door 1)"]
    READ --> FAIL["sem conexao (door 2)"]
    READ --> COPY["banco ainda e a semente e o navegador tem chave (door 8)"]
    READ --> HIT["linhas gravadas (door 3)"]
    COPY --> PARSE["impressora-store.ts e projetos-store.ts (exists)"]
    PARSE --> HIT["linhas gravadas (door 3)"]
    FAIL --> TELA["Calculadora, ListaProjetos, ConfiguracoesForm (exists)"]
    HIT --> TELA["Calculadora, ListaProjetos, ConfiguracoesForm (exists)"]
```

## Impact

| Front | What changes |
| --- | --- |
| domain | termo existente: "neste navegador", na calculadora, na lista, nas configurações e nos ledes, passa a apontar para o volume Postgres. Quem usa a frase hoje: `Calculadora`, `ListaProjetos`, `ConfiguracoesForm`, `src/app/projetos/page.tsx`, `src/app/configuracoes/page.tsx` |
| stored data | não há linha de servidor para migrar. As chaves `custo-chapa-impressora` e `custo-chapa-projetos` são copiadas uma vez, e só enquanto o banco ainda é a semente. Um banco que já divergiu da semente não é reescrito |

## Relations

```mermaid
erDiagram
    Printer ||--o{ Project : "referencia, ausencia permitida"
    Project ||--o{ Color : "contem"
```

Restrições de mão única: id de impressora único; exatamente uma impressora ativa (door 4); a remoção não deixa zero impressoras (door 5); id de projeto único; id de cor único só dentro do projeto (door 7); `printerId` pode não corresponder a impressora nenhuma (door 6); apagar o projeto apaga as cores no mesmo commit. Sem colunas e sem tipos aqui.

## Surface

None - nothing consumed outside

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| 1. Compose local | serviços `app` (`node:24`, comando `npm run dev`, porta `4317`, `DATABASE_URL` `postgresql://custo:custo@postgres:5432/custo_chapa`) e `postgres` (`postgres:18`, usuário `custo`, senha `custo`, banco `custo_chapa`, volume `custo-chapa-pg` em `/var/lib/postgresql`, sem porta no host, healthcheck `pg_isready -U custo -d custo_chapa`) | arquivo SQLite no container do app, porque o banco precisava existir como serviço antes da app gravar; publicar `5432` no host, porque a senha é a de desenvolvimento |
| 2. Quem abre o banco | só o processo do app abre o Postgres; `impressora.ts` e `projetos.ts` continuam sendo o que a tela chama | o navegador abrir o Postgres, e uma rota pública `/api`, porque nada fora deste repositório a chamaria e o caminho viraria contrato |
| 3. Texto digitado | watts, tarifa, preço, vida útil, cópias, tempo, mão de obra, preço da cor e gramas ficam no texto digitado, inclusive string vazia | coluna numérica, porque vazio, zero e token inválido deixariam de ser estados diferentes |
| 4. Impressora ativa | existe exatamente um id ativo, e ele é o id de uma impressora gravada | booleano em cada impressora sem unicidade, porque duas podem ficar marcadas |
| 5. Última impressora | a remoção e a contagem que a recusa commitam juntas; se o commit deixaria zero impressoras, ele não entra | a recusa só em `deletePrinter` na memória, porque duas abas podem apagar as duas últimas |
| 6. Projeto sem impressora | um projeto pode guardar um `printerId` que não existe mais | chave estrangeira que recusa o projeto, porque a lista já mostra "Impressora removida" e abrir usa a máquina marcada |
| 7. Id de cor | único dentro do projeto, repetível entre projetos | id de cor único no banco inteiro, porque `copyProject` copia as cores com o mesmo id |
| 8. Cópia do navegador | as duas chaves entram no mesmo commit, e só quando o banco ainda é a semente (uma impressora `k2-pro`, nome `K2 Pro`, watts `150`, energyPrice `1.18`, printerPrice `7979`, lifeHours `3000`, ativa, e zero projetos) | copiar em toda leitura, porque uma edição já gravada seria substituída pelo que sobrou no navegador |

- Nothing else in this change is hard to reverse

## Criteria

### S1: O compose sobe o app e o Postgres (P1)

`docker compose up` deixa a calculadora em `127.0.0.1:4317` e o volume do Postgres de pé. Este slice não troca os adaptadores. A calculadora ainda neste navegador é a demo do slice, não um critério do resultado final: o slice seguinte passa a gravar.

**Acceptance Criteria**

1. WHEN `docker compose up` THEN the system SHALL responder HTTP 200 em `http://127.0.0.1:4317/`.
2. WHILE o container do app está no ar the system SHALL definir `DATABASE_URL` como `postgresql://custo:custo@postgres:5432/custo_chapa`.
3. The system SHALL rodar a imagem `postgres:18` com `POSTGRES_USER` `custo`, `POSTGRES_PASSWORD` `custo` e `POSTGRES_DB` `custo_chapa`.
4. The system SHALL montar o volume nomeado `custo-chapa-pg` em `/var/lib/postgresql`.
5. The system SHALL NOT publicar porta do host para o serviço postgres.
6. WHEN `docker compose down` e depois `docker compose up` THEN the system SHALL ainda ter o volume nomeado `custo-chapa-pg`.
7. IF `pg_isready -U custo -d custo_chapa` falha THEN the system SHALL NOT reportar o serviço postgres como healthy.
8. The system SHALL rodar o app pela imagem `node:24` com o comando `npm run dev`.

**Independent test:** `docker compose up`, pedido a `http://127.0.0.1:4317/`, postgres healthy, sem mapeamento de `5432` no host, volume `custo-chapa-pg` presente. Antes do slice seguinte, gravar um lote não cria linha de projeto.

### S2: Impressoras e projetos ficam no volume (P2)

Gravar, reabrir, duplicar e apagar usam o Postgres. Limpar o site e recriar o container do app não apagam o lote. A fórmula em `custo.ts` não muda.

**Acceptance Criteria**

9. WHEN o banco não tem impressora THEN the system SHALL gravar uma, id `k2-pro`, nome `K2 Pro`, watts `150`, energyPrice `1.18`, printerPrice `7979`, lifeHours `3000`, e esse id SHALL ser o ativo.
10. WHEN um projeto é gravado THEN uma leitura posterior SHALL devolver o mesmo id, nome, printerId, mode, copies, hours, minutes, labor e cores.
11. WHEN o container do app é recriado THEN esse id de projeto SHALL continuar sendo devolvido.
12. WHEN os dados do site dessa origem são apagados e a página recarrega THEN esse projeto SHALL continuar na lista.
13. The system SHALL guardar watts, energyPrice, printerPrice, lifeHours, copies, hours, minutes, labor, preço da cor e gramas no texto digitado, inclusive a string vazia.
14. WHEN o mesmo id de projeto é gravado de novo THEN the system SHALL manter um projeto com esse id e os campos SHALL ser os da segunda gravação.
15. WHEN um projeto é duplicado THEN a cópia SHALL ter outro id de projeto, o nome de origem acrescido de ` (cópia)`, os mesmos ids de cor e outro `updatedAt`.
16. WHEN a exclusão de um projeto é confirmada THEN esse id SHALL estar ausente e nenhuma cor dele SHALL permanecer.
17. WHEN a impressora ativa é removida e existe outra THEN o id removido SHALL estar ausente e o id ativo SHALL ser a impressora restante gravada primeiro.
18. IF uma remoção deixaria zero impressoras THEN the system SHALL manter ao menos um id de impressora que já estava gravado.
19. WHEN uma impressora é adicionada THEN ela SHALL ser a ativa, o nome SHALL ser `Nova impressora`, e watts, energyPrice, printerPrice e lifeHours SHALL ser vazios.
20. IF um projeto chega sem id, ou com mode diferente de `peca` e de `lote` THEN the system SHALL NOT acrescentar linha de projeto.
21. The system SHALL gravar um projeto cujo printerId não corresponde a impressora nenhuma.
22. WHEN `/?projeto=<id>` é aberto e o printerId desse projeto existe THEN a impressora ativa SHALL passar a ser esse printerId.
23. WHILE a leitura não voltou, Calculadora, Projetos e Configurações SHALL mostrar o texto `Lendo impressoras e projetos.`
24. IF o banco não aceita conexão THEN essas três telas SHALL mostrar o título `Não deu para ler o banco.` e SHALL NOT mostrar `Nenhum projeto salvo` nem o formulário da impressora.
25. WHEN o banco é a semente (uma impressora `k2-pro`, nome `K2 Pro`, watts `150`, energyPrice `1.18`, printerPrice `7979`, lifeHours `3000`, ativa, zero projetos) e `custo-chapa-projetos` faz parse para uma lista THEN a primeira leitura SHALL gravar essa lista.
26. WHEN o banco é essa semente e `custo-chapa-impressora` faz parse para outra loja THEN a primeira leitura SHALL gravar essa loja de impressoras.
27. WHEN as duas chaves estão presentes e o banco é a semente THEN essa primeira leitura SHALL persistir impressoras e projetos no mesmo commit.
28. IF esse commit falha THEN the system SHALL ainda estar na semente: uma impressora `k2-pro` com esses quatro textos e zero projetos.
29. IF o banco não é a semente THEN the system SHALL NOT substituir impressoras nem projetos a partir do localStorage.
30. IF o JSON de projetos traz dois objetos com o mesmo id THEN the system SHALL gravar esse id uma vez, com os campos do primeiro objeto.
31. The system SHALL manter exatamente um id de impressora ativa, e esse id SHALL ser o de uma impressora gravada.
32. The system SHALL devolver as impressoras na ordem de inserção.
33. The system SHALL ordenar a lista de projetos por `updatedAt` decrescente e, no empate, pelo nome em pt-BR.
34. WHEN duas gravações com ids de projeto diferentes commitam THEN os dois ids SHALL estar presentes.
35. WHEN o banco está inalcançável THEN o stdout do processo do app SHALL incluir o texto `banco indisponível`.
36. The system SHALL servir leitura e escrita de impressoras e projetos sem cookie de sessão.
37. The system SHALL mostrar no lede de Projetos o texto `Lotes gravados no banco: modo, cópias, tempo, mão de obra e cores. A tarifa fica na impressora, então o total acompanha a máquina. Abrir marca a impressora do projeto.`
38. The system SHALL mostrar no lede de Configurações o texto `A K2 Pro já vem preenchida: 150 W, R$ 1,18 por kWh, R$ 7.979 e 3.000 horas. Dá para ter mais de uma máquina; a calculadora usa a marcada. A tarifa fica na impressora, no banco deste computador.`
39. The system SHALL mostrar na Calculadora a frase `Gravar o lote deixa o projeto no banco.`
40. The system SHALL mostrar, para projeto ausente, o texto `Esse projeto não está no banco. Salvar cria um novo.`
41. The system SHALL mostrar, para projeto já gravado, o texto `Gravado no banco. Salvar de novo atualiza este projeto.`
42. WHILE a leitura não voltou, Configurações SHALL mostrar `As impressoras ficam no banco deste computador, sem conta.`
43. WHILE a leitura não voltou, Projetos SHALL mostrar `Os projetos ficam no banco deste computador, sem conta.`
44. The system SHALL incluir, na seção Como rodar do README, o comando `docker compose up` e a URL `http://127.0.0.1:4317`.
45. The system SHALL dizer, em `docs/dados.md`, que impressoras e projetos ficam no Postgres do volume `custo-chapa-pg`.
46. The system SHALL dizer, em `AGENTS.md` e em `docs/arquitetura.md`, que `impressora.ts` e `projetos.ts` leem e gravam pelo servidor, e que `custo.ts`, `impressora-store.ts` e `projetos-store.ts` continuam sem o driver do banco.

**Independent test:** gravar um lote com nome, recriar o container do app, limpar os dados do site, e ver o lote em `/projetos`. Derrubar o Postgres e ver `Não deu para ler o banco.` nas três telas.

## Out of scope

| Excluded | Why |
| --- | --- |
| Login e sessão | um banco neste computador; conta é outra fase |
| Orçamento em PDF ou texto | fora desta versão |
| Refugo, impressão falha e purge | a conta não muda nesta fase |
| Mão de obra por hora | o percentual que já existe continua |
| Tarifa gravada no projeto | o projeto guarda `printerId`; o total usa a tarifa atual da impressora |
| Imagem de produção e deploy | este compose roda `npm run dev` |
| Publicar a porta do Postgres no host | o banco fica na rede do compose |

## Assumptions

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Montagem do código no container do app | bind do repositório e volume anônimo em `/app/node_modules` | o host é Windows; usar o `node_modules` do host quebra o container | n |
| Subida do app em relação ao Postgres | `depends_on` com `condition: service_healthy` | a primeira request não compete com o boot do banco | n |

**Open questions:** none - all resolved or logged above.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Calculadora | loading | AC 23, AC 39 |
| screen Calculadora | error | AC 24 |
| screen Calculadora | empty | n/a - é um formulário; projeto ausente usa o texto do AC 40 |
| screen Calculadora | unauthorised | n/a - não há sessão, AC 36 |
| screen Calculadora | destructive | n/a - salvar e novo não apagam um lote já gravado |
| screen Calculadora | ordering | n/a - a calculadora não lista projetos |
| screen Projetos | loading | AC 23, AC 43 |
| screen Projetos | error | AC 24 |
| screen Projetos | empty | existing - o card `Nenhum projeto salvo` quando a leitura devolve lista vazia |
| screen Projetos | unauthorised | n/a - não há sessão, AC 36 |
| screen Projetos | destructive confirm | existing - Apagar pede confirmar antes de remover |
| screen Projetos | ordering | AC 33 |
| screen Configurações | loading | AC 23, AC 42 |
| screen Configurações | error | AC 24 |
| screen Configurações | empty | n/a - sempre há ao menos uma impressora, AC 18 |
| screen Configurações | unauthorised | n/a - não há sessão, AC 36 |
| screen Configurações | destructive | existing - o botão Remover some quando só há uma máquina, sem diálogo |
| screen Configurações | ordering | AC 32, AC 17 |
| command `docker compose up` | success output | AC 1 |
| command `docker compose up` | failure halfway | AC 7 |
| command `docker compose up` | flags | n/a - a forma desta fase é `docker compose up` sem flags |
| command `docker compose up` | exit code | n/a - o sinal de falha do banco é o healthcheck, não um código novo do app |
| document README | next step | AC 44 |
| document docs/dados.md | structure | AC 45 |
| document AGENTS.md and docs/arquitetura.md | what to change next | AC 46 |

## Sources

- Os dois pontos já fechados nesta conversa: compose com app e Postgres antes, gravação de impressoras e projetos depois, cópia única do navegador enquanto o banco é a semente.
- [docs/dados.md](docs/dados.md) - o JSON que a semente e a cópia têm de preservar.
- Imagem oficial `postgres:18` - o volume desta linha monta em `/var/lib/postgresql`, não em `/var/lib/postgresql/data`.
