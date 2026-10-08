export type EntryMode = "peca" | "lote"

export type ColorMode = "unica" | "multicolor"

export type Field =
  | { status: "ok"; value: number }
  | { status: "empty" }
  | { status: "invalid" }

export type ColorInput = {
  id: string
  name: string
  hex: string
  pricePerKg: Field
  grams: Field
}

export type CalcInput = {
  mode: EntryMode
  copies: Field
  minutes: Field
  watts: Field
  energyPricePerKwh: Field
  printerPrice: Field
  lifeHours: Field
  laborPercent: Field
  colors: ColorInput[]
}

export type Amount = number | null

export type Side = {
  blockedByCopies: boolean
  minutes: Amount
  grams: Amount
  material: Amount
  energy: Amount
  depreciation: Amount
  labor: Amount
  total: Amount
}

export type ColorDetail = {
  id: string
  name: string
  hex: string
  grams: Amount
  material: Amount
  invalid: boolean
}

export type CalcResult = {
  piece: Side
  lot: Side
  depreciationBlocked: boolean
  lifeIssue: "none" | "empty" | "zero" | "invalid"
  copiesIssue: "none" | "empty" | "zero" | "invalid"
  timeIssue: "none" | "empty" | "invalid"
  energyIssue: "none" | "empty" | "invalid"
  laborIssue: "none" | "empty" | "invalid"
  printerPriceIssue: "none" | "empty" | "invalid"
  materialIssue: "none" | "no-colors" | "invalid-color"
  colors: ColorDetail[]
}

const emptySide = (): Side => ({
  blockedByCopies: false,
  minutes: null,
  grams: null,
  material: null,
  energy: null,
  depreciation: null,
  labor: null,
  total: null,
})

export function parseDecimal(raw: string): Field {
  const trimmed = raw.trim()
  if (trimmed === "") return { status: "empty" }
  let normalized = trimmed.replace(/\s/g, "")
  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".")
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) return { status: "invalid" }
  const value = Number(normalized)
  if (!Number.isFinite(value)) return { status: "invalid" }
  return { status: "ok", value }
}

export function parseInteger(raw: string): Field {
  const parsed = parseDecimal(raw)
  if (parsed.status !== "ok") return parsed
  if (!Number.isInteger(parsed.value)) return { status: "invalid" }
  return parsed
}

function issueOf(field: Field): "none" | "empty" | "invalid" {
  if (field.status === "ok") return "none"
  return field.status
}

function lifeIssueOf(field: Field): CalcResult["lifeIssue"] {
  if (field.status === "empty") return "empty"
  if (field.status === "invalid") return "invalid"
  if (field.value === 0) return "zero"
  return "none"
}

function copiesIssueOf(field: Field): CalcResult["copiesIssue"] {
  if (field.status === "empty") return "empty"
  if (field.status === "invalid") return "invalid"
  if (field.value === 0) return "zero"
  return "none"
}

function scale(
  entered: number,
  mode: EntryMode,
  copies: Field
): { piece: Amount; lot: Amount } {
  if (mode === "peca") {
    if (copies.status !== "ok") return { piece: entered, lot: null }
    return { piece: entered, lot: entered * copies.value }
  }
  if (copies.status !== "ok" || copies.value === 0) return { piece: null, lot: entered }
  return { piece: entered / copies.value, lot: entered }
}

function applyScale(entered: Amount, mode: EntryMode, copies: Field): { piece: Amount; lot: Amount } {
  if (entered === null) return { piece: null, lot: null }
  return scale(entered, mode, copies)
}

export function calculate(input: CalcInput): CalcResult {
  const lifeIssue = lifeIssueOf(input.lifeHours)
  const copiesIssue = copiesIssueOf(input.copies)
  const timeIssue = issueOf(input.minutes)
  const laborIssue = issueOf(input.laborPercent)
  const printerPriceIssue = issueOf(input.printerPrice)
  const wattsIssue = issueOf(input.watts)
  const kwhIssue = issueOf(input.energyPricePerKwh)
  const energyIssue: CalcResult["energyIssue"] =
    wattsIssue !== "none" ? wattsIssue : kwhIssue

  const depreciationBlocked = lifeIssue !== "none"

  const colors: ColorDetail[] = input.colors.map((color) => {
    const invalid = color.pricePerKg.status !== "ok" || color.grams.status !== "ok"
    if (invalid) {
      return { id: color.id, name: color.name, hex: color.hex, grams: null, material: null, invalid: true }
    }
    const grams = color.grams.status === "ok" ? color.grams.value : 0
    const price = color.pricePerKg.status === "ok" ? color.pricePerKg.value : 0
    return {
      id: color.id,
      name: color.name,
      hex: color.hex,
      grams,
      material: grams * (price / 1000),
      invalid: false,
    }
  })

  const materialIssue: CalcResult["materialIssue"] = colors.some((color) => color.invalid)
    ? "invalid-color"
    : colors.length === 0
      ? "no-colors"
      : "none"

  const enteredGrams: Amount =
    materialIssue === "invalid-color" ? null : colors.reduce((sum, color) => sum + (color.grams ?? 0), 0)
  const enteredMaterial: Amount =
    materialIssue === "invalid-color"
      ? null
      : colors.reduce((sum, color) => sum + (color.material ?? 0), 0)

  const enteredMinutes: Amount = input.minutes.status === "ok" ? input.minutes.value : null
  const enteredHours = enteredMinutes === null ? null : enteredMinutes / 60

  const enteredEnergy: Amount =
    enteredHours === null || input.watts.status !== "ok" || input.energyPricePerKwh.status !== "ok"
      ? null
      : (input.watts.value / 1000) * enteredHours * input.energyPricePerKwh.value

  let enteredDepreciation: Amount
  if (enteredHours === null || input.printerPrice.status !== "ok") {
    enteredDepreciation = null
  } else if (input.lifeHours.status !== "ok" || input.lifeHours.value === 0) {
    enteredDepreciation = 0
  } else {
    enteredDepreciation = (input.printerPrice.value / input.lifeHours.value) * enteredHours
  }

  const enteredLabor: Amount =
    input.laborPercent.status !== "ok" ||
    enteredMaterial === null ||
    enteredEnergy === null ||
    enteredDepreciation === null
      ? null
      : (enteredMaterial + enteredEnergy + enteredDepreciation) * (input.laborPercent.value / 100)

  const enteredTotal: Amount =
    enteredMaterial === null || enteredEnergy === null || enteredDepreciation === null || enteredLabor === null
      ? null
      : enteredMaterial + enteredEnergy + enteredDepreciation + enteredLabor

  const piece = emptySide()
  const lot = emptySide()

  const pieceBlocked = input.mode === "lote" && (input.copies.status !== "ok" || input.copies.value === 0)
  const lotBlocked = input.mode === "peca" && input.copies.status !== "ok"

  piece.blockedByCopies = pieceBlocked
  lot.blockedByCopies = lotBlocked

  const parts = {
    minutes: enteredMinutes,
    grams: enteredGrams,
    material: enteredMaterial,
    energy: enteredEnergy,
    depreciation: enteredDepreciation,
    labor: enteredLabor,
    total: enteredTotal,
  } as const

  for (const key of Object.keys(parts) as (keyof typeof parts)[]) {
    const scaled = applyScale(parts[key], input.mode, input.copies)
    piece[key] = pieceBlocked ? null : scaled.piece
    lot[key] = lotBlocked ? null : scaled.lot
  }

  return {
    piece,
    lot,
    depreciationBlocked,
    lifeIssue,
    copiesIssue,
    timeIssue,
    energyIssue,
    laborIssue,
    printerPriceIssue,
    materialIssue,
    colors,
  }
}

export type ColorDraft = {
  id: string
  name: string
  hex: string
  price: string
  grams: string
}

export type JobDraft = {
  mode: EntryMode
  copies: string
  hours: string
  minutes: string
  labor: string
  colorMode: ColorMode
  grams: string
  colors: ColorDraft[]
}

function coresParaConta(draft: JobDraft): CalcInput["colors"] {
  const colorMode = draft.colorMode ?? "multicolor"
  const list = colorMode === "unica" ? draft.colors.slice(0, 1) : draft.colors
  return list.map((color) => ({
    id: color.id,
    name: color.name,
    hex: color.hex,
    pricePerKg: parseDecimal(color.price),
    grams: parseDecimal(colorMode === "unica" ? (draft.grams ?? "") : color.grams),
  }))
}

export function combineTime(hoursRaw: string, minutesRaw: string): Field {
  const hours = parseDecimal(hoursRaw)
  const minutes = parseDecimal(minutesRaw)
  if (hours.status === "empty" || minutes.status === "empty") return { status: "empty" }
  if (hours.status === "invalid" || minutes.status === "invalid") return { status: "invalid" }
  return { status: "ok", value: hours.value * 60 + minutes.value }
}

export function draftToCalcInput(
  draft: JobDraft,
  printer: { watts: string; energyPrice: string; printerPrice: string; lifeHours: string }
): CalcInput {
  return {
    mode: draft.mode,
    copies: draft.mode === "peca" ? { status: "ok", value: 1 } : parseInteger(draft.copies),
    minutes: combineTime(draft.hours, draft.minutes),
    watts: parseDecimal(printer.watts),
    energyPricePerKwh: parseDecimal(printer.energyPrice),
    printerPrice: parseDecimal(printer.printerPrice),
    lifeHours: parseDecimal(printer.lifeHours),
    laborPercent: parseDecimal(draft.labor),
    colors: coresParaConta(draft),
  }
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes)) return "—"
  const sign = minutes < 0 ? "−" : ""
  const abs = Math.abs(minutes)
  const hours = Math.floor(abs / 60)
  const rest = abs - hours * 60
  const restLabel = Number.isInteger(rest)
    ? String(rest)
    : rest.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })
  if (hours === 0) return `${sign}${restLabel} min`
  if (rest === 0) return `${sign}${hours} h`
  return `${sign}${hours} h ${restLabel} min`
}

export function formatGrams(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} g`
}
