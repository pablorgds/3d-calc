# Arquitetura

Next.js 16 (App Router), React 19, Tailwind CSS 4 e componentes no estilo shadcn (`base-nova`, Base UI). Alias `@/*` aponta para `src/*`. O servidor de desenvolvimento escuta em `0.0.0.0:4317`.

## Rotas

| Rota | Página | Cliente |
| --- | --- | --- |
| `/entrar` | `src/app/entrar/page.tsx` | e-mail, senha e link para criar conta |
| `/criar` | `src/app/criar/page.tsx` | e-mail, senha e confirmação de senha |
| `/` | `src/app/page.tsx` | `Calculadora` |
| `/projetos` | `src/app/projetos/page.tsx` | `ListaProjetos` |
| `/configuracoes` | `src/app/configuracoes/page.tsx` | `ConfiguracoesForm` |
| `/usuarios` | `src/app/usuarios/page.tsx` | `ListaUsuarios` |

`/`, `/projetos`, `/configuracoes` e `/usuarios` respondem 307 para `/entrar` sem `sessao` válida. `/usuarios` com papel `comum` responde 307 para `/`.

A calculadora lê `?projeto=` no server component e passa o id adiante. A `key` do componente muda com o id, então abrir outro projeto remonta o formulário. Projetos, Configurações e Usuários só renderizam um `PageIntro` e o cliente.

`src/app/layout.tsx` coloca o `SiteHeader` e o idioma `pt-BR`. A navegação é Calculadora, Projetos, Configurações e, no papel `admin`, Usuários, na mesma linha do e-mail da conta e de Sair. Em `/entrar` e `/criar` essa linha não aparece. Largura máxima `max-w-5xl`. Controles de ação usam altura `h-11`. Usuários inclui conta, grava senha nova e apaga conta. Configurações fica com as máquinas.

`src/components/ui` é primitivo visual. Não coloque regra de precificação ali.

## Módulos

```
src/app          rotas e metadata
src/components   telas com estado
src/lib          conta, parse do JSON e adaptadores do banco
```

`custo.ts` não importa React. `impressora.ts` e `projetos.ts` leem e gravam pelo servidor. `custo.ts`, `impressora-store.ts` e `projetos-store.ts` continuam sem o driver do banco.

Fluxo da calculadora: rascunho na tela → impressora marcada → `draftToCalcInput` → `calculate` → peça e lote. Salvar chama `writeProject` com o rascunho em texto e o `printerId` atual. A lista de projetos refaz `calculate` na hora de mostrar o total do lote.

## Testes

Os testes ficam ao lado do código (`src/lib/*.test.ts`) e usam `node:test`. O `tsconfig.json` os exclui; o runner é o Node com `--experimental-strip-types`, por isso o import interno leva a extensão `.ts`.

```bash
node --experimental-strip-types --test src/lib/*.test.ts
```

Cubra aqui mudança de fórmula, de modo peça/lote, de parse e de migração do JSON. A tela não tem suíte própria; os `data-testid` já marcam salvar, impressora ativa, abrir, duplicar e apagar.

## Interface

Copy em português, sobre o que a pessoa está precificando. Página nova segue `PageIntro`: título, um parágrafo curto, depois o conteúdo. Estado vazio e “lendo este navegador” ficam num `Card`, como em Projetos e Configurações.
