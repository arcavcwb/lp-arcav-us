# Sprint <n> — ARCAV Landing

Proyecto Vikunja: https://vikunja.arcav.us/projects/2
PRD de referencia: PRD.md (commit pendiente de aprobación)
Responsable del espejo: `producto`
Última sincronización UTC: nunca
Resultado de la sincronización: no ejecutada

Vikunja es la fuente de verdad; este archivo es un espejo que solo regenera
`producto` desde una lectura remota confirmada (ver `docs/protocolo.md`). Este
archivo es el formato del espejo; la correspondencia con columnas y etiquetas
de Vikunja está en `docs/vikunja.md`. El repositorio es público: sin datos
personales ni información privada.

## Resumen

| Vikunja | Clave estable | Rol | Estado (Vikunja / lógico) | Reaperturas |
|---|---|---|---|---|
| #<id> | `lp-arcav-us:US-xx:<slug>` | `<rol>` | <columna> / pendiente | 0/3 |

## Detalle por tarea

### [#<id>] <título>
- Clave estable: `lp-arcav-us:US-xx:<slug>`
- Enlace: https://vikunja.arcav.us/tasks/<id>
- Historia y escenarios: US-xx (1, 2, 3, 4)
- Rol responsable: `<producto | frontend | integraciones | qa-revisor | release>`
- Estado (Vikunja / lógico): <columna> / <estado lógico>
- Dependencias: <clave> | ninguna
- Rutas de escritura previstas: <carpetas o archivos>
- Commit candidato: <hash> | pendiente
- Dictamen QA vigente: approved | rejected (fallo | bloqueo) | sin ejecutar — ver bug_report.md
- Reaperturas: n/3 (escalado: sí/no)

Estados lógicos: `pendiente`, `en_curso`, `en_qa`, `correccion`, `bloqueado`,
`escalado`, `qa_aprobado`, `en_pr`, `en_produccion`.

## Bloqueos y escalados

| Tarea | Motivo | Dato o decisión faltante | Responsable | Desde (UTC) |
|---|---|---|---|---|
