import type { Metadata } from "next"
import { Calculadora } from "@/components/calculadora"
import { marcarImpressoraDoProjeto } from "@/lib/acoes"

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
  if (projectId) await marcarImpressoraDoProjeto(projectId)
  return <Calculadora key={projectId ?? "novo"} projectId={projectId} />
}
