# Sprint 1 — espejo de Vikunja; hardening del flujo

Estado local: hardening autorizado; aceptación de Sprint 1 pendiente de reconciliación de evidencia.
Sprint 2: bloqueado hasta aprobación humana explícita; no iniciado.
Proyecto Vikunja: [lp-arcav-us](https://vikunja.arcav.us/projects/2)
Responsable operativo: `scrum-master-agent`
PRD de referencia: [PRD.md](PRD.md); aprobación pendiente.
Última lectura remota completa (UTC): 2026-09-14T21:36:45.464559+00:00
Snapshot SHA-256: `6ac005880686e49ba1605483cec2fc83bb8dbea4caa2ddf5ef39c9e1decaa75f`
Fuente: GET /projects/2/views/11/tasks; todas las páginas; dos lecturas coincidentes.

Vikunja es la fuente de verdad del estado declarado. `done=true` no acredita aprobación, revisión ni QA.
La proyección no ejecuta transiciones. Cierres, criterios y contadores requieren evidencia independiente.
Correlaciones ticket/historia en `config/governance.json`: metadatos locales auditados, no campos inventados de API.
Cambios de código observados en `81dc82d`; diagnóstico y pendientes en [docs/hardening/audit.md](docs/hardening/audit.md).

| Ticket | Correlación local | Responsable por etiqueta | Estado remoto | Aceptación | Reaperturas |
|---|---|---|---|---|---|
| [VK-2](https://vikunja.arcav.us/tasks/2) | `lp-arcav-us:US-01` | `po-agent` | done=true | no verificada | no verificado |
| [VK-3](https://vikunja.arcav.us/tasks/3) | `lp-arcav-us:US-02` | `designer-agent` | done=true | no verificada | no verificado |
| [VK-4](https://vikunja.arcav.us/tasks/4) | `lp-arcav-us:US-03` | `frontend-dev-agent` | done=true | no verificada | no verificado |
| [VK-5](https://vikunja.arcav.us/tasks/5) | `lp-arcav-us:US-04` | `frontend-dev-agent` | done=true | no verificada | no verificado |
| [VK-6](https://vikunja.arcav.us/tasks/6) | `lp-arcav-us:US-05` | `frontend-dev-agent` | done=true | no verificada | no verificado |
| [VK-7](https://vikunja.arcav.us/tasks/7) | `lp-arcav-us:US-06` | `frontend-dev-agent` | done=true | no verificada | no verificado |
| [VK-8](https://vikunja.arcav.us/tasks/8) | `lp-arcav-us:US-07` | `backend-dev-agent` | done=false | no verificada | no verificado |
| [VK-9](https://vikunja.arcav.us/tasks/9) | `lp-arcav-us:US-08` | `qa-agent` | done=false | no verificada | no verificado |
| [VK-10](https://vikunja.arcav.us/tasks/10) | `lp-arcav-us:US-09` | `devops-agent` | done=false | no verificada | no verificado |

## Referencias remotas

### VK-2 — [US-01] Definición de PRD y Historias de Usuario con 4 Escenarios

Revisión remota: `2026-09-13T22:22:57Z`. Etiquetas: role:po, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 9, "title": "Done", "project_view_id": 12}]`.

### VK-3 — [US-02] Sistema de Diseño y Tokens ARCAV (Vanilla CSS / Astro)

Revisión remota: `2026-09-13T22:23:32Z`. Etiquetas: role:designer, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 9, "title": "Done", "project_view_id": 12}]`.

### VK-4 — [US-03] Componente Hero & Marca 'Evolución de Procesos'

Revisión remota: `2026-09-13T22:23:33Z`. Etiquetas: role:frontend, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 9, "title": "Done", "project_view_id": 12}]`.

### VK-5 — [US-04] Sección de Servicios y Productos Digitales

Revisión remota: `2026-09-13T22:23:33Z`. Etiquetas: role:frontend, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 9, "title": "Done", "project_view_id": 12}]`.

### VK-6 — [US-05] Casos de Uso y Trayectoria Internacional

Revisión remota: `2026-09-13T22:23:34Z`. Etiquetas: role:frontend, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 9, "title": "Done", "project_view_id": 12}]`.

### VK-7 — [US-06] Enrutamiento Multilingüe i18n (ES / EN / PT)

Revisión remota: `2026-09-13T22:23:34Z`. Etiquetas: role:frontend, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 9, "title": "Done", "project_view_id": 12}]`.

### VK-8 — [US-07] Formulario de Contacto y Backend de Notificaciones

Revisión remota: `2026-09-13T22:22:35Z`. Etiquetas: role:backend, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 10, "title": "QA / Review", "project_view_id": 12}]`.

### VK-9 — [US-08] Verificación de QA, Criterios y Bug Report

Revisión remota: `2026-09-13T22:22:36Z`. Etiquetas: role:qa, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 10, "title": "QA / Review", "project_view_id": 12}]`.

### VK-10 — [US-09] Build y Despliegue en Cloudflare Workers

Revisión remota: `2026-09-13T22:22:37Z`. Etiquetas: role:devops, sprint-1.
Buckets observados (sin interpretar aceptación): `[{"id": 7, "title": "To-Do", "project_view_id": 12}]`.

## Trabajo autorizado de hardening

Encargo: instrucción humana de auditar y corregir gobernanza; no es aprobación del PRD de producto.
Entrega local: gate, sincronizador, documentación y pruebas; resultados en el diagnóstico.
Revisión independiente, QA final y merge de hardening: pendientes. No hay cierre automático de fase.
