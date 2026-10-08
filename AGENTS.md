# Custo por chapa

Precificação de impressão 3D neste computador. Sem conta. O README descreve o que o app faz; os arquivos em `docs/` descrevem como o código funciona.

## Onde ler

- [docs/custo.md](docs/custo.md) — fórmula, modo peça e modo lote, campo vazio.
- [docs/dados.md](docs/dados.md) — o que fica no `localStorage` e o que um projeto guarda.
- [docs/arquitetura.md](docs/arquitetura.md) — rotas, módulos e onde mudar a interface.

## Ao alterar o código

- Texto da interface em português, no tom do README: concreto, sobre peça, lote, impressora e tarifa.
- A conta pura fica em `src/lib/custo.ts` e em `src/lib/*-store.ts`, sem React e sem `window`. `impressora.ts` e `projetos.ts` leem e gravam pelo servidor. `custo.ts`, `impressora-store.ts` e `projetos-store.ts` continuam sem o driver do banco.
- Páginas em `src/app` são server components finos. Interação fica em `src/components`.
- Mudança na conta ou no JSON gravado precisa de teste em `src/lib/*.test.ts`. Esses arquivos estão fora do `tsconfig` e rodam com `node --experimental-strip-types --test src/lib/*.test.ts`.
- Antes de usar uma API do Next, leia o guia em `node_modules/next/dist/docs/`. O bloco abaixo é reescrito pelo `next dev`; deixe-o como está.

## Backlog

Ideias anotadas em [`.specs/BACKLOG.md`](.specs/BACKLOG.md), ainda sem plano. Não implemente um item de lá a menos que o pedido nomeie esse item.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
