"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberField } from "@/components/number-field"
import {
  calculate,
  draftToCalcInput,
  formatBRL,
  formatDuration,
  formatGrams,
  parseDecimal,
  type Amount,
  type CalcResult,
  type ColorDraft,
  type EntryMode,
} from "@/lib/custo"
import { setActivePrinter, useLeitura, usePrinterStore } from "@/lib/impressora"
import { activePrinterOf } from "@/lib/impressora-store"
import { writeProject, type Project } from "@/lib/projetos"
import { frasesCalculadora, vistaCarregamento } from "@/lib/vistas"

const swatches = ["#78716c", "#57534e", "#a8a29e", "#44403c"]

function showMoney(value: Amount) {
  return value === null ? "—" : formatBRL(value)
}

function showTime(value: Amount) {
  return value === null ? "—" : formatDuration(value)
}

function showGrams(value: Amount) {
  return value === null ? "—" : formatGrams(value)
}

function resultNotes(result: CalcResult, mode: EntryMode): string[] {
  const notes: string[] = []
  if (result.materialIssue === "no-colors") {
    notes.push("Nenhuma cor de filamento. O material entra como R$ 0,00.")
  }
  if (result.materialIssue === "invalid-color") {
    notes.push("Há cor com preço ou peso vazio ou inválido. O material sai do total até corrigir.")
  }
  if (result.lifeIssue === "zero") {
    notes.push(
      "Depreciação fora da conta: a vida útil em Configurações está em 0. Ela não vira 1 hora. O valor usado é R$ 0,00."
    )
  }
  if (result.lifeIssue === "empty") {
    notes.push("Depreciação fora da conta: preencha a vida útil em Configurações. Campo vazio não vira 1.")
  }
  if (result.lifeIssue === "invalid") {
    notes.push("Vida útil inválida em Configurações. Use um número de horas maior que zero.")
  }
  if (result.timeIssue === "empty") {
    notes.push("Tempo vazio. Energia e depreciação ficam sem cálculo.")
  }
  if (result.timeIssue === "invalid") {
    notes.push("Tempo inválido. Use zero ou um número positivo.")
  }
  if (result.energyIssue === "empty") {
    notes.push("Potência ou preço do kWh está vazio em Configurações. A energia não foi calculada.")
  }
  if (result.energyIssue === "invalid") {
    notes.push("Potência ou preço do kWh inválido em Configurações.")
  }
  if (result.printerPriceIssue !== "none" && result.timeIssue === "none" && result.lifeIssue === "none") {
    notes.push("Preço da impressora vazio ou inválido em Configurações. A depreciação não foi calculada.")
  }
  if (result.laborIssue === "empty") {
    notes.push("Percentual de mão de obra vazio. O acréscimo não foi aplicado.")
  }
  if (result.laborIssue === "invalid") {
    notes.push("Percentual de mão de obra inválido.")
  }
  if (mode === "lote" && result.piece.blockedByCopies) {
    notes.push("Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero.")
  }
  if (mode === "peca" && result.lot.blockedByCopies) {
    notes.push("Custo do lote bloqueado. Informe as cópias com um inteiro a partir de zero.")
  }
  if (mode === "peca") {
    notes.push("Peça única: não há cópias na mesa. O lote é esta mesma peça.")
  }
  return notes
}

function ColorEditor({
  color,
  onChange,
  onRemove,
}: {
  color: ColorDraft
  onChange: (id: string, patch: Partial<ColorDraft>) => void
  onRemove: (id: string) => void
}) {
  const price = parseDecimal(color.price)
  const grams = parseDecimal(color.grams)
  return (
    <div className="grid gap-3 rounded-lg border p-3" data-testid={`cor-${color.id}`}>
      <div className="flex items-end gap-3">
        <div className="campo">
          <Label htmlFor={`${color.id}-hex`}>Cor</Label>
          <input
            id={`${color.id}-hex`}
            type="color"
            value={color.hex}
            onChange={(event) => onChange(color.id, { hex: event.target.value })}
            className="size-11 cursor-pointer rounded-md border bg-transparent p-1"
            aria-label="Cor do filamento"
            data-testid={`cor-hex-${color.id}`}
          />
        </div>
        <div className="campo flex-1">
          <Label htmlFor={`${color.id}-nome`}>Nome</Label>
          <Input
            id={`${color.id}-nome`}
            value={color.name}
            onChange={(event) => onChange(color.id, { name: event.target.value })}
            placeholder="Nome da cor"
            autoComplete="off"
            data-testid={`cor-nome-${color.id}`}
            className="h-11"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={() => onRemove(color.id)}
          data-testid={`cor-remover-${color.id}`}
        >
          Remover
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField
          id={`${color.id}-preco`}
          label="Preço (R$/kg)"
          value={color.price}
          onChange={(price) => onChange(color.id, { price })}
          testId={`cor-preco-${color.id}`}
        />
        <NumberField
          id={`${color.id}-peso`}
          label="Peso (g)"
          value={color.grams}
          onChange={(grams) => onChange(color.id, { grams })}
          testId={`cor-peso-${color.id}`}
        />
      </div>
      {price.status === "invalid" || grams.status === "invalid" ? (
        <p className="erro-campo">Preço e peso precisam ser zero ou positivos.</p>
      ) : null}
    </div>
  )
}

function CalculadoraLoading() {
  return (
    <main className="coluna coluna-unica py-8">
      <header className="cabecalho-pagina">
        <h1 className="titulo-pagina">Calculadora</h1>
        <p className="lede text-muted-foreground">{vistaCarregamento("calculadora", "lendo").titulo}</p>
      </header>
    </main>
  )
}

function CalculadoraErro() {
  const vista = vistaCarregamento("calculadora", "erro")
  return (
    <main className="coluna coluna-unica py-8">
      <header className="cabecalho-pagina">
        <h1 className="titulo-pagina">{vista.titulo}</h1>
      </header>
    </main>
  )
}

export function Calculadora({ projectId }: { projectId: string | null }) {
  const leitura = useLeitura()
  if (leitura.status === "erro") return <CalculadoraErro />
  if (leitura.status !== "pronto") return <CalculadoraLoading />
  const project = projectId ? (leitura.projects.find((item) => item.id === projectId) ?? null) : null
  return (
    <CalculadoraEditor
      key={project?.id ?? (projectId ? `ausente-${projectId}` : "novo")}
      projectId={projectId}
      initial={project}
      missing={projectId !== null && project === null}
    />
  )
}

function CalculadoraEditor({
  projectId,
  initial,
  missing,
}: {
  projectId: string | null
  initial: Project | null
  missing: boolean
}) {
  const router = useRouter()
  const printerStore = usePrinterStore()
  const printer = printerStore ? activePrinterOf(printerStore) : null
  const [projectName, setProjectName] = useState(initial?.name ?? "")
  const [nameError, setNameError] = useState<string | null>(null)
  const [mode, setMode] = useState<EntryMode>(initial?.mode ?? "peca")
  const [copies, setCopies] = useState(initial?.copies ?? "0")
  const [hours, setHours] = useState(initial?.hours ?? "0")
  const [minutesPart, setMinutesPart] = useState(initial?.minutes ?? "0")
  const [colors, setColors] = useState<ColorDraft[]>(initial?.colors ?? [])
  const [labor, setLabor] = useState(initial?.labor ?? "0")

  useEffect(() => {
    if (!initial?.printerId) return
    setActivePrinter(initial.printerId)
  }, [initial])

  function updateColor(id: string, patch: Partial<ColorDraft>) {
    setColors((current) => current.map((color) => (color.id === id ? { ...color, ...patch } : color)))
  }

  function removeColor(id: string) {
    setColors((current) => current.filter((color) => color.id !== id))
  }

  function addColor() {
    setColors((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        hex: swatches[current.length % swatches.length],
        price: "0",
        grams: "0",
      },
    ])
  }

  const result = useMemo(
    () =>
      printer
        ? calculate(
            draftToCalcInput(
              { mode, copies, hours, minutes: minutesPart, labor, colors },
              printer
            )
          )
        : null,
    [mode, copies, hours, minutesPart, printer, labor, colors]
  )

  function saveProject() {
    if (!printer) return
    const name = projectName.trim()
    if (!name) {
      setNameError("Dê um nome para gravar o lote.")
      return
    }
    const id = !projectId || missing ? crypto.randomUUID() : projectId
    writeProject({
      id,
      name,
      printerId: printer.id,
      mode,
      copies,
      hours,
      minutes: minutesPart,
      labor,
      colors,
      updatedAt: Date.now(),
    })
    setProjectName(name)
    setNameError(null)
    if (id !== projectId) router.replace(`/?projeto=${encodeURIComponent(id)}`)
  }

  function startNew() {
    if (projectId) {
      router.push("/")
      return
    }
    setProjectName("")
    setMode("peca")
    setCopies("0")
    setHours("0")
    setMinutesPart("0")
    setLabor("0")
    setColors([])
    setNameError(null)
  }

  if (!printerStore || !printer || !result) return <CalculadoraLoading />

  const frases = frasesCalculadora(missing ? "ausente" : projectId ? "gravado" : "novo")
  const linkedPrinterMissing =
    Boolean(projectId) &&
    !missing &&
    Boolean(initial?.printerId) &&
    !printerStore.printers.some((item) => item.id === initial?.printerId)

  const notes = resultNotes(result, mode)
  const modeHint =
    mode === "peca"
      ? "O tempo e o peso de cada cor são de uma peça. Não há cópias na mesa: o lote é essa peça."
      : "O tempo e o peso de cada cor são da mesa cheia. As cópias dividem o lote em cada peça."

  return (
    <main className="coluna py-8 pb-28 md:pb-10">
      <header className="cabecalho-pagina">
        <h1 className="titulo-pagina">Calculadora</h1>
        <p className="lede text-muted-foreground">
          Um objeto pode levar várias cores na mesma impressão. Energia e depreciação vêm da impressora
          marcada. {frases.gravar}
        </p>
      </header>
      <div className="grade-calculadora">
        <div className="pilha">

        {frases.ausente ? (
          <p className="lavagem p-3 text-sm text-muted-foreground" data-testid="projeto-ausente">
            {frases.ausente}
          </p>
        ) : null}
        {linkedPrinterMissing ? (
          <p className="lavagem p-3 text-sm text-muted-foreground" data-testid="impressora-ausente">
            A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora.
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Projeto</CardTitle>
            <CardDescription>{frases.descricao}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                saveProject()
              }}
            >
              <div className="campo">
                <Label htmlFor="nome-projeto">Nome</Label>
                <Input
                  id="nome-projeto"
                  value={projectName}
                  onChange={(event) => {
                    setProjectName(event.target.value)
                    setNameError(null)
                  }}
                  placeholder="Nome do lote"
                  autoComplete="off"
                  aria-invalid={nameError !== null}
                  data-testid="nome-projeto"
                  className="h-11"
                />
                {nameError ? <p className="erro-campo">{nameError}</p> : null}
              </div>
              <div className="campo">
                <Label htmlFor="impressora-ativa">Impressora</Label>
                <select
                  id="impressora-ativa"
                  value={printer.id}
                  onChange={(event) => setActivePrinter(event.target.value)}
                  data-testid="impressora-ativa"
                  className="h-11 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {printerStore.printers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name.trim() || "Sem nome"}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  A tarifa fica na máquina.{" "}
                  <Link href="/configuracoes" className="underline underline-offset-2">
                    Editar em Configurações
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="h-11" data-testid="salvar-projeto">
                  Salvar
                </Button>
                <Button type="button" variant="outline" className="h-11" onClick={startNew} data-testid="novo-projeto">
                  Novo
                </Button>
                {projectId && !missing ? (
                  <Link href="/projetos" className="inline-flex h-11 items-center text-sm underline underline-offset-2">
                    Ver em Projetos
                  </Link>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objeto na cama</CardTitle>
            <CardDescription>{modeHint}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <fieldset className="grid gap-2">
              <legend className="legenda">O tempo e os pesos são de</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <ModeOption
                  name="modo"
                  value="peca"
                  checked={mode === "peca"}
                  onSelect={() => setMode("peca")}
                  title="Peça única"
                  testId="modo-peca"
                />
                <ModeOption
                  name="modo"
                  value="lote"
                  checked={mode === "lote"}
                  onSelect={() => setMode("lote")}
                  title="O lote inteiro"
                  testId="modo-lote"
                />
              </div>
            </fieldset>

            <div className={`grid gap-3 ${mode === "lote" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {mode === "lote" ? (
                <NumberField
                  id="copias"
                  label="Cópias na mesa"
                  value={copies}
                  onChange={setCopies}
                  integer
                  testId="copias"
                />
              ) : null}
              <NumberField id="horas" label="Horas" value={hours} onChange={setHours} testId="horas" />
              <NumberField
                id="minutos"
                label="Minutos"
                value={minutesPart}
                onChange={setMinutesPart}
                testId="minutos"
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="legenda">Filamentos do objeto</h2>
                <Button type="button" variant="outline" className="h-11" onClick={addColor} data-testid="adicionar-cor">
                  Adicionar cor
                </Button>
              </div>
              {colors.length === 0 ? (
                <p className="lavagem p-3 text-sm text-muted-foreground" data-testid="cores-vazio">
                  Nenhuma cor ainda. Sem filamento, o material fica em R$ 0,00.
                </p>
              ) : (
                colors.map((color) => (
                  <ColorEditor key={color.id} color={color} onChange={updateColor} onRemove={removeColor} />
                ))
              )}
            </div>

            <NumberField
              id="mao-de-obra"
              label="Mão de obra (%)"
              value={labor}
              onChange={setLabor}
              testId="mao-de-obra"
              hint="Só sobre material + energia + depreciação. A impressora e a energia ficam em Configurações."
            />
          </CardContent>
        </Card>
        </div>

      <Card className="md:sticky md:top-28">
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription data-testid="origem-impressora">
            Peça e lote ao mesmo tempo.{" "}
            <Link href="/configuracoes" className="underline underline-offset-2">
              {printer.name.trim() || "Sem nome"}
            </Link>
            : {printer.watts} W, {printer.energyPrice} R$/kWh, impressora {printer.printerPrice}, {printer.lifeHours} h.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <TotalBlock label="Por peça" money={result.piece.total} time={result.piece.minutes} testPrefix="peca" />
            <TotalBlock label="Lote" money={result.lot.total} time={result.lot.minutes} testPrefix="lote" />
          </div>

          <table className="w-full text-sm" data-testid="tabela-custos">
            <thead>
              <tr className="text-muted-foreground">
                <th className="legenda py-1 text-left"> </th>
                <th className="legenda py-1 text-right">Peça</th>
                <th className="legenda py-1 text-right">Lote</th>
              </tr>
            </thead>
            <tbody>
              <CostRow label="Material" piece={result.piece.material} lot={result.lot.material} testId="material" />
              <CostRow label="Energia" piece={result.piece.energy} lot={result.lot.energy} testId="energia" />
              <CostRow
                label="Depreciação"
                piece={result.piece.depreciation}
                lot={result.lot.depreciation}
                testId="depreciacao"
              />
              <CostRow label="Mão de obra" piece={result.piece.labor} lot={result.lot.labor} testId="mao-obra-valor" />
              <CostRow label="Peso" piece={result.piece.grams} lot={result.lot.grams} testId="peso" kind="grams" />
            </tbody>
          </table>

          {result.colors.length > 0 ? (
            <ul className="grid gap-1 text-sm" data-testid="cores-material">
              {result.colors.map((color) => (
                <li key={color.id} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="amostra-cor size-2.5 shrink-0" style={{ background: color.hex }} />
                    <span className="truncate">{color.name.trim() || "Sem nome"}</span>
                  </span>
                  <span className="figura">{color.invalid ? "inválida" : showMoney(color.material)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {notes.length > 0 ? (
            <ul className="grid gap-2 text-sm text-muted-foreground" data-testid="avisos">
              {notes.map((note) => (
                <li key={note} className="lavagem p-2">
                  {note}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
      </div>

      <div className="barra-totais" aria-hidden="true">
        <div>
          <p className="legenda text-muted-foreground">Por peça</p>
          <p className="figura">{showMoney(result.piece.total)}</p>
        </div>
        <div>
          <p className="legenda text-muted-foreground">Lote</p>
          <p className="figura">{showMoney(result.lot.total)}</p>
        </div>
      </div>
    </main>
  )
}

function ModeOption({
  name,
  value,
  checked,
  onSelect,
  title,
  testId,
}: {
  name: string
  value: string
  checked: boolean
  onSelect: () => void
  title: string
  testId: string
}) {
  return (
    <label
      className={`modo-opcao flex h-11 cursor-pointer items-center gap-2 px-3 text-sm ${
        checked ? "modo-marcado" : ""
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} data-testid={testId} />
      {title}
    </label>
  )
}

function TotalBlock({
  label,
  money,
  time,
  testPrefix,
}: {
  label: string
  money: Amount
  time: Amount
  testPrefix: string
}) {
  return (
    <div className="lavagem p-3">
      <p className="legenda text-muted-foreground">{label}</p>
      <p className="figura" data-testid={`total-${testPrefix}`}>
        {showMoney(money)}
      </p>
      <p className="figura" data-testid={`tempo-${testPrefix}`}>
        {showTime(time)}
      </p>
    </div>
  )
}

function CostRow({
  label,
  piece,
  lot,
  testId,
  kind = "money",
}: {
  label: string
  piece: Amount
  lot: Amount
  testId: string
  kind?: "money" | "grams"
}) {
  const show = kind === "grams" ? showGrams : showMoney
  return (
    <tr className="border-t">
      <th className="py-2 text-left font-medium">{label}</th>
      <td className="figura py-2 text-right" data-testid={`${testId}-peca`}>
        {show(piece)}
      </td>
      <td className="figura py-2 text-right" data-testid={`${testId}-lote`}>
        {show(lot)}
      </td>
    </tr>
  )
}
