---
name: revisar-proyecto
description: Lanza el workflow revision-proyecto, una revisión del proyecto por dimensiones (corrección, i18n, SEO/accesibilidad/responsive, seguridad, rendimiento y coherencia) con comprobaciones reales y verificación adversarial. Devuelve un informe con el formato de bug_report.md sin modificar el repo. Solo a petición explícita del usuario.
argument-hint: "[foco o dimensiones] [rutas...]"
disable-model-invocation: true
---

# Revisar el proyecto

Lanza el workflow guardado `revision-proyecto` (`.claude/workflows/revision-proyecto.js`)
y presenta su resultado. No corrijas nada ni escribas archivos por tu cuenta.

Argumentos recibidos: `$ARGUMENTS`

## 1. Construye `args`

- Sin argumentos: lanza el workflow sin `args` (6 dimensiones sobre todo el proyecto).
- Con argumentos, sepáralos en rutas y foco:
  - Son rutas los tokens que contienen `/` o una extensión de archivo, o que
    existen en el repo (compruébalo con `ls`).
  - El resto forma el texto de `foco`.
- Pasa `args` como objeto JSON real, no como cadena, y omite las claves vacías.

El workflow interpreta el foco así: si nombra dimensiones (`correccion`, `i18n`,
`seo`, `accesibilidad`, `responsive`, `seguridad`, `rendimiento`, `coherencia` y
alias cercanos), revisa solo esas; si no, revisa todas y prioriza el foco.

| Invocación | `args` |
|---|---|
| `/revisar-proyecto` | sin `args` |
| `/revisar-proyecto seguridad` | `{"foco": "seguridad"}` |
| `/revisar-proyecto i18n src/components` | `{"foco": "i18n", "rutas": ["src/components"]}` |
| `/revisar-proyecto formulario de contacto` | `{"foco": "formulario de contacto"}` |

## 2. Lanza el workflow

Avisa en una línea del coste: una revisión completa usa 1 agente de
comprobaciones, 1 por dimensión, 2 refutadores por hallazgo (hasta 8 hallazgos
por dimensión) y 1 de síntesis. Con un foco de dimensión el coste baja.

Llama a la herramienta Workflow con `name: "revision-proyecto"` y los `args`
del paso anterior.

Qué esperar:

- Corre en segundo plano; el progreso se ve en `/workflows`.
- Fases: Comprobar (build, `validate_squad.py`, tests y captura del preview una
  sola vez), Revisar, Verificar y Sintetizar.
- No modifica archivos versionados; solo regenera artefactos ignorados del
  build (`dist/`, `.astro/`).
- Devuelve `informe_markdown`, `hallazgos_confirmados` (con ID `RP-xx`),
  `descartados`, `no_verificados`, `sin_verificar_por_limite`, `resumen` y
  `regla_verificacion`.

Regla de verificación: cada hallazgo pasa por 2 refutadores independientes
(reproducción y contexto). Media o baja se confirma si al menos 1 de 2 no lo
refuta. Alta se confirma como alta solo con 2 de 2; con 1 de 2 queda rebajada a
media como confirmación parcial; con 0 de 2 se descarta.

## 3. Presenta el resultado

1. Muestra el `informe_markdown` completo.
2. Añade un resumen corto: confirmados por severidad, descartados, sin verificar
   y dimensiones omitidas o fallidas. Lo no verificado no está cubierto: dilo.
3. Si el workflow falla o faltan partes, informa qué faltó sin rellenar con
   suposiciones.

## 4. Pregunta antes de actuar

Pregunta por cada acción y espera un sí explícito:

- **Escribir el informe en `bug_report.md`.** Conserva el historial: añade la
  nueva ejecución marcada como vigente sin borrar las anteriores. El repositorio
  es público: con hallazgos de seguridad, propone omitir o generalizar los
  detalles explotables antes de versionarlos.
- **Registrar tareas en Vikunja** (proyecto 2, fuente de verdad) y en el espejo
  `sprint_actual.md`: lo hace el subagente `producto` con su skill `planificacion`.
- **Corregir hallazgos:** delega en el rol dueño (`frontend`, `integraciones` o
  `release`); para una historia completa, `/entregar-historia US-xx`.
- **Commit, push o PR:** solo como `arcavcwb` (configuración local del repo, que
  no se cambia) y con `GH_TOKEN=$(gh auth token --user arcavcwb)` para `gh`, sin
  cambiar la cuenta activa de gh.

Gates humanos: la aprobación del PRD se registra en `PRD.md` por una persona, y
mergear a `main` despliega a producción (Cloudflare Workers Builds). Nunca hagas
merge ni `wrangler deploy`.
