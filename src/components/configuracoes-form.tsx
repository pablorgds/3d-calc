"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NumberField } from "@/components/number-field"
import { usePrinterSettings, writePrinterSettings, type PrinterSettings } from "@/lib/impressora"

export function ConfiguracoesForm() {
  const settings = usePrinterSettings()

  function update(patch: Partial<PrinterSettings>) {
    writePrinterSettings({ ...settings, ...patch })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impressora e energia</CardTitle>
        <CardDescription>
          K2 Pro, com os números que já estavam na calculadora. A tela de custo lê daqui. Ainda é uma
          impressora só, e o que você alterar fica neste navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <NumberField
          id="potencia"
          label="Potência (W)"
          value={settings.watts}
          onChange={(watts) => update({ watts })}
          testId="potencia"
        />
        <NumberField
          id="kwh"
          label="Energia (R$/kWh)"
          value={settings.energyPrice}
          onChange={(energyPrice) => update({ energyPrice })}
          testId="kwh"
        />
        <NumberField
          id="preco-impressora"
          label="Preço da impressora (R$)"
          value={settings.printerPrice}
          onChange={(printerPrice) => update({ printerPrice })}
          testId="preco-impressora"
        />
        <NumberField
          id="vida-util"
          label="Vida útil (horas)"
          value={settings.lifeHours}
          onChange={(lifeHours) => update({ lifeHours })}
          testId="vida-util"
        />
      </CardContent>
    </Card>
  )
}
