---
name: contratos-integracion
description: Procedimiento del rol integraciones para definir primero el contrato de datos TypeScript y luego implementar endpoints server de Astro 6 en src/pages/api, el backend del formulario de contacto y el webhook n8n en Cloudflare Workers, con secretos solo por bindings o entorno. Úsala al crear o cambiar endpoints, contratos, validación o llamadas salientes.
user-invocable: false
---

# Contratos e integraciones (Astro 6 en Cloudflare Workers)

Rol dueño: `integraciones`. Escribes en `src/pages/api/`, el módulo de
contratos y utilidades de servidor que la tarea asigne. No despliegas, no
ejecutas `wrangler deploy` ni `wrangler secret`, y no escribes valores de
secretos en ningún archivo. Cambios en `wrangler.jsonc` se proponen a `release`
(escritor único de ese archivo) salvo que la tarea te lo asigne.

## Contexto mínimo (lectura progresiva)

1. La tarea y su historia `US-xx` en `PRD.md` (4 escenarios).
2. La integración ya entregada, que fija el patrón: `docs/contacto.md`,
   `src/lib/contact.ts` (contrato), `src/lib/contact-server.ts` (manejo HTTP),
   `src/pages/api/contact.ts` (endpoint) y `tests/contact.test.mjs`.
3. Otros contratos existentes y sus consumidores (`grep` del import).
4. `astro.config.mjs`, `wrangler.jsonc` y el componente de UI que consumirá el
   endpoint (solo lectura, para conocer campos y estados).
5. Documentación oficial de la versión instalada si dudas de una API
   (`node_modules/astro/package.json`, `node_modules/@astrojs/cloudflare`).

## Hechos del proyecto que debes respetar

- `output: 'server'` con `@astrojs/cloudflare`. Un endpoint dinámico necesita
  `export const prerender = false;` y exporta handlers tipados
  (`export const POST: APIRoute = async ({ request, clientAddress }) => { ... }`).
- Las páginas `src/pages/{es,en,pt}/index.astro` están prerenderizadas: no
  procesan `POST`. Los envíos van a un endpoint de `src/pages/api/`.
- El formulario de contacto **ya está implementado** y es el patrón de
  referencia: `src/pages/api/contact.ts` (`prerender = false`, `POST` y `ALL`
  para el 405), contrato y validación puros en `src/lib/contact.ts`, manejo HTTP
  en `src/lib/contact-server.ts`, pruebas en `tests/contact.test.mjs` y contrato
  documentado en `docs/contacto.md` (códigos 400/405/503, variables
  `N8N_CONTACT_WEBHOOK_URL` y `N8N_CONTACT_WEBHOOK_TOKEN`). Léelo antes de
  tocarlo: no lo rehagas ni crees un contrato paralelo para el mismo dominio.
- `observability` está activo en `wrangler.jsonc` y el repo es público: ningún
  `console.*` puede llevar datos personales, URLs privadas ni tokens.
- En Astro 6, `Astro.locals.runtime.env` ya no existe: las variables y
  bindings se leen con `import { env } from "cloudflare:workers"`; el contexto
  de ejecución con `Astro.locals.cfContext`.
- Zod está disponible como `astro/zod` (Zod 4, sin añadir dependencias), pero el
  contrato vigente no lo usa: `src/lib/contact.ts` valida a mano, sin
  dependencias de runtime, para poder importarse desde el cliente y probarse con
  `node --test`. Zod es una opción justificable, no la norma.
- `compatibility_flags: ["global_fetch_strictly_public"]`: `fetch` saliente
  solo alcanza direcciones públicas; el webhook n8n debe ser una URL pública.

## Procedimiento

### 1. Contrato primero

1. Deriva del PRD entradas, salidas y errores. Para cada campo: tipo,
   obligatoriedad, límites (longitud, formato) y origen de la regla. Lo que el
   PRD no define es **bloqueo**, no una suposición.
2. Escribe el contrato en TypeScript siguiendo el patrón vigente:
   `src/lib/<dominio>.ts` (hoy `src/lib/contact.ts`), lógica pura, sin
   dependencias de runtime y con sintaxis TypeScript "borrable" (sin `enum`,
   `namespace` ni parameter properties), para poder importarlo desde el cliente
   y probarlo con `node --test`. Si el dominio ya tiene contrato, extiéndelo; no
   crees `src/lib/contracts/` ni un segundo archivo para lo mismo. Incluye:
   - Validación estricta de cada campo (tipo, obligatoriedad, longitud, formato)
     y los tipos exportados de petición y respuesta. Si la tarea justifica un
     esquema declarativo, `z.strictObject({...})` con
     `import { z } from "astro/zod"` (Zod 4) es una opción: decláralo en la
     entrega y asume que ese módulo deja de ser importable sin dependencias.
   - Respuesta de éxito y respuesta de error con **códigos estables**
     (`validation_error`, `rate_limited`, `upstream_unavailable`, ...), campos con
     error y estado HTTP asociado (400/422, 429, 502/503).
   - Nada de mensajes para el usuario en el contrato: el frontend traduce los
     códigos en `translations.ts`.
3. Incluye ejemplos válidos e inválidos que representen los 4 escenarios.
4. Entrega el contrato (ruta + commit + consumidores) **antes** de que
   `frontend` implemente la parte dependiente.
5. Cambios posteriores: clasifícalos (campo nuevo, eliminado, nulabilidad,
   código de error nuevo) y lista qué consumidor debe adaptarse. Un cambio
   incompatible invalida la señal de "contrato listo".

### 2. Endpoint

1. Valida método y `Content-Type` (`application/json` o formulario, según
   contrato); rechaza cuerpos mayores al límite acordado antes de parsear.
2. Valida con el esquema del contrato; responde con el código de error y los
   campos afectados, sin reflejar la entrada cruda ni trazas.
3. Antispam, según lo que la historia defina:
   - **Honeypot**: campo oculto que un humano no rellena; si llega con valor,
     responde como éxito genérico sin notificar.
   - **Rate limit**: por IP (`clientAddress`, que el adaptador toma de
     `cf-connecting-ip`) con el binding de Rate Limiting de Workers o una regla
     WAF. El binding se declara en `wrangler.jsonc` (propónlo a `release`); la
     elección y los umbrales los confirma el humano. Sin decisión, es bloqueo.
   - Captcha (por ejemplo Turnstile) solo si el PRD lo pide.
4. No registres datos personales (email, nombre, mensaje) en `console.*`; usa
   identificadores o conteos.
5. `security.checkOrigin` de Astro (activo por defecto) protege formularios
   `POST`; no lo desactives.

### 3. Webhook n8n y llamadas salientes

1. URL y secreto compartido del webhook son **secretos**: se leen de `env`
   (`import { env } from "cloudflare:workers"`). Los nombres de las variables los
   confirma el humano; decláralos sin valores en la entrega y en `.env.example`
   (solo nombres con valores de ejemplo evidentes).
2. Autentica la llamada (cabecera con secreto compartido o firma HMAC, según
   acuerde el dueño de n8n) y usa HTTPS.
3. Pon timeout (`AbortSignal.timeout(<ms>)`), trata respuestas no 2xx y
   timeouts como `upstream_unavailable`, y no expongas el cuerpo de la respuesta
   de n8n al cliente.
4. Envía solo los campos que el contrato define; escapa o sanea texto libre si
   n8n lo inserta en correos o mensajes (saltos de línea en cabeceras, HTML).
5. Sin variables configuradas, el endpoint responde un error controlado y no
   simula éxito.

### 4. Variables y secretos

- Local: `.dev.vars` (ignorado por git). No lo leas ni lo imprimas; si necesitas
  un valor, pídelo al humano.
- Producción: el humano los carga en Cloudflare (dashboard o `wrangler secret`);
  tú nunca ejecutas esos comandos.
- Tras añadir bindings, `npm run generate-types` (`wrangler types`) actualiza
  `worker-configuration.d.ts`; coordina con `release` si cambia `wrangler.jsonc`.

## Comprobaciones

```bash
node --test tests/contact.test.mjs   # suite del endpoint de contacto, sin red
npm run build
npm run preview    # endpoint en el puerto que imprima (por defecto 4321)
curl -si -X POST http://localhost:4321/api/<ruta> -H 'Content-Type: application/json' -d '<válido>'
curl -si -X POST http://localhost:4321/api/<ruta> -H 'Content-Type: application/json' -d '<inválido>'
```

- Cubre los 4 escenarios: éxito, validación, límite (rate limit / honeypot /
  tamaño) y estado de espera o servicio no disponible.
- **No llames al webhook real de producción** en pruebas. Sin un endpoint de
  prueba autorizado por el humano, verifica el camino "servicio no disponible" y
  deja el envío real como **no ejecutado**.

## Checklist

- [ ] Contrato con esquema estricto, tipos, códigos de error y ejemplos, entregado antes de la UI.
- [ ] Endpoint con `prerender = false`, validación de método, tipo y tamaño.
- [ ] Honeypot y rate limit según PRD, o bloqueo declarado.
- [ ] Sin datos personales en logs; sin trazas ni entrada cruda en respuestas.
- [ ] Secretos solo vía `env`; ningún valor en archivos versionados.
- [ ] `fetch` saliente con timeout y manejo de no 2xx.
- [ ] `npm run build` OK y 4 escenarios probados con `curl` en preview.

## Formato de salida

Usa `templates/entrega.md` (y un bloque con la forma de `templates/handoff.json`
si entregas a `frontend`) y añade:

```
Tarea / historia: <clave> / US-xx
Resultado: completo | parcial | bloqueado
Contrato: <ruta>@<commit> | cambio <compatible | incompatible> -> consumidores <lista>
Endpoint: <método> /api/<ruta> -> códigos <lista>
Secretos/bindings requeridos (sin valores): <NOMBRE (propósito)> | ninguno
Cambios pedidos a release: <wrangler.jsonc: ...> | ninguno
Comprobaciones: <comando -> resultado>; no ejecutadas: <lista y motivo>
Bloqueos: <decisión faltante> -> <responsable> | ninguno
```
