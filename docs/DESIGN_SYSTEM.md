# ARCAV — Design System

## Direction

**Technical Product Studio + Systems Thinking + Contemporary Editorial Design**

The interface should visually communicate:

**order inside complexity**

Use systems diagrams, routes, nodes, structured data, process flows, and editorial hierarchy as the visual language.

## Color system

The website uses a dark blue environment.

Suggested tokens:

```css
--background: #031426;
--background-deep: #020B18;
--surface: #071D36;
--surface-elevated: #0B294B;

--border: rgba(120, 176, 255, 0.20);

--text: #F5F8FC;
--text-muted: #A8BCD2;
--text-subtle: #748CA6;

--blue: #2F80FF;
--blue-light: #5BA5FF;

--coral: #FF6B52;
--coral-light: #FF8A70;
```

### Accent rule

Coral/orange is the primary action and transformation accent.

Use it for:

- Primary CTA
- Important route nodes
- Strategic highlighted words
- Active transformation states
- Key system moments

Blue belongs mainly to:

- Environment
- Technical diagrams
- Secondary interactive states
- Borders
- Data/system visualizations

Do not make every element glow.

## Typography

Preferred direction:

- Modern sans-serif for headings/body/UI
- Mono only for labels, section numbers, system states, and annotations

Good options:

- Geist + Geist Mono
- Inter + a restrained mono

Do not turn the site into a monospace developer UI.

Headlines:
- editorial
- strong
- compact
- high contrast
- fluid sizing with `clamp()`

## Layout

Desktop:
- max content width ~1280–1400px
- 12-column mental grid
- asymmetric composition allowed
- generous negative space

Approximate section rhythm:
- Desktop: 110–160px
- Tablet: 80–110px
- Mobile: 64–88px

Avoid building the whole interface from identical cards.

Use cards only when the content benefits from explicit grouping.

## Corners

Use modest radii:
- 6px–14px

Avoid excessive pill-shaped UI.

## Diagrams

Core primitives:

### Nodes
Examples:
- Lead
- Pedido
- Usuario
- Evento
- Sistema
- Automatización
- Datos

### Connections
Use thin SVG/CSS lines, arrows, routes, and paths.

### States
Examples:
- MANUAL
- CONNECTED
- AUTOMATED
- CONTROLLED

### Process composition
Examples:
- INPUT → PROCESS → OUTPUT
- Problema → Flujo → Sistema
- Sistema A → Integración → Datos → Acción

Diagrams are explanatory, not decorative.

## Map language

Use a lightweight custom SVG map.

Trajectory:
- Venezuela
- México
- San Diego / USA
- Curitiba / Brasil

Style:
- dark map
- subtle geography
- coral route
- small glowing route nodes
- technical labels

It should feel like a professional/system trajectory, not tourism.

## Motion

Allowed:
- SVG route drawing
- node activation
- connection reveal
- subtle fade/slide
- controlled hover interactions
- slow background motion

Avoid:
- bouncing
- scroll hijacking
- large 3D effects
- cursor gimmicks
- constant floating cards
- excessive parallax

Respect `prefers-reduced-motion`.

## Imagery

Do not rely on stock photography.

Use:
- custom diagrams
- product/system visuals
- approved real project visuals when available
- a real Armando portrait only in the personal section if one is provided

Do not invent product screenshots.
