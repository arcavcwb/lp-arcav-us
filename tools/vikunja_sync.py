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
                print(f"📁 Proyecto encontrado: '{title}' (ID: {p.get('id')})")
                return p
    print(f"📁 Creando proyecto: '{title}'...")
    return create_project(title, description)

def list_tasks(project_id):
    return request(f"/projects/{project_id}/tasks")

def create_task(project_id, title, description="", text=""):
    data = {
        "title": title,
        "description": description or text,
    }
    return request(f"/projects/{project_id}/tasks", method="PUT", data=data)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--info", action="store_true", help="Verificar estado de Vikunja")
    parser.add_argument("--user", action="store_true", help="Verificar token de usuario")
    parser.add_argument("--list-projects", action="store_true", help="Listar proyectos")
    parser.add_argument("--ensure-project", type=str, help="Asegurar existencia de un proyecto por título")
    args = parser.parse_args()

    _, token = get_config()

    if args.info or len(sys.argv) == 1:
        if not check_info():
            sys.exit(1)
        if not token:
            print("⚠️  VIKUNJA_API_TOKEN no configurado en .env o entorno.")
            print("   Para autenticar, crea un archivo .env con:")
            print("   VIKUNJA_URL=https://vikunja.arcav.us")
            print("   VIKUNJA_API_TOKEN=tu_token_aqui")
            sys.exit(0)

    if args.user:
        user = get_user_info()
        if user:
            print(f"👤 Usuario autenticado: {user.get('username')} ({user.get('email')})")
        else:
            print("❌ Token inválido o no autorizado.")

    if args.list_projects:
        projects = list_projects()
        if isinstance(projects, list):
            print(f"📂 Proyectos encontrados ({len(projects)}):")
            for p in projects:
                print(f"  - [{p.get('id')}] {p.get('title')} (ID: {p.get('id')})")
        else:
            print("❌ Error obteniendo la lista de proyectos.")

    if args.ensure_project:
        proj = get_or_create_project(args.ensure_project, "Proyecto gestionado por squad agyFlow")
        if proj:
            print(f"✅ Proyecto listo: ID {proj.get('id')}")

if __name__ == "__main__":
    main()
