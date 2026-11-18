export const meta = {
  name: 'revision-proyecto',
  description: 'Revisión multidimensión del proyecto (corrección, i18n, SEO/accesibilidad/responsive, seguridad, rendimiento y coherencia) con comprobaciones reales, verificación adversarial e informe con el formato de bug_report.md, sin modificar el repositorio',
  whenToUse: 'Auditar el estado del proyecto antes de un release o tras cambios grandes. Args opcionales: {foco, rutas} o un texto de foco (por ejemplo "seguridad" o "formulario de contacto"). Se lanza con /revisar-proyecto.',
  phases: [
    { title: 'Comprobar', detail: 'build, validate_squad, tests y captura del preview, una sola vez' },
    { title: 'Revisar', detail: 'un qa-revisor por dimensión' },
    { title: 'Verificar', detail: '2 refutadores independientes por hallazgo' },
    { title: 'Sintetizar', detail: 'informe en español con el formato de templates/bug_report.md' },
  ],
}

// Regla de verificación (se devuelve también en el resultado):
// - Cada hallazgo pasa por 2 refutadores independientes con enfoques distintos
//   (reproducción y contexto).
// - Severidad media o baja: se confirma si al menos 1 de 2 no lo refuta.
// - Severidad alta: se confirma como alta solo si 2 de 2 no lo refutan. Con 1 de 2
//   se conserva rebajada a media y marcada como confirmación parcial (no se descarta
//   en silencio). Con 0 de 2 se descarta.
// - Un refutador que falla no cuenta como voto. Sin votos válidos, el hallazgo queda
//   como no verificado y se informa aparte.
// - Solo se verifican los MAX_HALLAZGOS_POR_DIMENSION más graves de cada dimensión;
//   el resto se registra y se informa como no verificado por límite.

const MAX_HALLAZGOS_POR_DIMENSION = 8
const ORDEN_SEVERIDAD = { alta: 0, media: 1, baja: 2 }
const REGLA_VERIFICACION = 'Media o baja: confirmado con al menos 1 de 2 refutadores que no lo refutan. Alta: confirmado como alta con 2 de 2; con 1 de 2 se conserva rebajado a media como confirmación parcial; con 0 de 2 se descarta. Refutadores fallidos no cuentan; sin votos válidos queda como no verificado.'

// ---------- Entrada ----------

function normalizarArgs(a) {
  if (a === undefined || a === null) return { foco: '', rutas: [] }
  if (typeof a === 'string') {
    const texto = a.trim()
    if (texto.startsWith('{')) {
      try {
        return normalizarArgs(JSON.parse(texto))
      } catch (e) {
        // no es JSON: se trata como texto de foco
      }
    }
    return { foco: texto, rutas: [] }
  }
  if (Array.isArray(a)) return { foco: '', rutas: a.map(String) }
  if (typeof a === 'object') {
    let rutas = []
    if (Array.isArray(a.rutas)) rutas = a.rutas.map(String).filter(r => r.trim())
    else if (typeof a.rutas === 'string' && a.rutas.trim()) rutas = [a.rutas.trim()]
    return { foco: typeof a.foco === 'string' ? a.foco.trim() : '', rutas }
  }
  return { foco: String(a), rutas: [] }
}

const REGLAS_REVISION = `Reglas comunes:
- Solo lectura: no edites, crees ni borres archivos del repositorio. Usa temporales fuera del repo.
- No ejecutes "npm run build" ni "npm install": el build ya se hizo en la fase Comprobar y otros agentes leen dist/ en paralelo. Si necesitas el sitio en vivo, levanta tu propio "npm run preview -- --host 127.0.0.1 --port <puerto libre>" y detenlo al terminar (sin procesos colgados).
- No leas ni imprimas .env, .env.* ni .dev.vars (.env.example sí). Si encuentras un posible secreto, enmascáralo (primeros 4 caracteres y ***).
- No llames a servicios reales (Vikunja, GitHub con escritura, n8n, wrangler deploy o secret).
- Cero asunción: cada hallazgo necesita evidencia propia (archivo y línea leídos, salida de un comando o captura). Lo que no puedas verificar va a limitaciones, no a hallazgos.
- Lectura progresiva: empieza por los archivos del alcance y amplía solo si hace falta.
- Severidad: alta = rompe una ruta o funcionalidad, expone datos o secretos, o incumple un criterio de aceptación del PRD; media = defecto visible o riesgo concreto de impacto acotado; baja = mejora o deuda menor.
- Reporta como máximo ${MAX_HALLAZGOS_POR_DIMENSION} hallazgos, los más graves primero. Si dejas fuera otros, dilo en limitaciones.
- En archivo usa rutas relativas a la raíz del repo; en linea, la línea 1-indexada o 0 si no aplica.
- En comprobaciones_ejecutadas lista cada comando o paso con su resultado resumido.`

const DIMENSIONES = [
  {
    id: 'correccion',
    titulo: 'Corrección (Astro, TypeScript, rutas y redirecciones)',
    alias: ['correccion', 'redirecciones', 'redirects'],
    foco: `Revisa:
- src/pages: la raíz "/" (detección de idioma y redirección), /es, /en y /pt, 404 y rutas inexistentes; coherencia con i18n.routing de astro.config.mjs (prefixDefaultLocale) y con "prerender" por página frente a output "server".
- Códigos HTTP y cabecera Location en las capturas de la fase Comprobar: redirecciones, bucles, destinos inexistentes y barra final.
- Errores o advertencias del build; props y tipos incorrectos en componentes y layouts; importaciones rotas; enlaces y anclas internas que no existen; lógica de servidor (por ejemplo, manejo de POST en componentes) con ramas incorrectas.
- wrangler.jsonc y astro.config.mjs: entrypoint, directorio de assets y compatibilidad coherentes con @astrojs/cloudflare.
Comprobaciones sugeridas: salida del build y capturas; "npx astro check" solo si ya está instalado (no instales nada); curl -sI sobre tu propio preview para rutas adicionales.`,
  },
  {
    id: 'i18n',
    titulo: 'i18n (es, en, pt)',
    alias: ['i18n', 'idiomas', 'idioma', 'traducciones'],
    foco: `Revisa:
- Texto visible hardcodeado en src/components, src/layouts y src/pages (nodos de texto, alt, aria-label, title, placeholder, textos de botones, mensajes de validación, error o éxito, title y meta description) en lugar de salir de src/i18n/translations.ts.
- Paridad de claves entre es, en y pt en src/i18n/translations.ts: claves faltantes, vacías, sin traducir (idénticas al español cuando no corresponde) o con marcadores distintos.
- Atributo lang de <html> por idioma, hreflang, selector de idioma que apunte a la ruta equivalente y comportamiento cuando falta una clave.
- Coherencia entre la detección de idioma en "/" y las rutas /es, /en y /pt.
Comprobaciones sugeridas: grep sobre los .astro; un script node o python3 de solo lectura para comparar claves; HTML capturado de /es/, /en/ y /pt/ buscando texto en otro idioma.`,
  },
  {
    id: 'seo-accesibilidad-responsive',
    titulo: 'SEO, accesibilidad y responsive',
    alias: ['seo', 'accesibilidad', 'a11y', 'responsive', 'seo-accesibilidad-responsive'],
    foco: `Revisa:
- <head> por idioma en el HTML capturado: title y meta description únicos y traducidos, canonical, hreflang (incluido x-default), Open Graph y Twitter, robots, favicon, sitemap y robots.txt.
- Accesibilidad: jerarquía de encabezados (un h1 por página), landmarks, alt de imágenes, labels asociados a los campos del formulario, errores anunciados (aria-live, aria-invalid, aria-describedby), foco visible, navegación por teclado del menú, contraste de los tokens de color de DESIGN.md y src/styles/global.css en texto y botones, prefers-reduced-motion en animaciones.
- Responsive según docs/UX_RESPONSIVE.md: media queries, desbordes horizontales a 320-375 px, tamaños táctiles mínimos, imágenes sin dimensiones (CLS), tipografía fluida.
Comprobaciones sugeridas: HTML capturado; grep en src/styles y en los <style> de los componentes; cálculo de contraste con los valores de los tokens.`,
  },
  {
    id: 'seguridad',
    titulo: 'Seguridad',
    alias: ['seguridad', 'security', 'secretos'],
    foco: `El repositorio de GitHub es PÚBLICO: todo lo versionado, incluido el historial, es visible.
Revisa:
- Secretos o datos sensibles en archivos versionados (git ls-files) y en el historial reciente (por ejemplo, git log -p -n 30 filtrado con grep por patrones de tokens, claves, contraseñas, URLs de webhooks y correos personales). .gitignore debe cubrir .env, .env.* y .dev.vars; .env.example solo con valores ficticios. Nunca imprimas un secreto completo.
- CI en .github/workflows: permisos mínimos, pull_request_target o ejecución de código de forks con acceso a secretos, acciones de terceros sin fijar a SHA, datos de github.event interpolados directamente en pasos run, tokens expuestos en logs y configuración de la revisión automática de Claude en PRs.
- Formulario de contacto y endpoints (src/pages/api/contact.ts, src/lib/contact.ts, src/lib/contact-server.ts y src/components/Contact.astro): validación en servidor, límites de tamaño, rate limiting, protección de origen (security.checkOrigin de Astro o equivalente), honeypot, que la URL del webhook de n8n no llegue al cliente, errores sin detalles internos y registros (console.log) con datos personales.
- Cabeceras HTTP en las capturas: Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, frame-ancestors o X-Frame-Options, Permissions-Policy y Strict-Transport-Security; public/_headers o middleware si existen.
- tools/ y scripts/: tokens solo por entorno, sin imprimirlos, y llamadas de red controladas.
No hagas pruebas destructivas: limita las pruebas dinámicas al preview local.`,
  },
  {
    id: 'rendimiento',
    titulo: 'Rendimiento',
    alias: ['rendimiento', 'performance', 'velocidad'],
    foco: `Revisa:
- Peso del build en dist/: JS y CSS enviados al cliente (listado de dist/_astro), scripts de hidratación innecesarios, CSS duplicado o sin usar.
- Fuentes: carga bloqueante, preconnect, font-display, número de familias y pesos.
- Imágenes: formato, dimensiones, lazy loading, uso de astro:assets, archivos grandes en public/.
- Render en servidor frente a prerender: páginas que podrían ser estáticas pero se generan en cada petición.
- Animaciones y efectos costosos (filter: blur grandes, sombras animadas, will-change permanente) y su impacto en móviles.
- Cabeceras de caché de los assets en las capturas.
Comprobaciones sugeridas: du -a dist | sort -n; curl con -w "%{time_total} %{size_download}" sobre tu propio preview; grep de directivas client: y <script> en src.`,
  },
  {
    id: 'coherencia',
    titulo: 'Coherencia entre documentación, flujo y código',
    alias: ['coherencia', 'documentacion'],
    foco: `Revisa:
- CLAUDE.md, README.md, docs/protocolo.md y el resto de docs/ frente al código y la configuración reales: comandos que no existen, rutas o archivos inexistentes y referencias a herramientas retiradas (agy, Antigravity, Codex, Plane, Gemini, .agents/, AGENTS.md).
- config/skills.json frente a .claude/agents/*.md (frontmatter skills), .claude/skills/*/SKILL.md y .claude/workflows/*.js; salida de python3 scripts/validate_squad.py y de los tests en la fase Comprobar.
- PRD.md: estado y aprobación humana registrada; para cada historia US-xx que parezca implementada en src/, contrasta sus 4 escenarios con el código (por ejemplo, validación, rate limiting o estado de carga del formulario) y reporta cada criterio incumplido como hallazgo.
- sprint_actual.md frente a PRD.md y al código (historias marcadas como hechas sin implementación o al revés). No consultes Vikunja.
- .github/workflows: nombres de jobs y checks requeridos coherentes con la documentación.`,
  },
]

function sinAcentos(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

const entrada = normalizarArgs(args)
const tokensFoco = sinAcentos(entrada.foco).split(/[\s,;]+/).filter(Boolean)
const dimensionesPedidas = DIMENSIONES.filter(d => d.alias.some(al => tokensFoco.includes(al)))
const seleccionadas = dimensionesPedidas.length ? dimensionesPedidas : DIMENSIONES
const omitidas = DIMENSIONES.filter(d => !seleccionadas.includes(d)).map(d => d.id)
const focoSoloDimensiones = dimensionesPedidas.length > 0 &&
  tokensFoco.every(t => DIMENSIONES.some(d => d.alias.includes(t)))
const focoTexto = focoSoloDimensiones ? '' : entrada.foco

if (omitidas.length) {
  log(`Dimensiones seleccionadas por el foco: ${seleccionadas.map(d => d.id).join(', ')}. Omitidas: ${omitidas.join(', ')}`)
} else {
  log(`Revisión de ${seleccionadas.length} dimensiones${focoTexto ? ` con foco "${focoTexto}"` : ''}`)
}
if (entrada.rutas.length) log(`Alcance limitado a: ${entrada.rutas.join(', ')}`)

// ---------- Esquemas ----------

const BASE_SCHEMA = {
  type: 'object',
  required: ['revision', 'cambios_sin_commit', 'fecha_utc', 'entorno', 'directorio_evidencia', 'comprobaciones', 'rutas', 'limitaciones'],
  properties: {
    revision: { type: 'string', description: 'Salida de git rev-parse HEAD' },
    cambios_sin_commit: { type: 'integer', minimum: 0 },
    fecha_utc: { type: 'string' },
    entorno: { type: 'string', description: 'Versiones de node, npm y python3, y sistema' },
    directorio_evidencia: { type: 'string', description: 'Directorio temporal fuera del repo con salidas, cabeceras y HTML capturados; cadena vacía si no se pudo crear' },
    comprobaciones: {
      type: 'array',
      items: {
        type: 'object',
        required: ['nombre', 'comando', 'resultado', 'resumen'],
        properties: {
          nombre: { type: 'string' },
          comando: { type: 'string' },
          resultado: { type: 'string', enum: ['ok', 'fallo', 'no_ejecutado'] },
          resumen: { type: 'string' },
        },
      },
    },
    rutas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['ruta', 'estado_http', 'notas'],
        properties: {
          ruta: { type: 'string' },
          estado_http: { type: 'integer', description: '0 si no se obtuvo respuesta' },
          notas: { type: 'string', description: 'Location, tipo de contenido o archivo capturado' },
        },
      },
    },
    limitaciones: { type: 'string' },
  },
}

const HALLAZGOS_SCHEMA = {
  type: 'object',
  required: ['hallazgos', 'comprobaciones_ejecutadas', 'limitaciones'],
  properties: {
    hallazgos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['archivo', 'linea', 'severidad', 'categoria', 'resumen', 'escenario_de_fallo', 'evidencia'],
        properties: {
          archivo: { type: 'string' },
          linea: { type: 'integer', minimum: 0 },
          severidad: { type: 'string', enum: ['alta', 'media', 'baja'] },
          categoria: { type: 'string' },
          resumen: { type: 'string' },
          escenario_de_fallo: { type: 'string' },
          evidencia: { type: 'string' },
        },
      },
    },
    comprobaciones_ejecutadas: { type: 'array', items: { type: 'string' } },
    limitaciones: { type: 'string' },
  },
}

const VEREDICTO_SCHEMA = {
  type: 'object',
  required: ['refutado', 'razon'],
  properties: {
    refutado: { type: 'boolean' },
    razon: { type: 'string' },
  },
}

const INFORME_SCHEMA = {
  type: 'object',
  required: ['informe_markdown'],
  properties: {
    informe_markdown: { type: 'string' },
  },
}

// ---------- Comprobar ----------

phase('Comprobar')
const base = await agent(`Eres la fase de comprobaciones base de una revisión del proyecto lp-arcav-us (landing Astro 6 + Cloudflare Workers, es/en/pt). Ejecuta las comprobaciones pesadas UNA sola vez para que las revisiones por dimensión trabajen sobre el mismo build sin reconstruir en paralelo.

Reglas:
- No modifiques archivos versionados. Solo se admiten los artefactos ignorados del build (dist/, .astro/, .wrangler/) y temporales fuera del repo.
- No instales ni actualices dependencias. Si falta node_modules, anótalo en limitaciones.
- No leas ni imprimas .env, .env.* ni .dev.vars (.env.example sí). No llames a servicios reales (Vikunja, GitHub con escritura, n8n, wrangler deploy o secret).

Pasos:
1. Registra git rev-parse HEAD, el número de líneas de git status --short, date -u +%Y-%m-%dT%H:%M:%SZ y las versiones de node, npm y python3.
2. Crea un directorio temporal fuera del repo (tu scratchpad si lo tienes; si no, mktemp -d) para la evidencia.
3. Ejecuta y guarda la salida completa en ese directorio: npm run build; python3 scripts/validate_squad.py; python3 -m unittest discover tests -v.
4. Si el build terminó bien: busca un puerto libre (por ejemplo, python3 -c "import socket; s=socket.socket(); s.bind(('127.0.0.1',0)); print(s.getsockname()[1])"), levanta npm run preview -- --host 127.0.0.1 --port <puerto> en segundo plano, guarda su PID y espera a que responda (reintentos con curl, máximo unos 60 s).
5. Captura con curl, sin seguir redirecciones, cabeceras (-D) y cuerpo (-o) de al menos: /, / con Accept-Language: en, / con Accept-Language: pt-BR, /es, /es/, /en/, /pt/, una ruta inexistente y un CSS o JS de dist/_astro. Añade las demás páginas que existan en src/pages. Usa nombres de archivo descriptivos.
6. Detén el preview (el proceso y sus hijos) y confirma que el puerto quedó libre.

Devuelve la revisión, los cambios sin commit, la fecha, el entorno, el directorio de evidencia, cada comprobación (ok, fallo o no_ejecutado, con un resumen que incluya los errores textuales relevantes), el estado HTTP de cada ruta capturada y las limitaciones.`, {
  agentType: 'qa-revisor',
  schema: BASE_SCHEMA,
  label: 'Comprobaciones base',
  phase: 'Comprobar',
})

if (base) {
  const fallidas = base.comprobaciones.filter(c => c.resultado !== 'ok').map(c => `${c.nombre} (${c.resultado})`)
  log(`Comprobaciones base: ${base.comprobaciones.length - fallidas.length}/${base.comprobaciones.length} ok${fallidas.length ? `; no ok: ${fallidas.join(', ')}` : ''}`)
} else {
  log('Las comprobaciones base no devolvieron resultado: las dimensiones revisarán de forma estática')
}

function contextoBase() {
  if (!base) {
    return 'Comprobaciones base no disponibles (el agente de la fase Comprobar falló). No reconstruyas el proyecto: revisa de forma estática y anota la limitación.'
  }
  return [
    `Revisión: ${base.revision} (${base.cambios_sin_commit} cambios sin commit). Fecha UTC: ${base.fecha_utc}. Entorno: ${base.entorno}.`,
    `Evidencia capturada (salidas, cabeceras y HTML del preview): ${base.directorio_evidencia || 'no disponible'}`,
    'Comprobaciones base:',
    ...base.comprobaciones.map(c => `- ${c.nombre} [${c.resultado}] ${c.comando}: ${c.resumen}`),
    'Rutas capturadas:',
    ...(base.rutas.length ? base.rutas.map(r => `- ${r.ruta} -> ${r.estado_http}. ${r.notas}`) : ['- ninguna']),
    base.limitaciones ? `Limitaciones de la fase Comprobar: ${base.limitaciones}` : '',
  ].filter(Boolean).join('\n')
}

function contextoAlcance() {
  const partes = []
  if (focoTexto) partes.push(`Foco indicado por el usuario: "${focoTexto}". Priorízalo, sin ignorar problemas de severidad alta fuera de él.`)
  if (entrada.rutas.length) partes.push(`Alcance: limita los hallazgos a estas rutas y a lo que las afecte directamente: ${entrada.rutas.join(', ')}.`)
  return partes.join('\n')
}

function promptDimension(dim) {
  return `Revisa el proyecto lp-arcav-us (landing Astro 6 + Cloudflare Workers, es/en/pt) en la dimensión: ${dim.titulo}.

${dim.foco}

${contextoAlcance()}

Contexto de la fase Comprobar:
${contextoBase()}

${REGLAS_REVISION}`
}

// ---------- Revisar + Verificar ----------

const LENTES = [
  {
    id: 'reproduccion',
    texto: 'Intenta reproducir el escenario de fallo por tu cuenta: lee el archivo y la línea actuales, ejecuta el comando o la petición que lo demostraría (con tu propio preview en un puerto libre si hace falta) y comprueba si lo observado coincide con lo descrito.',
  },
  {
    id: 'contexto',
    texto: 'Busca contexto que invalide el hallazgo: configuración (astro.config.mjs, wrangler.jsonc, middleware, cabeceras), código que ya lo mitigue en otra capa, decisiones registradas en PRD.md o docs/ que lo hagan intencional, o un impacto real inexistente.',
  },
]

function ordenarPorSeveridad(lista) {
  return lista.slice().sort((a, b) => ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad])
}

function promptRefutador(h, dim, lente) {
  return `Eres un verificador adversarial de una revisión del proyecto lp-arcav-us. Tu objetivo es REFUTAR este hallazgo de la dimensión "${dim.titulo}".

Enfoque: ${lente.texto}

Hallazgo:
${JSON.stringify(h, null, 2)}

Contexto de la fase Comprobar:
${contextoBase()}

Reglas: solo lectura (no edites archivos del repo); no ejecutes npm run build ni npm install; no leas .env, .env.* ni .dev.vars; no llames a servicios reales; detén cualquier preview que levantes.

Responde refutado=true si el hallazgo es falso, no se sostiene con el código actual, ya está mitigado, es intencional y está documentado, o no logras confirmarlo con evidencia propia. Responde refutado=false solo si confirmaste el escenario de fallo. En razon, cita la evidencia concreta (archivo:línea, comando y salida) en 1 a 4 frases; si el problema existe pero la severidad está exagerada, responde refutado=false y dilo en razon.`
}

function decidir(h, dim, votos) {
  const validos = votos
    .map((v, i) => (v ? { lente: LENTES[i].id, refutado: v.refutado, razon: v.razon } : null))
    .filter(Boolean)
  const noRefutados = validos.filter(v => !v.refutado).length
  const registro = { dimension: dim.id, ...h, votos: validos }
  if (validos.length === 0) return { estado: 'no_verificado', hallazgo: registro }
  if (h.severidad === 'alta') {
    if (noRefutados === 2) return { estado: 'confirmado', hallazgo: { ...registro, confirmacion: 'completa' } }
    if (noRefutados === 1) {
      return {
        estado: 'confirmado',
        hallazgo: { ...registro, severidad: 'media', severidad_original: 'alta', confirmacion: 'parcial' },
      }
    }
    return { estado: 'descartado', hallazgo: registro }
  }
  if (noRefutados >= 1) {
    return { estado: 'confirmado', hallazgo: { ...registro, confirmacion: noRefutados === validos.length ? 'completa' : 'parcial' } }
  }
  return { estado: 'descartado', hallazgo: registro }
}

phase('Revisar')
const porDimension = await pipeline(
  seleccionadas,
  dim => agent(promptDimension(dim), {
    agentType: 'qa-revisor',
    schema: HALLAZGOS_SCHEMA,
    label: `Revisar ${dim.id}`,
    phase: 'Revisar',
  }),
  async (revision, dim) => {
    if (!revision) {
      log(`${dim.id}: la revisión no devolvió resultado`)
      return { dimension: dim.id, fallida: true, comprobaciones: [], limitaciones: 'La revisión de esta dimensión falló.', confirmados: [], descartados: [], no_verificados: [], sin_verificar_por_limite: [] }
    }
    const hallazgos = ordenarPorSeveridad(revision.hallazgos)
    const aVerificar = hallazgos.slice(0, MAX_HALLAZGOS_POR_DIMENSION)
    const recortados = hallazgos.slice(MAX_HALLAZGOS_POR_DIMENSION).map(h => ({ dimension: dim.id, ...h }))
    log(`${dim.id}: ${hallazgos.length} hallazgos${recortados.length ? ` (${recortados.length} quedan sin verificar por el límite de ${MAX_HALLAZGOS_POR_DIMENSION})` : ''}`)

    const decisiones = aVerificar.length
      ? await pipeline(aVerificar, (h, _original, i) =>
          parallel(LENTES.map(lente => () =>
            agent(promptRefutador(h, dim, lente), {
              agentType: 'qa-revisor',
              schema: VEREDICTO_SCHEMA,
              label: `Refutar ${dim.id} #${i + 1} (${lente.id})`,
              phase: 'Verificar',
            }),
          )).then(votos => decidir(h, dim, votos)),
        )
      : []

    const validas = decisiones.filter(Boolean)
    const confirmados = validas.filter(d => d.estado === 'confirmado').map(d => d.hallazgo)
    const descartados = validas.filter(d => d.estado === 'descartado').map(d => d.hallazgo)
    const noVerificados = validas.filter(d => d.estado === 'no_verificado').map(d => d.hallazgo)
    const perdidos = aVerificar.length - validas.length
    if (hallazgos.length) {
      log(`${dim.id}: ${confirmados.length} confirmados, ${descartados.length} descartados, ${noVerificados.length + perdidos} sin verificar`)
    }
    return {
      dimension: dim.id,
      fallida: false,
      comprobaciones: revision.comprobaciones_ejecutadas,
      limitaciones: revision.limitaciones,
      confirmados,
      descartados,
      no_verificados: noVerificados,
      sin_verificar_por_limite: recortados,
    }
  },
)

const dimensiones = porDimension.filter(Boolean)
const confirmados = ordenarPorSeveridad(dimensiones.flatMap(d => d.confirmados))
  .map((h, i) => ({ id: `RP-${String(i + 1).padStart(2, '0')}`, ...h }))
const descartados = dimensiones.flatMap(d => d.descartados)
const noVerificados = dimensiones.flatMap(d => d.no_verificados)
const sinVerificarPorLimite = dimensiones.flatMap(d => d.sin_verificar_por_limite)
const dimensionesFallidas = seleccionadas
  .map(d => d.id)
  .filter(id => !dimensiones.some(r => r.dimension === id && !r.fallida))

const conteo = { alta: 0, media: 0, baja: 0 }
confirmados.forEach(h => { conteo[h.severidad] += 1 })
log(`Total: ${confirmados.length} confirmados (alta ${conteo.alta}, media ${conteo.media}, baja ${conteo.baja}), ${descartados.length} descartados, ${noVerificados.length + sinVerificarPorLimite.length} sin verificar${dimensionesFallidas.length ? `; dimensiones fallidas: ${dimensionesFallidas.join(', ')}` : ''}`)

// ---------- Sintetizar ----------

phase('Sintetizar')

function resumenDescartado(h) {
  return { dimension: h.dimension, archivo: h.archivo, linea: h.linea, severidad: h.severidad, resumen: h.resumen, razones: h.votos.map(v => `${v.lente}: ${v.razon}`) }
}

const sintesis = await agent(`Redacta en español (tuteo, conciso) el informe final de la revisión del proyecto lp-arcav-us con el formato de templates/bug_report.md. Lee esa plantilla antes de escribir. NO escribas ni modifiques ningún archivo: devuelve el markdown en informe_markdown.

Estructura obligatoria:
- Cabecera de la plantilla: Resultado, Motivo, ID de ejecución ("revision-proyecto <fecha UTC> <hash corto>"), Ticket e historia ("no aplica: revisión del proyecto", más el foco si lo hay), Revisión exacta del producto (hash y cambios sin commit), Revisión de los tests (la misma), Entorno y fecha UTC, Responsable ("qa-revisor, workflow revision-proyecto").
- "Cobertura y evidencia": tabla con una fila por comprobación base y por dimensión revisada (criterio, comandos o pasos, resultado, evidencia).
- "Fallos": los hallazgos confirmados en el orden recibido (ya ordenados por severidad), con su ID, severidad (indica "rebajada desde alta, confirmación parcial" cuando corresponda), archivo:línea, reproducción (escenario de fallo), esperado frente a observado, evidencia, estado "abierto" y responsable propuesto (frontend, integraciones, release o producto, según el archivo afectado).
- "Verificaciones pendientes": hallazgos no verificados, los que quedaron sin verificar por límite, dimensiones omitidas o fallidas y limitaciones de cada dimensión.
- "Dictamen": rechazado si hay al menos un confirmado de severidad alta o si build, validate_squad o tests fallaron; bloqueado si las comprobaciones base no se pudieron ejecutar; aprobado con observaciones en otro caso. Justifícalo en 2 a 4 frases.
- "Anexo: descartados en la verificación": tabla breve (dimensión, archivo:línea, resumen, razón principal).
Regla de verificación aplicada: ${REGLA_VERIFICACION}
El repositorio es público: en hallazgos de seguridad describe el vector de forma conceptual, sin secretos ni pasos de explotación detallados. No añadas hallazgos nuevos ni cambies severidades.

Contexto de la fase Comprobar:
${contextoBase()}

Foco: ${focoTexto || 'ninguno'}. Rutas: ${entrada.rutas.length ? entrada.rutas.join(', ') : 'todo el proyecto'}.
Dimensiones revisadas: ${seleccionadas.map(d => d.id).join(', ')}. Omitidas por el foco: ${omitidas.join(', ') || 'ninguna'}. Fallidas: ${dimensionesFallidas.join(', ') || 'ninguna'}.

Comprobaciones y limitaciones por dimensión:
${JSON.stringify(dimensiones.map(d => ({ dimension: d.dimension, comprobaciones: d.comprobaciones, limitaciones: d.limitaciones })), null, 2)}

Hallazgos confirmados:
${JSON.stringify(confirmados, null, 2)}

No verificados (refutadores fallidos):
${JSON.stringify(noVerificados, null, 2)}

Sin verificar por límite:
${JSON.stringify(sinVerificarPorLimite, null, 2)}

Descartados:
${JSON.stringify(descartados.map(resumenDescartado), null, 2)}`, {
  agentType: 'qa-revisor',
  schema: INFORME_SCHEMA,
  label: 'Informe',
  phase: 'Sintetizar',
})

function informeDeRespaldo() {
  const lineas = [
    '# Reporte de QA',
    '',
    `Resultado: ${!base ? 'bloqueado' : conteo.alta > 0 ? 'rechazado' : 'aprobado con observaciones'}`,
    'Motivo: informe generado sin el agente de síntesis (falló); revisa los datos estructurados.',
    `Revisión exacta del producto: ${base ? `${base.revision} (${base.cambios_sin_commit} cambios sin commit)` : 'no disponible'}`,
    '',
    '## Fallos',
    '',
    ...confirmados.map(h => `- ${h.id} [${h.severidad}] ${h.archivo}:${h.linea} — ${h.resumen}. Escenario: ${h.escenario_de_fallo}. Evidencia: ${h.evidencia}`),
    '',
    '## Verificaciones pendientes',
    '',
    `- No verificados: ${noVerificados.length}. Sin verificar por límite: ${sinVerificarPorLimite.length}. Dimensiones fallidas: ${dimensionesFallidas.join(', ') || 'ninguna'}.`,
  ]
  return lineas.join('\n')
}

if (!sintesis) log('La síntesis falló: se devuelve un informe de respaldo generado a partir de los datos')

return {
  informe_markdown: sintesis ? sintesis.informe_markdown : informeDeRespaldo(),
  hallazgos_confirmados: confirmados,
  descartados,
  no_verificados: noVerificados,
  sin_verificar_por_limite: sinVerificarPorLimite,
  resumen: {
    dimensiones_revisadas: seleccionadas.map(d => d.id),
    dimensiones_omitidas: omitidas,
    dimensiones_fallidas: dimensionesFallidas,
    confirmados_por_severidad: conteo,
    descartados: descartados.length,
    no_verificados: noVerificados.length,
    sin_verificar_por_limite: sinVerificarPorLimite.length,
    revision: base ? base.revision : null,
    fecha_utc: base ? base.fecha_utc : null,
  },
  regla_verificacion: REGLA_VERIFICACION,
}
