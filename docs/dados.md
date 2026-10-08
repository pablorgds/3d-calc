# Dados no banco

Impressoras e projetos ficam no Postgres do volume `custo-chapa-pg`. Não há conta. O navegador ainda guarda as chaves `custo-chapa-impressora` e `custo-chapa-projetos`; a primeira leitura copia as duas para o Postgres só enquanto o banco ainda é a semente.

| Chave | Arquivo puro | Adaptador |
| --- | --- | --- |
| `custo-chapa-impressora` | `src/lib/impressora-store.ts` | `src/lib/impressora.ts` |
| `custo-chapa-projetos` | `src/lib/projetos-store.ts` | `src/lib/projetos.ts` |

`impressora.ts` e `projetos.ts` entregam a leitura e a gravação ao processo do app, que persiste no Postgres. A primeira pintura mostra “Lendo impressoras e projetos.” até essa leitura voltar.

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

A calculadora usa a máquina marcada (`activeId`). Dá para acrescentar máquina; ela nasce com os números vazios, nome “Nova impressora”, e passa a ser a marcada. O campo mostra o exemplo em placeholder. Zeros gravados de propósito continuam zero. A última máquina não sai. Remover a marcada passa a marca para a primeira que sobrou.

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
      "colorMode": "unica",
      "grams": "40",
      "colors": [
        { "id": "…", "name": "PLA preto", "hex": "#111111", "price": "90", "grams": "40" }
      ],
      "updatedAt": 10
    }
  ]
}
```

`mode` é `"peca"` ou `"lote"`. `colorMode` é `"unica"` ou `"multicolor"`. Em cor única, `grams` é o peso da peça e a cor não leva peso próprio. Em várias cores, o peso fica em cada cor. O projeto guarda `printerId`, não a tarifa. Abrir `/?projeto=<id>` marca a impressora do projeto. Se essa máquina foi removida, o cálculo usa a marcada agora e a tela avisa. Projeto ausente no banco também avisa; salvar cria um id novo.

A lista ordena por `updatedAt` decrescente e, no empate, pelo nome em pt-BR. Ids repetidos na leitura ficam só com a primeira ocorrência. JSON inválido ou item sem `id` e `mode` some da lista. Duplicar copia o lote, inclusive as cores, com o nome acrescido de “ (cópia)”.
