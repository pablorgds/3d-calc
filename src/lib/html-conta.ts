import { FRASE_AUSENTE, FRASE_GRAVAR, TITULO_ERRO } from "./vistas.ts"
import type { DecisaoGet } from "./acesso.ts"

function sair() {
  return `<header class="site-header"><form method="post" action="/sessao"><input type="hidden" name="acao" value="sair" /><button type="submit">Sair</button></form></header>`
}

function entrar(titulo: string, aviso: string | null, campos: boolean) {
  const avisoHtml = aviso ? `<p>${aviso}</p>` : ""
  const form = campos
    ? `<form method="post" action="/sessao"><label for="email">E-mail</label><input id="email" name="email" /><label for="senha">Senha</label><input id="senha" name="senha" type="password" /><button type="submit" name="acao" value="entrar">Entrar</button><button type="submit" name="acao" value="criar">Criar conta</button></form>`
    : ""
  return `<main><h1>${titulo}</h1>${avisoHtml}${form}</main>`
}

function redefinir(emails: string[], aviso: string | null) {
  if (emails.length === 0) return "<p>Nenhuma outra conta.</p>"
  const avisoHtml = aviso ? `<p>${aviso}</p>` : ""
  const itens = emails
    .map(
      (email) =>
        `<li><span>${email}</span><button type="button">Redefinir senha</button></li>`
    )
    .join("")
  return `<section><h2>Outras contas</h2>${avisoHtml}<ul>${itens}</ul></section>`
}

export function htmlConta(decisao: DecisaoGet) {
  if (decisao.kind === "banco") return entrar(TITULO_ERRO, null, false)
  if (decisao.kind === "falta-senha") return entrar("Falta a senha da primeira conta.", null, false)
  if (decisao.kind === "entrar") return entrar("Entrar", decisao.aviso, true)
  if (decisao.kind === "criar") {
    const avisoHtml = decisao.aviso ? `<p>${decisao.aviso}</p>` : ""
    return `<main><h1>Criar conta</h1>${avisoHtml}<form method="post" action="/sessao"><label for="email">E-mail</label><input id="email" name="email" /><label for="senha">Senha</label><input id="senha" name="senha" type="password" /><label for="confirmacao">Confirmar senha</label><input id="confirmacao" name="confirmacao" type="password" /><button type="submit" name="acao" value="criar">Criar conta</button></form></main>`
  }
  if (decisao.kind === "calculadora") {
    const ausente = decisao.ausente ? `<p>${FRASE_AUSENTE}</p>` : ""
    return `${sair()}<main><h1>Calculadora</h1><p>${FRASE_GRAVAR}</p>${ausente}</main>`
  }
  if (decisao.kind === "projetos") {
    const itens = decisao.nomes.map((nome) => `<li>${nome}</li>`).join("")
    return `${sair()}<main><h1>Projetos</h1><ul>${itens}</ul></main>`
  }
  if (decisao.kind === "configuracoes") {
    const bloco = decisao.redefinir ? redefinir(decisao.emails, decisao.aviso) : ""
    return `${sair()}<main><h1>Configurações</h1>${bloco}</main>`
  }
  return ""
}
