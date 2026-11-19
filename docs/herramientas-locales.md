# Herramientas locales

Comandos de apoyo del flujo descrito en `docs/protocolo.md`. Se ejecutan desde la
raíz del repositorio con Python `>=3.10` (solo biblioteca estándar). Salvo
`tools/vikunja_sync.py`, no consultan servicios remotos, no invocan agentes y no
despliegan. Un resultado `OK` es una comprobación local: no sustituye la
evidencia real de QA ni la aprobación humana.

## Validación y pruebas

```bash
python3 scripts/validate_squad.py
python3 -m unittest discover tests -v
node --test tests/contact.test.mjs
```

- `validate_squad.py` comprueba la coherencia del flujo: `CLAUDE.md`, los
  subagentes de `.claude/agents/`, las skills de `.claude/skills/`, los
  workflows de `.claude/workflows/` y `config/skills.json`. Termina con código
  1 si encuentra problemas y los lista.
- `unittest` descubre los `test_*.py` de `tests/`: cubren el tooling Python
  (`scripts/` y `tools/vikunja_sync.py`), sin red.
- `node --test tests/contact.test.mjs` cubre el contrato y la validación del
  formulario de contacto (`src/lib/contact.ts` y `src/lib/contact-server.ts`),
  también sin red. `unittest` no lo ejecuta: requiere Node `>=22.18` (o
  `--experimental-strip-types` entre 22.12 y 22.17). Detalle en
  `docs/contacto.md`.
- Los tres comandos son los que ejecuta el job `validate` de
  `.github/workflows/validate-squad.yml` (matriz Python 3.10, 3.11 y 3.12 con
  Node 22; las tres ejecuciones de esa matriz son los checks requeridos en
  `main`). Ejecuta los
  dos primeros antes de entregar cambios en roles, skills, workflows,
  `config/` o `scripts/`, y el tercero si tocas `src/lib/` o
  `src/pages/api/`.
- `.pre-commit-config.yaml` los ejecuta también como hooks si instalas
  `pre-commit` (`pre-commit install`).

## PRD y diagnóstico del flujo

```bash
python3 scripts/pipeline.py check-prd
python3 scripts/pipeline.py status
python3 scripts/pipeline.py advance
```

- `check-prd` comprueba que cada historia `US-xx` tenga sus cuatro escenarios
  numerados (camino feliz, error/validación, caso límite, estado vacío/carga),
  cada uno con Dado/Cuando/Entonces y sin campos de ejemplo entre corchetes. Es
  un control estructural, no evalúa la calidad de los criterios.
- `status` y `advance` diagnostican la fase según el PRD, su aprobación y la
  evidencia de `handoff.json` y `candidate.json`. Solo proponen la siguiente
  acción; no registran aprobaciones ni activan agentes. Su código de salida no
  es un permiso para desplegar.
- `--root <ruta>` permite apuntar a otra raíz (por defecto, el directorio
  actual).

Para dejar constancia local de una aprobación humana **ya otorgada**:

```bash
python3 scripts/pipeline.py approve-prd --person "PERSONA" --scope "US-01..US-09" --evidence "REFERENCIA A LA INSTRUCCIÓN HUMANA"
```

Guarda un registro JSON con fecha UTC vinculado al SHA-256 del contenido actual
de `PRD.md` y no sobrescribe uno existente. Es complementario a la línea de
aprobación de la cabecera de `PRD.md`, que es el registro principal: escribe
primero esa línea y después ejecuta el comando, porque cualquier edición
posterior del PRD cambia el hash y exige una aprobación nueva. El comando no
autentica la identidad de quien aprueba.

## Handoff entre roles

```bash
python3 scripts/handoff.py template --role frontend
python3 scripts/handoff.py prompt --to frontend --ticket "VK-7 US-06" --routes "src/components/, src/i18n/translations.ts"
python3 scripts/handoff.py check --role frontend --input handoff.json
```

- `template` imprime `templates/entrega.md` para completar en la respuesta.
- `prompt` genera un encargo compacto para un rol con historia, tarea y rutas.
- `check` valida una evidencia JSON con la forma de `templates/handoff.json`:
  `target_role`, `phase`, `ticket`, `revision` e `inputs`. Cada entrada de
  `inputs` lleva `status`, `reference` y `revision` identificables. `status`
  debe ser `ready` (o `approved` para aprobaciones de PRD y dictámenes de QA);
  contratos y diseño admiten `not_applicable` con `reason`. Las claves
  requeridas por rol están en `PRECONDITIONS` de `scripts/handoff.py`.

Para `qa-revisor` y `release`, `check` exige además la candidata vigente,
declarada en `candidate.json` (formato en `templates/candidate.json`):

```bash
python3 scripts/handoff.py check --role release --input handoff.json --ticket VK-10 --revision <commit> --qa-run <ejecucion>
```

`handoff.json` y `candidate.json` son declaraciones locales opcionales. Cambiar
la candidata obliga a actualizar la evidencia; escribir `approved` no ejecuta
pruebas.

## Vikunja

```bash
python3 tools/vikunja_sync.py --help
```

Cliente de Vikunja (https://vikunja.arcav.us, proyecto id 2). Lee
`VIKUNJA_URL` y `VIKUNJA_API_TOKEN` del entorno o de `.env` local (plantilla en
`.env.example`); el token nunca se versiona. Lo usa `producto` para planificar,
registrar transiciones y regenerar `sprint_actual.md`. Opciones, modo lectura,
confirmaciones antes de escribir y correspondencia de columnas y etiquetas:
[`docs/vikunja.md`](vikunja.md).

## Herramientas retiradas

Se eliminaron con el paso a Claude Code y no deben volver a usarse:

- `scripts/setup_receiver.py`: inicializaba un proyecto receptor de la
  plantilla anterior.
- `scripts/demo_workflow.py` y `docs/demo-flujo.html`: simulación visual del
  flujo anterior con datos ficticios.
