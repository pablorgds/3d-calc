"use server"

import { abrirBancoDoAmbiente } from "./banco"
import type { Printer } from "./impressora-store"
import type { Project } from "./projetos-store"

export async function lerDoBanco(chaves: { impressora: string | null; projetos: string | null }) {
  return abrirBancoDoAmbiente().ler(chaves)
}

export async function gravarProjetoNoBanco(project: Project) {
  return abrirBancoDoAmbiente().gravarProjeto(project)
}

export async function duplicarProjetoNoBanco(id: string, novoId: string, now: number) {
  return abrirBancoDoAmbiente().duplicarProjeto(id, novoId, now)
}

export async function apagarProjetoNoBanco(id: string) {
  return abrirBancoDoAmbiente().apagarProjeto(id)
}

export async function adicionarImpressoraNoBanco(id: string) {
  return abrirBancoDoAmbiente().adicionarImpressora(id)
}

export async function removerImpressoraNoBanco(id: string) {
  return abrirBancoDoAmbiente().removerImpressora(id)
}

export async function atualizarImpressoraNoBanco(id: string, patch: Partial<Omit<Printer, "id">>) {
  return abrirBancoDoAmbiente().atualizarImpressora(id, patch)
}

export async function marcarImpressoraNoBanco(id: string) {
  return abrirBancoDoAmbiente().marcarImpressora(id)
}

export async function marcarImpressoraDoProjeto(projectId: string) {
  return abrirBancoDoAmbiente().marcarImpressoraDoProjeto(projectId)
}
