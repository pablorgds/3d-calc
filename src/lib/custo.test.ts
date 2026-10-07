import assert from "node:assert/strict"
import test from "node:test"
import { calculate, draftToCalcInput, parseDecimal, parseInteger, type CalcInput, type Field } from "./custo.ts"

const ok = (value: number): Field => ({ status: "ok", value })

function base(overrides: Partial<CalcInput> = {}): CalcInput {
  return {
    mode: "peca",
    copies: ok(2),
    minutes: ok(60),
    watts: ok(100),
    energyPricePerKwh: ok(1),
    printerPrice: ok(1000),
    lifeHours: ok(1000),
    laborPercent: ok(20),
    colors: [
      { id: "a", name: "PLA azul", hex: "#333333", pricePerKg: ok(100), grams: ok(10) },
      { id: "b", name: "PLA branco", hex: "#eeeeee", pricePerKg: ok(50), grams: ok(20) },
    ],
    ...overrides,
  }
}

test("dois filamentos no modo peça escalam o lote pelas cópias", () => {
  const result = calculate(base())
  assert.equal(result.piece.material, 2)
  assert.equal(result.piece.energy, 0.1)
  assert.equal(result.piece.depreciation, 1)
  assert.ok(Math.abs(result.piece.labor! - 0.62) < 1e-9)
  assert.ok(Math.abs(result.piece.total! - 3.72) < 1e-9)
  assert.equal(result.piece.minutes, 60)
  assert.equal(result.lot.material, 4)
  assert.equal(result.lot.energy, 0.2)
  assert.equal(result.lot.depreciation, 2)
  assert.ok(Math.abs(result.lot.labor! - 1.24) < 1e-9)
  assert.ok(Math.abs(result.lot.total! - 7.44) < 1e-9)
  assert.equal(result.lot.minutes, 120)
  assert.equal(result.colors[0].material, 1)
  assert.equal(result.colors[1].material, 1)
  assert.equal(result.depreciationBlocked, false)
})

test("modo lote divide peça e lote quando há cópias", () => {
  const result = calculate(base({ mode: "lote" }))
  assert.equal(result.lot.total, 3.72)
  assert.equal(result.lot.minutes, 60)
  assert.equal(result.piece.total, 1.86)
  assert.equal(result.piece.minutes, 30)
  assert.equal(result.piece.material, 1)
  assert.equal(result.lot.grams, 30)
  assert.equal(result.piece.grams, 15)
})

test("vida útil 0 zera a depreciação e não usa 1 hora", () => {
  const result = calculate(base({ lifeHours: ok(0) }))
  assert.equal(result.depreciationBlocked, true)
  assert.equal(result.lifeIssue, "zero")
  assert.equal(result.piece.depreciation, 0)
  assert.ok(Math.abs(result.piece.labor! - 0.42) < 1e-9)
  assert.ok(Math.abs(result.piece.total! - 2.52) < 1e-9)
  assert.notEqual(result.piece.depreciation, 1000)
})

test("cópias 0 no modo lote bloqueia a peça e mantém o lote", () => {
  const result = calculate(base({ mode: "lote", copies: ok(0) }))
  assert.equal(result.piece.blockedByCopies, true)
  assert.equal(result.piece.total, null)
  assert.equal(result.lot.total, 3.72)
  assert.equal(result.copiesIssue, "zero")
})

test("cópias 0 no modo peça zera o lote", () => {
  const result = calculate(base({ copies: ok(0) }))
  assert.equal(result.piece.total, 3.72)
  assert.equal(result.lot.total, 0)
  assert.equal(result.lot.blockedByCopies, false)
})

test("mão de obra não incide sobre si mesma", () => {
  const result = calculate(base())
  const baseCost = result.piece.material! + result.piece.energy! + result.piece.depreciation!
  assert.equal(result.piece.labor, baseCost * 0.2)
  assert.equal(result.piece.total, baseCost + result.piece.labor!)
})

test("peça única não usa as cópias guardadas no rascunho", () => {
  const printer = { watts: "100", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }
  const input = draftToCalcInput(
    { mode: "peca", copies: "8", hours: "1", minutes: "0", labor: "0", colors: [] },
    printer
  )
  assert.deepEqual(input.copies, { status: "ok", value: 1 })
  assert.deepEqual(input.minutes, { status: "ok", value: 60 })
})

test("lote lê as cópias e a tarifa vem da impressora", () => {
  const printer = { watts: "100", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }
  const input = draftToCalcInput(
    {
      mode: "lote",
      copies: "3",
      hours: "0",
      minutes: "30",
      labor: "10",
      colors: [{ id: "c", name: "Azul", hex: "#00f", price: "80", grams: "12" }],
    },
    printer
  )
  assert.deepEqual(input.copies, { status: "ok", value: 3 })
  assert.deepEqual(input.energyPricePerKwh, { status: "ok", value: 1 })
  assert.equal(input.colors[0].grams.status, "ok")
})

test("campo vazio e texto não viram zero", () => {
  assert.deepEqual(parseDecimal(""), { status: "empty" })
  assert.deepEqual(parseDecimal("abc"), { status: "invalid" })
  assert.deepEqual(parseDecimal("-1"), { status: "invalid" })
  assert.deepEqual(parseDecimal("1,5"), { status: "ok", value: 1.5 })
  assert.deepEqual(parseInteger("2,5"), { status: "invalid" })
  assert.deepEqual(parseInteger("0"), { status: "ok", value: 0 })
})
