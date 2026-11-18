# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary (the landing page is optimized for them):** owners and operators of small and medium businesses whose operation still runs on WhatsApp, spreadsheets, loose forms, email and people's memory — events, retail and campaigns, restaurants and delivery, real estate, service businesses. The business has grown past those tools: information is scattered, work is repeated by hand, and the owner cannot see or control what is happening. Their job on the page: understand quickly whether ARCAV can fix *their* operation, trust that it has done it before, and start a conversation.

**Markets:** Brazil, Spanish-speaking Latin America and the United States, with no single priority market (confirmed 2026-09-17). Spanish, Portuguese (pt-BR) and English are equal citizens.

**Secondary:** marketing teams that need landing pages connected to lead capture and follow-up; technical leaders and recruiters evaluating Armando's product/engineering profile. They may be served, but copy and structure are not optimized for them.

## Product Purpose

ARCAV is Armando Castro's one-person digital product and process-automation studio. It turns manual, scattered business processes into simple digital products that are connected, automated and easy to operate:

1. **Connected landing pages** — capture that feeds forms, CRM, databases, notifications and follow-up.
2. **Small business systems** — backoffices, registrations and events, lightweight CRM, orders, inventory, internal tools.
3. **Automation and integration** — APIs, n8n, webhooks, databases, Sheets and existing systems.

The landing page (arcav.us) exists to generate qualified conversations with those business owners. Success = a business owner submits the contact form describing a real process.

## Positioning

A single accountable builder who owns the whole product — process understanding, interface, backend, data, integrations, deployment and maintenance — for small operations, with engineering discipline that is usually reserved for large teams. "Pequeños en alcance. Serios en ingeniería." Integrates with what already works instead of forcing a migration ("Integrar sin invadir"), and uses its own AI-assisted delivery method (arcav-ia-flow) to spend less time on commodity code and more on the business rules.

## Operating Context

- Discovery starts from the client's own words about the process; the typical inputs are WhatsApp conversations, spreadsheets, forms, emails and documents.
- Delivery stack commonly includes Astro, TypeScript, Node.js, Directus, Supabase/PostgreSQL, n8n, Docker and Cloudflare.
- Leads arrive through the site's contact form, which must deliver to Armando's n8n (webhook) and from there to follow-up.
- The site is trilingual (ES / EN / PT) with routes `/es`, `/en`, `/pt`; `/` detects the visitor's language (cookie, then browser).

## Capabilities and Constraints

- Stack: Astro 6 (server output) on Cloudflare Workers, Vanilla CSS, all visible copy in `src/i18n/translations.ts` for es/en/pt. Workers Builds deploys `main` to production.
- Contact: **form → n8n** is the primary call to action (confirmed 2026-09-17). The current form is fake (simulates success) and must be replaced by a real endpoint; the webhook URL and any tokens live only in the Worker environment, never in the repository. Webhook URL and anti-spam approach: **open decision**.
- Direct email `hola@arcav.us` appears in the current site; whether that mailbox is monitored is **unconfirmed**.
- **Offer, packages, pricing and timelines are undecided** (confirmed 2026-09-17). Do not publish prices, packages, guarantees or delivery times.
- The repository is public: no secrets, client data or internal architecture of client systems in the repo.
- Professional trajectory is a project/company connection: Venezuela (start and education) → México (Arkus Nexus, Frontend Developer) → San Diego / USA (Drata, Frontend React Developer) → Curitiba / Brasil (product, automation, systems). Do not imply Armando lived in every location.

## Brand Commitments

- Name and lockup: **ARCAV** — Digital products & process evolution — **by Armando Castro**. A one-person studio; never present a fake team or agency.
- Voice: clear, direct, business-aware, technical only when useful, calm and confident; no hype or buzzwords (revolutionary, disruptive, cutting-edge, world-class, 10x, game-changing).
- Approved lines (docs/BRAND.md): "Transformo procesos de negocio en productos digitales simples, automatizados y fáciles de operar." · "Pequeños en alcance. Serios en ingeniería." · "Primero el proceso. Después la tecnología." · "Integrar sin invadir." · "No modernizo por modernizar." · "El objetivo no es construir más. Es construir lo necesario."
- Must not become: "Hi, I'm a Full Stack Developer" identity, technology-logo walls as main proof, generic SaaS or marketing-agency language, overly corporate or sci-fi tone (docs/PROJECT.md).
- Owner feedback on the current site (2026-09-17): it reads as AI-generated and boxy, "says a lot about nothing" and does not sell. Copy must name concrete situations and outcomes for the business owner.

## Evidence on Hand

The owner authorized showing these projects **by name and with screenshots** (2026-09-17). Screenshots are not yet in this repository; capture them from the projects, avoiding personal data of end users (names, phones, emails) and secrets.

- **Condor (rede de supermercados, via Condor-Martech)**
  - *Registro em Palestras* — `/home/diego/armando/orch/backoffice-eventos` (github.com/Condor-Martech/backoffice-eventos): talk-registration system; landing pages import an SDK form, one endpoint validates and stores, Directus is the source of truth for fields and seats; adding a form field needs no code change or SDK redeploy.
  - *Leadwhats Monitor* — `/home/diego/armando/leadwhats` (github.com/Condor-Martech/WhatsaPanel): monitors daily offer announcements across 26 WhatsApp communities in 14 regions and shows which announcements did not arrive (reports "incidence", not blame).
  - Campaign landing pages — `/home/diego/armando/LPS/*`, `/home/diego/armando/Sites/*` (e.g. Pet Condor / Cãocurso `pet.condor.com.br` in `/home/diego/armando/caocurso`, Mulher 2026, Radar de Ofertas, Clube Condor).
- **Grupo Zonta** — `/home/diego/armando/grupo-zonta` (github.com/Condor-Martech/grupozonta): marketing site migrated from WordPress/Elementor to Astro, pt-BR.
- **Z-ON Soluções** — `/home/diego/armando/Z-ON`: site audit (`Auditoria-ZON-Solucoes.md`) and WordPress → Astro migration plan.
- **Center Gás Curitiba** — `/home/diego/armando/personal/center-gas` (github.com/arcavcwb/center-gas): monorepo with apps, n8n workflows and infrastructure for a Curitiba gas business.
- **arcav-ia-flow** — `/home/diego/armando/personal/arcav-ia-flow` (github.com/arcavcwb/arcav-ia-flow, public): Armando's agentic software-delivery method separating product, architecture, development, review, QA and DevOps. Lead with the method, not the number of agents.
- Professional background: Arkus Nexus and Drata (roles above).

**Absent — must not be fabricated:** client testimonials, quantified results or metrics, client logos beyond the named projects, pricing, team members, certifications, awards.

## Product Principles

1. **Speak to the owner's day, not to the concept.** Every claim names a recognizable operational situation (the spreadsheet, the WhatsApp group, the missing lead) and what changes after.
2. **Real work is the proof.** Named projects, screenshots and what each one solved carry the persuasion; no invented numbers, testimonials or scale.
3. **Process first, then technology.** Integrate with what already works before replacing it; technology appears only as supporting evidence.
4. **Honest scale.** One accountable builder, small scope, serious engineering — never an agency pretending to be bigger.
5. **Three languages, one quality bar.** ES, PT and EN carry the same substance; no language is a partial translation.

## Accessibility & Inclusion

WCAG 2.1 AA contrast; semantic HTML with one H1 and logical headings; full keyboard navigation with visible focus; meaningful form labels and errors not conveyed by color alone; `prefers-reduced-motion` respected; no horizontal overflow from 320px; touch targets ≈44px; content readable with JavaScript disabled where possible (docs/UX_RESPONSIVE.md, PRD.md US-02/US-03).
