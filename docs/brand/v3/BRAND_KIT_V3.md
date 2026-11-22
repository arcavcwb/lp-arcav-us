# ARCAV — Brand Kit v3

**Estado:** propuesta de identidad aprobada visualmente; activos vectoriales reconstruidos para producción.  
**Fecha:** 21 de noviembre de 2026.  
**Marca:** ARCAV — Tecnologia para negócios e marketing.

## Concepto de marca

ARCAV es un estudio de productos digitales. La identidad busca **confianza, claridad y energía de ejecución**, sin las convenciones visuales sobrecargadas de agencias tecnológicas. El color es una herramienta de jerarquía, no una promesa causal de conversión.

La forma principal es una **barra inclinada + triángulo ámbar** que sugiere una A abstracta. No debe interpretarse como un símbolo corporativo preexistente ni como garantía de exclusividad jurídica.

## Logo y versiones

- **Logo principal:** `logos-svg/logo-primary.svg` — azul profundo + ámbar, wordmark azul profundo. Para fondos blancos/arena.
- **Logo sobre oscuro:** `logos-svg/logo-on-dark.svg` — barra y letras blancas, triángulo ámbar. Para fondo azul profundo.
- **Monocromáticas:** azul profundo y blanco (`logo-monochrome-*`). Para aplicaciones de una tinta.
- **Logo vertical:** `logo-stacked.svg` y `logo-stacked-on-dark.svg`.
- **Símbolo:** `symbol-*.svg`, incluyendo variantes para fondos claros y oscuros.
- **Ícono app/fav:** `favicon.svg` con fondo azul profundo; también PNG.

**Construcción:** marca vectorial original trazada a partir del concepto visual aprobado; letras convertidas a curvas usando Inter Display Bold como aproximación técnica del wordmark. No depende de fuentes para mostrarse. Antes de registro comercial o imprenta de gran formato, revisar ópticamente las curvas y el espaciado del wordmark.

### Protección y escalado

- Área de reserva: al menos **0,5× la altura de la letra A** en todos los costados del logotipo.
- Tamaño mínimo orientativo: logotipo horizontal **160 px** en digital; símbolo aislado **24 px**.
- Mantener proporciones; no distorsionar, rotar, añadir sombras al logo ni cambiar el orden cromático.
- No colocar el logo bicolor sobre fotografías de contraste variable sin una superficie sólida debajo.

## Paleta

| Token | HEX | Rol |
|---|---|---|
| Azul profundo / `navy` | `#0B1F3B` | Identidad, encabezados y fondos oscuros |
| Azul eléctrico / `blue` | `#2563EB` | Acción principal, estados interactivos y enlaces |
| Ámbar / `amber` | `#F59E0B` | Acentos y puntos de atención sobre azul profundo |
| Pizarra / `slate` | `#334155` | Texto de apoyo y elementos secundarios |
| Arena / `sand` | `#F5F3EE` | Superficie cálida y fondos de descanso |
| Blanco / `white` | `#FFFFFF` | Fondo, espacio negativo y texto en azul |

### Contraste WCAG 2.2 (cálculo de color sRGB)

| Par | Relación | Texto normal AA |
|---|---:|---|
| Azul profundo / Blanco | 16.49:1 | Sí |
| Azul eléctrico / Blanco | 5.17:1 | Sí |
| Ámbar / Blanco | 2.15:1 | No |
| Azul profundo / Ámbar | 7.68:1 | Sí |
| Pizarra / Arena | 9.34:1 | Sí |
| Blanco / Azul profundo | 16.49:1 | Sí |
| Blanco / Azul eléctrico | 5.17:1 | Sí |

**Regla clave:** no utilizar ámbar como texto pequeño sobre blanco. Como CTA ámbar, usar letras azul profundo. El azul eléctrico sobre blanco sí cumple el umbral AA de texto normal según los colores del kit.

## Tipografía

- **Manrope:** títulos, titulares editoriales, comunicación de marca y piezas promocionales.
- **Inter:** cuerpo, navegación, controles, formularios y metadatos.
- **Wordmark:** dibujo vectorial fijo; no sustituir por texto tipográfico dinámico.

No se redistribuyen archivos tipográficos en este kit. La instalación web de ambas familias debe respetar sus respectivas licencias.

## Dirección de arte

- Fotografía propia o con licencia documentada; preferir personas reales, proceso de trabajo y capturas auténticas.
- Portfolio protagonizado por productos de repositorios y despliegues independientes.
- Preferir alternancia de fondos blanco, arena y azul profundo, evitando convertir cada sección en un bloque saturado.
- Azul eléctrico para CTA principal; ámbar como microacento focal y señal de progreso.
- Movimiento discreto, vinculado al estado o a la entrada del contenido, con soporte `prefers-reduced-motion`.
- Evitar neones, fotografías de oficina genéricas, gradientes omnipresentes, glows y métricas inventadas.

## Implementación incremental en `lp-arcav-us`

1. Guardar archivos SVG como assets de identidad, sin sobrescribir el logo actual todavía.
2. Crear una rama dedicada `feat/arcav-brand-v3` y revisar los tokens existentes.
3. Probar header, hero, botones, menú móvil, formularios y footer sobre fondo claro y oscuro.
4. Ejecutar auditoría WCAG de contraste + pruebas visuales en 390 y 1440 px.
5. Registrar la decisión cromática en `DESIGN.md` solo después de la aprobación de capturas.
6. Hacer merge y deploy únicamente tras QA.

Este kit **no cambia el sitio publicado ni los repositorios de los proyectos white-label**.
