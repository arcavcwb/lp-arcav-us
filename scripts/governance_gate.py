#!/usr/bin/env python3
"""Fail closed before product work and commits; validate policy from a trusted base."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

# Exact maintenance surface. Unknown paths are product and require approval.
MAINTENANCE_FILES = {
    'AGENTS.md', 'PRD.md', 'sprint_actual.md', 'architecture.md',
    'config/governance.json', 'config/main-protection.json', 'config/agent-runtime.json', 'config/skills.json',
    'scripts/governance_gate.py', 'scripts/handoff.py', 'scripts/pipeline.py',
    'scripts/validate_squad.py', 'scripts/demo_workflow.py', 'scripts/agent_orchestrator.py',
    'tools/vikunja_sync.py', '.github/workflows/governance-gate.yml',
    '.github/workflows/validate-squad.yml', '.github/pull_request_template.md',
    'docs/protocolo.md', 'docs/context-strategy.md', 'docs/agy-codex.md',
    'docs/herramientas-locales.md', 'docs/governance.md',
    'templates/handoff.json', 'templates/sprint_actual.md',
    'tests/test_governance_gate.py', 'tests/test_vikunja_sync.py',
    'tests/test_handoff.py', 'tests/test_pipeline.py', 'scripts/qa_gate.py', 'tests/test_qa_gate.py', 'tests/test_agent_orchestrator.py',
}
MAINTENANCE_PREFIXES = ('.agents/agents/', '.agents/skills/', '.githooks/', 'docs/hardening/', '.agyflow/approvals/')


def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args], stderr=subprocess.PIPE).decode().strip()


def maintenance(path):
    return path in MAINTENANCE_FILES or path.startswith(MAINTENANCE_PREFIXES)


def read_json(root, path, ref=None):
    raw = git(root, 'show', f'{ref}:{path}') if ref is not None else (root / path).read_text()
    return json.loads(raw)


def product_errors(root, trusted_ref, content_ref=None):
    errors = []
    policy = read_json(root, 'config/governance.json', trusted_ref)
    if (policy.get('product_status') != 'approved'
            or not isinstance(policy.get('activation_evidence'), str)
            or not policy['activation_evidence'].strip()):
        errors.append('Sprint 2 bloqueado: falta activación humana explícita en la base protegida.')
    raw = (root / 'PRD.md').read_bytes() if content_ref is None else b''
    # Read exact bytes for Git objects; do not normalize whitespace in approval hashes.
    if content_ref is not None:
        raw = subprocess.check_output(['git', '-C', str(root), 'show', f'{content_ref}:PRD.md'])
    digest = hashlib.sha256(raw).hexdigest()
    approval = read_json(root, f'.agyflow/approvals/prd-{digest}.json', trusted_ref)
    if (approval.get('status') != 'approved' or approval.get('sha256') != digest
            or approval.get('document') != 'PRD.md'
            or not all(isinstance(approval.get(k), str) and approval[k].strip()
                       for k in ('person', 'scope', 'evidence', 'recorded_at'))):
        errors.append('Falta aprobación humana verificable del contenido exacto del PRD en la base protegida.')
    arch = git(root, 'show', f'{trusted_ref}:architecture.md')
    if not arch.strip():
        errors.append('Falta architecture.md aportada por el humano.')
    return errors


def check(root, paths, branch, trusted_ref='origin/main', content_ref=None, product=False):
    errors = []
    if branch in {'main', 'master', 'HEAD', ''}:
        errors.append('Trabajá en una branch identificada; main/master y detached HEAD no admiten desarrollo.')
    if product or any(not maintenance(p) for p in paths):
        try:
            errors.extend(product_errors(root, trusted_ref, content_ref))
        except (OSError, ValueError, subprocess.CalledProcessError) as exc:
            errors.append(f'Gate cerrado: falta política/aprobación/arquitectura verificable ({type(exc).__name__}).')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['start', 'commit', 'push', 'ci'])
    parser.add_argument('--root', type=Path, default=Path.cwd())
    parser.add_argument('--base', default='origin/main')
    parser.add_argument('--head', default='HEAD')
    parser.add_argument('--branch')
    args = parser.parse_args()
    try:
        branch = args.branch or git(args.root, 'rev-parse', '--abbrev-ref', 'HEAD')
        if args.mode == 'push':
            errors = []
            for line in sys.stdin:
                _, local_sha, remote_ref, remote_sha = line.split()
                if remote_ref in {'refs/heads/main', 'refs/heads/master'}:
                    errors.append('Push directo a main/master prohibido; usar PR.')
                if set(local_sha) == {'0'}:
                    continue
                base = args.base if set(remote_sha) == {'0'} else remote_sha
                paths = git(args.root, 'diff', '--name-only', '--no-renames', base, local_sha).splitlines()
                errors.extend(check(args.root, paths, branch, args.base, local_sha))
        elif args.mode == 'commit':
            paths = git(args.root, 'diff', '--cached', '--name-only', '--no-renames').splitlines()
            errors = check(args.root, paths, branch, args.base, '')
        elif args.mode == 'ci':
            paths = git(args.root, 'diff', '--name-only', '--no-renames', args.base, args.head).splitlines()
            errors = check(args.root, paths, branch, args.base, args.head)
        else:
            errors = check(args.root, [], branch, args.base, product=True)
        for error in errors:
            print('BLOCKED: ' + error, file=sys.stderr)
        if not errors:
            print('OK: gate de alcance y branch; no acredita revisión, QA ni deploy.')
        return int(bool(errors))
    except (OSError, ValueError, subprocess.CalledProcessError) as exc:
        print(f'BLOCKED: no se pudo verificar el gate ({type(exc).__name__}).', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
