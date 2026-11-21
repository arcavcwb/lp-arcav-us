# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Corrección del usuario (2026-11-21): ARCAV atiende varios tipos de cliente, no solo comercio local.** Cada uno llega a la página de su solución y ve un ejemplo ilustrativo:

- **Marcas y profesionales que venden confianza** (clínicas, estudios, escritorios, consultores): *landing page de alto padrão*.
- **Empresas, equipos de marketing y agencias con campañas o anuncios**: *landing page para campanhas*.
- **Quien lanza un producto, app, curso o servicio**: *landing page de produto*.
- **Palestrantes, organizadores de eventos y cursos presenciales**: *landing page para palestras e eventos*.
- **Comercios locales de Curitiba que venden por WhatsApp** (primer caso: Center Gás, gas y agua): *site para comércio com pedido no WhatsApp*.
- **Pymes con procesos manuales** (planillas, formularios, WhatsApp): *sistemas e automação*.

Rasgos comunes: llegan muchas veces desde un link enviado por WhatsApp y lo abren en el celular. Tienen que entender en menos de un minuto qué hace ARCAV para su caso, ver una prueba concreta (el ejemplo) y hablar sin compromiso. Las landing pages son la oferta principal; comercio y automatización son soluciones complementarias.

**Secundarias:** líderes técnicos y reclutadores que evalúan el perfil de Armando.

## Product Purpose

ARCAV es la marca profesional de Armando Castro: un estudio técnico de producto, de una sola persona, en Curitiba. Transforma procesos de negocio en productos digitales simples, automatizados y fáciles de operar.

Para comercios ofrece sitios comerciales con catálogo y carrito que envían el pedido organizado al WhatsApp, campañas de ofertas recurrentes (planes semanal y diario) y métricas simples de interés (visitas y clics, no ventas).

Éxito: un comerciante que abre el enlace en el celular entiende la propuesta en menos de un minuto y contacta a ARCAV. Las propuestas personalizadas convierten la prospección por WhatsApp en conversaciones de venta.

## Positioning

Ingeniería seria con alcance de pequeño negocio. ARCAV no reemplaza lo que ya funciona: mantiene el WhatsApp del comerciante y organiza la experiencia alrededor de él ("Integrar sem invadir", "Não modernizo por modernizar"). Antes de vender, prepara para cada prospecto un diagnóstico de su sitio público y una demostración navegable hecha para su negocio. Desde el 2026-11-21 esto es una oferta pública en `/solucoes/comercio-digital/`: el comerciante manda el link de su sitio, Instagram o catálogo y recibe el análisis y una demo con sus productos, sin compromiso (decisión del usuario: versión completa, con demo para cada uno; plazo de respuesta aún sin definir).

## Operating Context

- Prospección: mensaje corto de WhatsApp con enlace a una propuesta personalizada en `/propostas/<slug>/` (noindex; `noindex` no la hace privada).
- La demo de cada prospecto se aloja aparte (ej. `https://centergas-v3.pages.dev/`) y siempre se rotula como demonstração, no como el sitio oficial del cliente.
- Contacto con ARCAV: `hola@arcav.us`. El número comercial de WhatsApp de ARCAV está pendiente (`ARCAV_WHATSAPP` en `src/lib/contact.ts`).
- Hosting: Cloudflare Workers con Astro 6 (SSR y páginas prerenderizadas).

## Capabilities and Constraints

- Sitio solo en portugués de Brasil (decisión del 2026-11-20). Se eliminan las versiones ES y EN.
- URLs en la raíz: `/`, `/solucoes/comercio-digital/`, `/propostas/center-gas/`. Las rutas antiguas `/pt/…`, `/es` y `/en` redirigen con 301.
- El formulario de contacto (home y página de comercios) intenta enviar desde el sitio vía `POST /api/contato` con el envío de correo de Cloudflare (binding `SEND_EMAIL`, aún no configurado). Si no está disponible, arma el mensaje y abre el e-mail del visitante (o WhatsApp de ARCAV). No guarda datos. Activación: README, sección "Formulário de contato".
- No hay analítica instalada. Los enlaces llevan atributos `data-analytics-event` para cuando se agregue.
- Precios de la propuesta Center Gás: R$ 3.900 (sitio), R$ 490/mês y R$ 890/mês (planes de ofertas), pendientes de confirmación final antes de enviarla.
- No construido y nunca presentado como listo: backoffice o panel administrativo, Directus, motor de campañas automatizado, integración de pedidos o stock, pagos.

## Brand Commitments

- **ARCAV por Armando Castro**: ARCAV es la marca; Armando es la persona y la credibilidad detrás.
- Trayectoria profesional: Venezuela → México → San Diego / EUA → Curitiba / Brasil. Es una conexión profesional; no implica haber vivido en cada lugar.
- Mensaje central (pt-BR): "Transformo processos de negócio em produtos digitais simples, automatizados e fáceis de operar." Mensaje de apoyo: "Focados em escopo. Sérios em engenharia."
- Personalidad (de `docs/BRAND.md`): técnica, precisa, calma, consultiva, humana, segura, premium sin ostentación. No debe sentirse barata, genérica, de moda, sobrediseñada, hacker/cyberpunk, corporativa pesada ni de agencia de marketing.
- Registro visual (decisión del usuario, 2026-11-21, después de rechazar dos tandas de mundos temáticos): **sobrio y profesional**. Nada de metáforas que disfracen el sitio (talonario, azulejos, folleto de ofertas, mapa de transporte). Amarillo, rojo, azul cobalto y verde no son colores de marca. Tampoco puede verse barato ni frío o genérico: la personalidad sale de la tipografía, el orden, el contenido real y la presencia de Armando.
- Voz: clara, directa, sin hype ni buzzwords (revolucionário, disruptivo, 10x…). Beneficio antes que tecnología al hablarle a comerciantes.
- WhatsApp comercial de ARCAV: (41) 99845-0477 (`ARCAV_WHATSAPP` en `src/lib/contact.ts`, confirmado por el usuario el 2026-11-21). Plazo de respuesta prometido: hasta 1 hora, que se va a sostener con una automatización (n8n + Evolution API para WhatsApp) que el usuario va a montar; el endpoint `/api/contato` ya acepta `N8N_WEBHOOK_URL`. Precio y plazo de implantación se informan después de la evaluación; el sitio no publica precios genéricos.
- Logo o símbolo ARCAV y foto de Armando: el usuario confirmó que existen o se van a entregar. Todavía no están en el repo; hoy solo hay wordmark de texto y `public/favicon.svg`.

## Evidence on Hand

- Demo de propuesta para Center Gás: `https://centergas-v3.pages.dev/`. Es un trabajo para un prospecto, no un caso público, salvo autorización.
- Diagnóstico y copy aprobados: `docs/propostas/center-gas/`.
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
