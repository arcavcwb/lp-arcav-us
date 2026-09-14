# Auditoría del flujo agéntico — hardening

Fecha del encargo: 2026-09-13 (America/Sao_Paulo). Lecturas y comprobaciones técnicas
incluyen 2026-09-14 UTC. Revisión inicial:
`81dc82d5887f97bb7a39a9dff3b91b0a7bbf91c3`.
Branch de trabajo: `chore/agent-flow-hardening`.
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
| `python3 scripts/governance_gate.py commit` | Código 0 sobre branch de hardening sin cambios de producto staged; no acredita revisión |
| `tools/vikunja_sync.py --sync` seguido de `--check` | Lectura real completa y espejo verificado; ninguna mutación remota |
| API Vikunja | v2.6.0; proyecto 2; vista Table 11 sin filtros; 9 tareas de Sprint 1; Kanban 12 observado |
| `git diff --check` | Sin errores de whitespace |
| Diff de `src`, `public`, manifests y configuración de producto | Vacío |

Casos negativos probados: main/HEAD separado, ruta de producto/desconocida,
autorización agregada solo a branch, PRD modificado y versión staged diferente,
base ausente, autorrevisión, review de otro SHA, review de bot, QA anterior al
review, QA con pendientes, páginas parciales/duplicadas, timeout, concurrencia,
filas locales alteradas conservando hash, vista filtrada, fallo de reemplazo y
redirección de credenciales. Estos casos usan fixtures; no acreditan QA del producto.

`agy --version`: 1.2.2; `agy --help` confirma comandos `agents` y `--agent`.
El primer `agy agents` falló por restricciones de log/socket del sandbox. El
reintento autorizado terminó con código 0 y salida vacía: **no acredita discovery
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

La branch no se publicó y no existe PR de este hardening. Workflow nuevo no
ejecutado en GitHub; matriz 3.10/3.11 pendiente de CI. No se hizo merge ni deploy.

| Pendiente | Evidencia necesaria antes de cerrar |
|---|---|
| Revisión independiente del hardening | PR y aprobación por identidad distinta del autor sobre SHA vigente |
| QA final del hardening | Ejecución posterior a review y reporte trazable; `qa-evidence` sin pendientes |
| Integración del flujo | Checks remotos correctos y merge; verificar instalación del workflow desde main |
| Discovery agy | Listado efectivo y evidencia de carga del índice en sesión real |
| Reconciliar aceptación de Sprint 1 | Dictámenes y criterios originales por revisión; no basta `done=true` |
| Segunda iteración de producto | PRD y arquitectura revisados por humano; aprobación del hash y activación explícita de Sprint 2 |

No se cierra este sprint ni se marca una fase de producto completada. La entrega
es implementación del hardening con validación local; revisión/QA independientes
permanecen pendientes. **Sprint 2 no iniciado.**
