---
name: ARCAV
description: Daylight station signage for a one-person automation and systems practice; the visitor's operation drawn as a transit network.
colors:
  signal-yellow: "#ffd100"
  express-red: "#d5261c"
  interchange-green: "#00884a"
  feeder-orange: "#ee7c00"
  today-gray: "#9aa1a8"
  sign-ink: "#15171a"
  ink-soft: "#474d54"
  paper: "#ffffff"
  platform: "#eef0ec"
  platform-deep: "#e1e4df"
  error-ink: "#8f1710"
  night-text: "#c9ced3"
  night-fine: "#aab1b8"
  night-rule: "#3a3f45"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 4.1vw, 3.7rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.25rem, 4.4vw, 3.9rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(1.5rem, 2.2vw, 1.9rem)"
    fontWeight: 800
    lineHeight: 1.05
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  lead:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.15
  map-label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.02em"
rounded:
  sign: "2px"
  track: "6px"
  phone: "26px"
  station: "50%"
spacing:
  space-1: "0.25rem"
  space-2: "0.5rem"
  space-3: "0.75rem"
  space-4: "1rem"
  space-5: "1.5rem"
  space-6: "2rem"
  space-7: "3rem"
  space-8: "4.5rem"
  space-9: "7rem"
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  wrap: "1240px"
components:
  board-button:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.sign-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.sign}"
    padding: "0.7rem 1.4rem 0.7rem 1.1rem"
    height: "3.5rem"
  board-button-hover:
    backgroundColor: "{colors.sign-ink}"
    textColor: "{colors.signal-yellow}"
  board-button-disabled:
    backgroundColor: "{colors.platform-deep}"
    textColor: "{colors.ink-soft}"
  submit-button:
    backgroundColor: "{colors.sign-ink}"
    textColor: "{colors.signal-yellow}"
    rounded: "{rounded.sign}"
    padding: "0.7rem 1.4rem"
    height: "3.5rem"
  submit-button-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.sign-ink}"
  field-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.sign-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sign}"
    padding: "0.85rem 1rem"
  status-plate:
    backgroundColor: "transparent"
    textColor: "{colors.sign-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sign}"
    padding: "0.2rem 0.6rem"
  here-plate:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.sign-ink}"
    rounded: "{rounded.sign}"
    padding: "0.25rem 0.65rem"
  roundel-sm:
    rounded: "{rounded.station}"
    size: "1.5rem"
  roundel-md:
    rounded: "{rounded.station}"
    size: "2.25rem"
  roundel-lg:
    rounded: "{rounded.station}"
    size: "3.25rem"
  nameboard:
    backgroundColor: "{colors.sign-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.display}"
    padding: "clamp(1.1rem, 2.2vw, 1.7rem) clamp(1.2rem, 2.4vw, 1.9rem) clamp(2.1rem, 3.4vw, 2.8rem)"
  language-switch-current:
    backgroundColor: "{colors.sign-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sign}"
    height: "2.5rem"
---

# Design System: ARCAV

## Overview

**Creative North Star: "Daylight Station Signage"**

The page is a transit network map of the visitor's own operation. Scattered tools are gray stations, each ARCAV service is a colored line, every shipped project is a station already built, and the contact form is the first stop. Everything is drawn in the vocabulary of a well-lit platform: white and pale platform-gray ground, near-black sign ink, thick line strokes, round station ticks, interchange rings, and hard-edged name boards. There are no cards anywhere; content hangs off lines.

Density is signage density: big condensed type for names, generous gaps (3rem to 7rem between blocks), and prose kept to readable measures (34 to 40rem). Color is functional, never atmospheric. The three service colors identify lines and nothing else; yellow means "you are here" or "board now". Depth is almost entirely flat, carried by heavy ink rules and borders instead of shadows.

Motion is the network coming alive: lines draw along their paths, one train marker rides from the visitor's station through the ARCAV hub, and hovering or focusing a line dims the others. Reduced motion shows the finished map.

**Key Characteristics:**
- One superfamily, two widths: Barlow Condensed for anything read as a sign, Barlow for sentences.
- Three service lines with fixed colors and fixed numbers (1 red, 2 green, 3 orange), identical in every language.
- Signal yellow reserved for "you are here", the primary action, the contact band and the focus halo.
- Lines, stations and plates instead of cards; line geometry at 0, 45 and 90 degrees.
- Thick ink structure: 4px section rules, 3px control borders, 2px corner radius.

## Colors

A daylight signage palette: white and platform gray ground, one near-black ink, three transit line colors as identity roles, and one reserved yellow.

### Primary
- **Signal Yellow** (signal-yellow): the "you are here" plate, the primary board button, the first stop in the journey, the final stop in the About route, the entire contact band background, the text selection color and the outer halo of the global focus ring. It always sits against sign ink (border or text), never against white alone.

### Secondary
- **Express Red** (express-red): Line 1, connected landings. Route stroke, roundel fill (white numeral), the red third of the nameboard stripe. Also doubles as the error signal: invalid-field border, error badge fill, failed-submit dot, link hover underline and text caret.
- **Interchange Green** (interchange-green): Line 2, custom systems. Route stroke, roundel fill (white numeral), the success dot after sending the form.
- **Feeder Orange** (feeder-orange): Line 3, automation. Route stroke, roundel fill with an ink numeral (white fails contrast on orange).

### Neutral
- **Sign Ink** (sign-ink): all headings and body text, the nameboard ground, the vertical project track, 4px section rules, control borders, station rings, footer ground, and the inner 3px focus outline.
- **Ink Soft** (ink-soft): leads, notes, client names, captions, gray labels on the map.
- **Today Gray** (today-gray): only the visitor's current tools on the network map, drawn as dashed lines and hollow stations. It is not a service line.
- **Paper** (paper): page ground, station fill, input fill, header ground.
- **Platform** (platform): the "how to start" band and the image well behind screenshots.
- **Platform Deep** (platform-deep): disabled board button, hairline dividers in the mobile menu, border of diagram screenshots.
- **Error Ink** (error-ink): inline field error text, dark enough to read on the yellow contact band.
- **Night Text / Night Fine / Night Rule** (night-text, night-fine, night-rule): secondary text, fine print and the base divider inside the ink footer.

### Named Rules
**The Line Identity Rule.** Red, green and orange each belong to exactly one service line and carry its number (1, 2, 3). Never use a line color for decoration, section backgrounds or emphasis unrelated to that line. The single exception already in the build is red for errors.

**The You-Are-Here Rule.** Yellow marks where the visitor is or what they should board. If an element is neither a location marker nor the primary action, it is not yellow.

## Typography

**Display Font:** Barlow Condensed 800 (with Arial Narrow, sans-serif)
**Label Font:** Barlow Condensed 600
**Body Font:** Barlow 400/500/600 (with system-ui, sans-serif)

**Character:** A highway and rail signage superfamily used in two widths. Condensed caps-adjacent sentence case reads as station names and plates; the normal width carries the sentences. All faces are self-hosted woff2 with latin and latin-ext subsets for ES, PT and EN.

### Hierarchy
- **Display** (800, clamp(2.5rem, 4.1vw, 3.7rem), 0.95): the H1 on the nameboard, white on ink. English sets smaller (clamp(2.1rem, 3.3vw, 3.1rem)); under 480px the H1 scales with viewport width so no word is orphaned.
- **Headline** (800, clamp(2.25rem, 4.4vw, 3.9rem), 0.98): section H2s, balanced wrap. Project names and the contact H2 push larger (up to 3.8rem and 4.4rem).
- **Title** (800, clamp(1.5rem, 2.2vw, 1.9rem), 1.05): line names, journey steps (1.75rem), part names (1.55rem), field labels (1.3rem), board buttons (1.375rem).
- **Body** (400, 1.125rem, 1.55, tabular numerals): prose and inputs; measures held at 34 to 40rem.
- **Lead** (400, 1.25rem): section intros in ink soft, max 38rem.
- **Label** (600, 1.05 to 1.3rem, 1.1 to 1.25): nav stations, stop names on tracks, captions, client lines, status plates, links in project blocks.
- **Map Label** (800, 22px in the SVG, uppercase, 0.02em tracking, white paint-order halo): station and destination names inside the network map; today labels at 600 in ink soft. Uppercase is reserved for map labels and the "you are here" plate (0.04em tracking).

### Named Rules
**The Two Widths Rule.** If it is a name (station, line, project, button, label), set it in Barlow Condensed. If it is a sentence, set it in Barlow. Never mix within one element.

## Layout

A single 1240px wrap with a fluid gutter (clamp(1rem, 4vw, 2.5rem)). Sections stack as full-width bands separated either by a 4px ink rule (header, Work, Contact) or by a ground change (platform gray for How to start, signal yellow for Contact, ink for the footer). Vertical rhythm uses the space scale: section padding 3rem to 7rem, gaps between line rows clamp(3rem, 6vw, 4.5rem), between projects clamp(4rem, 8vw, 6.5rem).

Breakpoints observed in the build:
- **1099px**: header station nav collapses into a bordered "Menu" disclosure.
- **1080px**: hero becomes two equal columns (nameboard left, network map right).
- **960px**: line rows, project bodies, About and Contact go to two columns.
- **900px**: the journey runs horizontally in four columns; the footer becomes three columns. Below it the journey is a vertical track.
- **720px**: the network map swaps for a vertical strip map (inputs, ARCAV hub, outputs) and horizontal line tracks turn vertical.
- **640px**: the header CTA hides and the lockup stacks.
- **480px**: H1 scales with viewport width.

The sticky header sets scroll-padding-top to 5.5rem so anchors land below it.

### Named Rules
**The Tracks Turn Rule.** Horizontal lines become vertical on narrow screens; they never wrap, shrink to dots or become carousels.

## Elevation & Depth

The system is flat. Depth comes from heavy ink: 4px rules under the header and above bands, 3px borders on controls and screenshots, and inverted ink grounds (nameboard, footer). Shadows appear only where the build needs a functional cue.

### Shadow Vocabulary
- **Focus halo** (`outline: 3px solid #15171a; outline-offset: 3px; box-shadow: 0 0 0 9px #ffd100`): the global keyboard focus ring. On the yellow contact band the submit button swaps the halo to paper; in the ink footer the outline turns yellow with no halo; inputs use the ink outline alone.
- **Menu drop** (`box-shadow: 0 18px 40px -12px rgba(21, 23, 26, 0.35)`): only the open mobile menu panel, to separate it from content beneath.
- **Roundel rim** (`box-shadow: inset 0 0 0 2px rgba(21, 23, 26, 0.18)`): a faint inner rim that keeps line roundels crisp on any ground.

### Named Rules
**The Ink Not Shadow Rule.** Separate things with ink rules, borders or a ground change. A shadow is allowed only for focus, a floating menu, or the roundel rim.

## Shapes

Two shape families and nothing in between. Signage is rectangular with a barely softened 2px corner: buttons, inputs, plates, the language switch, the menu, screenshots. Stations are perfect circles: roundels, station ticks, interchange rings, terminals, the hub, the train. Line strokes are thick with round caps and joins (13px on the desktop map, 9px on the strip, 12px on HTML tracks with a 6px radius, 10px project and journey spines). Current-tool lines are dashed (10 9). The nameboard carries a 9px three-color stripe (red, green, orange in thirds). The only large radius is the 26px bezel on phone screenshots, which imitates the device.

## Components

### Board Button (primary action)
Station plate you board from.
- **Shape:** 2px corners, 3px ink border, min height 3.5rem (2.75rem in the header).
- **Default:** signal yellow ground, ink text in Barlow Condensed 800 at 1.375rem, a stroked arrow on the right.
- **Hover:** inverts to ink ground with yellow text in 180ms; the arrow slides 4px right in 220ms. Active nudges 1px down.
- **Disabled:** platform deep ground, ink soft text, progress cursor.

### Submit Button
The inverse plate, used on the yellow contact band where a yellow button would vanish: ink ground, yellow text, 1.4rem; hover inverts to paper with ink text; disabled goes ink soft with paper text.

### Line Roundel
Circle filled with the line color and its number in condensed 800 (white on red and green, ink on orange), with the faint inner rim. Sizes 1.5rem, 2.25rem, 3.25rem. Used in the map legend, line rows, project headers, project parts and the footer legend. The number never changes by language.

### Line Track
An ordered list drawn as a line: a 12px stroke in the line color, paper stations with 4px ink rings, and a filled ink terminal with a paper inner ring at the end. Stop names in condensed 600. Horizontal from 720px, vertical below. Hovering one line row dims the others to 0.3 opacity; arriving via an anchor dims the others, then fades them back over 2.8s.

### Network Map (signature)
SVG diagram: four dashed gray "today" stations feed one 34px ink hub ring labelled ARCAV, three colored routes leave at 0 and 45 degrees to terminals with destination names. A yellow "you are here" plate sits above the first station. On entry the routes draw in 1100ms staggered 160ms, and one ink train with a yellow rim rides from a today station through the hub over 2.6s (ease-out cubic). Focusing or hovering a legend entry dims the other routes to 0.14. Under 720px it is replaced by a static vertical strip map.

### Nameboard
Ink rectangle holding the H1 in paper, with the three-line stripe pinned at the bottom left. It is the only large ink block above the footer.

### Built Stations Track (projects)
A 10px ink spine on the left; each project is a paper station with a 6px ink ring, and multi-line projects get a larger 8px interchange ring. Headers stack roundels, the project name, client line and a status plate. Screenshots are platform posters: 3px ink border, platform well; phones get a 6px ink bezel at 26px radius; diagrams a 2px platform-deep border on paper.

### Status Plate
Transparent, 2px ink border, 2px corners, condensed 600 at 1.05rem ("En vivo", "En desarrollo"). A small variant at 0.95rem sits inline with part names.

### Journey (how to start)
Numbered paper stations with 5px ink rings on a 12px ink line; the first stop is filled yellow and labelled by the uppercase "you are here" plate.

### Inputs / Fields
- **Style:** paper fill, 3px ink border, 2px corners, 0.85rem 1rem padding, Barlow 1.125rem. Labels in condensed 800 at 1.3rem above the field.
- **Focus:** 3px ink outline offset 2px, no halo.
- **Error:** border turns express red at 4px; the message below is error ink, weight 600, with a small red circular badge before it.

### Navigation
- **Header:** sticky paper bar, 4.5rem tall, 4px ink rule below. The ARCAV lockup (condensed 800, 2rem, with "by Armando Castro" in 600 ink soft) sits left. Section links are drawn as a line segment: a 4px ink line with hollow station ticks above each condensed label; hover or focus fills the tick yellow and underlines the label at 3px.
- **Language switch:** three joined 2px-bordered cells (ES, PT, EN); the current language is inverted ink on paper.
- **Mobile (under 1100px):** a bordered "Menu" disclosure that inverts when open and drops a paper panel with a 3px ink border, divided rows and the menu drop shadow.
- **Footer:** ink ground; roundel legend, social and language links in condensed 600 at 1.2rem with yellow 3px underlines on hover and for the current language.

## Do's and Don'ts

### Do:
- **Do** hang content on lines and stations: tracks, spines, route strips and plates carry every list in this system.
- **Do** keep each line's color and number fixed: 1 red landings, 2 green systems, 3 orange automation, in every language.
- **Do** set names in Barlow Condensed and sentences in Barlow.
- **Do** separate sections with a 4px ink rule or a ground change (platform, yellow, ink).
- **Do** use 2px corners for anything rectangular and full circles for anything that is a station.
- **Do** keep the yellow and ink focus halo visible on every interactive element, adapting it on yellow and ink grounds as the build does.
- **Do** turn horizontal tracks vertical below 720px and show the finished map when reduced motion is requested.

### Don't:
- **Don't** use cards, dark hero plus three feature cards, or logo strips; the page is a network, not a grid of boxes.
- **Don't** use a line color as decoration or as a section ground.
- **Don't** make anything yellow that is not a location marker or the primary action.
- **Don't** add soft drop shadows to separate content; use ink.
- **Don't** draw route geometry at angles other than 0, 45 and 90 degrees.
- **Don't** put white text on feeder orange; use ink.
