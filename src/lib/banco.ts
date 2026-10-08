import { Pool, type PoolClient } from "pg"
import {
  defaultPrinter,
  deletePrinter,
  insertPrinter,
  parsePrinterStore,
  updatePrinter,
  type Printer,
  type PrinterStore,
} from "./impressora-store"
import {
  copyProject,
  ganharMesa,
  parseProject,
  parseProjects,
  perderMesa,
  prepararGravacao,
  sortProjects,
  type Project,
} from "./projetos-store"

export type Resultado =
  | { status: "ok"; printers: PrinterStore; projects: Project[] }
  | { status: "erro" }

export type Banco = {
  ler(chaves?: { impressora: string | null; projetos: string | null }): Promise<Resultado>
  gravarProjeto(value: unknown): Promise<Resultado | { status: "rejeitado" }>
  adicionarMesa(id: string, idNova: string, expectedUpdatedAt?: number): Promise<Resultado | { status: "recusado" }>
  removerMesa(id: string, mesaId: string, expectedUpdatedAt?: number): Promise<Resultado>
  duplicarProjeto(id: string, novoId: string, now: number): Promise<Resultado>
  apagarProjeto(id: string): Promise<Resultado>
  adicionarImpressora(id: string): Promise<Resultado>
  removerImpressora(id: string): Promise<Resultado>
  atualizarImpressora(id: string, patch: Partial<Omit<Printer, "id">>): Promise<Resultado>
  marcarImpressora(id: string): Promise<Resultado>
  marcarImpressoraDoProjeto(projectId: string): Promise<Resultado>
  fechar(): Promise<void>
}

const pools = new Map<string, Pool>()

const TABELAS = [
  `CREATE TABLE IF NOT EXISTS impressora (
  id text PRIMARY KEY,
  name text NOT NULL,
  watts text NOT NULL,
  energy_price text NOT NULL,
  printer_price text NOT NULL,
  life_hours text NOT NULL,
  posicao integer NOT NULL
)`,
  `CREATE TABLE IF NOT EXISTS impressora_ativa (
  unico smallint PRIMARY KEY CHECK (unico = 1),
  impressora_id text NOT NULL REFERENCES impressora (id)
)`,
  `CREATE TABLE IF NOT EXISTS projeto (
  id text PRIMARY KEY,
  name text NOT NULL,
  printer_id text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('peca', 'lote')),
  copies text NOT NULL,
  hours text NOT NULL,
  minutes text NOT NULL,
  labor text NOT NULL,
  updated_at double precision NOT NULL
)`,
  `CREATE TABLE IF NOT EXISTS mesa (
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
)`,
  `CREATE TABLE IF NOT EXISTS cor (
  projeto_id text NOT NULL REFERENCES projeto (id) ON DELETE CASCADE,
  id text NOT NULL,
  name text NOT NULL,
  hex text NOT NULL,
  price text NOT NULL,
  grams text NOT NULL,
  posicao integer NOT NULL,
  PRIMARY KEY (projeto_id, id)
)`,
]

function bancoIndisponivel(error: unknown) {
  const texto = error instanceof Error ? `${error.name} ${error.message}` : String(error)
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : ""
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    texto.includes("ECONNREFUSED") ||
    texto.includes("ENOTFOUND") ||
    texto.includes("timeout expired") ||
    texto.includes("Connection terminated")
  )
}

function avisarIndisponivel() {
  process.stdout.write("banco indisponível\n")
}

async function rollback(client: PoolClient) {
  try {
    await client.query("ROLLBACK")
  } catch {
    // a conexão já caiu
  }
}

function ehSemente(printers: PrinterStore, projects: Project[]) {
  const printer = printers.printers
  return (
    projects.length === 0 &&
    printers.activeId === defaultPrinter.id &&
    printer.length === 1 &&
    printer[0].id === defaultPrinter.id &&
    printer[0].name === defaultPrinter.name &&
    printer[0].watts === defaultPrinter.watts &&
    printer[0].energyPrice === defaultPrinter.energyPrice &&
    printer[0].printerPrice === defaultPrinter.printerPrice &&
    printer[0].lifeHours === defaultPrinter.lifeHours
  )
}

async function garantirSchema(client: PoolClient) {
  for (const tabela of TABELAS) await client.query(tabela)
  await client.query("ALTER TABLE projeto ADD COLUMN IF NOT EXISTS color_mode text NOT NULL DEFAULT 'unica'")
  await client.query("ALTER TABLE projeto ADD COLUMN IF NOT EXISTS grams text NOT NULL DEFAULT ''")
  await client.query(
    `UPDATE projeto AS p
     SET color_mode = 'multicolor'
     WHERE p.color_mode = 'unica'
       AND p.grams = ''
       AND (SELECT count(*) FROM cor WHERE projeto_id = p.id) > 1`
  )
  await client.query(
    `UPDATE projeto AS p
     SET grams = primeira.grams
     FROM (
       SELECT DISTINCT ON (projeto_id) projeto_id, grams
       FROM cor
       ORDER BY projeto_id, posicao, id
     ) AS primeira
     WHERE p.id = primeira.projeto_id
       AND p.color_mode = 'unica'
       AND p.grams = ''
       AND primeira.grams <> ''`
  )
}

async function garantirSemente(client: PoolClient) {
  await client.query(
    `INSERT INTO impressora (id, name, watts, energy_price, printer_price, life_hours, posicao)
     SELECT $1, $2, $3, $4, $5, $6, 0
     WHERE NOT EXISTS (SELECT 1 FROM impressora)
     ON CONFLICT (id) DO NOTHING`,
    [
      defaultPrinter.id,
      defaultPrinter.name,
      defaultPrinter.watts,
      defaultPrinter.energyPrice,
      defaultPrinter.printerPrice,
      defaultPrinter.lifeHours,
    ]
  )
  await client.query(
    `INSERT INTO impressora_ativa (unico, impressora_id)
     SELECT 1, impressora.id FROM impressora
     WHERE NOT EXISTS (SELECT 1 FROM impressora_ativa)
     ORDER BY posicao
     LIMIT 1
     ON CONFLICT (unico) DO NOTHING`
  )
}

async function lerImpressoras(client: PoolClient): Promise<PrinterStore> {
  const printers = await client.query<{
    id: string
    name: string
    watts: string
    energy_price: string
    printer_price: string
    life_hours: string
  }>("SELECT id, name, watts, energy_price, printer_price, life_hours FROM impressora ORDER BY posicao, id")
  const active = await client.query<{ impressora_id: string }>("SELECT impressora_id FROM impressora_ativa WHERE unico = 1")
  const list: Printer[] = printers.rows.map((row) => ({
    id: row.id,
    name: row.name,
    watts: row.watts,
    energyPrice: row.energy_price,
    printerPrice: row.printer_price,
    lifeHours: row.life_hours,
  }))
  const requested = active.rows[0]?.impressora_id ?? ""
  const activeId = list.some((printer) => printer.id === requested) ? requested : (list[0]?.id ?? defaultPrinter.id)
  return { activeId, printers: list }
}

async function lerProjetos(client: PoolClient): Promise<Project[]> {
  const projects = await client.query<{
    id: string
    name: string
    printer_id: string
    mode: "peca" | "lote"
    copies: string
    hours: string
    minutes: string
    labor: string
    color_mode: string
    grams: string
    updated_at: string | number
  }>("SELECT id, name, printer_id, mode, copies, hours, minutes, labor, color_mode, grams, updated_at FROM projeto")
  const colors = await client.query<{
    projeto_id: string
    id: string
    name: string
    hex: string
    price: string
    grams: string
  }>("SELECT projeto_id, id, name, hex, price, grams FROM cor ORDER BY posicao, id")
  const mesas = await client.query<{
    projeto_id: string
    id: string
    hours: string
    minutes: string
    name: string
    hex: string
    price: string
    grams: string
  }>("SELECT projeto_id, id, hours, minutes, name, hex, price, grams FROM mesa ORDER BY posicao, id")
  const byProject = new Map<string, Project["colors"]>()
  for (const color of colors.rows) {
    const list = byProject.get(color.projeto_id) ?? []
    list.push({ id: color.id, name: color.name, hex: color.hex, price: color.price, grams: color.grams })
    byProject.set(color.projeto_id, list)
  }
  const mesasDoProjeto = new Map<string, NonNullable<Project["mesas"]>>()
  for (const mesa of mesas.rows) {
    const list = mesasDoProjeto.get(mesa.projeto_id) ?? []
    list.push({
      id: mesa.id,
      hours: mesa.hours,
      minutes: mesa.minutes,
      name: mesa.name,
      hex: mesa.hex,
      price: mesa.price,
      grams: mesa.grams,
    })
    mesasDoProjeto.set(mesa.projeto_id, list)
  }
  return sortProjects(
    projects.rows.map((row) => ({
      id: row.id,
      name: row.name,
      printerId: row.printer_id,
      mode: row.mode,
      copies: row.copies,
      hours: row.hours,
      minutes: row.minutes,
      labor: row.labor,
      colorMode: row.color_mode === "multicolor" ? "multicolor" : "unica",
      grams: row.grams,
      colors: byProject.get(row.id) ?? [],
      mesas: mesasDoProjeto.get(row.id) ?? [],
      updatedAt: Number(row.updated_at),
    }))
  )
}

async function lerTudo(client: PoolClient) {
  return { printers: await lerImpressoras(client), projects: await lerProjetos(client) }
}

async function substituirImpressoras(client: PoolClient, store: PrinterStore) {
  for (const [index, printer] of store.printers.entries()) {
    await client.query(
      `INSERT INTO impressora (id, name, watts, energy_price, printer_price, life_hours, posicao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         watts = EXCLUDED.watts,
         energy_price = EXCLUDED.energy_price,
         printer_price = EXCLUDED.printer_price,
         life_hours = EXCLUDED.life_hours,
         posicao = EXCLUDED.posicao`,
      [printer.id, printer.name, printer.watts, printer.energyPrice, printer.printerPrice, printer.lifeHours, index]
    )
  }
  await client.query(
    `INSERT INTO impressora_ativa (unico, impressora_id) VALUES (1, $1)
     ON CONFLICT (unico) DO UPDATE SET impressora_id = EXCLUDED.impressora_id`,
    [store.activeId]
  )
  await client.query("DELETE FROM impressora WHERE NOT (id = ANY($1::text[]))", [store.printers.map((printer) => printer.id)])
}

function conflitoDeGravacao() {
  const error = new Error("conflito")
  ;(error as Error & { conflito?: boolean }).conflito = true
  return error
}

function ehConflito(error: unknown) {
  return Boolean(error && typeof error === "object" && "conflito" in error && error.conflito)
}

function updatedAtEsperado(value: unknown) {
  if (!value || typeof value !== "object") return undefined
  const raw = (value as Record<string, unknown>).expectedUpdatedAt
  return typeof raw === "number" && Number.isFinite(raw) ? raw : undefined
}

async function exigirUpdatedAt(client: PoolClient, id: string, expected: number | undefined) {
  if (expected === undefined) return
  const atual = await client.query<{ updated_at: string | number }>("SELECT updated_at FROM projeto WHERE id = $1 FOR UPDATE", [
    id,
  ])
  if (atual.rows.length > 0 && Number(atual.rows[0]?.updated_at) !== expected) throw conflitoDeGravacao()
}

async function inserirProjeto(client: PoolClient, project: Project, expected?: number) {
  await exigirUpdatedAt(client, project.id, expected)
  const gravado = prepararGravacao(project)
  await client.query(
    `INSERT INTO projeto (id, name, printer_id, mode, copies, hours, minutes, labor, color_mode, grams, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       printer_id = EXCLUDED.printer_id,
       mode = EXCLUDED.mode,
       copies = EXCLUDED.copies,
       hours = EXCLUDED.hours,
       minutes = EXCLUDED.minutes,
       labor = EXCLUDED.labor,
       color_mode = EXCLUDED.color_mode,
       grams = EXCLUDED.grams,
       updated_at = EXCLUDED.updated_at`,
    [
      gravado.id,
      gravado.name,
      gravado.printerId,
      gravado.mode,
      gravado.copies,
      gravado.hours,
      gravado.minutes,
      gravado.labor,
      gravado.colorMode === "multicolor" ? "multicolor" : "unica",
      gravado.grams,
      gravado.updatedAt,
    ]
  )
  await client.query("DELETE FROM cor WHERE projeto_id = $1", [gravado.id])
  await client.query("DELETE FROM mesa WHERE projeto_id = $1", [gravado.id])
  if ((gravado.mesas ?? []).length > 0) {
    let posicao = 0
    for (const mesa of gravado.mesas ?? []) {
      await client.query(
        `INSERT INTO mesa (projeto_id, id, hours, minutes, name, hex, price, grams, posicao)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [gravado.id, mesa.id, mesa.hours, mesa.minutes, mesa.name, mesa.hex, mesa.price, mesa.grams, posicao]
      )
      posicao += 1
    }
    return
  }
  const seen = new Set<string>()
  let posicao = 0
  for (const color of gravado.colors) {
    if (seen.has(color.id)) continue
    seen.add(color.id)
    await client.query(
      `INSERT INTO cor (projeto_id, id, name, hex, price, grams, posicao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [gravado.id, color.id, color.name, color.hex, color.price, color.grams, posicao]
    )
    posicao += 1
  }
}

async function substituirProjetos(client: PoolClient, projects: Project[]) {
  await client.query("DELETE FROM projeto")
  for (const project of projects) await inserirProjeto(client, project)
}

function criar(pool: Pool, databaseUrl: string): Banco {
  async function comCliente<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect()
    try {
      return await fn(client)
    } finally {
      client.release()
    }
  }

  async function preparado<T>(fn: (client: PoolClient) => Promise<T>, travarImpressora = false): Promise<T> {
    return comCliente(async (client) => {
      await garantirSchema(client)
      await client.query("BEGIN")
      try {
        if (travarImpressora) await client.query("LOCK TABLE impressora IN EXCLUSIVE MODE")
        await garantirSemente(client)
        const value = await fn(client)
        await client.query("COMMIT")
        return value
      } catch (error) {
        await rollback(client)
        throw error
      }
    })
  }

  async function estado(): Promise<Resultado> {
    try {
      return await comCliente(async (client) => {
        await garantirSchema(client)
        await client.query("BEGIN")
        await garantirSemente(client)
        await client.query("COMMIT")
        const lido = await lerTudo(client)
        return { status: "ok", ...lido }
      })
    } catch (error) {
      if (bancoIndisponivel(error)) {
        avisarIndisponivel()
        return { status: "erro" }
      }
      throw error
    }
  }

  return {
    async ler(chaves) {
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          await client.query("BEGIN")
          await garantirSemente(client)
          await client.query("COMMIT")

          const temImpressora = chaves?.impressora != null
          const temProjetos = chaves?.projetos != null
          if (temImpressora || temProjetos) {
            await client.query("BEGIN")
            try {
              const atual = await lerTudo(client)
              if (ehSemente(atual.printers, atual.projects)) {
                if (temImpressora) await substituirImpressoras(client, parsePrinterStore(chaves?.impressora ?? null))
                if (temProjetos) await substituirProjetos(client, parseProjects(chaves?.projetos ?? null))
              }
              await client.query("COMMIT")
            } catch (error) {
              await rollback(client)
              if (bancoIndisponivel(error)) throw error
            }
          }
          const lido = await lerTudo(client)
          return { status: "ok" as const, ...lido }
        })
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async gravarProjeto(value) {
      const project = parseProject(value)
      if (!project) return { status: "rejeitado" }
      const expected = updatedAtEsperado(value)
      try {
        await preparado(async (client) => {
          await inserirProjeto(client, project, expected)
        })
        return estado()
      } catch (error) {
        if (ehConflito(error)) return estado()
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async adicionarMesa(id, idNova, expectedUpdatedAt) {
      let recusado = false
      try {
        await preparado(async (client) => {
          const projects = await lerProjetos(client)
          const project = projects.find((item) => item.id === id)
          if (!project) return
          const next = ganharMesa(project, idNova)
          if (next.status === "recusado") {
            recusado = true
            return
          }
          await inserirProjeto(client, { ...next.project, updatedAt: Date.now() }, expectedUpdatedAt)
        })
        if (recusado) return { status: "recusado" }
        return estado()
      } catch (error) {
        if (ehConflito(error)) return estado()
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async removerMesa(id, mesaId, expectedUpdatedAt) {
      try {
        await preparado(async (client) => {
          const projects = await lerProjetos(client)
          const project = projects.find((item) => item.id === id)
          if (!project) return
          const next = perderMesa(project, mesaId)
          await inserirProjeto(client, { ...next, updatedAt: Date.now() }, expectedUpdatedAt)
        })
        return estado()
      } catch (error) {
        if (ehConflito(error)) return estado()
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async duplicarProjeto(id, novoId, now) {
      try {
        await preparado(async (client) => {
          const projects = await lerProjetos(client)
          const next = copyProject(projects, id, novoId, now)
          const criado = next.find((project) => project.id === novoId.trim())
          if (criado) await inserirProjeto(client, criado)
        })
        return estado()
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async apagarProjeto(id) {
      try {
        await preparado(async (client) => {
          await client.query("DELETE FROM projeto WHERE id = $1", [id])
        })
        return estado()
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async adicionarImpressora(id) {
      try {
        await preparado(async (client) => {
          const store = await lerImpressoras(client)
          await substituirImpressoras(client, insertPrinter(store, id))
        }, true)
        return estado()
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async removerImpressora(id) {
      try {
        await preparado(async (client) => {
          const store = await lerImpressoras(client)
          if (store.printers.length <= 1) return
          await substituirImpressoras(client, deletePrinter(store, id))
        }, true)
        return estado()
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async atualizarImpressora(id, patch) {
      try {
        await preparado(async (client) => {
          const store = await lerImpressoras(client)
          await substituirImpressoras(client, updatePrinter(store, id, patch))
        })
        return estado()
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async marcarImpressora(id) {
      try {
        await preparado(async (client) => {
          const store = await lerImpressoras(client)
          if (!store.printers.some((printer) => printer.id === id)) return
          await client.query("UPDATE impressora_ativa SET impressora_id = $1 WHERE unico = 1", [id])
        })
        return estado()
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async marcarImpressoraDoProjeto(projectId) {
      try {
        await preparado(async (client) => {
          const projects = await lerProjetos(client)
          const project = projects.find((item) => item.id === projectId)
          if (!project) return
          const store = await lerImpressoras(client)
          if (!store.printers.some((printer) => printer.id === project.printerId)) return
          await client.query("UPDATE impressora_ativa SET impressora_id = $1 WHERE unico = 1", [project.printerId])
        })
        return estado()
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async fechar() {
      const aberto = pools.get(databaseUrl)
      if (!aberto) return
      pools.delete(databaseUrl)
      await aberto.end()
    },
  }
}

export function abrirBanco(databaseUrl: string): Banco {
  let pool = pools.get(databaseUrl)
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 2000 })
    pools.set(databaseUrl, pool)
  }
  return criar(pool, databaseUrl)
}

export function abrirBancoDoAmbiente(): Banco {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return {
      async ler() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async gravarProjeto() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async adicionarMesa() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async removerMesa() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async duplicarProjeto() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async apagarProjeto() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async adicionarImpressora() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async removerImpressora() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async atualizarImpressora() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async marcarImpressora() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async marcarImpressoraDoProjeto() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async fechar() {},
    }
  }
  return abrirBanco(databaseUrl)
}
