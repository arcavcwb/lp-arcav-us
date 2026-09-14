# Gobernanza ejecutable de ARCAV

El encargo humano del 2026-09-13 autoriza corregir el flujo, sin modificar UI ni
funcionalidad. Sprint 2 está bloqueado en `config/governance.json`. La existencia
de código o un ticket cerrado no aprueba el PRD ni acredita aceptación.

## Orden obligatorio

Humano → PO → aprobación humana del PRD → Scrum → Diseño / Arquitectura humana /
Contratos cuando corresponda → desarrollo en branch → PR → revisión independiente
→ QA → merge → DevOps / deploy. Cada entrega requiere activación explícita de la
siguiente fase. Producción requiere autorización específica de artefacto/destino.

Arquitectura la aporta el humano; ningún agente modifica `architecture.md`.
Una dependencia no aplicable debe justificarse; no se salta una fase sin esa evidencia.

## Orquestación de agentes

`config/agent-runtime.json` declara el executor `agy`, los roles del squad y
`DrBrief84`, usando únicamente modelos Codex. La asignación base es Terra para
PO/Scrum, Luna para Diseño, Sol para Frontend/QA/DevOps y Astra para Backend,
Automation y revisión independiente. Cada entrada también admite sobrescritura
explícita mediante `AGY_MODEL_*` y `AGY_SESSION_*`; no se versionan secretos.
`scripts/agent_orchestrator.py` es el punto único de activación:

```bash
AGY_SESSION_PO_AGENT="po-1" \
python3 scripts/agent_orchestrator.py po-agent --ticket TICKET --routes PRD.md
```

Sin `--execute` solo genera el handoff y muestra la orden. Con `--execute` lanza
`agy --agent <rol> --model <modelo> --prompt <handoff>`. Verifica branch y gates
antes de activar roles técnicos. Para `DrBrief84` genera un prompt de revisión;
su sesión necesita credenciales propias de GitHub para emitir una review. Si
`agy` o una credencial no están disponibles, devuelve `BLOCKED`. El modelo Codex
base ya queda definido en la configuración y solo debe cambiarse con una decisión
explícita de mantenimiento.

## Gate antes de implementar

1. Leer índice, rol, skill, encargo y entradas del ticket. Comprobar branch y
   aprobación del PRD exacto, arquitectura, asignación y dependencias listas.
2. Ejecutar `python3 scripts/governance_gate.py start` antes de editar producto.
   Un código distinto de cero bloquea desarrollo. `pipeline.py status` es solo diagnóstico.
3. El gate exige en la **base protegida** la activación humana de la iteración,
   el registro de aprobación del SHA-256 exacto del PRD y `architecture.md`.
   Este archivo se admite en el PR documental de entrada para que el humano
   pueda aportarlo; eso no concede permiso a los agentes para redactarlo.
   Una branch de desarrollo no puede aprobarse agregando su propio JSON.
4. Registrar la aprobación con `pipeline.py approve-prd` únicamente tras recibir
   la instrucción humana identificable (persona, alcance, fecha, referencia).
   Ese comando no autentica identidad. La aprobación y activación deben pasar
   por un PR documental separado y revisado por el humano antes de desarrollo.
   El cambio de `product_status` a `approved` y `activation_evidence` también
   requiere esa instrucción. **No se han creado esas aprobaciones en este sprint.**
5. Cambiar el PRD invalida su hash aprobado. La aprobación del PRD no concede
   aprobación de QA, merge, despliegue ni activación de otra iteración.

El gate mantiene una lista explícita de archivos de mantenimiento. Rutas nuevas,
producto, assets, dependencias y configuración de ARCAV requieren aprobación.
El encargo actual solo permite mantenimiento del flujo. Los cambios de gobierno
se revisan independientemente para impedir ampliar esa excepción por iniciativa propia.

## Branch, PR, revisión y QA

Instalar en cada checkout: `git config core.hooksPath .githooks`.
`pre-commit` bloquea main/master, HEAD separado y cambios de producto sin gate;
lee el PRD del índice, no una copia distinta sin stage. `pre-push` también bloquea
cualquier destino main/master y verifica los cambios de la revisión a publicar.
Trabajar en `chore/…`, `feat/…` o `fix/…` con alcance asignado. No usar `--no-verify`
ni alterar hooks para saltar controles. No hacer push directo ni force push a main.

El workflow `governance-gate` comprueba el diff contra la política de la base
protegida. Tras su instalación ejecuta el comprobador de la base, no el modificado
por el PR. Su primer PR de instalación requiere revisión independiente del bootstrap.
`config/main-protection.json` describe la protección remota: PR obligatorio,
una aprobación independiente, descarte de reviews obsoletos, aprobación del último
push, conversaciones resueltas, checks estrictos, sin force push ni borrado,
aplicada también a administradores.

Checks obligatorios: `governance-gate`, `validate (3.10)`, `validate (3.11)`,
`validate (3.12)` y `qa-evidence`. El AI PR Reviewer es una ayuda opcional; su
comentario no sustituye una aprobación independiente ni QA.

El revisor no puede ser el autor del cambio. Puede ser una persona o un agente
revisor como `DrBrief84`, siempre que opere en una sesión independiente, con
identidad y alcance registrados y permiso Write. No usar dos sesiones bajo la
misma identidad para simular independencia. Si no hay revisor independiente,
el PR espera.

QA actúa después de esa revisión y sobre el SHA vigente. El operador asignado
prepara evidencia con este contrato local (no es un esquema de Vikunja):

```json
{
  "pr": 0,
  "revision": "SHA_REAL_DEL_PR",
  "qa_run": "IDENTIFICADOR_DE_EJECUCION",
  "operator": "PERSONA_O_SESION_QA_ASIGNADA",
  "completed_at": "FECHA_ISO8601_CON_ZONA",
  "result": "approved",
  "evidence_url": "https://URL_REAL_DEL_REPORTE",
  "pending_checks": [],
  "blockers": [],
  "checks": [
    {
      "criterion": "CRITERIO_REAL",
      "command_or_steps": "EJECUCION_REAL",
      "result": "passed",
      "evidence": "REFERENCIA_AL_RESULTADO_REAL"
    }
  ]
}
```

Los valores de ejemplo no son evidencia. Primero comprobar todas las fuentes y
cobertura. `python3 scripts/qa_gate.py --pr NUMERO --report ARCHIVO` valida el
contrato, el SHA, reviews actuales y orden temporal. Solo el operador autorizado,
tras verificar la evidencia, añade `--publish` para publicar `qa-evidence` con URL
del reporte. El comando no ejecuta pruebas, merge ni deploy. Rechazado/bloqueado,
pendientes, otra revisión, autorrevisión y ausencia de review impiden publicar éxito.
Un nuevo SHA necesita nueva revisión y QA; un status anterior no sirve al nuevo SHA.

El merge lo realiza el responsable autorizado cuando GitHub confirma todos los
gates. Registrar SHA del PR, SHA integrado y equivalencia del árbol/artefacto.
Conflictos, nueva base o cambios posteriores requieren revisión y QA de la nueva
candidata. DevOps recibe esa trazabilidad **después del merge**; ejecuta build y
controles de destino, y conserva evidencia de despliegue. No desplegar desde la
branch de desarrollo.

## Sincronización y evidencia de estado

Vikunja proyecto 2 es la fuente remota de estado declarado. `sprint_actual.md` es
su proyección local; `scrum-master-agent` conserva la responsabilidad operativa
registrada. El hardening autoriza reparar el lector; no reasigna ese rol.

- `python3 tools/vikunja_sync.py --sync`: solo GET remoto; actualiza el espejo.
- `python3 tools/vikunja_sync.py --check`: solo lectura; sale con error ante divergencia.
- Ejecutar después de cada transición confirmada y antes de un handoff que use
  estado remoto. Es operación manual; no hay scheduler habilitado ni sincronización
  continua implícita. El comando no usa el espejo como cola de mutaciones.
- El contrato se comprobó en OpenAPI de Vikunja v2.6.0. Usa la vista Table 11 sin
  filtros, todas las páginas y `expand=buckets`; la vista List 9 oculta cerradas.
  Verifica `X-Pagination-Total-Pages` y `X-Pagination-Result-Count`, IDs únicos,
  proyecto, revisiones, dos lecturas completas coincidentes y bloqueo de escritor.
- Un timeout, una página parcial, un cambio concurrente o una falla de escritura
  conserva el espejo anterior y devuelve error. El reemplazo local es atómico.
  `--check` valida también las filas, no solo el hash. Repetir sin cambios es idempotente.
- Mapeo explícito etiqueta → agente en `config/governance.json`; no se genera el
  nombre del agente concatenando strings. La correlación ticket/historia es local
  y auditada; no se presenta como campo remoto. Nuevas tareas sin correlación o
  responsable verificable quedan indicadas, nunca se inventan IDs.

**No hay mutaciones remotas automáticas.** Se retiraron los cierres y checklists
prefijados del script. Para cada transición, Scrum relee el ticket y exige la
entrega original, SHA y evidencia de salida de fase. Registra en descripción o
comentario del ticket una clave documental `<ticket>:<revision>:<ejecucion-qa>`,
resultado, referencias, contador previo/nuevo y pendiente/aplicado. No son campos
nativos supuestos de la API. Releer antes y después de mutar; si hay timeout,
reconciliar por la misma clave antes de repetir. No ejecutar dos procesadores.
Luego sincronizar el espejo. Sin autoridad, conexión o evidencia, dejar pendiente.

La política de tres rechazos, eventos tardíos y reaperturas sigue
`docs/protocolo.md`. Como el lector no verifica aún ese historial, proyecta
reaperturas y aceptación como **no verificadas**. Los cierres remotos existentes
se conservan como observaciones: no se reabren ni aprueban por inferencia del código.
Para completar una tarea de producto se requieren criterios cubiertos, PR,
review, QA y merge; una tarea de deploy necesita además evidencia del destino.

## Límites de control y puesta en servicio

Los hooks controlan las rutas Git habituales; no son un sandbox que impida toda
escritura arbitraria. La protección de GitHub es la barrera remota a integración.
Personas con administración pueden cambiar protecciones y usuarios con permisos de
status pueden emitir estados: separar credenciales/roles y revisar la evidencia es
necesario. Ningún JSON local demuestra por sí solo identidad humana o pruebas reales.

Ver resultados de instalación y pendientes en `docs/hardening/audit.md`. El CI
nuevo estará disponible tras publicar el PR; hasta entonces los checks requeridos
pendientes bloquean merges. No considerar la sola existencia de YAML como CI ejecutado.

Referencias: [API de Vikunja](https://try.vikunja.io/api/v1/docs) y
[protección de branches de GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Integración externa de Cloudflare: bloqueo observado

El PR de hardening confirmó que publicar una branch genera una preview mediante
Workers Builds antes de revisión y QA. Las protecciones de GitHub no gobiernan
esos disparadores externos. El humano confirmó la desactivación de
**Non-production branch builds**, habilitando la publicación del informe.
Antes de merge, verificar que producción respete el handoff de DevOps y su
aprobación específica; el comando automático de producción sigue configurado. No modificar ni borrar el Worker activo para corregirlo.
La sesión actual carece de acceso autenticado a esa configuración. Ver IDs,
evidencia y criterio de cierre en `docs/hardening/audit.md`.
