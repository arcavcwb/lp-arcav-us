# PROMPT MAESTRO — CLAUDE CODE

Actúa como **Senior Product Engineer + UX Engineer + Conversion Strategist**, trabajando **en el repositorio EXISTENTE de ARCAV**. No construyas una presentación de diapositivas ni una aplicación separada. Tu tarea es adaptar progresivamente el sitio actual para convertir visitas provenientes de un WhatsApp comercial en conversaciones de venta.

## Misión
Implementar un funnel para pequeños comercios que arranque con **Center Gás Curitiba**:

**WhatsApp breve → arcav.us/pt/propostas/center-gas/ → servicios ARCAV → análisis del sitio actual → demo v3 → precios (si está aprobado el copy) → CTA de contacto con ARCAV.**

Crear también una página de servicio reutilizable `.../pt/solucoes/comercio-digital/` y un enlace discreto desde la homepage PT o sección servicios. Estas rutas son propuestas: respeta router y estilo del proyecto que descubras.

## Tu fuente de verdad
Lee en orden TODOS los archivos de esta carpeta:
`docs/propostas/center-gas/00-LEEME.md` hasta `10-DECISIONES-PENDIENTES.md`.
Si la carpeta se copió en otra ruta, localízala antes de comenzar. No sustituirla por hipótesis. El texto final visible debe estar en **portugués brasileño**, mientras que documentación y reportes para mí pueden ser en español.

Referencias públicas:
- https://arcav.us/pt/
- https://arcav.us/es/
- https://centergascuritiba.com.br/
- https://centergas-v3.pages.dev/

## Protocolo obligatorio

### Etapa 0 — Reconocimiento y plan
1. Comprueba `pwd`, `git status`, estructura de repo, scripts de package manager, framework real, i18n, componentes, DS, canales de contacto y analítica existente.
2. Documenta qué reutilizarás y qué riesgos hay. No des por hecho Astro/Umami si el repo no lo confirma.
3. Presenta un plan corto con archivos previstos y criterios de cierre. Después implementa sin detenerte a pedir confirmaciones no esenciales, salvo si hay riesgo de sobrescribir trabajo, exponer información privada o publicar producción.

### Etapa 1 — Diseño / contenido
4. Mantén la identidad visual de ARCAV. No recrees un DS y no cambies homepage completa.
5. Implementa la página general de servicio para comercio y la landing de Center Gás con secuencia comercial ya documentada.
6. Usa copy de `04-CONTENIDO-PT-BR.md`, ajustando redacción solo para mejorar claridad y exactitud. No inventes cifras, resultados ni referencias de clientes.
7. No presentar el sitio demo como versión oficial publicada; CTA externo a `https://centergas-v3.pages.dev/`.

### Etapa 2 — Experiencia funcional
8. El CTA de contacto debe dirigir a ARCAV, nunca al WhatsApp de Center Gás. Usa número comercial de ARCAV solo si está verificado en el repo; de lo contrario, fallback por email existente y añade un pendiente explícito.
9. Si ya existe analítica, mide el clic a la demo y contacto, y opcionalmente la sección análisis, sin PII. Si no existe, no instales infraestructura nueva para un MVP de marketing.
10. Aplica `noindex` a la propuesta personalizada y mantén indexable la página pública de servicio. No confundir `noindex` con privacidad efectiva.

### Etapa 3 — QA, evidencia y entrega
11. Ejecuta build, check, lint y pruebas disponibles. Valida /pt/, /es/, /en/ en lo posible para detectar regresiones.
12. Revisa experiencia móvil 360/390px y desktop; prueba links, foco, semántica, idioma y flujo completo.
13. Entrega un reporte conciso: qué implementaste, archivos modificados, comandos y resultados, screenshots reales si es posible, pendientes y pasos de publicación.

## Restricciones innegociables
- No despliegues en producción, no hagas `git push`, no cambies DNS ni credenciales sin mi aprobación.
- No modifiques el proyecto Center Gás v3 ni el sitio oficial del cliente.
- No construyas todavía Directus/backoffice, bases de datos, agentes ni el dashboard productivo.
- No uses logos/fotos ajenos sin revisar derechos; evita usar activos confidenciales de otros clientes.
- No hagas afirmaciones de incremento de ventas sin datos; clic a WhatsApp ≠ venta confirmada.
- No inventes teléfono comercial ARCAV. No usar el teléfono de Center Gás para que ARCAV reciba leads.
- Si una página no está publicada, no declares que hay URL funcionando.
- Conserva cambios no relacionados que ya existan en el working tree.

## Definición de terminado
1. Dos rutas funcionales en entorno local o preview autorizado.
2. Mensaje de ventas coherente para propietario no técnico.
3. Servicio → diagnóstico → demo → contacto ARCAV, con clics comprobados.
4. Visualmente coherente con ARCAV y responsive.
5. Copy totalmente pt-BR y sin sobrepromesas.
6. QA documentado y sin publicación no autorizada.

Empieza **ahora** por la auditoría del repositorio y lee todos los documentos. Luego implementa el MVP de manera incremental, sin esperar una siguiente instrucción para tareas dentro de este alcance.
