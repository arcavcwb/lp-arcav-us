# UX, responsive, accesibilidad y rendimiento

Reglas transversales que toda pantalla debe cumplir, independientes de la
composición de cada sección.

La composición por sección (bandas, mapa de red, tracks, journey, nameboard,
pie) y los breakpoints reales de la build están en `DESIGN.md`, en la raíz:
secciones «Layout» y «Do's and Don'ts». Los tokens implementados, en el `:root`
de `src/styles/global.css`. Si esas fuentes y este documento se contradicen,
prevalecen `DESIGN.md` y el código, y hay que corregir este archivo.

## Principio

No encojas el diseño de escritorio: recompón la experiencia por breakpoint.
Las listas y rutas horizontales se vuelven verticales en pantallas estrechas;
no se convierten en carruseles ni se reducen a puntos.

## Requisitos responsive

- Sin desbordamiento horizontal a 320, 360, 390 y 430 px.
- Objetivos táctiles de al menos 44 px.
- Tipografía fluida con `clamp()` donde aplique.
- Jerarquía preservada en tablet: dos columnas solo mientras el texto siga
  siendo cómodo; si no, apila.
- Menú accesible en móvil, con foco y cierre por teclado.

## Accesibilidad

Obligatorio:

- HTML semántico y landmarks.
- Un solo `h1` por página y jerarquía de encabezados lógica.
- Navegación completa por teclado y foco visible.
- Etiquetas asociadas a cada campo; errores anunciados
  (`aria-live`, `aria-invalid`, `aria-describedby`).
- Contraste suficiente; ningún estado comunicado solo por color.
- SVG decorativos ocultos a lectores de pantalla; los informativos con
  alternativa textual.
- `lang` correcto por idioma y todo texto visible desde
  `src/i18n/translations.ts` en `es`, `en` y `pt`.
- Respeta `prefers-reduced-motion`: con movimiento reducido se muestra el
  estado final, no la animación.

## Rendimiento

Prefiere renderizado nativo de Astro, CSS, SVG, JavaScript de cliente mínimo e
imágenes responsive. Evita librerías de mapas, frameworks de animación, vídeo
de fondo, hidratación innecesaria y assets de imagen enormes. La página debe
seguir siendo comprensible y navegable sin JavaScript siempre que sea posible.

## Movimiento

El movimiento comunica estructura: trazado de rutas, activación de nodos,
conexiones del diagrama, revelado sutil de secciones y microinteracciones de
botones y enlaces.

Evita: secuestro del scroll, rebotes, seguidores de cursor, parallax excesivo,
movimiento 3D grande y cualquier animación que retrase la lectura o la
navegación.
