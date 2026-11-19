// Pruebas del contrato y del manejo HTTP de POST /api/contact.
// Ejecutar (Node >= 22.18, elimina los tipos de .ts de forma nativa):
//   node --test tests/contact.test.mjs
// No realizan llamadas de red: el webhook se simula con un fetch inyectado.
import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  CONTACT_LIMITS,
  buildWebhookPayload,
  isHoneypotFilled,
  looksLikeEmail,
  looksLikePhone,
  normalizeIdioma,
  validateContact,
} from "../src/lib/contact.ts";
import { handleContactPost, methodNotAllowed, parseWebhookUrl } from "../src/lib/contact-server.ts";

const VALIDO = Object.freeze({
  nombre: "Ana Pérez",
  contacto: "ana@empresa.cl",
  proceso: "Cotizaciones por WhatsApp y planillas sueltas.",
  idioma: "en",
  sitio_web: "",
});

const WEBHOOK = "https://n8n.example.test/webhook/contacto";
const TOKEN = "token-de-prueba";

function post(body, { contentType = "application/json", raw = false, headers = {} } = {}) {
  const init = {
    method: "POST",
    headers: { ...(contentType ? { "Content-Type": contentType } : {}), ...headers },
    body: raw ? body : JSON.stringify(body),
  };
  return new Request("http://localhost/api/contact", init);
}

function mockFetch(respond) {
  const calls = [];
  const fn = async (input, init) => {
    calls.push({ input, init });
    return respond(input, init);
  };
  fn.calls = calls;
  return fn;
}

async function readJson(response) {
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  return response.json();
}

describe("validateContact", () => {
  test("válido con email: normaliza y conserva idioma", () => {
    const result = validateContact({ ...VALIDO, nombre: "  Ana   Pérez \n", proceso: "  linea 1\r\nlinea 2  " });
    assert.equal(result.ok, true);
    assert.deepEqual(result.data, {
      nombre: "Ana Pérez",
      contacto: "ana@empresa.cl",
      proceso: "linea 1\nlinea 2",
      idioma: "en",
    });
  });

  test("caracteres de control: una línea en nombre/contacto, saltos conservados en proceso", () => {
    const nul = String.fromCharCode(0);
    const vt = String.fromCharCode(11);
    const result = validateContact({
      ...VALIDO,
      nombre: `Ana\r\nBcc: x${nul}`,
      contacto: `ana@empresa.cl\n`,
      proceso: `Paso 1${vt}\n\tPaso 2${nul}`,
    });
    assert.equal(result.ok, true);
    assert.equal(result.data.nombre, "Ana Bcc: x");
    assert.equal(result.data.contacto, "ana@empresa.cl");
    assert.equal(result.data.proceso, "Paso 1\n\tPaso 2");
  });

  test("válido con teléfono (8 dígitos contando solo dígitos)", () => {
    const result = validateContact({ ...VALIDO, contacto: "+56 9 1234-5678" });
    assert.equal(result.ok, true);
    assert.equal(looksLikePhone("(12) 34-56-78"), true);
    assert.equal(looksLikePhone("1234-567"), false);
  });

  test("email simple", () => {
    assert.equal(looksLikeEmail("a@b.co"), true);
    assert.equal(looksLikeEmail("a@b"), false);
    assert.equal(looksLikeEmail("a b@c.d"), false);
    assert.equal(looksLikeEmail("@b.co"), false);
  });

  test("nombre: required, too_short, too_long", () => {
    for (const nombre of [undefined, null, "", "   ", 42]) {
      assert.deepEqual(validateContact({ ...VALIDO, nombre }), { ok: false, fields: { nombre: "required" } });
    }
    assert.deepEqual(validateContact({ ...VALIDO, nombre: " A " }).fields, { nombre: "too_short" });
    assert.equal(validateContact({ ...VALIDO, nombre: "A".repeat(CONTACT_LIMITS.nombre.max) }).ok, true);
    assert.deepEqual(validateContact({ ...VALIDO, nombre: "A".repeat(CONTACT_LIMITS.nombre.max + 1) }).fields, {
      nombre: "too_long",
    });
  });

  test("contacto: required, invalid, too_long", () => {
    assert.deepEqual(validateContact({ ...VALIDO, contacto: "  " }).fields, { contacto: "required" });
    assert.deepEqual(validateContact({ ...VALIDO, contacto: "a@b" }).fields, { contacto: "invalid" });
    assert.deepEqual(validateContact({ ...VALIDO, contacto: "no es un contacto" }).fields, { contacto: "invalid" });
    assert.deepEqual(validateContact({ ...VALIDO, contacto: "1234-567" }).fields, { contacto: "invalid" });
    const largo = `${"a".repeat(CONTACT_LIMITS.contacto.max)}@x.cl`;
    assert.deepEqual(validateContact({ ...VALIDO, contacto: largo }).fields, { contacto: "too_long" });
  });

  test("proceso: required, too_short, too_long", () => {
    assert.deepEqual(validateContact({ ...VALIDO, proceso: "" }).fields, { proceso: "required" });
    assert.deepEqual(validateContact({ ...VALIDO, proceso: " corto " }).fields, { proceso: "too_short" });
    assert.equal(validateContact({ ...VALIDO, proceso: "x".repeat(CONTACT_LIMITS.proceso.max) }).ok, true);
    assert.deepEqual(validateContact({ ...VALIDO, proceso: "x".repeat(CONTACT_LIMITS.proceso.max + 1) }).fields, {
      proceso: "too_long",
    });
  });

  test("varios campos inválidos a la vez y cuerpo no objeto", () => {
    assert.deepEqual(validateContact({ nombre: "A", contacto: "hola", proceso: "" }).fields, {
      nombre: "too_short",
      contacto: "invalid",
      proceso: "required",
    });
    for (const body of [null, [], "texto", 3]) {
      assert.deepEqual(validateContact(body).fields, {
        nombre: "required",
        contacto: "required",
        proceso: "required",
      });
    }
  });

  test("idioma inválido o ausente cae a es", () => {
    assert.equal(validateContact({ ...VALIDO, idioma: "fr" }).data.idioma, "es");
    assert.equal(validateContact({ ...VALIDO, idioma: undefined }).data.idioma, "es");
    assert.equal(normalizeIdioma("EN"), "es");
    assert.equal(normalizeIdioma(1), "es");
    assert.equal(normalizeIdioma("pt"), "pt");
  });
});

describe("honeypot y payload", () => {
  test("isHoneypotFilled", () => {
    assert.equal(isHoneypotFilled({ ...VALIDO, sitio_web: "https://spam.example" }), true);
    assert.equal(isHoneypotFilled({ ...VALIDO, sitio_web: 1 }), true);
    assert.equal(isHoneypotFilled({ ...VALIDO, sitio_web: "   " }), false);
    assert.equal(isHoneypotFilled({ nombre: "x" }), false);
    assert.equal(isHoneypotFilled(null), false);
  });

  test("buildWebhookPayload solo incluye campos del contrato", () => {
    const result = validateContact({ ...VALIDO, extra: "ignorar" });
    const payload = buildWebhookPayload(result.data, new Date("2026-09-17T12:00:00.000Z"));
    assert.deepEqual(payload, {
      nombre: "Ana Pérez",
      contacto: "ana@empresa.cl",
      proceso: VALIDO.proceso,
      idioma: "en",
      origen: "arcav.us",
      recibido_en: "2026-09-17T12:00:00.000Z",
    });
  });

  test("parseWebhookUrl exige https", () => {
    assert.equal(parseWebhookUrl(WEBHOOK), WEBHOOK);
    assert.equal(parseWebhookUrl("http://n8n.example.test/webhook"), null);
    assert.equal(parseWebhookUrl("no-es-url"), null);
    assert.equal(parseWebhookUrl(""), null);
    assert.equal(parseWebhookUrl(undefined), null);
  });
});

describe("handleContactPost", () => {
  test("415 si no es JSON", async () => {
    const fetch = mockFetch(() => new Response(null, { status: 200 }));
    const res = await handleContactPost(post("nombre=a", { contentType: "text/plain", raw: true }), {
      webhookUrl: WEBHOOK,
      fetch,
    });
    assert.equal(res.status, 415);
    assert.deepEqual(await readJson(res), { ok: false, error: "unsupported_media_type" });
    assert.equal(fetch.calls.length, 0);
  });

  test("acepta application/json con charset", async () => {
    const fetch = mockFetch(() => new Response(null, { status: 204 }));
    const res = await handleContactPost(post(VALIDO, { contentType: "application/json; charset=utf-8" }), {
      webhookUrl: WEBHOOK,
      fetch,
    });
    assert.equal(res.status, 200);
  });

  test("413 si el cuerpo supera 16 KB", async () => {
    const grande = { ...VALIDO, proceso: "x".repeat(CONTACT_LIMITS.bodyMaxBytes) };
    const res = await handleContactPost(post(grande), { webhookUrl: WEBHOOK });
    assert.equal(res.status, 413);
    assert.deepEqual(await readJson(res), { ok: false, error: "payload_too_large" });

    // Content-Length declarado mayor al límite (sin leer el cuerpo)
    const declarado = post(VALIDO, { headers: { "Content-Length": String(CONTACT_LIMITS.bodyMaxBytes + 1) } });
    const res2 = await handleContactPost(declarado, { webhookUrl: WEBHOOK });
    assert.equal(res2.status, 413);
  });

  test("400 bad_json si no parsea", async () => {
    // JSON roto, vacío, truncado y bytes UTF-8 inválidos
    for (const raw of ["{nombre:", "", "[1,", new Uint8Array([0x7b, 0xff, 0xfe, 0x7d])]) {
      const res = await handleContactPost(post(raw, { raw: true }), { webhookUrl: WEBHOOK });
      assert.equal(res.status, 400, `cuerpo ${String(raw)}`);
      assert.deepEqual(await readJson(res), { ok: false, error: "bad_json" });
    }
  });

  test("honeypot: 200 sin reenviar, aunque falte configuración o datos", async () => {
    const fetch = mockFetch(() => new Response(null, { status: 200 }));
    const res = await handleContactPost(post({ nombre: "", sitio_web: "http://bot" }), { fetch });
    assert.equal(res.status, 200);
    assert.deepEqual(await readJson(res), { ok: true });
    assert.equal(fetch.calls.length, 0);
  });

  test("400 validation con fields", async () => {
    const fetch = mockFetch(() => new Response(null, { status: 200 }));
    const res = await handleContactPost(post({ ...VALIDO, nombre: "A", contacto: "x", proceso: "" }), {
      webhookUrl: WEBHOOK,
      fetch,
    });
    assert.equal(res.status, 400);
    assert.deepEqual(await readJson(res), {
      ok: false,
      error: "validation",
      fields: { nombre: "too_short", contacto: "invalid", proceso: "required" },
    });
    assert.equal(fetch.calls.length, 0);
  });

  test("503 not_configured sin URL o con URL no https", async () => {
    const logs = [];
    for (const webhookUrl of [undefined, "", "http://n8n.example.test/webhook"]) {
      const res = await handleContactPost(post(VALIDO), { webhookUrl, log: (m) => logs.push(m) });
      assert.equal(res.status, 503);
      assert.deepEqual(await readJson(res), { ok: false, error: "not_configured" });
    }
    assert.ok(logs.every((m) => !m.includes("http")));
  });

  test("200 reenvía payload con Authorization si hay token", async () => {
    const fetch = mockFetch(() => new Response('{"secreto":"no exponer"}', { status: 200 }));
    const res = await handleContactPost(post(VALIDO), {
      webhookUrl: WEBHOOK,
      webhookToken: TOKEN,
      fetch,
      now: () => new Date("2026-09-17T12:00:00.000Z"),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await readJson(res), { ok: true });
    assert.equal(fetch.calls.length, 1);
    const { input, init } = fetch.calls[0];
    assert.equal(input, WEBHOOK);
    assert.equal(init.method, "POST");
    assert.equal(init.headers["Content-Type"], "application/json");
    assert.equal(init.headers.Authorization, `Bearer ${TOKEN}`);
    assert.deepEqual(JSON.parse(init.body), {
      nombre: VALIDO.nombre,
      contacto: VALIDO.contacto,
      proceso: VALIDO.proceso,
      idioma: "en",
      origen: "arcav.us",
      recibido_en: "2026-09-17T12:00:00.000Z",
    });
    assert.ok(init.signal instanceof AbortSignal);
  });

  test("sin token no envía Authorization", async () => {
    const fetch = mockFetch(() => new Response(null, { status: 202 }));
    const res = await handleContactPost(post(VALIDO), { webhookUrl: WEBHOOK, webhookToken: "  ", fetch });
    assert.equal(res.status, 200);
    assert.equal("Authorization" in fetch.calls[0].init.headers, false);
  });

  test("502 upstream si n8n responde no-2xx (sin exponer cuerpo ni PII en logs)", async () => {
    const logs = [];
    for (const status of [301, 401, 500]) {
      const fetch = mockFetch(() => new Response("detalle interno", { status }));
      const res = await handleContactPost(post(VALIDO), {
        webhookUrl: WEBHOOK,
        webhookToken: TOKEN,
        fetch,
        log: (m) => logs.push(m),
      });
      assert.equal(res.status, 502);
      assert.deepEqual(await readJson(res), { ok: false, error: "upstream" });
    }
    assert.deepEqual(logs, ["contact: upstream status 301", "contact: upstream status 401", "contact: upstream status 500"]);
    const texto = logs.join(" ");
    for (const sensible of [VALIDO.nombre, VALIDO.contacto, WEBHOOK, TOKEN]) {
      assert.equal(texto.includes(sensible), false);
    }
  });

  test("502 upstream por error de red", async () => {
    const logs = [];
    const fetch = mockFetch(() => Promise.reject(new TypeError(`fallo al conectar ${WEBHOOK}`)));
    const res = await handleContactPost(post(VALIDO), { webhookUrl: WEBHOOK, fetch, log: (m) => logs.push(m) });
    assert.equal(res.status, 502);
    assert.deepEqual(await readJson(res), { ok: false, error: "upstream" });
    assert.deepEqual(logs, ["contact: upstream network error"]);
  });

  test("502 upstream por timeout (AbortController)", async () => {
    const logs = [];
    const fetch = mockFetch(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => reject(init.signal.reason));
        }),
    );
    const res = await handleContactPost(post(VALIDO), {
      webhookUrl: WEBHOOK,
      fetch,
      timeoutMs: 20,
      log: (m) => logs.push(m),
    });
    assert.equal(res.status, 502);
    assert.deepEqual(await readJson(res), { ok: false, error: "upstream" });
    assert.deepEqual(logs, ["contact: upstream timeout"]);
  });

  test("405 para otros métodos", async () => {
    const res = methodNotAllowed();
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "POST");
    assert.deepEqual(await readJson(res), { ok: false, error: "method_not_allowed" });
  });
});
