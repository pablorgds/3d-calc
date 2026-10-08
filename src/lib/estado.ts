import type { PrinterStore } from "./impressora-store"
import type { Project } from "./projetos-store"

export type Leitura =
  | { status: "lendo" }
  | { status: "erro" }
  | { status: "pronto"; printers: PrinterStore; projects: Project[] }

export type ResultadoBanco =
  | { status: "ok"; printers: PrinterStore; projects: Project[] }
  | { status: "erro" }
  | { status: "rejeitado" }

let leitura: Leitura = { status: "lendo" }
const ouvintes = new Set<() => void>()

export function lerEstado(): Leitura {
  return leitura
}

export function publicarEstado(next: Leitura) {
  leitura = next
  for (const ouvir of ouvintes) ouvir()
}

export function assinarEstado(ouvir: () => void) {
  ouvintes.add(ouvir)
  return () => {
    ouvintes.delete(ouvir)
  }
}

export function aplicarResultado(resultado: ResultadoBanco) {
  if (resultado.status === "ok") {
    publicarEstado({ status: "pronto", printers: resultado.printers, projects: resultado.projects })
  }
  if (resultado.status === "erro") publicarEstado({ status: "erro" })
}
