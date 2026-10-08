import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Calculadora } from "@/components/calculadora"
import { marcarImpressoraDoProjeto } from "@/lib/acoes"
import { decidirGet, tokenDoCookie } from "@/lib/acesso"

export const metadata: Metadata = {
  title: "Calculadora",
}

export default async function CalculadoraPage({
  searchParams,
}: {
  searchParams: Promise<{ projeto?: string | string[] | undefined }>
}) {
  const params = await searchParams
  const raw = params.projeto
  const projectId = typeof raw === "string" && raw.trim() ? raw : null
  const token = tokenDoCookie((await cookies()).toString())
  const decisao = await decidirGet("/", token, projectId, null)
  if (decisao.kind === "redirect") redirect(decisao.location)
  const ausente = decisao.kind === "calculadora" && decisao.ausente
  if (projectId && !ausente) await marcarImpressoraDoProjeto(projectId)
  return <Calculadora key={projectId ?? "novo"} projectId={projectId} ausente={ausente} />
}
