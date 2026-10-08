import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scrypt = promisify(scryptCb)

const N = 16384
const r = 8
const p = 1
const keylen = 32

export const EMAIL_ADMIN = "pablorgds@gmail.com"
export const SENHA_MINIMA = 8

export async function hashSenha(senha: string) {
  const sal = randomBytes(16)
  const verificador = (await scrypt(senha, sal, keylen, { N, r, p })) as Buffer
  return { sal, verificador }
}

export async function conferirSenha(senha: string, sal: Buffer, verificador: Buffer) {
  const calculado = (await scrypt(senha, sal, verificador.length, { N, r, p })) as Buffer
  if (calculado.length !== verificador.length) return false
  return timingSafeEqual(calculado, verificador)
}

export function emailNormalizado(email: string) {
  return email.trim().toLowerCase()
}

export function emailValido(email: string) {
  const normalizado = emailNormalizado(email)
  const arroba = normalizado.indexOf("@")
  return arroba > 0 && arroba < normalizado.length - 1
}

export function cabecalhoCookieSessao(token: string) {
  return `sessao=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`
}

export function cabecalhoCookieApagado() {
  return "sessao=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
}
