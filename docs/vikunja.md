# Vikunja y `tools/vikunja_sync.py`

Vikunja (https://vikunja.arcav.us, proyecto id `2`) es la fuente de verdad de las
tareas. `sprint_actual.md` es un espejo local que regenera `producto` desde una
lectura remota confirmada. `tools/vikunja_sync.py` es el único cliente del
repositorio: lee el tablero, planifica cambios, crea lo que falta y regenera el
espejo. Flujo y gates: `docs/protocolo.md`. Uso por rol: skill `planificacion`.

Si algo de este documento difiere de `python3 tools/vikunja_sync.py --help`,
manda la ayuda.

## Configuración

| Variable | Obligatoria | Por defecto | Flag equivalente |
|---|---|---|---|
| `VIKUNJA_API_TOKEN` | sí | - | ninguno (el token no se pasa por línea de comandos) |
| `VIKUNJA_URL` | no | `https://vikunja.arcav.us` | `--url` |
| `VIKUNJA_PROJECT_ID` | no | `2` | `--proyecto` |
| `VIKUNJA_TIMEOUT` | no | `20` (segundos por petición) | `--timeout` |

- Las variables se leen del entorno y, si existe, de `.env` en la raíz del
  repositorio (plantilla en `.env.example`). Del `.env` solo se cargan claves
  `VIKUNJA_*`, nunca sobrescriben el entorno y sus valores no se imprimen.
  `--env-file RUTA` usa otro archivo; `--sin-env` no lee ninguno.
- Sin token (o con el valor de ejemplo de `.env.example`) cualquier comando
  termina con error de configuración antes de hacer una sola petición.
- La URL debe ser `https`; `http` solo se admite para `localhost`.

Códigos de salida: `0` correcto, `1` error de uso o configuración (incluye
duplicados o etiquetas faltantes que impiden escribir), `2` error remoto (HTTP,
conexión, timeout, respuesta inválida o paginación inconsistente).

## Reglas de la herramienta

- **Solo lectura por defecto.** Sin `--apply` (o con `--dry-run`) nada se
  escribe: ni en Vikunja ni en `sprint_actual.md`. Se muestra el plan o el diff.
- **Primero todas las lecturas, después las escrituras.** Los listados recorren
  todas las páginas (`x-pagination-total-pages`). Si un listado falla, la
  operación se aborta con código `2` sin crear nada.
- **Vikunja manda.** Las tareas existentes que difieren del PRD solo se
  informan. Se sobrescriben únicamente con `--apply --force-update`, y entonces
  se relee la tarea (`GET /tasks/{id}`) y se envía el objeto completo con los
  campos cambiados: Vikunja pone a cero los campos omitidos en un `POST`, así que
  `done`, fechas, prioridad, recordatorios y demás se conservan. Etiquetas y
  asignados no se tocan.
- **Nunca borra.** No hay ninguna llamada `DELETE`: ni tareas, ni etiquetas, ni
  columnas, ni vistas. Las etiquetas antiguas `role:*` se quedan.
- **Duplicados.** Si una clave estable aparece en más de una tarea remota, no se
  escribe nada y se pide resolverlo a mano en Vikunja.
- **Fallo a mitad de escritura.** La herramienta se detiene en el primer error.
  Relee (`tareas`) antes de reintentar: la escritura pudo aplicarse.
- **Sin redirecciones.** Una redirección HTTP se trata como error para que el
  token no viaje a otro destino.

## Comandos habituales

Todos los comandos aceptan `--help`. Las opciones van después del comando.

```bash
# Conexión, token, versión del servidor y proyecto configurado
python3 tools/vikunja_sync.py info

# Listados (solo lectura)
python3 tools/vikunja_sync.py proyectos
python3 tools/vikunja_sync.py tareas
python3 tools/vikunja_sync.py tareas --pendientes

# Tablero: etiquetas rol:* y estado:*, columnas Kanban y migración de roles
python3 tools/vikunja_sync.py preparar --migrar-roles            # plan
python3 tools/vikunja_sync.py preparar --migrar-roles --apply    # crea lo que falta

# Historias de PRD.md -> tareas de Vikunja (una por historia)
python3 tools/vikunja_sync.py sincronizar                        # plan
python3 tools/vikunja_sync.py sincronizar --apply                # crea solo las faltantes
python3 tools/vikunja_sync.py sincronizar --apply --force-update # el PRD pisa título, descripción y prioridad

# Tarea concreta de una historia
python3 tools/vikunja_sync.py crear-tarea --clave US-07:contrato \
  --titulo "[US-07][contrato] Contrato del formulario" --rol integraciones \
  --descripcion-archivo /ruta/a/descripcion.md                   # plan
python3 tools/vikunja_sync.py crear-tarea ... --apply            # crea

# Espejo sprint_actual.md
python3 tools/vikunja_sync.py espejo                             # diff, no escribe
python3 tools/vikunja_sync.py espejo --apply                     # regenera el archivo
```

Toda escritura (`--apply`) requiere que el humano haya visto el plan y lo haya
confirmado en la sesión (ver skill `planificacion`). Después de escribir,
confirma con `tareas` y regenera el espejo.

`sincronizar` toma las historias de los encabezados `### [US-xx] Título` de
`PRD.md`. Para etiquetar el rol al crear, la historia debe tener una línea
``- **Responsable**: `<rol>` ``; sin ella la tarea se crearía sin rol (aviso). Una
línea `- **Prioridad**: N` (0-5) fija la prioridad. La descripción creada empieza
por la clave estable y termina con `Fuente: PRD.md (US-xx)`.

## Clave estable

Formato: `lp-arcav-us:US-xx` para la historia y `lp-arcav-us:US-xx:<tarea>` para
sus tareas (por ejemplo `lp-arcav-us:US-07:contrato`). La herramienta la busca, en
este orden:

1. En la descripción de la tarea: `Clave estable: lp-arcav-us:US-07:contrato`
   (con o sin comillas invertidas; también dentro del HTML del editor).
2. En el título: `[US-07]`, `[US-07][contrato]` o `[US-07:contrato]`.

La deduplicación se hace siempre contra Vikunja, nunca contra el espejo. Una
tarea sin clave aparece en el espejo como `lp-arcav-us:VK-<id>`. La parte
`<tarea>` se normaliza a minúsculas.

## Tablero: columnas, etiquetas y estados lógicos

Los estados lógicos son los de `docs/protocolo.md` más `cerrado`. El estado se
calcula así, en orden:

1. `done = true` en Vikunja -> `cerrado`.
2. Si la tarea tiene una etiqueta `estado:*`, gana la primera de esta lista:
   `estado:escalado`, `estado:bloqueado`, `estado:correccion`,
   `estado:en_produccion`, `estado:en_pr`, `estado:qa_aprobado`.
3. Si no, la columna de la vista Kanban:

| Columna Kanban | Estado lógico |
|---|---|
| `To-Do` | `pendiente` |
| `Doing` | `en_curso` |
| `QA / Review` | `en_qa` |
| `Done` | `cerrado` |
| otra columna | `sin_mapear` (aviso) |
| sin columna o sin vista Kanban | `sin_columna` (aviso) |

Las columnas y etiquetas anteriores son las que crea `preparar --apply`. Los
nombres reales del tablero no están verificados desde el repositorio: antes de
confiar en el espejo, ejecuta `preparar` (sin `--apply`) y revisa qué existe.
Para cambiar el mapeo edita `COLUMNAS_KANBAN` y `ETIQUETAS_ESTADO` en el script
y este documento a la vez.

Transiciones habituales (las escribe `producto` en Vikunja con confirmación
humana). Al aplicar una etiqueta `estado:*`, retira las que ya no apliquen:
la precedencia anterior decide si conviven varias.

| Evento | En Vikunja |
|---|---|
| Empieza la implementación | mover a `Doing` |
| Entrega lista para QA | mover a `QA / Review` |
| Dictamen `rejected` por fallo | etiqueta `estado:correccion`, comentario con la clave de ejecución |
| Dictamen `rejected` por bloqueo | etiqueta `estado:bloqueado` con el dato faltante |
| Tercera reapertura | etiqueta `estado:escalado` |
| Dictamen `approved` | etiqueta `estado:qa_aprobado` |
| PR abierto | etiqueta `estado:en_pr` |
| Merge a `main` (despliegue) | etiqueta `estado:en_produccion` |
| Verificación en producción correcta | marcar `done` (columna `Done`) |

## Roles: etiquetas nuevas y mapeo de las antiguas

Etiquetas nuevas, una por rol: `rol:producto`, `rol:frontend`,
`rol:integraciones`, `rol:qa-revisor`, `rol:release`.

Las etiquetas del squad anterior no se borran. Mientras una tarea no tenga
ninguna `rol:*`, la herramienta deduce el rol con este mapeo, y
`preparar --migrar-roles --apply` añade la etiqueta nueva equivalente:

| Etiqueta antigua | Agente antiguo | Rol nuevo |
|---|---|---|
| `role:po` | `po-agent` | `producto` |
| `role:scrum` | `scrum-master-agent` | `producto` |
| `role:designer` | `designer-agent` | `frontend` |
| `role:frontend` | `frontend-dev-agent` | `frontend` |
| `role:backend` | `backend-dev-agent` | `integraciones` |
| `role:qa` | `qa-agent` | `qa-revisor` |
| `role:devops` | `devops-agent` | `release` |

Si una tarea tiene alguna etiqueta `rol:*`, se ignoran las `role:*`. Otras
etiquetas antiguas (`priority:*`, `sprint-1`) se muestran en el espejo tal cual.

## Espejo `sprint_actual.md`

`espejo` usa el formato de `templates/sprint_actual.md`. Regenera, entre las
marcas `<!-- vikunja-sync:inicio -->` y `<!-- vikunja-sync:fin -->`, las
secciones `## Resumen` y `## Detalle por tarea` con datos leídos de Vikunja: id,
clave estable, rol, columna, `done`, estado lógico, prioridad y etiquetas.

Del archivo local se conserva:

- La cabecera (todo lo anterior a la sección generada) y el resto de secciones
  posteriores (por ejemplo `## Bloqueos y escalados`). En la cabecera se
  actualizan `Última sincronización UTC:` y `Resultado de la sincronización:`
  (se añaden si faltan).
- La columna **Reaperturas** de la tabla, buscada por clave estable (y, si no
  aparece, por id de Vikunja). Una tarea nueva empieza en `0/3`. La tabla manda
  sobre la viñeta `Reaperturas` del detalle.
- Las viñetas de una sola línea del detalle que Vikunja no tiene (por ejemplo
  `Dependencias`, `Rutas de escritura previstas`, `Commit candidato`,
  `Dictamen QA vigente`, `Historia y escenarios`), asociadas por clave estable.

La primera vez que se regenera un espejo sin marcas, la sección generada
sustituye desde `## Resumen` (o `## Resumen del sprint`) hasta la siguiente
sección `##` posterior al detalle. Si la lectura remota falla, el archivo no se
toca y el comando termina con código `2`. Con `--apply` y sin cambios en las
tareas solo se actualiza la fecha de sincronización. Un valor de reaperturas
igual o mayor que 3 genera un aviso de escalado humano.

El contador de reaperturas se registra en Vikunja (comentario con la clave de
ejecución, ver `docs/protocolo.md`). La herramienta no lee comentarios: `producto`
actualiza la columna Reaperturas del espejo al registrar cada dictamen.

## Seguridad

- El token vive solo en el entorno o en `.env` local (ignorado por git). Nunca en
  archivos versionados, tareas, comentarios, logs ni respuestas de agentes.
- El repositorio es público: ni las tareas ni el espejo llevan datos personales
  de leads ni información privada de clientes.
- La herramienta no imprime el token ni valores de `.env`; los errores HTTP
  muestran como máximo 200 caracteres del mensaje del servidor.
- En CI no se usa: las pruebas (`tests/test_vikunja_sync.py`) simulan el
  servidor y bloquean cualquier conexión real.

## Endpoints usados

Verificados contra el código fuente público de Vikunja (v0.24.6 y rama
principal); la versión del servidor real se comprueba con `info`.

| Tipo | Endpoints |
|---|---|
| Lectura | `GET /info`, `GET /user`, `GET /projects`, `GET /projects/{id}`, `GET /projects/{id}/tasks`, `GET /projects/{id}/views/{vista}/tasks`, `GET /projects/{id}/views/{vista}/buckets`, `GET /labels`, `GET /tasks/{id}` |
| Escritura (`--apply`) | `PUT /projects/{id}/tasks`, `POST /tasks/{id}`, `PUT /labels`, `PUT /tasks/{id}/labels`, `PUT /projects/{id}/views/{vista}/buckets` |

`GET /projects/{id}/tasks` incluye las tareas hechas (la vista Lista filtra
`done = false`); la columna de cada tarea se lee de la vista Kanban, que Vikunja
pagina por columna.

## Pruebas

```bash
python3 -m unittest tests.test_vikunja_sync -v
```
