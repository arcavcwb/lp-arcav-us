---
name: entregar-historia
description: Lanza el workflow entrega-historia para llevar una historia US-xx aprobada en PRD.md hasta un PR listo para revisión humana (requisitos, implementación con integraciones y frontend, QA con máximo 3 reaperturas y preparación del release), sin commit, push, PR ni merge. Solo a petición explícita del usuario.
argument-hint: "US-xx"
disable-model-invocation: true
---

# Entregar una historia

Lanza el workflow guardado `entrega-historia` (`.claude/workflows/entrega-historia.js`)
y presenta su resultado.

Argumento recibido: `$ARGUMENTS`

## 1. Valida el argumento

- Normaliza a `US-xx` con dos dígitos: `us-7`, `7` o `[US-07]` pasan a `US-07`.
- Si falta o no es una historia, pide el ID y no lances nada.
- Comprueba que la historia existe en `PRD.md` (por ejemplo, `grep -n "US-07" PRD.md`).

## 2. Comprobaciones previas (solo lectura)

- `git branch --show-current`: si es `main`, detente y pide trabajar en una rama;
  no cambies de rama por tu cuenta.
- `git status --short`: si hay cambios ajenos a la historia, avisa de que QA y
  release los verán mezclados y pregunta si continuar.
- Cabecera de `PRD.md`: si la aprobación humana figura como pendiente o no
  registra persona, fecha, alcance y commit o hash, no lances el workflow
  (terminaría en `bloqueada`). Explica el gate: una persona debe aprobar el PRD y
  quedar registrada en `PRD.md`; el subagente `producto` puede preparar el
  registro con su skill `requisitos`, pero nunca aprueba en nombre de nadie.

## 3. Lanza el workflow

Avisa en una línea de que el workflow edita el árbol de trabajo, encadena varios
agentes y puede tardar. Después llama a la herramienta Workflow con
`name: "entrega-historia"` y `args: {"historia": "US-07"}` (objeto JSON real).

| Fase | Rol | Qué hace |
|---|---|---|
| Requisitos | `producto` | Verifica la aprobación en `PRD.md`, extrae los 4 escenarios y decide si hacen falta integraciones o frontend. Sin aprobación o con bloqueos termina en `bloqueada` sin implementar. |
| Implementación | `integraciones`, luego `frontend` | Contratos y endpoint primero; después interfaz, i18n y estilos. En secuencia, para no pisar archivos. |
| QA | `qa-revisor` | 4 escenarios, `npm run build`, `validate_squad.py`, tests y preview. Cada rechazo cuenta una reapertura y vuelve al responsable con los fallos; al 3.er rechazo termina en `escalada_humano`. Sin fallos demostrados pero sin evidencia completa termina en `bloqueada` y no cuenta reapertura. |
| Release | `release` | Build y checks, archivos inesperados en el diff y propuesta de PR con checklist. |

El workflow nunca hace commit, push, PR, merge ni despliegue, ni escribe
`bug_report.md` ni toca Vikunja. El progreso se ve en `/workflows`.

## 4. Presenta el resultado según `estado`

- `bloqueada`: fase, motivo y bloqueos, con la acción humana concreta que lo
  desbloquea. Si hubo cambios, enumera `archivos` (quedan sin commit).
- `escalada_humano`: reaperturas, fallos y `reporte_markdown` del último QA,
  historial de rechazos y `siguientes_pasos_humanos`. No se reasigna
  automáticamente.
- `lista_para_revision_humana`: `resumen`, `archivos`, `archivos_inesperados`,
  evidencia de QA, checks de release, el PR propuesto (título y cuerpo completos)
  y `siguientes_pasos_humanos`.

## 5. Pregunta antes de actuar

Pregunta por cada acción y espera un sí explícito:

1. **Escribir `qa.reporte_markdown` en `bug_report.md`**, conservando el
   historial. El repo es público: sin detalles explotables de seguridad.
2. **Commit y push de la rama.** Antes verifica que `git config user.name` y
   `git config user.email` corresponden a `arcavcwb`; no cambies la configuración
   de git.
3. **Crear el PR hacia `main`** con el título y el cuerpo propuestos:
   `GH_TOKEN=$(gh auth token --user arcavcwb) gh pr create --base main --head <rama> --title "<título>" --body-file <archivo temporal fuera del repo>`.
   No cambies la cuenta activa de gh.
4. **Actualizar Vikunja** (proyecto 2, fuente de verdad) y el espejo
   `sprint_actual.md`: lo hace el subagente `producto` con su skill
   `planificacion`.

Gates humanos: nunca mergees a `main` (despliega a producción con Cloudflare
Workers Builds y requiere aprobación humana explícita), ni ejecutes
`wrangler deploy` o `wrangler secret`. Tras el merge humano, propone verificar
los 4 escenarios en producción con `qa-revisor`.
