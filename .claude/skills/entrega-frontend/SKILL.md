---
name: entrega-frontend
description: Procedimiento del rol frontend para implementar una historia US-xx en la landing Astro 6 (páginas, componentes, layouts, Vanilla CSS con tokens, i18n es/en/pt en src/i18n/translations.ts, responsive, accesibilidad y SEO) y documentar las decisiones visuales que la historia necesite. Úsala al tocar src/pages, src/components, src/layouts, src/styles o src/i18n.
user-invocable: false
---

# Entrega de interfaz (Astro 6 + Cloudflare Workers)

Rol dueño: `frontend`. Escribes en `src/pages/` (excepto `src/pages/api/`),
`src/components/`, `src/layouts/`, `src/styles/`, `src/i18n/translations.ts` y
`public/` cuando la tarea lo asigna. No tocas `src/pages/api/`, contratos de
datos ni `wrangler.jsonc` (son de `integraciones`/`release`): si los necesitas,
pídelo en tu entrega.

## Contexto mínimo (lectura progresiva)

1. La tarea y su historia `US-xx` en `PRD.md` (solo esa sección y sus 4 escenarios).
2. Si consume datos o un endpoint: la entrega de contrato de `integraciones`
   (ruta del archivo de tipos y commit). Sin contrato listo, no implementes la
   parte dependiente.
3. `DESIGN.md` (sistema visual vigente: color, tipografía, layout y
   componentes) y `docs/UX_RESPONSIVE.md` (secciones que apliquen);
   `docs/CONTENT.md`/`docs/BRAND.md` solo para copy.
4. Archivos a modificar y sus dependencias directas: `src/layouts/Layout.astro`,
   `src/styles/global.css` (`:root`), el componente y las páginas
   `src/pages/{es,en,pt}/index.astro` que lo usan.

## Hechos del proyecto que debes respetar

- Astro 6 con `output: 'server'` y adaptador `@astrojs/cloudflare`; las páginas
  `src/pages/{es,en,pt}/index.astro` usan `export const prerender = true`.
  `src/pages/index.astro` es dinámica y redirige según cookie `arcav_lang` y
  `Accept-Language`. Una página prerenderizada no procesa `POST`: los envíos van
  a un endpoint de `integraciones` en `src/pages/api/`.
- i18n: `astro.config.mjs` define `es` (por defecto), `en`, `pt` con
  `prefixDefaultLocale: true`. Los textos viven en `src/i18n/translations.ts`
  (`type Copy` + `translations: Record<Lang, Copy>`); cada página pasa
  `translations.<lang>` a los componentes por props (`copy`).
- `npm run build` **no** hace chequeo de tipos: una clave faltante en `en` o
  `pt` puede compilar y renderizar `undefined`. Verifícalo tú.
- Estilos: Vanilla CSS. Los tokens viven en `:root` de `src/styles/global.css`:
  superficies (`--paper`, `--platform`, `--platform-deep`), tinta (`--ink`,
  `--ink-soft`), líneas de servicio (`--line-landing`, `--line-sistema`,
  `--line-auto`, `--line-today`), acento reservado (`--here`), tipografía
  (`--font-sign`, `--font-text`) y estructura (`--edge`, `--space-1` a
  `--space-9`, `--wrap`, `--gutter`, `--ease-out`). Lee el `:root` antes de usar
  uno: esta lista es orientativa, el archivo manda. Nunca escribas
  `var(--token)` sin haberlo visto definido.
- Las fuentes son woff2 de origen propio en `public/fonts/`, declaradas con
  `@font-face` en `global.css` y precargadas desde `Layout.astro`. No añadas
  Google Fonts ni otro CDN de fuentes.
- Sin Tailwind ni frameworks de UI. No hay integración de React: no añadas
  islas, dependencias ni frameworks sin aprobación humana.

## Procedimiento

1. **Mapea escenarios a UI.** Para cada uno de los 4 escenarios, anota qué vista,
   estado o interacción lo satisface (incluido el estado vacío/carga). Si un
   escenario no tiene especificación visual o de copy, es bloqueo o pregunta
   para `producto`; no inventes comportamiento.
2. **Decisiones visuales (handoff de diseño).** Si la historia pide algo que
   `DESIGN.md` no cubre:
   - Reutiliza tokens y componentes existentes antes de crear nuevos.
   - Un token nuevo va en `:root` de `global.css`, con nombre coherente y uso
     justificado; un ajuste local no merece token global.
   - Declara variantes y estados (hover, foco, deshabilitado, error, carga,
     vacío) y los anchos en que cambian.
   - Referencias de Figma u otras herramientas solo si el humano las aporta; leer
     un diseño no autoriza a modificarlo en remoto. No inventes capturas ni assets.
3. **Texto e i18n.** Todo texto visible o leído por lectores de pantalla va en
   `translations.ts`: títulos, párrafos, botones, `aria-label`, `alt`,
   `placeholder`, mensajes de error/éxito, `metaTitle`/`metaDescription`.
   - Añade la clave al tipo `Copy` y a `es`, `en` y `pt` en el mismo cambio.
   - Si falta el copy aprobado en un idioma, no lo inventes: reporta el bloqueo
     (o usa el texto que `producto` haya aprobado).
   - Nada hardcodeado en componentes o páginas. Si encuentras un literal visible
     en un `.astro` que ya estás tocando, muévelo a `translations.ts`; si está
     fuera del alcance de tu tarea, menciónalo en la entrega sin ampliarlo.
   - Una página nueva existe en los tres idiomas (`src/pages/es|en|pt/...`).
4. **Implementa** con HTML semántico y el mínimo JavaScript de cliente. Usa
   `<script>` de Astro solo cuando la interacción lo exige y la página debe
   seguir siendo comprensible sin JavaScript.
5. **Responsive** (según `docs/UX_RESPONSIVE.md`): recompone por breakpoint
   (móvil `< 768px`, tableta `768–1199px`, escritorio `>= 1200px`); sin scroll
   horizontal en 320, 360, 390 y 430 px; objetivos táctiles de ~44 px; tipografía
   fluida con `clamp()`.
6. **Accesibilidad**: un único `h1` por página y jerarquía de encabezados
   lógica; foco visible; navegación por teclado (Tab, Shift+Tab, Enter, Espacio,
   Escape en menús); `label` asociado a cada campo; errores anunciados
   (`role="alert"` o `aria-live`) y no solo por color; contraste AA; SVG
   decorativos con `aria-hidden="true"`; respeta `prefers-reduced-motion`.
7. **SEO en `<head>`** vía `Layout.astro`: `lang` correcto por página, `title` y
   `description` traducidos, Open Graph. `noindex` solo si la historia lo pide
   de forma explícita (por ejemplo una página de borrador o privada); las
   páginas públicas `/es`, `/en` y `/pt` se indexan. Si la historia pide
   canonical o `hreflang` alternos, usa
   `site: 'https://arcav.us'` y genera las tres URLs; no los añadas fuera de
   alcance.
8. **Verifica** (ver checklist) y entrega.

## Comprobaciones

Ejecuta y registra comando y resultado:

```bash
npm run build     # debe terminar sin errores
npm run preview   # en segundo plano; usa la URL que imprima (4321 si está libre)
B=http://localhost:4321
for l in es en pt; do curl -s -o /dev/null -w "$l %{http_code}\n" "$B/$l/"; done       # 200
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H 'Accept-Language: pt-BR' "$B/"   # 302 -> /pt
for l in es en pt; do curl -s "$B/$l/" | grep -cE '>undefined<|="undefined"'; done      # 0
```

- Paridad i18n: comprueba que cada clave nueva existe en `es`, `en` y `pt`
  (lectura del diff de `translations.ts`, y `npx astro check` solo si
  `@astrojs/check` ya está instalado; no lo instales por tu cuenta).
- Texto hardcodeado: revisa el diff de `.astro` buscando literales visibles,
  `alt=`, `aria-label=` y `placeholder=` que no vengan de `copy`.
- Responsive y teclado: si tienes herramienta de navegador disponible, verifica
  anchos y foco; si no, márcalo como **no ejecutado** (no lo des por bueno).

## Checklist

- [ ] Los 4 escenarios de la historia tienen su estado de UI implementado o un bloqueo declarado.
- [ ] Ningún texto visible hardcodeado; claves en `Copy` y en `es`/`en`/`pt`.
- [ ] Solo tokens de `global.css`; sin colores o fuentes sueltos ni frameworks nuevos.
- [ ] Sin scroll horizontal en 320–430 px; objetivos táctiles ~44 px.
- [ ] Un `h1`, foco visible, labels, `prefers-reduced-motion`, SVG decorativos ocultos.
- [ ] `<head>` con `lang`, título y descripción traducidos.
- [ ] `npm run build` OK y rutas `/es`, `/en`, `/pt` responden en preview.
- [ ] No tocaste `src/pages/api/`, contratos ni `wrangler.jsonc`.

## Formato de salida

Usa `templates/entrega.md` y añade:

```
Tarea / historia: <clave> / US-xx
Resultado: completo | parcial | bloqueado
Archivos modificados: <rutas>
Contrato consumido: <ruta>@<commit> | no aplica (<motivo>)
Escenarios -> implementación: 1 <dónde> | 2 <dónde> | 3 <dónde> | 4 <dónde>
Decisiones visuales: <tokens/variantes nuevos y motivo> | ninguna
i18n: claves nuevas <lista> en es/en/pt | ninguna
Comprobaciones: <comando -> resultado>; no ejecutadas: <lista y motivo>
Pendientes para otros roles: <rol: pedido> | ninguno
```
