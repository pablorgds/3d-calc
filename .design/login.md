# Login

> Planeje a partir deste documento. Cada fatia abaixo carrega a própria forma — copie, não redesenhe.
> Status: o dono decidiu contas separadas em 2026-10-08; em 2026-10-08 decidiu que o admin não vê os dados das outras contas

## Situation

- Project: em uso
- Decision: decidido pelo dono, 2026-10-08, neste documento — fazer o login antes de uma URL acessível de qualquer lugar
- In flight: um banco só e nenhuma sessão, então quem abre o app edita toda impressora e todo projeto. Uma URL fixa nesta máquina fica de fora até a pessoa entrar e uma conta não ver os dados de outra. Estoque de filamentos, o cliente do projeto e os outros itens do backlog ficam de fora.
- At stake: mão única

## Problem

Quem abre o app nesta máquina é o dono de toda impressora e de todo projeto. O dono pediu em 2026-10-08 para fazer o login agora e deixar a URL para depois: a pessoa cria um e-mail e uma senha no primeiro acesso, e cada conta tem os próprios projetos, impressoras e configurações. Sem isto, a URL continua impossível, porque quem tivesse o endereço editaria os dados de todo mundo. Quantas pessoas vão entrar não foi medido; o dono disse que, por enquanto, só gente conhecida abriria. O backlog tinha deixado uma segunda pessoa de fora até alguém pedir. O dono pediu.

## Success

- Worked if: duas pessoas nesta máquina veem só as próprias impressoras, projetos e configurações
- Going wrong: uma pessoa abre ou edita a impressora ou o projeto da outra
- Review: o dono, quando a segunda conta for criada

## Boundary

In: contas separadas. A primeira conta é `pablorgds@gmail.com`, criada com o app, e fica com as impressoras e os projetos já gravados. A senha inicial dessa conta é definida fora deste documento. Qualquer outra pessoa que abre o app cria o próprio e-mail e a própria senha; essa conta nasce com a K2 Pro padrão e zero projetos. A primeira conta é o admin: reseta a senha de qualquer outra conta. As outras contas não resetam senha de ninguém. A calculadora, a lista de projetos e as configurações pedem a conta antes de abrir, inclusive nesta máquina.

Out: uma URL fixa acessível fora de casa — depois deste login. Reabrir isso quando a pessoa entrar antes de qualquer página da calculadora, e uma conta não puder ler nem editar impressoras, projetos ou configurações de outra. Outros papéis além do admin e da conta comum. Envio de e-mail para recuperar senha. Publicar o banco no host — a credencial é a de desenvolvimento.

Unchanged: `/`, `/projetos`, `/configuracoes`, peça, lote, mesas, a fórmula do custo, números digitados em texto, a porta 4317 nesta máquina, o volume do Postgres, e o banco sem porta publicada no host.

## Sources

- `.specs/STATE.md` — um banco e nenhuma sessão; o banco continua sem porta publicada no host
- `.specs/BACKLOG.md` — o login era um dono só neste computador, com cadastro aberto, convite e outros papéis deixados de fora até alguém pedir. O dono pediu contas separadas e um admin que reseta senha em 2026-10-08
- `.specs/features/ambiente-banco/plan.md` — impressoras e projetos já ficam no Postgres nesta máquina
