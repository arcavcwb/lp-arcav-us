# Objetivo comercial y reglas del producto

## Contexto
ARCAV ofrece soluciones de negocio (sitios conectados, sistemas livianos, automatizaciones). Quiere vender a comerciantes **resultados comprensibles**: pedidos más cómodos, campañas activas, información organizada y medición del interés. Center Gás Curitiba es el prospecto inicial. El usuario ya desarrolló una propuesta visual y funcional `https://centergas-v3.pages.dev/` y desea presentarla de forma profesional a través de su dominio `arcav.us`.

## La experiencia que vendemos
Un propietario no técnico recibe un mensaje breve. Al abrir el enlace debe responder mentalmente, en orden:

1. ¿Quién me contacta? → ARCAV, empresa en Curitiba que crea soluciones digitales para comercios.
2. ¿En qué me ayuda? → simplifica pedidos y mantiene promociones organizadas.
3. ¿Qué observó de mi negocio? → diagnóstico respetuoso y específico.
4. ¿Qué preparó? → demostración existente de Center Gás v3.
5. ¿Qué tengo que hacer? → probar la demo y pedir una conversación sin formularios obligatorios.

## Prioridades (P0)
- Reusar marca, navegación, tipografías, componentes, colores y sistema responsive del ARCAV existente, tras inspeccionarlos. **No inventar un design system paralelo.**
- Idioma de páginas prospecto: portugués brasileño natural, sin textos españoles residuales.
- Comunicación comercial enfocada en beneficios, no en Astro, Directus, agentes ni PostgreSQL.
- El diagnóstico no debe confundir oportunidades con problemas demostrados, ni clics con ventas.
- No romper el sitio actual ni modificar su estructura global innecesariamente.
- Demo externa como evidencia, con aviso «demonstração» y sin afirmar que es el sitio oficial en uso.
- CTA final debe dirigirse a **ARCAV**, no al WhatsApp de Center Gás. Contacto de ARCAV pendiente: reutilizar canal real ya configurado; si no existe WhatsApp autorizado, usar contacto/email existente y documentar pendiente.
- No desplegar a producción ni cambiar dominio/DNS sin aprobación explícita del usuario.

## Exclusiones del MVP
- Desarrollar Directus, panel administrativo o motor agéntico de campañas.
- Conectar pedidos reales de Center Gás, modificar su sitio o registrar leads en una nueva base de datos.
- Afirmar aumentos garantizados de ventas o inventar testimonios/cifras.
- Colocar información interna o privada del prospecto.
- Integrar pagos, checkout o inventario en tiempo real.
- Hacer un rebranding de ARCAV.

## Criterio de éxito comercial
Una persona que abre el enlace desde su móvil entiende la propuesta en menos de un minuto y puede: (a) ver el diagnóstico, (b) abrir la demo, y (c) contactar a ARCAV. La arquitectura permite reutilizar la misma plantilla para una segunda empresa sin copiar toda la landing.

## Reglas sobre copy de venta
- Beneficio antes de tecnología. Una idea por bloque; frases breves.
- Evitar «seu site está ruim» / «site ultrapassado». Reconocer lo que ya funciona.
- No usar urgencia falsa, escasez inventada ni análisis falsos.
- Dejar claro que es **uma proposta preparada pela ARCAV**, no una colaboración ya aprobada por Center Gás.
- Evitar lenguaje que haga creer que la solución ya está contratada o implementada en producción.
