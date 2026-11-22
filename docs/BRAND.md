# ARCAV — Brand

**Last updated:** 2026-11-22. Visual system: [`DESIGN.md`](../DESIGN.md). Product and audience: [`PRODUCT.md`](../PRODUCT.md). Identity kit: [`brand/v3/`](brand/v3/).

## Identity

**ARCAV** is the main brand.

**Armando Castro** is the person, experience, and credibility behind ARCAV.

Preferred relationship:

**ARCAV**
Produtos digitais e evolução de processos
**por Armando Castro**

ARCAV may grow into services, products, tools, templates, articles, and collaborations without pretending to be a large agency. It is a one-person product studio in Curitiba.

## Logo

The logo comes from the ARCAV Brand Kit V3 (approved 2026-11-21): a slanted deep-navy bar and an amber triangle that suggest an abstract A, followed by the ARCAV letters drawn as curves. The kit's guide and the 11 SVG files are in [`brand/v3/`](brand/v3/); on the site it is `src/components/ui/Logo.astro`.

- **Versions:** primary (navy and amber, for white and sand grounds), on dark (white and amber, for deep navy), one-colour navy or white, stacked, and the symbol alone. The site uses one inline drawing that takes the text colour, so the header shows the primary version and the footer the one on dark.
- **Minimum size:** the horizontal logo at 160px wide on screen; the symbol alone at 24px. The site sets it 34px tall (161px wide; symbol 31px tall).
- **Symbol alone:** only where the full logo doesn't fit, such as the site header below 420px. The accessible name stays "ARCAV".
- **Clear space:** at least half the height of the A on every side (about 10px at the site's size). Nothing enters that space, "por Armando Castro" included.
- **Don't:** stretch, rotate, recolour, reorder the colours, add shadows or effects, retype the letters with a font, or set the two-colour logo over a photo without a solid ground under it.
- **Before print or registration:** the drawing is a vector reconstruction of the approved concept; review the curves and letter spacing optically first (note from the kit).
- **Favicon and app icon:** the symbol in white and amber on a deep-navy square (`public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`).

The kit's tagline "Tecnologia para negócios e marketing" is not used on the site; the site keeps "Produtos digitais e evolução de processos".

## Brand personality

ARCAV should feel:

- Technical
- Precise
- Modern
- Premium
- Clear
- Calm
- Consultative
- Product-oriented
- Human
- Confident

It should not feel:

- Cheap
- Generic
- Trend-driven
- Overdesigned
- Hacker/cyberpunk
- Corporate-heavy
- Purely frontend
- "Jack of all trades" without depth

## Core message

The site is in Brazilian Portuguese only. These are the approved lines as published (source of truth: `src/data/site.ts`).

**Transformo processos de negócio em produtos digitais simples, automatizados e fáceis de operar.**

Supporting line: **Focados em escopo. Sérios em engenharia.**

Also published on the site:

- Não modernizo por modernizar. Primeiro entendo o que funciona e o que realmente precisa mudar.
- Ferramentas mudam. O problema do negócio vem em primeiro lugar.
- A tecnologia tem mais valor quando resolve problemas reais.

Approved earlier, not yet used on the site (translate to pt-BR when used, and confirm the wording with Armando):

- Integrar sem invadir. (already used in pt-BR in PRODUCT.md)
- Primero el proceso. Después la tecnología.
- Construir más rápido debería dejarnos más tiempo para pensar.
- El objetivo no es construir más. Es construir lo necesario.
- Orden dentro de la complejidad.

## Narrative (not a visual theme)

The story ARCAV tells, in copy and in the order of the page, is a transformation:

**Negócio → processo → produto → operação**

**Manual → conectado → automatizado → controlável**

This is a narrative, not a visual metaphor. The site does not draw it as maps, nodes or diagrams: themed visual worlds were rejected. The visual direction is "A obra em primeiro plano" (DESIGN.md).

## Tone of voice

Language: **Brazilian Portuguese (pt-BR)** only on the site. The home speaks as Armando ("eu"); the commerce page speaks as the studio ("nós").

Tone:

- Clear
- Direct
- Intelligent without sounding academic
- Technical when useful, benefit first when talking to shop owners
- Business-aware
- No hype
- No exaggerated claims

Avoid empty buzzwords such as revolucionário, disruptivo, de ponta, world-class, 10x or game-changing, unless objectively supported. Do not invent testimonials, metrics or client logos.

## Professional trajectory

Represent the international professional trajectory as:

**Venezuela → México → San Diego / EUA → Curitiba / Brasil**

Important: this is a professional trajectory (project and company connections). Do not imply Armando lived in every location unless explicitly documented.

### Venezuela
Start and education.

### México
Arkus Nexus — Frontend Developer.

### San Diego / EUA
Drata — Frontend React Developer.

### Curitiba / Brasil
Product, automation, systems, and digital solutions. ARCAV's base.

Current corporate and client work may be confidential. Describe responsibilities and product or engineering problems without exposing proprietary information.
