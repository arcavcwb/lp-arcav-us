# Formulario de contacto: `POST /api/contact`

El formulario de la landing envía JSON a un endpoint del Worker, que valida los
datos y los reenvía a un webhook de n8n. Ninguna URL ni token vive en el
repositorio: llegan por variables de entorno del Worker.

| Archivo | Rol |
| --- | --- |
| `src/lib/contact.ts` | Contrato (tipos TypeScript), límites, validación y armado del payload. Lógica pura, sin dependencias de runtime; se puede importar desde el cliente. |
| `src/lib/contact-server.ts` | Manejo HTTP independiente del runtime (tipo de contenido, tamaño, JSON, honeypot, reenvío con timeout). Solo servidor. |
| `src/pages/api/contact.ts` | Endpoint Astro (`prerender = false`). Lee las variables con `import { env } from "cloudflare:workers"` y delega en `contact-server.ts`. |
| `tests/contact.test.mjs` | Pruebas con `node --test` (sin red). |

## Contrato

### Petición

`POST /api/contact` con `Content-Type: application/json` (se acepta `; charset=utf-8`).

```json
{
  "nombre": "Ana Pérez",
  "contacto": "ana@empresa.cl",
  "proceso": "Cotizaciones por WhatsApp y planillas sueltas.",
  "idioma": "es",
  "sitio_web": ""
}
```

| Campo | Tipo | Regla (tras normalizar y recortar espacios) | Códigos de error |
| --- | --- | --- | --- |
| `nombre` | string | 2 a 120 caracteres | `required`, `too_short`, `too_long` |
| `contacto` | string | 5 a 160 caracteres; parece email (`algo@dominio.tld`) o teléfono (al menos 8 dígitos, contando solo dígitos) | `required`, `invalid`, `too_long` |
| `proceso` | string | 10 a 2000 caracteres | `required`, `too_short`, `too_long` |
| `idioma` | `"es"` \| `"en"` \| `"pt"` | Cualquier otro valor o ausencia se trata como `"es"` (no es error) | ninguno |
| `sitio_web` | string | Honeypot: campo oculto que debe ir vacío | ninguno |

Detalles:

- Un campo ausente, `null` o que no sea string cuenta como `required`.
- Contacto con menos de 5 caracteres responde `invalid` (no existe `too_short` para ese campo).
- Normalización: en `nombre` y `contacto` los saltos de línea y caracteres de
  control pasan a espacio y se colapsan espacios repetidos; en `proceso` se
  conservan saltos de línea (`\r\n` pasa a `\n`) y tabulaciones, y se eliminan
  otros caracteres de control. Las longitudes se miden sobre el valor
  normalizado con `String.length` (igual que `minlength`/`maxlength` en HTML).
- Campos desconocidos se ignoran y nunca se reenvían.
- Si `sitio_web` trae contenido, la respuesta es `200 {"ok":true}` y no se
  reenvía nada (tampoco se valida el resto).

### Respuestas

Todas con `Content-Type: application/json; charset=utf-8` y `Cache-Control: no-store`.

| HTTP | Cuerpo | Cuándo |
| --- | --- | --- |
| 200 | `{"ok":true}` | Reenviado a n8n con respuesta 2xx, o honeypot relleno |
| 400 | `{"ok":false,"error":"validation","fields":{...}}` | Algún campo no cumple (`fields` solo trae los campos con error) |
| 400 | `{"ok":false,"error":"bad_json"}` | El cuerpo no es JSON válido (incluye cuerpo vacío o UTF-8 inválido) |
| 405 | `{"ok":false,"error":"method_not_allowed"}` + cabecera `Allow: POST` | Cualquier método distinto de POST |
| 413 | `{"ok":false,"error":"payload_too_large"}` | Cuerpo mayor a 16 KB (16384 bytes) |
| 415 | `{"ok":false,"error":"unsupported_media_type"}` | `Content-Type` distinto de `application/json` |
| 502 | `{"ok":false,"error":"upstream"}` | n8n responde no-2xx (incluidas redirecciones), error de red o timeout de 8 s |
| 503 | `{"ok":false,"error":"not_configured"}` | Falta `N8N_CONTACT_WEBHOOK_URL` o no es una URL `https` válida |

Orden de comprobación: 415, 413, 400 `bad_json`, honeypot (200), 400
`validation`, 503, reenvío (200 o 502). Un cuerpo JSON que no es objeto (por
ejemplo `[]`) produce `validation` con los tres campos en `required`.

Ejemplo de error de validación:

```json
{ "ok": false, "error": "validation", "fields": { "nombre": "too_short", "contacto": "invalid", "proceso": "required" } }
```

Nota: la protección `security.checkOrigin` de Astro (activa por defecto)
responde `403` en texto plano, antes de llegar al endpoint, a un `POST`
cross-site con tipo de formulario (`text/plain`, `application/x-www-form-urlencoded`,
`multipart/form-data`) o sin `Content-Type`. Enviando `application/json` desde
el propio sitio no aplica.

### Payload reenviado a n8n

`POST` a `N8N_CONTACT_WEBHOOK_URL` con `Content-Type: application/json` y, si
existe `N8N_CONTACT_WEBHOOK_TOKEN`, `Authorization: Bearer <token>`:

```json
{
  "nombre": "Ana Pérez",
  "contacto": "ana@empresa.cl",
  "proceso": "Cotizaciones por WhatsApp y planillas sueltas.",
  "idioma": "es",
  "origen": "arcav.us",
  "recibido_en": "2026-09-17T12:00:00.000Z"
}
```

- Timeout de 8 s con `AbortController`.
- No se siguen redirecciones (`redirect: "manual"`), para no reenviar el token a
  otro destino: la URL configurada debe ser la final.
- El cuerpo de la respuesta de n8n nunca se devuelve al cliente.
- n8n debe validar el token (por ejemplo, Header Auth en el nodo Webhook) y
  tratar los campos como texto no confiable si los inserta en correos o HTML.

## Uso desde el frontend

```ts
import type { ContactRequest, ContactResponse } from "../lib/contact";

const res = await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" }, // obligatorio: sin él fetch envía text/plain -> 415
  body: JSON.stringify(payload satisfies ContactRequest),
});
const data = (await res.json()) as ContactResponse;
```

- Traducir `error` y cada valor de `fields` con claves de `src/i18n`; el
  endpoint no devuelve textos de interfaz.
- Para validar en el cliente con las mismas reglas se puede importar
  `validateContact`, `CONTACT_LIMITS` o `normalizeIdioma` de `src/lib/contact.ts`
  (sin dependencias de servidor). No importar `contact-server.ts` en el cliente.
- Tratar `502` y `503` como "no se pudo enviar, intenta más tarde o escribe por
  otro canal"; conviene no borrar lo escrito.
- Tratar una respuesta que no sea JSON (por ejemplo el `403` de `checkOrigin` o
  un fallo de red) como error genérico.

## Variables de entorno

| Nombre | Obligatoria | Tipo recomendado en Cloudflare | Uso |
| --- | --- | --- | --- |
| `N8N_CONTACT_WEBHOOK_URL` | Sí | Secret | URL `https` del webhook de producción de n8n |
| `N8N_CONTACT_WEBHOOK_TOKEN` | No | Secret | Token enviado como `Authorization: Bearer <token>` |

Cómo se leen: en Astro 6 con `@astrojs/cloudflare` 13, `Astro.locals.runtime.env`
ya no existe; las variables y bindings se importan con
`import { env } from "cloudflare:workers"`
([guía del adaptador](https://docs.astro.build/en/guides/integrations-guide/cloudflare/),
secciones "Environment variables and bindings" y "Astro.locals.runtime").

### Producción (Cloudflare)

Lo hace una persona con acceso a la cuenta; no forma parte del código.

Opción A, dashboard: Workers & Pages -> Worker `lp-arcav-us` -> Settings ->
Variables and Secrets -> Add -> tipo **Secret** -> nombre y valor. Repetir para
el token si se usa. Los cambios aplican al guardar/desplegar.

Opción B, CLI (pide el valor por consola, no queda en el historial):

```bash
npx wrangler secret put N8N_CONTACT_WEBHOOK_URL
npx wrangler secret put N8N_CONTACT_WEBHOOK_TOKEN
```

Usa tipo Secret y no `vars` en `wrangler.jsonc`: un despliegue con
`wrangler deploy` sobrescribe las variables de texto definidas solo en el
dashboard, pero conserva los secretos.

La compatibilidad `global_fetch_strictly_public` del Worker exige que la URL de
n8n sea pública.

### Local (`astro dev` / `astro preview`)

Crear `.dev.vars` en la raíz del proyecto (está en `.gitignore`, no se versiona):

```dotenv
N8N_CONTACT_WEBHOOK_URL=https://<n8n-de-prueba>/webhook-test/<id>
N8N_CONTACT_WEBHOOK_TOKEN=<token-de-prueba>
```

- Usa un webhook de prueba, no el de producción.
- Reinicia `npm run dev` o `npm run preview` tras cambiarlo.
- Sin `.dev.vars` el endpoint responde `503 not_configured` a un envío válido
  (comportamiento esperado y verificado).

## Pruebas

### Unitarias (sin red)

```bash
node --test tests/contact.test.mjs
```

Node 22.18 o superior importa los `.ts` directamente (type stripping nativo;
en Node 22.12 a 22.17 agrega `--experimental-strip-types`).
Por eso `src/lib/contact*.ts` usan solo sintaxis TypeScript borrable (sin
`enum`, `namespace` ni parameter properties) e imports relativos con extensión
`.ts`. Cubren: válido (email y teléfono), cada campo inválido, honeypot,
idioma inválido, 415, 413, `bad_json`, 503, reenvío con y sin token, 502 por
no-2xx, error de red y timeout, 405 y ausencia de datos personales en logs.

### Manuales con curl

```bash
npm run build
npm run preview -- --port 4488
U=http://localhost:4488/api/contact

# Válido: sin variables -> 503 not_configured; con webhook de prueba -> 200
curl -si -X POST "$U" -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana Perez","contacto":"ana@empresa.cl","proceso":"Cotizaciones por WhatsApp y planillas.","idioma":"es","sitio_web":""}'

# Inválido -> 400 validation con fields
curl -si -X POST "$U" -H 'Content-Type: application/json' \
  -d '{"nombre":"A","contacto":"hola","proceso":"","idioma":"fr","sitio_web":""}'

# Honeypot -> 200 {"ok":true}, sin reenvío
curl -si -X POST "$U" -H 'Content-Type: application/json' \
  -d '{"nombre":"Bot","contacto":"x","proceso":"","sitio_web":"http://spam.example"}'

# JSON roto -> 400 bad_json; otro tipo -> 415; GET -> 405
curl -si -X POST "$U" -H 'Content-Type: application/json' -d '{nombre:'
curl -si -X POST "$U" -H 'Content-Type: application/xml' -d '<a/>'
curl -si "$U"
```

## Seguridad y registros

- Los logs solo contienen mensajes fijos: `contact: webhook no configurado o URL no válida`,
  `contact: upstream status <código>`, `contact: upstream timeout`,
  `contact: upstream network error`. Nunca nombre, contacto, proceso, URL ni token.
- Respuestas sin trazas ni eco de la entrada.

## Pendiente

- Rate limiting (PRD US-07, escenario 3: envíos repetidos en menos de 10 s).
  No está implementado: requiere decidir el mecanismo (binding de Rate Limiting
  de Workers en `wrangler.jsonc` o regla WAF) y los umbrales. Si se añade,
  el contrato crece de forma compatible con `429 {"ok":false,"error":"rate_limited"}`.
