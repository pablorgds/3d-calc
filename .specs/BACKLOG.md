# Backlog

Ideias anotadas. Ainda não são plano nem código.

## Estoque de filamentos

Cadastrar os filamentos que estão em casa: cor, preço pago e marca. Na calculadora, ao colocar um desses filamentos numa cor do objeto, o preço já vem preenchido e o total usa esse valor.

A conta não muda de forma. O material de uma cor continua gramas × (R$/kg ÷ 1000), somado às outras cores, mais energia, depreciação e mão de obra. O preço cadastrado entra no campo que a calculadora já chama de R$/kg.

Hoje cada cor do lote leva nome, amostra, R$/kg e gramas digitados na hora. O preço fica gravado na cor do projeto, não num cadastro.

Fora deste item, até alguém pedir: quantidade em estoque, baixa de gramas ao imprimir, e rolo com peso diferente de 1 kg. O preço pago entra como R$/kg.

A decidir quando virar plano: se o preço no estoque mudar depois, o lote já gravado guarda o R$/kg da hora em que a cor entrou, ou passa a acompanhar o cadastro — do jeito que a tarifa do projeto acompanha a impressora.

## Cliente do projeto

Guardar, no projeto, quem pediu a peça: nome e telefone. Na calculadora e na lista de projetos, esse cliente aparece junto do lote.

A conta não muda. Peça, lote, energia, depreciação, material e mão de obra continuam como estão. Nome e telefone ficam em texto, do jeito que foram digitados. Os dois podem ficar vazios: um lote sem cliente continua válido.

Hoje o projeto guarda o nome do lote, a impressora, o modo, as cópias, o tempo, a mão de obra e as cores. Não há cliente. Duplicar copia o lote, inclusive as cores, e só muda o nome.

Fora deste item, até alguém pedir: endereço, e-mail, documento, mais de um telefone, e um cadastro de clientes solto da lista de projetos.

A decidir quando virar plano: o cliente é um cadastro próprio que vários projetos apontam, ou nome e telefone ficam gravados no próprio projeto — e, nesse segundo caso, duplicar o lote copia os dois campos.

## Login

Quem abre a porta 4317 neste computador é o dono. Não há conta nem sessão: impressoras e projetos são um banco só.

Quando isto chegar, entrar no app exige identificar essa pessoa. Continua um dono neste computador; login não é vários clientes da calculadora.

Fora deste item, até alguém pedir: cadastro aberto na internet, convite de outra pessoa e papéis diferentes do dono.

A decidir quando virar plano: o que a sessão trava — o app inteiro, ou projetos de pessoas diferentes no mesmo banco.

## Orçamento em PDF ou texto

O total da peça e do lote só aparece na tela. O projeto não guarda esse total: a lista recalcula com a tarifa atual da impressora. Quem passa o preço copia os números à mão.

Quando isto chegar, a pessoa tira do projeto um orçamento em PDF ou em texto, com o que a tela já mostra daquele lote.

A conta não muda. O arquivo é uma leitura do total da hora em que foi gerado.

Fora deste item, até alguém pedir: envio por e-mail ou mensagem, e modelo com logo.

A decidir quando virar plano: o arquivo leva a tarifa daquele instante, ou nasce de novo cada vez que a tarifa da impressora mudar.

## Refugo

O material é a soma das gramas digitadas. Não há uma parcela a mais pelo filamento que sobra fora da peça.

Quando isto chegar, o lote soma esse refugo ao material. Energia, depreciação e o percentual de mão de obra continuam sobre a base que já existe; a mão de obra passa a ver o material já com o refugo, porque a base dela é material + energia + depreciação.

Fora deste item, até alguém pedir: refugo diferente por cor, e baixa desse peso num estoque.

A decidir quando virar plano: o refugo é um percentual sobre as gramas, ou um peso em gramas digitado no lote.

## Impressão falha

A conta é a do trabalho digitado. Uma impressão que falhou no meio não entra no preço: o tempo e o filamento perdidos ficam de fora.

Quando isto chegar, o lote pode somar essa falha — o tempo e as gramas que a máquina gastou sem entregar a peça.

Fora deste item, até alguém pedir: histórico de falhas e uma taxa média calculada sozinha.

A decidir quando virar plano: a falha é um acréscimo neste lote, ou um percentual fixo da impressora, aplicado em todo projeto dela.

## Purge

Numa impressão de várias cores, o material é só as gramas de cada cor. A troca de filamento no meio da peça não acrescenta o purge. Num projeto de mesas, cada mesa é um filamento só e também não troca no meio.

Quando isto chegar, a impressão de várias cores soma as gramas de purge de cada troca. Projeto de mesas continua sem purge, porque a mesa não troca de filamento.

Fora deste item, até alguém pedir: torre de purge com tempo próprio, e purge medido pelo fatiador.

A decidir quando virar plano: as gramas de purge são um número por troca, digitado na calculadora, ou um número da impressora, repetido em cada troca.

## Mão de obra por hora

A mão de obra é um percentual sobre material + energia + depreciação. Não é um valor por hora vezes o tempo da máquina. O percentual não incide sobre si mesmo.

Quando isto chegar, dá para cobrar a mão de obra em R$ por hora, vezes as horas do trabalho.

Fora deste item, até alguém pedir: hora diferente da hora da máquina, e mais de uma pessoa no mesmo lote.

A decidir quando virar plano: R$/hora substitui o percentual, ou os dois convivem e a pessoa escolhe qual vale naquele projeto.

## Tarifa diferente por projeto

O projeto guarda a impressora, não o R$/kWh. A lista recalcula o lote com a tarifa atual dessa máquina. Mudar o R$/kWh em Configurações muda o total dos projetos dela, sem gravar o projeto de novo.

Quando isto chegar, um projeto pode usar uma tarifa de energia diferente da que está na impressora.

O restante da máquina — watts, preço e vida útil — continua o da impressora do projeto.

Fora deste item, até alguém pedir: watts, preço da máquina ou vida útil diferentes por projeto.

A decidir quando virar plano: a tarifa do projeto é um R$/kWh digitado nele, ou uma cópia da tarifa da impressora na hora de gravar, que deixa de acompanhar a máquina.
