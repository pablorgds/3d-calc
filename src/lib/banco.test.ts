import "./resolver-ts.ts"
import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"
import { Client } from "pg"
import { serializePrinterStore, type PrinterStore } from "./impressora-store.ts"
import { serializeProjects, type Project } from "./projetos-store.ts"

const { abrirBanco, abrirBancoDoAmbiente } = await import("./banco.ts")

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
    colors: [{ id: "c1", name: "PLA preto", hex: "#111111", price: "90", grams: "40" }],
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
    ok(await abrirBanco(url).ler())
  }, { timeout: 180_000 })

  test.beforeEach(async () => {
    await sql("TRUNCATE impressora_ativa, cor, projeto, impressora")
    await sql("DROP TRIGGER IF EXISTS rejeita_falha_copia ON projeto")
  })

  test.after(async () => {
    await abrirBanco(url).fechar()
    await exec("docker", ["rm", "-f", container], { windowsHide: true }).catch(() => undefined)
  })

  test("semente k2 pro", async () => {
    const lido = ok(await abrirBanco(url).ler())
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
    ok(await abrirBanco(url).gravarProjeto(salvo))
    const lido = ok(await abrirBanco(url).ler())
    assert.deepEqual(lido.projects[0], salvo)
  })

  test("projeto sobrevive a outro pool", async () => {
    const primeiro = abrirBanco(url)
    ok(await primeiro.gravarProjeto(projeto({ id: "persiste" })))
    await primeiro.fechar()
    const lido = ok(await abrirBanco(url).ler())
    assert.ok(lido.projects.some((item) => item.id === "persiste"))
  })

  test("navegador limpo mantem o projeto", async () => {
    ok(await abrirBanco(url).gravarProjeto(projeto()))
    const lido = ok(await abrirBanco(url).ler({ impressora: null, projetos: null }))
    assert.equal(lido.projects[0]?.id, "p1")
  })

  test("texto digitado inclusive vazio", async () => {
    ok(await abrirBanco(url).ler())
    ok(
      await abrirBanco(url).atualizarImpressora("k2-pro", {
        watts: "",
        energyPrice: "",
        printerPrice: "",
        lifeHours: "",
      })
    )
    ok(
      await abrirBanco(url).gravarProjeto(
        projeto({
          copies: "",
          hours: "",
          minutes: "",
          labor: "",
          colors: [{ id: "c1", name: "PLA", hex: "#111111", price: "", grams: "" }],
        })
      )
    )
    const lido = ok(await abrirBanco(url).ler())
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
    ok(await abrirBanco(url).gravarProjeto(projeto({ name: "Um", copies: "1" })))
    ok(await abrirBanco(url).gravarProjeto(projeto({ name: "Dois", copies: "8" })))
    const lido = ok(await abrirBanco(url).ler())
    assert.equal(lido.projects.length, 1)
    assert.equal(lido.projects[0]?.name, "Dois")
    assert.equal(lido.projects[0]?.copies, "8")
  })

  test("duplicar projeto", async () => {
    ok(await abrirBanco(url).gravarProjeto(projeto()))
    ok(await abrirBanco(url).duplicarProjeto("p1", "p2", 99))
    const lido = ok(await abrirBanco(url).ler())
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
    ok(await abrirBanco(url).gravarProjeto(projeto()))
    ok(await abrirBanco(url).apagarProjeto("p1"))
    const lido = ok(await abrirBanco(url).ler())
    assert.equal(
      lido.projects.some((item) => item.id === "p1"),
      false
    )
    const cores = await sql<{ n: number }>("SELECT count(*)::int AS n FROM cor WHERE projeto_id = $1", ["p1"])
    assert.equal(Number(cores.rows[0]?.n), 0)
  })

  test("remover ativa marca a primeira restante", async () => {
    const banco = abrirBanco(url)
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
    const banco = abrirBanco(url)
    ok(await banco.ler())
    ok(await banco.removerImpressora("k2-pro"))
    const lido = ok(await banco.ler())
    assert.deepEqual(
      lido.printers.printers.map((item) => item.id),
      ["k2-pro"]
    )
  })

  test("nova impressora nasce zerada", async () => {
    const banco = abrirBanco(url)
    ok(await banco.ler())
    ok(await banco.adicionarImpressora("nova"))
    const lido = ok(await banco.ler())
    const nova = lido.printers.printers.find((item) => item.id === "nova")
    assert.equal(lido.printers.activeId, "nova")
    assert.equal(nova?.name, "Nova impressora")
    assert.equal(nova?.watts, "0")
    assert.equal(nova?.energyPrice, "0")
    assert.equal(nova?.printerPrice, "0")
    assert.equal(nova?.lifeHours, "0")
  })

  test("rejeita projeto sem id ou mode", async () => {
    const banco = abrirBanco(url)
    ok(await banco.ler())
    assert.equal((await banco.gravarProjeto({ name: "x", mode: "lote" })).status, "rejeitado")
    assert.equal((await banco.gravarProjeto({ id: "x", mode: "tabela", name: "x" })).status, "rejeitado")
    const linhas = await sql<{ n: number }>("SELECT count(*)::int AS n FROM projeto")
    assert.equal(Number(linhas.rows[0]?.n), 0)
  })

  test("projeto com impressora ausente", async () => {
    ok(await abrirBanco(url).gravarProjeto(projeto({ printerId: "nao-existe" })))
    const lido = ok(await abrirBanco(url).ler())
    assert.equal(lido.projects[0]?.printerId, "nao-existe")
    assert.equal(
      lido.printers.printers.some((item) => item.id === "nao-existe"),
      false
    )
  })

  test("url projeto marca a impressora", async () => {
    const banco = abrirBanco(url)
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
    ok(await abrirBanco(url).ler())
    const lido = ok(
      await abrirBanco(url).ler({
        impressora: null,
        projetos: serializeProjects([projeto({ name: "Copia" })]),
      })
    )
    assert.equal(lido.projects[0]?.name, "Copia")
    assert.equal(lido.printers.printers[0]?.id, "k2-pro")
  })

  test("copia impressoras da semente", async () => {
    ok(await abrirBanco(url).ler())
    const loja: PrinterStore = {
      activeId: "ender",
      printers: [{ id: "ender", name: "Ender", watts: "9", energyPrice: "8", printerPrice: "7", lifeHours: "6" }],
    }
    const lido = ok(await abrirBanco(url).ler({ impressora: serializePrinterStore(loja), projetos: null }))
    assert.equal(lido.printers.activeId, "ender")
    assert.equal(lido.printers.printers[0]?.name, "Ender")
    assert.equal(lido.projects.length, 0)
  })

  test("copia as duas chaves", async () => {
    ok(await abrirBanco(url).ler())
    const loja: PrinterStore = {
      activeId: "ender",
      printers: [{ id: "ender", name: "Ender", watts: "9", energyPrice: "8", printerPrice: "7", lifeHours: "6" }],
    }
    const lido = ok(
      await abrirBanco(url).ler({
        impressora: serializePrinterStore(loja),
        projetos: serializeProjects([projeto({ name: "Junto", printerId: "ender" })]),
      })
    )
    assert.equal(lido.printers.activeId, "ender")
    assert.equal(lido.projects[0]?.name, "Junto")
  })

  test("falha da copia mantem a semente", async () => {
    const banco = abrirBanco(url)
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
    const banco = abrirBanco(url)
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
    ok(await abrirBanco(url).ler())
    const bruto = JSON.stringify({
      version: 1,
      projects: [projeto({ name: "Primeiro", copies: "4" }), projeto({ name: "Segundo", copies: "9" })],
    })
    const lido = ok(await abrirBanco(url).ler({ impressora: null, projetos: bruto }))
    assert.equal(lido.projects.length, 1)
    assert.equal(lido.projects[0]?.name, "Primeiro")
    assert.equal(lido.projects[0]?.copies, "4")
  })

  test("exatamente uma impressora ativa", async () => {
    const banco = abrirBanco(url)
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
    const banco = abrirBanco(url)
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
    const banco = abrirBanco(url)
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
    const banco = abrirBanco(url)
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
    const acoesSrc = fs.readFileSync(path.join(root, "src/lib/acoes.ts"), "utf8")
    assert.equal(bancoSrc.includes("cookies("), false)
    assert.equal(acoesSrc.includes("cookies("), false)
    const banco = abrirBanco(url)
    ok(await banco.gravarProjeto(projeto({ id: "sem-cookie", name: "Sem cookie" })))
    const lido = ok(await banco.ler())
    assert.equal(lido.projects.find((item) => item.id === "sem-cookie")?.name, "Sem cookie")
  })

  test("duas remocoes simultaneas", async () => {
    const banco = abrirBanco(url)
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
    const banco = abrirBanco(url)
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
      const banco = abrirBancoDoAmbiente()
      ok(await banco.gravarProjeto(projeto({ id: "via-env", name: "Via env" })))
      const lido = ok(await banco.ler())
      assert.equal(lido.projects.find((item) => item.id === "via-env")?.name, "Via env")
    } finally {
      if (anterior === undefined) delete process.env.DATABASE_URL
      else process.env.DATABASE_URL = anterior
    }
  })
})
