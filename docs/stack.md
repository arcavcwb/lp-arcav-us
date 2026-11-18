# Stack

Stack real de `lp-arcav-us`, leído de los archivos del repositorio. Si este
documento contradice a `package.json`, `astro.config.mjs`, `wrangler.jsonc`,
`tsconfig.json` o `.github/workflows/`, prevalecen esos archivos y hay que
corregir este documento.

## Aplicación

| Área | Decisión | Fuente |
|---|---|---|
| Framework | Astro `^6.4.4`, `output: 'server'`, `site: 'https://arcav.us'` | `package.json`, `astro.config.mjs` |
| Adaptador | `@astrojs/cloudflare` `^13.6.1` | `package.json`, `astro.config.mjs` |
| Runtime | Cloudflare Workers; entrada `@astrojs/cloudflare/entrypoints/server` | `wrangler.jsonc` |
| CLI de Cloudflare | `wrangler` `^4.97.0` | `package.json` |
| Node.js | `>=22.12.0` | `package.json` (`engines`) |
| Vite | override a `^7` | `package.json` (`overrides`) |
| TypeScript | `astro/tsconfigs/strict`; incluye `.astro/types.d.ts` y `worker-configuration.d.ts` | `tsconfig.json` |
| Estilos | Vanilla CSS con tokens en el `:root` de `src/styles/global.css`, según `DESIGN.md`. Sin Tailwind ni frameworks CSS | `src/styles/global.css`, `DESIGN.md` |
| Tipografía | Barlow y Barlow Condensed autoalojadas: `.woff2` en `public/fonts/`, `@font-face` en `src/styles/global.css` y `preload` de dos cortes en `src/layouts/Layout.astro`. Sin Google Fonts | `public/fonts/`, `src/styles/global.css`, `src/layouts/Layout.astro` |
| i18n | `defaultLocale: 'es'`, `locales: ['es', 'en', 'pt']`, `prefixDefaultLocale: true` | `astro.config.mjs` |

### Rutas e idiomas

- `/` (`src/pages/index.astro`) se ejecuta en el servidor y redirige a `/es`,
  `/en` o `/pt` según la cookie `arcav_lang`, luego `Accept-Language`, y por
  defecto español.
- `src/pages/es/`, `src/pages/en/` y `src/pages/pt/` son las páginas por idioma.
- Todo texto visible sale de `src/i18n/translations.ts` para los tres idiomas.
- Los endpoints server van en `src/pages/api/` (responsabilidad de
  `integraciones`). Existe `src/pages/api/contact.ts`, el backend del
  formulario de contacto, con su contrato y validación compartidos en
  `src/lib/contact.ts` y la parte de servidor en `src/lib/contact-server.ts`.
  Documentación: `docs/contacto.md`. Los endpoints nuevos se crean cuando una
  historia los requiere.

### Configuración de Cloudflare (`wrangler.jsonc`)

- `name: "lp-arcav-us"`, `compatibility_date: "2026-06-04"`,
  `compatibility_flags: ["global_fetch_strictly_public"]`.
- Assets estáticos desde `./dist` con binding `ASSETS`.
- `observability.enabled: true`.
- Variables y secretos se configuran como bindings o variables de entorno de
  Cloudflare (y `.dev.vars` en local, ignorado por git). Nunca en el repositorio.
- `npm run generate-types` (`wrangler types`) genera
  `worker-configuration.d.ts` con los tipos de los bindings.

## Scripts de npm

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Previsualización local de la build |
| `npm run astro` | CLI de Astro |
| `npm run generate-types` | Tipos de bindings con `wrangler types` |

## Despliegue

- Producción: Cloudflare Workers en https://arcav.us.
- Cloudflare Workers Builds construye y despliega al hacer merge a `main`. Esa
  conexión se configura en el panel de Cloudflare, no en el repositorio.
- Mergear a `main` es desplegar: requiere aprobación humana explícita. Ningún
  rol ejecuta `wrangler deploy` (ver `docs/protocolo.md`).

## CI en GitHub Actions

| Workflow | Qué hace |
|---|---|
| `.github/workflows/validate-squad.yml` | Job `validate` con matriz `python-version` 3.10, 3.11 y 3.12 (y Node 22): ejecuta `python3 scripts/validate_squad.py`, `python3 -m unittest discover tests -v` y `node --test tests/contact.test.mjs`. Sus tres ejecuciones son checks requeridos en `main`. |
| `.github/workflows/claude-pr-review.yml` | Revisión de PR hacia `main` con `anthropics/claude-code-action`. Opcional: se activa con la variable de repositorio `CLAUDE_PR_REVIEW=true` y un secreto de credenciales. Solo comenta y no es check requerido. Ver `docs/claude-pr-review.md`. |

## Tooling del flujo

- Python `>=3.10` para `scripts/`, `tools/vikunja_sync.py` y los `test_*.py` de
  `tests/` (biblioteca estándar y `unittest`). `tests/contact.test.mjs` corre
  con `node --test` y prueba `src/lib/contact*.ts`. Comandos en
  `docs/herramientas-locales.md`.
- `.pre-commit-config.yaml` ejecuta hooks básicos, el validador y la suite de
  pruebas.
- Gestión de tareas: Vikunja (https://vikunja.arcav.us, proyecto id 2). Ver
  `docs/vikunja.md`.
- Agentes: Claude Code (`CLAUDE.md`, `.claude/agents/`, `.claude/skills/`,
  `.claude/workflows/`).

## Fuera del stack

No se usan Next.js, React, NestJS, Supabase ni un paquete de contratos
compartido (`packages/contracts`). Los contratos de datos son tipos TypeScript
que define `integraciones`; su ubicación se registra en la tarea. Agregar una
dependencia o framework es una decisión humana que se registra antes de
implementarla.
