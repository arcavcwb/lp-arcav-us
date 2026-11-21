# Decisiones, dependencias y riesgos

## Decisiones tomadas
- El dominio principal es ARCAV, no el hosting de la demo.
- El flujo comercial personalizado vive en una landing ARCAV, en portugués.
- Debe existir oferta de servicio reutilizable para otros comercios.
- Diagnóstico antes del link a demo; precios después de valor demostrado.
- Sitio R$ 3.900; planes mensuales R$ 490 y R$ 890.
- Backoffice / Directus / agentes de IA como fase adicional, no inventar que está listo.
- Contenido sin cifras falsas; no publicar sin aprobación.

## Pendientes que Claude debe descubrir en el repositorio
- [ ] Ruta física de proyecto y stack real.
- [ ] Framework de i18n y estructura de URL canonizada.
- [ ] Tokens del design system y componentes reutilizables.
- [ ] Contacto comercial WhatsApp de ARCAV, si ya existe y está autorizado.
- [ ] Analítica instalada y configuración de privacidad.
- [ ] Mecanismo para URLs `noindex` y excluir de sitemap.
- [ ] Posibilidad de generar captura real del sitio de demo.

## Pendientes de negocio antes de envío al cliente
- [ ] Autorización para compartir una propuesta personalizada públicamente accesible (aunque sea noindex).
- [ ] Confirmación de precios, cuotas, impuestos y plazos de entrega finales.
- [ ] Qué parte exacta de banners y automatización está incluida desde el primer mes.
- [ ] Límites de revisiones, SLA y quién aprueba/publica.
- [ ] Aprobación comercial de usar marca/imagenes de Center Gás en material externo.
- [ ] Validación manual del carrito de demo en móvil y comportamiento WhatsApp.
- [ ] Verificar funcionamiento del enlace ARCAV antes de enviarlo.

## Riesgos a evitar
1. **Sobrepromesa:** vender dashboard y agente de IA como si ya operaran.
2. **Fuga comercial:** CTA termina llamando al propio Center Gás en lugar de ARCAV.
3. **Costos ocultos:** usar R$ 490/mes para mantener infraestructura intensiva sin presupuesto.
4. **Seguridad aparente:** interpretar `noindex` como propuesta protegida.
5. **Desviación de alcance:** reconstruir todo `arcav.us` en vez del nuevo funnel.
6. **Calidad pt-BR:** mezclar frases «Arquitectura»/«Herramientas» en nuevas páginas.
7. **Publicación no autorizada:** modificar producción mientras aún se está validando.

## Criterio de parada
Si falta número WhatsApp ARCAV, sitio permite fallback a contacto por email existente. Si no se puede verificar el stack/rutas locales, Claude debe informar la limitación antes de editar. Si el usuario no autorizó despliegue, terminar con build local y diff, no con una URL inventada.
