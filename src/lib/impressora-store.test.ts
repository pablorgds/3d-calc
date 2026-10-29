import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import { erroCampo, parseDecimal, type Field } from "./custo.ts"
import {
  activatePrinter,
  criarOrdemDeAtualizacao,
  criarRevisaoDeGravacao,
  deletePrinter,
  insertPrinter,
  parsePrinterStore,
  persistirNumeroNoEvento,
  persistirTextoNoEvento,
  serializePrinterStore,
  updatePrinter,
  DEFAULT_PRINTER_ID,
  defaultPrinter,
} from "./impressora-store.ts"

function lerNumero(field: Field): number | null {
  if (field.status !== "ok") return null
  return field.value
}

test("sem gravação, a máquina é a K2 Pro", () => {
  const store = parsePrinterStore(null)
  assert.equal(store.activeId, DEFAULT_PRINTER_ID)
  assert.equal(store.printers.length, 1)
  assert.equal(store.printers[0].name, "K2 Pro")
  assert.equal(store.printers[0].watts, "150")
  assert.equal(store.printers[0].energyPrice, "1.18")
})

test("a gravação antiga de uma impressora vira a K2 Pro e guarda a tarifa", () => {
  const store = parsePrinterStore(
    JSON.stringify({
      version: 2,
      watts: "200",
      energyPrice: "0,95",
      printerPrice: "4000",
      lifeHours: "5000",
    })
  )
  assert.equal(store.printers.length, 1)
  assert.equal(store.printers[0].id, DEFAULT_PRINTER_ID)
  assert.equal(store.printers[0].name, "K2 Pro")
  assert.equal(store.printers[0].watts, "200")
  assert.equal(store.printers[0].energyPrice, "0,95")
  assert.equal(store.printers[0].printerPrice, "4000")
  assert.equal(store.printers[0].lifeHours, "5000")
})

test("zeros sem versão continuam sendo a K2 Pro preenchida", () => {
  const store = parsePrinterStore(
    JSON.stringify({ watts: "0", energyPrice: "0", printerPrice: "0", lifeHours: "0" })
  )
  assert.deepEqual(store.printers[0], defaultPrinter)
})

test("adicionar, marcar e remover impressora", () => {
  const start = parsePrinterStore(null)
  const added = insertPrinter(start, "ender")
  assert.equal(added.activeId, "ender")
  assert.equal(added.printers[1].name, "Nova impressora")
  assert.equal(added.printers[1].watts, "")
  assert.equal(added.printers[1].energyPrice, "")
  assert.equal(added.printers[1].printerPrice, "")
  assert.equal(added.printers[1].lifeHours, "")

  const renamed = updatePrinter(added, "ender", { name: "Ender 3", watts: "120" })
  assert.equal(renamed.printers[1].name, "Ender 3")
  assert.equal(renamed.printers[1].watts, "120")
  assert.equal(renamed.printers[0].name, "K2 Pro")

  const back = activatePrinter(renamed, DEFAULT_PRINTER_ID)
  assert.equal(back.activeId, DEFAULT_PRINTER_ID)

  const removed = deletePrinter(back, DEFAULT_PRINTER_ID)
  assert.equal(removed.printers.length, 1)
  assert.equal(removed.activeId, "ender")

  assert.equal(deletePrinter(removed, "ender"), removed)
})

test("a lista gravada reabre com a máquina marcada", () => {
  const store = parsePrinterStore(
    serializePrinterStore({
      activeId: "b",
      printers: [
        { ...defaultPrinter, id: "a", name: "A" },
        { ...defaultPrinter, id: "b", name: "B", watts: "80" },
      ],
    })
  )
  assert.equal(store.activeId, "b")
  assert.equal(store.printers[1].watts, "80")
})

test("payload sem coeficiente le vazio", () => {
  const store = parsePrinterStore(
    JSON.stringify({
      version: 3,
      activeId: "k2-pro",
      printers: [
        {
          id: "k2-pro",
          name: "K2 Pro",
          watts: "150",
          energyPrice: "1.18",
          printerPrice: "7979",
          lifeHours: "3000",
        },
      ],
    })
  )
  assert.equal(store.printers[0].coefficient, "")
})

test("payload de impressoras versao 3", () => {
  const cru = serializePrinterStore({
    activeId: defaultPrinter.id,
    printers: [{ ...defaultPrinter, coefficient: "20" }],
  })
  const json = JSON.parse(cru) as { version: number }
  assert.equal(json.version, 3)
  assert.equal(parsePrinterStore(cru).printers[0].coefficient, "20")
})

test("coeficiente 20 apos digitar rapido", () => {
  const id = defaultPrinter.id
  const ordem = criarOrdemDeAtualizacao()
  let store = parsePrinterStore(null)
  assert.equal(persistirNumeroNoEvento("blur", "change"), false)
  const cedo = ordem.marcar(id)
  assert.equal(persistirNumeroNoEvento("blur", "blur"), true)
  const blur = ordem.marcar(id)
  if (ordem.aceitar(id, blur)) store = updatePrinter(store, id, { coefficient: "20" })
  if (ordem.aceitar(id, cedo)) store = updatePrinter(store, id, { coefficient: "2" })
  assert.equal(store.printers[0].coefficient, "20")
  assert.notEqual(store.printers[0].coefficient, "2")
})

test("nome da nova impressora grava no blur e a resposta atrasada nao apaga o texto", () => {
  const id = "ender"
  let local = insertPrinter(parsePrinterStore(null), id)
  const revisao = criarRevisaoDeGravacao()
  const vistaAdd = revisao.tocar()
  assert.equal(persistirTextoNoEvento("change"), false)
  for (const nome of ["E", "En", "End", "Ende", "Ender 3"]) {
    revisao.tocar()
    local = updatePrinter(local, id, { name: nome })
  }
  assert.equal(local.printers[1].name, "Ender 3")
  const vindoDoAdicionar = insertPrinter(parsePrinterStore(null), id)
  if (revisao.aceitar(vistaAdd)) local = vindoDoAdicionar
  assert.equal(local.printers[1].name, "Ender 3")
  assert.notEqual(local.printers[1].name, "Nova impressora")

  assert.equal(persistirTextoNoEvento("blur"), true)
  const vistaBlur = revisao.atual()
  assert.equal(revisao.aceitar(vistaAdd), false)
  assert.equal(revisao.aceitar(vistaBlur), true)
  const ordem = criarOrdemDeAtualizacao()
  const cedo = ordem.marcar(id)
  const blur = ordem.marcar(id)
  if (ordem.aceitar(id, blur)) local = updatePrinter(local, id, { name: "Ender 3" })
  if (ordem.aceitar(id, cedo)) local = updatePrinter(local, id, { name: "E" })
  assert.equal(local.printers[1].name, "Ender 3")
})

test("nova impressora aceita nome e numeros sem ler value no campo vazio", () => {
  let store = insertPrinter(parsePrinterStore(null), "ender")
  const nova = store.printers[1]
  assert.equal(nova.name, "Nova impressora")
  assert.equal(lerNumero(parseDecimal(nova.watts)), null)
  assert.equal(lerNumero(parseDecimal(nova.energyPrice)), null)
  assert.equal(lerNumero(parseDecimal(nova.printerPrice)), null)
  assert.equal(lerNumero(parseDecimal(nova.lifeHours)), null)
  assert.equal(lerNumero(parseDecimal(nova.coefficient)), null)
  assert.equal(erroCampo(""), "Campo vazio.")
  assert.equal(erroCampo("abc"), "Use zero ou um número positivo.")
  assert.equal(persistirNumeroNoEvento("blur", "change"), false)

  assert.equal(persistirNumeroNoEvento("blur", "blur"), true)
  store = updatePrinter(store, "ender", {
    name: "Ender 3",
    watts: "120",
    energyPrice: "0,95",
    printerPrice: "2500",
    lifeHours: "4000",
    coefficient: "20",
  })
  const preenchida = store.printers[1]
  assert.equal(preenchida.name, "Ender 3")
  assert.equal(lerNumero(parseDecimal(preenchida.watts)), 120)
  assert.equal(lerNumero(parseDecimal(preenchida.energyPrice)), 0.95)
  assert.equal(lerNumero(parseDecimal(preenchida.printerPrice)), 2500)
  assert.equal(lerNumero(parseDecimal(preenchida.lifeHours)), 4000)
  assert.equal(lerNumero(parseDecimal(preenchida.coefficient)), 20)
  assert.equal(erroCampo(preenchida.watts), null)
  assert.equal(store.activeId, "ender")
})

test("a tela grava o nome no blur e mostra a impressora nova antes do banco", () => {
  const form = fs.readFileSync(new URL("../components/configuracoes-form.tsx", import.meta.url), "utf8")
  const cliente = fs.readFileSync(new URL("./impressora.ts", import.meta.url), "utf8")
  assert.match(form, /persistirTextoNoEvento\("change"\)/)
  assert.match(form, /editarImpressoraNaHora/)
  assert.match(form, /persistirTextoNoEvento\("blur"\)/)
  assert.match(form, /gravarImpressoraPendente/)
  assert.match(form, /key=\{active\.id\}/)
  const adicionar = cliente.slice(cliente.indexOf("export function addPrinter"), cliente.indexOf("export function removePrinter"))
  assert.match(adicionar, /gravarImpressoraPendente\(\)/)
  assert.ok(adicionar.includes("insertPrinter"))
  assert.ok(adicionar.indexOf("gravarImpressoraPendente") < adicionar.indexOf("insertPrinter"))
  assert.ok(adicionar.indexOf("insertPrinter") < adicionar.indexOf("adicionarImpressoraNoBanco"))
})

test("update impressora mais recente vence", () => {
  const id = defaultPrinter.id
  const ordem = criarOrdemDeAtualizacao()
  let store = parsePrinterStore(null)
  const primeiro = ordem.marcar(id)
  const segundo = ordem.marcar(id)
  if (ordem.aceitar(id, segundo)) store = updatePrinter(store, id, { coefficient: "20" })
  if (ordem.aceitar(id, primeiro)) store = updatePrinter(store, id, { coefficient: "2" })
  assert.equal(store.printers[0].coefficient, "20")
})
