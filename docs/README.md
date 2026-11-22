# Documentación de ARCAV

Este repositorio es **solo el sitio comercial y el portafolio** de ARCAV. Cada tema tiene una sola fuente; si algo cambia, se cambia ahí.

## Dónde está cada cosa

| Tema | Fuente |
|---|---|
| Producto, público, posicionamiento y compromisos de marca | [`PRODUCT.md`](../PRODUCT.md) |
| Sistema visual: tokens, tipografía, ritmo, componentes y reglas | [`DESIGN.md`](../DESIGN.md) |
| Cómo está armado el código (estilos, datos, importaciones, scripts) | [`README.md`](../README.md) |
| Contexto de marketing (oferta, objeciones, voz, aprendizajes) | [`.agents/product-marketing.md`](../.agents/product-marketing.md) |
| Identidad, personalidad, mensajes y trayectoria | [`BRAND.md`](BRAND.md) |
| Kit de identidad V3: guía del kit y logos en SVG (referencia) | [`brand/v3/`](brand/v3/) |
| Cómo contar un trabajo en el portafolio | [`CASES.md`](CASES.md) |
| Texto del sitio (pt-BR) | `src/data/` (no se copia en documentos) |
| Fotos y logo | `src/assets/fotos/README.md` y `src/assets/brand/README.md` |

## Fuera de este repositorio

- **Propuestas para prospectos** (diagnóstico, demo, oferta): en el repositorio de cada proyecto. La de Center Gás vive en el suyo.
- **Ejemplos y productos white-label**: en repositorios y despliegues propios. Aquí solo entran sus capturas, sus datos y el enlace.
- **Documentos internos** (auditorías, medición y similares): quedan solo en la máquina y no se versionan; el repositorio es público.

## Documentos retirados

Se consultan en el historial de git, por ejemplo `git show 09032cf:docs/CONTENT.md`:

- `CONTENT.md`: texto de la home de septiembre (en español). El texto aprobado está en `src/data/`.
- `DESIGN_SYSTEM.md`: la dirección de diagramas, nodos y mapas, rechazada. La vigente está en `DESIGN.md`.
- `PROJECT.md`: contexto del proyecto, reemplazado por `PRODUCT.md`.
- `UX_RESPONSIVE.md`: lo vigente (accesibilidad y rendimiento) pasó a `PRODUCT.md`.
- `exemplos-ficticios/`: páginas de demostración en Astro; las demos se construyen en proyectos propios.
