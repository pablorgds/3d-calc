import assert from "node:assert/strict"
import test from "node:test"
import {
  calculate,
  draftToCalcInput,
  formatBRL,
  formatDuration,
  formatGrams,
  parseDecimal,
  parseInteger,
  type CalcInput,
  type Field,
  type JobDraft,
  type MesaDraft,
} from "./custo.ts"

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
    coefficient: { status: "empty" },
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

test("cor única usa o peso da peça, não o peso gravado na cor", () => {
  const printer = { watts: "100", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }
  const input = draftToCalcInput(
    {
      mode: "peca",
      copies: "1",
      hours: "0",
      minutes: "0",
      labor: "0",
      colorMode: "unica",
      grams: "25",
      colors: [{ id: "c", name: "Azul", hex: "#00f", price: "80", grams: "1" }],
    },
    printer
  )
  assert.deepEqual(input.colors[0].grams, { status: "ok", value: 25 })
  assert.equal(calculate(input).piece.material, 2)
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

const mil = { watts: "1000", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }
const cem = { watts: "100", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }

function chapa(overrides: Partial<MesaDraft> = {}): MesaDraft {
  return { id: "m1", hours: "1", minutes: "0", name: "", hex: "#111111", price: "0", grams: "0", ...overrides }
}

function contaMesas(mesas: MesaDraft[], overrides: Partial<JobDraft> = {}, printer = mil) {
  return calculate(
    draftToCalcInput(
      {
        mode: "peca",
        copies: "1",
        hours: "",
        minutes: "",
        labor: "0",
        colorMode: "unica",
        grams: "",
        colors: [],
        mesas,
        ...overrides,
      },
      printer
    )
  )
}

test("duas mesas peca total 4", () => {
  const result = contaMesas([chapa({ id: "a" }), chapa({ id: "b" })])
  assert.equal(result.piece.material, 0)
  assert.equal(result.piece.energy, 2)
  assert.equal(result.piece.depreciation, 2)
  assert.equal(result.piece.labor, 0)
  assert.equal(result.piece.total, 4)
})

test("duas mesas lote total 8", () => {
  const result = contaMesas([chapa({ id: "a" }), chapa({ id: "b" })], { copies: "2" })
  assert.equal(result.lot.material, 0)
  assert.equal(result.lot.energy, 4)
  assert.equal(result.lot.depreciation, 4)
  assert.equal(result.lot.labor, 0)
  assert.equal(result.lot.total, 8)
  assert.equal(result.lot.minutes, 240)
})

test("duas mesas material 220", () => {
  const result = contaMesas(
    [
      chapa({ id: "a", hours: "0", minutes: "0", grams: "1000", price: "100" }),
      chapa({ id: "b", hours: "0", minutes: "0", grams: "1000", price: "100" }),
    ],
    { labor: "10" }
  )
  assert.equal(result.piece.material, 200)
  assert.equal(result.piece.energy, 0)
  assert.equal(result.piece.depreciation, 0)
  assert.equal(result.piece.labor, 20)
  assert.equal(result.piece.total, 220)
})

test("mesa aberta anula os totais", () => {
  const fechada = chapa({ id: "b" })
  for (const campo of ["hours", "minutes", "grams", "price"] as const) {
    for (const valor of ["", "-1"]) {
      const result = contaMesas([chapa({ id: "a", [campo]: valor }), fechada])
      assert.equal(result.piece.total, null, `${campo} ${valor} peca`)
      assert.equal(result.lot.total, null, `${campo} ${valor} lote`)
    }
  }
})

test("copias invalidas mantem a peca", () => {
  for (const copies of ["", "0", "2,5"]) {
    const result = contaMesas([chapa({ id: "a" }), chapa({ id: "b" })], { copies })
    assert.equal(result.piece.total, 4, copies)
    assert.equal(result.lot.total, null, copies)
  }
})

test("vida util zero deprecia zero", () => {
  const result = contaMesas([chapa({ id: "a" }), chapa({ id: "b" })], {}, { ...mil, lifeHours: "0" })
  assert.equal(result.piece.depreciation, 0)
  assert.equal(result.piece.total, 2)
})

test("preco 1,5 material 1.5", () => {
  const result = contaMesas([chapa({ hours: "0", minutes: "0", price: "1,5", grams: "1000" })])
  assert.equal(result.piece.material, 1.5)
})

test("nome vazio fecha a peca", () => {
  const result = contaMesas([chapa({ id: "a", name: "" }), chapa({ id: "b", name: "" })])
  assert.equal(result.piece.total, 4)
})

test("mao de obra vazia anula os totais", () => {
  const result = contaMesas([chapa({ id: "a" }), chapa({ id: "b" })], { labor: "" })
  assert.equal(result.piece.total, null)
  assert.equal(result.lot.total, null)
})

test("impressao sem mesas 1.86 e 3.72", () => {
  const result = calculate(
    draftToCalcInput(
      {
        mode: "lote",
        copies: "2",
        hours: "0",
        minutes: "60",
        labor: "20",
        colorMode: "multicolor",
        grams: "",
        colors: [
          { id: "a", name: "a", hex: "#111111", price: "100", grams: "10" },
          { id: "b", name: "b", hex: "#222222", price: "50", grams: "20" },
        ],
      },
      cem
    )
  )
  assert.equal(result.piece.total, 1.86)
  assert.equal(result.lot.total, 3.72)
  assert.equal(result.mesas, false)
})

test("mesa zerada fecha em 0", () => {
  const result = contaMesas([chapa({ hours: "0", minutes: "0", grams: "0", price: "0" })])
  assert.equal(result.piece.total, 0)
  assert.equal(result.lot.total, 0)
})

test("campo vazio e texto não viram zero", () => {
  assert.deepEqual(parseDecimal(""), { status: "empty" })
  assert.deepEqual(parseDecimal("abc"), { status: "invalid" })
  assert.deepEqual(parseDecimal("-1"), { status: "invalid" })
  assert.deepEqual(parseDecimal("1,5"), { status: "ok", value: 1.5 })
  assert.deepEqual(parseInteger("2,5"), { status: "invalid" })
  assert.deepEqual(parseInteger("0"), { status: "ok", value: 0 })
})

function dinheiro(value: number | null) {
  return value === null ? "—" : formatBRL(value)
}

function loteDeProva(coefficient: Field): CalcInput {
  return {
    mode: "peca",
    copies: ok(1),
    minutes: ok(0),
    watts: ok(100),
    energyPricePerKwh: ok(1),
    printerPrice: ok(1000),
    lifeHours: ok(1000),
    laborPercent: ok(10),
    coefficient,
    colors: [{ id: "a", name: "PLA", hex: "#111111", pricePerKg: ok(100), grams: ok(800) }],
  }
}

test("coeficiente vazio mantem a soma", () => {
  const result = calculate(loteDeProva({ status: "empty" }))
  assert.equal(dinheiro(result.piece.total), formatBRL(88))
  assert.equal(dinheiro(result.lot.total), formatBRL(88))
  assert.equal(dinheiro(result.piece.material), formatBRL(80))
  assert.equal(dinheiro(result.piece.labor), formatBRL(8))
  assert.equal(formatDuration(result.piece.minutes ?? 0), "0 min")
})

test("coeficiente 20 leva o total a 110", () => {
  const result = calculate(loteDeProva(ok(20)))
  assert.equal(dinheiro(result.piece.total), formatBRL(110))
  assert.equal(dinheiro(result.lot.total), formatBRL(110))
  assert.equal(dinheiro(result.piece.material), formatBRL(80))
  assert.equal(dinheiro(result.lot.material), formatBRL(80))
  assert.equal(dinheiro(result.piece.labor), formatBRL(8))
  assert.equal(formatGrams(result.piece.grams ?? 0), formatGrams(800))
  assert.equal(formatDuration(result.piece.minutes ?? 0), "0 min")
  assert.equal(formatDuration(result.lot.minutes ?? 0), "0 min")
})

test("coeficiente zero igual ao vazio", () => {
  const result = calculate(loteDeProva(ok(0)))
  assert.equal(dinheiro(result.piece.total), formatBRL(88))
  assert.equal(dinheiro(result.lot.total), formatBRL(88))
})

test("coeficiente 99 leva o total a 8800", () => {
  const result = calculate(loteDeProva(ok(99)))
  assert.equal(dinheiro(result.piece.total), formatBRL(8800))
  assert.equal(dinheiro(result.lot.total), formatBRL(8800))
})

test("coeficiente 99,9 leva o total a 88000", () => {
  const result = calculate(loteDeProva(parseDecimal("99,9")))
  assert.equal(dinheiro(result.piece.total), formatBRL(88000))
  assert.equal(dinheiro(result.lot.total), formatBRL(88000))
})

test("coeficiente 100 deixa o total sem fechar", () => {
  const result = calculate(loteDeProva(ok(100)))
  assert.equal(dinheiro(result.piece.total), "—")
  assert.equal(dinheiro(result.lot.total), "—")
  assert.equal(dinheiro(result.piece.material), formatBRL(80))
})

test("coeficiente 101 deixa o total sem fechar", () => {
  const result = calculate(loteDeProva(ok(101)))
  assert.equal(dinheiro(result.piece.total), "—")
  assert.equal(dinheiro(result.lot.total), "—")
})

test("coeficiente abc deixa o total sem fechar", () => {
  const result = calculate(loteDeProva({ status: "invalid" }))
  assert.equal(dinheiro(result.piece.total), "—")
  assert.equal(dinheiro(result.lot.total), "—")
})

test("coeficiente so espaco vale zero", () => {
  const result = calculate(loteDeProva(parseDecimal("   ")))
  assert.equal(dinheiro(result.piece.total), formatBRL(88))
  assert.equal(dinheiro(result.lot.total), formatBRL(88))
})

test("lote de 4 copia as linhas e o coeficiente so no total", () => {
  const result = calculate(
    loteDeProva(ok(20))
  )
  const lote = calculate({
    ...loteDeProva(ok(20)),
    mode: "lote",
    copies: ok(4),
  })
  assert.equal(dinheiro(lote.piece.total), formatBRL(27.5))
  assert.equal(dinheiro(lote.lot.total), formatBRL(110))
  assert.equal(dinheiro(lote.piece.material), formatBRL(20))
  assert.equal(dinheiro(lote.lot.material), formatBRL(80))
  assert.equal(dinheiro(lote.piece.labor), formatBRL(2))
  assert.equal(dinheiro(lote.lot.labor), formatBRL(8))
  assert.equal(result.piece.total, 110)
})

test("mesas com coeficiente 20", () => {
  const chapaProva = (id: string): MesaDraft => ({
    id,
    hours: "0",
    minutes: "0",
    name: "PLA",
    hex: "#111111",
    price: "100",
    grams: "400",
  })
  const result = calculate(
    draftToCalcInput(
      {
        mode: "peca",
        copies: "2",
        hours: "",
        minutes: "",
        labor: "10",
        colorMode: "unica",
        grams: "",
        colors: [],
        mesas: [chapaProva("a"), chapaProva("b")],
      },
      { watts: "100", energyPrice: "1", printerPrice: "1000", lifeHours: "1000", coefficient: "20" }
    )
  )
  assert.equal(dinheiro(result.piece.material), formatBRL(80))
  assert.equal(dinheiro(result.lot.material), formatBRL(160))
  assert.equal(dinheiro(result.piece.labor), formatBRL(8))
  assert.equal(dinheiro(result.lot.labor), formatBRL(16))
  assert.equal(dinheiro(result.piece.total), formatBRL(110))
  assert.equal(dinheiro(result.lot.total), formatBRL(220))
})

test("mesas sem copias fecham a peca", () => {
  const chapaProva = (id: string): MesaDraft => ({
    id,
    hours: "0",
    minutes: "0",
    name: "PLA",
    hex: "#111111",
    price: "100",
    grams: "400",
  })
  const result = calculate(
    draftToCalcInput(
      {
        mode: "peca",
        copies: "0",
        hours: "",
        minutes: "",
        labor: "10",
        colorMode: "unica",
        grams: "",
        colors: [],
        mesas: [chapaProva("a"), chapaProva("b")],
      },
      { watts: "100", energyPrice: "1", printerPrice: "1000", lifeHours: "1000", coefficient: "20" }
    )
  )
  assert.equal(dinheiro(result.piece.total), formatBRL(110))
  assert.equal(dinheiro(result.lot.total), "—")
})

test("mao de obra vazia nao fecha com coeficiente", () => {
  const result = calculate(loteDeProva(ok(20)))
  const sem = calculate({ ...loteDeProva(ok(20)), laborPercent: { status: "empty" } })
  assert.equal(dinheiro(result.piece.total), formatBRL(110))
  assert.equal(dinheiro(sem.piece.total), "—")
  assert.equal(dinheiro(sem.lot.total), "—")
})

const impressoraProva = {
  watts: "100",
  energyPrice: "1",
  printerPrice: "1000",
  lifeHours: "1000",
  coefficient: "",
}

function corProva(id: string, name: string, price: string, grams: string) {
  return { id, name, hex: "#111111", price, grams }
}

function impressaoDeProva(overrides: Partial<JobDraft> = {}): JobDraft {
  return {
    mode: "peca",
    copies: "1",
    hours: "0",
    minutes: "0",
    labor: "0",
    colorMode: "multicolor",
    grams: "",
    purge: "30",
    colors: [
      corProva("preto", "preto", "80", "20"),
      corProva("branco", "branco", "120", "10"),
      corProva("vermelho", "vermelho", "100", "5"),
    ],
    ...overrides,
  }
}

function contaProva(overrides: Partial<JobDraft> = {}, printer = impressoraProva) {
  return calculate(draftToCalcInput(impressaoDeProva(overrides), printer))
}

function perto(atual: number | null, esperado: number) {
  assert.notEqual(atual, null)
  assert.ok(Math.abs((atual ?? 0) - esperado) < 1e-9, `${atual} != ${esperado}`)
}

function linha(result: ReturnType<typeof calculate>, name: string) {
  const color = result.colors.find((item) => item.name === name)
  assert.ok(color)
  return color
}

test("purge 30 fecha material 9,90", () => {
  const result = contaProva()
  perto(linha(result, "preto").material, 1.6)
  perto(linha(result, "branco").material, 4.8)
  perto(linha(result, "vermelho").material, 3.5)
  perto(result.piece.material, 9.9)
  assert.equal(result.piece.grams, 35)
  assert.equal(result.lot.grams, 35)
})

test("purge vazio fecha material 3,30", () => {
  const result = contaProva({ purge: "" })
  perto(result.piece.material, 3.3)
  assert.equal(result.piece.grams, 35)
})

test("purge zero fecha material 3,30", () => {
  const result = contaProva({ purge: "0" })
  perto(result.piece.material, 3.3)
  assert.equal(result.piece.grams, 35)
})

test("purge so espacos fecha material 3,30", () => {
  const result = contaProva({ purge: "   " })
  perto(result.piece.material, 3.3)
  assert.equal(result.piece.grams, 35)
})

test("uma cor nao paga o purge", () => {
  const result = contaProva({
    purge: "30",
    colors: [corProva("preto", "preto", "80", "20")],
  })
  perto(result.piece.material, 1.6)
  assert.equal(result.piece.grams, 20)
})

test("ordem invertida muda quem paga o purge", () => {
  const result = contaProva({
    colors: [
      corProva("vermelho", "vermelho", "100", "5"),
      corProva("branco", "branco", "120", "10"),
      corProva("preto", "preto", "80", "20"),
    ],
  })
  perto(linha(result, "vermelho").material, 0.5)
  perto(linha(result, "branco").material, 4.8)
  perto(linha(result, "preto").material, 4)
  perto(result.piece.material, 9.3)
})

test("mesmo nome sao duas cores no purge", () => {
  const result = contaProva({
    colors: [corProva("a", "PLA preto", "80", "20"), corProva("b", "PLA preto", "120", "10")],
  })
  perto(result.colors[0].material, 1.6)
  perto(result.colors[1].material, 4.8)
  perto(result.piece.material, 6.4)
  assert.equal(result.piece.grams, 30)
})

test("purge 30,5 nas linhas", () => {
  const result = contaProva({ purge: "30,5" })
  perto(linha(result, "branco").material, 4.86)
  perto(linha(result, "vermelho").material, 3.55)
  perto(result.piece.material, 10.01)
})

test("purge abc anula material mao e totais", () => {
  const result = contaProva({ purge: "abc" })
  assert.equal(result.piece.material, null)
  assert.equal(result.piece.labor, null)
  assert.equal(result.piece.total, null)
  assert.equal(result.lot.total, null)
})

test("purge negativo anula o material", () => {
  const result = contaProva({ purge: "-1" })
  assert.equal(result.piece.material, null)
})

test("peso vazio anula antes do purge", () => {
  const result = contaProva({
    colors: [
      corProva("preto", "preto", "80", ""),
      corProva("branco", "branco", "120", "10"),
      corProva("vermelho", "vermelho", "100", "5"),
    ],
  })
  assert.equal(result.piece.material, null)
  assert.equal(result.materialIssue, "invalid-color")
})

test("sem cores e purge vazio da material 0", () => {
  const result = contaProva({ colors: [], purge: "" })
  assert.equal(result.piece.material, 0)
})

test("sem cores e purge 30 da material 0", () => {
  const result = contaProva({ colors: [], purge: "30" })
  assert.equal(result.piece.material, 0)
})

test("sem cores e purge abc anula o material", () => {
  const result = contaProva({ colors: [], purge: "abc" })
  assert.equal(result.piece.material, null)
})

test("cor unica ignora purge 30", () => {
  const result = contaProva({
    colorMode: "unica",
    grams: "800",
    purge: "30",
    colors: [corProva("a", "PLA", "100", "1")],
  })
  perto(result.piece.material, 80)
  assert.equal(result.piece.grams, 800)
})

test("mesa ignora purge 30", () => {
  const result = contaProva({
    copies: "1",
    labor: "0",
    purge: "30",
    mesas: [{ id: "m", hours: "0", minutes: "0", name: "PLA", hex: "#111111", price: "100", grams: "1000" }],
  })
  perto(result.piece.material, 100)
  assert.equal(result.piece.grams, 1000)
  perto(result.piece.total, 100)
})

test("mao de obra 10 inclui o purge", () => {
  const result = contaProva({ labor: "10" })
  perto(result.piece.material, 9.9)
  perto(result.piece.labor, 0.99)
  assert.equal(result.piece.grams, 35)
  perto(result.piece.total, 10.89)
})

test("sessenta min com purge 30", () => {
  const result = contaProva({ labor: "10", hours: "1", minutes: "0" })
  perto(result.piece.energy, 0.1)
  perto(result.piece.depreciation, 1)
  perto(result.piece.labor, 1.1)
  perto(result.piece.material, 9.9)
})

test("coeficiente 20 nao escala as linhas do purge", () => {
  const result = contaProva({}, { ...impressoraProva, coefficient: "20" })
  perto(result.piece.material, 9.9)
  perto(result.piece.labor, 0)
  assert.equal(result.piece.grams, 35)
  perto(result.piece.total, 12.375)
})

test("lote de 2 copias escala o purge", () => {
  const result = contaProva({ mode: "lote", copies: "2", labor: "0" })
  perto(result.lot.material, 9.9)
  perto(result.piece.material, 4.95)
  assert.equal(result.lot.grams, 35)
  assert.equal(result.piece.grams, 17.5)
  perto(linha(result, "preto").material, 1.6)
  perto(linha(result, "branco").material, 4.8)
  perto(linha(result, "vermelho").material, 3.5)
})

test("lote de 0 copias mantem o purge", () => {
  const result = contaProva({ mode: "lote", copies: "0", labor: "0" })
  assert.equal(result.piece.total, null)
  perto(result.lot.material, 9.9)
  assert.equal(result.lot.grams, 35)
})

test("purge abc mantem energia e depreciacao", () => {
  const result = contaProva({ purge: "abc", hours: "1", minutes: "0" })
  perto(result.piece.energy, 0.1)
  perto(result.piece.depreciation, 1)
  assert.equal(result.piece.material, null)
  assert.equal(result.piece.labor, null)
})
