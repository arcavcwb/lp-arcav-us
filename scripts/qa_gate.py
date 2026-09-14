#!/usr/bin/env python3
"""Publish qa-evidence only after independent review and an explicit QA report.

Run by the assigned QA operator after inspecting the report's original evidence.
This validates declarations and GitHub state; it does not execute product tests.
"""
import argparse
import json
from pathlib import Path
import subprocess
import sys


def gh(*args):
    return json.loads(subprocess.check_output(['gh', *args], stderr=subprocess.PIPE))


def validate(pr, reviews, report):
    errors = []
    sha = pr['head']['sha']
    author = pr['user']['login']
    if pr.get('state') != 'open' or pr.get('draft') or pr['base']['ref'] != 'main':
        errors.append('PR debe estar abierto, listo para revisión y dirigido a main.')
    latest = {}
    for review in sorted(reviews, key=lambda r: r.get('submitted_at') or ''):
        if review.get('state') in {'APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'}:
            latest[review['user']['login']] = review
    independent = [r for user, r in latest.items()
                   if user != author and r.get('commit_id') == sha and r['state'] == 'APPROVED'
                   and r['user'].get('type') == 'User']
    if not independent or any(r['state'] == 'CHANGES_REQUESTED' for r in latest.values()):
        errors.append('Falta aprobación independiente vigente o hay cambios solicitados.')
    required = ('qa_run', 'operator', 'evidence_url', 'completed_at')
    if not all(isinstance(report.get(k), str) and report[k].strip() for k in required):
        errors.append('Falta identidad de ejecución, operador, fecha o URL de evidencia.')
    if report.get('revision') != sha or report.get('pr') != pr['number']:
        errors.append('Reporte corresponde a otra candidata/PR.')
    if report.get('result') != 'approved' or report.get('pending_checks') != [] or report.get('blockers') != []:
        errors.append('QA no aprobado o con verificaciones pendientes/bloqueantes.')
    checks = report.get('checks')
    if (not isinstance(checks, list) or not checks
            or any(not isinstance(c, dict) or c.get('result') != 'passed'
                   or not all(c.get(k) for k in ('criterion', 'command_or_steps', 'evidence')) for c in checks)):
        errors.append('Cada criterio requiere ejecución exitosa y evidencia; no basta cero bugs.')
    if not str(report.get('evidence_url', '')).startswith('https://'):
        errors.append('La evidencia requiere una URL HTTPS accesible al revisor.')
    try:
        from datetime import datetime
        completed = datetime.fromisoformat(report['completed_at'])
        if completed.tzinfo is None or not any(completed >= datetime.fromisoformat(r['submitted_at'].replace('Z', '+00:00')) for r in independent):
            errors.append('QA debe ejecutarse después de la revisión independiente.')
    except (KeyError, ValueError, TypeError):
        errors.append('Fecha QA inválida.')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', default='arcavcwb/lp-arcav-us')
    parser.add_argument('--pr', type=int, required=True)
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--publish', action='store_true', help='Publicar status después de verificar las fuentes; requiere asignación QA')
    args = parser.parse_args()
    try:
        endpoint = f'repos/{args.repo}/pulls/{args.pr}'
        pr = gh('api', endpoint)
        pages = gh('api', '--paginate', '--slurp', endpoint + '/reviews')
        report = json.loads(args.report.read_text())
        errors = validate(pr, [r for page in pages for r in page], report)
        if errors:
            raise ValueError('; '.join(errors))
        if args.publish:
            if gh('api', endpoint)['head']['sha'] != pr['head']['sha']:
                raise ValueError('Candidata cambió durante validación.')
            gh('api', '--method', 'POST', f"repos/{args.repo}/statuses/{pr['head']['sha']}",
               '-f', 'state=success', '-f', 'context=qa-evidence',
               '-f', 'description=QA con evidencia y revisión independiente previa',
               '-f', 'target_url=' + report['evidence_url'])
            print('qa-evidence publicado para el SHA verificado; no ejecuta merge ni deploy.')
        else:
            print('Declaraciones y revisión verificadas; no se publicó estado. Comprobar fuentes originales antes de --publish.')
        return 0
    except (OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        print(f'BLOCKED: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
