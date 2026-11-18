# Skills del proyecto

Las skills son procedimientos de Claude Code versionados en
`.claude/skills/<slug>/SKILL.md`. Hay dos tipos:

- **Skills de rol**: el procedimiento concreto de cada subagente (checklists,
  comandos y formato de salida). Se precargan en el subagente que las declara.
- **Skills de usuario**: atajos que escribe una persona (`/revisar-proyecto`,
  `/entregar-historia US-07`) y que lanzan un workflow guardado.

El flujo y los gates están en `docs/protocolo.md`; los límites de cada rol, en
`.claude/agents/<slug>.md`. Las skills no amplían permisos: detallan cómo
trabaja el rol dentro de lo que ya puede hacer.

## Rol y skills

| Rol (subagente) | Skill | Qué cubre |
|---|---|---|
| `producto` | `requisitos` | Historias `US-xx` de `PRD.md` con los 4 escenarios (camino feliz, error/validación, caso límite, estado vacío/carga), `check-prd` y registro de la aprobación humana |
| `producto` | `planificacion` | Tareas con rol, dependencias y clave estable; uso de `tools/vikunja_sync.py` (simulación por defecto, `--apply` con confirmación humana); regeneración de `sprint_actual.md`; dictámenes de QA, reaperturas (máx. 3) y escalado |
| `frontend` | `entrega-frontend` | Páginas, componentes y layouts Astro 6; Vanilla CSS con tokens de `src/styles/global.css`; i18n `es`/`en`/`pt` en `src/i18n/translations.ts`; responsive, accesibilidad, SEO y decisiones visuales |
| `integraciones` | `contratos-integracion` | Contrato TypeScript primero; endpoints `src/pages/api/*`; backend del formulario; webhook n8n; secretos solo vía entorno o bindings de Cloudflare |
| `qa-revisor` | `evidencia-qa` | Build, tests y preview; los 4 escenarios en los tres idiomas; dictamen `approved`, `rejected` o bloqueado en `bug_report.md`; verificación en producción |
| `qa-revisor` | `auditoria-seguridad` | Repo público y secretos, secretos en CI, código de PR ejecutado con secretos, formulario y endpoints (validación, honeypot, rate limit), cabeceras y dependencias |
| `release` | `build-release` | Build de producción, `wrangler.jsonc` y configuración generada, `astro.config.mjs`, CI con los checks `validate`, PR con plantilla y checklist de despliegue; nunca despliega ni mergea |

`build-release` incluye `plantilla-pr.md` como archivo de apoyo; el rol lo lee
cuando prepara la descripción del PR.

## Skills de usuario

| Comando | Skill | Qué hace |
|---|---|---|
| `/revisar-proyecto [foco] [rutas]` | `revisar-proyecto` | Lanza `.claude/workflows/revision-proyecto.js`: revisión por dimensiones con verificación adversarial de cada hallazgo; informe con el formato de `bug_report.md`, sin modificar el repo |
| `/entregar-historia US-xx` | `entregar-historia` | Lanza `.claude/workflows/entrega-historia.js`: lleva una historia aprobada por requisitos, implementación, QA (máx. 3 reaperturas) y preparación del release; se detiene en los gates humanos y nunca hace merge ni despliega |

## Cómo se cargan en Claude Code

| Tipo | Frontmatter | Efecto |
|---|---|---|
| Skill de rol | `name`, `description`, `user-invocable: false` | No aparece en el menú `/`. Su contenido completo se inyecta al arrancar el subagente que la lista en `skills:`. La sesión principal ve su descripción y puede cargarla si hace falta |
| Skill de usuario | `name`, `description`, `argument-hint`, `disable-model-invocation: true` | Solo la invoca una persona con `/<slug>`. Su descripción no ocupa contexto y Claude no la lanza por su cuenta |

Detalles que conviene saber:

- **Precarga en subagentes.** El campo `skills:` del frontmatter de
  `.claude/agents/<slug>.md` inyecta el contenido de cada skill al iniciar el
  subagente. Por eso las skills de rol **no** usan
  `disable-model-invocation: true`: ese campo impide precargarlas.
- **Sin carga dinámica en roles.** Los subagentes no incluyen la herramienta
  `Skill` en `tools`, así que trabajan solo con sus skills precargadas. Skills
  personales instaladas en la máquina de alguien no forman parte del flujo.
- **Archivos de apoyo.** Lo que no está en `SKILL.md` (por ejemplo
  `plantilla-pr.md`) no se precarga: el rol lo lee con su ruta cuando lo necesita.
- **Cambios en caliente.** Claude Code detecta cambios en `SKILL.md` dentro de
  la sesión. Un subagente ya iniciado conserva la versión que precargó.
- **Comprobación.** `/skills` lista las skills disponibles y `/agents` los
  subagentes con su configuración. El menú `/` solo muestra las de usuario.

## Registro y validación

`config/skills.json` es el registro que consume `scripts/validate_squad.py`
(checks `validate (3.10)`, `validate (3.11)` y `validate (3.12)` en CI):

```json
{
  "version": 2,
  "roles": {
    "<rol>": {"agent": ".claude/agents/<rol>.md", "skills": ["<skill>", "..."]}
  },
  "user_skills": ["revisar-proyecto", "entregar-historia"],
  "workflows": [".claude/workflows/revision-proyecto.js", ".claude/workflows/entrega-historia.js"]
}
```

Reglas:

- El frontmatter `skills:` de cada subagente coincide exactamente con su lista
  en `config/skills.json`.
- El directorio de la skill, su `name` y la entrada del registro usan el mismo
  slug (minúsculas y guiones).
- `description` dice qué hace y cuándo usarla, en una línea y sin la secuencia
  `: ` (el validador lee un frontmatter plano). Claude Code trunca en el
  listado lo que pase de 1.536 caracteres.
- `SKILL.md` por debajo de 500 líneas; el material largo va a archivos de apoyo.

## Añadir o cambiar una skill

1. Crea o edita `.claude/skills/<slug>/SKILL.md` con el frontmatter del tipo que
   corresponda y, si aporta, archivos de apoyo en el mismo directorio.
2. Estructura recomendada: rol dueño y límites, contexto mínimo (lectura
   progresiva), procedimiento, comprobaciones con comandos reales, checklist y
   formato de salida.
3. Para una skill de rol, añádela a `skills:` del subagente y a
   `config/skills.json`. Para una de usuario, a `user_skills` (y su workflow a
   `workflows` si lanza uno).
4. Aplica las reglas del proyecto: cero asunción, 4 escenarios, gates humanos
   de PRD y producción, máximo 3 reaperturas, nunca secretos en archivos
   versionados. Español neutro con tuteo.
5. Ejecuta `python3 scripts/validate_squad.py` y
   `python3 -m unittest discover tests -v`.
