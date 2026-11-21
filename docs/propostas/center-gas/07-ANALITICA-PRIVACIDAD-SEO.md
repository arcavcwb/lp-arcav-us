# Eventos, privacidad y SEO

## Qué se quiere medir
Para ARCAV: interés de prospectos en la propuesta y siguiente acción. No medir ventas de Center Gás con estas métricas. Para Center Gás, un dashboard real de producto/ofertas es una etapa independiente, no parte del MVP de captación.

## Instrumentación mínima (si analytics ya existe)
| Evento | Momento correcto | Propiedades permitidas |
|---|---|---|
| `arcav_proposal_view` | Carga efectiva de página de propuesta; puede bastar pageview nativo | `proposal_slug` = `center-gas` |
| `arcav_diagnosis_view` | Sección diagnóstico entra en viewport con umbral razonable | `proposal_slug` |
| `arcav_demo_click` | Usuario hace clic en abrir demo | `proposal_slug`, `destination` = `center-gas-v3` |
| `arcav_contact_click` | Clic en CTA de contacto ARCAV | `proposal_slug`, `channel` = `whatsapp` o `email` |
| `arcav_service_click` | Clic desde página general a contacto | `service` = `comercio-digital` |

Evitar duplicar pageviews al hidratar islas / client navigation; probar las métricas en debug si el proveedor permite. No instrumentar más de lo necesario ni inventar valores de desempeño. Análisis por agregado, nunca identificación clandestina.

## KPIs que pueden presentarse después
- Visitantes de propuesta (si se mide conforme a la ley aplicable).
- Clics hacia demo / visitantes.
- Clics hacia contacto / visitantes.
- Eventos de scroll o análisis visto, como señales, no pruebas de lectura completa.

## LGPD / consentimiento
- Minimizar datos personales; no enviar texto libre de WhatsApp o correo a herramientas de tracking.
- Validar necesidad de aviso/cookies y consentimiento según implementación y proveedor; respetar política de privacidad ya existente.
- No generar enlaces de prospectos con identificadores personales/ocultos salvo necesidad justificada.

## SEO
Servicio genérico: título claro (ej. «Sites, Pedidos e Campanhas para Comércios em Curitiba | ARCAV»), H1 natural, canonical, enlaces internos desde home.

Propuesta personalizada: `noindex`; omitirla del sitemap si el sistema lo permite. `noindex` no es autenticación. No publicar detalles confidenciales si la URL es accesible sin autenticación.

## Medición del futuro servicio de promociones (NO implementarlo ahora)
Eventos separados por producto/oferta tales como `offer_view`, `product_click`, `whatsapp_order_intent`; métricas reales de ventas requieren integración de pedidos, conciliación o confirmación operativa. No crear dashboard con cifras ficticias sin rotular «exemplo».
