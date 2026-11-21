# Especificación técnica incremental (adaptar al repositorio real)

## Fase 0: diagnóstico obligatorio antes de editar
Claude debe documentar: framework y versión real del proyecto ARCAV, package manager, estructura de rutas localizada, DS actual, estrategia de despliegue, contacto operativo actual, analytics actual, componentes reutilizables, scripts de build/check/test y estado de Git.

**No asumir** Astro, Tailwind, Umami ni paths de ejemplo como hechos hasta inspeccionar el repo. El autor utiliza Astro y Umami en otros proyectos, pero esto no prueba la configuración del repo ARCAV.

## Fase 1: contenido y rutas
- Crear servicio general `.../pt/solucoes/comercio-digital/` y propuesta `.../pt/propostas/center-gas/` de acuerdo con router real.
- Si el sitio ya tiene un sistema de locales, utilizarlo. No introducir otro sistema i18n.
- Conservar intactas las páginas ES/EN/PT existentes; arreglar únicamente los textos PT en español dentro de componentes compartidos que se vean afectados y tras pruebas de regresión.
- Para contenido parametrizable, usar objeto de datos/colección local (ejemplo conceptual):

```ts
export type ProspectProposal = {
  slug: string;
  companyName: string;
  siteCurrent: string;
  demoUrl: string;
  diagnosis: Array<{ current: string; opportunity: string }>;
  plans?: Array<{ name: string; priceBRL: number; frequency: 'once' | 'month'; inclusions: string[] }>;
  contactMessage: string;
  robotsNoIndex: boolean;
};
```

**Evitar sobreingeniería:** para un prospecto no es necesario conectar Directus ni añadir BD. Reutilizar componentes donde tenga sentido, no construir framework de páginas prematuramente.

## Fase 2: componentes esperados (nombres ilustrativos)
- `CommerceServiceHero` / `CommerceBenefits` / `HowItWorks`.
- `ProspectHero` / `DiagnosisComparison` / `DemoCTA` / `OffersExplanation` / `ProposalPricing` / `ProposalContact`.
- Contenido separado de markup reutilizable, con tipado si el repo es TS.
- Links externos con `target="_blank"` y `rel="noopener noreferrer"` cuando proceda, texto accesible. Alternativamente abrir misma pestaña si la navegación lo recomienda.

## Fase 3: contacto
- Prioridad: reusar el mecanismo de contacto real de ARCAV. Si el repositorio ya incluye número comercial de WhatsApp verificado, crear `https://wa.me/<numero>?text=<mensaje_codificado>`.
- Si el número no está confirmado, **no inventarlo ni usar el de Center Gás**. Fallback seguro: `mailto:hola@arcav.us?subject=Proposta%20Center%20G%C3%A1s...` (confirmar email en código).
- Mensaje por defecto: «Olá! Vi a proposta da ARCAV para a Center Gás e gostaria de conversar sobre a implantação.»
- No forzar un formulario nuevo ni capturar datos personales sin necesidad.

## Fase 4: propuesta personalizada y SEO
- `<title>` claro, `description`, canonical correcto según convención real.
- Propuesta personalizada: `robots=noindex,nofollow` para evitar indexación accidental, **pero esto NO la hace privada**. Si se necesita acceso restringido, diseñar Cloudflare Access/contraseña en fase aparte; no inventar seguridad por URL oscura.
- Servicio general: indexable y SEO local razonable sin keyword stuffing.
- No crear un sitemap público que exponga la propuesta personalizada cuando se pueda excluir.

## Fase 5: rendimiento / métricas
- Si ya existe analytics, instrumentar únicamente eventos relevantes. Si no existe, documentar dónde añadirlo; no crear plataforma nueva para el MVP.
- No registrar nombres, números, precios internos ni contenido de chats en analytics.
- Sin scripts de terceros innecesarios, sin degradación de performance significativa.

## Fase 6: validación y entrega
- Ejecutar scripts reales de tipo, lint, check y build que existan.
- Si se permite, probar con navegador en móvil y desktop, incluyendo CTA de demo y contacto.
- Registrar comandos ejecutados, éxito/error y cambios pendientes.
- Entregar diff y URL **solo cuando exista**; no declarar páginas públicas si aún no se han publicado.
- No `git push`, deploy, DNS, Cloudflare Pages, DB migrations ni publicación hasta autorización explícita.

## Rama y cambios
Trabajar en una rama de feature si el flujo de repo lo permite (no sobrescribir cambios del usuario). Inspeccionar `git status` antes de tocar archivos. No borrar contenido existente. Mantener cambios acotados al funnel comercial.
