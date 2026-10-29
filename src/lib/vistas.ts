import { combineTime, formatBRL, formatDuration, formatGrams, parseInteger, type Amount, type CalcResult, type EntryMode } from "./custo"
import type { Project } from "./projetos-store"

export const TEXTO_LENDO = "Lendo impressoras e projetos."
export const TITULO_ERRO = "Não deu para ler o banco."
export const DESCRICAO_CONFIG_LENDO = "As impressoras desta conta ficam no banco deste computador."
export const DESCRICAO_PROJETOS_LENDO = "Os projetos desta conta ficam no banco deste computador."
export const TITULO_VAZIO = "Nenhum projeto salvo"
export const FRASE_GRAVAR = "Gravar o lote deixa o projeto no banco."
export const FRASE_AUSENTE = "Esse projeto não está no banco. Salvar cria um novo."
export const FRASE_GRAVADO = "Gravado no banco. Salvar de novo atualiza este projeto."
export const LEDE_PROJETOS =
  "Lotes gravados no banco: modo, cópias, tempo, mão de obra e cores. A tarifa fica na impressora, então o total acompanha a máquina. Abrir marca a impressora do projeto."
export const LEDE_CONFIG =
  "A K2 Pro já vem preenchida: 150 W, R$ 1,18 por kWh, R$ 7.979 e 3.000 horas. Dá para ter mais de uma máquina; a calculadora usa a marcada. A tarifa fica na impressora, no banco deste computador."
export const LEDE_USUARIOS =
  "Contas desta máquina, fora a sua. Incluir cria o e-mail e a senha. A senha nova vale no próximo entrar. Apagar tira a conta, as impressoras e os projetos dela."

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

export const FRASE_MESAS =
  "Cada mesa: um tempo e um filamento. A peça soma; as cópias multiplicam."
export const FRASE_VARIAS_CORES = "Esta impressão tem várias cores num tempo só. A mesa leva uma cor."
export const AVISO_COPIAS_PRODUTO =
  "Custo do lote bloqueado. Cópias do produto precisa ser um inteiro maior que zero."
export const ROTULO_MAO_DE_OBRA = "Mão de obra (%)"
export const ROTULO_COEFICIENTE = "Coeficiente de erro (%)"
export const LEGENDA_LOTE = "lote, tarifa atual"

export function avisoCopiasProduto(copies: string): string | null {
  const parsed = parseInteger(copies)
  if (parsed.status === "ok" && parsed.value > 0) return null
  return AVISO_COPIAS_PRODUTO
}

export function textoDeTotal(value: number | null) {
  return value === null ? "—" : formatBRL(value)
}

export function fichaCalculadora(temMesas: boolean, mode: EntryMode) {
  if (temMesas) {
    return {
      modos: [] as string[],
      copias: "Cópias do produto",
      peso: null as string | null,
      frase: FRASE_MESAS,
      maoDeObra: ROTULO_MAO_DE_OBRA,
    }
  }
  return {
    modos: ["Uma peça", "O lote inteiro", "Uma cor", "Várias cores"],
    copias: mode === "lote" ? "Cópias na mesa" : null,
    peso: mode === "peca" ? "Peso da peça (g)" : "Peso da mesa (g)",
    frase: null as string | null,
    maoDeObra: ROTULO_MAO_DE_OBRA,
  }
}

export function descricaoProjeto(project: Project) {
  const quantidade = project.mesas?.length ?? 0
  const labor = project.labor.trim() === "" ? "mão de obra vazia" : `mão de obra ${project.labor}%`
  if (quantidade > 0) {
    const mesas = quantidade === 1 ? "1 mesa" : `${quantidade} mesas`
    return { linha: `${mesas} · ${project.copies} cópias do produto · ${labor}`, legenda: LEGENDA_LOTE }
  }
  const minutes = combineTime(project.hours, project.minutes)
  const time = minutes.status === "ok" ? formatDuration(minutes.value) : "tempo incompleto"
  const scope = project.mode === "peca" ? "peça" : "lote"
  const mode = project.mode === "peca" ? "Peça única" : `Lote · ${project.copies} cópias`
  const colors =
    project.colors.length === 0 ? "sem cores" : project.colors.length === 1 ? "1 cor" : `${project.colors.length} cores`
  return { linha: `${mode} · ${time} no ${scope} · ${labor} · ${colors}`, legenda: LEGENDA_LOTE }
}

export function frasesCalculadora(situacao: "ausente" | "gravado" | "novo") {
  return {
    gravar: FRASE_GRAVAR,
    ausente: situacao === "ausente" ? FRASE_AUSENTE : null,
    descricao: situacao === "gravado" ? FRASE_GRAVADO : "Ainda não está na lista de Projetos.",
  }
}

export const ROTULO_CLIENTE = "Cliente"
export const ROTULO_TELEFONE = "Telefone"
export const ROTULO_COPIAR = "Copiar orçamento"
export const ROTULO_COPIADO = "Copiado"
export const MS_ROTULO_COPIADO = 3000

export function rotuloCopiar(copiou: boolean) {
  return copiou ? ROTULO_COPIADO : ROTULO_COPIAR
}

export function mascaraTelefone(valor: string, anterior = "") {
  const digitos = valor.replace(/\D/g, "").slice(0, 11)
  const anteriores = anterior.replace(/\D/g, "").slice(0, 11)
  const usados = valor.length < anterior.length && digitos === anteriores ? digitos.slice(0, -1) : digitos
  if (usados.length === 0) return ""
  if (usados.length <= 2) return `(${usados}`
  if (usados.length <= 7) return `(${usados.slice(0, 2)}) ${usados.slice(2)}`
  return `(${usados.slice(0, 2)}) ${usados.slice(2, 7)}-${usados.slice(7)}`
}
export const AVISO_IMPRESSORA_REMOVIDA =
  "A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora."

export function linhaCliente(project: Pick<Project, "clientName" | "clientPhone">) {
  const nome = project.clientName.trim()
  const telefone = project.clientPhone.trim()
  if (!nome && !telefone) return null
  return [nome, telefone].filter((parte) => parte !== "").join(" · ")
}

export function podeCopiarOrcamento(total: Amount) {
  return total !== null
}

export function textoAposCopia(falhou: boolean, texto: string) {
  return falhou ? texto : null
}

export function linhaImpressora(printer: { name: string; watts: string; energyPrice: string; printerPrice: string; lifeHours: string }) {
  return `${printer.name.trim() || "Sem nome"}: ${printer.watts} W, ${printer.energyPrice} R$/kWh, impressora ${printer.printerPrice}, ${printer.lifeHours} h.`
}

export function notasResultado(result: CalcResult, mode: EntryMode): string[] {
  const notes: string[] = []
  if (result.materialIssue === "no-colors") {
    notes.push("Sem cores. Material R$ 0,00.")
  }
  if (result.materialIssue === "invalid-color") {
    notes.push("Há cor com preço ou peso vazio ou inválido. O material sai do total até corrigir.")
  }
  if (result.lifeIssue === "zero") {
    notes.push(
      "Depreciação fora da conta: a vida útil em Configurações está em 0. Ela não vira 1 hora. O valor usado é R$ 0,00."
    )
  }
  if (result.lifeIssue === "empty") {
    notes.push("Depreciação fora da conta: preencha a vida útil em Configurações. Campo vazio não vira 1.")
  }
  if (result.lifeIssue === "invalid") {
    notes.push("Vida útil inválida em Configurações. Use um número de horas maior que zero.")
  }
  if (result.timeIssue === "empty") {
    notes.push("Tempo vazio. Energia e depreciação ficam sem cálculo.")
  }
  if (result.timeIssue === "invalid") {
    notes.push("Tempo inválido. Use zero ou um número positivo.")
  }
  if (result.energyIssue === "empty") {
    notes.push("Potência ou preço do kWh está vazio em Configurações. A energia não foi calculada.")
  }
  if (result.energyIssue === "invalid") {
    notes.push("Potência ou preço do kWh inválido em Configurações.")
  }
  if (result.printerPriceIssue !== "none" && result.timeIssue === "none" && result.lifeIssue === "none") {
    notes.push("Preço da impressora vazio ou inválido em Configurações. A depreciação não foi calculada.")
  }
  if (result.laborIssue === "empty") {
    notes.push("Percentual de mão de obra vazio. O acréscimo não foi aplicado.")
  }
  if (result.laborIssue === "invalid") {
    notes.push("Percentual de mão de obra inválido.")
  }
  if (!result.mesas && mode === "lote" && result.piece.blockedByCopies) {
    notes.push("Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero.")
  }
  if (!result.mesas && mode === "peca" && result.lot.blockedByCopies) {
    notes.push("Custo do lote bloqueado. Informe as cópias com um inteiro a partir de zero.")
  }
  if (!result.mesas && mode === "peca") {
    notes.push("Peça única: o lote é esta peça.")
  }
  return notes
}

function valorLado(value: Amount, kind: "money" | "time" | "grams") {
  if (value === null) return null
  if (kind === "money") return formatBRL(value)
  if (kind === "time") return formatDuration(value)
  return formatGrams(value)
}

function linhaRotulo(rotulo: string, corpo: string) {
  return `*${rotulo}: ${corpo}*`
}

function linhaResumo(rotulo: string, money: Amount, minutes: Amount) {
  const valor = valorLado(money, "money")
  const tempo = valorLado(minutes, "time")
  const corpo = [valor, tempo].filter((parte): parte is string => parte !== null).join(" · ")
  if (!corpo) return ""
  return linhaRotulo(rotulo, corpo)
}

function juntarBlocos(blocos: string[][]) {
  return blocos
    .map((linhas) => linhas.filter((linha) => linha !== "").join("\n"))
    .filter((bloco) => bloco !== "")
    .join("\n\n")
}

export function textoOrcamento(input: {
  lote: string
  clientName: string
  clientPhone: string
  printer: { name: string; watts: string; energyPrice: string; printerPrice: string; lifeHours: string }
  impressoraRemovida: boolean
  mode: EntryMode
  result: CalcResult
}) {
  const peca = input.result.piece
  const lote = input.result.lot
  const cliente = input.clientName.trim()
  const telefone = input.clientPhone.trim()
  const dinheiroIgual = valorLado(peca.total, "money") !== null && valorLado(peca.total, "money") === valorLado(lote.total, "money")
  const tempoIgual = valorLado(peca.minutes, "time") === valorLado(lote.minutes, "time")
  const totais =
    dinheiroIgual && tempoIgual
      ? [linhaResumo("Total", lote.total, lote.minutes)]
      : [peca.total === null ? "" : linhaResumo("Por peça", peca.total, peca.minutes), linhaResumo("Lote", lote.total, lote.minutes)]
  return juntarBlocos([
    [
      `*${input.lote.trim() || "Sem nome"}*`,
      cliente ? linhaRotulo("Cliente", cliente) : "",
      telefone ? linhaRotulo("Telefone", telefone) : "",
    ],
    totais,
  ])
}
