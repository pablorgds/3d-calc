"use server"

import { cookies } from "next/headers"
import { tokenDoCookie } from "./acesso"
import { abrirBancoDoAmbiente, comConta, type Resultado } from "./banco"
import type { Printer } from "./impressora-store"
import type { Project } from "./projetos-store"

async function naConta<T extends Resultado | { status: "rejeitado" } | { status: "recusado" }>(
  fn: () => Promise<T>
): Promise<T | { status: "erro" }> {
  const token = tokenDoCookie((await cookies()).toString())
  if (!token) return { status: "erro" }
  const sessao = await abrirBancoDoAmbiente().lerSessao(token)
  if (!sessao) return { status: "erro" }
  return comConta(sessao.contaId, fn)
}

export async function lerDoBanco(chaves: { impressora: string | null; projetos: string | null }) {
  return naConta(() => abrirBancoDoAmbiente().ler(chaves))
}

export async function gravarProjetoNoBanco(project: Project & { expectedUpdatedAt?: number }) {
  return naConta(() => abrirBancoDoAmbiente().gravarProjeto(project))
}

export async function adicionarMesaNoBanco(id: string, idNova: string, expectedUpdatedAt?: number) {
  return naConta(() => abrirBancoDoAmbiente().adicionarMesa(id, idNova, expectedUpdatedAt))
}

export async function removerMesaNoBanco(id: string, mesaId: string, expectedUpdatedAt?: number) {
  return naConta(() => abrirBancoDoAmbiente().removerMesa(id, mesaId, expectedUpdatedAt))
}

export async function duplicarProjetoNoBanco(id: string, novoId: string, now: number) {
  return naConta(() => abrirBancoDoAmbiente().duplicarProjeto(id, novoId, now))
}

export async function apagarProjetoNoBanco(id: string) {
  return naConta(() => abrirBancoDoAmbiente().apagarProjeto(id))
}

export async function adicionarImpressoraNoBanco(id: string) {
  return naConta(() => abrirBancoDoAmbiente().adicionarImpressora(id))
}

export async function removerImpressoraNoBanco(id: string) {
  return naConta(() => abrirBancoDoAmbiente().removerImpressora(id))
}

export async function atualizarImpressoraNoBanco(id: string, patch: Partial<Omit<Printer, "id">>) {
  return naConta(() => abrirBancoDoAmbiente().atualizarImpressora(id, patch))
}

export async function marcarImpressoraNoBanco(id: string) {
  return naConta(() => abrirBancoDoAmbiente().marcarImpressora(id))
}

export async function marcarImpressoraDoProjeto(projectId: string) {
  return naConta(() => abrirBancoDoAmbiente().marcarImpressoraDoProjeto(projectId))
}
