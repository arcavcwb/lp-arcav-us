# UX / Funnel / arquitectura de información

## Ruta de entrada recomendada
Enviar por WhatsApp la URL personalizada `https://arcav.us/pt/propostas/center-gas/` cuando esté realmente publicada. Esta misma landing integra **servicio → diagnóstico → demo** en secuencia; evita que el visitante tenga que buscar manualmente la propuesta entre varias páginas.

## Dos superficies distintas

### A. Servicio reutilizable (público)
**Ruta preferida:** `/pt/solucoes/comercio-digital/`.

Audiencia: comerciantes de Curitiba. Explica la oferta general «Sites, pedidos e campanhas inteligentes» sin nombrar a Center Gás, precios de un cliente ni casos no autorizados. Debe ser accesible desde el bloque de servicios de ARCAV, sin cambiar la home por completo.

Secciones: 1) beneficio, 2) tres pilares «pedidos / ofertas / acompanhamento», 3) proceso simple de trabajo, 4) ejemplo conceptual explícitamente ilustrativo, 5) CTA contactar.

### B. Propuesta personalizada (no indexada)
**Ruta preferida:** `/pt/propostas/center-gas/`.

Audiencia: responsable de Center Gás. Contenido recomendado en este orden:

1. **Header mínimo ARCAV**, vínculo claro al sitio institucional y logo/identificación textual del prospecto («Proposta preparada para Center Gás Curitiba»).
2. **Hero orientado al resultado:** «Uma maneira mais simples de receber pedidos e divulgar ofertas». Subtítulo: propuesta con análisis + demostración. CTA de desplazamiento «Ver o que preparamos».
3. **Qué hace ARCAV (resumen corto):** tres beneficios comerciales, sin jerga técnica.
4. **Análisis de la web actual:** reconocer fortalezas y 2–3 oportunidades verificadas; tabla o dos columnas «Hoje / Possibilidade».
5. **Solución aplicada al caso:** cómo sería «gás + água no mesmo pedido»; no vender garantías.
6. **Demo:** vista previa o ilustración del flujo si hay un recurso autorizado; CTA **«Testar demonstração da Center Gás»** a `https://centergas-v3.pages.dev/` en pestaña nueva, con salida y retorno entendibles. Evitar iframe salvo que se pruebe y respete accesibilidad.
7. **Ofertas y acompañamiento:** frecuencia diaria/semanal/mensual, producción asistida por IA con aprobación humana; no anunciar el panel como terminado.
8. **Precios / fases (opcional visible después de la demo):** sitio R$ 3.900; plan semanal R$ 490/mes; diario R$ 890/mes. Panel avanzado e implantación del motor de campañas = presupuesto separado. Debe quedar muy claro qué está incluido y qué no.
9. **CTA final:** «Vamos conversar?» a ARCAV, que reabra WhatsApp o email con un texto predefinido; nunca al WhatsApp de pedidos de Center Gás.
10. **Footer:** enlace discreto a ARCAV y aviso de «demonstração / proposta independente».

## Wireframe móvil textual
```text
[ARCAV]                 [Proposta para Center Gás]

Uma maneira mais simples de receber pedidos
... 
[Ver nossa análise ↓]

[✓ Pedidos organizados] [✓ Ofertas frequentes]
[✓ Acompanhar o interesse]

O que já funciona hoje
  ✓ catálogo e atendimento pelo WhatsApp
O que podemos evoluir
  → carrinho com vários produtos
  → campanhas e destaques

Um exemplo de pedido
  Gás P13 + Água 20 L → WhatsApp
[TESTAR DEMONSTRAÇÃO ↗]

Sua próxima oferta pode estar no ar...
  Você informa → ARCAV prepara → Você aprova

Planos e investimento [expande / seção abaixo]

[CONVERSAR COM ARCAV]
```

## Navegación y ergonomía
- Prioridad absoluta móvil (360px y 390px). Sin menú complejo dentro de la propuesta.
- Primer CTA no debe sacar al usuario antes de entender la oferta; conduce al diagnóstico. Segundo CTA lleva a demo. Tercero al contacto.
- Si el visitante regresa desde la demo, se debe poder continuar en propuesta sin perder contexto.
- HTML semántico, teclado, objetivos táctiles adecuados, contraste y `prefers-reduced-motion`.
- No auto-reproducir videos ni usar banners animados que distraigan.
- Solo una acción primaria visual a la vez.

## Posible reutilización futura
Separar contenido `proposals/center-gas` de los componentes de plantilla. Nuevos prospectos = contenido adicional y rutas nuevas, con acceso y permisos gestionados por caso. No crear CMS para el MVP.
