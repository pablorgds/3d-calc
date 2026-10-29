# Backlog

Ideias anotadas. **Feito** já está no produto. **Aberto** ainda não é plano nem código. O texto de cada ideia fica abaixo do status.

| Item | Status |
| --- | --- |
| Cliente do projeto | feito — nome e telefone no projeto |
| Login | feito — contas e `sessao`, com admin |
| Orçamento em PDF ou texto | feito como texto copiado; PDF de fora |
| Impressão falha | feito como coeficiente na impressora |
| Purge | feito — campo opcional “Purge por troca (g)” só na impressão de várias cores |
| Estoque de filamentos | aberto — R$/kg congelado na cor ou acompanha o cadastro |
| Refugo | aberto — percentual das gramas ou gramas fixas no lote |
| Mão de obra por hora | aberto — substitui o % ou a pessoa escolhe % ou R$/h |
| Tarifa diferente por projeto | aberto — R$/kWh digitado no projeto ou cópia da tarifa da impressora |

## Feito

### Cliente do projeto

Status: feito ([.design/orcamento.md](../.design/orcamento.md), 2026-10-26; AD-009; feature [orcamento](features/orcamento/verification.md) verificada).

O que chegou: `client_name` e `client_phone` no `projeto`. Na calculadora e na lista, o cliente aparece junto do lote. Duplicar copia os dois. Os dois podem ficar vazios. Não há cadastro de clientes solto da lista.

Ideia, como estava anotada:

Guardar, no projeto, quem pediu a peça: nome e telefone. Na calculadora e na lista de projetos, esse cliente aparece junto do lote.

A conta não muda. Peça, lote, energia, depreciação, material e mão de obra continuam como estão. Nome e telefone ficam em texto, do jeito que foram digitados. Os dois podem ficar vazios: um lote sem cliente continua válido.

Quando a ideia foi anotada, o projeto guardava o nome do lote, a impressora, o modo, as cópias, o tempo, a mão de obra e as cores. Não havia cliente. Duplicar copiava o lote, inclusive as cores, e só mudava o nome.

Fora deste item, até alguém pedir: endereço, e-mail, documento, mais de um telefone, e um cadastro de clientes solto da lista de projetos.

Decidido no desenho: nome e telefone ficam no projeto, e duplicar o lote copia os dois.

### Login

Status: feito ([.design/login.md](../.design/login.md); AD-005 e AD-006; feature [login](features/login/verification.md) verificada).

O que chegou: contas separadas e cookie `sessao`. Cada conta tem as próprias impressoras, projetos e configurações. O admin lista os outros e-mails e reseta a senha; não lê impressora, projeto nem configuração de outra conta (AD-006). A ideia falava em um dono só neste computador. O que saiu foram contas separadas, com admin — não só uma trava local de um dono.

A URL fora de casa veio depois. Ver [URL pública](#já-no-produto-fora-destas-seções).

Ideia, como estava anotada:

Quem abre a porta 4317 neste computador é o dono. Não há conta nem sessão: impressoras e projetos são um banco só.

Quando isto chegar, entrar no app exige identificar essa pessoa. Continua um dono neste computador; login não é vários clientes da calculadora.

Fora deste item, até alguém pedir: cadastro aberto na internet, convite de outra pessoa e papéis diferentes do dono.

A decidir quando virar plano: o que a sessão trava — o app inteiro, ou projetos de pessoas diferentes no mesmo banco.

Essa decisão fechou no desenho: a sessão trava a conta. O dono pediu contas separadas em 2026-10-08. Cadastro aberto na internet continua fora; conta nova, na URL pública, só pelo admin.

### Orçamento em PDF ou texto

Status: feito como texto copiado. PDF ficou de fora ([.design/orcamento.md](../.design/orcamento.md), 2026-10-26; feature [orcamento](features/orcamento/verification.md) verificada). O retorno da cópia — rótulo “Copiado”, e o texto na tela se a cópia falha — veio na feature [ux-calculadora](features/ux-calculadora/verification.md).

O que chegou: “Copiar orçamento” na calculadora, quando o total do lote fecha. O projeto não guarda o total. O texto leva a leitura da hora da cópia. A lista continua recalculando com a tarifa atual da impressora. O que o texto leva (nome do lote, cliente, telefone e preço) foi revisto em [.design/coeficiente.md](../.design/coeficiente.md).

Ideia, como estava anotada:

O total da peça e do lote só aparece na tela. O projeto não guarda esse total: a lista recalcula com a tarifa atual da impressora. Quem passa o preço copia os números à mão.

Quando isto chegar, a pessoa tira do projeto um orçamento em PDF ou em texto, com o que a tela já mostra daquele lote.

A conta não muda. O arquivo é uma leitura do total da hora em que foi gerado.

Fora deste item, até alguém pedir: envio por e-mail ou mensagem, e modelo com logo.

Decidido no desenho: o texto leva a tarifa da hora da cópia e não grava o total. PDF fica de fora. Envio por mensagem está em [Pausado](#pausado).

### Impressão falha

Status: feito como coeficiente na impressora ([.design/coeficiente.md](../.design/coeficiente.md); AD-010; feature [coeficiente](features/coeficiente/verification.md) verificada).

O que chegou: o coeficiente é um número na impressora. Vazio vale zero. Só o total em reais muda: a soma fechada dividida por (1 − coeficiente/100). Material, energia, depreciação, mão de obra, minutos e gramas continuam o que foi digitado. O coeficiente não aparece no texto do cliente.

Histórico de falhas e uma taxa média calculada sozinha continuam fora.

Ideia, como estava anotada:

A conta é a do trabalho digitado. Uma impressão que falhou no meio não entra no preço: o tempo e o filamento perdidos ficam de fora.

Fora deste item, até alguém pedir: histórico de falhas e uma taxa média calculada sozinha.

Decidido no desenho: o coeficiente é um número na impressora, vazio vale zero, e só o total em reais muda. O texto do cliente foi revisto no mesmo desenho. Histórico e taxa média continuam fora.

### Purge

Status: feito ([.design/purge.md](../.design/purge.md), 2026-10-29; AD-011; feature [purge](features/purge/verification.md) verificada). Saiu no PR #7, squash `a6d1ff0`, em 2026-10-29.

O que chegou: o campo opcional “Purge por troca (g)” só na impressão de várias cores. Vazio grava e vale zero. Cada troca soma essas gramas no material, pelo preço da cor que entra. Cor única e projeto de mesas não mostram o campo, e a conta não lê o texto. Duplicar copia o campo.

Ideia, como estava anotada:

Numa impressão de várias cores, o material é só as gramas de cada cor. A troca de filamento no meio da peça não acrescenta o purge. Num projeto de mesas, cada mesa é um filamento só e também não troca no meio.

Quando isto chegar, a impressão de várias cores soma as gramas de purge de cada troca. Projeto de mesas continua sem purge, porque a mesa não troca de filamento.

Fora deste item, até alguém pedir: torre de purge com tempo próprio, e purge medido pelo fatiador.

Decidido no desenho: as gramas por troca são um número na calculadora, não um padrão da impressora. O campo é opcional e só aparece na impressão de várias cores.

## Aberto

### Estoque de filamentos

Status: aberto. Ainda não é plano nem código.

A decidir: se o preço no estoque mudar depois, o lote já gravado guarda o R$/kg da hora em que a cor entrou, ou passa a acompanhar o cadastro — do jeito que a tarifa do projeto acompanha a impressora.

Cadastrar os filamentos que estão em casa: cor, preço pago e marca. Na calculadora, ao colocar um desses filamentos numa cor do objeto, o preço já vem preenchido e o total usa esse valor.

A conta não muda de forma. O material de uma cor continua gramas × (R$/kg ÷ 1000), somado às outras cores, mais energia, depreciação e mão de obra. O preço cadastrado entra no campo que a calculadora já chama de R$/kg.

Hoje cada cor do lote leva nome, amostra, R$/kg e gramas digitados na hora. O preço fica gravado na cor do projeto, não num cadastro.

Fora deste item, até alguém pedir: quantidade em estoque, baixa de gramas ao imprimir, e rolo com peso diferente de 1 kg. O preço pago entra como R$/kg.

### Refugo

Status: aberto. Ainda não é plano nem código.

A decidir: o refugo é um percentual sobre as gramas, ou um peso em gramas digitado no lote.

O material é a soma das gramas digitadas. Não há uma parcela a mais pelo filamento que sobra fora da peça.

Quando isto chegar, o lote soma esse refugo ao material. Energia, depreciação e o percentual de mão de obra continuam sobre a base que já existe; a mão de obra passa a ver o material já com o refugo, porque a base dela é material + energia + depreciação.

Fora deste item, até alguém pedir: refugo diferente por cor, e baixa desse peso num estoque.

### Mão de obra por hora

Status: aberto. Ainda não é plano nem código.

A decidir: R$/hora substitui o percentual, ou os dois convivem e a pessoa escolhe qual vale naquele projeto.

A mão de obra é um percentual sobre material + energia + depreciação. Não é um valor por hora vezes o tempo da máquina. O percentual não incide sobre si mesmo.

Quando isto chegar, dá para cobrar a mão de obra em R$ por hora, vezes as horas do trabalho.

Fora deste item, até alguém pedir: hora diferente da hora da máquina, e mais de uma pessoa no mesmo lote.

### Tarifa diferente por projeto

Status: aberto. Ainda não é plano nem código.

A decidir: a tarifa do projeto é um R$/kWh digitado nele, ou uma cópia da tarifa da impressora na hora de gravar, que deixa de acompanhar a máquina.

O projeto guarda a impressora, não o R$/kWh. A lista recalcula o lote com a tarifa atual dessa máquina. Mudar o R$/kWh em Configurações muda o total dos projetos dela, sem gravar o projeto de novo.

Quando isto chegar, um projeto pode usar uma tarifa de energia diferente da que está na impressora.

O restante da máquina — watts, preço e vida útil — continua o da impressora do projeto.

Fora deste item, até alguém pedir: watts, preço da máquina ou vida útil diferentes por projeto.

## Já no produto (fora destas seções)

Não eram títulos deste arquivo. Já saíram no `main`.

- Mesas — [.design/mesas.md](../.design/mesas.md). Feature [mesas](features/mesas/verification.md) verificada. Um projeto é uma impressão ou uma lista de mesas; cada mesa guarda o tempo e um filamento.
- URL pública — [.design/url-publica.md](../.design/url-publica.md), Tailscale Funnel neste PC. Feature [url-publica](features/url-publica/verification.md) verificada. Conta nova só pelo admin em `/usuarios`.
- Coeficiente — a precificação inteira está no item [Impressão falha](#impressão-falha), acima. Desenho e feature já citados lá.
- ux-calculadora — feature [ux-calculadora](features/ux-calculadora/verification.md) verificada. Resultado que acompanha a rolagem, retorno ao copiar o orçamento, nome / cliente / telefone antes da impressora, e o coeficiente que não grava o dígito do meio quando a pessoa digita rápido.

## Pausado

- Envio WhatsApp (Evolution) — pausado pelo dono em 2026-10-28. Copiar o orçamento basta. O desenho ficou na máquina de quem planejou; não está neste repositório e não está na fila. O plano da ux-calculadora citou esse envio como fatia seguinte.
