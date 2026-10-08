import "./resolver-ts.ts"
import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"
import { Client } from "pg"
import { calculate, draftToCalcInput, type MesaDraft } from "./custo.ts"
import { serializePrinterStore, type PrinterStore } from "./impressora-store.ts"
import type { Project } from "./projetos-store.ts"

const { idAoSalvar, serializeProjects } = await import("./projetos-store.ts")
const { abrirBanco, abrirBancoDoAmbiente, comConta } = await import("./banco.ts")

let contaIdProva = ""

function envolver<T extends object>(banco: T): T {
  return new Proxy(banco, {
    get(alvo, prop, receptor) {
      const valor = Reflect.get(alvo, prop, receptor)
      if (typeof valor !== "function") return valor
      const direto = new Set([
        "fechar",
        "garantirPrimeiraConta",
        "criarConta",
        "entrar",
        "lerSessao",
        "apagarSessao",
        "redefinirSenha",
        "listarOutrasContas",
        "contarContas",
      ])
      if (direto.has(String(prop)) || !contaIdProva) return valor
      return (...args: unknown[]) => comConta(contaIdProva, () => (valor as (...valores: unknown[]) => unknown).apply(alvo, args))
    },
  })
}

function bancoProva() {
  return envolver(abrirBanco(url))
}

type Resultado =
  | { status: "ok"; printers: PrinterStore; projects: Project[] }
  | { status: "erro" }

const exec = promisify(execFile)
const root = path.resolve(import.meta.dirname, "../..")
const container = "custo-chapa-prova-pg"

let url = ""

function projeto(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    name: "Suporte",
    printerId: "k2-pro",
    mode: "lote",
    copies: "4",
    hours: "2",
    minutes: "15",
    labor: "30",
    colorMode: "unica",
    grams: "40",
    colors: [{ id: "c1", name: "PLA preto", hex: "#111111", price: "90", grams: "40" }],
    mesas: [],
    updatedAt: 10,
    ...overrides,
  }
}

function ok(resultado: Resultado | { status: "rejeitado" }) {
  assert.equal(resultado.status, "ok")
  if (resultado.status !== "ok") throw new Error(resultado.status)
  return resultado
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

async function esperarPostgres() {
  const inicio = Date.now()
  while (Date.now() - inicio < 90_000) {
    try {
      await exec("docker", ["exec", container, "pg_isready", "-U", "custo", "-d", "custo_chapa"], { windowsHide: true })
      return
    } catch {
      await new Promise((resolver) => setTimeout(resolver, 1000))
    }
  }
  throw new Error("postgres de prova nao ficou pronto")
}

test.describe("banco", { concurrency: 1 }, () => {
  test.before(async () => {
    await exec("docker", ["rm", "-f", container], { windowsHide: true }).catch(() => undefined)
    await exec(
      "docker",
      [
        "run",
        "-d",
        "--name",
        container,
        "-e",
        "POSTGRES_USER=custo",
        "-e",
        "POSTGRES_PASSWORD=custo",
        "-e",
        "POSTGRES_DB=custo_chapa",
        "-p",
        "127.0.0.1::5432",
        "postgres:18",
      ],
      { windowsHide: true }
    )
    await esperarPostgres()
    const { stdout } = await exec("docker", ["port", container, "5432"], { windowsHide: true })
    const porta = stdout.match(/:(\d+)/)?.[1]
    if (!porta) throw new Error(stdout)
    url = `postgresql://custo:custo@127.0.0.1:${porta}/custo_chapa`
  }, { timeout: 180_000 })

  test.beforeEach(async () => {
    const client = new Client({ connectionString: url })
    await client.connect()
    try {
      const existe = await client.query<{ nome: string | null }>("SELECT to_regclass('public.conta') AS nome")
      if (existe.rows[0]?.nome) {
        await client.query("DROP TRIGGER IF EXISTS rejeita_falha_copia ON projeto")
        await client.query("DROP TRIGGER IF EXISTS rejeita_mesa ON mesa")
        await client.query("DROP TRIGGER IF EXISTS rejeita_conta_nova ON impressora")
        await client.query("TRUNCATE sessao, impressora_ativa, cor, mesa, projeto, impressora, conta")
      }
    } finally {
      await client.end()
    }
    const criada = await bancoProva().garantirPrimeiraConta("segredo-inicial")
    if (criada.status !== "criada" && criada.status !== "ja-existe") throw new Error(criada.status)
    contaIdProva = criada.id
  })

  test.after(async () => {
    await bancoProva().fechar()
    await exec("docker", ["rm", "-f", container], { windowsHide: true }).catch(() => undefined)
  })

  test("semente k2 pro", async () => {
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.printers.activeId, "k2-pro")
    assert.equal(lido.printers.printers.length, 1)
    assert.equal(lido.printers.printers[0].id, "k2-pro")
    assert.equal(lido.printers.printers[0].name, "K2 Pro")
    assert.equal(lido.printers.printers[0].watts, "150")
    assert.equal(lido.printers.printers[0].energyPrice, "1.18")
    assert.equal(lido.printers.printers[0].printerPrice, "7979")
    assert.equal(lido.printers.printers[0].lifeHours, "3000")
  })

  test("rele o projeto gravado", async () => {
    const salvo = projeto()
    ok(await bancoProva().gravarProjeto(salvo))
    const lido = ok(await bancoProva().ler())
    assert.deepEqual(lido.projects[0], salvo)
  })

  test("projeto sobrevive a outro pool", async () => {
    const primeiro = bancoProva()
    ok(await primeiro.gravarProjeto(projeto({ id: "persiste" })))
    await primeiro.fechar()
    const lido = ok(await bancoProva().ler())
    assert.ok(lido.projects.some((item) => item.id === "persiste"))
  })

  test("navegador limpo mantem o projeto", async () => {
    ok(await bancoProva().gravarProjeto(projeto()))
    const lido = ok(await bancoProva().ler({ impressora: null, projetos: null }))
    assert.equal(lido.projects[0]?.id, "p1")
  })

  test("texto digitado inclusive vazio", async () => {
    ok(await bancoProva().ler())
    ok(
      await bancoProva().atualizarImpressora("k2-pro", {
        watts: "",
        energyPrice: "",
        printerPrice: "",
        lifeHours: "",
      })
    )
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          copies: "",
          hours: "",
          minutes: "",
          labor: "",
          colors: [{ id: "c1", name: "PLA", hex: "#111111", price: "", grams: "" }],
        })
      )
    )
    const lido = ok(await bancoProva().ler())
    const impressora = lido.printers.printers[0]
    assert.equal(impressora?.watts, "")
    assert.equal(impressora?.energyPrice, "")
    assert.equal(impressora?.printerPrice, "")
    assert.equal(impressora?.lifeHours, "")
    const salvo = lido.projects[0]
    assert.equal(salvo?.copies, "")
    assert.equal(salvo?.hours, "")
    assert.equal(salvo?.minutes, "")
    assert.equal(salvo?.labor, "")
    assert.equal(salvo?.colors[0]?.price, "")
    assert.equal(salvo?.colors[0]?.grams, "")
  })

  test("segunda gravacao do mesmo id", async () => {
    ok(await bancoProva().gravarProjeto(projeto({ name: "Um", copies: "1" })))
    ok(await bancoProva().gravarProjeto(projeto({ name: "Dois", copies: "8" })))
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects.length, 1)
    assert.equal(lido.projects[0]?.name, "Dois")
    assert.equal(lido.projects[0]?.copies, "8")
  })

  test("duplicar projeto", async () => {
    ok(await bancoProva().gravarProjeto(projeto()))
    ok(await bancoProva().duplicarProjeto("p1", "p2", 99))
    const lido = ok(await bancoProva().ler())
    const copia = lido.projects.find((item) => item.id === "p2")
    assert.ok(copia)
    assert.equal(copia?.name, "Suporte (cópia)")
    assert.deepEqual(
      copia?.colors.map((color) => color.id),
      ["c1"]
    )
    assert.equal(copia?.updatedAt, 99)
    assert.notEqual(copia?.updatedAt, 10)
  })

  test("apagar projeto zera as cores", async () => {
    ok(await bancoProva().gravarProjeto(projeto()))
    ok(await bancoProva().apagarProjeto("p1"))
    const lido = ok(await bancoProva().ler())
    assert.equal(
      lido.projects.some((item) => item.id === "p1"),
      false
    )
    const cores = await sql<{ n: number }>("SELECT count(*)::int AS n FROM cor WHERE projeto_id = $1", ["p1"])
    assert.equal(Number(cores.rows[0]?.n), 0)
  })

  test("remover ativa marca a primeira restante", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    ok(await banco.adicionarImpressora("a"))
    ok(await banco.adicionarImpressora("b"))
    ok(await banco.marcarImpressora("k2-pro"))
    ok(await banco.removerImpressora("k2-pro"))
    const lido = ok(await banco.ler())
    assert.equal(
      lido.printers.printers.some((item) => item.id === "k2-pro"),
      false
    )
    assert.equal(lido.printers.activeId, "a")
  })

  test("recusa apagar a ultima impressora", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    ok(await banco.removerImpressora("k2-pro"))
    const lido = ok(await banco.ler())
    assert.deepEqual(
      lido.printers.printers.map((item) => item.id),
      ["k2-pro"]
    )
  })

  test("nova impressora nasce zerada", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    ok(await banco.adicionarImpressora("nova"))
    const lido = ok(await banco.ler())
    const nova = lido.printers.printers.find((item) => item.id === "nova")
    assert.equal(lido.printers.activeId, "nova")
    assert.equal(nova?.name, "Nova impressora")
    assert.equal(nova?.watts, "")
    assert.equal(nova?.energyPrice, "")
    assert.equal(nova?.printerPrice, "")
    assert.equal(nova?.lifeHours, "")
  })

  test("rejeita projeto sem id ou mode", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    assert.equal((await banco.gravarProjeto({ name: "x", mode: "lote" })).status, "rejeitado")
    assert.equal((await banco.gravarProjeto({ id: "x", mode: "tabela", name: "x" })).status, "rejeitado")
    const linhas = await sql<{ n: number }>("SELECT count(*)::int AS n FROM projeto")
    assert.equal(Number(linhas.rows[0]?.n), 0)
  })

  test("projeto com impressora ausente", async () => {
    ok(await bancoProva().gravarProjeto(projeto({ printerId: "nao-existe" })))
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects[0]?.printerId, "nao-existe")
    assert.equal(
      lido.printers.printers.some((item) => item.id === "nao-existe"),
      false
    )
  })

  test("url projeto marca a impressora", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    ok(await banco.adicionarImpressora("ender"))
    ok(await banco.gravarProjeto(projeto({ printerId: "ender" })))
    ok(await banco.marcarImpressora("k2-pro"))
    ok(await banco.marcarImpressoraDoProjeto("p1"))
    const lido = ok(await banco.ler())
    assert.equal(lido.printers.activeId, "ender")
    const page = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8")
    assert.match(page, /marcarImpressoraDoProjeto\(/)
  })

  test("copia projetos da semente", async () => {
    ok(await bancoProva().ler())
    const lido = ok(
      await bancoProva().ler({
        impressora: null,
        projetos: serializeProjects([projeto({ name: "Copia" })]),
      })
    )
    assert.equal(lido.projects[0]?.name, "Copia")
    assert.equal(lido.printers.printers[0]?.id, "k2-pro")
  })

  test("copia impressoras da semente", async () => {
    ok(await bancoProva().ler())
    const loja: PrinterStore = {
      activeId: "ender",
      printers: [{ id: "ender", name: "Ender", watts: "9", energyPrice: "8", printerPrice: "7", lifeHours: "6" }],
    }
    const lido = ok(await bancoProva().ler({ impressora: serializePrinterStore(loja), projetos: null }))
    assert.equal(lido.printers.activeId, "ender")
    assert.equal(lido.printers.printers[0]?.name, "Ender")
    assert.equal(lido.projects.length, 0)
  })

  test("copia as duas chaves", async () => {
    ok(await bancoProva().ler())
    const loja: PrinterStore = {
      activeId: "ender",
      printers: [{ id: "ender", name: "Ender", watts: "9", energyPrice: "8", printerPrice: "7", lifeHours: "6" }],
    }
    const lido = ok(
      await bancoProva().ler({
        impressora: serializePrinterStore(loja),
        projetos: serializeProjects([projeto({ name: "Junto", printerId: "ender" })]),
      })
    )
    assert.equal(lido.printers.activeId, "ender")
    assert.equal(lido.projects[0]?.name, "Junto")
  })

  test("falha da copia mantem a semente", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    await sql(`CREATE OR REPLACE FUNCTION rejeita_falha_copia() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.name = 'falha-copia' THEN
    RAISE EXCEPTION 'falha copia';
  END IF;
  RETURN NULL;
END;
$$`)
    await sql(
      `CREATE CONSTRAINT TRIGGER rejeita_falha_copia
       AFTER INSERT ON projeto
       DEFERRABLE INITIALLY DEFERRED
       FOR EACH ROW
       EXECUTE FUNCTION rejeita_falha_copia()`
    )
    const loja: PrinterStore = {
      activeId: "outra",
      printers: [{ id: "outra", name: "Outra", watts: "1", energyPrice: "2", printerPrice: "3", lifeHours: "4" }],
    }
    ok(
      await banco.ler({
        impressora: serializePrinterStore(loja),
        projetos: serializeProjects([projeto({ name: "falha-copia" })]),
      })
    )
    const impressoras = await sql<{
      id: string
      name: string
      watts: string
      energy_price: string
      printer_price: string
      life_hours: string
    }>("SELECT id, name, watts, energy_price, printer_price, life_hours FROM impressora")
    assert.equal(impressoras.rows.length, 1)
    assert.equal(impressoras.rows[0]?.id, "k2-pro")
    assert.equal(impressoras.rows[0]?.name, "K2 Pro")
    assert.equal(impressoras.rows[0]?.watts, "150")
    assert.equal(impressoras.rows[0]?.energy_price, "1.18")
    assert.equal(impressoras.rows[0]?.printer_price, "7979")
    assert.equal(impressoras.rows[0]?.life_hours, "3000")
    const projetos = await sql<{ n: number }>("SELECT count(*)::int AS n FROM projeto")
    assert.equal(Number(projetos.rows[0]?.n), 0)
  })

  test("nao copia fora da semente", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    ok(await banco.atualizarImpressora("k2-pro", { name: "Editada" }))
    const loja: PrinterStore = {
      activeId: "x",
      printers: [{ id: "x", name: "Outra", watts: "1", energyPrice: "1", printerPrice: "1", lifeHours: "1" }],
    }
    const lido = ok(
      await banco.ler({
        impressora: serializePrinterStore(loja),
        projetos: serializeProjects([projeto()]),
      })
    )
    assert.equal(lido.printers.printers[0]?.name, "Editada")
    assert.equal(lido.projects.length, 0)
  })

  test("id duplicado fica o primeiro", async () => {
    ok(await bancoProva().ler())
    const bruto = JSON.stringify({
      version: 1,
      projects: [projeto({ name: "Primeiro", copies: "4" }), projeto({ name: "Segundo", copies: "9" })],
    })
    const lido = ok(await bancoProva().ler({ impressora: null, projetos: bruto }))
    assert.equal(lido.projects.length, 1)
    assert.equal(lido.projects[0]?.name, "Primeiro")
    assert.equal(lido.projects[0]?.copies, "4")
  })

  test("exatamente uma impressora ativa", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    ok(await banco.adicionarImpressora("ender"))
    const ativas = await sql<{ impressora_id: string }>("SELECT impressora_id FROM impressora_ativa")
    assert.equal(ativas.rows.length, 1)
    const ids = await sql<{ id: string }>("SELECT id FROM impressora")
    assert.equal(
      ids.rows.some((row) => row.id === ativas.rows[0]?.impressora_id),
      true
    )
  })

  test("impressoras na ordem de insercao", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    ok(await banco.adicionarImpressora("a"))
    ok(await banco.adicionarImpressora("b"))
    ok(await banco.atualizarImpressora("b", { name: "Beta" }))
    const lido = ok(await banco.ler())
    assert.deepEqual(
      lido.printers.printers.map((item) => item.id),
      ["k2-pro", "a", "b"]
    )
  })

  test("projetos por data e nome", async () => {
    const banco = bancoProva()
    ok(await banco.gravarProjeto(projeto({ id: "z", name: "zeta", updatedAt: 10 })))
    ok(await banco.gravarProjeto(projeto({ id: "a", name: "ação", updatedAt: 10 })))
    ok(await banco.gravarProjeto(projeto({ id: "u", name: "azul", updatedAt: 10 })))
    ok(await banco.gravarProjeto(projeto({ id: "n", name: "Novo", updatedAt: 50 })))
    const lido = ok(await banco.ler())
    assert.deepEqual(
      lido.projects.map((item) => item.name),
      ["Novo", "ação", "azul", "zeta"]
    )
  })

  test("duas gravacoes em paralelo", async () => {
    const banco = bancoProva()
    await Promise.all([
      banco.gravarProjeto(projeto({ id: "um", name: "Um" })),
      banco.gravarProjeto(projeto({ id: "dois", name: "Dois" })),
    ])
    const lido = ok(await banco.ler())
    assert.deepEqual(
      lido.projects.map((item) => item.id).sort(),
      ["dois", "um"]
    )
  })

  test("stdout banco indisponivel", async () => {
    const pedacos: string[] = []
    const original = process.stdout.write.bind(process.stdout)
    process.stdout.write = ((chunk: string | Uint8Array) => {
      pedacos.push(String(chunk))
      return true
    }) as typeof process.stdout.write
    try {
      const banco = abrirBanco("postgresql://custo:custo@127.0.0.1:1/custo_chapa")
      const resultado = await banco.ler()
      assert.equal(resultado.status, "erro")
      assert.match(pedacos.join(""), /banco indisponível/)
      await banco.fechar()
    } finally {
      process.stdout.write = original
    }
  })

  test("leitura e escrita sem cookie", async () => {
    const bancoSrc = fs.readFileSync(path.join(root, "src/lib/banco.ts"), "utf8")
    assert.equal(bancoSrc.includes("cookies("), false)
    const banco = abrirBanco(url)
    const gravado = await banco.gravarProjeto(projeto({ id: "sem-cookie", name: "Sem cookie" }))
    assert.notEqual(gravado.status, "ok")
    const lido = await banco.ler()
    assert.notEqual(lido.status, "ok")
  })

  test("duas remocoes simultaneas", async () => {
    const banco = bancoProva()
    ok(await banco.ler())
    ok(await banco.adicionarImpressora("segunda"))
    const antes = ok(await banco.ler())
    const ids = antes.printers.printers.map((item) => item.id)
    assert.equal(ids.length, 2)
    await Promise.all(ids.map((id) => banco.removerImpressora(id)))
    const depois = ok(await banco.ler())
    assert.ok(depois.printers.printers.length >= 1)
    assert.ok(depois.printers.printers.every((item) => ids.includes(item.id)))
  })

  test("id de cor no projeto", async () => {
    const banco = bancoProva()
    ok(await banco.gravarProjeto(projeto({ id: "a", colors: [{ id: "c1", name: "A", hex: "#111111", price: "1", grams: "1" }] })))
    ok(await banco.gravarProjeto(projeto({ id: "b", colors: [{ id: "c1", name: "B", hex: "#222222", price: "2", grams: "2" }] })))
    ok(
      await banco.gravarProjeto(
        projeto({
          id: "c",
          colors: [
            { id: "c1", name: "Primeira", hex: "#111111", price: "1", grams: "1" },
            { id: "c1", name: "Segunda", hex: "#333333", price: "3", grams: "3" },
          ],
        })
      )
    )
    const lido = ok(await banco.ler())
    const a = lido.projects.find((item) => item.id === "a")
    const b = lido.projects.find((item) => item.id === "b")
    const c = lido.projects.find((item) => item.id === "c")
    assert.equal(a?.colors[0]?.id, "c1")
    assert.equal(b?.colors[0]?.id, "c1")
    assert.equal(c?.colors.length, 1)
    assert.equal(c?.colors[0]?.name, "Primeira")
  })

  test("abre pela database url", async () => {
    const anterior = process.env.DATABASE_URL
    process.env.DATABASE_URL = url
    try {
      const banco = envolver(abrirBancoDoAmbiente())
      ok(await banco.gravarProjeto(projeto({ id: "via-env", name: "Via env" })))
      const lido = ok(await banco.ler())
      assert.equal(lido.projects.find((item) => item.id === "via-env")?.name, "Via env")
    } finally {
      if (anterior === undefined) delete process.env.DATABASE_URL
      else process.env.DATABASE_URL = anterior
    }
  })

  const mil = { watts: "1000", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }
  const cem = { watts: "100", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }

  function mesa(overrides: Partial<MesaDraft> = {}): MesaDraft {
    return { id: "m1", hours: "1", minutes: "0", name: "", hex: "#111111", price: "0", grams: "0", ...overrides }
  }

  async function usarImpressora(printer: { watts: string; energyPrice: string; printerPrice: string; lifeHours: string }) {
    ok(await bancoProva().ler())
    ok(
      await bancoProva().atualizarImpressora("k2-pro", {
        watts: printer.watts,
        energyPrice: printer.energyPrice,
        printerPrice: printer.printerPrice,
        lifeHours: printer.lifeHours,
      })
    )
  }

  function perto(atual: number | null, esperado: number) {
    assert.ok(atual !== null && Math.abs(atual - esperado) < 1e-9, `${atual} ~ ${esperado}`)
  }

  function precos(project: Project, printer: { watts: string; energyPrice: string; printerPrice: string; lifeHours: string }) {
    const result = calculate(draftToCalcInput(project, printer))
    return { piece: result.piece.total, lot: result.lot.total }
  }

  async function contagem(tabela: string, projetoId?: string) {
    const filtro = projetoId ? " WHERE projeto_id = $1" : ""
    const linhas = await sql<{ n: number }>(`SELECT count(*)::int AS n FROM ${tabela}${filtro}`, projetoId ? [projetoId] : [])
    return Number(linhas.rows[0]?.n)
  }

  test("abre mesas por posicao", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          copies: "1",
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [
            mesa({ id: "a", hours: "1", minutes: "0", name: "PLA preto", hex: "#111111", price: "100", grams: "10" }),
            mesa({ id: "b", hours: "2", minutes: "15", name: "PETG", hex: "#222222", price: "80", grams: "20" }),
          ],
        })
      )
    )
    const lido = ok(await bancoProva().ler())
    const mesas = lido.projects[0]?.mesas ?? []
    assert.equal(mesas[0]?.name, "PLA preto")
    assert.equal(mesas[1]?.name, "PETG")
    assert.equal(mesas[0]?.hours, "1")
    assert.equal(mesas[0]?.minutes, "0")
    assert.equal(mesas[0]?.hex, "#111111")
    assert.equal(mesas[0]?.price, "100")
    assert.equal(mesas[0]?.grams, "10")
    assert.equal(mesas[1]?.hours, "2")
    assert.equal(mesas[1]?.minutes, "15")
    assert.equal(mesas[1]?.hex, "#222222")
    assert.equal(mesas[1]?.price, "80")
    assert.equal(mesas[1]?.grams, "20")
  })

  test("varias cores nao grava mesa", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          hours: "1",
          minutes: "0",
          colorMode: "multicolor",
          grams: "",
          colors: [
            { id: "c1", name: "PLA", hex: "#111111", price: "100", grams: "10" },
            { id: "c2", name: "PETG", hex: "#222222", price: "80", grams: "20" },
          ],
        })
      )
    )
    const resultado = await bancoProva().adicionarMesa("p1", "nova")
    assert.equal(resultado.status, "recusado")
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects[0]?.hours, "1")
    assert.equal(await contagem("cor", "p1"), 2)
    assert.equal(await contagem("mesa", "p1"), 0)
  })

  test("primeira mesa e a mesa vazia", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          mode: "peca",
          copies: "1",
          hours: "1",
          minutes: "0",
          grams: "10",
          colorMode: "unica",
          colors: [{ id: "c1", name: "PLA preto", hex: "#111111", price: "100", grams: "10" }],
        })
      )
    )
    ok(await bancoProva().adicionarMesa("p1", "vazia"))
    const lido = ok(await bancoProva().ler())
    const salvo = lido.projects[0]
    assert.equal(salvo?.mesas?.[0]?.hours, "1")
    assert.equal(salvo?.mesas?.[0]?.minutes, "0")
    assert.equal(salvo?.mesas?.[0]?.grams, "10")
    assert.equal(salvo?.mesas?.[0]?.name, "PLA preto")
    assert.equal(salvo?.mesas?.[0]?.hex, "#111111")
    assert.equal(salvo?.mesas?.[0]?.price, "100")
    assert.equal(salvo?.mesas?.[1]?.hours, "")
    assert.equal(salvo?.mesas?.[1]?.minutes, "")
    assert.equal(salvo?.mesas?.[1]?.name, "")
    assert.equal(salvo?.mesas?.[1]?.price, "")
    assert.equal(salvo?.mesas?.[1]?.grams, "")
    assert.equal(salvo?.mesas?.[1]?.hex, "#57534e")
    assert.equal(salvo?.colors.length, 0)
    assert.equal(salvo?.hours, "")
    assert.equal(salvo?.minutes, "")
    assert.equal(salvo?.grams, "")
  })

  test("volta a peca 2.52", async () => {
    await usarImpressora(cem)
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          mode: "peca",
          copies: "1",
          hours: "1",
          minutes: "0",
          grams: "10",
          labor: "20",
          colors: [{ id: "c1", name: "PLA", hex: "#111111", price: "100", grams: "10" }],
        })
      )
    )
    ok(await bancoProva().adicionarMesa("p1", "vazia"))
    ok(await bancoProva().removerMesa("p1", "vazia"))
    const lido = ok(await bancoProva().ler())
    const salvo = lido.projects[0]
    assert.ok(salvo)
    assert.equal(salvo.mode, "peca")
    assert.equal(salvo.hours, "1")
    assert.equal(salvo.minutes, "0")
    assert.equal(salvo.grams, "10")
    assert.equal(salvo.colors.length, 1)
    assert.equal(salvo.mesas?.length, 0)
    const valores = precos(salvo, cem)
    perto(valores.piece, 2.52)
    perto(valores.lot, 2.52)
  })

  test("remove mesa aberta e mantem as fechadas", async () => {
    await usarImpressora(mil)
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          copies: "1",
          labor: "0",
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [mesa({ id: "a" }), mesa({ id: "b" }), mesa({ id: "aberta", price: "" })],
        })
      )
    )
    ok(await bancoProva().removerMesa("p1", "aberta"))
    const lido = ok(await bancoProva().ler())
    const salvo = lido.projects[0]
    assert.ok(salvo)
    assert.equal(salvo.mesas?.length, 2)
    const valores = precos(salvo, mil)
    assert.equal(valores.piece, 4)
    assert.equal(valores.lot, 4)
  })

  test("lote vira mesa com copias 4", async () => {
    await usarImpressora(cem)
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          mode: "lote",
          copies: "4",
          hours: "1",
          minutes: "0",
          grams: "10",
          labor: "20",
          colors: [{ id: "c1", name: "PLA", hex: "#111111", price: "100", grams: "10" }],
        })
      )
    )
    ok(await bancoProva().adicionarMesa("p1", "vazia"))
    ok(await bancoProva().removerMesa("p1", "vazia"))
    const lido = ok(await bancoProva().ler())
    const salvo = lido.projects[0]
    assert.ok(salvo)
    assert.equal(salvo.mesas?.length, 1)
    assert.equal(salvo.copies, "4")
    const valores = precos(salvo, cem)
    perto(valores.piece, 2.52)
    perto(valores.lot, 10.08)
  })

  test("remove mesa fechada e recalcula", async () => {
    await usarImpressora(mil)
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          copies: "1",
          labor: "0",
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [mesa({ id: "a" }), mesa({ id: "b" })],
        })
      )
    )
    ok(await bancoProva().removerMesa("p1", "b"))
    const lido = ok(await bancoProva().ler())
    const salvo = lido.projects[0]
    assert.ok(salvo)
    const valores = precos(salvo, mil)
    assert.equal(valores.piece, 2)
    assert.equal(valores.lot, 2)
  })

  test("uma mesa com copias 1 vira impressao", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          copies: "1",
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [
            mesa({ id: "fica", hours: "1", minutes: "30", grams: "10", name: "PLA preto", hex: "#111111", price: "100" }),
            mesa({ id: "sai" }),
          ],
        })
      )
    )
    ok(await bancoProva().removerMesa("p1", "sai"))
    const lido = ok(await bancoProva().ler())
    const salvo = lido.projects[0]
    assert.equal(salvo?.mode, "peca")
    assert.equal(salvo?.colorMode, "unica")
    assert.equal(salvo?.hours, "1")
    assert.equal(salvo?.minutes, "30")
    assert.equal(salvo?.grams, "10")
    assert.equal(salvo?.colors.length, 1)
    assert.equal(salvo?.colors[0]?.name, "PLA preto")
    assert.equal(salvo?.colors[0]?.hex, "#111111")
    assert.equal(salvo?.colors[0]?.price, "100")
    assert.equal(salvo?.mesas?.length, 0)
    assert.equal(await contagem("mesa", "p1"), 0)
  })

  test("gravar mesas limpa cor", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          mode: "lote",
          hours: "9",
          minutes: "9",
          grams: "9",
          colorMode: "multicolor",
          colors: [
            { id: "c1", name: "A", hex: "#111111", price: "1", grams: "1" },
            { id: "c2", name: "B", hex: "#222222", price: "2", grams: "2" },
          ],
          mesas: [mesa({ id: "a" }), mesa({ id: "b" })],
        })
      )
    )
    const lido = ok(await bancoProva().ler())
    const salvo = lido.projects[0]
    assert.equal(salvo?.hours, "")
    assert.equal(salvo?.minutes, "")
    assert.equal(salvo?.grams, "")
    assert.equal(salvo?.mode, "peca")
    assert.equal(salvo?.colorMode, "unica")
    assert.equal(await contagem("cor", "p1"), 0)
    assert.equal(await contagem("mesa", "p1"), 2)
  })

  test("falha ao gravar mesas volta o projeto", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          hours: "1",
          minutes: "0",
          colors: [{ id: "c1", name: "PLA", hex: "#111111", price: "100", grams: "10" }],
        })
      )
    )
    await sql(`CREATE OR REPLACE FUNCTION rejeita_mesa() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'falha mesa';
END;
$$`)
    await sql(
      `CREATE TRIGGER rejeita_mesa BEFORE INSERT ON mesa FOR EACH ROW EXECUTE FUNCTION rejeita_mesa()`
    )
    await assert.rejects(bancoProva().gravarProjeto(projeto({ hours: "", minutes: "", grams: "", colors: [], mesas: [mesa()] })))
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects[0]?.hours, "1")
    assert.equal(lido.projects[0]?.minutes, "0")
    assert.equal(await contagem("cor", "p1"), 1)
    assert.equal(await contagem("mesa", "p1"), 0)
  })

  test("gravacao atrasada nao commita", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          updatedAt: 20,
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [mesa({ id: "a" }), mesa({ id: "b" })],
        })
      )
    )
    ok(
      await bancoProva().gravarProjeto({
        ...projeto({
          updatedAt: 30,
          colorMode: "multicolor",
          colors: [
            { id: "c1", name: "A", hex: "#111111", price: "1", grams: "1" },
            { id: "c2", name: "B", hex: "#222222", price: "2", grams: "2" },
          ],
          mesas: [],
        }),
        expectedUpdatedAt: 10,
      })
    )
    let lido = ok(await bancoProva().ler())
    assert.equal(await contagem("mesa", "p1"), 2)
    assert.equal(await contagem("cor", "p1"), 0)
    assert.equal(lido.projects[0]?.updatedAt, 20)

    ok(await bancoProva().apagarProjeto("p1"))
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          updatedAt: 20,
          colorMode: "multicolor",
          colors: [
            { id: "c1", name: "A", hex: "#111111", price: "1", grams: "1" },
            { id: "c2", name: "B", hex: "#222222", price: "2", grams: "2" },
          ],
        })
      )
    )
    ok(
      await bancoProva().gravarProjeto({
        ...projeto({
          updatedAt: 30,
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [mesa({ id: "a" }), mesa({ id: "b" })],
        }),
        expectedUpdatedAt: 10,
      })
    )
    lido = ok(await bancoProva().ler())
    assert.equal(await contagem("cor", "p1"), 2)
    assert.equal(await contagem("mesa", "p1"), 0)
    assert.equal(lido.projects[0]?.updatedAt, 20)
  })

  test("duplicar projeto de mesas", async () => {
    await usarImpressora(mil)
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          name: "Suporte",
          copies: "2",
          labor: "0",
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [mesa({ id: "a" }), mesa({ id: "b" })],
        })
      )
    )
    ok(await bancoProva().duplicarProjeto("p1", "p2", 99))
    const lido = ok(await bancoProva().ler())
    const copia = lido.projects.find((item) => item.id === "p2")
    assert.ok(copia)
    assert.equal(copia.name, "Suporte (cópia)")
    assert.notEqual(copia.id, "p1")
    const valores = precos(copia, mil)
    assert.equal(valores.piece, 4)
    assert.equal(valores.lot, 8)
  })

  test("apagar projeto apaga mesas", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({ id: "a", hours: "", minutes: "", grams: "", colors: [], mesas: [mesa({ id: "a1" }), mesa({ id: "a2" })] })
      )
    )
    ok(
      await bancoProva().gravarProjeto(
        projeto({ id: "b", hours: "", minutes: "", grams: "", colors: [], mesas: [mesa({ id: "b1" })] })
      )
    )
    ok(await bancoProva().apagarProjeto("a"))
    assert.equal(await contagem("mesa", "a"), 0)
    assert.equal(await contagem("mesa", "b"), 1)
  })

  test("tabela mesa nasce vazia", async () => {
    ok(await bancoProva().gravarProjeto(projeto({ hours: "2", minutes: "15" })))
    await sql("DROP TABLE mesa")
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects[0]?.hours, "2")
    assert.equal(lido.projects[0]?.minutes, "15")
    assert.equal(lido.projects[0]?.colors.length, 1)
    assert.equal(await contagem("mesa"), 0)
  })

  test("projeto ausente nao ganha mesa", async () => {
    ok(await bancoProva().ler())
    ok(await bancoProva().adicionarMesa("ausente", "nova"))
    const projetos = await sql<{ n: number }>("SELECT count(*)::int AS n FROM projeto WHERE id = $1", ["ausente"])
    assert.equal(Number(projetos.rows[0]?.n), 0)
    assert.equal(await contagem("mesa"), 0)
  })

  test("salvar impressao ausente cria id", async () => {
    const id = idAoSalvar("ausente", true, "criado")
    assert.notEqual(id, "ausente")
    ok(await bancoProva().gravarProjeto(projeto({ id, mesas: [] })))
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects.some((item) => item.id === "ausente"), false)
    assert.equal(lido.projects.some((item) => item.id === id), true)
    assert.equal(await contagem("mesa", id), 0)
    assert.match(fs.readFileSync(path.join(root, "src/components/calculadora.tsx"), "utf8"), /idAoSalvar/)
  })

  test("id de mesa unico no projeto", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          copies: "2",
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [mesa({ id: "placa", hours: "1" }), mesa({ id: "placa", hours: "2" })],
        })
      )
    )
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects[0]?.mesas?.length, 1)
    assert.equal(lido.projects[0]?.mesas?.[0]?.hours, "1")
  })

  test("mesmo id de mesa em dois projetos", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({ id: "a", hours: "", minutes: "", grams: "", colors: [], mesas: [mesa({ id: "placa", hours: "1" })] })
      )
    )
    ok(
      await bancoProva().gravarProjeto(
        projeto({ id: "b", hours: "", minutes: "", grams: "", colors: [], mesas: [mesa({ id: "placa", hours: "2" })] })
      )
    )
    assert.equal(await contagem("mesa", "a"), 1)
    assert.equal(await contagem("mesa", "b"), 1)
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects.find((item) => item.id === "a")?.mesas?.[0]?.hours, "1")
    assert.equal(lido.projects.find((item) => item.id === "b")?.mesas?.[0]?.hours, "2")
  })

  test("nome de mesa vazio gravado", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          copies: "2",
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          mesas: [mesa({ name: "" })],
        })
      )
    )
    const lido = ok(await bancoProva().ler())
    assert.equal(lido.projects[0]?.mesas?.[0]?.name, "")
  })

  test("tarifa nova nao regrava o projeto", async () => {
    await usarImpressora(mil)
    ok(
      await bancoProva().gravarProjeto(
        projeto({
          copies: "1",
          labor: "0",
          hours: "",
          minutes: "",
          grams: "",
          colors: [],
          updatedAt: 10,
          mesas: [mesa({ id: "a" }), mesa({ id: "b" })],
        })
      )
    )
    const antes = ok(await bancoProva().ler())
    const projetoAntes = antes.projects[0]
    assert.ok(projetoAntes)
    assert.equal(precos(projetoAntes, mil).lot, 4)
    ok(await bancoProva().atualizarImpressora("k2-pro", { energyPrice: "2" }))
    const depois = ok(await bancoProva().ler())
    const projetoDepois = depois.projects[0]
    assert.ok(projetoDepois)
    assert.equal(projetoDepois.updatedAt, projetoAntes.updatedAt)
    assert.equal(precos(projetoDepois, { ...mil, energyPrice: "2" }).lot, 6)
  })

  test("tabela mesa no schema", async () => {
    ok(await bancoProva().ler())
    const colunas = await sql<{ column_name: string; data_type: string; is_nullable: string }>(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'mesa'
       ORDER BY ordinal_position`
    )
    assert.deepEqual(
      colunas.rows.map((row) => row.column_name),
      ["projeto_id", "id", "hours", "minutes", "name", "hex", "price", "grams", "posicao"]
    )
    for (const row of colunas.rows) {
      assert.equal(row.is_nullable, "NO", row.column_name)
      assert.equal(row.data_type, row.column_name === "posicao" ? "integer" : "text", row.column_name)
    }
    const chaves = await sql<{ def: string }>(
      "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = 'mesa'::regclass"
    )
    const texto = chaves.rows.map((row) => row.def).join("\n")
    assert.match(texto, /PRIMARY KEY \(projeto_id, id\)/)
    assert.match(texto, /REFERENCES projeto\(id\) ON DELETE CASCADE/)
    const projetoCols = await sql<{ column_name: string }>(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projeto'"
    )
    assert.deepEqual(
      projetoCols.rows.map((row) => row.column_name).sort(),
      ["color_mode", "conta_id", "copies", "grams", "hours", "id", "labor", "minutes", "mode", "name", "printer_id", "updated_at"]
    )
  })

  test("payload sem mesas apaga mesa", async () => {
    ok(
      await bancoProva().gravarProjeto(
        projeto({ id: "a", hours: "", minutes: "", grams: "", colors: [], mesas: [mesa({ id: "a1" }), mesa({ id: "a2" })] })
      )
    )
    ok(
      await bancoProva().gravarProjeto(
        projeto({ id: "b", hours: "", minutes: "", grams: "", colors: [], mesas: [mesa({ id: "b1" })] })
      )
    )
    ok(await bancoProva().gravarProjeto(projeto({ id: "a", mesas: [] })))
    assert.equal(await contagem("mesa", "a"), 0)
    assert.equal(await contagem("mesa", "b"), 1)
  })

  test("primeira conta fica com as linhas", async () => {
    await sql("DROP TABLE IF EXISTS sessao, impressora_ativa, cor, mesa, projeto, impressora, conta CASCADE")
    await sql(
      `CREATE TABLE impressora (
         id text PRIMARY KEY,
         name text NOT NULL,
         watts text NOT NULL,
         energy_price text NOT NULL,
         printer_price text NOT NULL,
         life_hours text NOT NULL,
         posicao integer NOT NULL
       )`
    )
    await sql(
      `CREATE TABLE impressora_ativa (
         unico smallint PRIMARY KEY CHECK (unico = 1),
         impressora_id text NOT NULL REFERENCES impressora (id)
       )`
    )
    await sql(
      `CREATE TABLE projeto (
         id text PRIMARY KEY,
         name text NOT NULL,
         printer_id text NOT NULL,
         mode text NOT NULL CHECK (mode IN ('peca', 'lote')),
         copies text NOT NULL,
         hours text NOT NULL,
         minutes text NOT NULL,
         labor text NOT NULL,
         updated_at double precision NOT NULL
       )`
    )
    await sql(
      `CREATE TABLE mesa (
         projeto_id text NOT NULL REFERENCES projeto (id) ON DELETE CASCADE,
         id text NOT NULL,
         hours text NOT NULL,
         minutes text NOT NULL,
         name text NOT NULL,
         hex text NOT NULL,
         price text NOT NULL,
         grams text NOT NULL,
         posicao integer NOT NULL,
         PRIMARY KEY (projeto_id, id)
       )`
    )
    await sql(
      `CREATE TABLE cor (
         projeto_id text NOT NULL REFERENCES projeto (id) ON DELETE CASCADE,
         id text NOT NULL,
         name text NOT NULL,
         hex text NOT NULL,
         price text NOT NULL,
         grams text NOT NULL,
         posicao integer NOT NULL,
         PRIMARY KEY (projeto_id, id)
       )`
    )
    await sql(
      "INSERT INTO impressora (id, name, watts, energy_price, printer_price, life_hours, posicao) VALUES ('k2-pro', 'K2 Pro', '150', '1.18', '7979', '3000', 0)"
    )
    await sql("INSERT INTO impressora_ativa (unico, impressora_id) VALUES (1, 'k2-pro')")
    await sql(
      "INSERT INTO projeto (id, name, printer_id, mode, copies, hours, minutes, labor, updated_at) VALUES ('ja', 'Lote antigo', 'k2-pro', 'lote', '1', '1', '0', '0', 10)"
    )
    await sql(
      "INSERT INTO mesa (projeto_id, id, hours, minutes, name, hex, price, grams, posicao) VALUES ('ja', 'm1', '1', '0', 'PLA', '#111111', '1', '1', 0)"
    )
    await sql(
      "INSERT INTO cor (projeto_id, id, name, hex, price, grams, posicao) VALUES ('ja', 'c1', 'PLA', '#111111', '1', '1', 0)"
    )
    const criada = await abrirBanco(url).garantirPrimeiraConta("segredo-inicial")
    assert.equal(criada.status, "criada")
    if (criada.status !== "criada") return
    const contas = await sql<{ email: string; papel: string; n: number }>(
      "SELECT email, papel, count(*)::int AS n FROM conta GROUP BY email, papel"
    )
    assert.equal(contas.rows.length, 1)
    assert.equal(contas.rows[0]?.email, "pablorgds@gmail.com")
    assert.equal(contas.rows[0]?.papel, "admin")
    const impressoras = await sql<{ conta_id: string }>("SELECT conta_id FROM impressora")
    assert.equal(impressoras.rows[0]?.conta_id, criada.id)
    const projetos = await sql<{ conta_id: string }>("SELECT conta_id FROM projeto")
    assert.equal(projetos.rows[0]?.conta_id, criada.id)
  })

  test("mesa e cor seguem o projeto", async () => {
    await sql("DROP TABLE IF EXISTS sessao, impressora_ativa, cor, mesa, projeto, impressora, conta CASCADE")
    await sql(
      `CREATE TABLE impressora (
         id text PRIMARY KEY, name text NOT NULL, watts text NOT NULL, energy_price text NOT NULL,
         printer_price text NOT NULL, life_hours text NOT NULL, posicao integer NOT NULL
       )`
    )
    await sql(
      `CREATE TABLE impressora_ativa (
         unico smallint PRIMARY KEY CHECK (unico = 1),
         impressora_id text NOT NULL REFERENCES impressora (id)
       )`
    )
    await sql(
      `CREATE TABLE projeto (
         id text PRIMARY KEY, name text NOT NULL, printer_id text NOT NULL,
         mode text NOT NULL CHECK (mode IN ('peca', 'lote')),
         copies text NOT NULL, hours text NOT NULL, minutes text NOT NULL, labor text NOT NULL,
         updated_at double precision NOT NULL
       )`
    )
    await sql(
      `CREATE TABLE mesa (
         projeto_id text NOT NULL REFERENCES projeto (id) ON DELETE CASCADE,
         id text NOT NULL, hours text NOT NULL, minutes text NOT NULL, name text NOT NULL,
         hex text NOT NULL, price text NOT NULL, grams text NOT NULL, posicao integer NOT NULL,
         PRIMARY KEY (projeto_id, id)
       )`
    )
    await sql(
      `CREATE TABLE cor (
         projeto_id text NOT NULL REFERENCES projeto (id) ON DELETE CASCADE,
         id text NOT NULL, name text NOT NULL, hex text NOT NULL, price text NOT NULL,
         grams text NOT NULL, posicao integer NOT NULL, PRIMARY KEY (projeto_id, id)
       )`
    )
    await sql("INSERT INTO impressora (id, name, watts, energy_price, printer_price, life_hours, posicao) VALUES ('k2-pro', 'K2 Pro', '150', '1.18', '7979', '3000', 0)")
    await sql("INSERT INTO impressora_ativa (unico, impressora_id) VALUES (1, 'k2-pro')")
    await sql("INSERT INTO projeto (id, name, printer_id, mode, copies, hours, minutes, labor, updated_at) VALUES ('ja', 'Lote antigo', 'k2-pro', 'lote', '1', '1', '0', '0', 10)")
    await sql("INSERT INTO mesa (projeto_id, id, hours, minutes, name, hex, price, grams, posicao) VALUES ('ja', 'm1', '1', '0', 'PLA', '#111111', '1', '1', 0)")
    await sql("INSERT INTO cor (projeto_id, id, name, hex, price, grams, posicao) VALUES ('ja', 'c1', 'PLA', '#111111', '1', '1', 0)")
    const antesMesa = await sql<{ n: number }>("SELECT count(*)::int AS n FROM mesa")
    const antesCor = await sql<{ n: number }>("SELECT count(*)::int AS n FROM cor")
    await abrirBanco(url).garantirPrimeiraConta("segredo-inicial")
    const depoisMesa = await sql<{ n: number }>("SELECT count(*)::int AS n FROM mesa")
    const depoisCor = await sql<{ n: number }>("SELECT count(*)::int AS n FROM cor")
    assert.equal(Number(depoisMesa.rows[0]?.n), Number(antesMesa.rows[0]?.n))
    assert.equal(Number(depoisCor.rows[0]?.n), Number(antesCor.rows[0]?.n))
    assert.equal(Number(depoisMesa.rows[0]?.n), 1)
    assert.equal(Number(depoisCor.rows[0]?.n), 1)
  })

  test("senha admin ausente vazia ou curta", async () => {
    for (const senha of [undefined, "", "1234567"] as const) {
      await sql("TRUNCATE sessao, impressora_ativa, cor, mesa, projeto, impressora, conta")
      const resultado = await abrirBanco(url).garantirPrimeiraConta(senha)
      assert.equal(resultado.status, "senha-ruim")
      const n = await sql<{ n: number }>("SELECT count(*)::int AS n FROM conta")
      assert.equal(Number(n.rows[0]?.n), 0)
    }
  })

  test("senha scrypt sem o texto", async () => {
    const { scrypt, timingSafeEqual } = await import("node:crypto")
    const { promisify: promisificar } = await import("node:util")
    const derivar = promisificar(scrypt)
    const linha = await sql<{ sal: Buffer; verificador: Buffer; email: string }>(
      "SELECT sal, verificador, email FROM conta WHERE email = 'pablorgds@gmail.com'"
    )
    const sal = linha.rows[0]?.sal
    const verificador = linha.rows[0]?.verificador
    assert.ok(sal)
    assert.ok(verificador)
    assert.equal(sal.length, 16)
    assert.equal(verificador.length, 32)
    const calculado = (await derivar("segredo-inicial", sal, 32, { N: 16384, r: 8, p: 1 })) as Buffer
    assert.equal(timingSafeEqual(calculado, verificador), true)
    assert.equal(JSON.stringify(linha.rows).includes("segredo-inicial"), false)
  })

  test("conta nova nasce k2 pro", async () => {
    const criada = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(criada.status, "criada")
    if (criada.status !== "criada") return
    const email = await sql<{ email: string }>("SELECT email FROM conta WHERE id = $1", [criada.id])
    assert.equal(email.rows[0]?.email, "outra@example.com")
    const lido = ok(await comConta(criada.id, () => abrirBanco(url).ler()))
    assert.equal(lido.printers.printers.length, 1)
    assert.equal(lido.printers.printers[0]?.id, "k2-pro")
    assert.equal(lido.printers.printers[0]?.name, "K2 Pro")
    assert.equal(lido.printers.printers[0]?.watts, "150")
    assert.equal(lido.printers.printers[0]?.energyPrice, "1.18")
    assert.equal(lido.printers.printers[0]?.printerPrice, "7979")
    assert.equal(lido.printers.printers[0]?.lifeHours, "3000")
    assert.equal(lido.projects.length, 0)
  })

  test("email duplicado uma conta", async () => {
    assert.equal((await abrirBanco(url).criarConta("outra@example.com", "senha-oito")).status, "criada")
    assert.equal((await abrirBanco(url).criarConta("Outra@Example.com", "senha-oito")).status, "duplicado")
    const n = await sql<{ n: number }>("SELECT count(*)::int AS n FROM conta WHERE lower(email) = 'outra@example.com'")
    assert.equal(Number(n.rows[0]?.n), 1)
  })

  test("senha 7 nao cria conta", async () => {
    assert.equal((await abrirBanco(url).criarConta("curta@example.com", "1234567")).status, "senha-curta")
    const n = await sql<{ n: number }>("SELECT count(*)::int AS n FROM conta WHERE email = 'curta@example.com'")
    assert.equal(Number(n.rows[0]?.n), 0)
  })

  test("senha 8 cria conta", async () => {
    assert.equal((await abrirBanco(url).criarConta("oito@example.com", "12345678")).status, "criada")
    const n = await sql<{ n: number }>("SELECT count(*)::int AS n FROM conta WHERE email = 'oito@example.com'")
    assert.equal(Number(n.rows[0]?.n), 1)
  })

  test("email sem arroba nao cria conta", async () => {
    assert.equal((await abrirBanco(url).criarConta("sem-arroba", "senha-oito")).status, "email-invalido")
    const n = await sql<{ n: number }>("SELECT count(*)::int AS n FROM conta WHERE email = 'sem-arroba'")
    assert.equal(Number(n.rows[0]?.n), 0)
  })

  test("rollback nao deixa conta nem impressora", async () => {
    await sql(`CREATE OR REPLACE FUNCTION rejeita_conta_nova() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'rollback conta';
END;
$$`)
    await sql("CREATE TRIGGER rejeita_conta_nova BEFORE INSERT ON impressora FOR EACH ROW EXECUTE FUNCTION rejeita_conta_nova()")
    await assert.rejects(() => abrirBanco(url).criarConta("nova@example.com", "senha-oito"))
    const contas = await sql<{ n: number }>("SELECT count(*)::int AS n FROM conta WHERE email = 'nova@example.com'")
    assert.equal(Number(contas.rows[0]?.n), 0)
    const impressoras = await sql<{ n: number }>(
      "SELECT count(*)::int AS n FROM impressora i JOIN conta c ON c.id = i.conta_id WHERE c.email = 'nova@example.com'"
    )
    assert.equal(Number(impressoras.rows[0]?.n), 0)
  })

  test("dois cadastros do mesmo email", async () => {
    const resultados = await Promise.all([
      abrirBanco(url).criarConta("dup@example.com", "senha-oito"),
      abrirBanco(url).criarConta("dup@example.com", "senha-oito"),
    ])
    assert.equal(resultados.filter((item) => item.status === "criada").length, 1)
    const n = await sql<{ n: number }>("SELECT count(*)::int AS n FROM conta WHERE email = 'dup@example.com'")
    assert.equal(Number(n.rows[0]?.n), 1)
  })

  test("copia do navegador so no admin", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    const lido = ok(
      await comConta(contaIdProva, () =>
        abrirBanco(url).ler({ impressora: null, projetos: serializeProjects([projeto({ name: "Do navegador" })]) })
      )
    )
    assert.equal(lido.projects.some((item) => item.name === "Do navegador"), true)
    const daOutra = ok(await comConta(outra.id, () => abrirBanco(url).ler()))
    assert.equal(daOutra.projects.some((item) => item.name === "Do navegador"), false)
  })

  test("conta nova nao copia o navegador", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    const lido = ok(
      await comConta(outra.id, () =>
        abrirBanco(url).ler({
          impressora: null,
          projetos: serializeProjects([projeto({ id: "nav", name: "Nao copia" })]),
        })
      )
    )
    assert.equal(lido.projects.length, 0)
    assert.equal(lido.printers.printers[0]?.name, "K2 Pro")
  })

  test("leitura so os projetos da conta", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    ok(await comConta(outra.id, () => abrirBanco(url).gravarProjeto(projeto({ id: "so", name: "Só da outra" }))))
    ok(await comConta(contaIdProva, () => abrirBanco(url).gravarProjeto(projeto({ id: "meu", name: "Meu" }))))
    const lido = ok(await comConta(outra.id, () => abrirBanco(url).ler()))
    assert.deepEqual(lido.projects.map((item) => item.name), ["Só da outra"])
  })

  test("admin nao le projeto da outra", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    ok(await comConta(outra.id, () => abrirBanco(url).gravarProjeto(projeto({ id: "so", name: "Só da outra" }))))
    const lido = ok(await comConta(contaIdProva, () => abrirBanco(url).ler()))
    assert.equal(lido.projects.some((item) => item.name === "Só da outra"), false)
  })

  test("projeto alheio nao troca a marcada", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    ok(await comConta(outra.id, () => abrirBanco(url).gravarProjeto(projeto({ id: "alheio", name: "Alheio", printerId: "k2-pro" }))))
    const antes = ok(await comConta(outra.id, () => abrirBanco(url).ler()))
    ok(await comConta(contaIdProva, () => abrirBanco(url).adicionarImpressora("ender")))
    ok(await comConta(contaIdProva, () => abrirBanco(url).marcarImpressora("ender")))
    ok(await comConta(contaIdProva, () => abrirBanco(url).marcarImpressoraDoProjeto("alheio")))
    const depois = ok(await comConta(outra.id, () => abrirBanco(url).ler()))
    assert.equal(depois.printers.activeId, antes.printers.activeId)
  })

  test("escrita nao altera impressora alheia", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    ok(await comConta(contaIdProva, () => abrirBanco(url).atualizarImpressora("k2-pro", { name: "Minha", watts: "9", energyPrice: "8", printerPrice: "7", lifeHours: "6" })))
    const lido = ok(await comConta(outra.id, () => abrirBanco(url).ler()))
    const printer = lido.printers.printers[0]
    assert.equal(printer?.name, "K2 Pro")
    assert.equal(printer?.watts, "150")
    assert.equal(printer?.energyPrice, "1.18")
    assert.equal(printer?.printerPrice, "7979")
    assert.equal(printer?.lifeHours, "3000")
  })

  test("save nao toma projeto alheio", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    ok(await comConta(outra.id, () => abrirBanco(url).gravarProjeto(projeto({ id: "alheio", name: "Deles" }))))
    ok(await comConta(contaIdProva, () => abrirBanco(url).gravarProjeto(projeto({ id: "alheio", name: "Roubado" }))))
    const deles = ok(await comConta(outra.id, () => abrirBanco(url).ler()))
    assert.equal(deles.projects[0]?.name, "Deles")
    const meu = ok(await comConta(contaIdProva, () => abrirBanco(url).ler()))
    assert.equal(meu.projects.some((item) => item.id === "alheio"), false)
  })

  test("uma impressora marcada por conta", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    ok(await comConta(contaIdProva, () => abrirBanco(url).adicionarImpressora("ender")))
    const ativas = await sql<{ conta_id: string; impressora_id: string }>("SELECT conta_id, impressora_id FROM impressora_ativa")
    const porConta = new Map<string, string[]>()
    for (const row of ativas.rows) {
      const lista = porConta.get(row.conta_id) ?? []
      lista.push(row.impressora_id)
      porConta.set(row.conta_id, lista)
    }
    assert.equal(porConta.size, 2)
    for (const [contaId, ids] of porConta) {
      assert.equal(ids.length, 1)
      const dona = await sql<{ n: number }>("SELECT count(*)::int AS n FROM impressora WHERE conta_id = $1 AND id = $2", [contaId, ids[0]])
      assert.equal(Number(dona.rows[0]?.n), 1)
    }
  })

  test("duas contas com k2-pro", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    const linhas = await sql<{ n: number }>("SELECT count(*)::int AS n FROM impressora WHERE id = 'k2-pro'")
    assert.equal(Number(linhas.rows[0]?.n), 2)
  })

  test("nao apaga a ultima impressora da conta", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    if (outra.status !== "criada") return
    ok(await comConta(contaIdProva, () => abrirBanco(url).adicionarImpressora("ender")))
    ok(await comConta(outra.id, () => abrirBanco(url).removerImpressora("k2-pro")))
    const lido = ok(await comConta(outra.id, () => abrirBanco(url).ler()))
    assert.ok(lido.printers.printers.length >= 1)
  })

  test("primeiro clique nao muda a senha", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    const antes = await sql<{ verificador: Buffer }>("SELECT verificador FROM conta WHERE email = 'outra@example.com'")
    assert.equal((await abrirBanco(url).redefinirSenha(contaIdProva, "outra@example.com", null)).status, "inalterado")
    const depois = await sql<{ verificador: Buffer }>("SELECT verificador FROM conta WHERE email = 'outra@example.com'")
    assert.deepEqual(depois.rows[0]?.verificador, antes.rows[0]?.verificador)
  })

  test("redefinir apaga so a sessao da outra", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    const admin = await abrirBanco(url).entrar("pablorgds@gmail.com", "segredo-inicial")
    const alheia = await abrirBanco(url).entrar("outra@example.com", "senha-oito")
    assert.equal(admin.status, "ok")
    assert.equal(alheia.status, "ok")
    if (admin.status !== "ok" || alheia.status !== "ok") return
    assert.equal((await abrirBanco(url).redefinirSenha(contaIdProva, "outra@example.com", "nova-senha")).status, "trocada")
    assert.equal(await abrirBanco(url).lerSessao(alheia.token), null)
    const segue = await abrirBanco(url).lerSessao(admin.token)
    assert.equal(segue?.email, "pablorgds@gmail.com")
  })

  test("nao redefine a senha do admin", async () => {
    const antes = await sql<{ verificador: Buffer }>("SELECT verificador FROM conta WHERE email = 'pablorgds@gmail.com'")
    assert.equal((await abrirBanco(url).redefinirSenha(contaIdProva, "pablorgds@gmail.com", "nova-senha")).status, "inalterado")
    const depois = await sql<{ verificador: Buffer }>("SELECT verificador FROM conta WHERE email = 'pablorgds@gmail.com'")
    assert.deepEqual(depois.rows[0]?.verificador, antes.rows[0]?.verificador)
  })

  test("conta comum nao redefine senha", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    const terceira = await abrirBanco(url).criarConta("tres@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    assert.equal(terceira.status, "criada")
    if (outra.status !== "criada") return
    const antes = await sql<{ email: string; verificador: Buffer }>("SELECT email, verificador FROM conta ORDER BY email")
    assert.equal((await abrirBanco(url).redefinirSenha(outra.id, "tres@example.com", "nova-senha")).status, "inalterado")
    const depois = await sql<{ email: string; verificador: Buffer }>("SELECT email, verificador FROM conta ORDER BY email")
    assert.deepEqual(depois.rows, antes.rows)
  })

  test("redefinir senha curta mantem a anterior", async () => {
    const outra = await abrirBanco(url).criarConta("outra@example.com", "senha-oito")
    assert.equal(outra.status, "criada")
    const antes = await sql<{ verificador: Buffer }>("SELECT verificador FROM conta WHERE email = 'outra@example.com'")
    assert.equal((await abrirBanco(url).redefinirSenha(contaIdProva, "outra@example.com", "1234567")).status, "senha-curta")
    const depois = await sql<{ verificador: Buffer }>("SELECT verificador FROM conta WHERE email = 'outra@example.com'")
    assert.deepEqual(depois.rows[0]?.verificador, antes.rows[0]?.verificador)
  })

  test("sair apaga o token", async () => {
    const entrada = await abrirBanco(url).entrar("pablorgds@gmail.com", "segredo-inicial")
    assert.equal(entrada.status, "ok")
    if (entrada.status !== "ok") return
    await abrirBanco(url).apagarSessao(entrada.token)
    const n = await sql<{ n: number }>("SELECT count(*)::int AS n FROM sessao WHERE token = $1", [entrada.token])
    assert.equal(Number(n.rows[0]?.n), 0)
  })

  test("sair remove so o token enviado", async () => {
    const primeira = await abrirBanco(url).entrar("pablorgds@gmail.com", "segredo-inicial")
    const segunda = await abrirBanco(url).entrar("pablorgds@gmail.com", "segredo-inicial")
    assert.equal(primeira.status, "ok")
    assert.equal(segunda.status, "ok")
    if (primeira.status !== "ok" || segunda.status !== "ok") return
    assert.equal((await abrirBanco(url).lerSessao(primeira.token))?.email, "pablorgds@gmail.com")
    assert.equal((await abrirBanco(url).lerSessao(segunda.token))?.email, "pablorgds@gmail.com")
    await abrirBanco(url).apagarSessao(primeira.token)
    assert.equal(await abrirBanco(url).lerSessao(primeira.token), null)
    assert.equal((await abrirBanco(url).lerSessao(segunda.token))?.email, "pablorgds@gmail.com")
  })

  test("chave da impressora por conta", async () => {
    const impressora = await sql<{ def: string }>(
      "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = 'impressora'::regclass AND contype = 'p'"
    )
    assert.match(impressora.rows.map((row) => row.def).join("\n"), /PRIMARY KEY \(conta_id, id\)/)
    const ativa = await sql<{ def: string }>(
      "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = 'impressora_ativa'::regclass"
    )
    const texto = ativa.rows.map((row) => row.def).join("\n")
    assert.match(texto, /PRIMARY KEY \(conta_id\)/)
    assert.match(texto, /FOREIGN KEY \(conta_id, impressora_id\) REFERENCES impressora\(conta_id, id\)/)
  })

  test("email unico e um admin", async () => {
    const indice = await sql<{ indexdef: string }>("SELECT indexdef FROM pg_indexes WHERE indexname = 'conta_email_lower'")
    assert.match(indice.rows[0]?.indexdef ?? "", /lower\(email\)/)
    const admins = await sql<{ email: string }>("SELECT email FROM conta WHERE papel = 'admin'")
    assert.deepEqual(admins.rows.map((row) => row.email), ["pablorgds@gmail.com"])
  })

  test("token opaco igual ao cookie", async () => {
    const entrada = await abrirBanco(url).entrar("pablorgds@gmail.com", "segredo-inicial")
    assert.equal(entrada.status, "ok")
    if (entrada.status !== "ok") return
    assert.equal(entrada.token.includes("."), false)
    const gravado = await sql<{ token: string }>("SELECT token FROM sessao WHERE token = $1", [entrada.token])
    assert.equal(gravado.rows[0]?.token, entrada.token)
  })

  test("banco sem cookies", () => {
    const bancoSrc = fs.readFileSync(path.join(root, "src/lib/banco.ts"), "utf8")
    assert.equal(bancoSrc.includes("cookies("), false)
  })
})
