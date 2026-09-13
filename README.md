# ARCAV Landing Page (lp-arcav-us)

Sitio web landing page y portafolio multilenguaje (ES / EN / PT) para ARCAV, desarrollado con **Astro** y configurado para despliegue en **Cloudflare Workers**.

---

## 🤖 Flujo Agéntico y Gobernanza (agyFlow Squad)

Este repositorio incorpora la infraestructura del squad agéntico **agyFlow**, diseñado para coordinar el ciclo de vida de desarrollo de software mediante roles de IA especializados:

* **Índice Maestro del Squad:** [`AGENTS.md`](AGENTS.md)
* **Estrategia de Contexto:** [`docs/context-strategy.md`](docs/context-strategy.md)
* **Protocolo de Handoff:** [`docs/protocolo.md`](docs/protocolo.md)
* **Requerimientos y PRD:** [`PRD.md`](PRD.md)
* **Espejo del Sprint:** [`sprint_actual.md`](sprint_actual.md) *(integrado con **Vikunja** en VPS para la gestión operativa de tareas)*

### Agentes del Squad
| Agente | Rol / Dominio |
|---|---|
| `po-agent` | `PRD.md` e historias de usuario con 4 escenarios |
| `scrum-master-agent` | Planificación, gestión en Vikunja y espejo del sprint |
| `designer-agent` | Diseño, tokens y recursos visuales |
| `frontend-dev-agent` | Desarrollo e interfaz con Astro, React y TypeScript |
| `backend-dev-agent` | Servicios, APIs y contratos de datos |
| `qa-agent` | Evaluación de criterios de aceptación y `bug_report.md` |
| `devops-agent` | Preparación de build/CI y despliegue a Staging |
| `automation-agent` | Sincronización de workflows y estado operativo |

---

## 🚀 Estructura del Proyecto

```text
/
├── .agents/              # Roles, skills y configuración MCP del squad
├── config/               # Asignación de skills por agente
├── docs/                 # Estrategia de contexto, protocolos y diagramas
├── public/               # Assets estáticos
├── scripts/              # Herramientas de validación y simulación de pipeline
├── src/                  # Componentes, i18n, layouts y páginas Astro
│   └── pages/
│       ├── index.astro   # Detección y redirección de idioma
│       ├── es/, en/, pt/ # Páginas por idioma (Coming Soon)
│       └── draft.astro   # Borrador de la landing completa
├── AGENTS.md             # Gobernanza y manual maestro del squad
├── PRD.md                # Requerimientos vigentes
├── sprint_actual.md      # Estado operativo del sprint
└── package.json
```

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local |
| `npm run build` | Genera la build de producción en `./dist/` |
| `npm run preview` | Previsualiza la build localmente |
| `python3 scripts/validate_squad.py` | Valida la estructura e integridad del squad agyFlow |
