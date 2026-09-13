# ARCAV — UX, Responsive, Accessibility & Performance

## Responsive principle

Do not merely shrink the desktop design.

Recompose the experience by breakpoint.

---

## Desktop

Approximate range:

`>= 1200px`

Hero:
- two major columns
- copy ~40–45%
- system/map visual ~55–60%
- full labels
- visible navigation

Method:
- horizontal structured flow

Cases:
- editorial feature layout or controlled multi-column composition

---

## Tablet

Approximate range:

`768px–1199px`

- preserve hierarchy
- use two columns only when text remains comfortable
- otherwise stack hero copy above the visual
- reduce decorative geometry
- keep system labels readable
- no compressed desktop UI

---

## Mobile

Approximate range:

`< 768px`

Hero order:

1. Brand / eyebrow
2. H1
3. Supporting copy
4. CTAs
5. "Pequeños en alcance..."
6. Simplified process diagram
7. Professional trajectory

Process diagram:

**Inputs  
↓  
ARCAV  
↓  
Outputs**

Do not squeeze a desktop network diagram into a tiny horizontal space.

Trajectory:

Prefer a vertical route:

**Venezuela  
↓  
México  
↓  
San Diego  
↓  
Curitiba**

Services:
- one per row
- flows simplified but complete
- no forced horizontal scrolling

Method:
- vertical timeline

Cases:
- one per row
- preserve aspect ratios

No horizontal overflow at:
- 320px
- 360px
- 390px
- 430px

Touch targets:
- at least ~44px

Use `clamp()` for fluid typography where appropriate.

---

## Accessibility

Mandatory:

- semantic HTML
- one H1
- logical heading hierarchy
- keyboard navigation
- visible focus states
- accessible mobile menu
- meaningful labels
- sufficient contrast
- no state communicated only by color
- decorative SVGs hidden from screen readers
- respect `prefers-reduced-motion`

---

## Performance

Prefer:

- Astro-native rendering
- CSS
- SVG
- minimal client JavaScript
- responsive images

Avoid:

- Three.js
- full map libraries
- heavy animation frameworks unless already justified
- background video
- unnecessary hydration
- giant image assets

The site should remain strong and understandable with JavaScript disabled wherever possible.

---

## Motion

Motion must communicate structure.

Good uses:
- route drawing
- node activation
- diagram connections
- subtle section reveal
- button/link micro-interactions

Bad uses:
- scroll hijacking
- bouncing
- cursor followers
- excessive parallax
- large 3D movement
- animation that delays reading/navigation
