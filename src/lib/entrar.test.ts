import "./resolver-ts.ts"
import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import http from "node:http"
import test from "node:test"
import { promisify } from "node:util"
import { Client } from "pg"

const { decidirGet, decidirPost, tokenDoCookie } = await import("./acesso.ts")
const { htmlConta } = await import("./html-conta.ts")
const { cabecalhoCookieApagado, cabecalhoCookieSessao } = await import("./senha.ts")
const { pegarTravaProva, soltarTravaProva } = await import("./trava-prova.ts")

const exec = promisify(execFile)
const container = "custo-chapa-prova-entrar"
let url = ""
let base = ""
let servidor: http.Server

function cookieDe(resposta: Response) {
  return resposta.headers.get("set-cookie") ?? ""
}

function tokenDe(setCookie: string) {
  return setCookie.match(/sessao=([^;]+)/)?.[1] ?? ""
}

async function pedir(caminho: string, init: RequestInit = {}) {
  return fetch(base + caminho, { redirect: "manual", ...init })
}

async function corpoDepois(resposta: Response, cookie?: string) {
  if (resposta.status === 303 || resposta.status === 307) {
    const location = resposta.headers.get("location") ?? "/"
    const gravado = cookieDe(resposta)
    const sessao = gravado.includes("sessao=") && !gravado.includes("Max-Age=0") ? `sessao=${tokenDe(gravado)}` : cookie
    const seguinte = await pedir(location.startsWith("http") ? new URL(location).pathname + new URL(location).search : location, {
      headers: sessao ? { cookie: sessao } : {},
    })
    return seguinte.text()
  }
  return resposta.text()
}

function formulario(acao: string, email: string, senha: string, cookie?: string) {
  const headers: Record<string, string> = { "content-type": "application/x-www-form-urlencoded" }
  if (cookie) headers.cookie = cookie
  return pedir("/sessao", {
    method: "POST",
    headers,
    body: new URLSearchParams({ acao, email, senha }).toString(),
  })
}

async function sql<T extends Record<string, unknown>>(text: string, params: unknown[] = []) {
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    return await client.query<T>(text, params)
  } finally {
    await client.end()
  }
}

test.before(async () => {
  await pegarTravaProva()
  await exec("docker", ["rm", "-f", container], { windowsHide: true }).catch(() => undefined)
  await exec(
    "docker",
    ["run", "-d", "--name", container, "-e", "POSTGRES_USER=custo", "-e", "POSTGRES_PASSWORD=custo", "-e", "POSTGRES_DB=custo_chapa", "-p", "127.0.0.1::5432", "postgres:18"],
    { windowsHide: true }
  )
  const inicio = Date.now()
  while (Date.now() - inicio < 90_000) {
    try {
      await exec("docker", ["exec", container, "pg_isready", "-U", "custo", "-d", "custo_chapa"], { windowsHide: true })
      break
    } catch {
      await new Promise((resolver) => setTimeout(resolver, 1000))
    }
  }
  const { stdout } = await exec("docker", ["port", container, "5432"], { windowsHide: true })
  const porta = stdout.match(/:(\d+)/)?.[1]
  if (!porta) throw new Error(stdout)
  url = `postgresql://custo:custo@127.0.0.1:${porta}/custo_chapa`
  const pronta = Date.now()
  while (Date.now() - pronta < 30_000) {
    const client = new Client({ connectionString: url })
    try {
      await client.connect()
      await client.query("SELECT 1")
      break
    } catch (erro) {
      if (Date.now() - pronta >= 29_000) throw erro
      await new Promise((resolver) => setTimeout(resolver, 500))
    } finally {
      await client.end().catch(() => undefined)
    }
  }
  process.env.DATABASE_URL = url
  process.env.SENHA_ADMIN = "segredo-inicial"
  servidor = http.createServer(async (req, res) => {
    const endereco = new URL(req.url ?? "/", "http://127.0.0.1")
    const pedacos: Buffer[] = []
    for await (const parte of req) pedacos.push(Buffer.from(parte))
    if (req.method === "POST") {
      const params = new URLSearchParams(Buffer.concat(pedacos).toString("utf8"))
      const decisao = await decidirPost(
        params.get("acao") ?? "entrar",
        params.get("email") ?? "",
        params.get("senha") ?? "",
        tokenDoCookie(req.headers.cookie ?? null)
      )
      const headers: Record<string, string> = { Location: decisao.location }
      if (decisao.token) headers["Set-Cookie"] = cabecalhoCookieSessao(decisao.token)
      if (decisao.apagarCookie) headers["Set-Cookie"] = cabecalhoCookieApagado()
      res.writeHead(decisao.status, headers)
      res.end()
      return
    }
    const decisao = await decidirGet(
      endereco.pathname,
      tokenDoCookie(req.headers.cookie ?? null),
      endereco.searchParams.get("projeto"),
      endereco.searchParams.get("aviso")
    )
    if (decisao.kind === "redirect") {
      res.writeHead(307, { Location: decisao.location })
      res.end()
      return
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    res.end(htmlConta(decisao))
  })
  await new Promise<void>((resolver) => servidor.listen(0, "127.0.0.1", () => resolver()))
  const endereco = servidor.address()
  if (!endereco || typeof endereco === "string") throw new Error("sem porta")
  base = `http://127.0.0.1:${endereco.port}`
}, { timeout: 180_000 })

test.after(async () => {
  try {
    servidor.close()
    const { abrirBanco } = await import("./banco.ts")
    await abrirBanco(url).fechar()
    await exec("docker", ["rm", "-f", container], { windowsHide: true }).catch(() => undefined)
  } finally {
    soltarTravaProva()
  }
})

test.beforeEach(async () => {
  process.env.DATABASE_URL = url
  process.env.SENHA_ADMIN = "segredo-inicial"
  const existe = await sql<{ nome: string | null }>("SELECT to_regclass('public.conta') AS nome")
  if (existe.rows[0]?.nome) await sql("TRUNCATE sessao, impressora_ativa, cor, mesa, projeto, impressora, conta")
})

test("get / sem cookie 307", async () => {
  const resposta = await pedir("/")
  assert.equal(resposta.status, 307)
  assert.equal(resposta.headers.get("location"), "/entrar")
})

test("get /projetos sem cookie 307", async () => {
  const resposta = await pedir("/projetos")
  assert.equal(resposta.status, 307)
  assert.equal(resposta.headers.get("location"), "/entrar")
})

test("get /configuracoes sem cookie 307", async () => {
  const resposta = await pedir("/configuracoes")
  assert.equal(resposta.status, 307)
  assert.equal(resposta.headers.get("location"), "/entrar")
})

test("get /usuarios sem cookie 307", async () => {
  const resposta = await pedir("/usuarios")
  assert.equal(resposta.status, 307)
  assert.equal(resposta.headers.get("location"), "/entrar")
})

test("get /entrar 200 titulo Entrar", async () => {
  const resposta = await pedir("/entrar")
  assert.equal(resposta.status, 200)
  assert.match(await resposta.text(), /<h1[^>]*>Entrar<\/h1>/)
})

test("entrar mostra email senha e criar conta", async () => {
  const html = await (await pedir("/entrar")).text()
  assert.match(html, /E-mail/)
  assert.match(html, /Senha/)
  assert.match(html, /Entrar/)
  assert.match(html, /Criar conta/)
})

test("get /entrar com sessao 307", async () => {
  const entrada = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const resposta = await pedir("/entrar", { headers: { cookie: `sessao=${tokenDe(cookieDe(entrada))}` } })
  assert.equal(resposta.status, 307)
  assert.equal(resposta.headers.get("location"), "/")
})

test("cookie sessao invalido 307", async () => {
  const desconhecido = await pedir("/", { headers: { cookie: "sessao=nao-existe" } })
  assert.equal(desconhecido.status, 307)
  assert.equal(desconhecido.headers.get("location"), "/entrar")
  const entrada = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const token = tokenDe(cookieDe(entrada))
  await sql("UPDATE sessao SET expira = now() - interval '1 minute' WHERE token = $1", [token])
  const expirado = await pedir("/", { headers: { cookie: `sessao=${token}` } })
  assert.equal(expirado.status, 307)
  assert.equal(expirado.headers.get("location"), "/entrar")
})

test("entrar banco parado", async () => {
  const anterior = process.env.DATABASE_URL
  process.env.DATABASE_URL = "postgresql://custo:custo@127.0.0.1:1/custo_chapa"
  try {
    const resposta = await pedir("/entrar")
    assert.equal(resposta.status, 200)
    const html = await resposta.text()
    assert.match(html, /Não deu para ler o banco\./)
    assert.equal(html.includes("Senha"), false)
  } finally {
    process.env.DATABASE_URL = anterior
    const { abrirBanco } = await import("./banco.ts")
    await abrirBanco("postgresql://custo:custo@127.0.0.1:1/custo_chapa").fechar()
  }
})

test("entrar falta a senha da primeira conta", async () => {
  const anterior = process.env.SENHA_ADMIN
  try {
    for (const senha of [undefined, "", "1234567"] as const) {
      await sql("TRUNCATE sessao, impressora_ativa, cor, mesa, projeto, impressora, conta")
      if (senha === undefined) delete process.env.SENHA_ADMIN
      else process.env.SENHA_ADMIN = senha
      const resposta = await pedir("/entrar")
      assert.equal(resposta.status, 200)
      assert.match(await resposta.text(), /Falta a senha da primeira conta\./)
      const n = await sql<{ n: number }>("SELECT count(*)::int AS n FROM conta")
      assert.equal(Number(n.rows[0]?.n), 0)
    }
  } finally {
    if (anterior === undefined) delete process.env.SENHA_ADMIN
    else process.env.SENHA_ADMIN = anterior
  }
})

test("login admin grava cookie sessao", async () => {
  const resposta = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  assert.match(cookieDe(resposta), /^sessao=/)
})

test("email duplicado mostra ja tem conta", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const resposta = await formulario("criar", "outra@example.com", "senha-oito")
  assert.match(await corpoDepois(resposta), /Esse e-mail já tem conta\./)
})

test("senha 7 mostra 8 caracteres", async () => {
  const resposta = await formulario("criar", "curta@example.com", "1234567")
  assert.match(await corpoDepois(resposta), /A senha precisa de 8 caracteres\./)
})

test("email sem arroba mostra invalido", async () => {
  const resposta = await formulario("criar", "sem-arroba", "senha-oito")
  assert.match(await corpoDepois(resposta), /E-mail inválido\./)
})

test("get /projetos 200 so da conta", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const entrada = await formulario("entrar", "outra@example.com", "senha-oito")
  const cookie = `sessao=${tokenDe(cookieDe(entrada))}`
  const { abrirBanco, comConta } = await import("./banco.ts")
  const sessao = await abrirBanco(url).lerSessao(tokenDe(cookieDe(entrada)))
  assert.ok(sessao)
  const projeto = {
    id: "so",
    name: "Só da outra",
    printerId: "k2-pro",
    mode: "lote" as const,
    copies: "1",
    hours: "1",
    minutes: "0",
    labor: "0",
    colorMode: "unica" as const,
    grams: "1",
    colors: [{ id: "c1", name: "PLA", hex: "#111111", price: "1", grams: "1" }],
    mesas: [],
    updatedAt: 10,
  }
  await comConta(sessao.contaId, () => abrirBanco(url).gravarProjeto(projeto))
  const resposta = await pedir("/projetos", { headers: { cookie } })
  assert.equal(resposta.status, 200)
  assert.match(await resposta.text(), /Só da outra/)
})

test("get /projetos admin sem o nome da outra", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const dela = await formulario("entrar", "outra@example.com", "senha-oito")
  const { abrirBanco, comConta } = await import("./banco.ts")
  const sessao = await abrirBanco(url).lerSessao(tokenDe(cookieDe(dela)))
  assert.ok(sessao)
  await comConta(sessao.contaId, () =>
    abrirBanco(url).gravarProjeto({
      id: "so",
      name: "Só da outra",
      printerId: "k2-pro",
      mode: "lote",
      copies: "1",
      hours: "1",
      minutes: "0",
      labor: "0",
      colorMode: "unica",
      grams: "1",
      colors: [],
      mesas: [],
      updatedAt: 10,
    })
  )
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const resposta = await pedir("/projetos", { headers: { cookie: `sessao=${tokenDe(cookieDe(admin))}` } })
  assert.equal(resposta.status, 200)
  assert.equal((await resposta.text()).includes("Só da outra"), false)
})

test("projeto alheio mostra ausente", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const dela = await formulario("entrar", "outra@example.com", "senha-oito")
  const { abrirBanco, comConta } = await import("./banco.ts")
  const sessao = await abrirBanco(url).lerSessao(tokenDe(cookieDe(dela)))
  assert.ok(sessao)
  await comConta(sessao.contaId, () =>
    abrirBanco(url).gravarProjeto({
      id: "alheio",
      name: "Alheio",
      printerId: "k2-pro",
      mode: "lote",
      copies: "1",
      hours: "1",
      minutes: "0",
      labor: "0",
      colorMode: "unica",
      grams: "1",
      colors: [],
      mesas: [],
      updatedAt: 10,
    })
  )
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const resposta = await pedir("/?projeto=alheio", { headers: { cookie: `sessao=${tokenDe(cookieDe(admin))}` } })
  assert.match(await resposta.text(), /Esse projeto não está no banco\. Salvar cria um novo\./)
})

test("get / com sessao 200", async () => {
  const entrada = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const resposta = await pedir("/", { headers: { cookie: `sessao=${tokenDe(cookieDe(entrada))}` } })
  assert.equal(resposta.status, 200)
  assert.match(await resposta.text(), /Gravar o lote deixa o projeto no banco\./)
})

test("usuarios admin mostra o email", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const cookie = `sessao=${tokenDe(cookieDe(admin))}`
  const resposta = await pedir("/usuarios", { headers: { cookie } })
  assert.equal(resposta.status, 200)
  assert.match(await resposta.text(), /outra@example.com/)
  const config = await pedir("/configuracoes", { headers: { cookie } })
  assert.equal((await config.text()).includes("outra@example.com"), false)
})

test("conta comum sem redefinir senha", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const entrada = await formulario("entrar", "outra@example.com", "senha-oito")
  const cookie = `sessao=${tokenDe(cookieDe(entrada))}`
  const html = await (await pedir("/configuracoes", { headers: { cookie } })).text()
  assert.equal(html.includes("Redefinir senha"), false)
  assert.equal(html.includes("Nova senha"), false)
  const usuarios = await pedir("/usuarios", { headers: { cookie } })
  assert.equal(usuarios.status, 307)
  assert.equal(usuarios.headers.get("location"), "/")
})

test("emails do admin em ordem", async () => {
  await formulario("criar", "m@example.com", "senha-oito")
  await formulario("criar", "a@example.com", "senha-oito")
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const html = await (await pedir("/usuarios", { headers: { cookie: `sessao=${tokenDe(cookieDe(admin))}` } })).text()
  assert.ok(html.indexOf("a@example.com") < html.indexOf("m@example.com"))
})

test("nenhuma outra conta", async () => {
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const html = await (await pedir("/usuarios", { headers: { cookie: `sessao=${tokenDe(cookieDe(admin))}` } })).text()
  assert.match(html, /Nenhuma outra conta\./)
})

test("incluir nao troca a sessao do admin", async () => {
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const cookie = `sessao=${tokenDe(cookieDe(admin))}`
  const resposta = await formulario("incluir", "nova@example.com", "senha-oito", cookie)
  assert.equal(cookieDe(resposta).includes("sessao="), false)
  assert.match(await corpoDepois(resposta, cookie), /nova@example.com/)
  const entrada = await formulario("entrar", "nova@example.com", "senha-oito")
  assert.match(cookieDe(entrada), /^sessao=/)
  const segue = await pedir("/usuarios", { headers: { cookie } })
  assert.equal(segue.status, 200)
})

test("incluir duplicado avisa", async () => {
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const cookie = `sessao=${tokenDe(cookieDe(admin))}`
  await formulario("incluir", "nova@example.com", "senha-oito", cookie)
  const resposta = await formulario("incluir", "nova@example.com", "senha-oito", cookie)
  assert.match(await corpoDepois(resposta, cookie), /Esse e-mail já tem conta\./)
})

test("apagar some da lista", async () => {
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const cookie = `sessao=${tokenDe(cookieDe(admin))}`
  await formulario("incluir", "nova@example.com", "senha-oito", cookie)
  const resposta = await formulario("apagar", "nova@example.com", "", cookie)
  assert.equal((await corpoDepois(resposta, cookie)).includes("nova@example.com"), false)
  const entrada = await formulario("entrar", "nova@example.com", "senha-oito")
  assert.match(await corpoDepois(entrada), /E-mail ou senha não confere\./)
})

test("conta comum nao apaga pelo post", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  await formulario("criar", "tres@example.com", "senha-oito")
  const entrada = await formulario("entrar", "outra@example.com", "senha-oito")
  const cookie = `sessao=${tokenDe(cookieDe(entrada))}`
  const resposta = await formulario("apagar", "tres@example.com", "", cookie)
  assert.equal(resposta.status, 303)
  assert.equal(resposta.headers.get("location"), "/")
  const segue = await formulario("entrar", "tres@example.com", "senha-oito")
  assert.match(cookieDe(segue), /^sessao=/)
})

test("senha antiga nao entra", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  await formulario("redefinir", "outra@example.com", "nova-senha", `sessao=${tokenDe(cookieDe(admin))}`)
  const resposta = await formulario("entrar", "outra@example.com", "senha-oito")
  assert.equal(cookieDe(resposta).includes("sessao="), false)
  assert.match(await corpoDepois(resposta), /E-mail ou senha não confere\./)
})

test("senha nova entra", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  await formulario("redefinir", "outra@example.com", "nova-senha", `sessao=${tokenDe(cookieDe(admin))}`)
  const resposta = await formulario("entrar", "outra@example.com", "nova-senha")
  assert.match(cookieDe(resposta), /^sessao=/)
})

test("redefinir senha curta mostra 8 caracteres", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const admin = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const cookie = `sessao=${tokenDe(cookieDe(admin))}`
  const resposta = await formulario("redefinir", "outra@example.com", "1234567", cookie)
  assert.match(await corpoDepois(resposta, cookie), /A senha precisa de 8 caracteres\./)
})

test("senha errada nao grava cookie", async () => {
  const resposta = await formulario("entrar", "pablorgds@gmail.com", "nao-escrever-esta-senha")
  assert.equal(cookieDe(resposta).includes("sessao="), false)
  assert.match(await corpoDepois(resposta), /E-mail ou senha não confere\./)
})

test("email desconhecido nao confere", async () => {
  const resposta = await formulario("entrar", "ninguem@example.com", "senha-oito")
  assert.match(await corpoDepois(resposta), /E-mail ou senha não confere\./)
})

test("login vazio pede email e senha", async () => {
  const semEmail = await formulario("entrar", "", "senha-oito")
  assert.equal(cookieDe(semEmail).includes("sessao="), false)
  assert.match(await corpoDepois(semEmail), /Preencha e-mail e senha\./)
  const semSenha = await formulario("entrar", "pablorgds@gmail.com", "")
  assert.equal(cookieDe(semSenha).includes("sessao="), false)
  assert.match(await corpoDepois(semSenha), /Preencha e-mail e senha\./)
})

test("login ignora maiusculas do email", async () => {
  await formulario("criar", "outra@example.com", "senha-oito")
  const resposta = await formulario("entrar", "Outra@Example.com", "senha-oito")
  assert.match(cookieDe(resposta), /^sessao=/)
})

test("cookie sessao httponly 7 dias", async () => {
  const antes = Date.now()
  const resposta = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const cookie = cookieDe(resposta)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Lax/)
  assert.match(cookie, /Path=\//)
  assert.equal(cookie.includes("Secure"), false)
  assert.match(cookie, /Max-Age=604800/)
  const linha = await sql<{ expira: Date }>("SELECT expira FROM sessao WHERE token = $1", [tokenDe(cookie)])
  const expira = new Date(linha.rows[0]?.expira ?? 0).getTime()
  const sete = 7 * 24 * 60 * 60 * 1000
  assert.ok(Math.abs(expira - (antes + sete)) < 120_000)
})

test("sair volta para entrar", async () => {
  const entrada = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const token = tokenDe(cookieDe(entrada))
  await formulario("sair", "", "", `sessao=${token}`)
  const resposta = await pedir("/", { headers: { cookie: `sessao=${token}` } })
  assert.equal(resposta.status, 307)
  assert.equal(resposta.headers.get("location"), "/entrar")
})

test("stdout entrada recusada", async () => {
  const pedacos: string[] = []
  const original = process.stdout.write.bind(process.stdout)
  process.stdout.write = ((chunk: string | Uint8Array) => {
    pedacos.push(String(chunk))
    return true
  }) as typeof process.stdout.write
  try {
    await formulario("entrar", "pablorgds@gmail.com", "nao-escrever-esta-senha")
  } finally {
    process.stdout.write = original
  }
  const texto = pedacos.join("")
  assert.match(texto, /entrada recusada/)
  assert.equal(texto.includes("nao-escrever-esta-senha"), false)
})

test("cabecalho mostra Sair", async () => {
  const entrada = await formulario("entrar", "pablorgds@gmail.com", "segredo-inicial")
  const html = await (await pedir("/", { headers: { cookie: `sessao=${tokenDe(cookieDe(entrada))}` } })).text()
  assert.match(html, /Sair/)
})
