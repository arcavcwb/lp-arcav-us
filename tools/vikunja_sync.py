#!/usr/bin/env python3
"""Vikunja API integration tool for agyFlow squad task management."""

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

def create_task(project_id, title, description=""):
    data = {
        "title": title,
        "description": description,
    }
    return request(f"/projects/{project_id}/tasks", method="PUT", data=data)

INITIAL_TASKS = [
    {
        "key": "US-01",
        "title": "[US-01] Definición de PRD y Historias de Usuario con 4 Escenarios",
        "role": "po-agent",
        "description": "Refinar brief y estructurar PRD.md con criterios de aceptación (Happy, Sad, Edge, Empty)."
    },
    {
        "key": "US-02",
        "title": "[US-02] Sistema de Diseño y Tokens ARCAV (Vanilla CSS / Astro)",
        "role": "designer-agent",
        "description": "Definir paleta dark/emerald, tipografía e i18n tokens según docs/DESIGN_SYSTEM.md."
    },
    {
        "key": "US-03",
        "title": "[US-03] Componente Hero & Marca 'Evolución de Procesos'",
        "role": "frontend-dev-agent",
        "description": "Implementar Hero con tagline 'Pequeños en alcance. Serios en ingeniería' y animación de glow."
    },
    {
        "key": "US-04",
        "title": "[US-04] Sección de Servicios y Productos Digitales",
        "role": "frontend-dev-agent",
        "description": "Desarrollar tarjetas para Connected Landing Pages, Small Business Systems y Automation."
    },
    {
        "key": "US-05",
        "title": "[US-05] Casos de Uso y Trayectoria Internacional",
        "role": "frontend-dev-agent",
        "description": "Mostrar trayectoria (Venezuela -> México -> San Diego/USA -> Brasil) y casos prácticos."
    },
    {
        "key": "US-06",
        "title": "[US-06] Enrutamiento Multilingüe i18n (ES / EN / PT)",
        "role": "frontend-dev-agent",
        "description": "Configurar rutas /es, /en, /pt, detección automática de idioma y selector de preferencia."
    },
    {
        "key": "US-07",
        "title": "[US-07] Formulario de Contacto y Backend de Notificaciones",
        "role": "backend-dev-agent",
        "description": "Diseñar contratos de datos e integración para captura de leads y mensajes de contacto."
    },
    {
        "key": "US-08",
        "title": "[US-08] Verificación de QA, Criterios y Bug Report",
        "role": "qa-agent",
        "description": "Ejecutar pruebas end-to-end de navegación, i18n, accesibilidad y reporte de bugs."
    },
    {
        "key": "US-09",
        "title": "[US-09] Build y Despliegue en Cloudflare Workers",
        "role": "devops-agent",
        "description": "Configurar wrangler.jsonc, validar bundle de Astro y desplegar a staging/producción."
    }
]

def sync_initial_tasks(project_title="lp-arcav-us"):
    proj = get_or_create_project(project_title, "Proyecto agyFlow Squad para ARCAV Landing Page")
    if not proj:
        print("❌ Error: No se pudo obtener/crear el proyecto en Vikunja.")
        return []
    
    proj_id = proj.get("id")
    existing_tasks = list_tasks(proj_id)
    existing_titles = {t.get("title"): t for t in existing_tasks} if isinstance(existing_tasks, list) else {}

    created = []
    print(f"🚀 Sincronizando tareas en proyecto '{project_title}' (ID: {proj_id})...")
    for t in INITIAL_TASKS:
        title = t["title"]
        if title in existing_titles:
            task_obj = existing_titles[title]
            print(f"  - Existente: [{task_obj.get('id')}] {title}")
            created.append({**t, "id": task_obj.get("id")})
        else:
            task_obj = create_task(proj_id, title, t["description"])
            if task_obj and task_obj.get("id"):
                print(f"  + Creada: [{task_obj.get('id')}] {title}")
                created.append({**t, "id": task_obj.get("id")})
            else:
                print(f"  ❌ Error creando tarea: {title}")
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
        role = t.get("role")
        desc = t.get("description")
        link = f"{frontend_url}/tasks/{task_id}" if task_id != "N/A" else "N/A"

        summary_rows.append(f"| VK-{task_id} | `lp-arcav-us:{key}` | `{role}` | *por iniciar* | 0 |")
        detail_blocks.append(f"""### [VK-{task_id}] {title}
- **Clave estable**: `lp-arcav-us:{key}`
- **ID y enlace de Vikunja**: [VK-{task_id}]({link})
- **Historia asociada**: {key}
- **Responsable**: `{role}`
- **Estado (remoto / lógico)**: pendiente / todo
- **Dependencias**: ninguna
- **Descripción**: {desc}
""")

    content = f"""# Sprint actual — ARCAV Landing Page

Estado: inicializado
Proyecto Vikunja: `lp-arcav-us` ({frontend_url}/projects/2)
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
    print("✅ sprint_actual.md actualizado con las tareas de Vikunja.")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--info", action="store_true", help="Verificar estado de Vikunja")
    parser.add_argument("--user", action="store_true", help="Verificar token de usuario")
    parser.add_argument("--list-projects", action="store_true", help="Listar proyectos")
    parser.add_argument("--ensure-project", type=str, help="Asegurar existencia de un proyecto por título")
    parser.add_argument("--sync-tasks", action="store_true", help="Cargar tareas iniciales a Vikunja y actualizar sprint_actual.md")
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

    if args.sync_tasks:
        tasks = sync_initial_tasks("lp-arcav-us")
        if tasks:
            update_sprint_actual_md(tasks)

if __name__ == "__main__":
    main()
