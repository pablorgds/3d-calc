import { apagarProjetoNoBanco, duplicarProjetoNoBanco, gravarProjetoNoBanco } from "./acoes"
import { PROJECTS_STORAGE_KEY } from "./chaves"
import { aplicarResultado } from "./estado"
import { useLeitura } from "./impressora"
import type { Project } from "./projetos-store"

export { PROJECTS_STORAGE_KEY, useLeitura }
export type { Project }

export function useProjects(): Project[] | null {
  const leitura = useLeitura()
  if (leitura.status !== "pronto") return null
  return leitura.projects
}

export function writeProject(project: Project) {
  void gravarProjetoNoBanco(project).then((resultado) => {
    if (resultado.status !== "rejeitado") aplicarResultado(resultado)
  })
}

export function deleteProject(id: string) {
  void apagarProjetoNoBanco(id).then((resultado) => {
    if (resultado.status !== "rejeitado") aplicarResultado(resultado)
  })
}

export function duplicateProject(id: string, newId: string, now = Date.now()) {
  void duplicarProjetoNoBanco(id, newId, now).then((resultado) => {
    if (resultado.status !== "rejeitado") aplicarResultado(resultado)
  })
}
