---
name: evidencia-qa
description: Procedimiento del rol qa-revisor para verificar un commit candidato de la landing Astro 6 contra los 4 escenarios de una historia US-xx en es/en/pt, ejecutar build, tests y preview, y emitir un dictamen approved, rejected o bloqueado con evidencia en bug_report.md, incluido el control de reaperturas y la verificación en producción. Úsala al revisar una entrega, un diff o un despliegue.
user-invocable: false
---

# QA con evidencia

Rol dueño: `qa-revisor`. Solo escribes `bug_report.md`. No modificas `src/`,
configuración, `PRD.md`, `sprint_actual.md` ni Vikunja: el dictamen lo registra
`producto`. No ejecutas comandos que cambien el árbol o el historial (nada de
`npm install` que altere el lockfile, formateadores con escritura, `git
checkout`, `stash`, `reset`, commit ni push).

## Contexto mínimo (lectura progresiva)

1. Candidato: `git rev-parse --short HEAD`, `git status --porcelain` y
   `git diff --stat main...HEAD`. Si hay cambios sin commit, anótalo: el
   dictamen corresponde a esa revisión exacta y no se reutiliza para otra.
2. La historia en `PRD.md` (solo su sección, con sus 4 escenarios) y la tarea y
   su contador de reaperturas en `sprint_actual.md`.
3. Las entregas recibidas (`templates/entrega.md`): archivos, contratos,
   comprobaciones ya hechas y pendientes declarados.
4. Archivos del diff y sus dependencias directas. Amplía solo por un riesgo
   concreto y anota por qué.
5. Si el diff toca `src/pages/api/`, `.github/`, `wrangler.jsonc`,
   `astro.config.mjs`, `package.json` o `package-lock.json`, aplica también la
   skill `auditoria-seguridad`.

## Procedimiento

### 1. Identifica la ejecución

Clave de ejecución: `US-xx:<commit corto>:<n>` (n = número de ejecución de QA
para ese commit). Anota entorno (build local, preview o producción) y fecha UTC
(`date -u +%Y-%m-%dT%H:%M:%SZ`).

### 2. Comprobaciones base (siempre)

```bash
python3 scripts/validate_squad.py
python3 -m unittest discover tests -v
node --test tests/contact.test.mjs   # unittest no descubre .mjs: esta suite hay que lanzarla aparte
npm run build
```

Registra comando, código de salida y el extracto relevante. Un fallo en
cualquiera es fallo demostrado. Si `node_modules` falta, `npm ci` usa el
lockfile sin modificarlo; si ni eso es posible, es bloqueo de entorno.

### 3. Ejecución en preview

Arranca `npm run preview` en segundo plano y toma la URL que imprima (por
defecto `http://localhost:4321`; si el puerto está ocupado usa otro). Comprueba
al menos:

```bash
B=http://localhost:4321   # la URL real que imprimió preview
W='%{http_code} %{redirect_url}\n'
curl -s -o /dev/null -w "$W" "$B/" -H 'Accept-Language: en-US'                    # 302 -> /en
curl -s -o /dev/null -w "$W" "$B/" -H 'Cookie: arcav_lang=pt' -H 'Accept-Language: en'  # 302 -> /pt (la cookie manda)
curl -s -o /dev/null -w "$W" "$B/"                                                 # 302 -> /es (por defecto)
for l in es en pt; do curl -s -o /dev/null -w "$l %{http_code}\n" "$B/$l/"; done   # 200 (sin barra final responde 307 -> /<l>/)
for l in es en pt; do curl -s "$B/$l/" | grep -o '<html lang="[a-z]*"'; done       # lang correcto
for l in es en pt; do curl -s "$B/$l/" | grep -cE '>undefined<|="undefined"'; done  # 0 esperado (claves i18n faltantes)
```

Para endpoints (`src/pages/api/*`), prueba con `curl -si -X POST ...` los casos
válido, inválido, límite (repetición rápida, honeypot, cuerpo grande) y servicio
no disponible, según el contrato. **Nunca** apuntes a webhooks o servicios
reales; sin un destino de prueba autorizado, ese envío queda **no ejecutado**.

Detén el proceso de preview al terminar.

### 4. Los 4 escenarios, uno a uno

Para cada escenario de la historia (camino feliz, error/validación, caso
límite, estado vacío/carga):

1. Tradúcelo a una comprobación observable, al nivel más directo: respuesta del
   endpoint para reglas de datos, HTML renderizado para contenido y estructura,
   navegador para interacción, foco y responsive.
2. Ejecútala en los idiomas que apliquen (`es`, `en`, `pt`; por defecto los tres
   si hay texto visible).
3. Registra pasos o comando, resultado esperado, observado y evidencia (salida
   recortada, archivo:línea, captura si hay herramienta de navegador).

Si no dispones de herramienta de navegador, lo que requiera interacción,
anchos de pantalla o foco queda **no ejecutado** con ese motivo. No lo apruebes
por lectura de código.

### 5. Reglas del proyecto

- **i18n**: ningún texto visible, `alt`, `aria-label` o `placeholder` literal en
  `.astro` del diff; cada clave nueva del tipo `Copy` existe en `es`, `en` y
  `pt` de `src/i18n/translations.ts` (el build no hace chequeo de tipos). Busca
  `undefined` como texto o valor de atributo en el HTML servido de las tres rutas.
- **Estilos**: Vanilla CSS con tokens de `src/styles/global.css`; sin colores
  sueltos nuevos ni frameworks añadidos.
- **Accesibilidad básica**: un `h1`, jerarquía de encabezados, `label` en campos,
  `lang` correcto, SVG decorativos con `aria-hidden`, `prefers-reduced-motion`.
- **SEO**: `title` y `meta description` traducidos por idioma; `noindex` solo en
  borradores.
- **Seguridad**: aplica `auditoria-seguridad` cuando corresponda (paso 5 del
  contexto) y siempre revisa que el diff no contenga secretos.

### 6. Dictamen

| Resultado | Cuándo |
|---|---|
| `approved` | Los 4 escenarios verificados con evidencia en los idiomas aplicables, comprobaciones base en verde, sin hallazgos de seguridad críticos o altos, sin verificaciones obligatorias pendientes. |
| `rejected` | Al menos un fallo demostrado o un hallazgo de seguridad crítico o alto. Cuenta como reapertura. |
| `bloqueado` | Sin fallo demostrado, pero una verificación obligatoria no pudo ejecutarse (entorno, dato o decisión faltante). No es aprobado ni cuenta como reapertura. Si el consumidor solo admite `approved`/`rejected` (por ejemplo el workflow `entrega-historia`), informa `rejected` sin fallos y con el impedimento en los bloqueos. |

- Cada fallo: ID (`QA-<n>`), severidad (crítica, alta, media, baja), pasos de
  reproducción, esperado, observado, evidencia y responsable propuesto
  (`frontend`, `integraciones` o `release`). Una hipótesis de causa se marca
  como hipótesis.
- "No encontré fallos" sin comandos y resultados no es evidencia.
- **Reaperturas**: indica `n/3` según `sprint_actual.md` más este dictamen si es
  `rejected`. En el 3.er `rejected` de la misma tarea, escribe
  `Escalado: sí — requiere intervención humana` y no propongas reasignación.

### 7. `bug_report.md`

Usa el formato de `templates/bug_report.md`. Añade la ejecución nueva arriba,
conserva el historial anterior y marca claramente el dictamen vigente por
historia y commit. Emite el reporte siempre, también si el resultado es
`approved` o `bloqueado`. Nunca reutilices un `approved` de otro commit.
No incluyas valores de secretos ni datos personales (usa datos de prueba).

### 8. Verificación en producción (tras merge, paso 7 del flujo)

Solo lectura, sobre `https://arcav.us`, identificando el commit de `main`:

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://arcav.us/ -H 'Accept-Language: pt-BR'   # 302 -> /pt
for l in es en pt; do curl -s -o /dev/null -w "$l %{http_code}\n" https://arcav.us/$l/; done
curl -sI https://arcav.us/es/                              # cabeceras de seguridad
```

Comprueba los escenarios de la historia que no envían datos. Enviar formularios
en producción requiere datos y autorización acordados con el humano.

## Checklist

- [ ] Commit candidato y estado del árbol registrados.
- [ ] `validate_squad.py`, `unittest`, `node --test tests/contact.test.mjs` y `npm run build` ejecutados con resultado.
- [ ] Redirección de idioma y rutas `/es`, `/en`, `/pt` comprobadas en preview.
- [ ] Cada uno de los 4 escenarios con comprobación, resultado y evidencia, o no ejecutado con motivo.
- [ ] i18n sin textos hardcodeados ni claves faltantes; sin `undefined` en HTML.
- [ ] Seguridad revisada (secretos siempre; auditoría completa si el diff lo exige).
- [ ] Dictamen justificado; reaperturas `n/3` y escalado si corresponde.
- [ ] `bug_report.md` actualizado con historial y dictamen vigente identificado.

## Formato de salida

Usa `templates/entrega.md` y añade:

```
Clave de ejecución: US-xx:<commit>:<n>
Dictamen: approved | rejected | bloqueado
Escenarios: 1 <ok | fallo QA-1 | no ejecutado (motivo)> | 2 ... | 3 ... | 4 ...
Comprobaciones base: validate <ok|fallo> | unittest <ok|fallo> | node --test contact <ok|fallo> | build <ok|fallo>
Seguridad: sin hallazgos | <severidad: resumen>
Reapertura: n/3 | Escalado: sí/no
Siguiente rol propuesto: release | <responsable del fallo> | humano (escalado o bloqueo)
Referencia: bug_report.md (ejecución US-xx:<commit>:<n>)
```
