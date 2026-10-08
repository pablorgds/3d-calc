import type { ColorDraft, EntryMode, JobDraft } from "./custo"

export type Project = JobDraft & {
  id: string
  name: string
  printerId: string
  updatedAt: number
}

export const serverProjects: Project[] = []

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
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
    updatedAt: now,
  })
}
