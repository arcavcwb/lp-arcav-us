# Revisión de PRs con Claude

Revisión automática y opcional de pull requests con Claude Code en GitHub Actions
(`anthropics/claude-code-action`). Reemplaza al revisor anterior basado en Gemini.

Workflow: [`.github/workflows/claude-pr-review.yml`](../.github/workflows/claude-pr-review.yml)

## Qué hace

- Se ejecuta en PR hacia `main` al abrirse, reabrirse, recibir commits nuevos o
  pasar de borrador a listo para revisión.
- Lee `CLAUDE.md`, el diff (`gh pr diff`) y los archivos que necesite, y revisa:
  bugs, i18n (sin textos hardcodeados; es/en/pt en `src/i18n/translations.ts`),
  seguridad y secretos, formulario de contacto y endpoints `src/pages/api/*`,
  accesibilidad, SEO y, si el PR menciona una historia `US-xx`, la cobertura de
  sus 4 escenarios en `PRD.md`.
- Publica comentarios inline por hallazgo y un comentario resumen
  ("Revisión automática de Claude"), en español.
- No aprueba ni rechaza el PR, no edita archivos, no hace commits y no ejecuta
  código del PR.

## Lugar en el flujo

Paso 5 del [protocolo](protocolo.md): `release` abre el PR y Claude lo revisa.
La revisión es orientativa:

- No sustituye el dictamen de `qa-revisor` (paso 4) ni la aprobación humana del
  merge a `main`, que despliega a producción (paso 6).
- No es un check requerido. Los checks requeridos de `main` siguen siendo
  `validate (3.10)`, `validate (3.11)` y `validate (3.12)`.
- Un resumen sin hallazgos no equivale a QA aprobado.

## Activación

Todo queda desactivado mientras no existan la variable y un secreto. Los comandos
usan la cuenta `arcavcwb` sin cambiar la cuenta activa de `gh`.

1. **GitHub App de Claude.** La acción obtiene su token de GitHub por OIDC a
   través de la app, así que debe estar instalada en el repositorio. Opciones:
   - Ejecuta `/install-github-app` en Claude Code dentro del repo. Instala la
     app y, si continúas con la configuración de Actions, guarda el secreto y
     abre un PR con los workflows que elijas. No elijas el workflow de revisión
     (duplicaría este) y no mergees ese PR si no aporta nada más. Si eliges
     **Skip for now**, solo queda la app y creas el secreto en el paso 2.
   - O instálala a mano desde <https://github.com/apps/claude>.
2. **Secreto** (solo uno):
   - `ANTHROPIC_API_KEY`: clave de la [Claude Console](https://platform.claude.com),
     con facturación por uso de API.
   - `CLAUDE_CODE_OAUTH_TOKEN`: token de suscripción (Pro, Max, Team o
     Enterprise) generado en local con `claude setup-token`. Dura un año y el
     comando no lo guarda: cópialo directo al secreto.

   ```bash
   export GH_TOKEN="$(gh auth token --user arcavcwb)"
   gh secret set ANTHROPIC_API_KEY --repo arcavcwb/lp-arcav-us
   # o bien
   gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo arcavcwb/lp-arcav-us
   ```

   `gh secret set` pide el valor por la terminal; no lo pases como argumento ni
   lo escribas en archivos. Si existen ambos secretos, Claude Code usa
   `ANTHROPIC_API_KEY`.
3. **Variable** que enciende el workflow:

   ```bash
   gh variable set CLAUDE_PR_REVIEW --body true --repo arcavcwb/lp-arcav-us
   ```

4. **Merge del workflow a `main`.** La app solo entrega su token si el workflow
   del PR coincide con el de la rama por defecto. Hasta entonces, y en cualquier
   PR que modifique este workflow, la acción termina sin revisar.

Sin secreto, el paso "Verificar credenciales de Claude" deja un aviso y el job
termina sin error.

## Cuándo no se ejecuta

- Variable `CLAUDE_PR_REVIEW` distinta de `true`.
- PR desde un fork: GitHub no entrega secretos a esos runs y el job se omite.
  Para revisarlo, usa la revisión local (abajo).
- PR en borrador. Se revisa al marcarlo como listo.
- Runs disparados por bots (`*[bot]`), que la acción rechaza por diseño.
- Un push nuevo al mismo PR cancela la revisión en curso (`concurrency`).

## Costo

Cada run consume:

- **Minutos de GitHub Actions.** En repositorios públicos los runners estándar
  no tienen costo.
- **Tokens del modelo.** Con `ANTHROPIC_API_KEY` se factura por uso en la
  Console; con `CLAUDE_CODE_OAUTH_TOKEN` consume el límite de la suscripción.

Cada push a un PR abierto dispara una revisión completa. Para contener el gasto:

- Trabaja en borrador y marca el PR como listo cuando quieras la revisión.
- Agrupa commits antes de hacer push.
- Ajusta en `claude_args` el tope `--max-turns` (hoy 40) o fija un modelo con
  `--model`. El job tiene `timeout-minutes: 20`.
- Con API key, define un límite de gasto en el workspace de la Console.

## Seguridad

**Evento `pull_request`, nunca `pull_request_target`.** `pull_request_target`
corre con los secretos del repo base aunque el PR venga de un fork, y combinado
con un checkout del código del PR permite robar secretos. Con `pull_request` los
forks no reciben secretos.

**Permisos del job:**

| Permiso | Motivo |
|---|---|
| `contents: read` | Checkout del código. |
| `pull-requests: write` | Comentar en el PR. |
| `id-token: write` | Token OIDC que la acción cambia por el token de la GitHub App de Claude. |

El workflow declara `permissions: {}` a nivel global. El token de la app que usa
Claude tiene más alcance (contenido, PR e issues con escritura), por eso el
límite real está en las herramientas permitidas en `claude_args`:

- Permitidas: `Read`, `Glob`, `Grep`, comentarios inline y
  `gh pr view`/`gh pr diff`/`gh pr comment`.
- Denegadas explícitamente: `Edit`, `Write`, `NotebookEdit`, `WebFetch`,
  `WebSearch`, `git commit` y `git push`.
- Cualquier otra herramienta o comando de shell que requiera permiso queda
  bloqueado, salvo que `.claude/settings.json` de `main` lo permita (ver abajo).

**La credencial vive en el entorno del job.** El secreto de Anthropic se entrega
a la acción y lo heredan los procesos que Claude lanza, incluidos los comandos
`gh` permitidos. Las dos vías de publicación del revisor (comentario inline y
`gh pr comment`) escriben texto arbitrario en un repositorio público, así que
una inyección de prompt exitosa podría intentar publicar ese valor; quitar solo
`gh pr comment` no cerraría el canal. La instrucción del prompt de no copiar
valores que parezcan secretos es una mitigación textual, no una barrera. Las
barreras reales son las de siempre: usa una API key dedicada a este repo con
límite de gasto, rótala ante cualquier indicio de inyección y mantén el permiso
de escritura en pocas manos. La acción solo limpia secretos del entorno de los
subprocesos cuando se usa `allowed_non_write_users` (ver `docs/security.md` de
`anthropics/claude-code-action`), que no es el caso aquí.

**PR del mismo repositorio.** Quien puede hacer push de una rama a este repo:

- Recibe el secreto `ANTHROPIC_API_KEY` o `CLAUDE_CODE_OAUTH_TOKEN` en los runs
  de su PR.
- Puede modificar `.github/workflows/` en su rama. Con `pull_request`, GitHub
  ejecuta la versión del workflow del PR, así que un cambio malicioso puede
  exfiltrar el secreto antes de que nadie lo revise.

Por eso:

- Da permiso de escritura solo a personas de confianza.
- Revisa cualquier cambio en `.github/` antes de aprobar un PR. Si un PR tocó
  workflows de forma sospechosa, rota el secreto.
- Prefiere una API key dedicada a este repo, con límite de gasto.

**Configuración desde la rama base.** Según la documentación de la acción en la
versión fijada aquí (v1.0.227,
[`docs/security.md` → "Which files come from the base branch on pull requests"](https://github.com/anthropics/claude-code-action/blob/3b8197d3d486006dd4af54613517f21ac6ac625e/docs/security.md#which-files-come-from-the-base-branch-on-pull-requests)),
en PRs la acción restaura desde la rama base una lista fija de rutas de
configuración antes de ejecutar a Claude: `.claude/`, `.mcp.json`,
`.claude.json`, `.gitmodules`, `.ripgreprc`, `CLAUDE.md`, `CLAUDE.local.md` y
`.husky/`; las versiones del PR quedan en `.claude-pr/` solo como referencia. Con
ese comportamiento, un PR no puede cambiar las reglas con las que se le revisa.
Lo hace la propia acción, no un paso del workflow: el checkout sin `ref:`
materializa el merge del PR y la restauración ocurre después, ya dentro de la
acción.

El resto del árbol (`package.json`, lockfiles, `node_modules/`, scripts, etc.)
viene del PR, y de ahí la consecuencia que la misma fuente detalla: los permisos
y hooks de `.claude/settings.json` de `main` aplican en CI, pero si un hook,
`apiKeyHelper` o `statusLine` llama a un script del repositorio (`npm run ...`,
un target de `make`, una ruta relativa), ese comando se resuelve contra archivos
del PR y correría código del PR con acceso al secreto. No agregues hooks ni
reglas `allow` de ese tipo.

Todo este comportamiento lo implementa la acción, no este repositorio: revalídalo
cada vez que muevas el SHA fijado (ver abajo).

**Contenido no confiable.** El prompt trata título, descripción, comentarios y
diff como datos e ignora instrucciones dentro de ellos; la acción además limpia
contenido oculto (comentarios HTML, caracteres invisibles). Aun así, una
inyección de prompt podría sesgar los comentarios: la revisión nunca es un gate.

**Logs públicos.** No actives `show_full_output` ni `ACTIONS_STEP_DEBUG`: en un
repo público los logs quedan visibles y podrían incluir contenido sensible.

**Acciones fijadas por SHA.** Para actualizarlas, obtén el SHA del tag y cambia
el comentario de versión:

```bash
export GH_TOKEN="$(gh auth token --user arcavcwb)"
gh api repos/anthropics/claude-code-action/commits/v1 --jq .sha
gh api repos/actions/checkout/commits/v4 --jq .sha
```

Al mover el SHA de `claude-code-action`, vuelve a leer su `docs/security.md` en
esa versión y confirma que la lista de rutas restauradas desde la rama base y el
resto de lo descrito en "Configuración desde la rama base" siguen vigentes. Si
cambian, actualiza esa sección y la versión que cita:

```bash
gh api "repos/anthropics/claude-code-action/contents/docs/security.md?ref=<SHA>" \
  --jq .content | base64 -d
```

## Desactivación

- **Pausar:** `gh variable set CLAUDE_PR_REVIEW --body false --repo arcavcwb/lp-arcav-us`
  (o `gh variable delete CLAUDE_PR_REVIEW`).
- **Retirar credenciales:** borra el secreto en Settings → Secrets and variables
  → Actions. La credencial sigue siendo válida: revoca la API key en la Console
  o genera un token nuevo.
- **Quitar del todo:** elimina `.github/workflows/claude-pr-review.yml` y, si no
  usas otras funciones de Claude en GitHub, desinstala la app.

Si el repo tenía configurado el revisor anterior, elimina también el secreto
`GEMINI_API_KEY` y la variable `ENABLE_AI_PR_REVIEW`.

## Revisión local

Mismas reglas de `CLAUDE.md`, sin costo de Actions y útil para PRs desde forks:

| Comando | Uso |
|---|---|
| `/revisar-proyecto` | Revisión multidimensión del proyecto con verificación adversarial (workflow `revision-proyecto`). |
| `/code-review` | Revisa el diff actual o un PR (número, rama o ruta). Con `--comment` publica los hallazgos como comentarios inline. |
| `/security-review` | Revisión de seguridad de los cambios pendientes de la rama. |

Para el dictamen formal de una historia, usa el subagente `qa-revisor` (paso 4
del flujo), no estas revisiones.
