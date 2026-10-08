import { decidirPost, tokenDoCookie } from "@/lib/acesso"
import { cabecalhoCookieApagado, cabecalhoCookieSessao } from "@/lib/senha"

export async function POST(request: Request) {
  const form = await request.formData()
  const acao = String(form.get("acao") ?? "entrar")
  const email = String(form.get("email") ?? "")
  const senha = String(form.get("senha") ?? "")
  const token = tokenDoCookie(request.headers.get("cookie"))
  const decisao = await decidirPost(acao, email, senha, token)
  const headers = new Headers({ Location: decisao.location })
  if (decisao.token) headers.append("Set-Cookie", cabecalhoCookieSessao(decisao.token))
  if (decisao.apagarCookie) headers.append("Set-Cookie", cabecalhoCookieApagado())
  return new Response(null, { status: 303, headers })
}