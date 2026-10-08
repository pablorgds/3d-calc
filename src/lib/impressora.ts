import { useEffect, useSyncExternalStore } from "react"
import {
  adicionarImpressoraNoBanco,
  atualizarImpressoraNoBanco,
  lerDoBanco,
  marcarImpressoraNoBanco,
  removerImpressoraNoBanco,
} from "./acoes"
import { PRINTER_STORAGE_KEY, PROJECTS_STORAGE_KEY } from "./chaves"
import { aplicarResultado, assinarEstado, lerEstado, type Leitura } from "./estado"
import type { Printer, PrinterStore } from "./impressora-store"

export { PRINTER_STORAGE_KEY }
export type { Printer, PrinterStore }
export { defaultPrinter, DEFAULT_PRINTER_ID } from "./impressora-store"

let pedido: Promise<void> | null = null

function carregar() {
  if (pedido || lerEstado().status !== "lendo") return pedido ?? Promise.resolve()
  pedido = lerDoBanco({
    impressora: window.localStorage.getItem(PRINTER_STORAGE_KEY),
    projetos: window.localStorage.getItem(PROJECTS_STORAGE_KEY),
  })
    .then((resultado) => {
      aplicarResultado(resultado)
    })
    .catch(() => {
      aplicarResultado({ status: "erro" })
    })
  return pedido
}

export function useLeitura(): Leitura {
  const leitura = useSyncExternalStore(assinarEstado, lerEstado, lerEstado)
  useEffect(() => {
    if (lerEstado().status === "lendo") void carregar()
  }, [])
  return leitura
}

export function usePrinterStore(): PrinterStore | null {
  const leitura = useLeitura()
  if (leitura.status !== "pronto") return null
  return leitura.printers
}

export function setActivePrinter(id: string) {
  void marcarImpressoraNoBanco(id).then((resultado) => {
    if (resultado.status !== "rejeitado") aplicarResultado(resultado)
  })
}

export function updatePrinterById(id: string, patch: Partial<Omit<Printer, "id">>) {
  void atualizarImpressoraNoBanco(id, patch).then((resultado) => {
    if (resultado.status !== "rejeitado") aplicarResultado(resultado)
  })
}

export function addPrinter(id: string) {
  void adicionarImpressoraNoBanco(id).then((resultado) => {
    if (resultado.status !== "rejeitado") aplicarResultado(resultado)
  })
}

export function removePrinter(id: string) {
  void removerImpressoraNoBanco(id).then((resultado) => {
    if (resultado.status !== "rejeitado") aplicarResultado(resultado)
  })
}
