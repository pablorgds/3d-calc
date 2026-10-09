import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { decidirGet, tokenDoCookie } from "@/lib/acesso"

export default async function CriarPage() {
  const token = tokenDoCookie((await cookies()).toString())
  const decisao = await decidirGet("/criar", token, null, null)
  if (decisao.kind === "redirect") redirect(decisao.location)
  redirect("/entrar")
}
