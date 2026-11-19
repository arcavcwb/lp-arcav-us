/**
 * Contrato y lógica pura del formulario de contacto (POST /api/contact).
 *
 * - Sin dependencias de runtime (ni Astro ni `cloudflare:workers`): se puede
 *   importar desde el cliente (validación previa) y desde pruebas con
 *   `node --test` (Node >= 22.18 elimina los tipos de TypeScript de forma nativa).
 * - Usa solo sintaxis TypeScript "borrable": sin `enum`, `namespace` ni
 *   parameter properties.
 * - Los errores son códigos estables; los textos de interfaz los traduce el
 *   frontend.
 *
 * Documentación: docs/contacto.md
 */

/* ------------------------------------------------------------------ */
/* Contrato                                                            */
/* ------------------------------------------------------------------ */

export const IDIOMAS = ["es", "en", "pt"] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_POR_DEFECTO: Idioma = "es";

/** Cuerpo JSON que envía el frontend. `sitio_web` es el honeypot (debe ir vacío). */
export interface ContactRequest {
  nombre: string;
  contacto: string;
  proceso: string;
  idioma: Idioma;
  sitio_web: string;
}

export type NombreError = "required" | "too_short" | "too_long";
export type ContactoError = "required" | "invalid" | "too_long";
export type ProcesoError = "required" | "too_short" | "too_long";

export interface ContactFieldErrors {
  nombre?: NombreError;
  contacto?: ContactoError;
  proceso?: ProcesoError;
}

export type ContactField = keyof ContactFieldErrors;

export type ContactErrorCode =
  | "validation"
  | "bad_json"
  | "unsupported_media_type"
  | "payload_too_large"
  | "method_not_allowed"
  | "not_configured"
  | "upstream";

/** 200 */
export interface ContactSuccessResponse {
  ok: true;
}

/** 400 validation */
export interface ContactValidationErrorResponse {
  ok: false;
  error: "validation";
  fields: ContactFieldErrors;
}

/** 400 bad_json, 405, 413, 415, 502, 503 */
export interface ContactSimpleErrorResponse {
  ok: false;
  error: Exclude<ContactErrorCode, "validation">;
}

export type ContactErrorResponse = ContactValidationErrorResponse | ContactSimpleErrorResponse;
export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

/** Estado HTTP asociado a cada código de error. */
export const CONTACT_ERROR_STATUS: Readonly<Record<ContactErrorCode, number>> = {
  validation: 400,
  bad_json: 400,
  unsupported_media_type: 415,
  payload_too_large: 413,
  method_not_allowed: 405,
  not_configured: 503,
  upstream: 502,
};

export const CONTACT_LIMITS = {
  nombre: { min: 2, max: 120 },
  contacto: { min: 5, max: 160 },
  proceso: { min: 10, max: 2000 },
  telefonoMinDigitos: 8,
  /** Tamaño máximo del cuerpo de la petición, en bytes (16 KB). */
  bodyMaxBytes: 16 * 1024,
  /** Tiempo máximo de espera del webhook de n8n, en milisegundos. */
  upstreamTimeoutMs: 8000,
} as const;

export const CONTACT_ORIGEN = "arcav.us";

/** Cuerpo que se reenvía al webhook de n8n. */
export interface ContactWebhookPayload {
  nombre: string;
  contacto: string;
  proceso: string;
  idioma: Idioma;
  origen: typeof CONTACT_ORIGEN;
  /** ISO 8601 (UTC). */
  recibido_en: string;
}

/** Datos ya normalizados y válidos. */
export interface ContactData {
  nombre: string;
  contacto: string;
  proceso: string;
  idioma: Idioma;
}

export type ContactValidationResult =
  | { ok: true; data: ContactData }
  | { ok: false; fields: ContactFieldErrors };

/* ------------------------------------------------------------------ */
/* Lógica pura                                                         */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Campos de una línea (nombre, contacto): los caracteres de control y saltos
 * de línea pasan a espacio, se colapsan espacios repetidos y se recorta.
 * Evita inyección de cabeceras si n8n usa el valor en un correo.
 */
export function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\x00-\x1F\x7F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Texto libre (proceso): conserva saltos de línea (normalizados a `\n`) y
 * tabulaciones, elimina el resto de caracteres de control y recorta.
 */
export function normalizeMultiline(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function looksLikeEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/** Teléfono: al menos 8 dígitos contando solo dígitos (0-9). */
export function looksLikePhone(value: string): boolean {
  const digits = value.match(/[0-9]/g);
  return (digits?.length ?? 0) >= CONTACT_LIMITS.telefonoMinDigitos;
}

export function normalizeIdioma(value: unknown): Idioma {
  return typeof value === "string" && (IDIOMAS as readonly string[]).includes(value)
    ? (value as Idioma)
    : IDIOMA_POR_DEFECTO;
}

/**
 * Honeypot: `sitio_web` con contenido (tras recortar) indica un bot.
 * Ausente, `null` o cadena vacía se consideran humanos.
 */
export function isHoneypotFilled(body: unknown): boolean {
  if (!isRecord(body)) return false;
  const value = body.sitio_web;
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

/**
 * Valida el cuerpo recibido. Los campos que no son cadena cuentan como
 * `required`. Campos desconocidos se ignoran y nunca se reenvían.
 */
export function validateContact(body: unknown): ContactValidationResult {
  const input = isRecord(body) ? body : {};
  const fields: ContactFieldErrors = {};

  const nombre = normalizeSingleLine(input.nombre);
  if (nombre === "") fields.nombre = "required";
  else if (nombre.length < CONTACT_LIMITS.nombre.min) fields.nombre = "too_short";
  else if (nombre.length > CONTACT_LIMITS.nombre.max) fields.nombre = "too_long";

  const contacto = normalizeSingleLine(input.contacto);
  if (contacto === "") fields.contacto = "required";
  else if (contacto.length > CONTACT_LIMITS.contacto.max) fields.contacto = "too_long";
  else if (contacto.length < CONTACT_LIMITS.contacto.min) fields.contacto = "invalid";
  else if (!looksLikeEmail(contacto) && !looksLikePhone(contacto)) fields.contacto = "invalid";

  const proceso = normalizeMultiline(input.proceso);
  if (proceso === "") fields.proceso = "required";
  else if (proceso.length < CONTACT_LIMITS.proceso.min) fields.proceso = "too_short";
  else if (proceso.length > CONTACT_LIMITS.proceso.max) fields.proceso = "too_long";

  if (fields.nombre || fields.contacto || fields.proceso) {
    return { ok: false, fields };
  }

  return {
    ok: true,
    data: { nombre, contacto, proceso, idioma: normalizeIdioma(input.idioma) },
  };
}

export function buildWebhookPayload(data: ContactData, now: Date = new Date()): ContactWebhookPayload {
  return {
    nombre: data.nombre,
    contacto: data.contacto,
    proceso: data.proceso,
    idioma: data.idioma,
    origen: CONTACT_ORIGEN,
    recibido_en: now.toISOString(),
  };
}
