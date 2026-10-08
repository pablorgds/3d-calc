# Custo

A conta mora em `src/lib/custo.ts`. A interface manda um rascunho em texto (`JobDraft`); `draftToCalcInput` junta esse rascunho com a impressora marcada e devolve um `CalcInput`. `calculate` devolve peça e lote, ou `null` quando o número não fecha.

Os valores de entrada da conta já estão na unidade em que o usuário digitou. O modo diz se esse número é de uma peça ou da mesa inteira.

## Fórmula

Para o valor digitado (uma peça no modo peça, a mesa no modo lote):

- Material de uma cor = gramas × (R$/kg ÷ 1000). O material é a soma das cores.
- Cor única: o peso é da peça (ou da mesa, no modo lote) e entra na única cor. Várias cores: cada cor tem o próprio peso.
- Energia = (W ÷ 1000) × (minutos ÷ 60) × R$/kWh.
- Depreciação = (preço da máquina ÷ vida útil em horas) × horas.
- Mão de obra = (material + energia + depreciação) × (percentual ÷ 100).
- Total = material + energia + depreciação + mão de obra.

A mão de obra não entra na própria base. Vida útil `0` zera a depreciação e marca `depreciationBlocked`; o total continua, com depreciação zero. Não existe fallback de 1 hora.

## Modos

**Peça.** Tempo e peso de cada cor são de uma peça. Na calculadora, `draftToCalcInput` força 1 cópia e ignora o campo de cópias guardado no rascunho. Peça e lote ficam iguais.

**Lote.** Tempo e peso são da mesa cheia. Cópias inteiras maiores que zero dividem o lote em cada peça. Cópias `0` mantêm o lote e bloqueiam a peça (`blockedByCopies`, totais `null`).

`calculate` ainda escala o modo peça se receber cópias diferentes de 1. A tela não faz isso: o caminho da calculadora sempre manda 1.

## Campos

`parseDecimal` e `parseInteger` devolvem `empty`, `invalid` ou `ok`. Vazio não vira zero. Negativo é inválido. `1,5` e `1.234,56` são decimais em pt-BR. Cópias são inteiras; `2,5` é inválido.

Se material, energia, depreciação ou mão de obra não fecham, o total daquele lado é `null`. Uma cor com preço ou gramas inválidos anula o material inteiro (`invalid-color`). Nenhuma cor (`no-colors`) deixa o material em zero e o total pode fechar.

Horas e minutos do rascunho viram um único campo de minutos em `combineTime`. Os dois precisam estar preenchidos e válidos.

## O que a lista mostra

Em Projetos, o total exibido é o do lote, recalculado com a tarifa atual da impressora do projeto. O projeto não guarda o total.
