import "./resolver-ts.ts"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { calculate, draftToCalcInput, errosAoGravar, formatBRL, formatDuration, type MesaDraft } from "./custo.ts"
import type { Project } from "./projetos-store.ts"

const { ganharMesa, perderMesa } = await import("./projetos-store.ts")
const {
  AVISO_COPIAS_PRODUTO,
  DESCRICAO_CONFIG_LENDO,
  DESCRICAO_PROJETOS_LENDO,
  FRASE_AUSENTE,
  FRASE_GRAVADO,
  FRASE_GRAVAR,
  FRASE_MESAS,
  FRASE_VARIAS_CORES,
  LEGENDA_LOTE,
  LEDE_CONFIG,
  LEDE_PROJETOS,
  ROTULO_MAO_DE_OBRA,
  TEXTO_LENDO,
  TITULO_ERRO,
  TITULO_VAZIO,
  avisoCopiasProduto,
  descricaoProjeto,
  fichaCalculadora,
  frasesCalculadora,
  textoDeTotal,
  vistaCarregamento,
  AVISO_IMPRESSORA_REMOVIDA,
  ROTULO_CLIENTE,
  ROTULO_COEFICIENTE,
  ROTULO_COPIAR,
  ROTULO_TELEFONE,
  linhaCliente,
  mascaraTelefone,
  notasResultado,
  podeCopiarOrcamento,
  textoAposCopia,
  textoOrcamento,
} = await import("./vistas.ts")

const root = path.resolve(import.meta.dirname, "../..")

function fonte(relativo: string) {
  return fs.readFileSync(path.join(root, relativo), "utf8")
}

test("configuracoes lendo desta conta", () => {
  const vista = vistaCarregamento("configuracoes", "lendo")
  assert.equal(vista.descricao, "As impressoras desta conta ficam no banco deste computador.")
})

test("projetos lendo desta conta", () => {
  const vista = vistaCarregamento("projetos", "lendo")
  assert.equal(vista.descricao, "Os projetos desta conta ficam no banco deste computador.")
})

test("tres telas lendo", () => {
  for (const tela of ["calculadora", "projetos", "configuracoes"] as const) {
    const vista = vistaCarregamento(tela, "lendo")
    assert.equal(vista.titulo, TEXTO_LENDO)
    assert.equal(vista.titulo, "Lendo impressoras e projetos.")
  }
  assert.match(fonte("src/components/calculadora.tsx"), /vistaCarregamento\("calculadora", "lendo"\)/)
  assert.match(fonte("src/components/lista-projetos.tsx"), /vistaCarregamento\("projetos", "lendo"\)/)
  assert.match(fonte("src/components/configuracoes-form.tsx"), /vistaCarregamento\("configuracoes", "lendo"\)/)
})

test("tres telas sem banco", () => {
  for (const tela of ["calculadora", "projetos", "configuracoes"] as const) {
    const vista = vistaCarregamento(tela, "erro")
    assert.equal(vista.titulo, TITULO_ERRO)
    assert.equal(vista.titulo, "Não deu para ler o banco.")
    assert.equal(vista.mostraVazio, false)
    assert.equal(vista.mostraFormulario, false)
    assert.notEqual(vista.titulo, TITULO_VAZIO)
  }
  const lista = fonte("src/components/lista-projetos.tsx")
  const config = fonte("src/components/configuracoes-form.tsx")
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.ok(lista.indexOf('vistaCarregamento("projetos", "erro")') < lista.indexOf("Nenhum projeto salvo"))
  assert.ok(config.indexOf('vistaCarregamento("configuracoes", "erro")') < config.indexOf("Potência (W)"))
  assert.match(calculadora, /vistaCarregamento\("calculadora", "erro"\)/)
  assert.doesNotMatch(calculadora, /Adicionar impressora/)
})

test("lede de projetos", () => {
  assert.equal(
    LEDE_PROJETOS,
    "Lotes gravados no banco: modo, cópias, tempo, mão de obra e cores. A tarifa fica na impressora, então o total acompanha a máquina. Abrir marca a impressora do projeto."
  )
  assert.match(fonte("src/app/projetos/page.tsx"), /LEDE_PROJETOS/)
})

test("lede de configuracoes", () => {
  assert.equal(
    LEDE_CONFIG,
    "A K2 Pro já vem preenchida: 150 W, R$ 1,18 por kWh, R$ 7.979 e 3.000 horas. Dá para ter mais de uma máquina; a calculadora usa a marcada. A tarifa fica na impressora, no banco deste computador."
  )
  assert.match(fonte("src/app/configuracoes/page.tsx"), /LEDE_CONFIG/)
})

test("frase gravar o lote", () => {
  assert.equal(frasesCalculadora("novo").gravar, FRASE_GRAVAR)
  assert.equal(frasesCalculadora("novo").gravar, "Gravar o lote deixa o projeto no banco.")
  assert.match(fonte("src/components/calculadora.tsx"), /frases\.gravar/)
})

test("projeto ausente no banco", () => {
  assert.equal(frasesCalculadora("ausente").ausente, FRASE_AUSENTE)
  assert.equal(frasesCalculadora("ausente").ausente, "Esse projeto não está no banco. Salvar cria um novo.")
  assert.equal(frasesCalculadora("gravado").ausente, null)
  assert.match(fonte("src/components/calculadora.tsx"), /frases\.ausente/)
})

test("projeto gravado no banco", () => {
  assert.equal(frasesCalculadora("gravado").descricao, FRASE_GRAVADO)
  assert.equal(frasesCalculadora("gravado").descricao, "Gravado no banco. Salvar de novo atualiza este projeto.")
  assert.match(fonte("src/components/calculadora.tsx"), /frases\.descricao/)
})

test("configuracoes lendo o banco", () => {
  const vista = vistaCarregamento("configuracoes", "lendo")
  assert.equal(vista.descricao, DESCRICAO_CONFIG_LENDO)
  assert.equal(vista.descricao, "As impressoras desta conta ficam no banco deste computador.")
  assert.match(fonte("src/components/configuracoes-form.tsx"), /vista\.descricao/)
})

const mil = { watts: "1000", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }

function mesa(overrides: Partial<MesaDraft> = {}): MesaDraft {
  return { id: "m1", hours: "1", minutes: "0", name: "PLA preto", hex: "#111111", price: "0", grams: "0", ...overrides }
}

function projetoVista(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    name: "Suporte",
    printerId: "k2-pro",
    mode: "peca",
    copies: "1",
    hours: "",
    minutes: "",
    labor: "0",
    colorMode: "unica",
    grams: "",
    colors: [],
    mesas: [],
    clientName: "",
    clientPhone: "",
    updatedAt: 10,
    ...overrides,
  }
}

test("copias invalidas bloqueiam o lote", () => {
  for (const copies of ["", "0", "2,5"]) {
    assert.equal(avisoCopiasProduto(copies), AVISO_COPIAS_PRODUTO)
    assert.equal(
      avisoCopiasProduto(copies),
      "Custo do lote bloqueado. Cópias do produto precisa ser um inteiro maior que zero."
    )
  }
  assert.equal(avisoCopiasProduto("1"), null)
  assert.equal(avisoCopiasProduto("2"), null)
  assert.match(fonte("src/components/calculadora.tsx"), /avisoCopiasProduto/)
})

test("calculadora mostra os campos da mesa", () => {
  const calculadora = fonte("src/components/calculadora.tsx")
  for (const campo of ["mesa.hours", "mesa.minutes", "mesa.name", "mesa.hex", "mesa.price", "mesa.grams"]) {
    assert.match(calculadora, new RegExp(campo.replace(".", "\\.")))
  }
  const mesas = [
    mesa({ hours: "1", minutes: "0", name: "PLA preto", hex: "#111111", price: "100", grams: "10" }),
    mesa({ id: "m2", hours: "2", minutes: "15", name: "PETG", hex: "#222222", price: "80", grams: "20" }),
  ]
  assert.equal(mesas[0]?.name, "PLA preto")
  assert.equal(mesas[1]?.name, "PETG")
  assert.deepEqual(
    mesas.map((item) => [item.hours, item.minutes, item.name, item.hex, item.price, item.grams]),
    [
      ["1", "0", "PLA preto", "#111111", "100", "10"],
      ["2", "15", "PETG", "#222222", "80", "20"],
    ]
  )
})

test("recusa mesa em varias cores", () => {
  assert.equal(FRASE_VARIAS_CORES, "Esta impressão tem várias cores num tempo só. A mesa leva uma cor.")
  const recusa = ganharMesa(
    projetoVista({
      colors: [
        { id: "a", name: "A", hex: "#111111", price: "100", grams: "10" },
        { id: "b", name: "B", hex: "#222222", price: "80", grams: "20" },
      ],
    }),
    "nova"
  )
  assert.equal(recusa.status, "recusado")
  assert.match(fonte("src/components/calculadora.tsx"), /FRASE_VARIAS_CORES/)
})

test("totais em traco com mesa aberta", () => {
  const result = calculate(
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
        mesas: [mesa({ price: "100", grams: "10" }), mesa({ id: "aberta", hours: "", minutes: "", price: "", grams: "" })],
      },
      mil
    )
  )
  assert.equal(result.piece.total, null)
  assert.equal(result.lot.total, null)
  assert.equal(textoDeTotal(result.piece.total), "—")
  assert.equal(textoDeTotal(result.lot.total), "—")
  assert.match(fonte("src/components/calculadora.tsx"), /textoDeTotal/)
})

test("lista duas mesas", () => {
  const linha = descricaoProjeto(projetoVista({ mesas: [mesa(), mesa({ id: "m2" })], copies: "4", labor: "30" })).linha
  assert.equal(linha, "2 mesas · 4 cópias do produto · mão de obra 30%")
  assert.match(fonte("src/components/lista-projetos.tsx"), /descricaoProjeto/)
})

test("lista uma mesa", () => {
  const linha = descricaoProjeto(projetoVista({ mesas: [mesa()] })).linha
  assert.match(linha, /1 mesa/)
  assert.equal(linha.includes("1 mesas"), false)
})

test("lista de mesas sem sem cores", () => {
  const descricao = descricaoProjeto(projetoVista({ mesas: [mesa(), mesa({ id: "m2" })] }))
  assert.equal(descricao.linha.includes("sem cores"), false)
  assert.equal(descricao.linha.includes("tempo incompleto"), false)
  assert.equal(descricao.legenda, LEGENDA_LOTE)
  assert.equal(descricao.legenda, "lote, tarifa atual")
  assert.match(fonte("src/components/lista-projetos.tsx"), /parts\.legenda/)
})

test("lista sem mesas nao conta mesa", () => {
  const linha = descricaoProjeto(
    projetoVista({ name: "Suporte", mode: "lote", copies: "4", hours: "2", minutes: "15", labor: "30", mesas: [] })
  ).linha
  assert.equal(linha.includes("mesa"), false)
})

test("frase de projeto ausente", () => {
  assert.equal(frasesCalculadora("ausente").ausente, FRASE_AUSENTE)
  assert.equal(frasesCalculadora("ausente").ausente, "Esse projeto não está no banco. Salvar cria um novo.")
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.match(calculadora, /missing && projectId/)
  assert.match(calculadora, /frases\.ausente/)
})

test("rotulos de mao de obra e copias", () => {
  const ficha = fichaCalculadora(true, "peca")
  assert.equal(ficha.maoDeObra, ROTULO_MAO_DE_OBRA)
  assert.equal(ficha.maoDeObra, "Mão de obra (%)")
  assert.equal(ficha.copias, "Cópias do produto")
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.maoDeObra/)
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.copias/)
})

test("sem modos da impressao unica", () => {
  const modos = fichaCalculadora(true, "lote").modos
  for (const modo of ["Uma peça", "O lote inteiro", "Uma cor", "Várias cores"]) {
    assert.equal(modos.includes(modo), false, modo)
  }
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.modos\.length > 0/)
})

test("modos da impressao unica", () => {
  const modos = fichaCalculadora(false, "peca").modos
  for (const modo of ["Uma peça", "O lote inteiro", "Uma cor", "Várias cores"]) {
    assert.equal(modos.includes(modo), true, modo)
  }
})

test("frase de cada mesa", () => {
  assert.equal(
    FRASE_MESAS,
    "Cada mesa é uma chapa: um tempo e um filamento. A peça soma as mesas. As cópias multiplicam o produto."
  )
  assert.equal(fichaCalculadora(true, "peca").frase, FRASE_MESAS)
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.frase/)
})

test("lista recalcula com a tarifa", () => {
  const project = projetoVista({
    copies: "1",
    labor: "0",
    mesas: [mesa({ id: "a" }), mesa({ id: "b" })],
  })
  assert.equal(calculate(draftToCalcInput(project, mil)).lot.total, 4)
  assert.equal(calculate(draftToCalcInput(project, { ...mil, energyPrice: "2" })).lot.total, 6)
  assert.match(fonte("src/components/lista-projetos.tsx"), /draftToCalcInput/)
})

test("gravar mesa campo vazio", () => {
  const cheia = mesa({ id: "a", hours: "1", minutes: "0", price: "10", grams: "10" })
  const base = {
    mode: "peca" as const,
    copies: "1",
    hours: "",
    minutes: "",
    labor: "0",
    colorMode: "unica" as const,
    grams: "",
    colors: [],
    mesas: [cheia],
  }
  const campoParaId = { hours: "a-horas", minutes: "a-minutos", price: "a-preco", grams: "a-peso" } as const
  for (const campo of ["hours", "minutes", "price", "grams"] as const) {
    const erros = errosAoGravar({ ...base, mesas: [{ ...cheia, [campo]: "" }] })
    assert.equal(erros[campoParaId[campo]], "Campo vazio.")
  }
  assert.equal(errosAoGravar({ ...base, copies: "" }).copias, "Campo vazio.")
  assert.equal(errosAoGravar({ ...base, labor: "" })["mao-de-obra"], "Campo vazio.")
  assert.match(fonte("src/components/calculadora.tsx"), /errosAoGravar/)
})

test("gravar mesa numero invalido", () => {
  const cheia = mesa({ id: "a", hours: "1", minutes: "0", price: "10", grams: "10" })
  const base = {
    mode: "peca" as const,
    copies: "1",
    hours: "",
    minutes: "",
    labor: "0",
    colorMode: "unica" as const,
    grams: "",
    colors: [],
    mesas: [cheia],
  }
  const campoParaId = { hours: "a-horas", minutes: "a-minutos", price: "a-preco", grams: "a-peso" } as const
  for (const campo of ["hours", "minutes", "price", "grams"] as const) {
    const erros = errosAoGravar({ ...base, mesas: [{ ...cheia, [campo]: "-1" }] })
    assert.equal(erros[campoParaId[campo]], "Use zero ou um número positivo.")
  }
  assert.equal(errosAoGravar({ ...base, copies: "-1" }).copias, "Use zero ou um número positivo.")
  assert.equal(errosAoGravar({ ...base, labor: "-1" })["mao-de-obra"], "Use zero ou um número positivo.")
})

test("remover mesa sem confirmar", () => {
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.match(calculadora, /mesa-remover-/)
  assert.doesNotMatch(calculadora, /confirmar-apagar/)
  const depois = perderMesa(
    projetoVista({
      copies: "2",
      mesas: [mesa({ id: "sai" }), mesa({ id: "fica" })],
    }),
    "sai"
  )
  assert.equal(depois.mesas?.some((item) => item.id === "sai"), false)
  assert.equal(depois.mesas?.some((item) => item.id === "fica"), true)
})

test("frases da impressao unica", () => {
  const lote = fichaCalculadora(false, "lote")
  const peca = fichaCalculadora(false, "peca")
  assert.equal(lote.copias, "Cópias na mesa")
  assert.equal(lote.peso?.includes("Peso da mesa"), true)
  assert.equal(peca.peso?.includes("Peso da peça"), true)
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.copias/)
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.peso/)
})

test("mesas sem frases da chapa", () => {
  const ficha = fichaCalculadora(true, "lote")
  assert.equal(ficha.copias?.includes("Cópias na mesa"), false)
  assert.equal(ficha.peso, null)
  assert.equal(String(ficha.peso ?? "").includes("Peso da mesa"), false)
})

test("projetos lendo o banco", () => {
  const vista = vistaCarregamento("projetos", "lendo")
  assert.equal(vista.descricao, DESCRICAO_PROJETOS_LENDO)
  assert.equal(vista.descricao, "Os projetos desta conta ficam no banco deste computador.")
  assert.match(fonte("src/components/lista-projetos.tsx"), /vista\.descricao/)
})

const prova = { name: "Prova", watts: "100", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }

function loteFechado(overrides: Partial<Project> = {}) {
  return projetoVista({
    name: "Suporte",
    mode: "lote",
    copies: "2",
    hours: "1",
    minutes: "0",
    labor: "20",
    colorMode: "multicolor",
    grams: "",
    colors: [
      { id: "a", name: "PLA preto", hex: "#111111", price: "100", grams: "10" },
      { id: "b", name: "PLA branco", hex: "#ffffff", price: "50", grams: "20" },
    ],
    clientName: "Ana",
    clientPhone: "11999990000",
    ...overrides,
  })
}

function textoDo(project: Project, printer = prova, impressoraRemovida = false) {
  const result = calculate(draftToCalcInput(project, printer))
  return {
    result,
    texto: textoOrcamento({
      lote: project.name,
      clientName: project.clientName,
      clientPhone: project.clientPhone,
      printer,
      impressoraRemovida,
      mode: project.mode,
      result,
    }),
  }
}

test("lista mostra cliente", () => {
  const linha = linhaCliente(projetoVista({ clientName: "Ana", clientPhone: "11999990000" }))
  assert.equal(linha?.includes("Ana"), true)
  assert.equal(linha?.includes("11999990000"), true)
  assert.match(fonte("src/components/lista-projetos.tsx"), /linhaCliente/)
})

test("lista sem cliente no recorte", () => {
  const vazio = projetoVista({ clientName: "", clientPhone: "" })
  const espaco = projetoVista({ clientName: "   ", clientPhone: "  " })
  assert.equal(linhaCliente(vazio), null)
  assert.equal(linhaCliente(espaco), null)
  assert.equal(descricaoProjeto(espaco).linha, descricaoProjeto(vazio).linha)
})

test("campos cliente e telefone", () => {
  assert.equal(ROTULO_CLIENTE, "Cliente")
  assert.equal(ROTULO_TELEFONE, "Telefone")
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.match(calculadora, /ROTULO_CLIENTE/)
  assert.match(calculadora, /ROTULO_TELEFONE/)
  assert.equal(calculadora.includes("clientName.trim()"), false)
})

test("mascara de telefone", () => {
  assert.equal(mascaraTelefone(""), "")
  assert.equal(mascaraTelefone("1"), "(1")
  assert.equal(mascaraTelefone("11"), "(11")
  assert.equal(mascaraTelefone("119"), "(11) 9")
  assert.equal(mascaraTelefone("1199999"), "(11) 99999")
  assert.equal(mascaraTelefone("11999990"), "(11) 99999-0")
  assert.equal(mascaraTelefone("11999990000"), "(11) 99999-0000")
  assert.equal(mascaraTelefone("11999990000123"), "(11) 99999-0000")
  assert.equal(mascaraTelefone("(11) 99999-0000"), "(11) 99999-0000")
  assert.equal(mascaraTelefone("11 99999-0000"), "(11) 99999-0000")
  assert.equal(mascaraTelefone("11a99999b0000"), "(11) 99999-0000")
  assert.equal(mascaraTelefone("(11 99999-0000", "(11) 99999-0000"), "(11) 99999-000")
  assert.equal(mascaraTelefone("(11) 99999-000", "(11) 99999-0000"), "(11) 99999-000")
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.match(calculadora, /mascaraTelefone\(event\.target\.value, clientPhone\)/)
  assert.match(calculadora, /placeholder="\(00\) 00000-0000"/)
})

test("botao copiar orcamento quando o lote fecha", () => {
  const { result } = textoDo(loteFechado())
  assert.equal(result.lot.total !== null, true)
  assert.equal(podeCopiarOrcamento(result.lot.total), true)
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.match(calculadora, /podeCopiarOrcamento/)
  assert.match(calculadora, /ROTULO_COPIAR/)
  assert.equal(ROTULO_COPIAR, "Copiar orçamento")
})

test("texto do orcamento do lote fechado", () => {
  const project = loteFechado()
  const { result, texto } = textoDo(project)
  const marcas = ["*Suporte*", "*Cliente: Ana*", "*Telefone: 11999990000*", "*Por peça:", "*Lote:"]
  let anterior = -1
  for (const marca of marcas) {
    const em = texto.indexOf(marca)
    assert.ok(em > anterior, marca)
    anterior = em
  }
  assert.equal(texto.includes(formatBRL(result.piece.total ?? 0)), true)
  assert.equal(texto.includes(formatBRL(result.lot.total ?? 0)), true)
  assert.equal(texto.includes(formatDuration(result.piece.minutes ?? 0)), true)
  assert.equal(texto.includes(formatDuration(result.lot.minutes ?? 0)), true)
  assert.equal(
    texto.includes(`*Por peça: ${formatBRL(result.piece.total ?? 0)} · ${formatDuration(result.piece.minutes ?? 0)}*`),
    true
  )
  assert.equal(texto.includes("Material"), false)
  assert.equal(texto.includes("\n\n"), true)
})

test("texto de peca unica cabe no whatsapp", () => {
  const project = projetoVista({
    name: "Cubo Infinito",
    mode: "peca",
    hours: "1",
    minutes: "30",
    labor: "20",
    grams: "28.79",
    colors: [{ id: "a", name: "PLA preto", hex: "#111111", price: "100", grams: "28.79" }],
  })
  const { result, texto } = textoDo(project)
  assert.equal(result.piece.total !== null, true)
  assert.equal(formatBRL(result.piece.total ?? 0), formatBRL(result.lot.total ?? 0))
  assert.equal(texto.startsWith("*Cubo Infinito*"), true)
  assert.equal(texto.includes("*Por peça:"), false)
  assert.equal(texto.includes("*Lote:"), false)
  assert.equal(texto.includes(`*Total: ${formatBRL(result.lot.total ?? 0)} · ${formatDuration(result.lot.minutes ?? 0)}*`), true)
  assert.equal(texto.includes("Material"), false)
  assert.equal(texto.includes(" a peça · "), false)
  assert.equal(texto.includes("\n\n*Total:"), true)
})

test("texto sem linhas de cliente", () => {
  const { texto } = textoDo(
    projetoDeProva({ clientName: "   ", clientPhone: "  " }),
    { ...prova, coefficient: "20" }
  )
  assert.equal(texto.includes("Cliente:"), false)
  assert.equal(texto.includes("Telefone:"), false)
  assert.equal(texto.includes(formatBRL(110)), true)
})

test("texto sem por peca com copias 0", () => {
  const project = projetoVista({
    mode: "lote",
    copies: "0",
    hours: "1",
    minutes: "0",
    labor: "20",
    colorMode: "unica",
    grams: "10",
    colors: [{ id: "a", name: "PLA", hex: "#111111", price: "100", grams: "10" }],
  })
  const { result, texto } = textoDo(project)
  assert.equal(result.piece.total, null)
  assert.equal(result.lot.total !== null, true)
  assert.equal(texto.includes("Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero."), false)
  assert.equal(texto.includes(formatBRL(result.lot.total ?? 0)), true)
  assert.equal(texto.includes("Por peça"), false)
})

test("sem botao quando o lote nao fecha", () => {
  const project = projetoVista({
    copies: "0",
    labor: "10",
    mesas: [
      mesa({ id: "a", hours: "0", minutes: "0", grams: "1000", price: "100" }),
      mesa({ id: "b", hours: "0", minutes: "0", grams: "1000", price: "100" }),
    ],
  })
  const result = calculate(draftToCalcInput(project, prova))
  assert.equal(result.piece.total !== null, true)
  assert.equal(result.lot.total, null)
  assert.equal(podeCopiarOrcamento(result.lot.total), false)
})

test("texto com impressora removida", () => {
  const { texto } = textoDo(loteFechado(), prova, true)
  assert.equal(texto.includes(AVISO_IMPRESSORA_REMOVIDA), false)
  assert.equal(texto.includes("Prova:"), false)
})

test("texto segue bia da tela", () => {
  const { texto } = textoDo(loteFechado({ clientName: "Bia" }))
  assert.equal(texto.includes("Bia"), true)
  assert.equal(texto.includes("Cliente: Ana"), false)
})

test("copia falha mostra o texto", () => {
  const { texto } = textoDo(loteFechado())
  assert.equal(textoAposCopia(true, texto), texto)
  assert.equal(textoAposCopia(false, texto), null)
  assert.match(fonte("src/components/calculadora.tsx"), /textoAposCopia/)
})

test("texto fica e a lista reprecifica", () => {
  const project = loteFechado()
  const antigo = textoDo(project)
  const novo = calculate(draftToCalcInput(project, { ...prova, energyPrice: "2" }))
  assert.notEqual(novo.lot.total, antigo.result.lot.total)
  assert.equal(antigo.texto.includes(formatBRL(antigo.result.lot.total ?? 0)), true)
  assert.equal(antigo.texto.includes(formatBRL(novo.lot.total ?? 0)), false)
  assert.match(fonte("src/components/lista-projetos.tsx"), /draftToCalcInput/)
})

test("texto com nenhuma cor", () => {
  const project = projetoVista({ mode: "peca", copies: "1", hours: "1", minutes: "0", labor: "0", colors: [] })
  const { result, texto } = textoDo(project)
  assert.equal(result.lot.total !== null, true)
  assert.equal(texto.includes("Nenhuma cor de filamento. O material entra como R$ 0,00."), false)
})

test("texto sem nome das cores", () => {
  const { texto } = textoDo(loteFechado())
  assert.equal(texto.includes("PLA preto"), false)
  assert.equal(texto.includes("PLA branco"), false)
})

test("lista sem copiar orcamento", () => {
  const lista = fonte("src/components/lista-projetos.tsx")
  assert.equal(lista.includes("Copiar orçamento"), false)
  assert.equal(lista.includes("ROTULO_COPIAR"), false)
})

function projetoDeProva(overrides: Partial<Project> = {}) {
  return projetoVista({
    name: "Suporte",
    mode: "peca",
    copies: "1",
    hours: "0",
    minutes: "0",
    labor: "10",
    colorMode: "unica",
    grams: "800",
    colors: [{ id: "a", name: "PLA preto", hex: "#111111", price: "100", grams: "800" }],
    clientName: "Ana",
    clientPhone: "11999990000",
    ...overrides,
  })
}

const prova20 = { ...prova, coefficient: "20" }

test("campo coeficiente de erro", () => {
  assert.equal(ROTULO_COEFICIENTE, "Coeficiente de erro (%)")
  const ficha = fonte("src/components/configuracoes-form.tsx")
  assert.match(ficha, /ROTULO_COEFICIENTE/)
  assert.match(ficha, /id="coeficiente"/)
})

test("tabela sem linha de coeficiente", () => {
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.equal(calculadora.includes("Coeficiente de erro (%)"), false)
  assert.equal(calculadora.includes("Peças perdidas"), false)
})

test("lista acompanha coeficiente 20", () => {
  const total = calculate(draftToCalcInput(projetoDeProva(), prova20)).lot.total
  assert.equal(formatBRL(total ?? 0), formatBRL(110))
  assert.match(fonte("src/components/lista-projetos.tsx"), /draftToCalcInput/)
})

test("lista volta ao total sem coeficiente", () => {
  const total = calculate(draftToCalcInput(projetoDeProva(), { ...prova, coefficient: "" })).lot.total
  assert.equal(formatBRL(total ?? 0), formatBRL(88))
  assert.match(fonte("src/components/lista-projetos.tsx"), /draftToCalcInput/)
})

test("texto do cliente com preco 110", () => {
  const { result, texto } = textoDo(projetoDeProva(), prova20)
  assert.equal(podeCopiarOrcamento(result.lot.total), true)
  assert.match(fonte("src/components/calculadora.tsx"), /ROTULO_COPIAR/)
  assert.equal(texto.includes("Suporte"), true)
  assert.equal(texto.includes("Cliente: Ana"), true)
  assert.equal(texto.includes("Telefone: 11999990000"), true)
  assert.equal(texto.includes("Total:"), true)
  assert.equal(texto.includes(formatBRL(110)), true)
  assert.equal(texto.includes("0 min"), true)
})

test("texto do cliente sem o custo", () => {
  const { texto } = textoDo(projetoDeProva(), prova20)
  for (const marca of ["Material", "Energia", "Depreciação", "Mão de obra", "Peso", "Prova:", "Coeficiente", "Peças perdidas"]) {
    assert.equal(texto.includes(marca), false, marca)
  }
})

test("texto por peca e lote", () => {
  const { texto } = textoDo(
    projetoDeProva({ mode: "lote", copies: "4" }),
    prova20
  )
  assert.equal(texto.includes("Por peça"), true)
  assert.equal(texto.includes("Lote"), true)
  assert.equal(texto.includes(formatBRL(27.5)), true)
  assert.equal(texto.includes(formatBRL(110)), true)
  assert.equal(texto.includes("Total:"), false)
})

test("sem botao com coeficiente 100", () => {
  const { result } = textoDo(projetoDeProva(), { ...prova, coefficient: "100" })
  assert.equal(result.lot.total, null)
  assert.equal(podeCopiarOrcamento(result.lot.total), false)
  assert.match(fonte("src/components/calculadora.tsx"), /podeCopiarOrcamento\(result\.lot\.total\)/)
})

test("texto do lote sem por peca", () => {
  const { texto } = textoDo(
    projetoDeProva({ mode: "lote", copies: "0" }),
    prova20
  )
  assert.equal(texto.includes(formatBRL(110)), true)
  assert.equal(texto.includes("Por peça"), false)
  assert.equal(texto.includes("Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero."), false)
})

test("aviso de copias fica na tela", () => {
  const result = calculate(draftToCalcInput(projetoDeProva({ mode: "lote", copies: "0" }), prova20))
  assert.equal(
    notasResultado(result, "lote").includes("Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero."),
    true
  )
  assert.match(fonte("src/components/calculadora.tsx"), /notasResultado/)
})

test("aviso de copias do produto fica na tela", () => {
  const project = projetoVista({
    copies: "0",
    labor: "10",
    mesas: [
      mesa({ id: "a", hours: "0", minutes: "0", grams: "400", price: "100" }),
      mesa({ id: "b", hours: "0", minutes: "0", grams: "400", price: "100" }),
    ],
  })
  const { texto } = textoDo(project, prova20)
  assert.equal(avisoCopiasProduto("0"), AVISO_COPIAS_PRODUTO)
  assert.match(fonte("src/components/calculadora.tsx"), /avisoCopiasProduto/)
  assert.equal(texto.includes(AVISO_COPIAS_PRODUTO), false)
})

test("texto sem impressora removida", () => {
  const { texto } = textoDo(projetoDeProva(), prova20, true)
  assert.equal(texto.includes(formatBRL(110)), true)
  assert.equal(texto.includes(AVISO_IMPRESSORA_REMOVIDA), false)
  assert.equal(texto.includes("Prova:"), false)
})

test("aviso de impressora removida fica na tela", () => {
  assert.equal(
    AVISO_IMPRESSORA_REMOVIDA,
    "A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora."
  )
  assert.match(fonte("src/components/calculadora.tsx"), /AVISO_IMPRESSORA_REMOVIDA/)
})

test("texto fica e a lista tira o coeficiente", () => {
  const project = projetoDeProva()
  const copiado = textoDo(project, prova20)
  const lista = calculate(draftToCalcInput(project, { ...prova, coefficient: "" })).lot.total
  assert.equal(copiado.texto.includes(formatBRL(110)), true)
  assert.equal(formatBRL(lista ?? 0), formatBRL(88))
  assert.equal(copiado.texto.includes(formatBRL(88)), false)
})

test("texto sem aviso de nenhuma cor", () => {
  const project = projetoDeProva({ labor: "0", grams: "0", colors: [], clientName: "", clientPhone: "" })
  const { result, texto } = textoDo(project, prova20)
  assert.equal(result.lot.total !== null, true)
  assert.equal(texto.includes("Nenhuma cor de filamento. O material entra como R$ 0,00."), false)
})

test("aviso de nenhuma cor fica na tela", () => {
  const project = projetoDeProva({ labor: "0", grams: "0", colors: [], clientName: "", clientPhone: "" })
  const result = calculate(draftToCalcInput(project, prova20))
  assert.equal(notasResultado(result, "peca").includes("Nenhuma cor de filamento. O material entra como R$ 0,00."), true)
  assert.match(fonte("src/components/calculadora.tsx"), /notasResultado/)
})
