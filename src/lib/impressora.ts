import { useSyncExternalStore } from "react"

export const PRINTER_STORAGE_KEY = "custo-chapa-impressora"
export const PRINTER_CHANGE_EVENT = "custo-chapa-impressora"

export type PrinterSettings = {
  watts: string
  energyPrice: string
  printerPrice: string
  lifeHours: string
}

export const defaultPrinter: PrinterSettings = {
  watts: "150",
  energyPrice: "1.18",
  printerPrice: "7979",
  lifeHours: "3000",
}

const blankPrinter: PrinterSettings = {
  watts: "0",
  energyPrice: "0",
  printerPrice: "0",
  lifeHours: "0",
}

let cache: PrinterSettings = defaultPrinter
let cacheRaw: string | null = null

function isBlank(settings: PrinterSettings) {
  return (
    settings.watts === blankPrinter.watts &&
    settings.energyPrice === blankPrinter.energyPrice &&
    settings.printerPrice === blankPrinter.printerPrice &&
    settings.lifeHours === blankPrinter.lifeHours
  )
}

function parseSettings(raw: string | null): PrinterSettings {
  if (!raw) return defaultPrinter
  try {
    const parsed = JSON.parse(raw) as Partial<PrinterSettings> & { version?: number }
    const settings = {
      watts: typeof parsed.watts === "string" ? parsed.watts : defaultPrinter.watts,
      energyPrice: typeof parsed.energyPrice === "string" ? parsed.energyPrice : defaultPrinter.energyPrice,
      printerPrice: typeof parsed.printerPrice === "string" ? parsed.printerPrice : defaultPrinter.printerPrice,
      lifeHours: typeof parsed.lifeHours === "string" ? parsed.lifeHours : defaultPrinter.lifeHours,
    }
    if (!parsed.version && isBlank(settings)) return defaultPrinter
    return settings
  } catch {
    return defaultPrinter
  }
}

export function readPrinterSettings(): PrinterSettings {
  if (typeof window === "undefined") return defaultPrinter
  const raw = window.localStorage.getItem(PRINTER_STORAGE_KEY)
  if (raw === cacheRaw) return cache
  cacheRaw = raw
  cache = parseSettings(raw)
  return cache
}

export function writePrinterSettings(settings: PrinterSettings) {
  const raw = JSON.stringify({ ...settings, version: 2 })
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
  return useSyncExternalStore(subscribe, readPrinterSettings, () => defaultPrinter)
}
