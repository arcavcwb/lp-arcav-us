## Resumen

<!-- Qué cambia y por qué, en 2-4 líneas. Sin datos personales ni secretos: el repo es público. -->

## Historias

- US-xx — <título> (tarea Vikunja VK-<id>)

## Evidencia de QA

- Commit evaluado: `<hash>` (igual al HEAD del PR: sí/no, con motivo)
- Ejecución: `US-xx:<commit>:<n>` — dictamen `approved` en `bug_report.md`
- Verificaciones no ejecutadas y motivo: <lista o "ninguna">

## Comprobaciones de release

| Comando | Resultado |
|---|---|
| `npm run build` | |
| `python3 scripts/validate_squad.py` | |
| `python3 -m unittest discover tests -v` | |
| `python3 -m py_compile scripts/*.py tools/*.py` (3.10) | |
| YAML de `.github/workflows/` | |

## Configuración y despliegue

- `wrangler.jsonc`: <sin cambios | cambios y motivo>
- `astro.config.mjs`: <sin cambios | cambios y motivo>
- Bindings en la configuración generada: <lista y confirmación humana>
- Secretos o variables que un humano debe crear en Cloudflare antes del merge (solo nombres): <lista o "ninguno">

## Riesgos y reversión

- Riesgos: <lista>
- Reversión: revertir este PR en `main` o volver a la versión anterior del Worker desde Cloudflare (acción humana).

## Checklist de despliegue

- [ ] Dictamen `approved` de `qa-revisor` para el commit de este PR.
- [ ] Checks `validate (3.10)`, `validate (3.11)` y `validate (3.12)` en verde.
- [ ] Revisión automática de Claude sin hallazgos críticos pendientes (o indicado que no está habilitada).
- [ ] `npm run build` correcto en el commit del PR.
- [ ] Secretos y bindings necesarios creados en Cloudflare por un humano.
- [ ] Plan de reversión identificado.
- [ ] Aprobación humana explícita del merge (mergear a `main` despliega a producción con Workers Builds).
- [ ] Verificación en producción asignada a `qa-revisor` y al humano tras el merge.
