import { useCallback, useSyncExternalStore } from "react"
import {
  copyProject,
  parseProjects,
  removeProject,
  serializeProjects,
  serverProjects,
  upsertProject,
  type Project,
} from "./projetos-store"

export const PROJECTS_STORAGE_KEY = "custo-chapa-projetos"
export const PROJECTS_CHANGE_EVENT = "custo-chapa-projetos"

export type { Project }

let cache: Project[] = serverProjects
let cacheRaw: string | null = null

export function readProjects(): Project[] {
  if (typeof window === "undefined") return serverProjects
  const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
  if (raw === cacheRaw) return cache
  cacheRaw = raw
  cache = parseProjects(raw)
  return cache
}

function commit(projects: Project[]) {
  const raw = serializeProjects(projects)
  cache = projects
  cacheRaw = raw
  window.localStorage.setItem(PROJECTS_STORAGE_KEY, raw)
  window.dispatchEvent(new Event(PROJECTS_CHANGE_EVENT))
}

export function readProject(id: string): Project | null {
  return readProjects().find((project) => project.id === id) ?? null
}

export function writeProject(project: Project) {
  commit(upsertProject(readProjects(), project))
}

export function deleteProject(id: string) {
  commit(removeProject(readProjects(), id))
}

export function duplicateProject(id: string, newId: string, now = Date.now()) {
  const current = readProjects()
  const next = copyProject(current, id, newId, now)
  if (next === current) return
  commit(next)
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(PROJECTS_CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(PROJECTS_CHANGE_EVENT, onStoreChange)
  }
}

function serverProjectsSnapshot(): Project[] | null {
  return null
}

export function useProjects(): Project[] | null {
  return useSyncExternalStore(subscribe, readProjects, serverProjectsSnapshot)
}

export function useProject(id: string | null): Project | null | undefined {
  const getSnapshot = useCallback(() => (id === null ? null : readProject(id)), [id])
  const getServerSnapshot = useCallback(() => (id === null ? null : undefined), [id])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
