# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Corrección del usuario (2026-11-21): ARCAV atiende varios tipos de cliente, no solo comercio local.** Cada uno llega a la página de su solución:

- **Empresas que necesitan un sitio propio** (quiénes son, servicios, dónde atienden, cómo contactar): *site institucional*.
- **Quien tiene un sitio viejo, lento o atado a una plataforma** (Wix y similares, hosting/dominio/correo, datos y sistemas, rediseño): *migração*.
- **Marcas y profesionales que venden confianza** (clínicas, estudios, escritorios, consultores): *landing page de alto padrão*.
- **Empresas, equipos de marketing y agencias con campañas o anuncios**: *landing page para campanhas*.
- **Quien lanza un producto, app, curso o servicio**: *landing page de produto*.
- **Palestrantes, organizadores de eventos y cursos presenciales**: *landing page para palestras e eventos*.
- **Comercios locales de Curitiba que venden por WhatsApp** (primer caso: Center Gás, gas y agua): *site para comércio com pedido no WhatsApp*.
- **Pymes con procesos manuales** (planillas, formularios, WhatsApp): *sistemas e automação*.

Rasgos comunes: llegan muchas veces desde un link enviado por WhatsApp y lo abren en el celular. Tienen que entender en menos de un minuto qué hace ARCAV para su caso, ver una prueba concreta (el ejemplo) y hablar sin compromiso. Los cinco servicios (sitio institucional, migración, landing pages, comercio con pedido en WhatsApp, sistemas y automatización) tienen el mismo peso, y la home entra por la situación del cliente ("Preciso de um site para a minha empresa."). Los cuatro tipos de landing page viven dentro de `/solucoes/landing-pages/`.

**Secundarias:** líderes técnicos y reclutadores que evalúan el perfil de Armando.

## Product Purpose

ARCAV es la marca profesional de Armando Castro: un estudio técnico de producto, de una sola persona, en Curitiba. Transforma procesos de negocio en productos digitales simples, automatizados y fáciles de operar.

Para comercios ofrece sitios comerciales con catálogo y carrito que envían el pedido organizado al WhatsApp, campañas de ofertas recurrentes (planes semanal y diario) y métricas simples de interés (visitas y clics, no ventas).

Éxito: un comerciante que abre el enlace en el celular entiende la propuesta en menos de un minuto y contacta a ARCAV. Las propuestas personalizadas convierten la prospección por WhatsApp en conversaciones de venta.

## Positioning

Ingeniería seria con alcance de pequeño negocio. ARCAV no reemplaza lo que ya funciona: mantiene el WhatsApp del comerciante y organiza la experiencia alrededor de él ("Integrar sem invadir", "Não modernizo por modernizar"). Los ejemplos publicados en el sitio se pueden probar en cualquier momento; después de la conversación, si hay encaje, ARCAV prepara una prévia resumida del proyecto que acompaña la propuesta (fase 1 de estabilización, 2026-11-21; ya no se promete una demo completa para cada interesado). Para prospectos elegidos, la propuesta personalizada lleva diagnóstico y demostración.

## Operating Context

- Prospección: mensaje corto de WhatsApp con enlace a una propuesta personalizada. Las propuestas y sus demos viven en proyectos propios, fuera de este repositorio (decisión del 2026-11-21); la de Center Gás salió de aquí y su dirección vieja (`/propostas/center-gas/`) redirige con 301 a su proyecto, `https://centergas-v3.pages.dev/`.
- La demo de cada prospecto se aloja aparte (ej. `https://centergas-v3.pages.dev/`) y siempre se rotula como demonstração, no como el sitio oficial del cliente.
- Contacto con ARCAV: `hola@arcav.us` y WhatsApp comercial (41) 99845-0477 (`ARCAV_WHATSAPP` en `src/lib/contact.ts`).
- **Este repositorio es solo el sitio comercial y el portafolio** (decisión del 2026-11-21). Propuestas, productos white-label y ejemplos se construyen y publican en repositorios propios; aquí solo entran capturas, datos y el enlace. El celular de demostración de la página de comercio se queda hasta que exista el ejemplo externo de tienda.
- Hosting: Cloudflare Workers con Astro 6 (SSR y páginas prerenderizadas).

## Capabilities and Constraints

- Sitio solo en portugués de Brasil (decisión del 2026-11-20). Se eliminan las versiones ES y EN.
- URLs en la raíz: `/`, `/solucoes/<servicio>/` (sitio institucional, migración, landing pages y sus cuatro tipos, comercio, automatización). Las rutas antiguas `/pt/…`, `/es` y `/en` redirigen con 301.
- El formulario de contacto arma el mensaje y abre el WhatsApp de ARCAV con él escrito (`DIRECT_SEND = false`). El envío desde el sitio (`POST /api/contato`, n8n o correo de Cloudflare) existe pero queda apagado hasta probar un envío real. No guarda datos. Activación: README, sección "Formulário de contato".
- No hay analítica instalada. Los enlaces llevan atributos `data-analytics-event` para cuando se agregue.
- Precios de la propuesta Center Gás: R$ 3.900 (sitio), R$ 490/mês y R$ 890/mês (planes de ofertas), pendientes de confirmación final antes de enviarla.
- No construido y nunca presentado como listo: backoffice o panel administrativo, Directus, motor de campañas automatizado, integración de pedidos o stock, pagos.

## Brand Commitments

- **ARCAV por Armando Castro**: ARCAV es la marca; Armando es la persona y la credibilidad detrás.
- Trayectoria profesional: Venezuela → México → San Diego / EUA → Curitiba / Brasil. Es una conexión profesional; no implica haber vivido en cada lugar.
- Mensaje central (pt-BR): "Transformo processos de negócio em produtos digitais simples, automatizados e fáceis de operar." Mensaje de apoyo: "Focados em escopo. Sérios em engenharia."
- Personalidad (de `docs/BRAND.md`): técnica, precisa, calma, consultiva, humana, segura, premium sin ostentación. No debe sentirse barata, genérica, de moda, sobrediseñada, hacker/cyberpunk, corporativa pesada ni de agencia de marketing.
- Registro visual (decisión del usuario, 2026-11-21, después de rechazar dos tandas de mundos temáticos): **sobrio y profesional**. Nada de metáforas que disfracen el sitio (talonario, azulejos, folleto de ofertas, mapa de transporte). Amarillo, rojo, azul cobalto y verde no son colores de marca. Tampoco puede verse barato ni frío o genérico: la personalidad sale de la tipografía, el orden, el contenido real y la presencia de Armando. Desde el 2026-11-21 la dirección es **"A obra em primeiro plano"**: portafolio editorial de estudio, con el trabajo real y la persona al frente (DESIGN.md y `docs/auditorias/AUDITORIA-VISUAL-HOME.md`).
- Voz: clara, directa, sin hype ni buzzwords (revolucionário, disruptivo, 10x…). Beneficio antes que tecnología al hablarle a comerciantes.
- WhatsApp comercial de ARCAV: (41) 99845-0477 (`ARCAV_WHATSAPP` en `src/lib/contact.ts`, confirmado por el usuario el 2026-11-21). Plazo de respuesta: el sitio no promete ninguno (`RESPONSE_TIME = null`) hasta que la automatización (n8n + Evolution API para WhatsApp) lo garantice; el endpoint `/api/contato` ya acepta `N8N_WEBHOOK_URL`. Precio y plazo de implantación se informan después de la evaluación; el sitio no publica precios genéricos.
- Logo o símbolo ARCAV: todavía no está en el repo; hoy hay wordmark de texto y `public/favicon.svg`.
- Fotos de Armando: el usuario las entrega el 2026-11-22. Mientras tanto, la home muestra marcadores en sus lugares (`src/data/photos.ts`); no se publica con marcadores.

## Evidence on Hand

- Demo de propuesta para Center Gás: `https://centergas-v3.pages.dev/`. Es un trabajo para un prospecto, no un caso público, salvo autorización.
- Diagnóstico y copy aprobados de la propuesta: en el repositorio de Center Gás (salieron de este el 2026-11-21).
- Repositorio público `https://github.com/arcavcwb/arcav-ia-flow`.
- Trayectoria: Arkus Nexus (Frontend Developer), Drata (Frontend React Developer), según `docs/BRAND.md`.
- **Ausencias que no se inventan:** testimonios, logos de clientes, métricas o resultados, capturas publicables de casos. El trabajo actual para empresas o clientes es confidencial.

## Product Principles

1. Primero el proceso, después la tecnología: se habla de pedidos, ofertas y rutina, no de stack.
2. Integrar antes que reemplazar: el WhatsApp y la operación actual del comerciante siguen en el centro.
3. Probar, no prometer: diagnósticos y demos concretos en vez de afirmaciones; sin cifras sin datos.
4. Honestidad sobre el alcance: lo que no está construido se presenta como etapa futura con presupuesto propio.
5. Pequeño no significa improvisado: alcance acotado con calidad de ingeniería.

## Accessibility & Inclusion

Mobile-first (360 y 390 px como mínimo de referencia), contraste WCAG AA, navegación completa por teclado, foco visible, objetivos táctiles de 44 px o más y respeto por `prefers-reduced-motion`. Contenido en `lang="pt-BR"`.

- HTML semántico: un solo H1 por página, títulos en orden, listas y tablas reales, etiquetas con sentido en formularios y botones.
- Ningún estado se comunica solo con color; los SVG decorativos quedan ocultos para lectores de pantalla.
- Menú del celular, ventana del formulario y selector de landing pages usables con teclado (popover y botones de opción nativos).

## Performance

- Render de Astro, CSS y SVG; el mínimo de JavaScript en el navegador (hoy: el celular de demostración, el formulario y el cierre del menú).
- El sitio se entiende y funciona sin JavaScript donde es posible: la ventana, el menú, el selector y el movimiento son HTML y CSS.
- Imágenes con tamaño reservado y carga diferida fuera de la primera pantalla.
- Fuera: librerías 3D o de mapas, frameworks de animación pesados, video de fondo, hidratación innecesaria, imágenes gigantes.
