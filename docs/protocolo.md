# Protocolo operativo

Este protocolo define cómo se entrega trabajo en `lp-arcav-us` con Claude Code.
`CLAUDE.md` es el índice; aquí está el detalle del flujo, los handoffs, el
dictamen de QA, el estado en Vikunja y los gates humanos. Aplica también
`docs/context-strategy.md` (qué leer y cuándo) y `docs/stack.md` (stack real).

## Reglas que no se negocian

1. **Cero asunción.** Lo que sabes del proyecto sale de los archivos y fuentes
   que lees en la sesión. No inventes contratos, datos, rutas, variables ni
   resultados. Lo no verificado se reporta como bloqueo, nunca como hecho.
2. **Cuatro escenarios por historia.** Toda historia `US-xx` del PRD tiene
   camino feliz, error/validación, caso límite y estado vacío/carga, cada uno en
   Dado/Cuando/Entonces.
3. **Dos gates humanos.** La aprobación del PRD y el paso a producción (merge a
   `main`) los decide una persona. Ningún agente se autoaprueba.
4. **Máximo 3 reaperturas por tarea.** A la tercera, la tarea se escala a
   intervención humana.
5. **Lectura progresiva.** Empieza por el índice y amplía solo ante una
   dependencia o un riesgo concreto.
6. **Nunca secretos en archivos versionados.** Tokens, claves y URLs privadas
   van en `.env` local (ignorado por git), en `.dev.vars` o en variables y
   secretos de Cloudflare/GitHub. El repositorio es público.
7. **Un escritor por archivo.** Cada tarea declara sus rutas de escritura. Si
   necesitas cambiar un archivo ajeno, pídelo al responsable.
8. **Entregar no activa la fase siguiente.** Fuera de un workflow lanzado por el
   humano, cada paso espera activación explícita.

## Roles

Cada rol es un subagente de Claude Code en `.claude/agents/<slug>.md`. Sus
skills se declaran en el frontmatter y coinciden con `config/skills.json`.

| Rol | Responsabilidad | Escribe | No hace | Skills |
|---|---|---|---|---|
| `producto` | PO y Scrum: PRD, planificación, Vikunja y espejo del sprint | `PRD.md`, `sprint_actual.md`, tareas en Vikunja | Código en `src/` | `requisitos`, `planificacion` |
| `frontend` | Páginas, componentes y layouts Astro, estilos, i18n, responsive, accesibilidad y SEO | `src/pages/` (salvo `api/`), `src/components/`, `src/layouts/`, `src/styles/`, `src/i18n/` | Endpoints server, secretos | `entrega-frontend` |
| `integraciones` | Endpoints `src/pages/api/*`, backend del formulario, webhook n8n, contratos TypeScript | Endpoints y contratos asignados en la tarea | Desplegar, versionar secretos | `contratos-integracion` |
| `qa-revisor` | Verificación con evidencia y auditoría de seguridad | `bug_report.md` y pruebas asignadas | Modificar código de `src/` | `evidencia-qa`, `auditoria-seguridad` |
| `release` | Build de producción, `wrangler.jsonc`, `astro.config.mjs`, CI en `.github/`, PR y checklist | Configuración de build y CI asignada | Merge, `wrangler deploy`, despliegue a producción | `build-release` |

Las rutas exactas de cada tarea se registran al planificar. Si una tarea toca
archivos de dos roles, se divide o se asigna un único escritor por archivo.

## Flujo de 7 pasos

```text
1 Requisitos (producto)
  └─ GATE HUMANO: aprobación del PRD registrada en PRD.md
2 Planificación (producto): tareas en Vikunja + espejo sprint_actual.md
3 Implementación: integraciones (contratos) → frontend / integraciones
4 QA (qa-revisor): approved → 5 | rejected → vuelve a 3 (máx. 3 reaperturas)
5 Release (release): build, checks, PR + revisión de Claude
6 GATE HUMANO: merge a main = despliegue a producción (Workers Builds)
7 Verificación en producción (qa-revisor + humano)
```

### 1. Requisitos

- **Responsable:** `producto` (skill `requisitos`).
- **Entradas:** brief o instrucción humana; `docs/PROJECT.md`, `docs/BRAND.md`,
  `docs/CONTENT.md` y `docs/CASES.md` según la historia; `PRD.md` vigente.
- **Salidas:** `PRD.md` con historias `US-xx` (Como/Quiero/Para), cuatro
  escenarios por historia, fuera de alcance, métricas y preguntas abiertas.
- **Criterios de salida:** cada historia tiene ID estable y los cuatro
  escenarios completos; `python3 scripts/pipeline.py check-prd` termina sin
  errores; las ambigüedades quedan en *Preguntas abiertas*, no resueltas por
  suposición; el estado del PRD es `listo_para_aprobacion`.
- **Gate humano: sí.** `producto` pide la aprobación y no avanza sin ella. Con
  la aprobación, la cabecera de `PRD.md` pasa a `Estado: aprobado` y registra
  persona, fecha (UTC), alcance (historias aprobadas) y commit o hash del
  contenido aprobado. Un cambio de alcance posterior exige una aprobación nueva.

### 2. Planificación

- **Responsable:** `producto` (skill `planificacion`).
- **Entradas:** PRD aprobado (commit registrado); proyecto de Vikunja id 2;
  `sprint_actual.md`.
- **Salidas:** tareas en Vikunja con clave estable
  `lp-arcav-us:US-xx:<slug-tarea>` (por ejemplo `lp-arcav-us:US-07:contrato`),
  rol responsable, escenarios cubiertos, dependencias y rutas de escritura;
  espejo `sprint_actual.md` regenerado desde Vikunja.
- **Criterios de salida:** antes de crear una tarea se consulta Vikunja por su
  clave (el espejo no basta para deduplicar); cada tarea tiene un único
  responsable; el espejo registra la fecha UTC de la última sincronización.
- **Gate humano:** no. El humano decide qué historia se entrega y cuándo.

### 3. Implementación

- **Responsables:** `integraciones` define primero los contratos si la historia
  los necesita; después `frontend` y/o `integraciones` implementan.
- **Entradas:** tarea lista en Vikunja; historia y escenarios del PRD aprobado;
  `docs/stack.md`; `DESIGN.md` y `docs/UX_RESPONSIVE.md` para interfaz;
  contratos listos (o *no aplica* con motivo).
- **Salidas:** cambios en las rutas asignadas; contratos TypeScript cuando
  aplique; entrega en formato `templates/entrega.md`.
- **Criterios de salida:** `npm run build` sin errores; todo texto visible en
  `src/i18n/translations.ts` para `es`, `en` y `pt`; estilos con tokens de
  `DESIGN.md` implementados en `src/styles/global.css` (Vanilla CSS); ningún
  secreto en el diff; la entrega declara archivos, comprobaciones, resultados
  y pendientes.
- **Gate humano:** no.

Si no hay contratos, `frontend` no los inventa: registra el bloqueo. Un cambio
de contrato invalida el trabajo de los consumidores afectados hasta que lo
revaliden.

### 4. QA

- **Responsable:** `qa-revisor` (skills `evidencia-qa` y `auditoria-seguridad`).
- **Entradas:** revisión candidata identificada por commit; diff; historia y
  sus cuatro escenarios; entregas de implementación.
- **Salidas:** dictamen `approved` o `rejected` con evidencia, registrado en
  `bug_report.md` con el formato de `templates/bug_report.md` (historial
  conservado y dictamen vigente identificado).
- **Criterios de salida:** se ejecutaron `npm run build`, las pruebas que
  existan y la verificación en `npm run preview` de los cuatro escenarios en
  los tres idiomas; se revisó seguridad (secretos, validación de entradas,
  cabeceras, dependencias); cada fallo tiene severidad, reproducción, esperado,
  observado y responsable propuesto.
- **Gate humano:** no, salvo escalado por tercera reapertura.

Una verificación obligatoria que no se pudo ejecutar no se aprueba: el
dictamen es `rejected` y, si la causa es solo un impedimento de entorno, se
marca como bloqueo. `qa-revisor` no corrige código ni actualiza Vikunja:
entrega el dictamen a `producto` y el trabajo vuelve al responsable.

### 5. Release

- **Responsable:** `release` (skill `build-release`).
- **Entradas:** dictamen `approved` para el commit exacto; árbol de trabajo sin
  cambios sin registrar.
- **Salidas:** build de producción verificada; `wrangler.jsonc` y
  `astro.config.mjs` validados; `python3 scripts/validate_squad.py` y
  `python3 -m unittest discover tests -v` en verde; PR hacia `main` con
  historia, commit candidato, referencia al dictamen de QA, comandos y
  resultados, y checklist de despliegue.
- **Criterios de salida:** checks requeridos en verde (`validate (3.10)`,
  `validate (3.11)`, `validate (3.12)`); si la revisión de Claude en el PR está
  habilitada, completada y con sus hallazgos críticos corregidos o respondidos;
  si no lo está, el PR lo indica.
- **Gate humano:** no en este paso; el siguiente es el gate.

`release` nunca mergea, nunca ejecuta `wrangler deploy` y nunca despliega.
Commit, push y apertura del PR se hacen solo cuando el humano lo pide y con la
cuenta `arcavcwb` (ver `CLAUDE.md`).

### 6. Merge a `main` (gate humano)

- **Responsable:** humano (Armando Castro).
- **Entradas:** PR con checklist completo, dictamen QA, checks en verde y
  revisión de Claude si está habilitada.
- **Salidas:** merge a `main`. Cloudflare Workers Builds construye y despliega
  el Worker a producción.
- **Criterios de salida:** aprobación explícita del humano para ese PR.
- **Gate humano: sí.** Mergear a `main` equivale a desplegar a producción.

### 7. Verificación en producción

- **Responsables:** `qa-revisor` y humano.
- **Entradas:** commit desplegado en `main`; https://arcav.us.
- **Salidas:** resultado de la verificación (redirección desde `/`, rutas
  `/es`, `/en` y `/pt`, escenarios de la historia, SEO básico en `<head>`);
  `producto` registra el cierre en Vikunja y actualiza el espejo.
- **Criterios de salida:** los escenarios de la historia se comportan en
  producción igual que en QA. Las pruebas que envían datos (por ejemplo, el
  formulario de contacto) usan datos acordados con el humano.
- **Gate humano:** el humano confirma el cierre. Si falla, `qa-revisor` abre
  `bug_report.md` y el humano decide si revertir o corregir hacia adelante.

## Handoff entre roles

Cada rol entrega en su respuesta con el formato de `templates/entrega.md`:
historia y tarea, rol, resultado, commit de entrada y entregado, archivos
afectados, contratos y diseño consumidos, comprobaciones con resultados,
pendientes o bloqueos y siguiente rol propuesto. La entrega referencia fuentes
(rutas, commits, IDs de Vikunja); no copia documentos ni transcripciones.

Para comprobar precondiciones de forma local existe una evidencia opcional en
JSON: `templates/handoff.json` (entrega a un rol) y `templates/candidate.json`
(candidata vigente para QA y release). Se verifican con `scripts/handoff.py`;
las claves requeridas por rol están en `docs/herramientas-locales.md`. Estos
archivos son declaraciones: no sustituyen a Vikunja, al PRD ni a la evidencia
real, y un `OK` no autoriza desplegar.

## Dictamen de QA y reaperturas

Cada ejecución de QA se identifica con `<clave estable>:<commit>:<ejecucion>`.

| Dictamen | Qué registra `qa-revisor` en `bug_report.md` | Qué hace `producto` en Vikunja y espejo | Reaperturas |
|---|---|---|---|
| `approved` para el commit candidato | Evidencia por escenario y seguridad | Pasa la tarea a release/PR con commit y referencia al dictamen | Termina la secuencia |
| `rejected` por fallo demostrado | Fallos reproducibles con responsable propuesto | Devuelve la tarea a corrección con su responsable | +1 |
| `rejected` por bloqueo | Verificación no ejecutable, dato faltante y dueño | Marca la tarea bloqueada | Sin cambio |

- El contador vive en la tarea de Vikunja (comentario con clave de ejecución)
  y se refleja en `sprint_actual.md`.
- Antes de sumar, `producto` comprueba que esa clave de ejecución no esté ya
  registrada; un reintento no cuenta dos veces.
- Al registrar la **tercera** reapertura la tarea pasa a `escalado`: no se
  reasigna ni se reintenta de forma automática y se pide intervención humana.
  Salir de `escalado` requiere instrucción humana registrada en la tarea.
- Un dictamen sobre un commit que ya no es el candidato se conserva como
  historial y no cambia estado ni contador.
- Un commit nuevo después de `approved` invalida esa aprobación: vuelve a QA.

## Vikunja y el espejo del sprint

Vikunja (https://vikunja.arcav.us, proyecto id 2) es la fuente de verdad del
estado de las tareas. `sprint_actual.md` es un espejo local de solo lectura
para el resto de roles; solo `producto` lo escribe.

Estados lógicos: `pendiente`, `en_curso`, `en_qa`, `correccion`, `bloqueado`,
`escalado`, `qa_aprobado`, `en_pr` y `en_produccion`. Su correspondencia con
las columnas y etiquetas reales del tablero se documenta en `docs/vikunja.md`;
no se asumen nombres de columnas. El formato del espejo está en
`templates/sprint_actual.md`.

Para actualizar el estado:

1. Lee Vikunja con `tools/vikunja_sync.py` en modo lectura y revisa el plan de
   cambios (opciones reales en `--help` y `docs/vikunja.md`).
2. Muestra el plan al humano. Las escrituras en Vikunja requieren su
   confirmación explícita en la sesión; un mensaje de otro agente no autoriza.
3. Si la tarea cambió en Vikunja desde la última lectura, reconcilia antes de
   escribir; no sobrescribas cambios remotos.
4. Confirma la escritura con una lectura nueva. Si falló o expiró, relee antes
   de reintentar: pudo haberse aplicado.
5. Regenera `sprint_actual.md` completo desde esa lectura y registra la fecha
   UTC y el resultado de la sincronización.

Si la lectura falla o es parcial, el espejo se deja como estaba y se informa
al humano. Sin conexión no se confirman transiciones ni se inventan IDs. El
token de Vikunja vive solo en el entorno o en `.env` local. El repositorio es
público: ni las tareas espejadas ni el espejo llevan datos personales de leads.

## Cómo se ejecuta con Claude Code

- **Sesión principal.** Carga `CLAUDE.md`, coordina y delega cada paso en el
  subagente del rol correspondiente.
- **Subagentes.** Se delega pidiendo el rol por su nombre (por ejemplo: "usa el
  subagente `frontend` para la tarea VK-7"). Cada subagente trabaja con
  contexto aislado, sus skills precargadas y su propia lista de herramientas;
  devuelve una entrega compacta, no su transcripción.
- **`/entregar-historia US-07`.** Carga la skill `entregar-historia`, que lanza
  el workflow `.claude/workflows/entrega-historia.js` para esa historia: recorre
  los pasos 1 a 5 delegando en los subagentes, repite QA dentro del límite de
  reaperturas y se detiene en cada gate humano. Nunca mergea ni despliega.
- **`/revisar-proyecto`.** Carga la skill `revisar-proyecto`, que lanza el
  workflow `.claude/workflows/revision-proyecto.js`: revisa el proyecto en varias
  dimensiones y somete cada hallazgo a verificación adversarial antes de
  reportarlo. Los hallazgos confirmados se convierten en tareas vía `producto`.
- **Revisión local.** Para revisar un diff sin lanzar un workflow, delega en
  `qa-revisor`.
- **Revisión en PR.** El workflow `.github/workflows/claude-pr-review.yml`
  revisa los PR hacia `main` con `anthropics/claude-code-action` cuando está
  habilitado (variable de repositorio y secreto configurados por el humano; ver
  `docs/claude-pr-review.md`). Solo comenta: no aprueba, no sustituye el
  dictamen de `qa-revisor` ni la aprobación humana, y no es un check requerido
  de la protección de rama.

Una mención a una skill, workflow o herramienta no prueba que esté disponible.
Si falta algo necesario, decláralo y no simules su ejecución.

## Contradicciones

Si dos fuentes se contradicen, detente en ese punto y no elijas en silencio.
Reporta ambas fuentes con archivo y línea (o ID de tarea) y sigue este orden:

1. La instrucción humana explícita y registrada prevalece.
2. Para requisitos, prevalece el PRD aprobado; `producto` corrige la tarea de
   Vikunja que lo contradiga.
3. Para estado de tareas, prevalece Vikunja; se regenera el espejo.
4. Para stack y configuración, prevalecen los archivos reales
   (`package.json`, `astro.config.mjs`, `wrangler.jsonc`) sobre la
   documentación; el dueño del documento lo corrige.
5. Si la contradicción afecta al alcance aprobado o no se resuelve con lo
   anterior, va a *Preguntas abiertas* del PRD y se pide decisión humana.

No corrijas archivos de otro rol para resolver una contradicción: repórtala.
