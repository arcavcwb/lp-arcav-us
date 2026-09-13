# Sprint 1 — ARCAV Landing Page & Engine

Estado: activo (Sprint 1)
Proyecto Vikunja: `lp-arcav-us` (https://vikunja.arcav.us/projects/2)
Tablero Kanban: [Kanban Board](https://vikunja.arcav.us/projects/2/views/12)
PRD de referencia: [PRD.md](PRD.md)
Responsable operativo: `scrum-master-agent`

Vikunja es la fuente de verdad. Este archivo es un espejo local actualizado según `docs/protocolo.md`.

## Resumen del sprint

| Ticket / ID | Clave estable | Responsable | Estado | Reaperturas |
|---|---|---|---|---|
| VK-2 | `lp-arcav-us:US-01` | `po-agent` | *por iniciar* | 0 |
| VK-3 | `lp-arcav-us:US-02` | `designer-agent` | *por iniciar* | 0 |
| VK-4 | `lp-arcav-us:US-03` | `frontend-agent` | *por iniciar* | 0 |
| VK-5 | `lp-arcav-us:US-04` | `frontend-agent` | *por iniciar* | 0 |
| VK-6 | `lp-arcav-us:US-05` | `frontend-agent` | *por iniciar* | 0 |
| VK-7 | `lp-arcav-us:US-06` | `frontend-agent` | *por iniciar* | 0 |
| VK-8 | `lp-arcav-us:US-07` | `backend-agent` | *por iniciar* | 0 |
| VK-9 | `lp-arcav-us:US-08` | `qa-agent` | *por iniciar* | 0 |
| VK-10 | `lp-arcav-us:US-09` | `devops-agent` | *por iniciar* | 0 |

## Detalle de tareas

### [VK-2] [US-01] Definición de PRD y Historias de Usuario con 4 Escenarios
- **Clave estable**: `lp-arcav-us:US-01`
- **ID y enlace de Vikunja**: [VK-2](https://vikunja.arcav.us/tasks/2)
- **Historia asociada**: US-01
- **Responsable**: `po-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 5
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### Requerimiento & Brief de Producto
Definir y estructurar el archivo PRD.md para la marca **ARCAV — Digital products & process evolution by Armando Castro**.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** un brief completo de producto y arquitectura
   - **Cuando** el `po-agent` redacta las Historias de Usuario US-01 a US-09
   - **Entonces** cada historia contiene sus 4 escenarios Given/When/Then.
2. **Sad Path (Validación)**:
   - **Dado** una ambigüedad o falta de especificación en el brief
   - **Cuando** se valida el PRD con `validate_squad.py`
   - **Entonces** se marca la ambigüedad en Preguntas Abiertas sin asumir respuestas no verificadas.
3. **Edge Case (Límite / Alcance)**:
   - **Dado** un cambio de requerimiento durante el sprint
   - **Cuando** el usuario solicita modificar el alcance
   - **Entonces** se actualiza PRD.md y se solicita re-aprobación humana explícita.
4. **Estado Vacío (UI / UX)**:
   - **Dado** una sección sin datos de contenido final
   - **Cuando** el usuario visualiza el borrador
   - **Entonces** se muestra un estado 'Coming Soon' estructurado sin romper el layout.

### [VK-3] [US-02] Sistema de Diseño y Tokens ARCAV (Vanilla CSS / Astro)
- **Clave estable**: `lp-arcav-us:US-02`
- **ID y enlace de Vikunja**: [VK-3](https://vikunja.arcav.us/tasks/3)
- **Historia asociada**: US-02
- **Responsable**: `designer-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 4
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### Sistema de Diseño & Tokens CSS
Implementar tokens visuales en `src/styles/` y `index.css` siguiendo `docs/DESIGN_SYSTEM.md`.

- **Paleta**: Slate Dark (#0B0F19), Emerald Glow (#10B981), Card Dark (#111827), Text Primary (#F9FAFB).
- **Tipografía**: Outfit / Inter vía Google Fonts.
- **Micro-animaciones**: Transiciones suaves (200ms ease), hovers interactivos y glow sutil.
- **Regla**: Vanilla CSS sin Tailwind CSS salvo que sea pedido explícitamente.

### [VK-4] [US-03] Componente Hero & Marca 'Evolución de Procesos'
- **Clave estable**: `lp-arcav-us:US-03`
- **ID y enlace de Vikunja**: [VK-4](https://vikunja.arcav.us/tasks/4)
- **Historia asociada**: US-03
- **Responsable**: `frontend-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 4
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### Hero Section & Brand Positioning
Desarrollar el componente Hero interactivo para ARCAV en Astro.

- **Tagline principal**: *Transformo procesos de negocio en productos digitales simples, automatizados y fáciles de operar.*
- **Sub-idea**: *Pequeños en alcance. Serios en ingeniería.*
- **Trayectoria**: Venezuela → México → San Diego / USA → Brasil.
- **Acciones**: Botón principal de consulta e indicador de disponibilidad.

### [VK-5] [US-04] Sección de Servicios y Productos Digitales
- **Clave estable**: `lp-arcav-us:US-04`
- **ID y enlace de Vikunja**: [VK-5](https://vikunja.arcav.us/tasks/5)
- **Historia asociada**: US-04
- **Responsable**: `frontend-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 3
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### Servicios Principales
1. Connected Landing Pages
2. Small Business Systems (CRM liviano, reservas, backoffice)
3. Automation & Integration (APIs, n8n, webhooks)

### [VK-6] [US-05] Casos de Uso y Trayectoria Internacional
- **Clave estable**: `lp-arcav-us:US-05`
- **ID y enlace de Vikunja**: [VK-6](https://vikunja.arcav.us/tasks/6)
- **Historia asociada**: US-05
- **Responsable**: `frontend-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 3
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### Casos de Ingeniería & Demostración
Presentación clara de problemas de negocio resueltos sin inventar métricas ni sobreexponer confidencialidad.

### [VK-7] [US-06] Enrutamiento Multilingüe i18n (ES / EN / PT)
- **Clave estable**: `lp-arcav-us:US-06`
- **ID y enlace de Vikunja**: [VK-7](https://vikunja.arcav.us/tasks/7)
- **Historia asociada**: US-06
- **Responsable**: `frontend-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 3
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### i18n Routing
Rutas `/es`, `/en`, `/pt` con detección automática de idioma y cookie de preferencia.

### [VK-8] [US-07] Formulario de Contacto y Backend de Notificaciones
- **Clave estable**: `lp-arcav-us:US-07`
- **ID y enlace de Vikunja**: [VK-8](https://vikunja.arcav.us/tasks/8)
- **Historia asociada**: US-07
- **Responsable**: `backend-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 3
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### Captura de Leads & Notificaciones
Contratos de datos en TypeScript e integración con backend de notificaciones (n8n/webhook).

### [VK-9] [US-08] Verificación de QA, Criterios y Bug Report
- **Clave estable**: `lp-arcav-us:US-08`
- **ID y enlace de Vikunja**: [VK-9](https://vikunja.arcav.us/tasks/9)
- **Historia asociada**: US-08
- **Responsable**: `qa-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 4
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### Control de Calidad
Pruebas de aceptación, accesibilidad, respuestas responsive y generación de `bug_report.md`.

### [VK-10] [US-09] Build y Despliegue en Cloudflare Workers
- **Clave estable**: `lp-arcav-us:US-09`
- **ID y enlace de Vikunja**: [VK-10](https://vikunja.arcav.us/tasks/10)
- **Historia asociada**: US-09
- **Responsable**: `devops-agent`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: 4
- **Dependencias**: ninguna
- **Descripción & Criterios**:
### Build & Cloudflare Release
Validar bundle en Astro, verificar `wrangler.jsonc` y preparar el despliegue a Staging/Producción.

