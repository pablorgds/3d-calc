import { useSyncExternalStore } from "react"

export const PRINTER_STORAGE_KEY = "custo-chapa-impressora"
export const PRINTER_CHANGE_EVENT = "custo-chapa-impressora"

export type PrinterSettings = {
  watts: string
  energyPrice: string
  printerPrice: string
  lifeHours: string
}

export const emptyPrinter: PrinterSettings = {
  watts: "0",
  energyPrice: "0",
  printerPrice: "0",
  lifeHours: "0",
}

let cache: PrinterSettings = emptyPrinter
let cacheRaw: string | null = null

function parseSettings(raw: string | null): PrinterSettings {
  if (!raw) return emptyPrinter
  try {
    const parsed = JSON.parse(raw) as Partial<PrinterSettings>
    return {
      watts: typeof parsed.watts === "string" ? parsed.watts : "0",
      energyPrice: typeof parsed.energyPrice === "string" ? parsed.energyPrice : "0",
      printerPrice: typeof parsed.printerPrice === "string" ? parsed.printerPrice : "0",
      lifeHours: typeof parsed.lifeHours === "string" ? parsed.lifeHours : "0",
    }
  } catch {
    return emptyPrinter
  }
}

export function readPrinterSettings(): PrinterSettings {
  if (typeof window === "undefined") return emptyPrinter
  const raw = window.localStorage.getItem(PRINTER_STORAGE_KEY)
  if (raw === cacheRaw) return cache
  cacheRaw = raw
  cache = parseSettings(raw)
  return cache
}

export function writePrinterSettings(settings: PrinterSettings) {
  const raw = JSON.stringify(settings)
  cache = settings
  cacheRaw = raw
  window.localStorage.setItem(PRINTER_STORAGE_KEY, raw)
  window.dispatchEvent(new Event(PRINTER_CHANGE_EVENT))
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(PRINTER_CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(PRINTER_CHANGE_EVENT, onStoreChange)
  }
}

export function usePrinterSettings(): PrinterSettings {
  return useSyncExternalStore(subscribe, readPrinterSettings, () => emptyPrinter)
}
