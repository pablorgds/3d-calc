import type { Metadata } from "next"
import { Calculadora } from "@/components/calculadora"

export const metadata: Metadata = {
  title: "Calculadora",
}

export default function CalculadoraPage() {
  return <Calculadora />
}
