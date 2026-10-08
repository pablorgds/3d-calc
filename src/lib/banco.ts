import { AsyncLocalStorage } from "node:async_hooks"
import { randomBytes, randomUUID } from "node:crypto"
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
import { EMAIL_ADMIN, SENHA_MINIMA, conferirSenha, emailNormalizado, emailValido, hashSenha } from "./senha"

const escopoConta = new AsyncLocalStorage<string>()

export function comConta<T>(contaId: string, fn: () => T): T {
  return escopoConta.run(contaId, fn)
}

function contaDoEscopo() {
  return escopoConta.getStore() ?? null
}

export type Resultado =
  | { status: "ok"; printers: PrinterStore; projects: Project[] }
  | { status: "erro" }

export type SessaoConta = { contaId: string; email: string; papel: "admin" | "comum" }

export type PrimeiraConta =
  | { status: "criada"; id: string }
  | { status: "ja-existe"; id: string }
  | { status: "senha-ruim" }
  | { status: "erro" }

export type ContaCriada =
  | { status: "criada"; id: string }
  | { status: "duplicado" }
  | { status: "senha-curta" }
  | { status: "email-invalido" }
  | { status: "erro" }

export type Entrada =
  | { status: "ok"; token: string }
  | { status: "recusado" }
  | { status: "vazio" }
  | { status: "erro" }

export type Redefinicao = { status: "inalterado" } | { status: "trocada" } | { status: "senha-curta" } | { status: "erro" }

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
  garantirPrimeiraConta(senha: string | undefined): Promise<PrimeiraConta>
  criarConta(email: string, senha: string): Promise<ContaCriada>
  entrar(email: string, senha: string): Promise<Entrada>
  lerSessao(token: string): Promise<SessaoConta | null>
  apagarSessao(token: string): Promise<void>
  redefinirSenha(atorId: string, email: string, senha: string | null): Promise<Redefinicao>
  listarOutrasContas(atorId: string): Promise<string[]>
  contarContas(): Promise<number | null>
  fechar(): Promise<void>
}

const pools = new Map<string, Pool>()

const MESA = `CREATE TABLE IF NOT EXISTS mesa (
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

const COR = `CREATE TABLE IF NOT EXISTS cor (
  projeto_id text NOT NULL REFERENCES projeto (id) ON DELETE CASCADE,
  id text NOT NULL,
  name text NOT NULL,
  hex text NOT NULL,
  price text NOT NULL,
  grams text NOT NULL,
  posicao integer NOT NULL,
  PRIMARY KEY (projeto_id, id)
)`

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

function ehUnico(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505")
}

async function colunaConta(client: PoolClient, tabela: string) {
  const lido = await client.query<{ is_nullable: string }>(
    `SELECT is_nullable FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'conta_id'`,
    [tabela]
  )
  return lido.rows[0] ?? null
}

async function chavePrimaria(client: PoolClient, tabela: string) {
  const lido = await client.query<{ attname: string }>(
    `SELECT a.attname
     FROM pg_index i
     JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
     WHERE i.indrelid = $1::regclass AND i.indisprimary
     ORDER BY array_position(i.indkey, a.attnum)`,
    [tabela]
  )
  return lido.rows.map((row) => row.attname)
}

async function migrarCores(client: PoolClient) {
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

async function firmarChaves(client: PoolClient) {
  const chaves = await chavePrimaria(client, "impressora")
  if (chaves[0] === "conta_id" && chaves[1] === "id") return
  const nulosImpressora = await client.query<{ n: number }>("SELECT count(*)::int AS n FROM impressora WHERE conta_id IS NULL")
  const nulosProjeto = await client.query<{ n: number }>("SELECT count(*)::int AS n FROM projeto WHERE conta_id IS NULL")
  if (Number(nulosImpressora.rows[0]?.n) > 0 || Number(nulosProjeto.rows[0]?.n) > 0) return

  await client.query("ALTER TABLE impressora_ativa DROP CONSTRAINT IF EXISTS impressora_ativa_impressora_id_fkey")
  await client.query("ALTER TABLE impressora DROP CONSTRAINT IF EXISTS impressora_pkey")
  await client.query("ALTER TABLE impressora ALTER COLUMN conta_id SET NOT NULL")
  await client.query("ALTER TABLE impressora ADD PRIMARY KEY (conta_id, id)")
  await client.query(
    `DO $$ BEGIN
       ALTER TABLE impressora ADD CONSTRAINT impressora_conta_fk FOREIGN KEY (conta_id) REFERENCES conta (id);
     EXCEPTION WHEN duplicate_object THEN NULL;
     END $$`
  )
  await client.query(
    `CREATE TABLE impressora_ativa_nova (
       conta_id text PRIMARY KEY REFERENCES conta (id),
       impressora_id text NOT NULL,
       FOREIGN KEY (conta_id, impressora_id) REFERENCES impressora (conta_id, id)
     )`
  )
  const ativaTemConta = await colunaConta(client, "impressora_ativa")
  if (ativaTemConta) {
    await client.query(
      "INSERT INTO impressora_ativa_nova (conta_id, impressora_id) SELECT conta_id, impressora_id FROM impressora_ativa"
    )
  } else {
    await client.query(
      `INSERT INTO impressora_ativa_nova (conta_id, impressora_id)
       SELECT i.conta_id, a.impressora_id
       FROM impressora_ativa a
       JOIN impressora i ON i.id = a.impressora_id`
    )
  }
  await client.query("DROP TABLE impressora_ativa")
  await client.query("ALTER TABLE impressora_ativa_nova RENAME TO impressora_ativa")
  await client.query("ALTER TABLE projeto ALTER COLUMN conta_id SET NOT NULL")
  await client.query(
    `DO $$ BEGIN
       ALTER TABLE projeto ADD CONSTRAINT projeto_conta_fk FOREIGN KEY (conta_id) REFERENCES conta (id);
     EXCEPTION WHEN duplicate_object THEN NULL;
     END $$`
  )
}

async function garantirSchema(client: PoolClient) {
  await client.query(
    `CREATE TABLE IF NOT EXISTS conta (
       id text PRIMARY KEY,
       email text NOT NULL,
       papel text NOT NULL CHECK (papel IN ('admin', 'comum')),
       sal bytea NOT NULL,
       verificador bytea NOT NULL
     )`
  )
  await client.query("CREATE UNIQUE INDEX IF NOT EXISTS conta_email_lower ON conta (lower(email))")
  await client.query("CREATE UNIQUE INDEX IF NOT EXISTS conta_um_admin ON conta (papel) WHERE papel = 'admin'")
  await client.query(
    `CREATE TABLE IF NOT EXISTS sessao (
       token text PRIMARY KEY,
       conta_id text NOT NULL REFERENCES conta (id) ON DELETE CASCADE,
       expira timestamptz NOT NULL
     )`
  )
  const impressora = await client.query<{ nome: string | null }>("SELECT to_regclass('public.impressora') AS nome")
  if (!impressora.rows[0]?.nome) {
    await client.query(
      `CREATE TABLE impressora (
         conta_id text NOT NULL REFERENCES conta (id),
         id text NOT NULL,
         name text NOT NULL,
         watts text NOT NULL,
         energy_price text NOT NULL,
         printer_price text NOT NULL,
         life_hours text NOT NULL,
         posicao integer NOT NULL,
         PRIMARY KEY (conta_id, id)
       )`
    )
    await client.query(
      `CREATE TABLE impressora_ativa (
         conta_id text PRIMARY KEY REFERENCES conta (id),
         impressora_id text NOT NULL,
         FOREIGN KEY (conta_id, impressora_id) REFERENCES impressora (conta_id, id)
       )`
    )
    await client.query(
      `CREATE TABLE projeto (
         id text PRIMARY KEY,
         conta_id text NOT NULL REFERENCES conta (id),
         name text NOT NULL,
         printer_id text NOT NULL,
         mode text NOT NULL CHECK (mode IN ('peca', 'lote')),
         copies text NOT NULL,
         hours text NOT NULL,
         minutes text NOT NULL,
         labor text NOT NULL,
         color_mode text NOT NULL DEFAULT 'unica',
         grams text NOT NULL DEFAULT '',
         updated_at double precision NOT NULL
       )`
    )
    await client.query(MESA)
    await client.query(COR)
    return
  }
  const contaNaImpressora = await colunaConta(client, "impressora")
  if (!contaNaImpressora) {
    await client.query("ALTER TABLE impressora ADD COLUMN conta_id text")
    await client.query("ALTER TABLE projeto ADD COLUMN conta_id text")
  }
  await client.query(MESA)
  await client.query(COR)
  await migrarCores(client)
  await firmarChaves(client)
}

async function garantirSemente(client: PoolClient, contaId: string) {
  await client.query(
    `INSERT INTO impressora (conta_id, id, name, watts, energy_price, printer_price, life_hours, posicao)
     SELECT $1, $2, $3, $4, $5, $6, $7, 0
     WHERE NOT EXISTS (SELECT 1 FROM impressora WHERE conta_id = $1)
     ON CONFLICT (conta_id, id) DO NOTHING`,
    [
      contaId,
      defaultPrinter.id,
      defaultPrinter.name,
      defaultPrinter.watts,
      defaultPrinter.energyPrice,
      defaultPrinter.printerPrice,
      defaultPrinter.lifeHours,
    ]
  )
  await client.query(
    `INSERT INTO impressora_ativa (conta_id, impressora_id)
     SELECT $1, impressora.id FROM impressora
     WHERE impressora.conta_id = $1
       AND NOT EXISTS (SELECT 1 FROM impressora_ativa WHERE conta_id = $1)
     ORDER BY posicao
     LIMIT 1
     ON CONFLICT (conta_id) DO NOTHING`,
    [contaId]
  )
}

async function atribuirLinhas(client: PoolClient, contaId: string) {
  const coluna = await colunaConta(client, "impressora")
  if (coluna?.is_nullable !== "YES") return
  await client.query("UPDATE impressora SET conta_id = $1 WHERE conta_id IS NULL", [contaId])
  await client.query("UPDATE projeto SET conta_id = $1 WHERE conta_id IS NULL", [contaId])
}

async function lerImpressoras(client: PoolClient, contaId: string): Promise<PrinterStore> {
  const printers = await client.query<{
    id: string
    name: string
    watts: string
    energy_price: string
    printer_price: string
    life_hours: string
  }>(
    "SELECT id, name, watts, energy_price, printer_price, life_hours FROM impressora WHERE conta_id = $1 ORDER BY posicao, id",
    [contaId]
  )
  const active = await client.query<{ impressora_id: string }>(
    "SELECT impressora_id FROM impressora_ativa WHERE conta_id = $1",
    [contaId]
  )
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

async function lerProjetos(client: PoolClient, contaId: string): Promise<Project[]> {
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
  }>(
    "SELECT id, name, printer_id, mode, copies, hours, minutes, labor, color_mode, grams, updated_at FROM projeto WHERE conta_id = $1",
    [contaId]
  )
  const colors = await client.query<{
    projeto_id: string
    id: string
    name: string
    hex: string
    price: string
    grams: string
  }>(
    `SELECT cor.projeto_id, cor.id, cor.name, cor.hex, cor.price, cor.grams
     FROM cor JOIN projeto ON projeto.id = cor.projeto_id
     WHERE projeto.conta_id = $1
     ORDER BY cor.posicao, cor.id`,
    [contaId]
  )
  const mesas = await client.query<{
    projeto_id: string
    id: string
    hours: string
    minutes: string
    name: string
    hex: string
    price: string
    grams: string
  }>(
    `SELECT mesa.projeto_id, mesa.id, mesa.hours, mesa.minutes, mesa.name, mesa.hex, mesa.price, mesa.grams
     FROM mesa JOIN projeto ON projeto.id = mesa.projeto_id
     WHERE projeto.conta_id = $1
     ORDER BY mesa.posicao, mesa.id`,
    [contaId]
  )
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

async function lerTudo(client: PoolClient, contaId: string) {
  return { printers: await lerImpressoras(client, contaId), projects: await lerProjetos(client, contaId) }
}

async function substituirImpressoras(client: PoolClient, contaId: string, store: PrinterStore) {
  for (const [index, printer] of store.printers.entries()) {
    await client.query(
      `INSERT INTO impressora (conta_id, id, name, watts, energy_price, printer_price, life_hours, posicao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (conta_id, id) DO UPDATE SET
         name = EXCLUDED.name,
         watts = EXCLUDED.watts,
         energy_price = EXCLUDED.energy_price,
         printer_price = EXCLUDED.printer_price,
         life_hours = EXCLUDED.life_hours,
         posicao = EXCLUDED.posicao`,
      [contaId, printer.id, printer.name, printer.watts, printer.energyPrice, printer.printerPrice, printer.lifeHours, index]
    )
  }
  await client.query(
    `INSERT INTO impressora_ativa (conta_id, impressora_id) VALUES ($1, $2)
     ON CONFLICT (conta_id) DO UPDATE SET impressora_id = EXCLUDED.impressora_id`,
    [contaId, store.activeId]
  )
  await client.query("DELETE FROM impressora WHERE conta_id = $1 AND NOT (id = ANY($2::text[]))", [
    contaId,
    store.printers.map((printer) => printer.id),
  ])
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

async function exigirUpdatedAt(client: PoolClient, contaId: string, id: string, expected: number | undefined) {
  if (expected === undefined) return
  const atual = await client.query<{ updated_at: string | number }>(
    "SELECT updated_at FROM projeto WHERE id = $1 AND conta_id = $2 FOR UPDATE",
    [id, contaId]
  )
  if (atual.rows.length > 0 && Number(atual.rows[0]?.updated_at) !== expected) throw conflitoDeGravacao()
}

async function inserirProjeto(client: PoolClient, contaId: string, project: Project, expected?: number) {
  const dono = await client.query<{ conta_id: string }>("SELECT conta_id FROM projeto WHERE id = $1", [project.id])
  if (dono.rows.length > 0 && dono.rows[0]?.conta_id !== contaId) return
  await exigirUpdatedAt(client, contaId, project.id, expected)
  const gravado = prepararGravacao(project)
  await client.query(
    `INSERT INTO projeto (id, conta_id, name, printer_id, mode, copies, hours, minutes, labor, color_mode, grams, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
       updated_at = EXCLUDED.updated_at
     WHERE projeto.conta_id = EXCLUDED.conta_id`,
    [
      gravado.id,
      contaId,
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

async function substituirProjetos(client: PoolClient, contaId: string, projects: Project[]) {
  await client.query("DELETE FROM projeto WHERE conta_id = $1", [contaId])
  for (const project of projects) await inserirProjeto(client, contaId, project)
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

  function contaExigida() {
    return contaDoEscopo()
  }

  async function preparado<T>(contaId: string, fn: (client: PoolClient) => Promise<T>, travarImpressora = false): Promise<T> {
    return comCliente(async (client) => {
      await garantirSchema(client)
      await client.query("BEGIN")
      try {
        if (travarImpressora) await client.query("LOCK TABLE impressora IN EXCLUSIVE MODE")
        await garantirSemente(client, contaId)
        const value = await fn(client)
        await client.query("COMMIT")
        return value
      } catch (error) {
        await rollback(client)
        throw error
      }
    })
  }

  async function estado(contaId: string): Promise<Resultado> {
    try {
      return await comCliente(async (client) => {
        await garantirSchema(client)
        await client.query("BEGIN")
        await garantirSemente(client, contaId)
        await client.query("COMMIT")
        const lido = await lerTudo(client, contaId)
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
      const contaId = contaExigida()
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          if (!contaId) return { status: "erro" as const }
          await client.query("BEGIN")
          await garantirSemente(client, contaId)
          await client.query("COMMIT")

          const temImpressora = chaves?.impressora != null
          const temProjetos = chaves?.projetos != null
          if (temImpressora || temProjetos) {
            await client.query("BEGIN")
            try {
              const papel = await client.query<{ papel: string }>("SELECT papel FROM conta WHERE id = $1", [contaId])
              const atual = await lerTudo(client, contaId)
              if (papel.rows[0]?.papel === "admin" && ehSemente(atual.printers, atual.projects)) {
                if (temImpressora) await substituirImpressoras(client, contaId, parsePrinterStore(chaves?.impressora ?? null))
                if (temProjetos) await substituirProjetos(client, contaId, parseProjects(chaves?.projetos ?? null))
              }
              await client.query("COMMIT")
            } catch (error) {
              await rollback(client)
              if (bancoIndisponivel(error)) throw error
            }
          }
          const lido = await lerTudo(client, contaId)
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
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      const project = parseProject(value)
      if (!project) return { status: "rejeitado" }
      const expected = updatedAtEsperado(value)
      try {
        await preparado(contaId, async (client) => {
          await inserirProjeto(client, contaId, project, expected)
        })
        return estado(contaId)
      } catch (error) {
        if (ehConflito(error)) return estado(contaId)
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async adicionarMesa(id, idNova, expectedUpdatedAt) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      let recusado = false
      try {
        await preparado(contaId, async (client) => {
          const projects = await lerProjetos(client, contaId)
          const project = projects.find((item) => item.id === id)
          if (!project) return
          const next = ganharMesa(project, idNova)
          if (next.status === "recusado") {
            recusado = true
            return
          }
          await inserirProjeto(client, contaId, { ...next.project, updatedAt: Date.now() }, expectedUpdatedAt)
        })
        if (recusado) return { status: "recusado" }
        return estado(contaId)
      } catch (error) {
        if (ehConflito(error)) return estado(contaId)
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async removerMesa(id, mesaId, expectedUpdatedAt) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      try {
        await preparado(contaId, async (client) => {
          const projects = await lerProjetos(client, contaId)
          const project = projects.find((item) => item.id === id)
          if (!project) return
          const next = perderMesa(project, mesaId)
          await inserirProjeto(client, contaId, { ...next, updatedAt: Date.now() }, expectedUpdatedAt)
        })
        return estado(contaId)
      } catch (error) {
        if (ehConflito(error)) return estado(contaId)
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async duplicarProjeto(id, novoId, now) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      try {
        await preparado(contaId, async (client) => {
          const projects = await lerProjetos(client, contaId)
          const next = copyProject(projects, id, novoId, now)
          const criado = next.find((project) => project.id === novoId.trim())
          if (criado) await inserirProjeto(client, contaId, criado)
        })
        return estado(contaId)
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async apagarProjeto(id) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      try {
        await preparado(contaId, async (client) => {
          await client.query("DELETE FROM projeto WHERE id = $1 AND conta_id = $2", [id, contaId])
        })
        return estado(contaId)
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async adicionarImpressora(id) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      try {
        await preparado(
          contaId,
          async (client) => {
            const store = await lerImpressoras(client, contaId)
            await substituirImpressoras(client, contaId, insertPrinter(store, id))
          },
          true
        )
        return estado(contaId)
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async removerImpressora(id) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      try {
        await preparado(
          contaId,
          async (client) => {
            const store = await lerImpressoras(client, contaId)
            if (store.printers.length <= 1) return
            await substituirImpressoras(client, contaId, deletePrinter(store, id))
          },
          true
        )
        return estado(contaId)
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async atualizarImpressora(id, patch) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      try {
        await preparado(contaId, async (client) => {
          const store = await lerImpressoras(client, contaId)
          await substituirImpressoras(client, contaId, updatePrinter(store, id, patch))
        })
        return estado(contaId)
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async marcarImpressora(id) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      try {
        await preparado(contaId, async (client) => {
          const store = await lerImpressoras(client, contaId)
          if (!store.printers.some((printer) => printer.id === id)) return
          await client.query("UPDATE impressora_ativa SET impressora_id = $2 WHERE conta_id = $1", [contaId, id])
        })
        return estado(contaId)
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async marcarImpressoraDoProjeto(projectId) {
      const contaId = contaExigida()
      if (!contaId) return { status: "erro" }
      try {
        await preparado(contaId, async (client) => {
          const projects = await lerProjetos(client, contaId)
          const project = projects.find((item) => item.id === projectId)
          if (!project) return
          const store = await lerImpressoras(client, contaId)
          if (!store.printers.some((printer) => printer.id === project.printerId)) return
          await client.query("UPDATE impressora_ativa SET impressora_id = $2 WHERE conta_id = $1", [contaId, project.printerId])
        })
        return estado(contaId)
      } catch (error) {
        if (bancoIndisponivel(error)) {
          avisarIndisponivel()
          return { status: "erro" }
        }
        throw error
      }
    },

    async garantirPrimeiraConta(senha) {
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          await client.query("BEGIN")
          try {
            await client.query("LOCK TABLE conta IN EXCLUSIVE MODE")
            const contas = await client.query<{ id: string }>("SELECT id FROM conta LIMIT 1")
            const existente = contas.rows[0]
            if (existente) {
              await client.query("COMMIT")
              return { status: "ja-existe" as const, id: existente.id }
            }
            if (!senha || senha.length < SENHA_MINIMA) {
              await client.query("COMMIT")
              return { status: "senha-ruim" as const }
            }
            const { sal, verificador } = await hashSenha(senha)
            const id = randomUUID()
            await client.query(
              "INSERT INTO conta (id, email, papel, sal, verificador) VALUES ($1, $2, 'admin', $3, $4)",
              [id, EMAIL_ADMIN, sal, verificador]
            )
            await atribuirLinhas(client, id)
            await firmarChaves(client)
            await garantirSemente(client, id)
            await client.query("COMMIT")
            return { status: "criada" as const, id }
          } catch (error) {
            await rollback(client)
            throw error
          }
        })
      } catch (error) {
        if (bancoIndisponivel(error)) return { status: "erro" }
        throw error
      }
    },

    async criarConta(email, senha) {
      const normalizado = emailNormalizado(email)
      if (!emailValido(normalizado)) return { status: "email-invalido" }
      if (senha.length < SENHA_MINIMA) return { status: "senha-curta" }
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          await client.query("BEGIN")
          try {
            const { sal, verificador } = await hashSenha(senha)
            const id = randomUUID()
            await client.query(
              "INSERT INTO conta (id, email, papel, sal, verificador) VALUES ($1, $2, 'comum', $3, $4)",
              [id, normalizado, sal, verificador]
            )
            await garantirSemente(client, id)
            await client.query("COMMIT")
            return { status: "criada" as const, id }
          } catch (error) {
            await rollback(client)
            if (ehUnico(error)) return { status: "duplicado" as const }
            throw error
          }
        })
      } catch (error) {
        if (bancoIndisponivel(error)) return { status: "erro" }
        throw error
      }
    },

    async entrar(email, senha) {
      if (email.trim() === "" || senha === "") return { status: "vazio" }
      const normalizado = emailNormalizado(email)
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          const conta = await client.query<{ id: string; sal: Buffer; verificador: Buffer }>(
            "SELECT id, sal, verificador FROM conta WHERE lower(email) = $1",
            [normalizado]
          )
          const linha = conta.rows[0]
          const confere = linha ? await conferirSenha(senha, linha.sal, linha.verificador) : false
          if (!linha || !confere) {
            process.stdout.write("entrada recusada\n")
            return { status: "recusado" as const }
          }
          const token = randomBytes(32).toString("hex")
          const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          await client.query("INSERT INTO sessao (token, conta_id, expira) VALUES ($1, $2, $3)", [token, linha.id, expira])
          return { status: "ok" as const, token }
        })
      } catch (error) {
        if (bancoIndisponivel(error)) return { status: "erro" }
        throw error
      }
    },

    async lerSessao(token) {
      if (!token) return null
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          const linha = await client.query<{ conta_id: string; email: string; papel: "admin" | "comum"; expira: Date }>(
            `SELECT s.conta_id, c.email, c.papel, s.expira
             FROM sessao s JOIN conta c ON c.id = s.conta_id
             WHERE s.token = $1`,
            [token]
          )
          const row = linha.rows[0]
          if (!row) return null
          if (new Date(row.expira).getTime() <= Date.now()) return null
          return { contaId: row.conta_id, email: row.email, papel: row.papel }
        })
      } catch (error) {
        if (bancoIndisponivel(error)) return null
        throw error
      }
    },

    async apagarSessao(token) {
      try {
        await comCliente(async (client) => {
          await garantirSchema(client)
          await client.query("DELETE FROM sessao WHERE token = $1", [token])
        })
      } catch (error) {
        if (bancoIndisponivel(error)) return
        throw error
      }
    },

    async redefinirSenha(atorId, email, senha) {
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          await client.query("BEGIN")
          try {
            const ator = await client.query<{ papel: string }>("SELECT papel FROM conta WHERE id = $1", [atorId])
            const alvo = emailNormalizado(email)
            const conta = await client.query<{ id: string; email: string; papel: string }>(
              "SELECT id, email, papel FROM conta WHERE lower(email) = $1",
              [alvo]
            )
            const linha = conta.rows[0]
            const pode =
              ator.rows[0]?.papel === "admin" && linha && linha.papel !== "admin" && linha.email !== EMAIL_ADMIN
            if (!pode || senha === null) {
              await client.query("COMMIT")
              return { status: "inalterado" as const }
            }
            if (senha.length < SENHA_MINIMA) {
              await client.query("COMMIT")
              return { status: "senha-curta" as const }
            }
            const { sal, verificador } = await hashSenha(senha)
            await client.query("UPDATE conta SET sal = $2, verificador = $3 WHERE id = $1", [linha.id, sal, verificador])
            await client.query("DELETE FROM sessao WHERE conta_id = $1", [linha.id])
            await client.query("COMMIT")
            return { status: "trocada" as const }
          } catch (error) {
            await rollback(client)
            throw error
          }
        })
      } catch (error) {
        if (bancoIndisponivel(error)) return { status: "erro" }
        throw error
      }
    },

    async listarOutrasContas(atorId) {
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          const ator = await client.query<{ papel: string }>("SELECT papel FROM conta WHERE id = $1", [atorId])
          if (ator.rows[0]?.papel !== "admin") return []
          const linhas = await client.query<{ email: string }>(
            "SELECT email FROM conta WHERE papel <> 'admin' ORDER BY lower(email)"
          )
          return linhas.rows.map((row) => row.email)
        })
      } catch (error) {
        if (bancoIndisponivel(error)) return []
        throw error
      }
    },

    async contarContas() {
      try {
        return await comCliente(async (client) => {
          await garantirSchema(client)
          const lido = await client.query<{ n: number }>("SELECT count(*)::int AS n FROM conta")
          return Number(lido.rows[0]?.n ?? 0)
        })
      } catch (error) {
        if (bancoIndisponivel(error)) return null
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
      async garantirPrimeiraConta() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async criarConta() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async entrar() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async lerSessao() {
        return null
      },
      async apagarSessao() {},
      async redefinirSenha() {
        avisarIndisponivel()
        return { status: "erro" }
      },
      async listarOutrasContas() {
        return []
      },
      async contarContas() {
        avisarIndisponivel()
        return null
      },
      async fechar() {},
    }
  }
  return abrirBanco(databaseUrl)
}
