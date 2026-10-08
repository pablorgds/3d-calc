# Arquitetura

Next.js 16 (App Router), React 19, Tailwind CSS 4 e componentes no estilo shadcn (`base-nova`, Base UI). Alias `@/*` aponta para `src/*`. O servidor de desenvolvimento escuta em `0.0.0.0:4317`.

## Rotas

| Rota | Página | Cliente |
| --- | --- | --- |
| `/entrar` | `src/app/entrar/page.tsx` | formulário de e-mail e senha |
| `/` | `src/app/page.tsx` | `Calculadora` |
| `/projetos` | `src/app/projetos/page.tsx` | `ListaProjetos` |
| `/configuracoes` | `src/app/configuracoes/page.tsx` | `ConfiguracoesForm` |

`/`, `/projetos` e `/configuracoes` respondem 307 para `/entrar` sem `sessao` válida.

A calculadora lê `?projeto=` no server component e passa o id adiante. A `key` do componente muda com o id, então abrir outro projeto remonta o formulário. Projetos e Configurações só renderizam um `PageIntro` e o cliente.

`src/app/layout.tsx` coloca o `SiteHeader` e o idioma `pt-BR`. A navegação é Calculadora, Projetos, Configurações. Largura máxima `max-w-5xl`. Controles de ação usam altura `h-11`.

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
