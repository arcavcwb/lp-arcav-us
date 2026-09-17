#!/usr/bin/env python3
"""Read a complete Vikunja snapshot into the sprint; never manufacture transitions."""
import argparse
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request

ROOT_DIR = Path(__file__).resolve().parents[1]


class SyncError(Exception):
    pass


def get_config():
    env = dict(os.environ)
    path = ROOT_DIR / '.env'
    if path.is_file():
        for line in path.read_text().splitlines():
            if line.strip() and not line.lstrip().startswith('#') and '=' in line:
                key, _, value = line.partition('=')
                env.setdefault(key.strip(), value.strip().strip('\"\''))
    base = env.get('VIKUNJA_URL', 'https://vikunja.arcav.us').rstrip('/')
    if not base.endswith('/api/v1'):
        base += '/api/v1'
    if urllib.parse.urlsplit(base).scheme != 'https':
        raise SyncError('Vikunja requiere HTTPS.')
    token = env.get('VIKUNJA_API_TOKEN')
    if not token:
        raise SyncError('Falta VIKUNJA_API_TOKEN; espejo preservado.')
    return base, token


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise SyncError('Redirección no permitida para no reenviar credenciales.')


class Client:
    def __init__(self, base, token):
        self.base, self.token = base, token

    def get(self, endpoint):
        req = urllib.request.Request(self.base + endpoint, headers={
            'Authorization': 'Bearer ' + self.token,
            'Accept': 'application/json', 'User-Agent': 'agyFlow-readonly-sync/2',
        })
        try:
            with urllib.request.build_opener(NoRedirect).open(req, timeout=20) as response:
                return json.load(response), response.headers
        except (urllib.error.URLError, OSError, ValueError) as exc:
            # Do not log tokens, response bodies, or task contents on failures.
            raise SyncError(f'Lectura fallida ({type(exc).__name__}); espejo preservado.') from exc

    def pages(self, endpoint):
        result, seen, expected_pages, expected_total = [], set(), None, None
        for page in range(1, 10001):
            data, headers = self.get(endpoint + ('&' if '?' in endpoint else '?') + f'page={page}&per_page=100')
            try:
                pages = int(headers['x-pagination-total-pages'])
                total = int(headers['x-pagination-result-count'])
            except (KeyError, TypeError, ValueError) as exc:
                raise SyncError('Paginación no verificable.') from exc
            if not isinstance(data, list) or pages < 0 or total < 0:
                raise SyncError('Respuesta de lista inválida.')
            if expected_pages is not None and (pages != expected_pages or total != expected_total):
                raise SyncError('La colección cambió durante la paginación.')
            expected_pages, expected_total = pages, total
            for item in data:
                if not isinstance(item, dict) or type(item.get('id')) is not int or item['id'] in seen:
                    raise SyncError('IDs duplicados o inválidos.')
                seen.add(item['id'])
                result.append(item)
            if page >= max(1, pages):
                if len(result) != total:
                    raise SyncError('Lectura parcial: total distinto de elementos recibidos.')
                return result
        raise SyncError('Paginación excedida.')


def snapshot(client, policy):
    project_id, view_id = policy['project_id'], policy['snapshot_view_id']
    project, _ = client.get(f'/projects/{project_id}')
    if not isinstance(project, dict) or project.get('id') != project_id:
        raise SyncError('Proyecto no verificable.')
    views = [v for v in project.get('views', []) if v.get('id') == view_id]
    if len(views) != 1 or views[0].get('view_kind') not in {'list', 'table'} or views[0].get('filter'):
        raise SyncError('Se requiere una vista plana sin filtros para una lectura completa.')
    tasks = client.pages(f'/projects/{project_id}/views/{view_id}/tasks?sort_by=id&order_by=asc&expand=buckets')
    clean = []
    for task in tasks:
        if task.get('project_id') != project_id or type(task.get('done')) is not bool or not task.get('updated'):
            raise SyncError('Tarea sin proyecto, estado o revisión verificable.')
        labels = sorted(label['title'] for label in (task.get('labels') or []))
        clean.append(dict(id=task['id'], title=task['title'], done=task['done'],
                          updated=task['updated'], labels=labels,
                          description=task.get('description', ''),
                          buckets=sorted([{k: b.get(k) for k in ('id', 'title', 'project_view_id')}
                                          for b in (task.get('buckets') or [])], key=lambda b: b['id'])))
    return dict(project_id=project_id, view_id=view_id, project_title=project['title'],
                tasks=sorted(clean, key=lambda t: t['id']))


def digest(data):
    return hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def cell(value):
    return str(value).replace('|', '&#124;').replace('\n', ' ').replace('<', '&lt;').replace('>', '&gt;')


def render(data, policy, base, stamp):
    url = base.removesuffix('/api/v1')
    rows, details = [], []
    tasks = [t for t in data['tasks'] if policy['sprint_label'] in t['labels']]
    for task in tasks:
        # Role labels are explicit project mappings, never '<label>-agent'.
        roles = {policy['role_labels'][l] for l in task['labels'] if l in policy['role_labels']}
        role = next(iter(roles)) if len(roles) == 1 else 'sin asignación verificable'
        key = policy.get('task_keys', {}).get(str(task['id']), 'sin correlación registrada')
        observed = 'done=true' if task['done'] else 'done=false'
        rows.append(f"| [VK-{task['id']}]({url}/tasks/{task['id']}) | `{key}` | `{role}` | {observed} | no verificada | no verificado |")
        details.append(f"### VK-{task['id']} — {cell(task['title'])}\n\n"
                       f"Revisión remota: `{task['updated']}`. Etiquetas: {', '.join(map(cell, task['labels']))}.\n"
                       f"Buckets observados (sin interpretar aceptación): `{cell(json.dumps(task['buckets'], ensure_ascii=False))}`.\n")
    return '\n'.join([
        '# Sprint 1 — espejo de Vikunja; hardening del flujo', '',
        'Estado local: hardening autorizado; aceptación de Sprint 1 pendiente de reconciliación de evidencia.',
        'Sprint 2: bloqueado hasta aprobación humana explícita; no iniciado.',
        f"Proyecto Vikunja: [{cell(data['project_title'])}]({url}/projects/{data['project_id']})",
        'Responsable operativo: `scrum-master-agent`', 'PRD de referencia: [PRD.md](PRD.md); aprobación pendiente.',
        f'Última lectura remota completa (UTC): {stamp}', f"Snapshot SHA-256: `{digest(data)}`",
        f"Fuente: GET /projects/{data['project_id']}/views/{data['view_id']}/tasks; todas las páginas; dos lecturas coincidentes.", '',
        'Vikunja es la fuente de verdad del estado declarado. `done=true` no acredita aprobación, revisión ni QA.',
        'La proyección no ejecuta transiciones. Cierres, criterios y contadores requieren evidencia independiente.',
        'Correlaciones ticket/historia en `config/governance.json`: metadatos locales auditados, no campos inventados de API.',
        'Cambios de código observados en `81dc82d`; diagnóstico y pendientes en [docs/hardening/audit.md](docs/hardening/audit.md).', '',
        '| Ticket | Correlación local | Responsable por etiqueta | Estado remoto | Aceptación | Reaperturas |',
        '|---|---|---|---|---|---|', *rows, '', '## Referencias remotas', '', *details,
        '## Trabajo autorizado de hardening', '',
        'Encargo: instrucción humana de auditar y corregir gobernanza; no es aprobación del PRD de producto.',
        'Entrega local: gate, sincronizador, documentación y pruebas; resultados en el diagnóstico.',
        'Revisión independiente, QA final y merge de hardening: pendientes. No hay cierre automático de fase.', '',
    ])


def sync(client, policy, target, base, check=False):
    lock_id = hashlib.sha256(str(target.resolve()).encode()).hexdigest()
    with open(Path(tempfile.gettempdir()) / f'arcav-sync-{lock_id}.lock', 'w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise SyncError('Otro sincronizador está escribiendo el espejo.') from exc
        before = target.read_bytes() if target.exists() else None
        data = snapshot(client, policy)
        if data != snapshot(client, policy):
            raise SyncError('Cambio remoto concurrente; reintentar con nueva lectura.')
        fingerprint = f'Snapshot SHA-256: `{digest(data)}`'
        if check:
            if before is None or fingerprint not in before.decode():
                raise SyncError('Espejo desincronizado; ejecutar --sync.')
            # A matching hash alone is insufficient if someone edited projected rows.
            stamp = re.search(r'Última lectura remota completa \(UTC\): (.+)', before.decode())
            if not stamp or before.decode() != render(data, policy, base, stamp[1]):
                raise SyncError('Contenido local distinto de la proyección remota.')
            return False
        if before:
            stamp = re.search(r'Última lectura remota completa \(UTC\): (.+)', before.decode())
            if stamp and before.decode() == render(data, policy, base, stamp[1]):
                return False  # Idempotent rerun keeps the successful observation timestamp.
        content = render(data, policy, base, datetime.now(timezone.utc).isoformat())
        if target.is_symlink() or (target.read_bytes() if target.exists() else None) != before:
            raise SyncError('Espejo modificado concurrentemente o enlace simbólico.')
        name = None
        try:
            with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=target.parent, delete=False) as tmp:
                name = tmp.name
                tmp.write(content)
                tmp.flush()
                os.fsync(tmp.fileno())
            os.replace(name, target)
        finally:
            if name and os.path.exists(name):
                os.unlink(name)
        return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--sync', action='store_true', help='Solo GET remoto; proyectar espejo local de forma atómica')
    group.add_argument('--check', action='store_true', help='Detectar divergencia sin escribir')
    group.add_argument('--info', action='store_true')
    group.add_argument('--user', action='store_true')
    args = parser.parse_args()
    try:
        base, token = get_config()
        client = Client(base, token)
        if args.info or args.user:
            data, _ = client.get('/info' if args.info else '/user')
            print('Conexión verificada.' if args.user else f"Vikunja: {data.get('version', 'no informada')}")
        else:
            policy = json.loads((ROOT_DIR / 'config/governance.json').read_text())
            changed = sync(client, policy, ROOT_DIR / 'sprint_actual.md', base, args.check)
            print('Espejo actualizado desde lectura remota completa.' if changed else 'Espejo verificado; sin cambios.')
        return 0
    except (SyncError, OSError, ValueError, KeyError, TypeError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
