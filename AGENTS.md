# Custo por chapa

Precificação de impressão 3D neste navegador. Sem servidor e sem conta. O README descreve o que o app faz; os arquivos em `docs/` descrevem como o código funciona.

## Onde ler

- [docs/custo.md](docs/custo.md) — fórmula, modo peça e modo lote, campo vazio.
- [docs/dados.md](docs/dados.md) — o que fica no `localStorage` e o que um projeto guarda.
- [docs/arquitetura.md](docs/arquitetura.md) — rotas, módulos e onde mudar a interface.

## Ao alterar o código

- Texto da interface em português, no tom do README: concreto, sobre peça, lote, impressora e tarifa.
- A conta pura fica em `src/lib/custo.ts` e em `src/lib/*-store.ts`, sem React e sem `window`. O navegador (`localStorage`, `useSyncExternalStore`) fica em `src/lib/impressora.ts` e `src/lib/projetos.ts`.
- Páginas em `src/app` são server components finos. Interação fica em `src/components`.
- Mudança na conta ou no JSON gravado precisa de teste em `src/lib/*.test.ts`. Esses arquivos estão fora do `tsconfig` e rodam com `node --experimental-strip-types --test src/lib/*.test.ts`.
- Antes de usar uma API do Next, leia o guia em `node_modules/next/dist/docs/`. O bloco abaixo é reescrito pelo `next dev`; deixe-o como está.

## Fora desta versão

Não acrescente, a menos que o pedido seja explícito: login, orçamento em PDF ou texto, refugo, impressão falha, purge, mão de obra por hora e tarifa diferente por projeto.

<!-- BEGIN:nextjs-agent-rules -->


<!-- END:nextjs-agent-rules -->
