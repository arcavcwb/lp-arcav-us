# Auditoría del flujo agéntico — hardening

Fecha del encargo: 2026-09-13 (America/Sao_Paulo). Lecturas y comprobaciones técnicas
incluyen 2026-09-14 UTC. Revisión inicial:
`81dc82d5887f97bb7a39a9dff3b91b0a7bbf91c3`.
Branch de trabajo: `chore/agent-flow-hardening`.
PR en borrador: [#2](https://github.com/arcavcwb/lp-arcav-us/pull/2).
Commit de implementación: `09a49cc`; el historial del PR identifica revisiones posteriores de evidencia.
Alcance: documentación, configuración, controles del flujo y cliente de Vikunja.
No se modificó producto, UI, assets, dependencias ni configuración de ARCAV.

## Diagnóstico verificado

| Hallazgo | Evidencia observada | Corrección / disposición |
|---|---|---|
| PRD pendiente después de implementación | `PRD.md`: `listo_para_aprobacion`, aprobación `pendiente`; commit `81dc82d` modifica componentes, páginas, estilos e i18n; no existe `.agyflow/approvals` | Conservar aprobación pendiente; registrar anomalía, sin aprobación retroactiva |
| Espejo desincronizado | Sprint local decía todas las historias por iniciar; GET real de Vikunja confirma VK-2…VK-7 `done=true`, VK-8…VK-10 `done=false` | Regenerar desde lectura completa, sin convertir cierre remoto en aceptación |
| Nombres inválidos | Sprint y generador derivaban `frontend-agent`/`backend-agent`; directorios/frontmatter y `config/skills.json` definen `frontend-dev-agent`/`backend-dev-agent` | Mapeo explícito de etiquetas y regeneración del espejo |
| Proveedor contradictorio | Índice, protocolo, contexto, roles y handoff indicaban Plane; README y herramienta local usaban Vikunja | Unificar fuentes operativas y clave local de evidencia `vikunja` |
| Gate solo diagnóstico | `pipeline.py` detectaba falta de aprobación, pero no impedía desarrollo; `handoff.py check` para desarrolladores no comprobaba ese registro | Gate de inicio, integración en handoff CLI, hooks, CI con política de base protegida |
| main sin barrera remota | API de protección respondió HTTP 404 `Branch not protected`; rulesets devolvió `[]` | Protección activada y confirmada por API; ver estado de instalación abajo |
| Orden incompleto | Protocolo iba de implementación a QA y despliegue, sin branch/PR/review/merge obligatorios | Documentar y controlar PR → review independiente → QA → merge → DevOps |
| Cierres y checklists sin fuente | Cambio local previo en `tools/vikunja_sync.py` incluía `STORIES` con `done=True`, buckets Done y checklists `[x]`; podía sobrescribir descripciones | Retirar mutaciones automáticas, conservar estado remoto observado y exigir evidencia original para transiciones |
| Éxito de sync no verificable | Script anterior convertía fallos en listas vacías, no paginaba, imprimía éxito sin comprobar mutaciones, deduplicaba por título, usaba IDs previos y escribía el espejo sin reemplazo atómico | GET paginado, respuestas estrictas, doble lectura, ID remoto, bloqueo de escritor y reemplazo atómico; error conserva espejo |
| Reaperturas inventadas | Generación asignaba siempre 0 sin consultar historial | Proyectar `no verificado`; procedimiento manual exige historial por ejecución |
| Arquitectura / QA faltantes | No hay `architecture.md` ni `bug_report.md`; `architecture.proposed.md` está explícitamente pendiente | Bloquear futuras fases técnicas dependientes; no completar documentos de gobernanza humana ni simular QA |
| Preview automática fuera del orden de fases | Publicar `09a49cc` disparó `Workers Builds: lp-arcav-us`; check 104163345560 informa una versión y URL preview sin review/QA previos | El humano confirmó la desactivación de builds para ramas no productivas; queda documentado como incidente histórico |
| Falso negativo del PRD | Parser incluía métricas numeradas externas a US-09 entre sus escenarios | Limitar cada historia antes del siguiente encabezado de nivel 2; regresión probada |

No se afirma que la implementación satisfaga US-02…US-07: el historial prueba
existencia de código, no criterios visuales/funcionales. No se afirma que nunca
hubiera aprobación fuera del repositorio: no se encontró evidencia verificable
en las fuentes consultadas. Solo se observó un PR remoto abierto (#1, cambio de
nombre de Worker); no se modificó ese PR ni se usó como evidencia de la entrega.

## Cambios entregados

- `AGENTS.md`, PRD (solo gobernanza), protocolo, contexto, convivencia agy/Codex,
  herramientas locales, roles y skills de planificación/sincronización alineados.
- `config/governance.json`: Sprint 2 bloqueado; proyecto/vista/etiquetas y
  correlaciones de tareas verificadas. `config/main-protection.json`: protección aplicada y releída.
- `scripts/governance_gate.py`, `.githooks/` y workflow: controles de inicio,
  stage, push y PR; cambios de producto requieren política y aprobación en la base.
- `scripts/qa_gate.py`: validar revisión independiente, candidata y reporte QA
  antes de emitir el status requerido. No se emitió ningún status de éxito QA.
- `tools/vikunja_sync.py`: proyección remota → local, sin escrituras a Vikunja;
  `sprint_actual.md` conserva discrepancia entre cierre remoto y aceptación no verificada.
- Pruebas de regresión para gates, QA y sincronización. Reglas de operación en
  `docs/governance.md` y plantilla de PR.

El cambio local previo del sincronizador se respaldó antes de integrarlo:
`/tmp/arcav-vikunja-preexisting.py` y `/tmp/arcav-vikunja-preexisting.patch`.
Se conservaron lectura de entorno, conexión a Vikunja, etiquetas de roles y
observación de Kanban; la lógica que fabricaba cierres se sustituyó deliberadamente.
Los respaldos temporales no son artefactos versionados ni evidencia de aceptación.

## Validación local y remota

| Comprobación | Resultado y límite |
|---|---|
| `python3 scripts/validate_squad.py` | Correcta; estructura/configuración local, no discovery remoto ni aprobación |
| `python3 -m unittest discover tests -q` | 96 pruebas correctas en Python 3.12.3; incluye regresiones de PRD, gates, QA y sync |
| `python3 scripts/pipeline.py status` | `1_PO_GATE`: falta aprobación del contenido exacto; siguiente actor humano |
| `python3 scripts/governance_gate.py start` | Código 1; bloquea producto porque la base no tiene autorización verificable |
| `python3 scripts/governance_gate.py commit` | Código 0 ejecutado por pre-commit sobre los 36 archivos staged de hardening; no acredita revisión |
| Hook `pre-push` y gate `ci` contra `origin/main` | Correctos en publicación de branch; sin push a main |
| `tools/vikunja_sync.py --sync` seguido de `--check` | Lectura real completa y espejo verificado; ninguna mutación remota |
| API Vikunja | v2.6.0; proyecto 2; vista Table 11 sin filtros; 9 tareas de Sprint 1; Kanban 12 observado |
| `git diff --check` | Sin errores de whitespace |
| CI de PR #2 en `09a49cc` | `governance-gate` y `validate (3.10/3.11/3.12)` correctos; AI review omitido por su configuración, no cuenta como review |
| Diff de `src`, `public`, manifests y configuración de producto | Vacío |

Casos negativos probados: main/HEAD separado, ruta de producto/desconocida,
autorización agregada solo a branch, PRD modificado y versión staged diferente,
base ausente, autorrevisión, review de otro SHA, review de bot, QA anterior al
review, QA con pendientes, páginas parciales/duplicadas, timeout, concurrencia,
filas locales alteradas conservando hash, vista filtrada, fallo de reemplazo y
redirección de credenciales. Estos casos usan fixtures; no acreditan QA del producto.

`agy --version`: 1.2.2; `agy --help` confirma comandos `agents` y `--agent`.
El primer `agy agents` falló por restricciones de log/socket del sandbox. El
reintento autorizado, también con TTY, terminó con código 0 y salida vacía: **no acredita discovery
ni carga efectiva de AGENTS.md**. Se verificaron estáticamente ocho roles y su
frontmatter. Hace falta confirmar discovery/carga dentro de una sesión agy real;
no se inventó una ejecución de agentes ni se delegaron fases.

`.agents/mcp_config.example.json` es una muestra inactiva heredada que menciona
Plane, no un servidor de Vikunja instalado. No se configuró un MCP imaginario:
la integración comprobada es Python + API HTTPS con credenciales locales que no
se imprimieron ni versionaron. El generador de diagramas y ejemplos históricos
no son fuentes operativas; no se leyeron ni modificaron diagramas excluidos.

## Instalación y pendientes de cierre

Protección remota activa y confirmada por GET el 2026-09-14: PR con una
aprobación independiente, descarte de reviews obsoletos, aprobación del último
push, administradores incluidos y los cinco checks requeridos. Force push y
borrado deshabilitados. `git config --get core.hooksPath` devuelve `.githooks`.
La primera solicitud venció en revisión automática y la comprobación remota
posterior fue rechazada por límite de uso. Tras la instrucción humana de continuar,
el reintento autorizado y la relectura confirmaron instalación y sincronización.

La branch se publicó y el PR #2 está en borrador. La revisión independiente y
QA final siguen pendientes. No se hizo merge. CI remoto pasó sobre `09a49cc`:
[gate](https://github.com/arcavcwb/lp-arcav-us/actions/runs/34899924348) y
[matriz Python](https://github.com/arcavcwb/lp-arcav-us/actions/runs/34899924258).
No se confunde con aprobación de fase.

Publicar la branch activó la integración externa de Cloudflare: build
`586edaf7-e2ac-48f0-9a51-2bc8b8f5a228`, check `104163345560`, resultado success,
versión preview `c735e1eb-2445-4705-845f-5d3ef4b0ee3f`. La respuesta del check
incluye Preview URL y Preview Alias URL. Esto acredita una preview automática;
no demuestra promoción a producción. No se invocó un comando de deploy y el diff
de producto es vacío, y evidenció un disparador externo que omitía review y QA. No considerar cerrado el hardening.

El humano mostró la configuración del Worker: rama de producción `main`,
comando `npx wrangler deploy`, comando de versión `npx wrangler versions upload`
y compilaciones para ramas de no producción habilitadas. Tras indicar que debía
desmarcar esa opción y guardar, confirmó «listo» en esta sesión (2026-09-14).
Se registra como confirmación humana de desactivación, no como lectura de API.
Esta instrucción habilita publicar el informe pendiente y observar los checks
del nuevo commit. La ausencia de un check durante esa observación no constituye
una auditoría completa de los triggers externos.

La configuración de producción conserva despliegue automático de `main` según
la captura. Antes de merge debe resolverse cómo exige el handoff de DevOps y la
aprobación específica de producción; desactivar previews no resuelve ese gate.
No se modificó producción ni se aprobó un merge. No hay acceso autenticado a
Cloudflare en esta sesión. Referencias:
[build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
y [configuración](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

| Pendiente | Evidencia necesaria antes de cerrar |
|---|---|
| Publicar evidencia posterior al PR | Publicación habilitada por confirmación humana; comprobar checks del nuevo SHA |
| Revisión independiente del hardening | PR y aprobación por identidad distinta del autor sobre SHA vigente |
| QA final del hardening | Ejecución posterior a review y reporte trazable; `qa-evidence` sin pendientes |
| Integración del flujo | Checks remotos correctos y merge; verificar instalación del workflow desde main |
| Discovery agy | Listado efectivo y evidencia de carga del índice en sesión real |
| Reconciliar aceptación de Sprint 1 | Dictámenes y criterios originales por revisión; no basta `done=true` |
| Segunda iteración de producto | PRD y arquitectura revisados por humano; aprobación del hash y activación explícita de Sprint 2 |

No se cierra este sprint ni se marca una fase de producto completada. La entrega
es implementación del hardening con validación local; revisión/QA independientes
permanecen pendientes. **Sprint 2 no iniciado.**
