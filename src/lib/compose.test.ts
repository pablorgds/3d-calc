import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"

const exec = promisify(execFile)
const root = path.resolve(import.meta.dirname, "../..")

type Servico = {
  image?: string
  command?: string[] | string | null
  environment?: Record<string, string>
  ports?: unknown[]
  volumes?: { source?: string; target?: string }[]
  healthcheck?: { test?: string[] | string }
}

async function composeConfig() {
  const { stdout } = await exec("docker", ["compose", "config", "--format", "json"], {
    cwd: root,
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  })
  return JSON.parse(stdout) as { services: Record<string, Servico>; volumes: Record<string, { name: string }> }
}

function comando(servico: Servico) {
  return Array.isArray(servico.command) ? servico.command.join(" ") : String(servico.command ?? "")
}

test.describe("compose", { concurrency: 1 }, () => {
  test.after(async () => {
    await exec("docker", ["rm", "-f", "custo-chapa-health-bad"], { windowsHide: true }).catch(() => undefined)
    await exec("docker", ["compose", "down"], { cwd: root, windowsHide: true }).catch(() => undefined)
  })

  test("compose responde 200", { timeout: 300_000 }, async () => {
    await exec("docker", ["compose", "up", "-d"], {
      cwd: root,
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024,
    })
    const inicio = Date.now()
    let ultimo = ""
    while (Date.now() - inicio < 240_000) {
      try {
        const resposta = await fetch("http://127.0.0.1:4317/")
        if (resposta.status === 200) return
        ultimo = String(resposta.status)
      } catch (error) {
        ultimo = error instanceof Error ? error.message : String(error)
      }
      await new Promise((resolver) => setTimeout(resolver, 2000))
    }
    throw new Error(ultimo)
  })

  test("compose define database url", async () => {
    const config = await composeConfig()
    assert.equal(config.services.app.environment?.DATABASE_URL, "postgresql://custo:custo@postgres:5432/custo_chapa")
  })

  test("compose postgres 18 custo", async () => {
    const config = await composeConfig()
    const postgres = config.services.postgres
    assert.equal(postgres.image, "postgres:18")
    assert.equal(postgres.environment?.POSTGRES_USER, "custo")
    assert.equal(postgres.environment?.POSTGRES_PASSWORD, "custo")
    assert.equal(postgres.environment?.POSTGRES_DB, "custo_chapa")
  })

  test("compose volume custo-chapa-pg", async () => {
    const config = await composeConfig()
    const volume = config.services.postgres.volumes?.find((item) => item.target === "/var/lib/postgresql")
    assert.equal(volume?.source, "custo-chapa-pg")
    assert.equal(config.volumes["custo-chapa-pg"].name, "3d-calc_custo-chapa-pg")
  })

  test("compose postgres sem porta", async () => {
    const config = await composeConfig()
    assert.equal(config.services.postgres.ports, undefined)
  })

  test("volume sobrevive ao down", { timeout: 180_000 }, async () => {
    await exec("docker", ["compose", "up", "-d", "postgres"], { cwd: root, windowsHide: true })
    await exec("docker", ["compose", "down"], { cwd: root, windowsHide: true })
    await exec("docker", ["compose", "up", "-d", "postgres"], { cwd: root, windowsHide: true })
    const { stdout } = await exec("docker", ["volume", "ls", "--format", "{{.Name}}"], { windowsHide: true })
    assert.match(stdout, /(^|\n)3d-calc_custo-chapa-pg(\n|$)/)
  })

  test("healthcheck pg_isready falho", { timeout: 120_000 }, async () => {
    const config = await composeConfig()
    const teste = config.services.postgres.healthcheck?.test
    const texto = Array.isArray(teste) ? teste.join(" ") : String(teste)
    assert.match(texto, /pg_isready -U custo -d custo_chapa/)

    await exec("docker", ["rm", "-f", "custo-chapa-health-bad"], { windowsHide: true }).catch(() => undefined)
    await exec(
      "docker",
      [
        "run",
        "-d",
        "--name",
        "custo-chapa-health-bad",
        "--network",
        "none",
        "--health-cmd",
        "pg_isready -U custo -d custo_chapa",
        "--health-interval",
        "1s",
        "--health-timeout",
        "2s",
        "--health-retries",
        "3",
        "postgres:18",
      ],
      { windowsHide: true }
    )
    const inicio = Date.now()
    let status = ""
    while (Date.now() - inicio < 40_000) {
      const { stdout } = await exec("docker", ["inspect", "-f", "{{.State.Health.Status}}", "custo-chapa-health-bad"], {
        windowsHide: true,
      })
      status = stdout.trim()
      if (status === "unhealthy") break
      await new Promise((resolver) => setTimeout(resolver, 1000))
    }
    assert.equal(status, "unhealthy")
  })

  test("compose app node 24", async () => {
    const config = await composeConfig()
    assert.equal(config.services.app.image, "node:24")
    assert.equal(comando(config.services.app), "npm run dev")
  })
})
