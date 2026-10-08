# Login checks

Profile: light
Plan: `.specs/features/login/plan.md`

61 checks in 6 slices · 5 one-way doors · 0 open

## Checks

A senha citada como `senha-oito` tem 10 caracteres. `1234567` tem 7. `12345678` tem 8. `segredo-inicial` é o valor de `SENHA_ADMIN` quando o check não disser outro.

### S1 - As três telas pedem a conta · 5 files · 4 KB · ~1k

**C1** - GET `/` sem cookie `sessao` responde 307 com Location `/entrar` (AC 1)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "get / sem cookie 307"`
Status: done

**C2** - GET `/projetos` sem cookie `sessao` responde 307 com Location `/entrar` (AC 2)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "get /projetos sem cookie 307"`
Status: done

**C3** - GET `/configuracoes` sem cookie `sessao` responde 307 com Location `/entrar` (AC 3)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "get /configuracoes sem cookie 307"`
Status: done

**C4** - GET `/entrar` sem cookie `sessao`, com ao menos uma conta, responde 200 e o título é `Entrar` (AC 4)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "get /entrar 200 titulo Entrar"`
Status: done

**C5** - Com ao menos uma conta, `/entrar` mostra os campos `E-mail` e `Senha` e os controles `Entrar` e `Criar conta` (AC 5)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "entrar mostra email senha e criar conta"`
Status: done

**C6** - GET `/entrar` com `sessao` válida responde 307 com Location `/` (AC 6)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "get /entrar com sessao 307"`
Status: done

**C7** - Cookie `sessao` com token que não está gravado, e cookie `sessao` com expiry já no passado, cada um faz GET `/` responder 307 com Location `/entrar` (AC 7)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "cookie sessao invalido 307"`
Status: done

**C8** - Com o Postgres recusando a conexão, GET `/entrar` responde 200, o título é `Não deu para ler o banco.` e o campo `Senha` não aparece (AC 8)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "entrar banco parado"`
Status: done

### S2 - A primeira conta e a conta nova · 4 files · 67 KB · ~17k

**C9** - Sem nenhuma conta e com `SENHA_ADMIN` `segredo-inicial`, fica uma conta `pablorgds@gmail.com` com papel `admin`, e toda impressora e todo projeto que já existiam passam a ser dela (AC 9, door 1, door 3)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "primeira conta fica com as linhas"`
Status: done

**C10** - Sem nenhuma conta, `SENHA_ADMIN` ausente, vazio ou `1234567` deixa zero contas, e GET `/entrar` responde 200 com o título `Falta a senha da primeira conta.` (AC 10)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "senha admin ausente vazia ou curta"`
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "entrar falta a senha da primeira conta"`
Status: done

**C11** - A conta não grava os caracteres de `SENHA_ADMIN`. O verificador é scrypt com sal de 16 bytes, N `16384`, r `8`, p `1` e chave de `32` bytes (AC 11, door 4)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "senha scrypt sem o texto"`
Status: done

**C12** - Login `pablorgds@gmail.com` com a senha igual a `SENHA_ADMIN` grava o cookie `sessao` (AC 12, door 2)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "login admin grava cookie sessao"`
Status: done

**C13** - Cadastro `outra@example.com` com senha `senha-oito` grava esse e-mail em minúsculas, uma impressora id `k2-pro`, nome `K2 Pro`, watts `150`, energyPrice `1.18`, printerPrice `7979`, lifeHours `3000`, e zero projetos dessa conta (AC 13, door 3)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "conta nova nasce k2 pro"`
Status: done

**C14** - Cadastro de um e-mail cujo minúsculo já está gravado mantém uma conta desse e-mail e mostra `Esse e-mail já tem conta.` (AC 14, door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "email duplicado uma conta"`
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "email duplicado mostra ja tem conta"`
Status: done

**C15** - Cadastro com senha `1234567` não grava conta para esse e-mail e mostra `A senha precisa de 8 caracteres.` (AC 15)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "senha 7 nao cria conta"`
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "senha 7 mostra 8 caracteres"`
Status: done

**C16** - Cadastro com e-mail `sem-arroba` não grava conta e mostra `E-mail inválido.` (AC 16)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "email sem arroba nao cria conta"`
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "email sem arroba mostra invalido"`
Status: done

**C17** - Se a transação que cria a conta nova e a K2 Pro dela faz rollback, não ficam essa conta nem uma impressora dela (AC 17)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "rollback nao deixa conta nem impressora"`
Status: done

**C18** - Dois cadastros de `dup@example.com` com senha `senha-oito` que commitam juntos deixam uma conta com esse e-mail (AC 18, door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "dois cadastros do mesmo email"`
Status: done

**C19** - Com a conta admin ainda na semente e `custo-chapa-projetos` fazendo parse para uma lista, a primeira leitura autenticada do admin grava essa lista só na conta admin (AC 19, door 5)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "copia do navegador so no admin"`
Status: done

**C20** - Uma conta que não é admin, com uma impressora `k2-pro` nos textos da semente e zero projetos, não grava `custo-chapa-projetos` nem `custo-chapa-impressora` desse pedido (AC 20, door 5)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "conta nova nao copia o navegador"`
Status: done

**C21** - Cadastro com senha `12345678` grava uma conta (door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "senha 8 cria conta"`
Status: done

### S3 - Uma conta não abre a linha da outra · 0 files novos · já contados em S2

**C22** - Com a sessão de `outra@example.com`, GET `/projetos` responde 200 e lista só os projetos dessa conta; o nome `Só da outra`, gravado só nela, aparece (AC 21)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "leitura so os projetos da conta"`
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "get /projetos 200 so da conta"`
Status: done

**C23** - Com papel `admin`, GET `/projetos` responde 200 e não inclui o nome de projeto gravado só em `outra@example.com` (AC 22)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "admin nao le projeto da outra"`
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "get /projetos admin sem o nome da outra"`
Status: done

**C24** - `/?projeto=` com id de projeto de outra conta mostra `Esse projeto não está no banco. Salvar cria um novo.` e não muda a impressora marcada da outra conta (AC 23)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "projeto alheio nao troca a marcada"`
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "projeto alheio mostra ausente"`
Status: done

**C25** - Uma escrita com id de impressora de outra conta deixa name, watts, energyPrice, printerPrice e lifeHours dessa impressora iguais (AC 24)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "escrita nao altera impressora alheia"`
Status: done

**C26** - Um save com id de projeto de outra conta deixa o name desse projeto igual, e a conta de quem chamou não passa a dona desse id (AC 25)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "save nao toma projeto alheio"`
Status: done

**C27** - Cada conta tem exatamente uma impressora marcada, e esse id é de uma impressora da mesma conta (AC 26, door 3)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "uma impressora marcada por conta"`
Status: done

**C28** - Duas contas, cada uma com impressora id `k2-pro`, deixam as duas linhas (AC 27, door 3)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "duas contas com k2-pro"`
Status: done

**C29** - Uma remoção que deixaria a conta com zero impressoras mantém ao menos um id de impressora dessa conta, mesmo com impressoras na outra conta (AC 28)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "nao apaga a ultima impressora da conta"`
Status: done

**C30** - GET `/` com `sessao` válida responde 200 e o corpo contém `Gravar o lote deixa o projeto no banco.` (Surface)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "get / com sessao 200"`
Status: done

### S4 - O admin redefine a senha · 1 file · 6 KB · ~1k

**C31** - Com papel `admin` e a conta `outra@example.com`, GET `/configuracoes` responde 200 e mostra `outra@example.com` (AC 29)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "configuracoes admin mostra o email"`
Status: done

**C32** - Com papel `comum`, Configurações não mostra `Redefinir senha` (AC 30)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "conta comum sem redefinir senha"`
Status: done

**C33** - A lista do admin com `a@example.com` e `m@example.com` mostra `a@example.com` antes de `m@example.com` (AC 31)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "emails do admin em ordem"`
Status: done

**C34** - Com o admin sem outra conta, Configurações mostra `Nenhuma outra conta.` (AC 32)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "nenhuma outra conta"`
Status: done

**C35** - Ativar `Redefinir senha` uma vez para `outra@example.com` não muda o verificador dessa conta (AC 33)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "primeiro clique nao muda a senha"`
Status: done

**C36** - Depois, `Redefinir` com senha `nova-senha` faz o login de `outra@example.com` com `senha-oito` mostrar `E-mail ou senha não confere.` e não gravar cookie `sessao` (AC 34)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "senha antiga nao entra"`
Status: done

**C37** - Com essa redefinição commitada, o login de `outra@example.com` com `nova-senha` grava cookie `sessao` (AC 35)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "senha nova entra"`
Status: done

**C38** - Essa redefinição apaga toda `sessao` de `outra@example.com` e mantém a `sessao` do admin (AC 36, door 2)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "redefinir apaga so a sessao da outra"`
Status: done

**C39** - Redefinir `pablorgds@gmail.com` mantém o verificador dessa conta (AC 37)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "nao redefine a senha do admin"`
Status: done

**C40** - Com papel `comum`, uma redefinição de qualquer e-mail mantém todo verificador (AC 38)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "conta comum nao redefine senha"`
Status: done

**C41** - Senha nova `1234567` na redefinição mantém o verificador anterior e mostra `A senha precisa de 8 caracteres.` (AC 39)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "redefinir senha curta mantem a anterior"`
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "redefinir senha curta mostra 8 caracteres"`
Status: done

### S5 - Entrar, sair e o cookie · 1 file · 1 KB · ~0k

**C42** - Login com e-mail e senha que não batem com uma conta mostra `E-mail ou senha não confere.` e não grava cookie `sessao` (AC 40)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "senha errada nao grava cookie"`
Status: done

**C43** - Login com e-mail `ninguem@example.com` mostra `E-mail ou senha não confere.` (AC 41)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "email desconhecido nao confere"`
Status: done

**C44** - Login com e-mail vazio, e login com senha vazia, cada um mostra `Preencha e-mail e senha.` e não grava cookie `sessao` (AC 42)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "login vazio pede email e senha"`
Status: done

**C45** - Login `Outra@Example.com` com a senha da conta gravada grava cookie `sessao` (AC 43)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "login ignora maiusculas do email"`
Status: done

**C46** - No login que dá certo, o cookie `sessao` é HttpOnly, SameSite `Lax`, Path `/`, sem Secure, e Max-Age `604800` (AC 44, door 2)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "cookie sessao httponly 7 dias"`
Status: done

**C47** - `Sair` faz o GET `/` seguinte responder 307 com Location `/entrar`, e esse token não continua gravado (AC 45)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "sair volta para entrar"`
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "sair apaga o token"`
Status: done

**C48** - Login que falha escreve `entrada recusada` no stdout e não escreve a senha enviada (AC 46)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "stdout entrada recusada"`
Status: done

**C49** - Dois logins da mesma conta deixam os dois tokens lendo essa conta, e um `Sair` remove só o token enviado (AC 47)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "sair remove so o token enviado"`
Status: done

**C50** - Com `sessao` válida, o cabeçalho mostra `Sair` (AC 48)
Proof: `node --experimental-strip-types --test src/lib/entrar.test.ts --test-name-pattern "cabecalho mostra Sair"`
Status: done

### S6 - O texto que ainda diz que não há conta · 7 files · 30 KB · ~8k

**C51** - Enquanto a leitura de impressoras e projetos não voltou, Configurações mostra `As impressoras desta conta ficam no banco deste computador.` (AC 49)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "configuracoes lendo desta conta"`
Status: done

**C52** - Enquanto a leitura de impressoras e projetos não voltou, Projetos mostra `Os projetos desta conta ficam no banco deste computador.` (AC 50)
Proof: `node --experimental-strip-types --test src/lib/vistas.test.ts --test-name-pattern "projetos lendo desta conta"`
Status: done

**C53** - `docs/dados.md` diz que cada conta tem as próprias impressoras e os próprios projetos (AC 51)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "dados cada conta"`
Status: done

**C54** - `docs/arquitetura.md` nomeia a rota `/entrar` e diz que `/`, `/projetos` e `/configuracoes` respondem 307 para `/entrar` sem `sessao` válida (AC 52)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "arquitetura entrar 307"`
Status: done

**C55** - O primeiro parágrafo de `AGENTS.md` diz que a calculadora pede a conta e não contém `Sem conta` (AC 53)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "agents pede a conta"`
Status: done

**C56** - A seção `## Backlog` do README não contém `login` (AC 54)
Proof: `node --experimental-strip-types --test src/lib/docs-banco.test.ts --test-name-pattern "readme backlog sem login"`
Status: done

**C57** - `impressora` tem chave primária `(conta_id, id)`. `impressora_ativa` tem chave primária `conta_id` apontando para uma impressora dessa conta (door 3)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "chave da impressora por conta"`
Status: done

**C58** - Existe índice único em `lower(email)`, e a única conta com papel `admin` é `pablorgds@gmail.com` (door 1)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "email unico e um admin"`
Status: done

**C59** - O valor do cookie `sessao` é o token gravado na linha e não contém `.` (door 2)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "token opaco igual ao cookie"`
Status: done

**C60** - `src/lib/banco.ts` não contém `cookies(` (Flow)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "banco sem cookies"`
Status: done

**C61** - Depois da transação que cria o admin, as linhas de `mesa` e de `cor` do projeto que já existia continuam, na mesma contagem (Relations)
Proof: `node --experimental-strip-types --test src/lib/banco.test.ts --test-name-pattern "mesa e cor seguem o projeto"`
Status: done

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `GET /entrar` statuses (2) | 200 C4 · 307 C6 | - |
| `GET /` statuses (2) | 307 C1 · 200 C30 | - |
| `GET /projetos` statuses (2) | 307 C2 · 200 C22 | - |
| `GET /configuracoes` statuses (2) | 307 C3 · 200 C31 | - |
| cookie `sessao` inválido (2) | desconhecido C7 · expirado C7 | - |
| `SENHA_ADMIN` que não cria conta (3) | ausente C10 · vazio C10 · `1234567` C10 | - |
| senha de cadastro no limite (2) | `1234567` C15 · `12345678` C21 | - |
| e-mail (4) | `sem-arroba` C16 · duplicado C14 · `outra@example.com` C13 · `Outra@Example.com` C45 | - |
| papel em `/projetos` (2) | comum C22 · admin C23 | - |
| rotas sem cookie (3) | `/` C1 · `/projetos` C2 · `/configuracoes` C3 | - |
| escrita alheia (2) | impressora C25 · projeto C26 | - |
| impressora `k2-pro` (2) | uma na conta nova C13 · duas contas C28 | - |
| impressora marcada (2) | uma por conta C27 · última da conta C29 | - |
| sessao na redefinição (2) | some a da outra C38 · fica a do admin C38 | - |
| login vazio (2) | e-mail vazio C44 · senha vazia C44 | - |
| atributos do cookie (5) | HttpOnly C46 · SameSite C46 · Path C46 · Secure ausente C46 · Max-Age C46 | - |
| portas (5) | conta C58 · sessao C59 · dono C57 · scrypt C11 · copia C19 | - |
| entidades (7) | conta C9 · impressora C13 · projeto C22 · sessao C12 · impressora_ativa C27 · mesa C61 · cor C61 | - |
| startup `SENHA_ADMIN` (1) | criação da primeira conta C9 | - |

- Status de rota: C1, C2, C3, C4, C6, C22, C30, C31 — cada prova faz o GET e lê o status
- Nenhum outro check afirma mais do que o caso que a prova exercita

## Swept

- validation: C10, C14, C15, C16, C21, C41, C44
- failure modes: C8, C17
- idempotency: C14, C18
- authorization: C22, C23, C25, C26, C32, C40
- concurrency: C18
- data lifecycle: C7, C9, C38, C47
- dependency failure: C8
- state transitions: C6, C7, C38, C47
- observability: C48

## Handoff

- S1 = `page.tsx` 645 + `projetos/page.tsx` 444 + `configuracoes/page.tsx` 471 + `layout.tsx` 954 + `acoes.ts` 1795 = 4309 bytes / 4 = 1077
- S2 = `banco.ts` 23850 + `banco.test.ts` 40405 + `impressora.ts` 2258 + `projetos.ts` 1817 = 68330 / 4 = 17083. S3 não soma arquivo novo
- S4 = `configuracoes-form.tsx` 5964 / 4 = 1491
- S5 = `site-header.tsx` 1160 / 4 = 290
- S6 = `vistas.ts` 4478 + `vistas.test.ts` 14610 + `docs/dados.md` 3968 + `docs/arquitetura.md` 2351 + `AGENTS.md` 2132 + `README.md` 1541 + `docs-banco.test.ts` 1533 = 30613 / 4 = 7653
- Total 1077 + 17083 + 1491 + 290 + 7653 = 27594, abaixo do orçamento de 150k — one builder
- Mechanism: one builder
