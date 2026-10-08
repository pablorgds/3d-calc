import assert from "node:assert/strict"
import test from "node:test"
import { copyProject, parseProjects, removeProject, serializeProjects, upsertProject, type Project } from "./projetos-store.ts"

function project(overrides: Partial<Project> = {}): Project {
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
    updatedAt: 10,
    ...overrides,
  }
}

test("grava e reabre o lote com modo, cópias, tempo, mão de obra e cores", () => {
  const saved = project()
  const projects = parseProjects(serializeProjects([saved]))
  assert.equal(projects.length, 1)
  assert.deepEqual(projects[0], saved)
})

test("projeto antigo sem modo de cor vira uma cor e herda o peso", () => {
  const projects = parseProjects(
    JSON.stringify({
      version: 1,
      projects: [
        {
          id: "p1",
          name: "Suporte",
          printerId: "k2-pro",
          mode: "peca",
          copies: "0",
          hours: "1",
          minutes: "0",
          labor: "0",
          colors: [{ id: "c1", name: "PLA", hex: "#111111", price: "90", grams: "40" }],
          updatedAt: 1,
        },
      ],
    })
  )
  assert.equal(projects[0].colorMode, "unica")
  assert.equal(projects[0].grams, "40")
})

test("duas cores antigas continuam multicoloridas", () => {
  const projects = parseProjects(
    JSON.stringify({
      version: 1,
      projects: [
        {
          id: "p1",
          name: "Suporte",
          mode: "peca",
          colors: [
            { id: "a", name: "A", hex: "#111111", price: "1", grams: "10" },
            { id: "b", name: "B", hex: "#222222", price: "2", grams: "20" },
          ],
          updatedAt: 1,
        },
      ],
    })
  )
  assert.equal(projects[0].colorMode, "multicolor")
  assert.equal(projects[0].grams, "")
})

test("json inválido vira lista vazia", () => {
  assert.deepEqual(parseProjects("{"), [])
  assert.deepEqual(parseProjects(JSON.stringify({ projects: [{ name: "sem id" }] })), [])
})

test("atualizar o mesmo projeto não duplica, e o mais recente fica primeiro", () => {
  const older = project({ id: "a", name: "Antigo", updatedAt: 1 })
  const newer = project({ id: "b", name: "Novo", updatedAt: 5 })
  const updated = upsertProject(upsertProject([], older), newer)
  const again = upsertProject(updated, { ...older, name: "Antigo editado", updatedAt: 9 })
  assert.deepEqual(
    again.map((item) => item.id),
    ["a", "b"]
  )
  assert.equal(again[0].name, "Antigo editado")
  assert.equal(again.length, 2)
})

test("duplicar copia o lote e apagar tira só aquele", () => {
  const original = project()
  const copied = copyProject([original], original.id, "p2", 20)
  assert.equal(copied.length, 2)
  assert.equal(copied[0].id, "p2")
  assert.equal(copied[0].name, "Suporte (cópia)")
  assert.equal(copied[0].copies, "4")
  assert.equal(copied[0].colors[0].grams, "40")
  assert.notEqual(copied[0].colors[0], original.colors[0])

  const remaining = removeProject(copied, "p2")
  assert.equal(remaining.length, 1)
  assert.equal(remaining[0].id, "p1")
})
