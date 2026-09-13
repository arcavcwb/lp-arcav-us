#!/usr/bin/env python3
"""Vikunja API integration tool for agyFlow squad task management with Scrum support."""

import argparse
import json
import os
from pathlib import Path
import sys
import urllib.request
import urllib.error

ROOT_DIR = Path(__file__).resolve().parents[1]

def load_env_file():
    """Load key-value pairs from .env file into os.environ if present."""
    env_path = ROOT_DIR / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip().strip('"\''))

def get_config():
    load_env_file()
    base_url = os.getenv("VIKUNJA_URL", "https://vikunja.arcav.us").rstrip("/")
    if not base_url.endswith("/api/v1"):
        base_url = f"{base_url}/api/v1"
    token = os.getenv("VIKUNJA_API_TOKEN", "")
    return base_url, token

def request(endpoint, method="GET", data=None):
    base_url, token = get_config()
    url = f"{base_url}{endpoint}"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "agyFlow-Vikunja-Sync/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8")
        if err.code == 400 and "already exists" in body:
            return {}
        sys.stderr.write(f"HTTP Error {err.code}: {body}\n")
        return None
    except Exception as exc:
        sys.stderr.write(f"Connection Error: {exc}\n")
        return None

def check_info():
    info = request("/info")
    if info:
        print(f"✅ Vikunja accesible. Versión: {info.get('version', 'desconocida')}")
        return True
    else:
        print("❌ No se pudo conectar con Vikunja.")
        return False

def get_user_info():
    return request("/user")

def list_projects():
    return request("/projects")

def create_project(title, description=""):
    return request("/projects", method="PUT", data={"title": title, "description": description})

def get_or_create_project(title, description=""):
    projects = list_projects()
    if isinstance(projects, list):
        for p in projects:
            if p.get("title") == title:
                return p
    return create_project(title, description)

def list_tasks(project_id):
    return request(f"/projects/{project_id}/tasks")

def create_task(project_id, title, description="", priority=3):
    data = {
        "title": title,
        "description": description,
        "priority": priority
    }
    return request(f"/projects/{project_id}/tasks", method="PUT", data=data)

def update_task(task_id, data):
    return request(f"/tasks/{task_id}", method="POST", data=data)

def get_labels():
    return request("/labels") or []

def create_label(title, hex_color="3B82F6"):
    return request("/labels", method="PUT", data={"title": title, "hex_color": hex_color})

def ensure_labels():
    existing = {l.get("title"): l.get("id") for l in get_labels() if isinstance(l, dict)}
    squad_labels = [
        ("role:po", "3B82F6"),
        ("role:designer", "EC4899"),
        ("role:frontend", "10B981"),
        ("role:backend", "8B5CF6"),
        ("role:qa", "F59E0B"),
        ("role:devops", "6366F1"),
        ("role:scrum", "64748B"),
        ("priority:high", "EF4444"),
        ("priority:medium", "F59E0B"),
        ("sprint-1", "06B6D4")
    ]
    label_map = {}
    for title, color in squad_labels:
        if title in existing:
            label_map[title] = existing[title]
        else:
            lbl = create_label(title, color)
            if lbl and lbl.get("id"):
                label_map[title] = lbl.get("id")
    return label_map

def attach_label_to_task(task_id, label_id):
    return request(f"/tasks/{task_id}/labels", method="PUT", data={"label_id": label_id})

def get_kanban_view(project_id):
    proj = request(f"/projects/{project_id}")
    if proj and isinstance(proj.get("views"), list):
        for v in proj["views"]:
            if v.get("view_kind") == "kanban":
                return v
    return None

def get_kanban_buckets(project_id, view_id):
    return request(f"/projects/{project_id}/views/{view_id}/buckets") or []

def ensure_scrum_kanban(project_id=2):
    view = get_kanban_view(project_id)
    if not view:
        return {}
    view_id = view.get("id")
    buckets = get_kanban_buckets(project_id, view_id)
    bucket_map = {b.get("title"): b.get("id") for b in buckets if isinstance(b, dict)}
    
    expected_buckets = [
        ("To-Do", 100),
        ("Doing", 200),
        ("QA / Review", 250),
        ("Done", 300)
    ]
    for title, pos in expected_buckets:
        if title not in bucket_map:
            res = request(f"/projects/{project_id}/views/{view_id}/buckets", method="PUT", data={"title": title, "position": pos})
            if res and res.get("id"):
                bucket_map[title] = res.get("id")
    return bucket_map

def move_task_to_bucket(project_id, task_id, bucket_id):
    view = get_kanban_view(project_id)
    if view:
        view_id = view.get("id")
        return request(f"/projects/{project_id}/views/{view_id}/buckets/{bucket_id}/tasks", method="POST", data={"task_id": task_id})
    return None

INITIAL_TASKS = [
    {
        "key": "US-01",
        "title": "[US-01] Definición de PRD y Historias de Usuario con 4 Escenarios",
        "role": "role:po",
        "priority": 5,
        "description": """### Requerimiento & Brief de Producto
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
   - **Entonces** se muestra un estado 'Coming Soon' estructurado sin romper el layout."""
    },
    {
        "key": "US-02",
        "title": "[US-02] Sistema de Diseño y Tokens ARCAV (Vanilla CSS / Astro)",
        "role": "role:designer",
        "priority": 4,
        "description": """### Sistema de Diseño & Tokens CSS
Implementar tokens visuales en `src/styles/` y `index.css` siguiendo `docs/DESIGN_SYSTEM.md`.

- **Paleta**: Slate Dark (#0B0F19), Emerald Glow (#10B981), Card Dark (#111827), Text Primary (#F9FAFB).
- **Tipografía**: Outfit / Inter vía Google Fonts.
- **Micro-animaciones**: Transiciones suaves (200ms ease), hovers interactivos y glow sutil.
- **Regla**: Vanilla CSS sin Tailwind CSS salvo que sea pedido explícitamente."""
    },
    {
        "key": "US-03",
        "title": "[US-03] Componente Hero & Marca 'Evolución de Procesos'",
        "role": "role:frontend",
        "priority": 4,
        "description": """### Hero Section & Brand Positioning
Desarrollar el componente Hero interactivo para ARCAV en Astro.

- **Tagline principal**: *Transformo procesos de negocio en productos digitales simples, automatizados y fáciles de operar.*
- **Sub-idea**: *Pequeños en alcance. Serios en ingeniería.*
- **Trayectoria**: Venezuela → México → San Diego / USA → Brasil.
- **Acciones**: Botón principal de consulta e indicador de disponibilidad."""
    },
    {
        "key": "US-04",
        "title": "[US-04] Sección de Servicios y Productos Digitales",
        "role": "role:frontend",
        "priority": 3,
        "description": """### Servicios Principales
1. Connected Landing Pages
2. Small Business Systems (CRM liviano, reservas, backoffice)
3. Automation & Integration (APIs, n8n, webhooks)"""
    },
    {
        "key": "US-05",
        "title": "[US-05] Casos de Uso y Trayectoria Internacional",
        "role": "role:frontend",
        "priority": 3,
        "description": """### Casos de Ingeniería & Demostración
Presentación clara de problemas de negocio resueltos sin inventar métricas ni sobreexponer confidencialidad."""
    },
    {
        "key": "US-06",
        "title": "[US-06] Enrutamiento Multilingüe i18n (ES / EN / PT)",
        "role": "role:frontend",
        "priority": 3,
        "description": """### i18n Routing
Rutas `/es`, `/en`, `/pt` con detección automática de idioma y cookie de preferencia."""
    },
    {
        "key": "US-07",
        "title": "[US-07] Formulario de Contacto y Backend de Notificaciones",
        "role": "role:backend",
        "priority": 3,
        "description": """### Captura de Leads & Notificaciones
Contratos de datos en TypeScript e integración con backend de notificaciones (n8n/webhook)."""
    },
    {
        "key": "US-08",
        "title": "[US-08] Verificación de QA, Criterios y Bug Report",
        "role": "role:qa",
        "priority": 4,
        "description": """### Control de Calidad
Pruebas de aceptación, accesibilidad, respuestas responsive y generación de `bug_report.md`."""
    },
    {
        "key": "US-09",
        "title": "[US-09] Build y Despliegue en Cloudflare Workers",
        "role": "role:devops",
        "priority": 4,
        "description": """### Build & Cloudflare Release
Validar bundle en Astro, verificar `wrangler.jsonc` y preparar el despliegue a Staging/Producción."""
    }
]

def sync_initial_tasks(project_title="lp-arcav-us"):
    proj = get_or_create_project(project_title, "Proyecto agyFlow Squad para ARCAV Landing Page")
    if not proj:
        print("❌ Error: No se pudo obtener/crear el proyecto en Vikunja.")
        return []
    
    proj_id = proj.get("id")
    label_map = ensure_labels()
    bucket_map = ensure_scrum_kanban(proj_id)

    existing_tasks = list_tasks(proj_id)
    existing_titles = {t.get("title"): t for t in existing_tasks} if isinstance(existing_tasks, list) else {}

    created = []
    print(f"🚀 Sincronizando Scrum Backlog en proyecto '{project_title}' (ID: {proj_id})...")
    for t in INITIAL_TASKS:
        title = t["title"]
        role_label = t.get("role")
        priority = t.get("priority", 3)
        desc = t.get("description", "")

        if title in existing_titles:
            task_obj = existing_titles[title]
            task_id = task_obj.get("id")
            print(f"  - Actualizando tarea: [{task_id}] {title}")
            update_task(task_id, {"description": desc, "priority": priority})
            created.append({**t, "id": task_id})
        else:
            task_obj = create_task(proj_id, title, desc, priority=priority)
            if task_obj and task_obj.get("id"):
                task_id = task_obj.get("id")
                print(f"  + Creada: [{task_id}] {title}")
                created.append({**t, "id": task_id})
            else:
                print(f"  ❌ Error creando tarea: {title}")
                continue
        
        # Attach label
        if role_label in label_map and task_id:
            attach_label_to_task(task_id, label_map[role_label])
        if "sprint-1" in label_map and task_id:
            attach_label_to_task(task_id, label_map["sprint-1"])

    return created

def update_sprint_actual_md(tasks):
    sprint_file = ROOT_DIR / "sprint_actual.md"
    base_url, _ = get_config()
    frontend_url = base_url.replace("/api/v1", "")

    summary_rows = []
    detail_blocks = []

    for t in tasks:
        task_id = t.get("id", "N/A")
        key = t.get("key")
        title = t.get("title")
        role = t.get("role").replace("role:", "") + "-agent"
        desc = t.get("description")
        link = f"{frontend_url}/tasks/{task_id}" if task_id != "N/A" else "N/A"

        summary_rows.append(f"| VK-{task_id} | `lp-arcav-us:{key}` | `{role}` | *por iniciar* | 0 |")
        detail_blocks.append(f"""### [VK-{task_id}] {title}
- **Clave estable**: `lp-arcav-us:{key}`
- **ID y enlace de Vikunja**: [VK-{task_id}]({link})
- **Historia asociada**: {key}
- **Responsable**: `{role}`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Prioridad**: {t.get('priority')}
- **Dependencias**: ninguna
- **Descripción & Criterios**:
{desc}
""")

    content = f"""# Sprint 1 — ARCAV Landing Page & Engine

Estado: activo (Sprint 1)
Proyecto Vikunja: `lp-arcav-us` ({frontend_url}/projects/2)
Tablero Kanban: [Kanban Board]({frontend_url}/projects/2/views/12)
PRD de referencia: [PRD.md](PRD.md)
Responsable operativo: `scrum-master-agent`

Vikunja es la fuente de verdad. Este archivo es un espejo local actualizado según `docs/protocolo.md`.

## Resumen del sprint

| Ticket / ID | Clave estable | Responsable | Estado | Reaperturas |
|---|---|---|---|---|
{"\n".join(summary_rows)}

## Detalle de tareas

{"\n".join(detail_blocks)}
"""
    sprint_file.write_text(content, encoding="utf-8")
    print("✅ sprint_actual.md actualizado con la estructura Scrum completa de Vikunja.")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--info", action="store_true", help="Verificar estado de Vikunja")
    parser.add_argument("--user", action="store_true", help="Verificar token de usuario")
    parser.add_argument("--list-projects", action="store_true", help="Listar proyectos")
    parser.add_argument("--ensure-project", type=str, help="Asegurar existencia de un proyecto por título")
    parser.add_argument("--sync-tasks", action="store_true", help="Cargar tareas iniciales a Vikunja y actualizar sprint_actual.md")
    parser.add_argument("--setup-scrum", action="store_true", help="Configurar columnas Kanban y etiquetas de roles")
    args = parser.parse_args()

    _, token = get_config()

    if args.info or len(sys.argv) == 1:
        if not check_info():
            sys.exit(1)

    if args.user:
        user = get_user_info()
        if user:
            print(f"👤 Usuario autenticado: {user.get('username')}")
        else:
            print("❌ Token inválido o no autorizado.")

    if args.list_projects:
        projects = list_projects()
        if isinstance(projects, list):
            print(f"📂 Proyectos encontrados ({len(projects)}):")
            for p in projects:
                print(f"  - [{p.get('id')}] {p.get('title')}")
        else:
            print("❌ Error obteniendo la lista de proyectos.")

    if args.ensure_project:
        proj = get_or_create_project(args.ensure_project, "Proyecto gestionado por squad agyFlow")
        if proj:
            print(f"✅ Proyecto listo: ID {proj.get('id')}")

    if args.setup_scrum:
        ensure_labels()
        ensure_scrum_kanban(2)
        print("✅ Tablero Kanban y Etiquetas de Scrum configurados en Vikunja.")

    if args.sync_tasks:
        tasks = sync_initial_tasks("lp-arcav-us")
        if tasks:
            update_sprint_actual_md(tasks)

if __name__ == "__main__":
    main()
