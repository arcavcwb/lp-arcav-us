---
target: home mobile (títulos gigantes, cliente se pierde)
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 4
target_identity: "file:/home/diego/armando/personal/lp-arcav-us/src/pages/index.astro"
target_fingerprint: "sha256:ce5cba981c9ccbbd6a53f38d16319076ea990758f8e41016c39353823f43b5c0"
target_path: /home/diego/armando/personal/lp-arcav-us/src/pages/index.astro
timestamp: 2026-11-24T14-01-28Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design review · B: detector + browser measurements)

## Design Health Score (21/32, 66%, Acceptable)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Demo guide ticks steps; "Testar as soluções" jumps 2116px with no landing cue |
| 2 | Match System / Real World | 2 | Service quotes in client voice; headings in agency voice ("Produtos digitais…", "Método", "Mapear") |
| 3 | User Control and Freedom | 3 | Recomeçar, back arrow, dialog closes with Esc/X/outside |
| 4 | Consistency and Standards | 2 | Same form under 4 labels; WhatsApp icon opens a form; "Testar" on 1 of 5 cards; H2 28 vs 32px |
| 5 | Error Prevention | 3 | Stepper buttons 30x30 |
| 6 | Recognition Rather Than Recall | 3 | Method steps 3–6 off-screen in carousel; no Contato in mobile menu |
| 7 | Flexibility and Efficiency | n/a | Persuade surface |
| 8 | Aesthetic and Minimalist Design | 2 | 245px cards for one sentence, dark section repeats services, orbs behind everything |
| 9 | Error Recovery | 3 | Plain inline errors, focus moves, input kept |
| 10 | Help and Documentation | n/a | Landing; FAQ lives on solution pages |

## Design Specificity Verdict
Content is ARCAV-specific (client-voice service quotes, WhatsApp order demo, "Quem responde é o Armando"); the visual layer (glass + blue/amber orbs, glowing laptop hero art, 01/06 carousel, stacked sheets) is category-interchangeable and hides the specific parts. Detector: CLI 0 findings (styles live in CSS). Browser overlay 46 findings at 360/390, mostly false positives (low-contrast on translucent buttons, items inside scroller). Real: 13 glass cards thin-border+wide-shadow, 5 icon-tile-stack on service h3, dark-glow on closing button, Inter 90% of text. Orbs roughly halve rendered text contrast (still ≥4.4).

## Measurements (390 / 360)
Page 6074px = 7.2 screens / 6298px = 8.1. Services 1.73 / 1.91 screens; Experimente 1.73 / 2.05. Demo starts at 2.6 screens, contact at 6.0. H1 32px = five H2 32px; H1 3 lines (390), 4 lines (360). Touch targets <44: stepper 30x30, "Ver a solução" 27px tall, header CTA 40px, footer links 19px.

## Priority Issues
- [P1] Page too long and repetitive (7.2–8.1 screens; manifesto repeats services after demo). Fix: Hero → short case list → Demo → 4-step "Como funciona" → Contact; drop manifesto; target ~4.5 screens. distill, layout.
- [P1] Type hierarchy flat: H1 = H2 = 32px, ~14 lines of display type. Fix: H1 ~28px, H2 ~24px mobile; headings ≤2 lines at 360. typeset.
- [P1] Hero abstract; laptop art 28% of first screen, cut by next sheet. Fix: concrete H1 in owner's words; drop art on mobile so case list starts in screen 1. clarify, quieter.
- [P1] WhatsApp-icon primary CTA opens a 6-checkbox form; direct WhatsApp only at y≈5400; four labels for one action; only sticky CTA is 40px top-right. Conflicts with 2026-11-18 decision (WhatsApp primary, form secondary). Fix: direct wa.me with prefilled message, one label, form secondary, bottom sticky bar. clarify, adapt.
- [P2] Services/demo on phone: tall cards, 27px links, single non-functional demo tab, 30px steppers, Recomeçar before start. Fix: services as 76px full-row links, hide single tab, 44px steppers, Recomeçar after send. adapt, polish.

## Persona Red Flags
- Dona Cida (shop owner, 360 Android, from WhatsApp): "produtos digitais" + glowing laptop = expensive tech; her sentence is card 4 of 5, >2 screens down; WhatsApp button opens a form.
- Casey: next CTA after hero ~3600px down; sideways-snapping carousel mid vertical scroll.
- Jordan: "Testar as soluções" with a website need lands in a grocery demo; Landing pages / Migração / Mapear unexplained.

## Minor Observations
Hoje/Depois labels hidden <720px; mobile menu lacks Contato; method cards 290px for 2 lines; closing paragraph 4–5 lines and hedging; home glass vs flat solution pages read as two sites; DESIGN.md contradicts itself on glass.

## Questions to Consider
- Should the home only route, prove and connect (case list, demo, WhatsApp), leaving depth to solution pages?
- Visitor arrives from WhatsApp: why a form to get back to WhatsApp?
- Is the six-step method for the shop owner or for the recruiter?
