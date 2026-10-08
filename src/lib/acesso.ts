import { abrirBancoDoAmbiente, comConta } from "./banco"
import { EMAIL_ADMIN } from "./senha"

export type DecisaoGet =
  | { kind: "redirect"; status: 307; location: string }
  | { kind: "banco"; status: 200 }
  | { kind: "falta-senha"; status: 200 }
  | { kind: "entrar"; status: 200; aviso: string | null }
  | { kind: "calculadora"; status: 200; ausente: boolean; sair: true }
  | { kind: "projetos"; status: 200; nomes: string[]; sair: true }
  | { kind: "configuracoes"; status: 200; emails: string[]; redefinir: boolean; sair: true; aviso: string | null }

const ROTAS = new Set(["/", "/projetos", "/configuracoes", "/entrar"])

export function tokenDoCookie(cookie: string | null) {
  if (!cookie) return null
  for (const parte of cookie.split(";")) {
    const texto = parte.trim()
    if (texto.startsWith("sessao=")) return decodeURIComponent(texto.slice("sessao=".length))
  }
  return null
}

export async function decidirGet(path: string, token: string | null, projetoId: string | null, aviso: string | null): Promise<DecisaoGet> {
  const banco = abrirBancoDoAmbiente()
  const primeira = await banco.garantirPrimeiraConta(process.env.SENHA_ADMIN)
  if (primeira.status === "erro") {
    if (path === "/entrar") return { kind: "banco", status: 200 }
    return { kind: "redirect", status: 307, location: "/entrar" }
  }
  const sessao = token ? await banco.lerSessao(token) : null
  if (path === "/entrar") {
    if (sessao) return { kind: "redirect", status: 307, location: "/" }
    const contas = await banco.contarContas()
    if (contas === null) return { kind: "banco", status: 200 }
    if (contas === 0) return { kind: "falta-senha", status: 200 }
    return { kind: "entrar", status: 200, aviso }
  }
  if (!ROTAS.has(path) || !sessao) return { kind: "redirect", status: 307, location: "/entrar" }
  if (path === "/projetos") {
    const lido = await comConta(sessao.contaId, () => banco.ler())
    const nomes = lido.status === "ok" ? lido.projects.map((project) => project.name) : []
    return { kind: "projetos", status: 200, nomes, sair: true }
  }
  if (path === "/configuracoes") {
    const emails = sessao.papel === "admin" ? await banco.listarOutrasContas(sessao.contaId) : []
    return { kind: "configuracoes", status: 200, emails, redefinir: sessao.papel === "admin", sair: true, aviso }
  }
  let ausente = false
  if (projetoId) {
    const lido = await comConta(sessao.contaId, () => banco.ler())
    ausente = lido.status !== "ok" || !lido.projects.some((project) => project.id === projetoId)
    if (!ausente) await comConta(sessao.contaId, () => banco.marcarImpressoraDoProjeto(projetoId))
  }
  return { kind: "calculadora", status: 200, ausente, sair: true }
}

export type DecisaoPost = { status: 303; location: string; token?: string; apagarCookie?: boolean }

function comAviso(path: string, aviso: string) {
  return `${path}?aviso=${encodeURIComponent(aviso)}`
}

export async function decidirPost(
  acao: string,
  email: string,
  senha: string,
  token: string | null
): Promise<DecisaoPost> {
  const banco = abrirBancoDoAmbiente()
  await banco.garantirPrimeiraConta(process.env.SENHA_ADMIN)
  if (acao === "sair") {
    if (token) await banco.apagarSessao(token)
    return { status: 303, location: "/entrar", apagarCookie: true }
  }
  if (acao === "criar") {
    const criada = await banco.criarConta(email, senha)
    if (criada.status === "criada") {
      const entrada = await banco.entrar(email, senha)
      if (entrada.status === "ok") return { status: 303, location: "/", token: entrada.token }
    }
    const aviso =
      criada.status === "duplicado"
        ? "Esse e-mail já tem conta."
        : criada.status === "senha-curta"
          ? "A senha precisa de 8 caracteres."
          : criada.status === "email-invalido"
            ? "E-mail inválido."
            : "Não deu para ler o banco."
    return { status: 303, location: comAviso("/entrar", aviso) }
  }
  if (acao === "redefinir") {
    const sessao = token ? await banco.lerSessao(token) : null
    if (!sessao) return { status: 303, location: "/entrar" }
    const resultado = await banco.redefinirSenha(sessao.contaId, email, senha)
    if (resultado.status === "senha-curta") {
      return { status: 303, location: comAviso("/configuracoes", "A senha precisa de 8 caracteres.") }
    }
    return { status: 303, location: "/configuracoes" }
  }
  const entrada = await banco.entrar(email, senha)
  if (entrada.status === "ok") return { status: 303, location: "/", token: entrada.token }
  if (entrada.status === "vazio") return { status: 303, location: comAviso("/entrar", "Preencha e-mail e senha.") }
  return { status: 303, location: comAviso("/entrar", "E-mail ou senha não confere.") }
}

export { EMAIL_ADMIN }
