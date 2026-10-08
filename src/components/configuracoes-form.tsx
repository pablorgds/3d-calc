"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberField } from "@/components/number-field"
import { addPrinter, removePrinter, setActivePrinter, updatePrinterById, useLeitura } from "@/lib/impressora"
import { activePrinterOf } from "@/lib/impressora-store"
import { vistaCarregamento } from "@/lib/vistas"

export function ConfiguracoesForm() {
  const leitura = useLeitura()

  if (leitura.status === "erro") {
    const vista = vistaCarregamento("configuracoes", "erro")
    return (
      <Card>
        <CardHeader>
          <CardTitle>{vista.titulo}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (leitura.status !== "pronto") {
    const vista = vistaCarregamento("configuracoes", "lendo")
    return (
      <Card>
        <CardHeader>
          <CardTitle>{vista.titulo}</CardTitle>
          {vista.descricao ? <CardDescription>{vista.descricao}</CardDescription> : null}
        </CardHeader>
      </Card>
    )
  }

  const store = leitura.printers

  const active = activePrinterOf(store)

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Máquinas</CardTitle>
          <CardDescription>
            A calculadora usa a máquina marcada. O R$/kWh fica na impressora, não no projeto.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <fieldset className="grid gap-2">
            <legend className="sr-only">Máquina em uso</legend>
            {store.printers.map((printer) => {
              const checked = printer.id === active.id
              return (
                <label
                  key={printer.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 ${
                    checked ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="impressora-ativa"
                    value={printer.id}
                    checked={checked}
                    onChange={() => setActivePrinter(printer.id)}
                    data-testid={`impressora-opcao-${printer.id}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{printer.name.trim() || "Sem nome"}</span>
                    <span className="block text-xs text-muted-foreground">
                      {printer.watts} W · {printer.energyPrice} R$/kWh · {printer.printerPrice} · {printer.lifeHours} h
                    </span>
                  </span>
                </label>
              )
            })}
          </fieldset>
          <Button
            type="button"
            variant="outline"
            className="h-11 justify-self-start"
            onClick={() => addPrinter(crypto.randomUUID())}
            data-testid="adicionar-impressora"
          >
            Adicionar impressora
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{active.name.trim() || "Sem nome"}</CardTitle>
          <CardDescription>Potência, tarifa, preço e vida útil desta máquina.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="nome-impressora">Nome</Label>
            <Input
              id="nome-impressora"
              value={active.name}
              onChange={(event) => updatePrinterById(active.id, { name: event.target.value })}
              autoComplete="off"
              data-testid="nome-impressora"
              className="h-11"
            />
          </div>
          <NumberField
            id="potencia"
            label="Potência (W)"
            value={active.watts}
            onChange={(watts) => updatePrinterById(active.id, { watts })}
            testId="potencia"
          />
          <NumberField
            id="kwh"
            label="Energia (R$/kWh)"
            value={active.energyPrice}
            onChange={(energyPrice) => updatePrinterById(active.id, { energyPrice })}
            testId="kwh"
          />
          <NumberField
            id="preco-impressora"
            label="Preço da impressora (R$)"
            value={active.printerPrice}
            onChange={(printerPrice) => updatePrinterById(active.id, { printerPrice })}
            testId="preco-impressora"
          />
          <NumberField
            id="vida-util"
            label="Vida útil (horas)"
            value={active.lifeHours}
            onChange={(lifeHours) => updatePrinterById(active.id, { lifeHours })}
            testId="vida-util"
          />
          {store.printers.length > 1 ? (
            <Button
              type="button"
              variant="destructive"
              className="h-11 sm:col-span-2 sm:justify-self-start"
              onClick={() => removePrinter(active.id)}
              data-testid="remover-impressora"
            >
              Remover esta impressora
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Esta é a única máquina. Adicione outra para poder remover.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
