---
name: ARCAV
description: The category-standard studio page, finished to a product-company bar. White ground, deep-navy ink, electric-blue actions and one amber mark (Brand Kit V3).
colors:
  accent: "#2563eb"
  accent-strong: "#1d4ed8"
  accent-tint: "rgb(37 99 235 / 0.1)"
  highlight: "#f59e0b"
  ink: "#0b1f3b"
  muted: "#334155"
  bg: "#ffffff"
  surface: "#f5f3ee"
  surface-strong: "#eae6dc"
  line: "#e2e8f0"
  line-strong: "#cbd5e1"
  line-control: "#7c8ca2"
  dark: "#0b1f3b"
  dark-raised: "#13294b"
  on-dark: "#ffffff"
  on-dark-muted: "#cbd5e1"
  on-dark-line: "#1e3355"
  on-dark-line-control: "#657690"
  status-error: "#b42318"
typography:
  display:
    fontFamily: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.028em"
  headline:
    fontFamily: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.75rem, 1.35rem + 1.5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.024em"
  title:
    fontFamily: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.012em"
  lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
  button:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
  caption:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
  subhead:
    fontFamily: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title-sm:
    fontFamily: "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  meta:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.45
rounded:
  tight: "4px"
  control: "10px"
  card: "14px"
  device: "2.75rem"
  device-screen: "2.2rem"
  pill: "999px"
spacing:
  container: "1200px"
  gutter: "clamp(1rem, 0.4rem + 2.6vw, 2.5rem)"
  section: "clamp(2rem, 1.4rem + 2vw, 3.25rem)"
  section-head: "clamp(1.75rem, 1.5rem + 1vw, 2.5rem)"
  card-padding: "clamp(1.5rem, 1.2rem + 1vw, 2rem)"
  grid-gap: "1rem"
  header: "4.25rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  button-ghost:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-ghost-on-dark:
    backgroundColor: "transparent"
    textColor: "{colors.on-dark}"
  button-sm:
    padding: "0 1rem"
    height: "2.5rem"
  link-arrow:
    textColor: "{colors.accent-strong}"
  link-arrow-on-dark:
    textColor: "{colors.highlight}"
  card:
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  panel-dark:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.card}"
    padding: "clamp(1.75rem, 1.25rem + 2vw, 2.75rem)"
  icon-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "2.75rem"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem 0.875rem"
    height: "3rem"
  nav-link:
    textColor: "{colors.muted}"
    rounded: "8px"
    padding: "0.5rem 0.75rem"
  nav-link-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  plan-badge:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent-strong}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.625rem"
  phone-frame:
    backgroundColor: "{colors.dark}"
    rounded: "2.75rem"
    padding: "0.625rem"
    width: "19.75rem"
  bubble-in:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "0.875rem 1rem"
  bubble-out:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    padding: "0.875rem 1rem"
---

# Design System: ARCAV

## Overview

**Creative North Star: "A obra em primeiro plano"** (the work up front; adopted 2026-11-21, replacing "The Finished Standard")

ARCAV presents itself as a studio that publishes its work, not as a services page. The main material is the real work (screenshots of external projects) and the person (Armando), set in an editorial composition: strong contrast of type scale, an asymmetric 12-column grid, images that take real space and few surfaces. It is a way of composing, not a theme: nothing on the page is a costume (no order pad, tile wall, flyer or transit map). The previous North Star ("looks like the category, distinguished by finish") produced a tidy page that could belong to any consultant; tokens, type and brand rules stay, the composition and the material change. Audit and reasoning: `docs/auditorias/AUDITORIA-VISUAL-HOME.md`.

The world is white paper and warm sand, deep-navy ink, electric blue for what you can do and one small amber mark. Cool slate neutrals carry structure: hairlines, dividers and the borders that identify controls. Sand is the alternate section ground. Deep navy is the only heavy fill and is used for emphasis blocks, the closing sections, the footer and the phone body. Electric blue never fills a surface: it marks what to do (primary actions, text links, focus on light grounds) and what has been confirmed on a light ground (check marks). Amber is the secondary accent: the triangle of the logo, marks and links on navy, focus on navy and the progress of the demo guide. Density is moderate and mobile-first, because the primary reader is a Curitiba shop owner who opens the link from WhatsApp on a phone in daylight. That use case is why the system is light only.

The identity comes from the ARCAV Brand Kit V3 (`docs/brand/v3/`, approved 2026-11-21), which replaced the graphite-and-terracotta palette and Schibsted Grotesk. The confirmed visual rejections are themed metaphors that dress up the site, neon and glows, gradients, glass effects, section kickers or eyebrows, invented metrics, and any colour outside the kit used as a brand colour (red and green included).

**Key Characteristics:**
- White and sand grounds, deep-navy ink, electric-blue actions and one amber accent; neither accent fills a surface.
- Two self-hosted families: Manrope for headings and editorial lines, Inter for text and interface.
- The logo is a drawing (`Logo.astro`): a slanted bar, an amber triangle and the ARCAV letters in curves. Below 420px the header shows the symbol alone.
- Hairlines first. Soft shadows appear only on the phone demo and on panels that hold an interaction or a result.
- Editorial scale: a display H1, feature H2s and a large manifesto quote against precise 13–15px data.
- Sequences are ruled lists with `01`–`0n` numerals, never cards; numerals appear only where the order is the information.
- One deep-navy band mid-page (the manifesto) and a deep-navy close (contact and footer).
- Motion happens once: an entrance on load, a staggered list, a wiped quote; nothing loops or decorates.
- Authored line icons on a 24-unit grid with a 1.75 stroke.
- A working phone demo (an order assembled and composed into a WhatsApp message) is the signature object.
- Light theme only.

## Colors

The palette is cool slate and deep navy, with electric blue for action and one warm amber accent. Restraint with the two accents is what keeps the page calm. Values live in `src/styles/tokens.css`; the derived tones (hover, lines, raised navy, muted text on navy, control borders) were approved with the migration plan, with their contrast measured.

### Primary
- **Electric Blue** (#2563eb): fills primary buttons (white label, 5.17:1), draws the 2px focus outline and the input focus border on light grounds, sets the caret, strokes check marks on light grounds ("O que entra", "Para quem é", the inbox note, the sent confirmation), the services arrow on hover and the icon well of the selected landing option. It is never a section, band or card fill. On navy it drops to 3.19:1, so it never sets text, marks or focus there.
- **Deep Blue** (#1d4ed8): the hover state of primary buttons and the colour of text links with an arrow and of the service names (6.70:1 on white, 6.04:1 on sand). Text-sized blue always uses this darker shade.
- **Blue Wash** (rgb(37 99 235 / 0.1)): the 3px focus halo on inputs. Text selection uses the same hue at 0.2 alpha.
- **Amber** (#f59e0b): the secondary accent. The triangle of the logo, the check marks in the manifesto "after" column, text links on navy and the keyboard focus on navy (7.68:1 on navy), and the progress of the demo guide (current and done step badges, with the number or check in deep navy, 7.68:1). It never sets text on white or sand (2.15:1).

### Neutral
- **Paper White** (#ffffff): page ground, card faces, input faces, the phone screen and the ghost button face. It is also the browser theme colour.
- **Sand** (#f5f3ee): alternate section ground (`muted` sections), icon wells, the cart pill, the incoming chat bubble, the composed-message panel, and hover fills on nav links and steppers.
- **Deep Sand** (#eae6dc): avatar and portrait placeholder ground (behind the "AC" initials) and the demo guide's resting number badges.
- **Deep Navy Ink** (#0b1f3b): all headings and body text (16.49:1 on white, 14.87:1 on sand). It also draws the 1px rule that opens a ruled list, the outgoing chat bubble, the phone's send button, the selected landing option and the current step of the demo guide.
- **Slate** (#334155): secondary text such as leads, descriptions, captions, nav links at rest, step numerals and form hints (10.35:1 on white, 9.34:1 on sand).
- **Hairline** (#e2e8f0): card borders, row dividers, the scrolled header border and the divider inside cards.
- **Firm Hairline** (#cbd5e1): decorative dividers only: the rule that opens each section, the rows of services, method and FAQ, the demo guide pills and the scrollbar.
- **Control Line** (#7c8ca2): the border that identifies a control: ghost buttons, inputs, the menu toggle, the window's close button, the demo steppers and the landing options (3.43:1 on white, 3.09:1 on sand).
- **Deep Navy** (#0b1f3b, the fill role of the ink): the footer, the closing sections, the manifesto and the phone body.
- **Raised Navy** (#13294b): wells sitting on a navy panel (amber on it: 6.76:1).
- **White on Navy** (#ffffff): text on navy.
- **Muted on Navy** (#cbd5e1): secondary text on navy (11.11:1).
- **Navy Rule** (#1e3355): dividers on navy.
- **Control Line on Navy** (#657690): ghost-button borders on navy (3.57:1).

### Status
- **Validation Red** (#b42318): form validation only, used for the invalid input border and the error message text (6.57:1). It is a status signal and not a brand colour.

### Named Rules
**The Blue Acts, Never Fills Rule.** Electric blue appears as a filled button, a text link, a check mark on a light ground, a focus ring or a 10% tint. It never becomes the background of a section, band, panel or card. When a block needs emphasis, it goes navy.

**The Navy Is the Second Voice Rule.** Emphasis that isn't an action is carried by a navy fill (the manifesto, closing sections and the footer), not by a new colour.

**The Amber Stays Small Rule.** Amber is a mark, never a surface and never text on a light ground: the logo triangle, marks, links and focus on navy, and the demo's progress badges with a navy glyph. On white or sand a mark that must be read goes blue instead.

**The Focus Follows the Ground Rule.** The focus outline uses `--color-focus`: Electric Blue on light grounds, Amber inside `.section--dark` and the footer, where blue would fall to 3.19:1.

**The Status Is Not Brand Rule.** Red and green are not ARCAV colours. Validation Red exists only to say "this field needs attention" and is never used for decoration or emphasis.

## Typography

**Heading Font:** Manrope (self-hosted variable woff2, weights 200 to 800, latin and latin-ext subsets, SIL OFL), falling back to Inter and system-ui. Token: `--font-heading`.
**Body Font:** Inter (self-hosted variable woff2, weights 100 to 900, latin and latin-ext subsets, SIL OFL), falling back to ui-sans-serif and system-ui. Token: `--font-sans`.

**Character:** Manrope is a geometric grotesk with open counters that holds a 52px headline with tight tracking; Inter is a neutral interface face that stays plain at 13–15px. The split follows the Brand Kit V3: Manrope for titles and editorial lines, Inter for text, navigation, controls, forms and metadata. Inside each family, steps of weight (400, 500, 600, 650, 700) carry the hierarchy.

**Loading:** both latin subsets are preloaded (Inter 48 KB, Manrope 25 KB). Without Inter preloaded, text swapped fonts after the first frame and the solution pages jumped (CLS up to 0.035). The latin-ext subsets load only when a page uses one of their characters.

### Hierarchy
- **Display** (Manrope 700, clamp 2rem→3.25rem, line-height 1.08, −0.028em): the H1 of the other page heroes, capped at about 17em wide so it wraps to three or four lines on desktop.
- **Feature headline** (Manrope 700, clamp 2rem→3.5rem, 1.08, `.h2--feature`): the H2 of the home's key sections (services, method, contact).
- **Quote** (Manrope 600, clamp 1.75rem→3.5rem, 1.12, −0.024em): the manifesto quote, in 9 of 12 columns.
- **Index phrase** (Manrope 600, clamp 1.375rem→2.25rem, 1.25, −0.015em): the client's sentence in each services row.
- **Numeral** (Manrope 400, clamp 1.5rem→3rem, line-height 1, Slate, tabular): method step numbers.
- **Headline** (Manrope 700, clamp 1.75rem→2.5rem, 1.12, −0.024em): section H2s. They are often hand-broken into two balanced lines, and `text-wrap: balance` is on for all headings.
- **Title** (Manrope 650, 1.25rem, 1.3, −0.012em): card and plan H3s.
- **Subhead** (Manrope 600–650, clamp 1.25rem→1.5rem, −0.015 to −0.02em): case titles and the About statement.
- **Title small** (Manrope 650, 1.125rem): step titles, the pricing suggestion line and the Problem quote (500).
- **Lead** (Inter 400, clamp 1.0625rem→1.25rem, 1.55, Slate, max 38em): the paragraph under a heading.
- **Body** (Inter 400, 1.0625rem, 1.6): running text, with `text-wrap: pretty` on paragraphs and list items.
- **Body small** (400, 0.9375rem): notes, hints, plan inclusions and step descriptions.
- **Label** (600, 0.9375rem): form labels, comparison column labels and table headers. Nav links use the same size at 500.
- **Meta** (400 to 600, 0.875rem): form hints and errors, the form note, case metadata, About fact terms, the phone's cart count and order summary.
- **Caption** (400 to 600, 0.8125rem, 1.45): figure captions under demos, process flows (500), badges (600) and footer fact terms (600).
- **Logo:** not type. The ARCAV letters are part of the drawing (`Logo.astro`); "por Armando Castro" beside it is Inter 0.875rem/400 in Slate, set 4px lower so its baseline meets the baseline of the letters.

Everything not named Manrope above (body small, label, meta, caption, buttons, nav, forms, the phone demo) is Inter.

Big numbers (plan prices) are set at 700, clamp 2rem→2.5rem, −0.03em. Quantities, counters and step numerals use tabular figures.

### Named Rules
**The Two Families Rule.** Manrope sets headings and editorial lines (h1–h3, the manifesto quote, the services phrases, the method titles and numerals, the About statement); Inter sets everything else. There is no third family and no system display face.

**The Heading Stands Alone Rule.** No kicker, eyebrow or small label sits above a section heading. The H2 opens the section by itself, and an optional lead follows beneath it.

**The Sentence Case Rule.** Labels, buttons, nav and captions are in sentence case. Uppercase appears only in the ARCAV letters of the logo.

## Layout

The layout is a single centred column: a 1200px container with a fluid gutter (16px→40px). Sections use fluid vertical padding (32px→52px), kept tight so one section leads straight into the next. The section directly after a page hero starts closer (32px→48px) so that it peeks above the fold. Section grounds alternate between Paper White and Sand, never two of the same ground in a row, and every section except a navy one opens with a 1px Firm Hairline (#cbd5e1) rule across the full width so the boundary reads even where the two grounds are close. Every page ends with a navy closing section that leads into the navy footer, separated by a Navy Rule.

- **Page hero:** a single column on mobile. At 960px and above it becomes a two-column grid of fluid copy and a fixed 20rem demo column, with the phone vertically centred. On the home page a byline row (avatar, name, statement, with a hairline above) sits under the copy and stops at 30rem. The hero actions are a primary button plus a ghost button, and at 479px or less they flex to share the row.
- **Section head:** max 44rem wide, followed by 36px→56px of space before the content.
- **Card grids:** a single column, becoming three equal columns at 880px with a 16px gap. Service cards use subgrid rows so that the icon, title, text and flow line up across cards.
- **Splits:** text beside an illustration or form from 880 to 900px, weighted about 1 : 0.9 (the contact section reverses this to give the form the wider column). The contact copy column is sticky under the header.
- **Ruled steps:** one column, two at 720px, and three or four at 1024px.
- **Header:** sticky, 68px tall, on Paper White. A Hairline border fades in after 8px of scroll. Below 900px the nav collapses into a dropdown panel. The logo shows as the symbol alone below 420px and in full from 420px; "por Armando Castro" joins it from 640px.
- **Footer:** deep navy, with three columns at 800px (brand and statement, links, facts) and then a Navy Rule over the copyright and social row.

Breakpoints in use are 420 (logo), 480, 560, 640, 720, 800, 880, 900, 960 and 1024px, and the base styles are mobile first. Reference widths are 360 and 390px; the header is validated at 320, 360, 390 and 430px.

### Named Rules
**The Ruled Sequence Rule.** Anything ordered (method, process, offer steps) is a ruled list. A 1px Deep Navy Ink rule opens it, each item sits on a Firm Hairline, and an inline `01`, `02`, … numeral in Slate tabular figures leads each item. Sequences are never boxed into cards. The case list uses the same ink-topped, hairline-divided construction.

**The Peek Rule.** The first section after a hero uses the reduced top padding so that the next content is visible on first load.

**The Home Rhythm Rule.** The home alternates kinds of moment, not just grounds: hero (paper, air, display type and portrait), services index (paper, dense type), examples (sand, image), manifesto (navy, air, one big quote), method (paper, dense table with a sticky title from 960px), about (sand, portrait), contact (navy, form on top), footer (navy). Navy appears once mid-page, then closes the page.

**The 12 Columns Rule.** Asymmetric splits come from a 12-column grid (8/4 hero, 4/8 method, 5/6 manifesto head, 9 for the quote) inside the 1200px container, so every left edge stays aligned with the header.

## Elevation & Depth

The system is flat and hairline-first. Surfaces at rest are separated by 1px borders and by the Paper White / Sand alternation, not by shadow. Shadows are soft, navy-tinted and offset downward, and they appear only on objects that hold an interaction or a result: the phone demo, the contact-form card, the inbox illustration and the suggested plan. Focus is shown with an outline rather than a shadow, except on inputs, which use a tinted halo.

### Shadow Vocabulary
- **Raised panel** (`box-shadow: 0 1px 2px rgb(11 31 59 / 0.06), 0 14px 32px -14px rgb(11 31 59 / 0.22)`): the contact-form card (whose border goes transparent), the inbox illustration and the suggested plan card.
- **Phone** (`box-shadow: 0 2px 6px rgb(11 31 59 / 0.1), 0 40px 70px -30px rgb(11 31 59 / 0.45)`): the hero phone demo only.
- **Menu drop** (`box-shadow: 0 18px 30px -24px rgb(11 31 59 / 0.35)`): the mobile nav panel under the header.

### Named Rules
**The Earned Shadow Rule.** A surface gets a shadow only when it holds something the visitor does or receives, such as an order, a form, a composed reply or a recommended plan, and, once the portfolio exists, project screenshots, because they are the product. Ordinary cards stay flat with a Hairline border.

## Shapes

The corner language has two radii plus the pill. Controls (buttons, inputs, icon wells, the menu toggle) use 10px. Containers (cards, panels, plans, the diagnosis table, the composed-message panel and the 4:5 portrait) use 14px. Fully round pills are used for the stepper, the cart count, badges and avatars. Header nav links use the 10px control shape on hover. A tight 4px corner is reserved for the focus ring and the speaker-side tail of chat bubbles (14px elsewhere). The phone is the only large-radius object (device 2.75rem body, device-screen 2.2rem) and has a pill notch. Borders are always 1px. Icons are drawn line art on a 24-unit grid with a 1.75 stroke and round caps and joins, inherit `currentColor`, and render at 16–24px.

## Components

### Buttons
Buttons are solid and plain: a label, an optional trailing arrow (or a leading glyph for mail and send), and no ornament.
- **Shape:** gently rounded controls (10px), at least 48px tall, with 20px inline padding, a 1rem/600 label and an 18px icon with an 8px gap.
- **Primary:** Electric Blue with a white label. It is used for the one main action in each region, such as "Falar com a ARCAV", "Fale comigo", the commerce CTA, form submit and the closing CTA.
- **Hover / Active / Focus:** hover deepens the fill to Deep Blue over 0.18s. Active nudges the button down 1px with the house ease-out. Focus draws a 2px outline offset by 3px in the focus colour (blue on light grounds, amber on navy).
- **Ghost:** Paper White face, Control Line border and Deep Navy Ink label. On hover the border goes to the ink. On navy grounds it turns transparent with a Control Line on Navy border and a white label.
- **Small:** 40px tall with 16px padding and a 0.9375rem label. It is used for the header CTA and for the actions in the composed-message panel. This size sits below the 44px touch-target commitment, so don't extend it to new primary mobile actions.
- **Disabled:** 55% opacity, a not-allowed cursor and no motion. Example: "Revisar pedido" when the cart is empty.
- **Mobile:** at 479px or less, closing CTAs, demo CTAs, the form submit and the commerce CTA go full width.

### Text link with arrow
- **Style:** 600 weight in Deep Blue, with a trailing arrow (or an external-link glyph) inline at about 17px.
- **Hover:** underline (1px, offset 0.22em), and the arrow slides 3px right.
- **On navy:** Amber.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Paper White with a 1px Hairline border. Cards sit on either section ground.
- **Shadow Strategy:** flat. See The Earned Shadow Rule.
- **Internal Padding:** fluid, 24px→32px.
- **Service / feature card:** a 44px icon well (Sand, 10px, with a 22px line icon) above a Title, a muted description and, for services, a process flow under a Hairline divider.
- **Navy panel:** a Deep Navy fill at 14px used for one emphasis block, such as the "Tem um comércio local em Curitiba?" band (icon well in Raised Navy, white title, muted body, and a blue button pushed to the right at 880px) or the "after" column of the before/after comparison, whose check marks are Amber. The "before" column is a white card with muted text and minus marks.

### Process flow
This is an inline sequence of short words such as "Visita → Formulário → Lead → Automação" at 0.8125rem/500 in Slate, joined by small arrow glyphs at 60% opacity. It wraps freely. It is also used for Armando's trajectory, in ink on light grounds and in white on navy in the footer.

### Inputs / Fields
- **Style:** Paper White face, Control Line border, 10px radius, at least 48px tall (textareas start at 136px and resize vertically) and a 1rem text size. A 600-weight label sits above, with "(opcional)" in Slate at 400. Hints are 0.875rem in Slate.
- **Hover:** the border darkens to the ink.
- **Focus:** the border turns Electric Blue and a 3px Blue Wash halo appears, with no outline.
- **Error:** the border and the message text turn Validation Red (message 0.875rem/500). Messages are written in a friendly first person, and the error is cleared as the visitor types.
- **Composed message:** after submit, a Sand panel (14px) shows a 600-weight status line, then the exact message in a white, hairline-bordered 10px box, then small ghost buttons for "Abrir de novo" and "Copiar mensagem".

### Navigation
- **Header:** the logo with its byline on the left. On the right are nav links at 0.9375rem/500 in Slate, which hover to the ink on a Sand 8px pill, followed by the small primary "Fale comigo", which opens the contact form window.
- **Mobile (below 900px):** a 44px menu toggle (Control Line, 10px) swaps between menu and close glyphs. The nav is a popover: a full-width white panel under the header with the menu-drop shadow, its links 1.0625rem ink rows divided by Hairlines. The toggle, Escape and a tap outside close it without JavaScript; choosing a link also closes it. Below 640px the "por Armando Castro" byline hides, and below 420px the logo shows the symbol alone.
- **Footer:** see Layout. Links are white on navy and underline on hover. Social links carry a small external glyph at 70% opacity.

### Ruled steps
See The Ruled Sequence Rule. The compact variant has a 1.125rem/650 step title above a muted 0.9375rem line. The text-only variant (process and offers) sets a single 1rem/500 ink line per step.

### Phone demo (signature)
A working order demo drawn in CSS rather than an image. It has a Deep Navy body (44px radius, 10px bezel, Phone shadow) with a pill notch, and a white screen whose height grows with the product count. The store view has an app bar (store name 1.0625rem/700, note in caption size, a Sand cart pill with a live count), product rows divided by Hairlines, and a pill stepper (Control Line outline, round − and + buttons, and a tabular quantity that bumps from 1.35× scale over 260ms). At the bottom are a live summary and a full-width primary button labelled **"Revisar pedido"**. Pressing it slides in the message view (0.4s ease-out, with the store view sliding 24% left and fading). That view has a back button, the title "Pedido pronto", the composed order in a Sand bubble, a hint line and a full-width Deep Navy Ink "Enviar pelo WhatsApp" button. Above the phone, the optional "Experimente" guide shows three steps as pills: the current one is a navy pill, and the current and done steps carry an amber badge with the number or a check in navy (progress is the one place amber appears on a light page). Without JavaScript the demo shows the initial order statically. A centred caption below states that the store is an example and not a real client. It stays on the commerce page until the external store example exists; then it becomes a screenshot with a link, and its code leaves this repository.

### Inbox illustration (signature)
This is the shop's side of the same order: a white Raised-panel card (14px) with a header row (a Deep Sand initial avatar and "Cliente pelo site" with a muted channel line), an incoming Sand bubble holding the order lines in 600 weight, and an outgoing Deep Navy Ink bubble with the shop's reply. Under the thread sits a 600-weight note led by a blue check. A caption labels it as an illustration, not a screenshot.

### Brand mark & portrait slots
- **Logo:** `src/components/ui/Logo.astro`, the Brand Kit V3 drawing inline (reference files in `docs/brand/v3/logos-svg/`). The bar and the letters take `currentColor` (navy on light grounds, white in the footer) and the triangle takes `--color-highlight`, so one component serves both grounds. Height 34px (`--spacing-logo`): the full logo is 161px wide (kit minimum 160px) and the symbol alone 31px tall (kit minimum 24px). In the header, below 420px (`--breakpoint-logo`), the same drawing is cropped to the symbol (`preserveAspectRatio` slice). The accessible name is always "ARCAV". Usage rules are in `docs/BRAND.md`.
- **Photos:** real photos only, listed in `src/data/photos.ts` and stored in `src/assets/fotos/` (`retrato-trabalho` for the home hero, `retrato` for About and the 44px round avatar of whoever answers). Until a photo arrives, its slot shows a labelled grey marker during build-out; the avatar shows the initials **"AC"** (700 weight, Deep Navy Ink on Deep Sand). A fake or stock photo is never used.
- **Favicon:** the kit symbol (white bar, amber triangle) on a deep-navy rounded square, a square version of `docs/brand/v3/logos-svg/favicon.svg`: `public/favicon.svg`, `public/favicon.ico` (16, 32 and 48px) and a full-bleed 180px `public/apple-touch-icon.png` (iOS applies its own mask).

### Implementação (Tailwind v4, 2026-11-21)

Os tokens deste documento vivem em `src/styles/tokens.css` como tema do Tailwind (`@theme`), sem o tema padrão do Tailwind (`--*: initial`): só existem as cores, tamanhos, entrelinhas, espaços, larguras, grades, raios, sombras, durações, curvas e pontos de quebra da marca. **Nenhum valor solto:** uma cor, um tamanho ou um espaço novo entra primeiro aqui e no `tokens.css`, com nome, e nunca direto no componente, no CSS ou num script. O mesmo vale para o texto: componentes não escrevem palavras, leem de `src/data/`. As peças compartilhadas (shell, section, page-hero, h1/h2/lead, btn, link-arrow, card, steps, flow) ficam em `src/styles/primitives/`; cada componente tem o seu CSS em `src/styles/components/<pasta>/`, com classes próprias (ver o parágrafo seguinte). Detalhes no README.

**Classes próprias (2026-11-21).** Os componentes não usam utilitários do Tailwind no marcado: cada elemento tem uma classe com nome (BEM, `.services__link`) e o estilo fica em `src/styles/components/<pasta>/<componente>.css`, montado com `@apply` e os tokens. Camadas: `theme < base < primitives < components < utilities` (vazia).

A tokenização preservou o visual aprovado ao pixel, por isso a escala ainda tem valores muito próximos (13 entrelinhas, 9 pontos de quebra, 3 distâncias de bloco dividido). A consolidação dessa escala faz parte do redesenho editorial (`docs/auditorias/AUDITORIA-VISUAL-HOME.md`).

### Fase A da direção editorial (2026-11-21)

- **Hero:** H1 na escala normal dos heros (o título gigante foi rejeitado em 2026-11-21), com subtítulo e ações em 8 de 12 colunas e o retrato de trabalho nas 4 últimas, centrado na altura do texto. A ação principal abre a janela do formulário.
- **Serviços:** índice editorial sem caixa (fio escuro em cima, filetes entre linhas). Cada linha: a frase do cliente em `text-index`, o serviço e a frase curta à direita, seta; no hover a linha anda 4px e a seta fica azul. Linhas tocáveis com 64px ou mais no celular.
- **Manifesto (antigo Problema):** seção azul profundo com mais ar (`section--feature`); título e texto menores no alto, a citação em `text-quote` em 9 colunas com a assinatura, e Hoje/Depois em duas colunas com filetes (Hoje apagado, Depois claro com checks âmbar). Sem cartões.
- **Método:** título fixo à esquerda (4 colunas, a partir de 960px) e os seis passos à direita como tabela: numeral grande, título, texto.
- **Contato:** o mesmo fechamento azul profundo das outras páginas (`ClosingContact` com `channels` e `feature`): título maior, quem responde, canais e um botão. O formulário não ocupa a página: abre numa janela (`popover`) clara sobre fundo escurecido, que no celular ocupa a tela inteira. "Fale comigo", a ação do hero e "Quero isso na minha loja" abrem a mesma janela.
- **Rodapé:** quatro colunas (marca, navegação numa coluna só, contato e localização, trajetória), com um filete em cima, separando do fechamento escuro.

### Brand Kit V3 (2026-11-22)

- Paleta, fontes, logo e ícones do kit (`docs/brand/v3/`) aplicados só pelos tokens: os nomes ficaram, os valores mudaram (`clay` virou `highlight`; entraram `--color-focus`, `--color-line-control`, `--color-on-dark-line-control`, `--font-heading`, `--spacing-logo`, `--aspect-logo`, `--aspect-symbol` e `--breakpoint-logo`).
- Medido por etapa: Inter deixou as páginas de 0 a 2,6% mais altas (parágrafos); Manrope encurtou quatro títulos em uma linha. Sem estouro em 320–1440px; CLS 0; contraste AA em todos os textos; foco com 4,66:1 ou mais.

### Fotos (2026-11-21)

- Fotos reais, nunca de banco de imagens nem geradas por IA. Lista, proporção e tamanho mínimo em `src/data/photos.ts`; arquivos em `src/assets/fotos/`.
- **Hero da home:** retrato de trabalho 4:5 nas quatro últimas colunas (`grid-cols-hero-portrait`, 2:1), centrado na altura do texto, com a legenda "Armando Castro · Curitiba" no lugar da antiga assinatura. No celular, depois das ações, a toda a largura, em 4:3.
- **Sobre:** retrato próximo 4:5 à esquerda, texto à direita (`grid-cols-aside` a partir de 900px).
- Enquanto a foto não chega, o lugar mostra um marcador `surface-strong` com "Foto em breve", a descrição e o tamanho; não é uma foto falsa.

### Soluções e exemplos (2026-11-21)

- **Solution page** (`src/components/solution/SolutionPage.astro`, rota `src/pages/solucoes/[slug].astro`, dados em `src/data/solutions.ts`): hero com a captura do exemplo à direita, "Para quem é" e "O que está incluído" como listas com filete (sem cartões), "Como funciona" como sequência numerada com filetes, perguntas frequentes, "Outras soluções" e o bloco de contato escuro. Cabeçalho mínimo (marca + "Fale comigo"), rodapé com todas as soluções.
- **Example frame** (`ExampleFrame.astro`): captura 16:10 de um exemplo dentro de uma janela de navegador (barra `surface`, três pontos `line-strong`, URL em pílula), raio de cartão, sombra elevada; sobe 3px no hover. Legenda: "Exemplo · <nome do exemplo>".
- **Serviços por situação** (`home/Services.astro`): os cinco serviços com o mesmo peso (site institucional, migração, landing pages, comércio, automação) como índice editorial (ver "Fase A"): a frase do cliente entre aspas, o serviço e a frase curta, seta. Antes da lista: "Qual destas frases parece com o seu momento?". Os tipos de landing page vivem em `/solucoes/landing-pages/`. A mesma lista (`SERVICES`) alimenta o rodapé e "Outras soluções".
- **Landing flow** (`solution/LandingFlow.astro`, só em `/solucoes/landing-pages/`): ficha para leigos. A pessoa escolhe o objetivo em linguagem simples ("Quero passar confiança", "Quero contatos de um anúncio", "Quero vender um produto", "Quero inscrições para um evento"), em botões de opção nativos (as setas do teclado trocam a opção, sem JavaScript); embaixo aparece a ficha só daquela página: o nome e a frase curta, "O caminho do seu cliente" (`SolutionFlow` sem moldura) e, ao lado, "Para quem é", "O que entra" (4 itens) e o link. Não se mostra o mapa com todas as opções apagadas: os visitantes se perdiam nele (feedback de 2026-11-21).
- **Transição entre páginas**: `@view-transition { navigation: auto; }` (navegadores compatíveis). O nome curto do bloco tem `view-transition-name: sol-<slug>` e viaja até o H1 da página da solução; o cabeçalho fica fixo durante a troca. Tudo desligado com `prefers-reduced-motion`.
- **Exemplos** (`home/Examples.astro` + `home/ExampleShowcase.astro`): seção própria com a captura grande do exemplo que funciona e, ao lado, o nome, uma linha, "Abrir o exemplo" e "Ver a solução". Hoje há um só (comércio); o portfólio "Trabalhos" a substitui quando houver três ou mais projetos externos (`docs/CASES.md`).
- **FAQ** (`Faq.astro`) e **Closing contact** (`ClosingContact.astro`): componentes compartilhados entre home, comércio e soluções; o bloco final mostra "Quem responde é o Armando Castro", os canais e o botão que abre a janela do formulário.
- **Exemplos reservados** (decisão do usuário, 2026-11-21): os exemplos serão projetos reais ou exemplos feitos pela ARCAV, cada um no seu próprio repositório. Enquanto não existem, `ExampleFrame` mostra um espaço reservado ("Exemplo real em preparação") e os botões "Ver/Abrir o exemplo" somem. Só o de comércio (o celular interativo) está ativo, até existir o exemplo externo de loja. As demos fictícias antigas saíram do repositório (histórico do git).
- **Hero de solução sem exemplo** (fase 1 de conversão, 2026-11-21): no lugar do espaço reservado, o hero mostra `SolutionFlow` ("O caminho do seu cliente"): três frases completas e numeradas, de onde a pessoa vem → o que ela faz na sua página → onde você recebe (`journey` em `solutions.ts`). Sem rótulos soltos nem botõezinhos de canais: essa versão não se entendia (feedback de 2026-11-21).

## Do's and Don'ts

### Do:
- **Do** keep electric blue (#2563eb, hover #1d4ed8) to actions and marks: filled primary buttons, arrowed text links in the darker shade, check marks on light grounds, focus and caret.
- **Do** keep amber (#f59e0b) small: the logo triangle, marks, links and focus on navy, and the demo's progress badges with a navy glyph.
- **Do** carry emphasis with a Deep Navy (#0b1f3b) panel or section when a block must stand out without being an action.
- **Do** alternate Paper White and Sand (#f5f3ee) section grounds, separate surfaces with 1px Hairlines (#e2e8f0 / #cbd5e1), and give every control a Control Line border (#7c8ca2, 3:1 or more).
- **Do** set headings and editorial lines in Manrope and everything else in Inter, building hierarchy from weight and negative tracking on headings.
- **Do** use the logo component (`Logo.astro`) wherever the brand appears, at 34px tall, with its clear space; let it crop to the symbol only where the full logo doesn't fit.
- **Do** present ordered content as a ruled list with an ink top rule and `01`–`0n` tabular numerals.
- **Do** use the authored line icon set (24 grid, 1.75 stroke, round caps) at 16–24px in `currentColor`.
- **Do** caption every illustrative demo or mock as an example or illustration.
- **Do** keep touch targets at 44px or more, keep focus visible (2px outline, 3px offset, blue on light and amber on navy), meet WCAG AA contrast, and honour `prefers-reduced-motion` (the build collapses all transitions and animations).
- **Do** use the house ease-out `cubic-bezier(0.16, 1, 0.3, 1)` for movement, with state colour changes at 0.15 to 0.2s.
- **Do** make motion happen once and differ by moment: the home opening enters on load with CSS only (text 500ms, 60ms apart; the portrait uncovers bottom-up in 700ms), services rows fade up as each one enters the screen, the manifesto quote wipes left to right. All of it is CSS: the opening is a load animation and the rows and quote use scroll-driven animations (`animation-timeline: view()`); content is visible without JavaScript, without scroll-timeline support and with reduced motion (`styles/primitives/motion.css`).
- **Do** number only real sequences (the method). The services index has no numerals: the services are not an order.

### Don't:
- **Don't** fill a section, band, card or panel with electric blue or amber.
- **Don't** set amber text on white or sand (2.15:1), or blue text, marks or focus on navy (3.19:1).
- **Don't** introduce colours outside the kit as brand colours. Validation Red (#b42318) is for form errors only.
- **Don't** put kickers or eyebrows above section headings.
- **Don't** box steps or sequences into cards.
- **Don't** use gradients, glass, glows, neon or backdrop blur, or hard offset shadows. Don't add shadows to ordinary cards.
- **Don't** dress the site in a themed metaphor (order pad, tiles, offer flyer, transit map).
- **Don't** add a dark theme. The system is light only (`color-scheme: light`).
- **Don't** add a third typeface or fall back to a system display face for headings.
- **Don't** redraw, stretch, recolour or retype the logo, or set it over a photo without a solid ground.
- **Don't** replace the phone demo with a stock device mockup or a screenshot.
- **Don't** publish brand slots with placeholders. During build-out, a missing photo shows a labelled grey marker (`SHOW_PHOTO_PLACEHOLDERS`); before publishing, either the photo exists or the marker is off, in which case About stays text-only and the avatar shows the initials.
