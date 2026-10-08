"use client"

import { useEffect, useState } from "react"
import { marcarPaginaVista, tipoMontagem, type TipoMontagem } from "@/lib/movimento"

export function useMovimento(): TipoMontagem {
  const [tipo] = useState(tipoMontagem)
  useEffect(() => {
    const id = requestAnimationFrame(() => marcarPaginaVista())
    return () => cancelAnimationFrame(id)
  }, [])
  return tipo
}
