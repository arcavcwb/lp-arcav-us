---
name: build-release
description: Procedimiento del rol release para llevar un commit con dictamen approved hasta un PR listo para decisión humana en lp-arcav-us. Cubre build de producción de Astro 6, validación de wrangler.jsonc, astro.config.mjs y la configuración generada, workflows de CI con los checks requeridos validate, descripción del PR y checklist de despliegue, sin desplegar ni mergear nunca. Úsala al preparar un release, tocar .github o validar configuración de Cloudflare.
user-invocable: false
---

# Build y release (sin desplegar)

Rol dueño: `release`. Escribes `astro.config.mjs`, `wrangler.jsonc`, `.github/`,
scripts de build en `package.json` y el texto del PR, cuando la tarea lo asigna.

**Mergear a `main` despliega a producción** (Cloudflare Workers Builds). Por eso:

- Nunca ejecutas `wrangler deploy` (tampoco con `--dry-run`), `wrangler versions
  deploy|upload`, `wrangler rollback` ni `wrangler secret`.
- Nunca haces `gh pr merge`, push a `main`, force push ni cambios en la
  protección de rama, `gh secret` o `gh variable`.
- Commit, push y `gh pr create` solo con instrucción humana explícita en la
  sesión, con la cuenta `arcavcwb`.

## Contexto mínimo (lectura progresiva)

1. Dictamen vigente en `bug_report.md`: historia, commit evaluado y resultado.
2. `git rev-parse --short HEAD`, `git status --porcelain`, `git log --oneline main..HEAD`.
3. `git diff --stat main...HEAD`, empezando por `package.json`,
   `package-lock.json`, `astro.config.mjs`, `wrangler.jsonc`, `.github/`.
4. `docs/claude-pr-review.md` solo si el cambio afecta a la revisión automática.
5. Documentación oficial de Astro, `@astrojs/cloudflare` o Wrangler solo ante
   una duda concreta de la versión instalada (`node_modules/*/package.json`).

## Procedimiento

### 1. Correspondencia con QA

- El dictamen vigente debe ser `approved` para una ejecución
  `US-xx:<commit>:<n>`. `rejected`, `bloqueado` o ausente: **detente**.
- `git diff --stat <commit-qa>..HEAD`: si hay cambios en `src/`, `public/`,
  configuración o dependencias después del commit evaluado, devuelve a
  `qa-revisor`. Una build verde no sustituye esa evidencia. Cambios solo en
  documentación se listan en el PR.
- Árbol limpio (`git status --porcelain` vacío) o cambios explicados.

### 2. Build de producción

```bash
node -v                      # >= 22.12.0 (engines de package.json)
npm ci                       # solo si node_modules falta o no coincide con el lockfile
npm run build
```

- No actualices versiones ni regeneres el lockfile para "arreglar" un fallo:
  repórtalo con el log exacto.
- Salida esperada: `dist/client/` (assets y páginas prerenderizadas
  `es/`, `en/`, `pt/`) y `dist/server/` (`entry.mjs` y `wrangler.json` generado);
  `.wrangler/deploy/config.json` apunta a esa configuración generada.

### 3. Configuración de Cloudflare

`wrangler.jsonc` (fuente) y `dist/server/wrangler.json` (generado):

- [ ] `name` es `lp-arcav-us` y coincide con el Worker de Workers Builds
      (confirmación humana; no lo cambies sin decisión).
- [ ] `main` es `@astrojs/cloudflare/entrypoints/server` en la fuente y
      `entry.mjs` en la generada; `assets` con binding `ASSETS`
      (`./dist` en la fuente, `../client` en la generada).
- [ ] `compatibility_date` no está en el futuro (`date -u +%F`) y un cambio de
      fecha o de `compatibility_flags` está justificado en el PR
      (`global_fetch_strictly_public` limita `fetch` a direcciones públicas).
- [ ] `observability` habilitado conscientemente (los `console.*` quedan en logs).
- [ ] Sin secretos ni URLs privadas en `vars`; los secretos se crean en
      Cloudflare por un humano y el PR lista solo sus nombres.
- [ ] Cada binding usado en código (`import { env } from "cloudflare:workers"`,
      `grep -rn "env\." src`) está declarado; cada binding declarado se usa.
- [ ] Bindings que añade el adaptador en la configuración generada (hoy
      `SESSION` de KV e `IMAGES`): confirma con el humano que son esperados y que
      Workers Builds puede provisionarlos; si no se puede confirmar, va como
      pendiente en el PR.
- [ ] Si cambian bindings: `npm run generate-types`; si existe
      `worker-configuration.d.ts`, `npx wrangler types --check` debe pasar.

`astro.config.mjs`:

- [ ] `site: 'https://arcav.us'`, `output: 'server'`, `adapter: cloudflare()`.
- [ ] `i18n.locales` es `['es', 'en', 'pt']`, `defaultLocale: 'es'`,
      `routing.prefixDefaultLocale: true`, coherentes con `src/pages/es|en|pt/`.
- [ ] `security.checkOrigin` no desactivado; cambios de `security.csp` o
      cabeceras coordinados con `qa-revisor`.

### 4. CI y checks del squad

```bash
python3 scripts/validate_squad.py
python3 -m unittest discover tests -v
node --test tests/contact.test.mjs                # suite del endpoint; unittest no descubre .mjs
python3 -m py_compile scripts/*.py tools/*.py     # con Python 3.10, la versión mínima de la matriz
python3 -c "import sys,yaml; [yaml.safe_load(open(f)) for f in sys.argv[1:]]" .github/workflows/*.yml
```

(Si PyYAML o `actionlint` no están instalados, regístralo como no ejecutado;
no los instales por tu cuenta.)

- [ ] `.github/workflows/validate-squad.yml` conserva el job `validate` con
      `strategy.matrix.python-version: ["3.10", "3.11", "3.12"]`: generan los
      checks requeridos `validate (3.10)`, `validate (3.11)`, `validate (3.12)`.
      No renombres el job ni la matriz.
- [ ] El workflow de revisión con `anthropics/claude-code-action`
      (`claude-pr-review.yml`) no se llama `validate` y no es check requerido.
- [ ] Repo público: `permissions` mínimos, secretos solo vía `${{ secrets.* }}`,
      sin `pull_request_target` que ejecute código del PR, acciones de terceros
      fijadas a SHA. Ante dudas, aplica `auditoria-seguridad` sección 2 y 3 o
      pide revisión a `qa-revisor`.

### 5. Pull request

1. Con instrucción humana: verifica `git config --get user.name` = `arcavcwb`,
   haz push de la rama de trabajo (nunca `main`) y crea el PR:

   ```bash
   GH_TOKEN=$(gh auth token --user arcavcwb) gh pr create --base main --head <rama> \
     --title "<tipo>(<ámbito>): <resumen>" --body-file <archivo temporal fuera del repo>
   ```

   No cambies la cuenta activa de `gh`.
2. Título en formato convencional, como el historial (`feat(ui): ...`,
   `fix(vikunja): ...`, `docs(prd): ...`).
3. Cuerpo: usa `.claude/skills/build-release/plantilla-pr.md` completo
   (historias, commit y dictamen de QA, comandos, configuración, secretos por
   nombre, riesgos, reversión y checklist de despliegue).
4. Lecturas permitidas tras crear el PR:
   `GH_TOKEN=$(gh auth token --user arcavcwb) gh pr checks <n>` y
   `gh pr view <n> --comments` para ver checks y la revisión de Claude. Los
   hallazgos críticos de la revisión automática se corrigen (vuelta al rol
   dueño y a QA si tocan producto) o se responden con motivo.
5. Tu trabajo termina con el PR listo: el merge es del humano.

## Checklist

- [ ] Dictamen `approved` para el commit exacto; sin cambios de producto posteriores.
- [ ] `npm run build` correcto con el lockfile existente; salida `dist/client` y `dist/server`.
- [ ] `wrangler.jsonc`, configuración generada y `astro.config.mjs` validados.
- [ ] `validate_squad.py`, `unittest`, `node --test tests/contact.test.mjs`, `py_compile` (3.10) y YAML de workflows en verde.
- [ ] Job `validate` y matriz intactos; revisión de Claude con otro nombre.
- [ ] PR (si el humano lo pidió) con plantilla completa y checklist de despliegue.
- [ ] Ningún comando de despliegue, merge, secretos ni push a `main` ejecutado.

## Formato de salida

Usa `templates/entrega.md` y añade:

```
Historia y commit: US-xx @ <commit> (QA US-xx:<commit>:<n> approved)
Build: npm run build <ok|fallo> (node <versión>)
Configuración: wrangler.jsonc <ok|hallazgos> | generada <ok|hallazgos> | astro.config.mjs <ok|hallazgos>
CI: validate_squad <ok|fallo> | unittest <ok|fallo> | node --test contact <ok|fallo> | py_compile 3.10 <ok|fallo> | YAML <ok|no ejecutado>
Secretos a crear por humano (solo nombres): <lista> | ninguno
PR: <URL> | preparado sin publicar (esperando instrucción humana)
Pendiente del humano: aprobación y merge del PR; bindings/secretos en Cloudflare; <otros>
```
