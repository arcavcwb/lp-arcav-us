---
name: ARCAV
description: The category-standard studio page, finished to a product-company bar. White ground, graphite ink, one terracotta mark.
colors:
  accent: "#b4532a"
  accent-strong: "#9a4521"
  accent-tint: "rgb(180 83 42 / 0.1)"
  accent-on-dark: "#e7a27f"
  ink: "#1c1d21"
  muted: "#5b5d63"
  bg: "#ffffff"
  surface: "#f4f4f5"
  surface-strong: "#e9e9ec"
  line: "#e4e4e7"
  line-strong: "#d4d4d8"
  dark: "#1c1d21"
  dark-raised: "#26282d"
  on-dark: "#f4f4f5"
  on-dark-muted: "#a9abb2"
  on-dark-line: "#34363c"
  status-error: "#b42318"
typography:
  display:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.028em"
  headline:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.75rem, 1.35rem + 1.5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.024em"
  title:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.012em"
  lead:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
  button:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
  caption:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
  wordmark:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.04em"
  subhead:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title-sm:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  meta:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
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
    textColor: "{colors.accent-on-dark}"
  card:
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  panel-graphite:
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

**Creative North Star: "The Finished Standard"**

ARCAV deliberately looks like the category: a clear studio page with a headline on the left, a product demonstration on the right, service cards, a method, an about section and a contact form. The distinction is in the finish, not in a concept. The bar is the craft of RD Station and Conta Azul on one side, and Vercel and Framer on the other: exact type, honest spacing, quiet surfaces and one working demo in place of a stock device mockup. Nothing on the page is a costume. There is no order pad, no tile wall, no flyer and no transit map. The visual register is sober and professional, and personality comes from the typography, the ordering of content, real copy and Armando's presence.

The world is white paper, graphite ink and a single terracotta mark. Neutral zinc greys carry structure: alternating section grounds, hairlines and icon wells. Graphite is the only heavy fill and is used for emphasis blocks and the footer. Terracotta never fills a surface. It marks what to do (primary actions, text links, focus) and what has been confirmed or improved (check marks, diagnosis arrows, the suggested-plan badge). Density is moderate and mobile-first, because the primary reader is a Curitiba shop owner who opens the link from WhatsApp on a phone in daylight. That use case is why the system is light only.

The confirmed visual rejections are themed metaphors that dress up the site, the old dark-navy-and-coral tech look, gradients, glass effects, section kickers or eyebrows, and yellow, red, cobalt or green as brand colours.

**Key Characteristics:**
- White ground, graphite ink, and one terracotta accent that marks things and never fills them.
- One self-hosted family (Schibsted Grotesk) for display and text, with weight carrying the hierarchy.
- Hairlines first. Soft shadows appear only on the phone demo and on panels that hold an interaction or a result.
- Sequences are ruled lists with inline `01`–`0n` numerals, never cards.
- Authored line icons on a 24-unit grid with a 1.75 stroke.
- A working phone demo (an order assembled and composed into a WhatsApp message) is the signature object.
- Light theme only.

## Colors

The palette is achromatic zinc and graphite with one warm, earthy accent. The accent's restraint is what makes it read as premium rather than loud.

### Primary
- **Fired Terracotta** (#b4532a): fills primary buttons (white label, 4.99:1). It also strokes check marks in plan lists and in the inbox note, colours the arrows in the diagnosis table, sets the caret colour, and draws the 2px focus outline. It is never used as a section, band or card fill.
- **Deep Terracotta** (#9a4521): the hover state of primary buttons and the colour of text links with an arrow (6.47:1 on white). Text-sized terracotta always uses this darker shade so that it reads as text.
- **Terracotta Wash** (rgb(180 83 42 / 0.1)): the tinted ground of the "Sugestão de início" plan badge (Deep Terracotta text, 5.67:1) and the 3px focus halo on inputs. Text selection uses the same hue at 0.2 alpha.
- **Pale Clay** (#e7a27f): terracotta translated for graphite grounds. It appears on check marks in the graphite "after" panel and on text links inside dark sections (7.92:1 on graphite).

### Neutral
- **Paper White** (#ffffff): page ground, card faces, input faces, the phone screen and the ghost button face. It is also the browser theme colour.
- **Zinc Mist** (#f4f4f5): alternate section ground (`muted` sections), icon-badge wells, the cart pill, the incoming chat bubble, the composed-message panel, and hover fills on nav links and steppers.
- **Zinc Shade** (#e9e9ec): avatar and portrait placeholder ground (behind the "AC" initials).
- **Graphite Ink** (#1c1d21): all headings and body text. It also draws the 1px rule that opens a ruled list, the outgoing chat bubble, the phone's send button and the border of the suggested plan.
- **Quiet Graphite** (#5b5d63): secondary text such as leads, card descriptions, captions, nav links at rest, step numerals and form hints (6.58:1 on white, 5.99:1 on Zinc Mist).
- **Hairline** (#e4e4e7): card borders, row dividers, the scrolled header border and the divider inside cards.
- **Firm Hairline** (#d4d4d8): ghost-button and input borders, stepper outlines, the menu toggle and the dividers under each ruled step.
- **Graphite** (#1c1d21, the fill role of Graphite Ink): the footer, dark closing sections, the commerce band, the "after" comparison panel and the phone body.
- **Raised Graphite** (#26282d): icon wells sitting on a graphite panel.
- **Light on Graphite** (#f4f4f5): text on graphite.
- **Muted on Graphite** (#a9abb2): secondary text on graphite (7.34:1).
- **Graphite Rule** (#34363c): dividers and ghost-button borders on graphite.

### Status
- **Validation Red** (#b42318): form validation only, used for the invalid input border and the error message text (6.57:1). It is a status signal and not a brand colour.

### Named Rules
**The Terracotta Marks, Never Fills Rule.** Terracotta appears as a filled button, a line, a glyph, a text link, a focus ring or a 10% tint badge. It never becomes the background of a section, band, panel or card. When a block needs emphasis, it goes graphite.

**The Graphite Is the Second Voice Rule.** The system has no second hue. Emphasis that isn't an action is carried by a Graphite fill (the commerce band, the "after" panel, closing sections and the footer), not by a new colour.

**The Status Is Not Brand Rule.** Yellow, red, cobalt and green are not ARCAV colours. Validation Red exists only to say "this field needs attention" and is never used for decoration or emphasis.

## Typography

**Display Font:** Schibsted Grotesk (self-hosted variable woff2, weights 400 to 900, latin and latin-ext subsets, SIL OFL), falling back to ui-sans-serif and system-ui
**Body Font:** Schibsted Grotesk (same family)

**Character:** A sturdy, slightly editorial grotesk that holds a 52px headline with tight tracking and still reads plainly at 15px. Using one family for everything keeps the page calm, and steps of weight (400, 500, 600, 650, 700, 800) do the work that a second face would otherwise do.

### Hierarchy
- **Display** (700, clamp 2rem→3.25rem, line-height 1.08, −0.028em): the H1 only, in page heroes, capped at about 17em wide so it wraps to three or four lines on desktop.
- **Headline** (700, clamp 1.75rem→2.5rem, 1.12, −0.024em): section H2s. They are often hand-broken into two balanced lines, and `text-wrap: balance` is on for all headings.
- **Title** (650, 1.25rem, 1.3, −0.012em): card and plan H3s.
- **Subhead** (600–650, clamp 1.25rem→1.5rem, −0.015 to −0.02em): case titles and the About statement.
- **Title small** (650, 1.125rem): step titles, the pricing suggestion line and the Problem quote (500).
- **Lead** (400, clamp 1.0625rem→1.25rem, 1.55, Quiet Graphite, max 38em): the paragraph under a heading.
- **Body** (400, 1.0625rem, 1.6): running text, with `text-wrap: pretty` on paragraphs and list items.
- **Body small** (400, 0.9375rem): notes, hints, plan inclusions and step descriptions.
- **Label** (600, 0.9375rem): form labels, comparison column labels and table headers. Nav links use the same size at 500.
- **Meta** (400 to 600, 0.875rem): form hints and errors, the form note, case metadata, About fact terms, the phone's cart count and order summary.
- **Caption** (400 to 600, 0.8125rem, 1.45): figure captions under demos, process flows (500), badges (600) and footer fact terms (600).
- **Wordmark** (800, 1.375rem, +0.04em): the text fallback for the ARCAV logo, followed by "por Armando Castro" at 0.875rem/500 in Quiet Graphite.

Big numbers (plan prices) are set at 700, clamp 2rem→2.5rem, −0.03em. Quantities, counters and step numerals use tabular figures.

### Named Rules
**The One Family Rule.** Schibsted Grotesk is the only typeface. Hierarchy comes from size, weight and tracking, never from a second family or a system display face.

**The Heading Stands Alone Rule.** No kicker, eyebrow or small label sits above a section heading. The H2 opens the section by itself, and an optional lead follows beneath it.

**The Sentence Case Rule.** Labels, buttons, nav and captions are in sentence case. Uppercase appears only in the ARCAV wordmark itself.

## Layout

The layout is a single centred column: a 1200px container with a fluid gutter (16px→40px). Sections use fluid vertical padding (32px→52px), kept tight so one section leads straight into the next. The section directly after a page hero starts closer (32px→48px) so that it peeks above the fold. Section grounds alternate between Paper White and Zinc Mist, never two of the same ground in a row, and every section except a graphite one opens with a 1px Hairline Strong (#d4d4d8) rule across the full width so the boundary reads even where the two grounds are close. On the commerce and proposal pages a graphite closing section leads into the graphite footer.

- **Page hero:** a single column on mobile. At 960px and above it becomes a two-column grid of fluid copy and a fixed 20rem demo column, with the phone vertically centred. On the home page a byline row (avatar, name, statement, with a hairline above) sits under the copy and stops at 30rem. The hero actions are a primary button plus a ghost button, and at 479px or less they flex to share the row.
- **Section head:** max 44rem wide, followed by 36px→56px of space before the content.
- **Card grids:** a single column, becoming three equal columns at 880px with a 16px gap. Service cards use subgrid rows so that the icon, title, text and flow line up across cards.
- **Splits:** text beside an illustration or form from 880 to 900px, weighted about 1 : 0.9 (the contact section reverses this to give the form the wider column). The contact copy column is sticky under the header.
- **Ruled steps:** one column, two at 720px, and three or four at 1024px.
- **Header:** sticky, 68px tall, on Paper White. A Hairline border fades in after 8px of scroll. Below 900px the nav collapses into a dropdown panel.
- **Footer:** graphite, with three columns at 800px (brand and statement, links, facts) and then a Graphite Rule over the copyright and social row.

Breakpoints in use are 480, 560, 640, 720, 800, 880, 900, 960 and 1024px, and the base styles are mobile first. Reference widths are 360 and 390px.

### Named Rules
**The Ruled Sequence Rule.** Anything ordered (method, process, offer steps) is a ruled list. A 1px Graphite Ink rule opens it, each item sits on a Firm Hairline, and an inline `01`, `02`, … numeral in Quiet Graphite tabular figures leads each item. Sequences are never boxed into cards. The case list uses the same ink-topped, hairline-divided construction.

**The Peek Rule.** The first section after a hero uses the reduced top padding so that the next content is visible on first load.

## Elevation & Depth

The system is flat and hairline-first. Surfaces at rest are separated by 1px borders and by the Paper White / Zinc Mist alternation, not by shadow. Shadows are soft, graphite-tinted and offset downward, and they appear only on objects that hold an interaction or a result: the phone demo, the contact-form card, the inbox illustration and the suggested plan. Focus is shown with an outline rather than a shadow, except on inputs, which use a tinted halo.

### Shadow Vocabulary
- **Raised panel** (`box-shadow: 0 1px 2px rgb(28 29 33 / 0.06), 0 14px 32px -14px rgb(28 29 33 / 0.22)`): the contact-form card (whose border goes transparent), the inbox illustration and the suggested plan card.
- **Phone** (`box-shadow: 0 2px 6px rgb(28 29 33 / 0.1), 0 40px 70px -30px rgb(28 29 33 / 0.45)`): the hero phone demo only.
- **Menu drop** (`box-shadow: 0 18px 30px -24px rgb(28 29 33 / 0.35)`): the mobile nav panel under the header.

### Named Rules
**The Earned Shadow Rule.** A surface gets a shadow only when it holds something the visitor does or receives, such as an order, a form, a composed reply or a recommended plan. Ordinary cards stay flat with a Hairline border.

## Shapes

The corner language has two radii plus the pill. Controls (buttons, inputs, icon wells, the menu toggle) use 10px. Containers (cards, panels, plans, the diagnosis table, the composed-message panel and the 4:5 portrait) use 14px. Fully round pills are used for the stepper, the cart count, badges and avatars. Header nav links use the 10px control shape on hover. A tight 4px corner is reserved for the focus ring and the speaker-side tail of chat bubbles (14px elsewhere). The phone is the only large-radius object (device 2.75rem body, device-screen 2.2rem) and has a pill notch. Borders are always 1px. Icons are drawn line art on a 24-unit grid with a 1.75 stroke and round caps and joins, inherit `currentColor`, and render at 16–24px.

## Components

### Buttons
Buttons are solid and plain: a label, an optional trailing arrow (or a leading glyph for mail and send), and no ornament.
- **Shape:** gently rounded controls (10px), at least 48px tall, with 20px inline padding, a 1rem/600 label and an 18px icon with an 8px gap.
- **Primary:** Fired Terracotta with a white label. It is used for the one main action in each region, such as "Falar com a ARCAV", "Fale comigo", the commerce CTA, form submit and the closing CTA.
- **Hover / Active / Focus:** hover deepens the fill to Deep Terracotta over 0.18s. Active nudges the button down 1px with the house ease-out. Focus draws a 2px terracotta outline offset by 3px.
- **Ghost:** Paper White face, Firm Hairline border and Graphite Ink label. On hover the border goes to Graphite Ink. On graphite grounds it turns transparent with a Graphite Rule border and a Light on Graphite label.
- **Small:** 40px tall with 16px padding and a 0.9375rem label. It is used for the header CTA and for the actions in the composed-message panel. This size sits below the 44px touch-target commitment, so don't extend it to new primary mobile actions.
- **Disabled:** 55% opacity, a not-allowed cursor and no motion. Example: "Revisar pedido" when the cart is empty.
- **Mobile:** at 479px or less, closing CTAs, demo CTAs, the form submit and the commerce CTA go full width.

### Text link with arrow
- **Style:** 600 weight in Deep Terracotta, with a trailing arrow (or an external-link glyph) inline at about 17px.
- **Hover:** underline (1px, offset 0.22em), and the arrow slides 3px right.
- **On graphite:** Pale Clay.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Paper White with a 1px Hairline border. Cards sit on either section ground.
- **Shadow Strategy:** flat. See The Earned Shadow Rule.
- **Internal Padding:** fluid, 24px→32px.
- **Service / feature card:** a 44px icon well (Zinc Mist, 10px, with a 22px line icon) above a Title, a muted description and, for services, a process flow under a Hairline divider.
- **Graphite panel:** a Graphite fill at 14px used for one emphasis block, such as the "Tem um comércio local em Curitiba?" band (icon well in Raised Graphite, white title, muted body, and a terracotta button pushed to the right at 880px) or the "after" column of the before/after comparison, whose check marks are Pale Clay. The "before" column is a white card with muted text and minus marks.

### Process flow
This is an inline sequence of short words such as "Visita → Formulário → Lead → Automação" at 0.8125rem/500 in Quiet Graphite, joined by small arrow glyphs at 60% opacity. It wraps freely. It is also used for Armando's trajectory, in ink on light grounds and in Light on Graphite in the footer.

### Inputs / Fields
- **Style:** Paper White face, Firm Hairline border, 10px radius, at least 48px tall (textareas start at 136px and resize vertically) and a 1rem text size. A 600-weight label sits above, with "(opcional)" in Quiet Graphite at 400. Hints are 0.875rem in Quiet Graphite.
- **Hover:** the border darkens to a mid zinc.
- **Focus:** the border turns Fired Terracotta and a 3px Terracotta Wash halo appears, with no outline.
- **Error:** the border and the message text turn Validation Red (message 0.875rem/500). Messages are written in a friendly first person, and the error is cleared as the visitor types.
- **Composed message:** after submit, a Zinc Mist panel (14px) shows a 600-weight status line, then the exact message in a white, hairline-bordered 10px box, then small ghost buttons for "Abrir de novo" and "Copiar mensagem".

### Navigation
- **Header:** the wordmark (or logo) with its byline on the left. On the right are nav links at 0.9375rem/500 in Quiet Graphite, which hover to Graphite Ink on a Zinc Mist 8px pill, followed by the small primary "Fale comigo". Proposal pages replace the nav with a short muted note.
- **Mobile (below 900px):** a 44px menu toggle (Firm Hairline, 10px) swaps between menu and close glyphs. The nav drops down as a full-width white panel with the menu-drop shadow, and its links are 1.0625rem ink rows divided by Hairlines. Escape closes it and returns focus to the toggle. Below 480px the "por Armando Castro" byline hides.
- **Footer:** see Layout. Links are Light on Graphite and underline on hover. Social links carry a small external glyph at 70% opacity.

### Ruled steps
See The Ruled Sequence Rule. The compact variant has a 1.125rem/650 step title above a muted 0.9375rem line. The text-only variant (process and offers) sets a single 1rem/500 ink line per step.

### Phone demo (signature)
A working order demo drawn in CSS rather than an image. It has a Graphite body (44px radius, 10px bezel, Phone shadow) with a pill notch, and a white screen whose height grows with the product count. The store view has an app bar (store name 1.0625rem/700, note in caption size, a Zinc Mist cart pill with a live count), product rows divided by Hairlines, and a pill stepper (Firm Hairline outline, round − and + buttons, and a tabular quantity that bumps from 1.35× scale over 260ms). At the bottom are a live summary and a full-width primary button labelled **"Revisar pedido"**. Pressing it slides in the message view (0.4s ease-out, with the store view sliding 24% left and fading). That view has a back button, the title "Pedido pronto", the composed order in a Zinc Mist bubble, a hint line and a full-width Graphite Ink "Enviar pelo WhatsApp" button. Without JavaScript the demo shows the initial order statically. A centred caption below states that the store is an example and not a real client.

### Inbox illustration (signature)
This is the shop's side of the same order: a white Raised-panel card (14px) with a header row (a Zinc Shade initial avatar and "Cliente pelo site" with a muted channel line), an incoming Zinc Mist bubble holding the order lines in 600 weight, and an outgoing Graphite Ink bubble with the shop's reply. Under the thread sits a 600-weight note led by a terracotta check. A caption labels it as an illustration, not a screenshot.

### Diagnosis table (proposals)
A white, hairline-bordered 14px table with two columns, "today" and "opportunity". The current state is in Quiet Graphite. The opportunity is in 500 weight, led by a terracotta arrow. Below 720px each row stacks, and the column names reappear as caption-size labels above each cell.

### Plan cards (proposals)
White 14px cards (Hairline border, 24px→32px padding) with a Title and an optional "Sugestão de início" pill badge (Terracotta Wash, Deep Terracotta, 0.8125rem/600). Next comes a big tabular price with a muted note, then a Hairline divider, then inclusions led by terracotta check marks. A suggested plan swaps its border to Graphite Ink and takes the Raised shadow.

### Brand mark & portrait slots
- **Logo:** if a file named `src/assets/brand/arcav-logo.(svg|png|webp)` exists, it replaces the text wordmark at a height of 28px in the header and footer automatically. Until then the wordmark is the logo.
- **Portrait:** if a file named `src/assets/brand/armando.(jpg|jpeg|png|webp)` exists, it appears as a 4:5, 14px-radius portrait beside the About copy (columns at about 0.8 : 1.2 from 900px) and as the 44px round hero avatar. Without the photo, the About section renders text-only at full width, and the avatar shows the initials **"AC"** (700 weight, Graphite Ink on Zinc Shade). A fake or stock photo is never used.
- **Favicon:** a provisional monogram: a Graphite rounded square with a light "A" whose crossbar is terracotta. It is replaced when the official symbol arrives.
- **Open:** the footer reuses the same logo file on Graphite, and no light or inverse logo slot exists yet.

### Soluções e exemplos (2026-11-21)

- **Solution page** (`src/components/solution/SolutionPage.astro`, rota `src/pages/solucoes/[slug].astro`, dados em `src/data/solutions.ts`): hero com a captura do exemplo à direita, "Para quem é" e "O que está incluído" como listas com filete (sem cartões), "Como funciona" como sequência numerada com filetes, perguntas frequentes, "Outras soluções" e o bloco de contato escuro. Cabeçalho mínimo (marca + "Fale comigo"), rodapé com todas as soluções.
- **Example frame** (`ExampleFrame.astro`): captura 16:10 de um exemplo dentro de uma janela de navegador (barra `surface`, três pontos `line-strong`, URL em pílula), raio de cartão, sombra elevada; sobe 3px no hover. Legenda sempre diz "Exemplo ilustrativo · <cliente fictício>".
- **Solution tiles** (`home/Services.astro` + `home/SolutionDiagram.astro`): dois grupos ("Landing pages" e "Também para o seu negócio"). Cada bloco-link tem um esquema em linha da solução (geometria SVG: grafite para estrutura, cinza para conteúdo, terracota só onde acontece a ação), nome curto, uma linha e seta. Os esquemas se desenham uma vez quando o grupo entra na tela; no hover, a parte da ação se move (o pedido viaja até o WhatsApp, a luz entra, o botão sobe). No celular o esquema fica à esquerda do texto.
- **Serviços por situação** (`home/Services.astro`, 2026-11-21): a home mostra os cinco serviços com o mesmo peso (site institucional, migração, landing pages, comércio, automação), cada um numa linha de uma lista branca com divisórias: à esquerda a frase do cliente entre aspas ("Preciso de um site para a minha empresa."), à direita o nome do serviço em terracota escuro e a frase curta, seta no fim. Antes da lista: "Qual destas frases parece com o seu momento?". Os tipos de landing page saíram da home e vivem em `/solucoes/landing-pages/`. A mesma lista (`SERVICES`) alimenta o rodapé e "Outras soluções".
- **Landing flow** (`solution/LandingFlow.astro`, só em `/solucoes/landing-pages/`): ficha para leigos. Primeiro a pessoa escolhe o objetivo em linguagem simples ("Quero passar confiança", "Quero contatos de um anúncio", "Quero vender um produto", "Quero inscrições para um evento"); embaixo aparece uma ficha só daquela página: o nome e a frase curta, "O caminho do seu cliente" (`SolutionFlow` sem moldura, as mesmas três frases do hero da solução) e, ao lado, "Para quem é", "O que entra" (4 itens) e o link. Uma linha antes das abas explica o que é uma landing page. Não se mostra mais o mapa com todas as opções apagadas: os visitantes se perdiam nele (feedback de 2026-11-21).
- **Transição entre páginas**: `@view-transition { navigation: auto; }` (navegadores compatíveis). O nome curto do bloco tem `view-transition-name: sol-<slug>` e viaja até o H1 da página da solução; o cabeçalho fica fixo durante a troca. Tudo desligado com `prefers-reduced-motion`.
- **Exemplos** (`home/Examples.astro` + `home/ExampleShowcase.astro`): seção própria (fora do hero) com abas em pílula (ativa em grafite cheio, as demais com contorno), uma por solução; cada painel mostra a captura grande à esquerda e, à direita, nome, uma linha, "Abrir o exemplo" e "Ver a solução". Setas do teclado navegam entre abas. O hero da home é só texto.
- **FAQ** (`Faq.astro`) e **Closing contact** (`ClosingContact.astro`): componentes compartilhados entre comércios e soluções; o bloco final mostra "Quem responde é o Armando Castro", o WhatsApp e o formulário.
- **Exemplos reservados** (decisão do usuário, 2026-11-21): os exemplos serão baseados em projetos reais. Enquanto não existem, `ExampleFrame` mostra um espaço reservado (janela de navegador vazia, fundo `surface`, "Exemplo real em preparação") e os botões "Ver/Abrir o exemplo" somem. Só o de comércio (o celular interativo, nascido do caso Center Gás) está ativo. As demos fictícias anteriores ficaram guardadas em `docs/exemplos-ficticios/` como referência, fora do site.
- **Hero de solução sem exemplo** (fase 1 de conversão, 2026-11-21): no lugar do espaço reservado, o hero mostra `SolutionFlow` ("O caminho do seu cliente"): três frases completas e numeradas, de onde a pessoa vem → o que ela faz na sua página → onde você recebe (`journey` em `solutions.ts`). Sem rótulos soltos nem botõezinhos de canais: essa versão não se entendia (feedback de 2026-11-21). O mostruário da home lista só exemplos que funcionam; com um só, as abas não aparecem.

## Do's and Don'ts

### Do:
- **Do** keep terracotta (#b4532a, hover #9a4521) to marks: filled primary buttons, arrowed text links in the darker shade, check marks, diagnosis arrows, the suggested-plan badge tint, focus and caret.
- **Do** carry emphasis with a Graphite (#1c1d21) panel or section when a block must stand out without being an action.
- **Do** alternate Paper White and Zinc Mist (#f4f4f5) section grounds, and separate surfaces with 1px Hairlines (#e4e4e7 / #d4d4d8).
- **Do** set every word in Schibsted Grotesk, building hierarchy from weight (400 to 800) and negative tracking on headings.
- **Do** present ordered content as a ruled list with an ink top rule and `01`–`0n` tabular numerals.
- **Do** use the authored line icon set (24 grid, 1.75 stroke, round caps) at 16–24px in `currentColor`.
- **Do** caption every illustrative demo or mock as an example or illustration.
- **Do** keep touch targets at 44px or more, keep focus visible (2px terracotta outline, 3px offset), meet WCAG AA contrast, and honour `prefers-reduced-motion` (the build collapses all transitions and animations).
- **Do** use the house ease-out `cubic-bezier(0.16, 1, 0.3, 1)` for movement, with state colour changes at 0.15 to 0.2s.

### Don't:
- **Don't** fill a section, band, card or panel with terracotta.
- **Don't** introduce yellow, red, cobalt or green as brand colours. Validation Red (#b42318) is for form errors only.
- **Don't** put kickers or eyebrows above section headings.
- **Don't** box steps or sequences into cards.
- **Don't** use gradients, glass or backdrop blur, or hard offset shadows. Don't add shadows to ordinary cards.
- **Don't** dress the site in a themed metaphor (order pad, tiles, offer flyer, transit map), and don't return to the dark-navy-and-coral tech look.
- **Don't** add a dark theme. The system is light only (`color-scheme: light`).
- **Don't** add a second typeface or fall back to a system display face for headings.
- **Don't** replace the phone demo with a stock device mockup or a screenshot.
- **Don't** fill brand slots with placeholders. With no photo, About stays text-only and the avatar shows "AC".
