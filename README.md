# Custo por chapa

App de precificação de impressão 3D. A calculadora estima o custo de um objeto com várias cores de filamento, por peça e por lote. Projetos e o cadastro de impressoras ainda não existem.

## Como rodar

Requer Node.js 20.9 ou mais recente.

```bash
npm install
npm run dev
```

O servidor de desenvolvimento sobe em [http://127.0.0.1:4317](http://127.0.0.1:4317), escutando em `0.0.0.0`.

Os testes do motor de custo:

```bash
node --experimental-strip-types --test src/lib/custo.test.ts
```

## O que existe hoje

- **Calculadora** (`/`) — peça única ou lote, várias cores no mesmo objeto, mão de obra. Cópias na mesa só existem no lote. Energia e depreciação vêm de Configurações. Tudo começa em zero.
- **Projetos** (`/projetos`) — lista vazia.
- **Configurações** (`/configuracoes`) — K2 Pro já preenchida (150 W, R$ 1,18/kWh, R$ 7.979, 3.000 h). O que mudar fica neste navegador.

## Fora desta versão

Banco de projetos e troca de impressora.
