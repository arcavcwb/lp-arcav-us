# Reporte de QA

Dictamen vigente: sin ejecutar
Motivo: pruebas todavía no ejecutadas
Clave de ejecución (`<clave estable>:<commit>:<ejecucion>`): pendiente
Historia y tarea de Vikunja: pendiente
Commit candidato: pendiente
Reapertura n.º (máx. 3): 0
Entorno (build, preview o producción) y fecha UTC: pendiente
Responsable: `qa-revisor`

## Cobertura y evidencia

| Escenario de la historia | Idioma(s) | Comando o pasos ejecutados | Resultado | Evidencia |
|---|---|---|---|---|

Cubre los cuatro escenarios (camino feliz, error/validación, caso límite y
estado vacío/carga) y los comandos obligatorios de `docs/protocolo.md`.

## Seguridad

Secretos en el diff, validación de entradas, datos expuestos al cliente,
cambios en `.github/`, `wrangler.jsonc`, `astro.config.mjs` y dependencias.

## Fallos

Para cada fallo: ID, severidad, reproducción, resultado esperado y observado,
evidencia y responsable propuesto (`frontend`, `integraciones` o `release`).

## Verificaciones pendientes

Pruebas no ejecutadas, límites de cobertura y bloqueos del entorno. Lo no
ejecutado se reporta como bloqueo, nunca como aprobado.

## Dictamen

Usa `approved` o `rejected` y justifícalo. Una verificación obligatoria sin
ejecutar impide `approved`; si el rechazo se debe solo a un impedimento de
entorno, márcalo como bloqueo (no cuenta como reapertura). Conserva el historial
por ejecución e identifica el dictamen vigente por historia y commit. En la
tercera reapertura indica el escalado a intervención humana.
