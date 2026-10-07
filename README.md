# Custo por chapa

App de precificação de impressão 3D. A calculadora estima o custo de um objeto com várias cores de filamento, por peça e por lote. Projetos e impressoras ficam neste navegador.

## Como rodar

Requer Node.js 20.9 ou mais recente.

```bash
npm install
npm run dev
```

O servidor de desenvolvimento sobe em [http://127.0.0.1:4317](http://127.0.0.1:4317), escutando em `0.0.0.0`.

Os testes do motor, dos rascunhos e do que fica gravado:

```bash
node --experimental-strip-types --test src/lib/*.test.ts
```

## O que existe hoje

- **Calculadora** (`/`) — peça única ou lote, várias cores no mesmo objeto, mão de obra em percentual. Cópias na mesa só existem no lote. Energia e depreciação vêm da impressora marcada. Dá para gravar o lote com nome.
- **Projetos** (`/projetos`) — lotes gravados neste navegador. Abrir, duplicar e apagar. O total usa a tarifa atual da impressora do projeto.
- **Configurações** (`/configuracoes`) — K2 Pro já preenchida (150 W, R$ 1,18/kWh, R$ 7.979, 3.000 h). Dá para acrescentar máquina e marcar qual está em uso. O R$/kWh fica na impressora.

## Fora desta versão

Login, orçamento em PDF ou texto, refugo, impressão falha, purge, mão de obra por hora e tarifa diferente por projeto.
