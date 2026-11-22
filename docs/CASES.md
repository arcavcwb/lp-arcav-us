# ARCAV — Cases and portfolio

**Last updated:** 2026-11-21. Rules for telling a piece of work, and how it enters the portfolio section ("Trabalhos", phase C of `docs/auditorias/AUDITORIA-VISUAL-HOME.md`, kept locally).

## General

Cases must demonstrate how Armando thinks and works. Do not reduce them to screenshots and technology lists.

Preferred structure:

1. Context
2. Problem
3. Existing process
4. Constraints
5. Decision
6. Solution
7. Architecture / flow
8. Outcome or learning
9. Technologies as supporting evidence

Do not invent measurable outcomes. Site copy is in pt-BR.

## How a project enters the portfolio

- **The project lives elsewhere.** Its code and deployment are in its own repository; this repository only stores screenshots, a data entry and the link.
- **Data:** one entry per project (planned `src/data/projects.ts`): name or type of business, service, year, honest label, external URL and images.
- **Images:** `public/trabalhos/<slug>/`, desktop at 1440 × 900 and mobile at 390 × 844, first screen, sample data loaded, no animations. AVIF or WebP, 1x and 2x. No stock device mockups.
- **Honest label**, always visible: "Projeto real · marca do cliente omitida" or "Exemplo feito pela ARCAV · marca fictícia".
- **Link:** "Ver projeto ↗", opening the external site in a new tab.
- **Threshold:** the portfolio section only replaces "Exemplos" when there are at least three projects. One or two entries look empty.
- **Permission:** a client's name, logo or screenshot only with written authorization. A prospect (e.g. Center Gás) is not a client case.

## Candidate cases

### Case 01 — End-to-end product

Working title: **De operação manual a produto digital operacional**

Source context: independent product work, including restaurant, order, kitchen and delivery operations.

What it demonstrates: user-flow thinking, product definition, frontend, backend, database, business rules, deployment, infrastructure, maintenance and end-to-end ownership.

Core message: **Construir uma interface é diferente de se responsabilizar para que o produto inteiro funcione.**

### Case 02 — Automation and integration

Working title: **Integrar sem invadir**

What it demonstrates: process understanding, API integration, n8n orchestration, data transformation, de-duplication and sanitation where applicable, an independent integration layer, reduced coupling and respect for existing systems.

Useful anonymized example: a campaign captured leads while another internal system managed the operational source of truth. The solution connected authorized data through an independent layer instead of directly modifying interconnected internal systems.

Core message: **Nem todo problema precisa de uma migração.**

Confidentiality: do not expose current client or company internal systems, screenshots, proprietary architecture, product names or protected information.

### Case 03 — arcav-ia-flow

Working title: **Projetar o sistema que constrói o sistema**

Public project: https://github.com/arcavcwb/arcav-ia-flow

What it demonstrates: product methodology, agentic workflow design, separation of responsibilities, architecture, QA, independent review, DevOps, governance and AI-assisted product delivery.

Core message: **Não uso IA só para programar mais rápido. Uso para melhorar todo o processo de construção de produto.**

Do not lead with the number of agents as the value proposition. The value is the system and the product-building method.
