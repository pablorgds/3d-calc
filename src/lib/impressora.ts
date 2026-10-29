import { useEffect, useSyncExternalStore } from "react"
import {
  adicionarImpressoraNoBanco,
  atualizarImpressoraNoBanco,
  lerDoBanco,
  marcarImpressoraNoBanco,
  removerImpressoraNoBanco,
} from "./acoes"
import { PRINTER_STORAGE_KEY, PROJECTS_STORAGE_KEY } from "./chaves"
import { aplicarResultado, assinarEstado, lerEstado, publicarEstado, type Leitura, type ResultadoBanco } from "./estado"
import {
  activatePrinter,
  criarOrdemDeAtualizacao,
  criarRevisaoDeGravacao,
  deletePrinter,
  insertPrinter,
  updatePrinter,
  type Printer,
  type PrinterStore,
} from "./impressora-store"

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

const ordemAtualizacao = criarOrdemDeAtualizacao()
const revisao = criarRevisaoDeGravacao()
let fila: Promise<void> = Promise.resolve()
let pendente: { id: string; patch: Partial<Omit<Printer, "id">> } | null = null

function comStore(next: (store: PrinterStore) => PrinterStore) {
  const vista = revisao.tocar()
  const atual = lerEstado()
  if (atual.status === "pronto") {
    publicarEstado({ status: "pronto", printers: next(atual.printers), projects: atual.projects })
  }
  return vista
}

function enfileirar(vista: number, pedido: () => Promise<ResultadoBanco>) {
  fila = fila.then(async () => {
    try {
      const resultado = await pedido()
      if (resultado.status === "erro" || revisao.aceitar(vista)) aplicarResultado(resultado)
    } catch {
      if (revisao.aceitar(vista)) aplicarResultado({ status: "erro" })
    }
  })
}

function enfileirarGravacao(id: string, patch: Partial<Omit<Printer, "id">>, vista: number) {
  const ticket = ordemAtualizacao.marcar(id)
  enfileirar(vista, async () => {
    const resultado = await atualizarImpressoraNoBanco(id, patch)
    if (resultado.status === "erro") return resultado
    if (!ordemAtualizacao.aceitar(id, ticket)) return { status: "rejeitado" }
    return resultado
  })
}

export function editarImpressoraNaHora(id: string, patch: Partial<Omit<Printer, "id">>) {
  comStore((store) => updatePrinter(store, id, patch))
  if (pendente && pendente.id !== id) gravarImpressoraPendente()
  pendente = {
    id,
    patch: { ...(pendente?.id === id ? pendente.patch : {}), ...patch },
  }
}

export function gravarImpressoraPendente() {
  if (!pendente) return
  const { id, patch } = pendente
  pendente = null
  enfileirarGravacao(id, patch, revisao.atual())
}

export function setActivePrinter(id: string) {
  gravarImpressoraPendente()
  const vista = comStore((store) => activatePrinter(store, id))
  enfileirar(vista, () => marcarImpressoraNoBanco(id))
}

export function updatePrinterById(id: string, patch: Partial<Omit<Printer, "id">>) {
  gravarImpressoraPendente()
  const vista = comStore((store) => updatePrinter(store, id, patch))
  enfileirarGravacao(id, patch, vista)
}

export function addPrinter(id: string) {
  gravarImpressoraPendente()
  const vista = comStore((store) => insertPrinter(store, id))
  enfileirar(vista, () => adicionarImpressoraNoBanco(id))
}

export function removePrinter(id: string) {
  gravarImpressoraPendente()
  const vista = comStore((store) => deletePrinter(store, id))
  enfileirar(vista, () => removerImpressoraNoBanco(id))
}
