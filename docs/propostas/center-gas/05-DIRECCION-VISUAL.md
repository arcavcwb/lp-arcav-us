# Dirección visual y criterios UX

## Regla principal
**La propuesta debe sentirse como una extensión natural de arcav.us/pt, no como un micrositio con marca distinta.** Claude primero inventaría tokens, clases, layouts, tipografía y patrones existentes desde el repositorio real. No introducir colores nuevos ni fuentes nuevas sin una justificación explícita.

## Tono y estilo
- Profesional, contemporáneo, confiable; claridad comercial por delante de elementos técnicos.
- Evitar: dashboards ficticios con cifras grandes, «IA» como reclamo principal, exceso de gradientes o efectos, UI de presentación de diapositivas.
- Usar jerarquía: titular fuerte, subtítulo corto, cards discretas, espacios amplios, CTAs claros.
- La demo es la prueba tangible: que el enlace y un resumen visual tengan mayor protagonismo que las características tecnológicas.
- Incluir un pequeño identificador ARCAV «Proposta preparada para Center Gás», no rediseñar ni sustituir marca del prospecto.

## Sistema visual a inspeccionar
1. Estilos globales y tokens CSS / Tailwind.
2. Tipografías cargadas y licencias existentes.
3. Navbar, botones, cards, contenedores y footer.
4. Layouts de localización ES/PT/EN.
5. Componentes interactivos existentes, iconografía y movimiento.
6. `prefers-reduced-motion`, contraste y enfoque teclado.

## Layout de la propuesta
- Mobile first, anchura central legible, secciones claras en una sola página.
- Iniciar con ARCAV y «Uma proposta para Center Gás» antes de cualquier precio.
- Análisis en «Hoy / oportunidad», sin usar rojo para hacer parecer mala la web del prospecto.
- Demo con CTA externo visible y aviso «Demonstração».
- Los precios, si se muestran, deben estar después del valor demostrado y ser legibles. No inventar descuentos del tipo «antes R$ 7.000».
- CTA al final no debe parecer botón de compra instantánea; es una invitación a conversar.

## Recursos de imagen
- Preferir capturas **reales** de la v3 generadas desde el entorno de prueba si Claude dispone de navegador y uso autorizado.
- Si no se puede capturar con calidad, usar un mockup de componentes o patrón existente **claramente ilustrativo**; nunca inventar una captura realista haciéndola pasar por la v3.
- No descargar logos o material de Center Gás para uso público sin verificar autorización; se puede usar el nombre en texto para esta propuesta dirigida.

## Accesibilidad
- H1 único, H2 por sección, navegación con anclas semánticas.
- Focus visible, estado hover + focus, indicadores de enlaces externos.
- CTA táctil ≥44×44 px preferente, contraste apropiado, evitar motion obligatorio.
- Respetar localización pt-BR, moneda brasileña, `lang="pt-BR"`.
