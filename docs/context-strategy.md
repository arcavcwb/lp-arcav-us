# Estrategia de contexto

Esta política reduce el contexto repetido en Claude Code sin rebajar la calidad
ni los gates de `docs/protocolo.md`. Los objetivos de tokens son orientativos:
nunca justifican omitir una entrada obligatoria ni inventar lo que falta.

## Principios

1. **`CLAUDE.md` corto.** Es el índice que se carga en cada sesión: reglas no
   negociables, roles y punteros. El detalle vive en `docs/` y se abre bajo
   demanda. No se duplica aquí lo que ya está en otro documento.
2. **Subagentes con contexto aislado.** La sesión principal coordina y delega.
   Cada subagente (`.claude/agents/<slug>.md`) empieza con su definición, sus
   skills y el encargo; no hereda la conversación. Devuelve una entrega
   compacta, y esa entrega es lo único que vuelve a la sesión principal.
3. **Skills bajo demanda.** De cada skill solo está a la vista su descripción
   hasta que se usa. Un subagente precarga únicamente las skills de su
   frontmatter. Las skills de usuario (`/entregar-historia`,
   `/revisar-proyecto`) se cargan cuando el humano las invoca.
4. **Referencias en vez de copias.** Los encargos y handoffs llevan rutas,
   commits, IDs de Vikunja, resultados y bloqueos. No pegan el PRD, contratos,
   diffs extensos ni transcripciones.
5. **Calidad antes que cuota.** Seguridad, contratos, datos del formulario y
   configuración de despliegue pueden exigir más contexto. Quien amplía
   registra el motivo en su entrega.

## Lectura progresiva

Aplica estas capas en orden y detén la expansión cuando tengas evidencia
suficiente para ejecutar o para reportar un bloqueo:

1. `CLAUDE.md`, la definición del subagente y sus skills (ya cargados).
2. El encargo: historia `US-xx`, tarea de Vikunja o su fila en
   `sprint_actual.md`, commit de entrada y handoff recibido.
3. Solo las secciones relevantes de `PRD.md`, `docs/protocolo.md`,
   `docs/stack.md` y del documento de producto que aplique
   (`DESIGN.md`, `PRODUCT.md`, `docs/UX_RESPONSIVE.md`, etc.).
4. Archivos asignados y sus dependencias directas: imports, componentes
   consumidos, `src/i18n/translations.ts`, contratos y pruebas relacionadas.
5. Dependencias de segundo nivel solo ante una comprobación, conflicto o riesgo
   concreto.

Una conversación previa no es fuente operativa. Si una decisión importa, debe
estar en un archivo versionado, en la tarea de Vikunja o en la evidencia.

## Paquetes mínimos por rol

Todos parten de la capa 1. Después agregan solo esto:

| Rol | Contexto inicial de la tarea |
|---|---|
| `producto` | Brief o instrucción humana, `PRD.md` vigente, `PRODUCT.md` y los documentos de producto que la historia referencie; para planificar, la tarea en Vikunja y `sprint_actual.md`. |
| `frontend` | Historia y escenarios, `DESIGN.md`, `docs/UX_RESPONSIVE.md`, componentes y layout afectados, `src/i18n/translations.ts`, contratos consumidos. |
| `integraciones` | Historia y escenarios, contratos existentes (`src/lib/`) y `docs/contacto.md` si toca el formulario, endpoints afectados en `src/pages/api/`, `astro.config.mjs` y `wrangler.jsonc` si toca bindings o variables. |
| `qa-revisor` | Commit candidato, diff, escenarios de la historia, entregas recibidas y resultados de build/preview. |
| `release` | Commit candidato, dictamen de QA, diff de build/CI, `package.json`, `astro.config.mjs`, `wrangler.jsonc` y `.github/workflows/`. |

## Handoffs compactos

`templates/entrega.md` (en la respuesta), `templates/handoff.json` y
`templates/candidate.json` llevan identificadores, commits, rutas, estados,
comandos con resultado y pendientes. Quien recibe abre lo que necesita; no
recibe archivos enteros. Ante un cambio, comparte el diff o commit nuevo y la
parte afectada.

En los workflows (`.claude/workflows/*.js`) cada llamada a un agente recibe un
prompt autocontenido y devuelve un resultado estructurado. Entre fases viajan
esos resultados, no las transcripciones.

## Revisión por diff

- **Local.** `qa-revisor` y el workflow `revision-proyecto` parten del diff o de
  la dimensión revisada, y abren dependencias solo para confirmar
  comportamiento, contratos o permisos fuera del fragmento cambiado.
- **En PR.** La revisión de Claude en GitHub (`docs/claude-pr-review.md`) lee el
  diff del PR y el contexto que necesite del repositorio. Encuentra problemas
  visibles en el cambio; no sustituye la verificación de los escenarios que
  hace `qa-revisor`.
- Un hallazgo sin evidencia verificable se reporta como duda, no como defecto.

## Archivos que no se cargan por defecto

- `docs/diagrams/`: material humano de análisis, no fuente de verdad. Solo se
  abre si la tarea es crear, modificar o verificar diagramas.
- `node_modules/`, `dist/`, `.astro/`, `.wrangler/`, `package-lock.json`,
  source maps y archivos generados, salvo que el cambio o el incidente los haga
  relevantes.
- `.env`, `.env.*` (salvo `.env.example`) y `.dev.vars`: no se leen ni se
  imprimen.

Los assets del producto (`public/`, imágenes, fuentes) sí se consultan cuando
forman parte del alcance.

## Herramientas externas

- Consulta la tarea, historia o recurso concreto; no descargues el tablero
  completo de Vikunja por defecto.
- Guarda IDs y enlaces en el handoff en lugar de pegar el contenido recuperado.
- Antes de escribir estado remoto, relee la fuente: otro rol o el humano pudo
  modificarla.

## Objetivos orientativos

| Tipo de trabajo | Contexto de entrada inicial |
|---|---:|
| Documentación o mantenimiento simple | 4k–8k tokens |
| Requisitos y planificación | 8k–15k tokens |
| Frontend o integraciones acotadas | 10k–18k tokens |
| QA o revisión por diff | 8k–15k tokens |
| Seguridad o cambio de despliegue | 12k–20k tokens, ampliable con motivo |

Superar el objetivo no invalida el trabajo; sí obliga a evitar nuevas lecturas
masivas y a explicar qué dependencia o riesgo lo exigió. En la entrega basta
con registrar fuentes principales, commit o diff, comprobaciones, resultado y
ampliaciones relevantes.
