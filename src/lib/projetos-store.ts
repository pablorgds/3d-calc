import { parseDecimal, parseInteger, type ColorDraft, type EntryMode, type JobDraft, type MesaDraft } from "./custo"

export type Project = JobDraft & {
  id: string
  name: string
  printerId: string
  updatedAt: number
}

export const serverProjects: Project[] = []

export const HEX_MESA_NOVA = "#57534e"

export function mesaVazia(id: string): MesaDraft {
  return { id, hours: "", minutes: "", name: "", hex: HEX_MESA_NOVA, price: "", grams: "" }
}

export function mesaFechada(mesa: MesaDraft) {
  return [mesa.hours, mesa.minutes, mesa.price, mesa.grams].every((value) => parseDecimal(value).status === "ok")
}

function copiesUm(copies: string) {
  const parsed = parseInteger(copies)
  return parsed.status === "ok" && parsed.value === 1
}

export function idAoSalvar(projectId: string | null, missing: boolean, novoId: string) {
  if (!projectId || missing) return novoId
  return projectId
}

function impressaoDaMesa(project: Project, mesa: MesaDraft): Project {
  return {
    ...project,
    mode: "peca",
    colorMode: "unica",
    copies: "1",
    hours: mesa.hours,
    minutes: mesa.minutes,
    grams: mesa.grams,
    colors: [{ id: mesa.id, name: mesa.name, hex: mesa.hex, price: mesa.price, grams: mesa.grams }],
    mesas: [],
  }
}

export function ganharMesa(project: Project, idNova: string): { status: "recusado" } | { status: "ok"; project: Project } {
  const mesas = project.mesas ?? []
  if (mesas.length === 0 && project.colors.length > 1) return { status: "recusado" }
  if (mesas.length > 0) {
    return { status: "ok", project: { ...project, mesas: [...mesas, mesaVazia(idNova)] } }
  }
  const cor = project.colors[0]
  const primeira: MesaDraft = {
    id: cor?.id ?? `${idNova}-chapa`,
    hours: project.hours,
    minutes: project.minutes,
    name: cor?.name ?? "",
    hex: cor?.hex ?? HEX_MESA_NOVA,
    price: cor?.price ?? "",
    grams: project.colorMode === "multicolor" ? (cor?.grams ?? "") : project.grams,
  }
  return {
    status: "ok",
    project: {
      ...project,
      mode: "peca",
      colorMode: "unica",
      hours: "",
      minutes: "",
      grams: "",
      colors: [],
      mesas: [primeira, mesaVazia(idNova)],
    },
  }
}

export function perderMesa(project: Project, id: string): Project {
  const mesas = (project.mesas ?? []).filter((mesa) => mesa.id !== id)
  const fechadas = mesas.filter(mesaFechada)
  const abertas = mesas.filter((mesa) => !mesaFechada(mesa))
  if (abertas.length === 0 && fechadas.length === 1 && copiesUm(project.copies)) return impressaoDaMesa(project, fechadas[0])
  if (mesas.length === 0) return { ...project, mesas: [] }
  return {
    ...project,
    mode: "peca",
    colorMode: "unica",
    hours: "",
    minutes: "",
    grams: "",
    colors: [],
    mesas,
  }
}

export function prepararGravacao(project: Project): Project {
  const seen = new Set<string>()
  const mesas: MesaDraft[] = []
  for (const mesa of project.mesas ?? []) {
    if (seen.has(mesa.id)) continue
    seen.add(mesa.id)
    mesas.push(mesa)
  }
  if (mesas.length === 0) return { ...project, mesas: [] }
  return {
    ...project,
    mode: "peca",
    colorMode: "unica",
    hours: "",
    minutes: "",
    grams: "",
    colors: [],
    mesas,
  }
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function parseMesa(value: unknown): MesaDraft | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  const id = asString(record.id).trim()
  if (!id) return null
  return {
    id,
    hours: asString(record.hours),
    minutes: asString(record.minutes),
    name: asString(record.name),
    hex: asString(record.hex, HEX_MESA_NOVA),
    price: asString(record.price),
    grams: asString(record.grams),
  }
}

function parseColor(value: unknown): ColorDraft | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  const id = asString(record.id).trim()
  if (!id) return null
  return {
    id,
    name: asString(record.name),
    hex: asString(record.hex, "#78716c"),
    price: asString(record.price, "0"),
    grams: asString(record.grams, "0"),
  }
}

function parseMode(value: unknown): EntryMode | null {
  return value === "peca" || value === "lote" ? value : null
}

function parseColorMode(value: unknown, colorCount: number) {
  if (value === "unica" || value === "multicolor") return value
  return colorCount > 1 ? "multicolor" : "unica"
}

export function parseProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  const id = asString(record.id).trim()
  const mode = parseMode(record.mode)
  if (!id || !mode) return null
  const colors = Array.isArray(record.colors)
    ? record.colors.map(parseColor).filter((color): color is ColorDraft => color !== null)
    : []
  const mesas = Array.isArray(record.mesas)
    ? record.mesas.map(parseMesa).filter((mesa): mesa is MesaDraft => mesa !== null)
    : []
  const colorMode = parseColorMode(record.colorMode, colors.length)
  const gramsGravados = asString(record.grams, "")
  return {
    id,
    name: asString(record.name),
    printerId: asString(record.printerId).trim(),
    mode,
    copies: asString(record.copies, "0"),
    hours: asString(record.hours, "0"),
    minutes: asString(record.minutes, "0"),
    labor: asString(record.labor, "0"),
    colorMode,
    grams: gramsGravados !== "" ? gramsGravados : colorMode === "unica" ? (colors[0]?.grams ?? "") : "",
    colors,
    mesas,
    updatedAt: typeof record.updatedAt === "number" && Number.isFinite(record.updatedAt) ? record.updatedAt : 0,
  }
}

export function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name, "pt-BR"))
}

export function parseProjects(raw: string | null): Project[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as { projects?: unknown }
    if (!Array.isArray(parsed.projects)) return []
    const seen = new Set<string>()
    const projects = parsed.projects
      .map(parseProject)
      .filter((project): project is Project => {
        if (!project || seen.has(project.id)) return false
        seen.add(project.id)
        return true
      })
    return sortProjects(projects)
  } catch {
    return []
  }
}

export function serializeProjects(projects: Project[]) {
  return JSON.stringify({ version: 1, projects })
}

export function upsertProject(projects: Project[], project: Project): Project[] {
  const exists = projects.some((item) => item.id === project.id)
  const next = exists ? projects.map((item) => (item.id === project.id ? project : item)) : [...projects, project]
  return sortProjects(next)
}

export function removeProject(projects: Project[], id: string): Project[] {
  return projects.filter((project) => project.id !== id)
}

export function copyProject(projects: Project[], id: string, newId: string, now: number): Project[] {
  const source = projects.find((project) => project.id === id)
  const nextId = newId.trim()
  if (!source || !nextId || projects.some((project) => project.id === nextId)) return projects
  return upsertProject(projects, {
    ...source,
    id: nextId,
    name: `${source.name} (cópia)`,
    colors: source.colors.map((color) => ({ ...color })),
    mesas: (source.mesas ?? []).map((mesa) => ({ ...mesa })),
    updatedAt: now,
  })
}
