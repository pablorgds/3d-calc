import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { FormularioEntrar } from "@/components/formulario-entrar"
import { decidirGet, tokenDoCookie } from "@/lib/acesso"
import { TITULO_ERRO } from "@/lib/vistas"

export const metadata: Metadata = {
  title: "Entrar",
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string | string[] | undefined }>
}) {
  const params = await searchParams
  const aviso = typeof params.aviso === "string" ? params.aviso : null
  const token = tokenDoCookie((await cookies()).toString())
  const decisao = await decidirGet("/entrar", token, null, aviso)
  if (decisao.kind === "redirect") redirect(decisao.location)
  if (decisao.kind === "banco") return <FormularioEntrar titulo={TITULO_ERRO} aviso={null} campos={false} />
  if (decisao.kind === "falta-senha") return <FormularioEntrar titulo="Falta a senha da primeira conta." aviso={null} campos={false} />
  return <FormularioEntrar titulo="Entrar" aviso={decisao.kind === "entrar" ? decisao.aviso : aviso} campos />
}
