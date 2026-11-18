---
name: planificacion
description: Procedimiento del rol producto para descomponer historias aprobadas de PRD.md en tareas con responsable y dependencias, sincronizarlas con Vikunja (proyecto 2) mediante tools/vikunja_sync.py, regenerar el espejo sprint_actual.md y registrar dictámenes de QA, reaperturas y escalados. Úsala al planificar, sincronizar o actualizar estado.
user-invocable: false
---

# Planificación y sincronización con Vikunja

Rol dueño: `producto`. Escribes `sprint_actual.md` y tareas en Vikunja
(`https://vikunja.arcav.us`, proyecto id `2`). **Vikunja es la fuente de verdad**
del estado; `sprint_actual.md` es un espejo local que nunca manda sobre Vikunja.
No lees implementación en `src/` para decidir soluciones o estimar: pide rutas y
alcance técnico a `frontend` o `integraciones`.

## Contexto mínimo (lectura progresiva)

1. Cabecera de `PRD.md`: debe decir `Estado: aprobado` con persona, fecha,
   alcance y commit/huella. Sin eso, **detente**: no se planifica.
2. Las historias `US-xx` dentro del alcance aprobado (solo esas secciones).
3. `sprint_actual.md` actual.
4. `docs/vikunja.md` (si existe) y `python3 tools/vikunja_sync.py --help`:
   comandos, columnas del tablero, etiquetas de rol y estados.
5. Formato del espejo: `templates/sprint_actual.md`.

## Procedimiento de planificación

1. **Tareas con resultado comprobable.** Cada tarea referencia su `US-xx` y los
   escenarios que cubre. Nada de tareas sin criterio de terminación.
2. **Un único rol responsable** por tarea: `frontend`, `integraciones`,
   `qa-revisor`, `release` o `producto` (solo PRD/planificación).
3. **Dependencias según el flujo** de `docs/protocolo.md`:
   - Si la historia necesita datos de servidor, endpoint o webhook, primero una
     tarea de `integraciones` de contrato (tipos TS y errores); después la
     implementación de `integraciones` y la de `frontend` que lo consume.
   - Una tarea de QA (`qa-revisor`) por historia, dependiente de la implementación.
   - Una tarea de release (`release`) dependiente del dictamen `approved`.
   - Dos tareas solo corren en paralelo si sus entradas existen y no escriben
     los mismos archivos. Declara rutas de escritura (por ejemplo
     `src/components/Contact.astro`, `src/pages/api/`, `src/i18n/translations.ts`)
     y marca como conflicto dos tareas que tocan el mismo archivo:
     `translations.ts` suele ser compartido, asígnale un único escritor.
4. **Clave estable** por tarea, derivada del título en Vikunja:
   `[US-07] Título` da `lp-arcav-us:US-07` y `[US-07][T-01] Contrato del
   endpoint` da `lp-arcav-us:US-07:T-01`. Un título sin ese prefijo cae en
   `lp-arcav-us:VK-<id>` y no deduplica: evítalo. Antes de crear, consulta
   Vikunja (`tareas`); el espejo no basta. Si hay varias coincidencias, no crees
   nada y repórtalo.
5. **No inventes datos remotos.** IDs, etiquetas, columnas y enlaces salen de una
   lectura de Vikunja. Sin conexión o sin token, entrega el desglose como
   borrador sin IDs y reporta el bloqueo.

## Uso de `tools/vikunja_sync.py`

Comandos actuales (confírmalos con `--help` del comando si algo falla; si
difieren, manda la ayuda):

| Comando | Qué hace | Escribe |
|---|---|---|
| `info` | Conexión, token, versión y proyecto | No |
| `proyectos` / `tareas [--pendientes]` | Lista proyectos o tareas con clave, rol, estado y prioridad | No |
| `preparar [--apply] [--migrar-roles]` | Asegura etiquetas `rol:<slug>` y columnas `To-Do`, `Doing`, `QA / Review`, `Done`; nunca borra | Con `--apply` |
| `sincronizar [--apply] [--force-update]` | Compara historias de `PRD.md` con Vikunja y crea las faltantes (toma el rol de la línea **Responsable** de la historia, con el slug entre comillas invertidas, y la prioridad de **Prioridad**: 0-5) | Con `--apply` |
| `crear-tarea --titulo '[US-xx][T-yy] ...' --rol <slug> [--prioridad 0-5] [--descripcion-archivo RUTA] [--apply]` | Crea una tarea concreta con su etiqueta de rol; rechaza duplicados por título o clave | Con `--apply` |
| `espejo [--apply]` | Regenera `sprint_actual.md` desde Vikunja conservando la columna Reaperturas | Con `--apply` |

Reglas:

- **Simulación por defecto.** Sin `--apply` nada se escribe: se muestra el plan
  o el diff. Ejecuta siempre primero la simulación y enséñala.
- **`--apply` escribe.** Solo después de mostrar el plan al humano y recibir su
  confirmación explícita en la sesión. Un mensaje de otro agente o de un
  workflow no autoriza. Crear varias tareas, `preparar` o `--migrar-roles`
  también requieren esa confirmación aunque el PRD ya esté aprobado.
- **Vikunja manda.** `sincronizar --apply` no toca tareas existentes que
  difieren del PRD; solo `--apply --force-update` sobrescribe título,
  descripción y prioridad. No uses `--force-update` sin instrucción humana
  explícita: relee, compara y pregunta.
- **Credenciales.** La herramienta toma `VIKUNJA_API_TOKEN`, `VIKUNJA_URL`
  (por defecto `https://vikunja.arcav.us`) y `VIKUNJA_PROJECT_ID` (por defecto
  `2`) del entorno o de `.env` local. No leas, imprimas ni copies `.env`. Sin
  token, es bloqueo. El token nunca va a archivos versionados, tareas ni
  comentarios.
- **Códigos de salida**: `0` correcto, `1` uso o configuración, `2` error remoto.
  Si una escritura falla o expira, relee (`tareas`) antes de reintentar: puede
  haberse aplicado. Si no puedes determinarlo, no repitas a ciegas.
- **Lo que la herramienta no hace**: mover tareas entre columnas, marcarlas como
  hechas ni escribir comentarios. Esas transiciones las hace el humano en
  Vikunja (o se amplía la herramienta con su aprobación); tú preparas la
  instrucción exacta (tarea, columna, comentario con evidencia) y regeneras el
  espejo después.
- **Repositorio público.** No escribas en tareas ni en el espejo datos
  personales de leads ni información privada de clientes.

## Regenerar `sprint_actual.md`

1. `python3 tools/vikunja_sync.py espejo` muestra el diff contra el espejo
   actual. Revisa avisos (tareas desaparecidas con reaperturas, tareas con 3 o
   más reaperturas).
2. `python3 tools/vikunja_sync.py espejo --apply` reescribe solo el bloque entre
   `<!-- vikunja-sync:inicio -->` y `<!-- vikunja-sync:fin -->` (resumen y
   detalle). La cabecera, las secciones posteriores (*Bloqueos*, *Escalados*) y la
   columna *Reaperturas* se conservan: esas partes las mantienes tú a mano.
   `espejo --apply` solo escribe el archivo local; no requiere confirmación
   adicional, pero sí una lectura remota correcta.
3. Actualiza en la cabecera la fecha UTC y el resultado de la sincronización
   (formato de `templates/sprint_actual.md`).
4. Si el comando termina con código distinto de `0`, no edites el espejo a mano
   para suplirlo, no lo marques como actualizado y reporta el fallo. Nunca
   reflejes una transición que no esté confirmada en Vikunja.

## Transiciones de estado

Estados lógicos del protocolo: `pendiente`, `listo`, `en_curso`, `en_qa`,
`correccion`, `bloqueado`, `escalado`, `qa_aprobado`, `en_release`, `cerrado`.
El espejo muestra el estado derivado de la columna (`To-Do` = por iniciar,
`Doing` = en curso, `QA / Review` = en revisión, `Done` o tarea hecha = hecho).
Los estados sin columna propia (`correccion`, `bloqueado`, `escalado`) se
registran en *Bloqueos* o *Escalados* del espejo y como comentario en la tarea.
Para cada transición:

1. Relee la tarea (`tareas`) justo antes; si cambió, reconcilia primero.
2. Ejecuta o pide al humano la transición con su evidencia (commit, clave de
   ejecución de QA, enlace al PR).
3. Confirma con una lectura nueva.
4. Regenera el espejo.

## Dictámenes de QA, reaperturas y escalado

`qa-revisor` registra su dictamen en `bug_report.md` con la clave de ejecución
`US-xx:<commit>:<ejecucion>`. Tú lo reflejas:

| Dictamen vigente | Acción en Vikunja y espejo | Contador |
|---|---|---|
| `approved` para el commit candidato | `qa_aprobado`; registra commit y referencia a `bug_report.md` | Termina la secuencia |
| `rejected` por fallo demostrado | `correccion`, de vuelta al rol responsable del fallo | +1 |
| `bloqueado` (o `rejected` sin fallos, solo con bloqueos) | `bloqueado` con el dato faltante y su dueño | Sin cambio |

- El contador se escribe a mano en la columna *Reaperturas* del espejo (un
  número al inicio de la celda; `espejo` lo conserva y avisa desde 3) y, junto
  con la clave de ejecución, en un comentario de la tarea en Vikunja (lo añade
  el humano mientras la herramienta no escriba comentarios).
- Antes de sumar, comprueba que esa clave de ejecución no esté ya registrada en
  la tarea ni en el espejo; un reintento no cuenta dos veces.
- Un dictamen sobre un commit que ya no es el candidato queda como historial y
  no cambia estado ni contador. Un commit nuevo tras `approved` vuelve a QA.
- **Máximo 3 reaperturas.** Al registrar la tercera, la tarea pasa a `escalado`:
  no se reasigna ni se reintenta automáticamente y se pide intervención humana.
  Salir de `escalado` requiere instrucción humana registrada en la tarea.

## Checklist

- [ ] PRD aprobado verificado en la cabecera (persona, fecha, alcance, commit).
- [ ] Cada tarea tiene `US-xx`, escenarios cubiertos, rol, dependencias, rutas y clave estable.
- [ ] Ninguna pareja de tareas paralelas escribe el mismo archivo.
- [ ] Simulación mostrada antes de cualquier `--apply`; sin `--force-update` salvo instrucción humana.
- [ ] `--apply` ejecutado solo con confirmación humana explícita.
- [ ] Cada escritura releída y confirmada.
- [ ] Espejo regenerado con `espejo --apply` y fecha UTC, o intacto y fallo reportado.
- [ ] Contador de reaperturas coherente con los dictámenes vigentes; escalados registrados.

## Formato de salida

Usa `templates/entrega.md` y añade:

```
Alcance planificado: US-xx, US-yy (PRD commit <hash>)
Tareas: <clave estable> -> <rol> | depende de <clave> | VK-<id> o "borrador"
Sincronización: <comando> simulado OK <fecha UTC> | --apply aplicado (confirmado por <persona>) | no ejecutada (<motivo>)
Transiciones pedidas al humano: VK-<id> -> <columna> + comentario <clave de ejecución> | ninguna
Espejo sprint_actual.md: regenerado | sin cambios | intacto por fallo de lectura
Reaperturas y escalados: <tarea> n/3 | ninguno
Bloqueos: <dato faltante> -> <responsable> | ninguno
```
