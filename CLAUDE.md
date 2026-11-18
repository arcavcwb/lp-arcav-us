# lp-arcav-us

Landing y portafolio multilenguaje (ES / EN / PT) de ARCAV, el estudio de producto digital de Armando Castro, publicado en https://arcav.us. Contexto de negocio y marca: `docs/PROJECT.md` y `docs/BRAND.md`.

El repositorio `arcavcwb/lp-arcav-us` es **público**: todo lo que se versiona es visible.

## Stack real

- Astro 6 con `output: 'server'` y adapter `@astrojs/cloudflare` (`astro.config.mjs`, `site: https://arcav.us`).
- Cloudflare Workers (`wrangler.jsonc`, worker `lp-arcav-us`, assets en `./dist`). Mergear a `main` despliega a producción con Workers Builds.
- i18n nativo de Astro: locales `es` (por defecto), `en`, `pt` con prefijo en todas las rutas. `src/pages/index.astro` redirige según cookie `arcav_lang`, `Accept-Language` o español.
- Vanilla CSS con variables en `src/styles/global.css`, derivadas de `DESIGN.md` (sistema visual vigente). Sin Tailwind ni frameworks de UI.
- TypeScript estricto (`astro/tsconfigs/strict`), Node >= 22.12.
- Tooling del flujo en Python 3 con biblioteca estándar: validador, tests y cliente de Vikunja.

Cambiar stack, adapter, modo de render o añadir dependencias requiere decisión humana explícita.

## Comandos

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualiza la build |
| `npm run generate-types` | Regenera los tipos de los bindings de Cloudflare (`wrangler types`) |
| `python3 scripts/validate_squad.py` | Valida CLAUDE.md, subagentes, skills, workflows y `config/skills.json` |
| `python3 -m unittest discover tests -v` | Tests Python del tooling |
| `node --test tests/contact.test.mjs` | Tests del contrato del formulario de contacto. Requiere Node >= 22.18 (borrado nativo de tipos de `.ts`); entre 22.12 y 22.17, añade `--experimental-strip-types` |

CI (`.github/workflows/validate-squad.yml`): el job `validate` corre con la matriz Python 3.10, 3.11 y 3.12 más Node 22, y ejecuta tres pasos: `python3 scripts/validate_squad.py`, `python3 -m unittest discover tests -v` y `node --test tests/contact.test.mjs`. Los checks `validate (3.10)`, `validate (3.11)` y `validate (3.12)` son obligatorios en `main`: no renombres el job `validate` ni su matriz. Antes de entregar, ejecuta localmente lo que corresponda a tu cambio: el validador y los tests de Python si tocas agentes, skills, workflows o `config/skills.json`; además `node --test tests/contact.test.mjs` si tocas `src/lib/contact*.ts` o `src/pages/api/contact.ts`.

## Mapa del repo

- `src/pages/`: router de idioma (`index.astro`) y páginas `es/`, `en/`, `pt/`. Endpoints server en `src/pages/api/`.
- `src/components/`, `src/layouts/Layout.astro` (head y SEO), `src/styles/global.css`.
- `src/lib/`: contratos de datos y lógica de servidor compartida. El contrato del formulario ya existe en `contact.ts` y `contact-server.ts`: extiéndelos en vez de crear un contrato paralelo.
- `src/i18n/translations.ts`: todo el texto visible, tipado con `Copy`, para `es`, `en` y `pt`.
- Raíz: `DESIGN.md` (sistema visual vigente: paleta, tipografía, componentes), `PRODUCT.md` (producto, usuarios y alcance), `PRD.md` (requisitos vigentes) y `sprint_actual.md` (espejo de Vikunja). `bug_report.md` no existe hasta que `qa-revisor` lo crea al dictaminar.
- `docs/`: negocio y contenido (`PROJECT.md`, `BRAND.md`, `CONTENT.md`, `CASES.md`, `UX_RESPONSIVE.md`), flujo (`protocolo.md`, `skills.md`, `context-strategy.md`, `stack.md`, `herramientas-locales.md`, `claude-pr-review.md`, `vikunja.md`), `contacto.md` (endpoint de contacto) y `diagrams/`. `docs/DESIGN_SYSTEM.md` es material histórico: no lo uses como fuente del sistema visual.
- `templates/`: `entrega.md`, `handoff.json`, `bug_report.md`, `PRD.md`, `sprint_actual.md`, `candidate.json`, `project_setup.md`.
- `.claude/agents/` (subagentes), `.claude/skills/` (skills), `.claude/workflows/` (workflows), `config/skills.json` (registro de roles y skills).
- `scripts/` (validador y diagnóstico), `tools/vikunja_sync.py` (cliente de Vikunja), `tests/` (tests Python del tooling y `contact.test.mjs`, que corre con `node --test`).

## Reglas no negociables

1. **Cero asunción.** Lo que sabes del proyecto viene de los archivos que leíste en esta sesión. No inventes contratos, endpoints, payloads, datos, métricas, testimonios, clientes ni IDs remotos. Lo no verificado se reporta como bloqueo o pregunta abierta, nunca como hecho.
2. **i18n sin textos hardcodeados.** Todo texto visible (incluidos `alt`, `aria-label`, `placeholder`, `title`, meta y mensajes de error o éxito) vive en `src/i18n/translations.ts` con valores para `es`, `en` y `pt`.
3. **Secretos nunca en el repo.** Local: `.env` y `.dev.vars` (ignorados por git). Producción: variables y secretos de Cloudflare configurados por un humano. No leas ni imprimas `.env*` ni `.dev.vars*` (salvo `.env.example`) y oculta valores sensibles en logs, PRs y reportes.
4. **Gates humanos.** El PRD necesita aprobación humana registrada antes de planificar. Merge a `main` es despliegue a producción: ningún agente mergea, despliega ni ejecuta `wrangler deploy` o `wrangler secret`.
5. **Cuatro escenarios por historia**: camino feliz, error o validación, caso límite, estado vacío o de carga.
6. **Máximo 3 reaperturas por tarea.** A la tercera, se escala a intervención humana y no se reasigna.
7. **Marca.** Respeta `docs/BRAND.md`: sin métricas ni testimonios inventados, sin buzzwords, sin capturas de producto falsas.
8. **Lectura progresiva.** Empieza por este archivo, el subagente y su skill, y la tarea. Luego lee solo las secciones del PRD, docs y código afectados. Amplía el contexto solo por una dependencia o riesgo concreto y dilo en la entrega. Evita lockfiles, `dist/`, `.astro/` y `.wrangler/` salvo que la tarea los involucre.

## Git y cuenta

- Commits y push solo como `arcavcwb` (la config local del repo ya lo fija). No cambies `git config`.
- Para `gh` usa `GH_TOKEN=$(gh auth token --user arcavcwb) gh ...`. No cambies la cuenta activa global de `gh`.
- Haz commit o push solo cuando el humano lo pida. Trabaja en ramas (`feat/...`, `fix/...`, `docs/...`) y abre PR hacia `main`; nunca push directo ni force push a `main`.
- Mensajes de commit convencionales: `feat(ui): ...`, `fix(api): ...`, `docs(prd): ...`.
- `.claude/settings.json` bloquea las formas habituales de deploy, merge, secretos, force push y push a `main`. Son coincidencias sobre el texto del comando, no una barrera: la protección real es la branch protection de `main` y la aprobación humana.

## Roles (subagentes)

El hilo principal coordina y delega. Cada subagente escribe solo en su alcance, hay un único escritor por archivo en trabajo paralelo y ningún subagente activa la fase siguiente por su cuenta.

| Subagente | Delega cuando la tarea es | Skills |
|---|---|---|
| `producto` | Brief, `PRD.md`, historias US-xx y sus 4 escenarios, aprobación del PRD, planificación, Vikunja y `sprint_actual.md` | `requisitos`, `planificacion` |
| `frontend` | Páginas, componentes y layouts Astro, estilos, textos i18n, responsive, accesibilidad y SEO | `entrega-frontend` |
| `integraciones` | Endpoints `src/pages/api/*`, backend del formulario de contacto, webhook de n8n, contratos TypeScript, variables y bindings de Cloudflare | `contratos-integracion` |
| `qa-revisor` | Verificar una entrega: build, tests, preview, 4 escenarios, seguridad, dictamen y `bug_report.md`; verificación en producción | `evidencia-qa`, `auditoria-seguridad` |
| `release` | Build de producción, `wrangler.jsonc`, `astro.config.mjs`, CI en `.github/`, PR y checklist de despliegue | `build-release` |

Cada entrega usa `templates/entrega.md` en la respuesta; los traspasos estructurados usan `templates/handoff.json`.

## Flujo de una historia

Detalle completo en `docs/protocolo.md`.

1. **Requisitos** (`producto`): historia en `PRD.md` con 4 escenarios. **Gate humano**: aprobación registrada en `PRD.md` con persona, fecha, alcance y commit o hash.
2. **Planificación** (`producto`): tareas en Vikunja y espejo en `sprint_actual.md`.
3. **Implementación**: `integraciones` define contratos primero si la historia los necesita; luego `frontend` y/o `integraciones` implementan.
4. **QA** (`qa-revisor`): dictamen con evidencia. Rechazo: `bug_report.md` y reapertura (máximo 3; después, escalado humano).
5. **Release** (`release`): build, checks y PR con descripción y checklist. Claude revisa el PR automáticamente.
6. **Gate humano**: merge a `main`, que despliega a producción.
7. **Verificación en producción** (`qa-revisor` y humano).

## Vikunja y sprint

- Vikunja (https://vikunja.arcav.us, proyecto id 2) es la fuente de verdad de tareas y estados.
- `sprint_actual.md` es un espejo local: solo `producto` lo actualiza, y solo después de una lectura remota confirmada.
- Toda escritura en Vikunja requiere confirmación humana explícita en la sesión.
- `tools/vikunja_sync.py` lee `VIKUNJA_URL` y `VIKUNJA_API_TOKEN` del entorno o de `.env` local (plantilla en `.env.example`). Sin conexión o sin token no se inventan IDs ni se confirman transiciones.

## Revisión

- **Local:** `/revisar-proyecto` lanza el workflow `.claude/workflows/revision-proyecto.js`, una revisión multi-dimensión con verificación adversarial.
- **Entrega completa:** `/entregar-historia US-07` lanza `.claude/workflows/entrega-historia.js`, que recorre el flujo de punta a punta y se detiene en los gates humanos.
- **Diff puntual:** delega en `qa-revisor`.
- **Pull requests:** `.github/workflows/claude-pr-review.yml` revisa los PR hacia `main` con `anthropics/claude-code-action` cuando un humano lo habilita; ver `docs/claude-pr-review.md`. Solo comenta: no es un check requerido ni sustituye el dictamen de `qa-revisor` o la aprobación humana del merge.

## Estilo

Documentación, entregas y mensajes en español neutro con tuteo, concisos y sin emojis.
