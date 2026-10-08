import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const root = path.resolve(import.meta.dirname, "../..")

function fonte(relativo: string) {
  return fs.readFileSync(path.join(root, relativo), "utf8")
}

const FRASE_ADAPTER =
  "`impressora.ts` e `projetos.ts` leem e gravam pelo servidor. `custo.ts`, `impressora-store.ts` e `projetos-store.ts` continuam sem o driver do banco."

test("readme compose up", () => {
  const readme = fonte("README.md")
  const comoRodar = readme.slice(readme.indexOf("## Como rodar"), readme.indexOf("## O que existe hoje"))
  assert.match(comoRodar, /docker compose up/)
  assert.match(comoRodar, /http:\/\/127\.0\.0\.1:4317/)
})

test("dados no volume", () => {
  assert.match(fonte("docs/dados.md"), /impressoras e projetos ficam no Postgres do volume `custo-chapa-pg`/i)
})

test("adapters pelo servidor", () => {
  assert.match(fonte("AGENTS.md"), new RegExp(FRASE_ADAPTER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  assert.match(fonte("docs/arquitetura.md"), new RegExp(FRASE_ADAPTER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
})

test("so banco importa pg", () => {
  assert.match(fonte("src/lib/banco.ts"), /from "pg"/)
  for (const arquivo of [
    "src/lib/impressora.ts",
    "src/lib/projetos.ts",
    "src/lib/custo.ts",
    "src/lib/impressora-store.ts",
    "src/lib/projetos-store.ts",
  ]) {
    assert.equal(fonte(arquivo).includes('from "pg"'), false, arquivo)
  }
})
