import { useSyncExternalStore } from "react"
import {
  activatePrinter,
  deletePrinter,
  insertPrinter,
  parsePrinterStore,
  serializePrinterStore,
  serverPrinterStore,
  updatePrinter,
  type Printer,
  type PrinterStore,
} from "./impressora-store"

export const PRINTER_STORAGE_KEY = "custo-chapa-impressora"
export const PRINTER_CHANGE_EVENT = "custo-chapa-impressora"

export type { Printer, PrinterStore }
export { defaultPrinter, DEFAULT_PRINTER_ID } from "./impressora-store"

let cache: PrinterStore = serverPrinterStore
let cacheRaw: string | null = null

export function readPrinterStore(): PrinterStore {
  if (typeof window === "undefined") return serverPrinterStore
  const raw = window.localStorage.getItem(PRINTER_STORAGE_KEY)
  if (raw === cacheRaw) return cache
  cacheRaw = raw
  cache = parsePrinterStore(raw)
  return cache
}

function commit(store: PrinterStore) {
  const raw = serializePrinterStore(store)
  cache = store
  cacheRaw = raw
  window.localStorage.setItem(PRINTER_STORAGE_KEY, raw)
  window.dispatchEvent(new Event(PRINTER_CHANGE_EVENT))
}

export function setActivePrinter(id: string) {
  const current = readPrinterStore()
  const next = activatePrinter(current, id)
  if (next === current) return
  commit(next)
}

export function updatePrinterById(id: string, patch: Partial<Omit<Printer, "id">>) {
  commit(updatePrinter(readPrinterStore(), id, patch))
}

export function addPrinter(id: string) {
  const current = readPrinterStore()
  const next = insertPrinter(current, id)
  if (next === current) return
  commit(next)
}

export function removePrinter(id: string) {
  const current = readPrinterStore()
  const next = deletePrinter(current, id)
  if (next === current) return
  commit(next)
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(PRINTER_CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(PRINTER_CHANGE_EVENT, onStoreChange)
  }
}

function serverPrinterSnapshot(): PrinterStore | null {
  return null
}

export function usePrinterStore(): PrinterStore | null {
  return useSyncExternalStore(subscribe, readPrinterStore, serverPrinterSnapshot)
}
