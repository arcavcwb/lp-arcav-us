# Criterios de aceptación y QA

## Cierre de fase 0 — auditoría
- [ ] Se identificó ruta raíz real, stack, versiones y scripts.
- [ ] Se localizó DS y esquema de idiomas; se anotó contacto real de ARCAV o pendiente.
- [ ] Se documentó el estado de Git y la estrategia de cambios mínimos.

## Servicio general
- [ ] La ruta aprobada o equivalente se abre en pt-BR.
- [ ] Explica pedidos, promociones y métricas sin terminología innecesaria.
- [ ] Reutiliza navegación, colores y tipografía de ARCAV.
- [ ] CTA final conduce a contacto de ARCAV, jamás a Center Gás.
- [ ] Existe un enlace interno coherente desde la home PT o sección de servicios.

## Propuesta Center Gás
- [ ] H1 informa para quién es y cuál es la oportunidad.
- [ ] Se ve primero el beneficio, luego el diagnóstico, luego demo, luego inversión y CTA.
- [ ] Diagnóstico usa solo observaciones públicas verificadas y expresa incertidumbres.
- [ ] Demo externa apunta a `https://centergas-v3.pages.dev/` y está señalada como demostración.
- [ ] Si hay preview visual, proviene de captura real verificada o está marcada ilustrativa.
- [ ] Precio de sitio = R$ 3.900 y planes = R$ 490/R$ 890 mensuales, sin confundir implantación del panel con mensualidad.
- [ ] Ningún testimonio, estadística, oferta temporal, resultado o vínculo contractual es inventado.
- [ ] Contacto ARCAV funcional, sin atribuirse teléfono del prospecto.
- [ ] Política de robots para propuesta: `noindex` y no se confunde con acceso privado.
- [ ] No hay URL publicada al cliente antes de aprobación.

## Responsive y accesibilidad
- [ ] 360px, 390px, 768px y 1280px: sin overflow horizontal ni CTA inaccesible.
- [ ] Navegación/lectura en móvil de arriba abajo clara, scroll-anclas correctas.
- [ ] Teclado/focus y enlaces externos accesibles.
- [ ] Contraste adecuado, `prefers-reduced-motion`, encabezados semánticos.
- [ ] No hay mezclas involuntarias de español/portugués en nuevas páginas.

## Enlaces y funcionalidad
- [ ] Enlace de demo abre destino correcto.
- [ ] CTA contacto construye mensaje o asunto correcto.
- [ ] Enlaces generales funcionan y no rompen rutas actuales.
- [ ] Estados de carga/errores para cualquier dependencia remota si se incorpora.
- [ ] Analytics (si se añade) no envía PII y registra clic real, no mera aparición ficticia.

## Pruebas técnicas
- [ ] `npm/pnpm/yarn/bun` scripts de lint/check/build que existan completados con resultados registrados.
- [ ] No se agregan dependencias nuevas innecesarias.
- [ ] No hay cambios en DNS, despliegue, credenciales ni otros proyectos.
- [ ] `git diff` revisado; regresiones de `/es/`, `/en/`, `/pt/` revisadas.

## Entrega de Claude Code al propietario del repo
1. Archivos creados/modificados (rutas exactas).
2. Justificación de diseño y recorrido usuario.
3. Evidencia de pruebas; fallos y pendientes explícitos.
4. URLs locales de prueba y, si está autorizado, preview.
5. Bloqueadores (número WhatsApp ARCAV, autorización para nombre/logos, hosting de preview).
6. Pedir aprobación antes de publicar, sin ejecutar producción.
