export const DEFAULT_PRINTER_ID = "k2-pro"

export type Printer = {
  id: string
  name: string
  watts: string
  energyPrice: string
  printerPrice: string
  lifeHours: string
}

export type PrinterStore = {
  activeId: string
  printers: Printer[]
}

export const defaultPrinter: Printer = {
  id: DEFAULT_PRINTER_ID,
  name: "K2 Pro",
  watts: "150",
  energyPrice: "1.18",
  printerPrice: "7979",
  lifeHours: "3000",
}

const blankNumbers = {
  watts: "0",
  energyPrice: "0",
  printerPrice: "0",
  lifeHours: "0",
}

export const serverPrinterStore: PrinterStore = {
  activeId: DEFAULT_PRINTER_ID,
  printers: [defaultPrinter],
}

function isBlankNumbers(printer: Pick<Printer, "watts" | "energyPrice" | "printerPrice" | "lifeHours">) {
  return (
    printer.watts === blankNumbers.watts &&
    printer.energyPrice === blankNumbers.energyPrice &&
    printer.printerPrice === blankNumbers.printerPrice &&
    printer.lifeHours === blankNumbers.lifeHours
  )
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback
}

function parsePrinter(value: unknown, fallbackId: string): Printer | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  const id = asString(record.id, fallbackId).trim()
  if (!id) return null
  return {
    id,
    name: asString(record.name, "K2 Pro"),
    watts: asString(record.watts, defaultPrinter.watts),
    energyPrice: asString(record.energyPrice, defaultPrinter.energyPrice),
    printerPrice: asString(record.printerPrice, defaultPrinter.printerPrice),
    lifeHours: asString(record.lifeHours, defaultPrinter.lifeHours),
  }
}

function uniquePrinters(printers: Printer[]): Printer[] {
  const seen = new Set<string>()
  return printers.filter((printer) => {
    if (seen.has(printer.id)) return false
    seen.add(printer.id)
    return true
  })
}

export function parsePrinterStore(raw: string | null): PrinterStore {
  if (!raw) return serverPrinterStore
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (Array.isArray(parsed.printers)) {
      const printers = uniquePrinters(
        parsed.printers
          .map((printer) => parsePrinter(printer, ""))
          .filter((printer): printer is Printer => printer !== null)
      )
      if (printers.length === 0) return serverPrinterStore
      const requested = asString(parsed.activeId, "")
      const activeId = printers.some((printer) => printer.id === requested) ? requested : printers[0].id
      return { activeId, printers }
    }

    const legacy = parsePrinter(parsed, DEFAULT_PRINTER_ID)
    if (!legacy) return serverPrinterStore
    if (!parsed.version && isBlankNumbers(legacy)) return serverPrinterStore
    return {
      activeId: DEFAULT_PRINTER_ID,
      printers: [{ ...legacy, id: DEFAULT_PRINTER_ID, name: "K2 Pro" }],
    }
  } catch {
    return serverPrinterStore
  }
}

export function serializePrinterStore(store: PrinterStore) {
  return JSON.stringify({ version: 3, activeId: store.activeId, printers: store.printers })
}

export function activatePrinter(store: PrinterStore, id: string): PrinterStore {
  if (!store.printers.some((printer) => printer.id === id)) return store
  if (store.activeId === id) return store
  return { ...store, activeId: id }
}

export function updatePrinter(
  store: PrinterStore,
  id: string,
  patch: Partial<Omit<Printer, "id">>
): PrinterStore {
  if (!store.printers.some((printer) => printer.id === id)) return store
  return {
    ...store,
    printers: store.printers.map((printer) => (printer.id === id ? { ...printer, ...patch, id: printer.id } : printer)),
  }
}

export function insertPrinter(store: PrinterStore, id: string): PrinterStore {
  const nextId = id.trim()
  if (!nextId || store.printers.some((printer) => printer.id === nextId)) return store
  return {
    activeId: nextId,
    printers: [
      ...store.printers,
      {
        id: nextId,
        name: "Nova impressora",
        watts: "0",
        energyPrice: "0",
        printerPrice: "0",
        lifeHours: "0",
      },
    ],
  }
}

export function deletePrinter(store: PrinterStore, id: string): PrinterStore {
  if (store.printers.length <= 1) return store
  const printers = store.printers.filter((printer) => printer.id !== id)
  if (printers.length === store.printers.length) return store
  const activeId = store.activeId === id ? printers[0].id : store.activeId
  return { activeId, printers }
}

export function activePrinterOf(store: PrinterStore): Printer {
  return store.printers.find((printer) => printer.id === store.activeId) ?? store.printers[0]
}
