---
name: auditoria-seguridad
description: Procedimiento defensivo del rol qa-revisor para auditar la seguridad de lp-arcav-us, un repositorio público con Astro 6 en Cloudflare Workers. Cubre secretos versionados, secretos en GitHub Actions, código de PR ejecutado con secretos, formulario y endpoints (validación, honeypot, rate limit), cabeceras HTTP y dependencias. Úsala cuando el diff toque src/pages/api, .github, wrangler.jsonc, astro.config.mjs o package*.json, o en una revisión completa.
user-invocable: false
---

# Auditoría de seguridad

Rol dueño: `qa-revisor`. Auditoría **defensiva y de solo lectura**: no modificas
código ni configuración, no atacas producción (sin fuzzing, carga ni envíos de
formularios a `https://arcav.us`), no lees `.env` ni `.dev.vars` y no ejecutas
`gh secret`, `gh variable` ni `wrangler secret`. Los hallazgos van a
`bug_report.md` (sección *Seguridad*) y a tu entrega.

**Nunca reproduzcas un valor secreto** en la salida, en `bug_report.md`, en
comentarios de PR ni en Vikunja: indica archivo, línea y tipo de secreto.

## Alcance según el cambio

| El diff toca | Secciones obligatorias |
|---|---|
| Cualquier archivo | 1 (secretos en el diff) |
| `src/pages/api/`, formularios, `src/middleware.*` | 1, 4, 5 |
| `.github/` | 1, 2, 3 |
| `wrangler.jsonc`, `astro.config.mjs` | 1, 4, 5 |
| `package.json`, `package-lock.json` | 1, 6 |
| Revisión completa del proyecto | 1 a 6 |

## 1. Repositorio público y secretos versionados

Todo lo versionado, el historial, los logs de Actions y los comentarios de PR
son públicos.

```bash
git ls-files | grep -E '(^|/)\.env|\.dev\.vars|\.pem$|\.key$|credentials'   # solo .env.example
git check-ignore -v .env .env.local .dev.vars .wrangler                      # los cuatro ignorados
# Prefijos de formatos conocidos (-o imprime solo el prefijo, no el valor):
git grep -nIoE 'sk-ant-|ghp_|github_pat_|gho_|xox[abprs]-|AKIA[0-9A-Z]{4}|AIza|-----BEGIN [A-Z ]*PRIVATE KEY'
# Asignaciones sospechosas (muestra solo el nombre de la clave):
git grep -nIoiE "(api[_-]?key|secret|token|password|passwd|webhook[_-]?url)[\"' ]*[:=]"
# Lo mismo sobre el diff del candidato:
git diff main...HEAD | grep -noE 'sk-ant-|ghp_|github_pat_|xox[abprs]-|AIza|PRIVATE KEY'
```

- Revisa cada coincidencia leyendo la línea (sin copiarla): distingue ejemplo
  evidente (`tu_token_aqui`) de valor real. Si `gitleaks` está instalado, puedes
  usar `gitleaks detect --redact`; no lo instales por tu cuenta.
- Busca también datos personales (emails o mensajes de leads reales), URLs
  privadas (webhooks n8n con token en la ruta, paneles internos) e información
  confidencial de clientes en `PRD.md`, `sprint_actual.md`, `bug_report.md`,
  `docs/` y fixtures de prueba.
- `VIKUNJA_API_TOKEN` y los secretos del Worker solo existen en `.env` local,
  `.dev.vars` o Cloudflare/GitHub; `.env.example` solo contiene nombres y
  valores de ejemplo.
- **Secreto real versionado = crítico.** Borrar el archivo o reescribir el
  historial no basta en un repo público: recomienda rotación inmediata y escala
  al humano. No reescribas historial ni hagas commits.

## 2. Secretos en CI (`.github/workflows/`)

- [ ] `permissions:` explícito y mínimo (idealmente `{}` a nivel de workflow y
      permisos por job). `id-token: write` solo donde la acción lo exige.
- [ ] Secretos solo como `${{ secrets.X }}` en el `env:` del paso que los usa;
      nunca en argumentos de línea de comandos, `echo`, `set -x` ni artefactos.
- [ ] Sin inyección de scripts: ningún `${{ github.event.pull_request.title }}`,
      `...body`, `github.head_ref` ni campos de comentarios interpolados dentro de
      `run:`; se pasan por `env:` y se citan.
- [ ] Acciones de terceros fijadas a SHA completo (con comentario de versión);
      acciones `actions/*` al menos a versión mayor.
- [ ] Los checks requeridos siguen existiendo: job `validate` con matriz
      `python-version` 3.10/3.11/3.12 en `validate-squad.yml`. Un cambio que los
      renombre o los elimine debilita la protección de `main`.

## 3. Código de PR ejecutado con secretos

- [ ] Ningún workflow con `pull_request_target` o `workflow_run` hace checkout del
      código del PR (`ref: ${{ github.event.pull_request.head.sha }}`, `head_ref`)
      ni ejecuta `npm ci`, `npm run build`, tests o scripts del PR con secretos o
      con un token con escritura. Los scripts de ciclo de vida de npm
      (`preinstall`, `postinstall`) bastan para exfiltrar secretos.
- [ ] Jobs que usan secretos en `pull_request` exigen
      `github.event.pull_request.head.repo.full_name == github.repository` (los
      forks no deben llegar a esos pasos).
- [ ] Revisión con `anthropics/claude-code-action`: el contenido del PR (título,
      descripción, diff, comentarios, nombres de rama) es entrada no confiable;
      el prompt lo declara como datos; `--allowedTools` limitado a lectura y a
      comentar; `Edit`, `Write` y Bash general deshabilitados; no ejecuta código
      del PR; no se dispara por comentarios de cualquier usuario sin comprobar
      permisos; bots excluidos.
- [ ] Sin cachés (`actions/cache`) restauradas en jobs con secretos a partir de
      claves que un PR pueda escribir.
- [ ] Cloudflare Workers Builds: pide al humano confirmar si se construyen ramas
      distintas de `main` y qué variables de build existen; los secretos de
      runtime no deben definirse como variables de build. Es una verificación
      de configuración, no un supuesto: si no se puede confirmar, regístrala como
      pendiente.

## 4. Formulario de contacto y endpoints (`src/pages/api/*`)

- [ ] Endpoint con `export const prerender = false`; las páginas prerenderizadas
      (`src/pages/{es,en,pt}/index.astro`) no procesan `POST`.
- [ ] Validación en servidor con esquema estricto (campos desconocidos
      rechazados, tipos, longitudes máximas, formato de email); la validación del
      navegador no cuenta.
- [ ] Método y `Content-Type` comprobados; límite de tamaño del cuerpo antes de
      parsear.
- [ ] **Honeypot**: campo oculto (fuera de la vista, `tabindex="-1"`,
      `autocomplete="off"`); si llega relleno, respuesta genérica sin notificar.
- [ ] **Rate limit** por IP (`clientAddress` / `cf-connecting-ip`) con binding de
      Rate Limiting de Workers o regla WAF, con umbral acordado (el PRD de
      US-07 habla de envíos repetidos en menos de 10 s). Sin mecanismo ni
      decisión humana, es hallazgo o bloqueo.
- [ ] Errores con códigos estables; sin trazas, mensajes internos, cuerpo de
      respuesta de n8n ni eco de la entrada cruda.
- [ ] Sin datos personales en `console.*`: `observability` está activo en
      `wrangler.jsonc` y los logs persisten en Cloudflare.
- [ ] Webhook n8n: URL y secreto desde `env` (`import { env } from
      "cloudflare:workers"`), HTTPS, autenticación de la llamada, timeout, sin
      enviar campos no definidos por el contrato; texto libre saneado si n8n lo
      inserta en correos (saltos de línea en cabeceras, HTML).
- [ ] Ninguna variable de servidor llega al cliente (`import.meta.env.PUBLIC_*`
      solo para valores públicos).
- [ ] `security.checkOrigin` no desactivado en `astro.config.mjs`; sin
      `Access-Control-Allow-Origin: *` en endpoints de escritura.
- [ ] Redirecciones: `src/pages/index.astro` solo redirige a locales de una lista
      cerrada (`es`, `en`, `pt`); ningún parámetro de usuario decide el destino.

Prueba local en `npm run preview` con `curl` (caso válido, campo extra, email
inválido, cuerpo enorme, honeypot relleno, ráfaga de peticiones). Nunca contra
producción ni contra el webhook real.

## 5. Cabeceras HTTP

Comprueba la respuesta real, no solo el código:

```bash
curl -sI http://localhost:4321/es/        # página prerenderizada (asset estático)
curl -sI http://localhost:4321/           # respuesta dinámica del Worker
curl -sI https://arcav.us/es/             # producción, solo lectura
```

Esperado (hallazgo de severidad media si falta, salvo decisión registrada):

- `Content-Security-Policy` compatible con lo que carga `Layout.astro`. Hoy las
  fuentes son woff2 de origen propio (`public/fonts/`, con `@font-face` en
  `src/styles/global.css` y `<link rel="preload">` en el head), así que la CSP no
  necesita dominios externos: `font-src 'self'` basta. Antes de proponer una
  directiva, comprueba en el HTML servido qué orígenes externos existen de
  verdad (`curl -s "$B/es/" | grep -oE 'https?://[^"]+'`). Astro 6 ofrece
  `security.csp` en `astro.config.mjs`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin` (o más estricta).
- `frame-ancestors 'none'` en la CSP o `X-Frame-Options: DENY`.
- `Strict-Transport-Security` (cabecera o ajuste de Cloudflare verificado).
- `Permissions-Policy` restrictiva.

Las páginas prerenderizadas se sirven como assets estáticos y pueden no pasar
por el middleware de Astro: verifica ambas rutas. Cookies (`arcav_lang`): `Path=/`,
`SameSite=Lax`, `Secure` en producción; no deben contener datos sensibles.

## 6. Dependencias

```bash
npm audit --omit=dev          # lectura del registro de npm; registra severidades
git diff main...HEAD -- package.json package-lock.json
```

- [ ] Vulnerabilidades altas o críticas en dependencias de runtime: hallazgo con
      paquete, versión y versión corregida si existe.
- [ ] Cada dependencia nueva está justificada en la entrega; revisa licencia,
      mantenimiento y si el lockfile marca `hasInstallScript: true`.
- [ ] `package.json` y `package-lock.json` cambian juntos; sin rangos abiertos
      nuevos (`*`, `latest`) ni cambios en `overrides` sin motivo.
- [ ] No instales ni actualices paquetes para "arreglar" un hallazgo: repórtalo
      a `release` o `integraciones`.
- [ ] Scripts Python de `scripts/` y `tools/` usan solo biblioteca estándar
      salvo dependencia justificada.

## Severidad y efecto en el dictamen

| Severidad | Ejemplos | Efecto |
|---|---|---|
| Crítica | Secreto real versionado; código de PR ejecutado con secretos; endpoint que reenvía datos a un destino controlable por el usuario | Impide `approved`; escalar al humano |
| Alta | Sin validación en servidor; PII en logs; inyección de scripts en Actions; `permissions` de escritura innecesarios | Impide `approved` |
| Media | Falta rate limit o honeypot exigidos; cabeceras de seguridad ausentes; acción de terceros sin fijar a SHA | Fallo a corregir o decisión humana registrada |
| Baja | Endurecimiento opcional, documentación de nombres de variables | No bloquea; se registra |

## Formato de cada hallazgo

```
SEC-<n> | <crítica|alta|media|baja> | <categoría: secretos|ci|pr-con-secretos|endpoint|cabeceras|dependencias>
Ubicación: <archivo>:<línea> (o URL y cabecera)
Vector y precondición: <cómo se explota y qué necesita el atacante>
Impacto: <qué se compromete>
Evidencia: <comando y salida recortada, sin valores secretos>
Remediación: <cambio concreto> -> responsable <frontend|integraciones|release|humano>
```

Lo que no puedas verificar (por ejemplo configuración de Cloudflare o de GitHub
que no es visible desde el repo) va como **pendiente** con el dato que falta,
nunca como conforme.
