# ARCAV Landing Page (lp-arcav-us)

Sitio web landing page y portafolio multilenguaje (ES / EN / PT) para ARCAV, desarrollado con **Astro** y desplegado en **Cloudflare Workers**.

---

## 🤖 Flujo Agéntico con Claude Code

El desarrollo se coordina con **Claude Code**: una sesión principal delega en cinco subagentes por rol, con dos gates humanos (aprobación del PRD y merge a `main`, que despliega a producción).

* **Índice del flujo:** [`CLAUDE.md`](CLAUDE.md)
* **Protocolo (7 pasos, handoffs, QA y gates):** [`docs/protocolo.md`](docs/protocolo.md)
* **Estrategia de contexto:** [`docs/context-strategy.md`](docs/context-strategy.md)
* **Stack:** [`docs/stack.md`](docs/stack.md)
* **Producto:** [`PRODUCT.md`](PRODUCT.md) · **Sistema visual:** [`DESIGN.md`](DESIGN.md)
* **Requerimientos:** [`PRD.md`](PRD.md)
* **Tareas:** [Vikunja, proyecto 2](https://vikunja.arcav.us/projects/2) (fuente de verdad) y su espejo local [`sprint_actual.md`](sprint_actual.md). Ver [`docs/vikunja.md`](docs/vikunja.md).
* **Revisión de PR con Claude:** [`docs/claude-pr-review.md`](docs/claude-pr-review.md)

### Roles

| Subagente | Dominio |
|---|---|
| `producto` | PO y Scrum: `PRD.md` con historias de 4 escenarios, aprobación humana, planificación en Vikunja y `sprint_actual.md` |
| `frontend` | Páginas, componentes y layouts Astro, Vanilla CSS con tokens, i18n, responsive, accesibilidad y SEO |
| `integraciones` | Endpoints `src/pages/api/*`, formulario de contacto, webhook n8n y contratos TypeScript |
| `qa-revisor` | Verificación con evidencia, auditoría de seguridad, dictamen y `bug_report.md` |
| `release` | Build de producción, configuración de Cloudflare, CI y preparación del PR (nunca despliega ni mergea) |

### Flujo

1. Requisitos (`producto`) → **gate humano: aprobación del PRD**
2. Planificación (`producto`) en Vikunja + espejo
3. Implementación (`integraciones` define contratos; `frontend` / `integraciones` implementan)
4. QA (`qa-revisor`); rechazo → `bug_report.md` y reapertura (máx. 3, luego escalado humano)
5. Release (`release`): build, checks y PR con revisión de Claude
6. **Gate humano: merge a `main`** = despliegue con Cloudflare Workers Builds
7. Verificación en producción (`qa-revisor` + humano)

### Uso en Claude Code

| Comando | Qué hace |
|---|---|
| `/entregar-historia US-07` | Lanza el workflow `entrega-historia`: lleva una historia de punta a punta y se detiene en los gates humanos |
| `/revisar-proyecto` | Lanza el workflow `revision-proyecto`: revisión multi-dimensión con verificación adversarial de hallazgos |
| "Usa el subagente `frontend` para ..." | Delega una tarea puntual en un rol |

---

## 🚀 Estructura del Proyecto

```text
/
├── .claude/
│   ├── agents/           # Subagentes por rol (producto, frontend, integraciones, qa-revisor, release)
│   ├── skills/           # Skills de rol y skills de usuario (/entregar-historia, /revisar-proyecto)
│   └── workflows/        # Workflows guardados (entrega-historia, revision-proyecto)
├── .github/workflows/    # Validación del flujo y revisión de PR con Claude
├── config/skills.json    # Asignación de skills por rol, skills de usuario y workflows
├── docs/                 # Protocolo, contexto, stack, marca, contenido y contacto
├── public/               # Assets estáticos (incluye fonts/ autoalojadas)
├── scripts/              # Validador y comprobadores locales del flujo
├── src/                  # Componentes, i18n, layouts, lib y páginas Astro
│   ├── lib/              # Contratos y lógica de servidor (contact.ts, contact-server.ts)
│   └── pages/
│       ├── index.astro   # Detección y redirección de idioma
│       ├── es/, en/, pt/ # Páginas por idioma
│       └── api/          # Endpoints server (contact.ts)
├── templates/            # PRD, entrega, handoff, bug report y sprint
├── tests/                # Pruebas del tooling Python (unittest) y del contrato de contacto (node --test)
├── tools/vikunja_sync.py # Sincronización con Vikunja
├── CLAUDE.md             # Índice del flujo para Claude Code
├── DESIGN.md             # Sistema visual vigente
├── PRODUCT.md            # Producto, público y posicionamiento
├── PRD.md                # Requerimientos vigentes
├── sprint_actual.md      # Espejo local del sprint
├── astro.config.mjs
├── wrangler.jsonc
└── package.json
```

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local |
| `npm run build` | Genera la build de producción en `./dist/` |
| `npm run preview` | Previsualiza la build localmente |
| `npm run generate-types` | Genera los tipos de bindings de Cloudflare (`wrangler types`) |
| `python3 scripts/validate_squad.py` | Valida roles, skills, workflows y documentación del flujo |
| `python3 -m unittest discover tests -v` | Ejecuta las pruebas del tooling Python |
| `node --test tests/contact.test.mjs` | Ejecuta las pruebas del contrato del formulario de contacto |
| `python3 scripts/pipeline.py check-prd` | Comprueba la estructura de 4 escenarios del PRD |

Más comandos (handoff, Vikunja) en [`docs/herramientas-locales.md`](docs/herramientas-locales.md). Requiere Node.js `>=22.12.0` y Python `>=3.10`.
