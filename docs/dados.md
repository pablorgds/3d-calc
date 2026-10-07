# Dados neste navegador

Não há API nem banco. Dois registros no `localStorage`, cada um com uma função pura de parse e serialize e um adaptador que grava e avisa a tela.

| Chave | Arquivo puro | Adaptador |
| --- | --- | --- |
| `custo-chapa-impressora` | `src/lib/impressora-store.ts` | `src/lib/impressora.ts` |
| `custo-chapa-projetos` | `src/lib/projetos-store.ts` | `src/lib/projetos.ts` |

O adaptador compara o texto cru com um cache, grava com `JSON.stringify` e dispara um `Event` no `window` com o mesmo nome da chave. `useSyncExternalStore` escuta esse evento e também `storage`. No servidor o snapshot é `null`, então a primeira pintura do cliente mostra “Lendo este navegador” em vez de divergir da hidratação.

Números de impressora e de projeto ficam em string, do jeito que foram digitados. A conta só acontece na leitura.

## Impressoras

Versão atual do JSON: `3`.

```json
{
  "version": 3,
  "activeId": "k2-pro",
  "printers": [
    {
      "id": "k2-pro",
      "name": "K2 Pro",
      "watts": "150",
      "energyPrice": "1.18",
      "printerPrice": "7979",
      "lifeHours": "3000"
    }
  ]
}
```

Sem gravação, a máquina é essa K2 Pro. Um objeto antigo de uma impressora só (sem lista `printers`) vira a K2 Pro e conserva watts, tarifa, preço e vida útil. Zeros sem `version` são descartados e voltam à K2 Pro preenchida. JSON inválido também volta ao padrão.

A calculadora usa a máquina marcada (`activeId`). Dá para acrescentar máquina; ela nasce com zeros, nome “Nova impressora”, e passa a ser a marcada. A última máquina não sai. Remover a marcada passa a marca para a primeira que sobrou.

## Projetos

Versão atual do JSON: `1`.

```json
{
  "version": 1,
  "projects": [
    {
      "id": "…",
      "name": "Suporte",
      "printerId": "k2-pro",
      "mode": "lote",
      "copies": "4",
      "hours": "2",
      "minutes": "15",
      "labor": "30",
      "colors": [
        { "id": "…", "name": "PLA preto", "hex": "#111111", "price": "90", "grams": "40" }
      ],
      "updatedAt": 10
    }
  ]
}
```

`mode` é `"peca"` ou `"lote"`. O projeto guarda `printerId`, não a tarifa. Abrir `/?projeto=<id>` marca a impressora do projeto. Se essa máquina foi removida, o cálculo usa a marcada agora e a tela avisa. Projeto ausente nesse navegador também avisa; salvar cria um id novo.

A lista ordena por `updatedAt` decrescente e, no empate, pelo nome em pt-BR. Ids repetidos na leitura ficam só com a primeira ocorrência. JSON inválido ou item sem `id` e `mode` some da lista. Duplicar copia o lote, inclusive as cores, com o nome acrescido de “ (cópia)”.
