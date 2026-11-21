# ARCAV × Center Gás — kit de implementación para Claude Code

**Versión:** 1.0 · **Fecha:** 2026-11-20 · **Idioma de trabajo:** español · **Idioma de las páginas públicas:** pt-BR

## Objetivo
Convertir el sitio institucional existente de ARCAV en el punto de entrada a un flujo de venta consultiva:

**WhatsApp corto → servicio de ARCAV → diagnóstico personalizado de Center Gás → demo interactiva → contacto / propuesta comercial.**

No se pide rediseñar todo ARCAV ni construir aún el backoffice de Center Gás.

## Qué entregar en esta primera implementación
1. Una sección o página pública de servicio para pequeños comercios en `arcav.us/pt/solucoes/comercio-digital/` (adaptar la ruta a la convención de rutas real del repositorio).
2. Una landing de propuesta personalizada en `arcav.us/pt/propostas/center-gas/`, con recorrido claro: servicio → diagnóstico → demostración → opciones comerciales → CTA.
3. Enlaces y CTAs funcionales; instrumentación analítica mínima si ya existe una solución de métricas.
4. Documentación de pruebas y resultados de build local. **No publicar sin autorización.**

## Archivos y orden de lectura
1. `01-OBJETIVO-Y-REGLAS.md`: objetivo, límites y decisiones.
2. `02-DIAGNOSTICO-VERIFICADO.md`: hechos y riesgos de afirmaciones comerciales.
3. `03-EXPERIENCIA-Y-RUTAS.md`: funnel, arquitectura de información, wireframe narrativo.
4. `04-CONTENIDO-PT-BR.md`: texto de las páginas listo para adaptar.
5. `05-DIRECCION-VISUAL.md`: diseño sobre el sistema existente.
6. `06-ESPECIFICACION-TECNICA.md`: implementación incremental.
7. `07-ANALITICA-PRIVACIDAD-SEO.md`: métricas y privacidad.
8. `08-QA-Y-CRITERIOS.md`: aceptación, test y cierre.
9. `09-OFERTA-Y-WHATSAPP.md`: propuesta económica y mensajes.
10. `10-DECISIONES-PENDIENTES.md`: no inventar datos, verificaciones necesarias.
11. `CLAUDE_PROMPT.md`: prompt maestro para iniciar el trabajo.

## Referencias verificadas
- ARCAV (español): https://arcav.us/es/
- ARCAV (portugués): https://arcav.us/pt/
- Center Gás, sitio vigente: https://centergascuritiba.com.br/
- Center Gás, propuesta v3: https://centergas-v3.pages.dev/

## Cómo usar
Copiar esta carpeta a `docs/propostas/center-gas/` (o ubicación equivalente) dentro del repositorio de ARCAV. Abrir Claude Code **en la raíz del repositorio de ARCAV**, pegar `CLAUDE_PROMPT.md` y dejar que primero audite el código y presente el plan. Los enlaces de producción son de referencia: no implican acceso al repositorio fuente ni permiso para desplegar.
