export const TEXTO_LENDO = "Lendo impressoras e projetos."
export const TITULO_ERRO = "Não deu para ler o banco."
export const DESCRICAO_CONFIG_LENDO = "As impressoras ficam no banco deste computador, sem conta."
export const DESCRICAO_PROJETOS_LENDO = "Os projetos ficam no banco deste computador, sem conta."
export const TITULO_VAZIO = "Nenhum projeto salvo"
export const FRASE_GRAVAR = "Gravar o lote deixa o projeto no banco."
export const FRASE_AUSENTE = "Esse projeto não está no banco. Salvar cria um novo."
export const FRASE_GRAVADO = "Gravado no banco. Salvar de novo atualiza este projeto."
export const LEDE_PROJETOS =
  "Lotes gravados no banco: modo, cópias, tempo, mão de obra e cores. A tarifa fica na impressora, então o total acompanha a máquina. Abrir marca a impressora do projeto."
export const LEDE_CONFIG =
  "A K2 Pro já vem preenchida: 150 W, R$ 1,18 por kWh, R$ 7.979 e 3.000 horas. Dá para ter mais de uma máquina; a calculadora usa a marcada. A tarifa fica na impressora, no banco deste computador."

export type TelaBanco = "calculadora" | "projetos" | "configuracoes"

export function vistaCarregamento(tela: TelaBanco, status: "lendo" | "erro") {
  if (status === "erro") {
    return {
      tipo: "erro" as const,
      titulo: TITULO_ERRO,
      descricao: null as string | null,
      mostraVazio: false,
      mostraFormulario: false,
    }
  }
  const descricao =
    tela === "projetos" ? DESCRICAO_PROJETOS_LENDO : tela === "configuracoes" ? DESCRICAO_CONFIG_LENDO : null
  return {
    tipo: "lendo" as const,
    titulo: TEXTO_LENDO,
    descricao,
    mostraVazio: false,
    mostraFormulario: false,
  }
}

export function frasesCalculadora(situacao: "ausente" | "gravado" | "novo") {
  return {
    gravar: FRASE_GRAVAR,
    ausente: situacao === "ausente" ? FRASE_AUSENTE : null,
    descricao: situacao === "gravado" ? FRASE_GRAVADO : "Ainda não está na lista de Projetos.",
  }
}
