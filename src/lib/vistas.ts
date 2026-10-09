import { combineTime, formatBRL, formatDuration, parseInteger, type EntryMode } from "./custo"
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
  "Cada mesa é uma chapa: um tempo e um filamento. A peça soma as mesas. As cópias multiplicam o produto."
export const FRASE_VARIAS_CORES = "Esta impressão tem várias cores num tempo só. A mesa leva uma cor."
export const AVISO_COPIAS_PRODUTO =
  "Custo do lote bloqueado. Cópias do produto precisa ser um inteiro maior que zero."
export const ROTULO_MAO_DE_OBRA = "Mão de obra (%)"
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
