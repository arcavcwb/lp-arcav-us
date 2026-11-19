/**
 * Manejo HTTP del formulario de contacto, independiente del runtime.
 *
 * Recibe la configuración (URL y token del webhook) y `fetch` por parámetro
 * para poder probarse con `node --test` sin Cloudflare. El endpoint
 * `src/pages/api/contact.ts` lee las variables con
 * `import { env } from "cloudflare:workers"` y delega aquí.
 *
 * Solo para servidor: no lo importes desde componentes de cliente.
 * Nunca registra datos personales, la URL ni el token del webhook.
 */
import {
  CONTACT_ERROR_STATUS,
  CONTACT_LIMITS,
  buildWebhookPayload,
  isHoneypotFilled,
  validateContact,
} from "./contact.ts";
import type {
  ContactErrorCode,
  ContactResponse,
  ContactSimpleErrorResponse,
} from "./contact.ts";

export interface ContactHandlerOptions {
  /** Valor de N8N_CONTACT_WEBHOOK_URL (obligatoria, debe ser https). */
  webhookUrl?: unknown;
  /** Valor de N8N_CONTACT_WEBHOOK_TOKEN (opcional). */
  webhookToken?: unknown;
  /** Implementación de fetch (por defecto la global). */
  fetch?: (input: string, init: RequestInit) => Promise<Response>;
  /** Reloj inyectable para `recibido_en`. */
  now?: () => Date;
  /** Timeout del webhook en ms (por defecto 8000). */
  timeoutMs?: number;
  /** Registro sin datos personales (por defecto console.warn). */
  log?: (message: string) => void;
}

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

export function jsonResponse(
  status: number,
  body: ContactResponse,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, ...extraHeaders },
  });
}

export function errorResponse(
  error: Exclude<ContactErrorCode, "validation">,
  extraHeaders: Record<string, string> = {},
): Response {
  const body: ContactSimpleErrorResponse = { ok: false, error };
  return jsonResponse(CONTACT_ERROR_STATUS[error], body, extraHeaders);
}

export function methodNotAllowed(): Response {
  return errorResponse("method_not_allowed", { Allow: "POST" });
}

export function isJsonContentType(header: string | null): boolean {
  if (!header) return false;
  const mediaType = header.split(";")[0]?.trim().toLowerCase();
  return mediaType === "application/json";
}

/** URL del webhook utilizable (https) o `null` si falta o no es válida. */
export function parseWebhookUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Lee el cuerpo sin superar `maxBytes`. Devuelve `null` si lo supera
 * (por Content-Length declarado o por bytes efectivamente leídos).
 */
export async function readBodyWithLimit(request: Request, maxBytes: number): Promise<Uint8Array | null> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const length = Number(declared);
    if (Number.isFinite(length) && length > maxBytes) return null;
  }
  if (!request.body) return new Uint8Array(0);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/**
 * Orden de comprobaciones:
 * 415 tipo de contenido -> 413 tamaño -> 400 bad_json -> 200 honeypot ->
 * 400 validation -> 503 not_configured -> reenvío (200 | 502 upstream).
 */
export async function handleContactPost(request: Request, options: ContactHandlerOptions = {}): Promise<Response> {
  const log = options.log ?? ((message: string) => console.warn(message));
  const customFetch = options.fetch;
  const doFetch = customFetch ?? ((input: string, init: RequestInit) => fetch(input, init));
  const now = options.now ?? (() => new Date());
  const timeoutMs = options.timeoutMs ?? CONTACT_LIMITS.upstreamTimeoutMs;

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return errorResponse("unsupported_media_type");
  }

  const raw = await readBodyWithLimit(request, CONTACT_LIMITS.bodyMaxBytes);
  if (raw === null) {
    return errorResponse("payload_too_large");
  }

  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw));
  } catch {
    return errorResponse("bad_json");
  }

  if (isHoneypotFilled(body)) {
    // Éxito genérico: no se reenvía nada ni se informa al cliente.
    return jsonResponse(200, { ok: true });
  }

  const result = validateContact(body);
  if (!result.ok) {
    return jsonResponse(CONTACT_ERROR_STATUS.validation, {
      ok: false,
      error: "validation",
      fields: result.fields,
    });
  }

  const webhookUrl = parseWebhookUrl(options.webhookUrl);
  if (webhookUrl === null) {
    log("contact: webhook no configurado o URL no válida");
    return errorResponse("not_configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = typeof options.webhookToken === "string" ? options.webhookToken.trim() : "";
  if (token !== "") headers.Authorization = `Bearer ${token}`;

  const payload = buildWebhookPayload(result.data, now());
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await doFetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      // No seguir redirecciones: evita reenviar el token a otro destino.
      redirect: "manual",
    });
    // El cuerpo de n8n nunca se expone al cliente.
    await upstream.body?.cancel().catch(() => {});

    if (upstream.status < 200 || upstream.status > 299) {
      log(`contact: upstream status ${upstream.status}`);
      return errorResponse("upstream");
    }
    return jsonResponse(200, { ok: true });
  } catch {
    log(controller.signal.aborted ? "contact: upstream timeout" : "contact: upstream network error");
    return errorResponse("upstream");
  } finally {
    clearTimeout(timer);
  }
}
