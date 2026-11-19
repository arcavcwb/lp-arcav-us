export const meta = {
  name: 'entrega-historia',
  description: 'Entrega una historia US-xx de punta a punta: comprueba la aprobación humana del PRD, implementa (integraciones y después frontend), pasa QA con un máximo de 3 reaperturas y prepara el PR sin publicarlo',
  whenToUse: 'Implementar una historia ya aprobada en PRD.md. Args: {historia: "US-07"} o "US-07". Se lanza con /entregar-historia US-07. No hace commit, push, PR, merge ni despliegue.',
  phases: [
    { title: 'Requisitos', detail: 'producto verifica la aprobación humana y extrae los 4 escenarios' },
    { title: 'Implementación', detail: 'integraciones (si aplica) y después frontend, en secuencia' },
    { title: 'QA', detail: 'qa-revisor verifica escenarios, build y validate_squad; cada rechazo es una reapertura' },
    { title: 'Release', detail: 'release ejecuta build y checks y propone el PR' },
  ],
}

// Reaperturas (docs/protocolo.md): cada dictamen rejected con fallos demostrados
// cuenta una reapertura. Tras la 1.ª y la 2.ª se reabre la tarea al implementador
// responsable con el reporte de fallos. Al llegar a la 3.ª no se corrige de nuevo:
// el workflow termina con estado escalada_humano. Un QA sin fallos demostrados pero
// sin evidencia completa (bloqueo de entorno) no cuenta reapertura: termina como
// bloqueada.

const MAX_REAPERTURAS = 3
const TIPOS_ESCENARIO = ['camino_feliz', 'error_validacion', 'caso_limite', 'estado_vacio_carga']

// ---------- Entrada ----------

function leerHistoria(a) {
  let valor = a
  if (typeof valor === 'string') {
    const texto = valor.trim()
    valor = texto
    if (texto.startsWith('{')) {
      try {
        valor = JSON.parse(texto)
      } catch (e) {
        valor = texto
      }
    }
  }
  if (valor && typeof valor === 'object' && !Array.isArray(valor)) valor = valor.historia
  if (typeof valor === 'number') valor = String(valor)
  if (typeof valor !== 'string') return null
  const m = valor.replace(/[\[\]]/g, '').trim().match(/^(?:US[-_ ]?)?(\d{1,3})$/i)
  return m ? `US-${m[1].padStart(2, '0')}` : null
}

const historia = leerHistoria(args)
if (!historia) {
  return {
    estado: 'bloqueada',
    fase: 'Entrada',
    motivo: `Argumento no válido: se esperaba {historia: "US-07"} o "US-07" y se recibió ${JSON.stringify(args === undefined ? null : args)}.`,
  }
}
log(`Historia: ${historia}`)

// ---------- Esquemas ----------

const REQUISITOS_SCHEMA = {
  type: 'object',
  required: ['historia', 'titulo', 'aprobada', 'evidencia_aprobacion', 'escenarios', 'necesita_integracion', 'necesita_frontend', 'archivos_previstos', 'contratos', 'tarea_sprint', 'bloqueos'],
  properties: {
    historia: { type: 'string' },
    titulo: { type: 'string' },
    aprobada: { type: 'boolean' },
    evidencia_aprobacion: { type: 'string', description: 'Cita literal de PRD.md con persona, fecha, alcance y commit o hash, o qué falta' },
    escenarios: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        required: ['tipo', 'dado', 'cuando', 'entonces'],
        properties: {
          tipo: { type: 'string', enum: TIPOS_ESCENARIO },
          dado: { type: 'string' },
          cuando: { type: 'string' },
          entonces: { type: 'string' },
        },
      },
    },
    necesita_integracion: { type: 'boolean' },
    necesita_frontend: { type: 'boolean' },
    archivos_previstos: { type: 'array', items: { type: 'string' } },
    contratos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['nombre', 'descripcion', 'estado'],
        properties: {
          nombre: { type: 'string' },
          descripcion: { type: 'string' },
          estado: { type: 'string', enum: ['existe', 'por_definir'] },
        },
      },
    },
    tarea_sprint: { type: 'string', description: 'ID de la tarea espejo en sprint_actual.md (por ejemplo VK-8) o cadena vacía' },
    bloqueos: { type: 'array', items: { type: 'string' } },
  },
}

const IMPLEMENTACION_SCHEMA = {
  type: 'object',
  required: ['archivos_modificados', 'notas', 'pruebas_ejecutadas', 'bloqueos'],
  properties: {
    archivos_modificados: { type: 'array', items: { type: 'string' } },
    notas: { type: 'string' },
    pruebas_ejecutadas: { type: 'array', items: { type: 'string' } },
    bloqueos: { type: 'array', items: { type: 'string' } },
  },
}

const QA_SCHEMA = {
  type: 'object',
  required: ['dictamen', 'revision', 'evidencia', 'fallos', 'bloqueos', 'reporte_markdown'],
  properties: {
    dictamen: { type: 'string', enum: ['approved', 'rejected'] },
    revision: { type: 'string', description: 'git rev-parse HEAD y número de cambios sin commit' },
    evidencia: {
      type: 'array',
      items: {
        type: 'object',
        required: ['criterio', 'comando_o_pasos', 'resultado', 'detalle'],
        properties: {
          criterio: { type: 'string' },
          comando_o_pasos: { type: 'string' },
          resultado: { type: 'string', enum: ['ok', 'fallo', 'no_ejecutado'] },
          detalle: { type: 'string' },
        },
      },
    },
    fallos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['escenario', 'pasos', 'esperado', 'obtenido', 'severidad', 'responsable_propuesto'],
        properties: {
          escenario: { type: 'string' },
          pasos: { type: 'string' },
          esperado: { type: 'string' },
          obtenido: { type: 'string' },
          severidad: { type: 'string', enum: ['alta', 'media', 'baja'] },
          responsable_propuesto: { type: 'string', enum: ['integraciones', 'frontend'] },
        },
      },
    },
    bloqueos: { type: 'array', items: { type: 'string' } },
    reporte_markdown: { type: 'string', description: 'Reporte con el formato de templates/bug_report.md; no se escribe en disco' },
  },
}

const RELEASE_SCHEMA = {
  type: 'object',
  required: ['listo', 'checks', 'archivos_inesperados', 'pr_propuesto', 'bloqueos'],
  properties: {
    listo: { type: 'boolean' },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['comando', 'resultado', 'detalle'],
        properties: {
          comando: { type: 'string' },
          resultado: { type: 'string', enum: ['ok', 'fallo', 'no_ejecutado'] },
          detalle: { type: 'string' },
        },
      },
    },
    archivos_inesperados: { type: 'array', items: { type: 'string' } },
    pr_propuesto: {
      type: 'object',
      required: ['titulo', 'rama_base', 'rama_origen', 'cuerpo_markdown'],
      properties: {
        titulo: { type: 'string' },
        rama_base: { type: 'string' },
        rama_origen: { type: 'string' },
        cuerpo_markdown: { type: 'string' },
      },
    },
    bloqueos: { type: 'array', items: { type: 'string' } },
  },
}

// ---------- Requisitos ----------

phase('Requisitos')
const req = await agent(`Prepara la entrega de la historia ${historia} de lp-arcav-us. En esta fase NO modifiques ningún archivo (tampoco PRD.md ni sprint_actual.md) ni llames a Vikunja.

1. Lee PRD.md de forma progresiva: primero la cabecera (estado y aprobación humana) y después solo la sección de ${historia} y lo que la afecte (preguntas abiertas, fuera de alcance).
2. aprobada=true solo si PRD.md registra la aprobación humana con persona, fecha, alcance y commit o hash, y ese alcance cubre ${historia}. Si figura como pendiente o falta cualquiera de esos datos, aprobada=false. En evidencia_aprobacion copia el texto literal o explica qué falta.
3. Extrae los 4 escenarios de la historia tal como están escritos, uno por tipo: camino_feliz, error_validacion, caso_limite y estado_vacio_carga. No inventes ni completes escenarios: si falta alguno, devuelve solo los que existen y anota el faltante en bloqueos.
4. necesita_integracion=true si la historia requiere lógica de servidor (endpoint en src/pages/api, envío a webhook de n8n, contratos de datos, variables o bindings de Cloudflare). necesita_frontend=true si requiere cambios de páginas, componentes, estilos o textos.
5. archivos_previstos: rutas existentes o nuevas probables; comprueba con ls o grep cuáles existen.
6. contratos: los contratos de datos que la historia necesita, indicando si ya existen en el código o están por definir.
7. tarea_sprint: el ID de la tarea espejo en sprint_actual.md para ${historia}, o cadena vacía si no consta.
8. bloqueos: todo lo que impida implementar sin suponer. Un contrato propio que integraciones puede definir sin contradecir el PRD no es bloqueo. Sí lo es lo que depende de un sistema externo no documentado (por ejemplo, el formato que espera un webhook existente) o de una decisión humana no registrada.`, {
  agentType: 'producto',
  schema: REQUISITOS_SCHEMA,
  label: `Requisitos ${historia}`,
  phase: 'Requisitos',
})

if (!req) {
  return { estado: 'bloqueada', fase: 'Requisitos', historia, motivo: 'El agente producto no devolvió resultado.' }
}

const motivosRequisitos = []
if (req.historia.replace(/[\[\]\s]/g, '').toUpperCase() !== historia) {
  motivosRequisitos.push(`producto analizó ${req.historia} en lugar de ${historia}.`)
}
if (!req.aprobada) {
  motivosRequisitos.push(`PRD.md no registra la aprobación humana para ${historia} (persona, fecha, alcance y commit o hash): ${req.evidencia_aprobacion}`)
}
const tiposPresentes = new Set(req.escenarios.map(e => e.tipo))
if (req.escenarios.length !== 4 || tiposPresentes.size !== 4) {
  const faltan = TIPOS_ESCENARIO.filter(t => !tiposPresentes.has(t))
  motivosRequisitos.push(`La historia no tiene los 4 escenarios obligatorios${faltan.length ? ` (faltan: ${faltan.join(', ')})` : ''}.`)
}
if (!req.necesita_integracion && !req.necesita_frontend) {
  motivosRequisitos.push('La historia no requiere cambios de frontend ni de integraciones: gestiónala con el rol que corresponda fuera de este workflow.')
}
motivosRequisitos.push(...req.bloqueos)

if (motivosRequisitos.length) {
  log(`${historia} bloqueada en Requisitos: ${motivosRequisitos.length} motivo(s)`)
  return {
    estado: 'bloqueada',
    fase: 'Requisitos',
    historia,
    motivo: motivosRequisitos.join(' | '),
    bloqueos: motivosRequisitos,
    requisitos: req,
  }
}
log(`${historia} aprobada: integraciones=${req.necesita_integracion}, frontend=${req.necesita_frontend}`)

// ---------- Utilidades de texto ----------

function lista(items, vacio) {
  return items.length ? items.map(x => `- ${x}`).join('\n') : `- ${vacio}`
}

const textoEscenarios = req.escenarios
  .map((e, i) => `${i + 1}. [${e.tipo}] Dado ${e.dado}; cuando ${e.cuando}; entonces ${e.entonces}.`)
  .join('\n')

const textoContratos = lista(req.contratos.map(c => `${c.nombre} (${c.estado}): ${c.descripcion}`), 'ninguno identificado')

function textoFallos(fallos) {
  return fallos
    .map((f, i) => `${i + 1}. [${f.severidad}] Escenario: ${f.escenario}\n   Pasos: ${f.pasos}\n   Esperado: ${f.esperado}\n   Obtenido: ${f.obtenido}`)
    .join('\n')
}

const REGLAS_IMPLEMENTACION = `Reglas:
- Trabaja en el árbol de trabajo actual. No hagas commit, push, PR ni merge; no cambies de rama; no ejecutes wrangler deploy ni wrangler secret.
- No llames a servicios reales (Vikunja, n8n de producción, APIs con credenciales).
- No leas ni imprimas .env, .env.* ni .dev.vars. Los secretos solo se declaran por nombre (bindings o entorno de Cloudflare); nunca valores reales en archivos versionados.
- Cero asunción: si falta un dato o contrato que no te corresponde definir, no lo inventes; anótalo en bloqueos y no sigas con esa parte.
- Ejecuta npm run build y las pruebas que apliquen; en pruebas_ejecutadas lista cada comando con su resultado.
- En archivos_modificados lista todas las rutas que creaste, editaste o borraste.`

// ---------- Implementación ----------

const archivos = new Set()
const notas = { integraciones: '', frontend: '' }
const historialImplementacion = []

function promptIntegraciones(ronda, fallos) {
  const encargo = ronda === 1
    ? `Orden de trabajo: define primero los contratos de datos TypeScript (petición, respuestas y errores) y después implementa el endpoint server en src/pages/api/ y el envío al webhook de n8n si la historia lo pide. No toques componentes, estilos ni textos de interfaz: frontend trabajará después sobre tu contrato.`
    : `Corrección tras la reapertura ${ronda - 1} de ${MAX_REAPERTURAS}. QA rechazó la entrega con estos fallos asignados a integraciones:\n${textoFallos(fallos)}\nCorrige solo lo necesario para resolverlos, sin romper el contrato que frontend ya consume salvo que el fallo lo exija (en ese caso, descríbelo en notas).`
  return `Eres integraciones en la entrega de ${historia} ("${req.titulo}") de lp-arcav-us.

Escenarios de aceptación:
${textoEscenarios}

Contratos identificados por producto:
${textoContratos}

Archivos previstos:
${lista(req.archivos_previstos, 'sin previsión')}

${encargo}

${REGLAS_IMPLEMENTACION}

En notas deja el contrato final para frontend: ruta, método, formato de petición, respuestas y códigos de error, límites (por ejemplo, rate limiting) y nombres de variables de entorno o bindings.`
}

function promptFrontend(ronda, fallos) {
  const contrato = notas.integraciones
    ? `Contrato publicado por integraciones (consúmelo, no lo redefinas; si no te sirve, anótalo en bloqueos):\n${notas.integraciones}`
    : 'Esta historia no tiene contrato de integraciones.'
  const encargo = ronda === 1
    ? 'Implementa la parte de interfaz de la historia.'
    : fallos.length
      ? `Corrección tras la reapertura ${ronda - 1} de ${MAX_REAPERTURAS}. QA rechazó la entrega con estos fallos asignados a frontend:\n${textoFallos(fallos)}\nCorrige solo lo necesario para resolverlos.`
      : `Corrección tras la reapertura ${ronda - 1} de ${MAX_REAPERTURAS}. Integraciones cambió archivos en esta ronda: adapta la interfaz al contrato actualizado si hace falta; si no hace falta ningún cambio, devuelve archivos_modificados vacío y explícalo en notas.`
  return `Eres frontend en la entrega de ${historia} ("${req.titulo}") de lp-arcav-us.

Escenarios de aceptación:
${textoEscenarios}

Archivos previstos:
${lista(req.archivos_previstos, 'sin previsión')}

${contrato}

${encargo}

Requisitos de interfaz: todo texto visible sale de src/i18n/translations.ts con sus versiones es, en y pt (nada hardcodeado); Vanilla CSS con los tokens de DESIGN.md y src/styles/global.css; responsive según docs/UX_RESPONSIVE.md; accesible (labels, foco, errores anunciados); SEO en <head> si la historia lo afecta. No edites src/pages/api ni los contratos de integraciones.

${REGLAS_IMPLEMENTACION}`
}

async function ejecutarImplementador(rol, prompt, ronda) {
  const resultado = await agent(prompt, {
    agentType: rol,
    schema: IMPLEMENTACION_SCHEMA,
    label: `${rol} ${historia} ronda ${ronda}`,
    phase: 'Implementación',
  })
  if (!resultado) return { bloqueo: `${rol} no devolvió resultado en la ronda ${ronda}.` }
  resultado.archivos_modificados.forEach(a => archivos.add(a))
  notas[rol] = resultado.notas
  historialImplementacion.push({ ronda, rol, ...resultado })
  log(`${rol} ronda ${ronda}: ${resultado.archivos_modificados.length} archivo(s)`)
  if (resultado.bloqueos.length) return { bloqueo: `${rol}: ${resultado.bloqueos.join(' | ')}`, resultado }
  return { resultado }
}

// Implementación secuencial (integraciones antes que frontend) para no pisar archivos.
async function implementar(ronda, fallos) {
  const fallosIntegraciones = fallos.filter(f => f.responsable_propuesto === 'integraciones')
  const fallosFrontend = fallos.filter(f => f.responsable_propuesto === 'frontend')

  let cambiosIntegraciones = false
  const correrIntegraciones = ronda === 1 ? req.necesita_integracion : fallosIntegraciones.length > 0
  if (correrIntegraciones) {
    const r = await ejecutarImplementador('integraciones', promptIntegraciones(ronda, fallosIntegraciones), ronda)
    if (r.bloqueo) return r.bloqueo
    cambiosIntegraciones = r.resultado.archivos_modificados.length > 0
  }

  const correrFrontend = ronda === 1
    ? req.necesita_frontend
    : fallosFrontend.length > 0 || (req.necesita_frontend && cambiosIntegraciones)
  if (correrFrontend) {
    const r = await ejecutarImplementador('frontend', promptFrontend(ronda, fallosFrontend), ronda)
    if (r.bloqueo) return r.bloqueo
  }
  return null
}

// ---------- QA ----------

function promptQA(ronda, fallosAnteriores) {
  const anteriores = fallosAnteriores.length
    ? `\nFallos del rechazo anterior, que deben quedar corregidos:\n${textoFallos(fallosAnteriores)}\n`
    : ''
  return `Verifica la entrega de ${historia} ("${req.titulo}") de lp-arcav-us. Ronda de QA ${ronda}. No modifiques ningún archivo del repositorio (tampoco bug_report.md): devuelve el reporte en reporte_markdown; la persona decide si se guarda.

Escenarios a verificar (los 4 son obligatorios):
${textoEscenarios}

Archivos modificados en la entrega:
${lista([...archivos].sort(), 'ninguno declarado')}

Notas de integraciones:
${notas.integraciones || 'no aplica'}

Notas de frontend:
${notas.frontend || 'no aplica'}
${anteriores}
Pasos:
1. Registra la revisión: git rev-parse HEAD y git status --short (la entrega está sin commit).
2. Ejecuta npm run build, python3 scripts/validate_squad.py y python3 -m unittest discover tests -v.
3. Levanta npm run preview -- --host 127.0.0.1 --port <puerto libre> en segundo plano y verifica cada escenario con peticiones reales (curl) y lectura del HTML y del código, en es, en y pt cuando haya texto visible. Detén el preview al terminar, sin procesos colgados.
4. Revisa la seguridad de los archivos modificados: secretos o URLs privadas versionadas (el repo es público), validación en servidor de toda entrada y errores sin detalles internos.
5. Comprueba que no haya texto visible hardcodeado fuera de src/i18n/translations.ts.

Dictamen:
- approved solo si los 4 escenarios, el build, validate_squad y los tests tienen evidencia ok y no hay fallos.
- rejected si demostraste al menos un fallo. Describe cada uno con escenario, pasos reproducibles, esperado, obtenido, severidad y responsable_propuesto (integraciones para endpoint, contratos y servidor; frontend para interfaz, estilos, i18n y accesibilidad).
- Si algo no se pudo ejecutar por causas ajenas a la entrega (entorno, dependencias ausentes, servicio externo), márcalo no_ejecutado y descríbelo en bloqueos; usa rejected con fallos vacío si no demostraste ningún fallo. Nunca lo cuentes como aprobado.
reporte_markdown sigue templates/bug_report.md (Resultado: aprobado, rechazado o bloqueado) e incluye la revisión, el entorno y la tabla de cobertura por escenario.`
}

function responsablesPorDefecto() {
  const destinos = []
  if (req.necesita_integracion) destinos.push('integraciones')
  if (req.necesita_frontend) destinos.push('frontend')
  return destinos
}

const historialQA = []
let reaperturas = 0
let ronda = 1
let fallosPendientes = []
let qa = null

while (true) {
  phase('Implementación')
  const bloqueoImplementacion = await implementar(ronda, fallosPendientes)
  if (bloqueoImplementacion) {
    log(`${historia} bloqueada en Implementación (ronda ${ronda})`)
    return {
      estado: 'bloqueada',
      fase: 'Implementación',
      historia,
      motivo: bloqueoImplementacion,
      reaperturas,
      archivos: [...archivos].sort(),
      implementacion: historialImplementacion,
      historial_qa: historialQA,
    }
  }

  phase('QA')
  qa = await agent(promptQA(ronda, fallosPendientes), {
    agentType: 'qa-revisor',
    schema: QA_SCHEMA,
    label: `QA ${historia} ronda ${ronda}`,
    phase: 'QA',
  })
  if (!qa) {
    return {
      estado: 'bloqueada',
      fase: 'QA',
      historia,
      motivo: `qa-revisor no devolvió resultado en la ronda ${ronda}.`,
      reaperturas,
      archivos: [...archivos].sort(),
      implementacion: historialImplementacion,
      historial_qa: historialQA,
    }
  }

  const evidenciaNoOk = qa.evidencia.filter(e => e.resultado !== 'ok')
  const evidenciaFallida = evidenciaNoOk.filter(e => e.resultado === 'fallo')
  historialQA.push({ ronda, dictamen: qa.dictamen, revision: qa.revision, fallos: qa.fallos, bloqueos: qa.bloqueos, evidencia_no_ok: evidenciaNoOk })

  const aprobada = qa.dictamen === 'approved' && qa.fallos.length === 0 && qa.bloqueos.length === 0 && evidenciaNoOk.length === 0
  if (aprobada) {
    log(`QA ronda ${ronda}: approved (${qa.evidencia.length} evidencias)`)
    break
  }

  // Sin fallos demostrados: es un bloqueo, no una reapertura.
  if (qa.fallos.length === 0 && evidenciaFallida.length === 0) {
    log(`QA ronda ${ronda}: sin fallos demostrados pero sin evidencia completa; bloqueada`)
    return {
      estado: 'bloqueada',
      fase: 'QA',
      historia,
      motivo: `QA no pudo verificar la entrega: ${[...qa.bloqueos, ...evidenciaNoOk.map(e => `${e.criterio}: ${e.detalle}`)].join(' | ') || 'dictamen incoherente sin fallos ni bloqueos'}`,
      reaperturas,
      archivos: [...archivos].sort(),
      qa,
      implementacion: historialImplementacion,
      historial_qa: historialQA,
    }
  }

  let fallos = qa.fallos
  if (fallos.length === 0) {
    // QA marcó evidencia en fallo sin detallar fallos: se reabre a todos los implementadores de la historia.
    fallos = evidenciaFallida.flatMap(e => responsablesPorDefecto().map(rol => ({
      escenario: e.criterio,
      pasos: e.comando_o_pasos,
      esperado: 'resultado ok',
      obtenido: e.detalle,
      severidad: 'media',
      responsable_propuesto: rol,
    })))
  }

  reaperturas += 1
  log(`QA ronda ${ronda}: rejected con ${fallos.length} fallo(s). Reapertura ${reaperturas} de ${MAX_REAPERTURAS}`)
  if (reaperturas >= MAX_REAPERTURAS) {
    return {
      estado: 'escalada_humano',
      historia,
      motivo: `QA rechazó la entrega ${reaperturas} veces seguidas. Según el protocolo, la tarea pasa a escalado y no se reasigna automáticamente.`,
      reaperturas,
      archivos: [...archivos].sort(),
      qa,
      implementacion: historialImplementacion,
      historial_qa: historialQA,
      tarea_sprint: req.tarea_sprint,
      siguientes_pasos_humanos: [
        'Revisar los fallos del último reporte de QA y el historial de rechazos.',
        'Decidir si se corrige manualmente, se replantea o divide la historia en PRD.md (con nueva aprobación) o se descartan los cambios del árbol de trabajo (el workflow no hizo commit).',
        `Registrar el escalado en Vikunja${req.tarea_sprint ? ` (${req.tarea_sprint})` : ''} y en sprint_actual.md con el subagente producto (skill planificacion).`,
        'Guardar el reporte en bug_report.md solo si lo confirmas; el repo es público, así que omite detalles explotables de seguridad.',
      ],
    }
  }
  fallosPendientes = fallos
  ronda += 1
}

// ---------- Release ----------

phase('Release')
const release = await agent(`Eres release en la entrega de ${historia} ("${req.titulo}") de lp-arcav-us. QA la aprobó en la ronda ${ronda} tras ${reaperturas} reapertura(s). Prepara el release SIN publicar nada: no hagas commit, push, PR ni merge; no cambies de rama; no ejecutes wrangler deploy ni wrangler secret; no uses gh para escribir. El merge a main despliega a producción (Cloudflare Workers Builds) y requiere aprobación humana explícita.

Archivos de la entrega:
${lista([...archivos].sort(), 'ninguno declarado')}

Escenarios verificados por QA:
${textoEscenarios}

Evidencia de QA:
${qa.evidencia.map(e => `- ${e.criterio} [${e.resultado}] ${e.comando_o_pasos}: ${e.detalle}`).join('\n')}

Notas de integraciones (variables o bindings necesarios):
${notas.integraciones || 'no aplica'}

Pasos:
1. git branch --show-current, git status --short y git diff --stat. Lista en archivos_inesperados los cambios que no estén entre los archivos de la entrega (pueden ser ajenos a la historia) y los artefactos que no deben versionarse.
2. Ejecuta npm run build, python3 scripts/validate_squad.py y python3 -m unittest discover tests -v.
3. Valida wrangler.jsonc y astro.config.mjs: nombre, entrypoint, directorio de assets, compatibilidad, que no haya secretos en vars y que las variables o bindings que la entrega necesita estén declarados o documentados (solo nombres).
4. Si la entrega toca .github/, revisa que el job "validate" con su matriz python-version siga intacto.
5. Propón el PR: título en formato conventional commits que mencione ${historia}; rama_base "main"; rama_origen la rama actual; cuerpo en español con resumen, enlace a la historia en PRD.md, archivos, tabla de los 4 escenarios con su evidencia de QA, variables o bindings que hay que configurar en Cloudflare (solo nombres), riesgos y reversión, y un checklist: build ok, validate_squad ok, tests ok, checks requeridos validate (3.10), validate (3.11) y validate (3.12) en verde, revisión automática de Claude atendida, secretos configurados en Cloudflare, aprobación humana explícita del merge (despliega a producción) y verificación posterior en producción.

listo=true solo si todos los checks están ok y no hay bloqueos; los archivos inesperados no bloquean por sí solos, pero descríbelos.`, {
  agentType: 'release',
  schema: RELEASE_SCHEMA,
  label: `Release ${historia}`,
  phase: 'Release',
})

const qaFinal = {
  dictamen: qa.dictamen,
  revision: qa.revision,
  reaperturas,
  evidencia: qa.evidencia,
  reporte_markdown: qa.reporte_markdown,
  historial: historialQA,
}

if (!release || !release.listo || release.bloqueos.length) {
  const motivo = !release
    ? 'release no devolvió resultado.'
    : [...release.bloqueos, ...release.checks.filter(c => c.resultado !== 'ok').map(c => `${c.comando}: ${c.resultado}. ${c.detalle}`)].join(' | ') || 'release no marcó la entrega como lista.'
  log(`${historia} bloqueada en Release`)
  return {
    estado: 'bloqueada',
    fase: 'Release',
    historia,
    motivo,
    archivos: [...archivos].sort(),
    qa: qaFinal,
    release,
  }
}

log(`${historia} lista para revisión humana`)

const roles = [...new Set(historialImplementacion.map(h => h.rol))]
return {
  estado: 'lista_para_revision_humana',
  historia,
  resumen: `${historia} "${req.titulo}": implementada por ${roles.join(' y ')}; QA approved en la ronda ${ronda} con ${reaperturas} reapertura(s); build y checks de release en verde. Cambios sin commit en el árbol de trabajo.`,
  archivos: [...archivos].sort(),
  archivos_inesperados: release.archivos_inesperados,
  qa: qaFinal,
  release_checks: release.checks,
  pr_propuesto: release.pr_propuesto,
  tarea_sprint: req.tarea_sprint,
  implementacion: historialImplementacion,
  siguientes_pasos_humanos: [
    'Revisar el diff completo (git status y git diff) y descartar cambios ajenos a la historia.',
    `Hacer commit y push de la rama como arcavcwb y crear el PR hacia main con el título y la descripción propuestos, usando GH_TOKEN=$(gh auth token --user arcavcwb) sin cambiar la cuenta activa de gh.`,
    'Esperar los checks requeridos (validate 3.10, 3.11 y 3.12) y la revisión automática de Claude; aprobar y mergear a main solo con aprobación humana explícita: el merge despliega a producción (Cloudflare Workers Builds).',
    `Verificar en producción los 4 escenarios de ${historia} (qa-revisor y humano).`,
    `Actualizar la tarea en Vikunja${req.tarea_sprint ? ` (${req.tarea_sprint})` : ''} y el espejo sprint_actual.md con el subagente producto (skill planificacion, que usa tools/vikunja_sync.py).`,
  ],
}
